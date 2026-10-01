import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getFicheCompletee, getPraticien, getRedirection } from '@/lib/annuaire/queries'
import { aDuContenu } from '@/lib/espace-pro/fiche-completee'
import { pscConfigure } from '@/lib/psc/config'
import { SectionFicheCompletee } from './fiche-completee'
import { RevendiquerDialog } from './revendiquer-dialog'
import { empriseAutour } from '@/lib/annuaire/emprise'
import { illustration } from '@/lib/annuaire/illustration'
import { BASE_URL, nomAffiche, type Lieu, type Profession } from '@/lib/annuaire/types'
import { Carte } from '@/components/map/carte'
import { Adresse, chemin, FilAriane, Section, Verification } from './primitives'
import { TelephoneProtege } from './telephone-protege'
import { Balisage, fichePraticien, filAriane } from '@/lib/seo/jsonld'

type Params = { departement: string; commune: string; slug: string }

const LIBELLE: Record<Profession, { singulier: string; pluriel: string }> = {
  dentiste: { singulier: 'Chirurgien-dentiste', pluriel: 'Chirurgiens-dentistes' },
  prothesiste: { singulier: 'Laboratoire de prothèse dentaire', pluriel: 'Laboratoires de prothèse dentaire' },
  maxillo_facial: { singulier: 'Chirurgien maxillo-facial', pluriel: 'Chirurgiens maxillo-faciaux' },
  stomatologue: { singulier: 'Stomatologue', pluriel: 'Stomatologues' },
  orl: { singulier: 'Oto-rhino-laryngologiste', pluriel: 'Oto-rhino-laryngologistes' },
}

/**
 * Le registre libelle le mode d'exercice en abrégé, « Lib,indép,artis,com ».
 * On l'écrit en toutes lettres sans en changer le sens.
 */
const MODE_EXERCICE: Record<string, string> = {
  'Lib,indép,artis,com': 'Exercice libéral',
  Salarié: 'Exercice salarié',
  Bénévole: 'Exercice bénévole',
}

/** Rayon de la vue cartographique d'une fiche : de quoi situer la rue, pas le quartier. */
const RAYON_CARTE = 350

export async function metadonneesFiche(profession: Profession, params: Params): Promise<Metadata> {
  const { departement, commune, slug } = await params
  const p = await getPraticien(profession, departement, commune, slug)
  if (!p) return { title: 'Fiche introuvable' }

  const principal = p.lieux.find((l) => l.principal) ?? p.lieux[0]
  const nom = nomAffiche(p)
  const lieu = principal?.communeNom ?? ''
  const qualite = p.specialite ?? LIBELLE[profession].singulier
  const titre = `${nom}, ${qualite.toLowerCase()} à ${lieu}`

  return {
    title: titre,
    description:
      `${nom}, ${qualite.toLowerCase()} à ${lieu}. ` +
      `Adresse, téléphone, numéro RPPS et informations vérifiées auprès des registres officiels.`,
    alternates: { canonical: `/${BASE_URL[profession]}/${departement}/${commune}/${slug}/` },
    // Une fiche non indexable reste consultable et trouvable par recherche
    // nominative, mais sort des moteurs : sans position, elle n'apporte rien.
    robots: p.indexable ? undefined : { index: false, follow: true },
  }
}

/**
 * Fiche d'un professionnel.
 *
 * Tout ce que le registre livre est affiché, sans exception : identité,
 * spécialité ordinale, mode d'exercice, catégorie professionnelle, chaque lieu
 * d'exercice avec son téléphone et son FINESS, les identifiants RPPS et SIRET,
 * la précision de la position et la date de la dernière synchronisation. Un
 * annuaire dont la promesse est la traçabilité n'a aucune raison de retenir une
 * information publique, et chaque valeur est donnée avec sa source.
 *
 * Ce qui n'est pas affiché ne l'est pas parce qu'il n'existe pas : le SIREN est
 * vide sur les 64 442 dentistes de l'extraction, et la colonne ADELI ne
 * concerne pas cette profession. Un libellé présent mais vide vaudrait
 * affirmation, donc chaque champ disparaît quand il n'a pas de valeur.
 */
export async function PageFiche({ profession, params }: { profession: Profession; params: Promise<Params> }) {
  const { departement, commune, slug } = await params
  const p = await getPraticien(profession, departement, commune, slug)
  if (!p) {
    // Avant de conclure à une page introuvable, on regarde si l'URL vient de
    // l'ancien site. `permanentRedirect` émet un 308, que Google traite comme
    // un 301.
    const cible = await getRedirection(`/${BASE_URL[profession]}/${departement}/${commune}/${slug}/`)
    if (cible) permanentRedirect(chemin(cible))
    notFound()
  }

  const completee = await getFicheCompletee(slug)
  const base = BASE_URL[profession]
  const principal = p.lieux.find((l) => l.principal) ?? p.lieux[0]
  const autres = p.lieux.filter((l) => l !== principal)
  const nom = nomAffiche(p)
  const radie = p.supprimeLe !== null
  const etudiant = p.categorieProfessionnelle === 'Etudiant'
  const cheminFiche = `/${base}/${departement}/${commune}/${slug}/`
  const situe = principal?.lon != null && principal.lat != null && !principal.approximative

  return (
    <>
      <Balisage donnees={fichePraticien(p, cheminFiche, nom)} />
      <Balisage
        donnees={filAriane([
          { nom: 'Accueil', chemin: '/' },
          { nom: LIBELLE[profession].pluriel, chemin: `/${base}/` },
          { nom: principal?.communeNom ?? commune, chemin: `/${base}/${departement}/${commune}/` },
          { nom, chemin: cheminFiche },
        ])}
      />

      <div className="border-b border-line bg-bg-soft">
        <div className="mx-auto max-w-[1128px] px-5 py-6 md:px-10">
          <FilAriane
            segments={[
              { libelle: 'Accueil', href: '/' },
              { libelle: LIBELLE[profession].pluriel, href: `/${base}/` },
              { libelle: principal?.communeNom ?? commune, href: `/${base}/${departement}/${commune}/` },
              { libelle: nom },
            ]}
          />

          <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
            <Image
              src={illustration(profession, p.civilite)}
              alt=""
              width={160}
              height={200}
              // Le même visuel que dans les listes : un praticien ne doit pas
              // changer de visage d'une page à l'autre.
              className="squircle-xl h-40 w-32 shrink-0 border border-line object-cover object-[center_26%] dark:brightness-[0.42]"
            />

            <div className="min-w-0">
              <p className="text-sm font-medium text-fg-2">
                {p.specialite ?? LIBELLE[profession].singulier}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-fg">{nom}</h1>
              {p.raisonSociale && profession === 'dentiste' && (
                <p className="mt-1 text-fg-2">{p.raisonSociale}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Verification statut={p.statutVerification} />
                {p.specialite && <Etiquette>{p.specialite}</Etiquette>}
                {p.modeExercice && <Etiquette>{MODE_EXERCICE[p.modeExercice] ?? p.modeExercice}</Etiquette>}
                {etudiant && <Etiquette accent>Inscrit comme étudiant au registre</Etiquette>}
              </div>
            </div>
          </header>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1128px] gap-x-12 px-5 py-2 md:px-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <div className="min-w-0">
          {radie && (
            <p className="mt-6 squircle-lg border border-partiel-line bg-partiel-bg p-4 text-sm text-partiel">
              Ce professionnel ne figure plus au registre officiel. La fiche est conservée à titre d’archive.
            </p>
          )}

          {principal && (
            <Section titre="Coordonnées">
              <DetailLieu lieu={principal} />
            </Section>
          )}

          {autres.length > 0 && (
            <Section titre={autres.length > 1 ? 'Autres lieux d’exercice' : 'Autre lieu d’exercice'}>
              <ul className="space-y-6">
                {autres.map((l) => (
                  <li key={l.id}>
                    <DetailLieu lieu={l} />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section titre="Exercice">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <Champ libelle="Profession">{LIBELLE[profession].singulier}</Champ>
              {p.specialite && <Champ libelle="Spécialité ordinale">{p.specialite}</Champ>}
              {p.modeExercice && (
                <Champ libelle="Mode d’exercice">{MODE_EXERCICE[p.modeExercice] ?? p.modeExercice}</Champ>
              )}
              {p.categorieProfessionnelle && (
                <Champ libelle="Catégorie">{p.categorieProfessionnelle === 'Etudiant' ? 'Étudiant' : p.categorieProfessionnelle}</Champ>
              )}
              <Champ libelle="Lieux d’exercice">{p.lieux.length}</Champ>
            </dl>
            {!p.specialite && profession === 'dentiste' && (
              <p className="mt-4 text-sm text-fg-2">
                Le registre ne déclare aucune spécialité ordinale pour ce praticien, ce qui est le cas de la grande
                majorité des chirurgiens-dentistes. Cela ne dit rien de ses domaines de pratique.
              </p>
            )}
          </Section>

          {aDuContenu(completee) && <SectionFicheCompletee fiche={completee} />}

          <Section titre="Identifiants officiels">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {p.rpps && <Champ libelle="Numéro RPPS" mono>{p.rpps}</Champ>}
              {p.siret && <Champ libelle="SIRET" mono>{p.siret}</Champ>}
              {p.siren && <Champ libelle="SIREN" mono>{p.siren}</Champ>}
            </dl>
            <p className="mt-4 text-sm text-fg-2">
              Le numéro FINESS, quand il existe, figure sous l’adresse du lieu concerné : il identifie
              l’établissement, pas le praticien.
            </p>
          </Section>

          <Section titre="Source des informations">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <Champ libelle="Registre">
                {profession === 'dentiste'
                  ? 'Annuaire Santé, Agence du Numérique en Santé'
                  : 'Base Sirene, INSEE'}
              </Champ>
              <Champ libelle="Adresses géocodées par">Base Adresse Nationale</Champ>
              <Champ libelle="Dernière mise à jour">
                {new Date(p.majLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Champ>
            </dl>
            <p className="mt-4 text-sm text-fg-2">
              Ces informations proviennent de registres publics et ne sont pas modifiables par le professionnel.
            </p>
          </Section>

          {/*
            Point d'entrée de la revendication, posé sur la fiche elle-même :
            c'est là qu'un praticien se reconnaît, pas dans un menu.
          */}
          {!radie && (
            <Section titre="Vous êtes ce professionnel ?">
              <p className="text-fg-2">
                Votre fiche est construite depuis les registres publics. Revendiquez-la pour ajouter vos horaires, vos
                langues parlées et l’accessibilité de votre cabinet, et pour être joint par les patients qui vous
                cherchent.
              </p>
              {/*
                Les chirurgiens-dentistes sont au RPPS, donc dans Pro Santé
                Connect : la fenêtre leur propose la vérification par carte.
                Les laboratoires n'y sont pas et gardent la demande manuelle.
              */}
              {profession === 'dentiste' ? (
                <RevendiquerDialog slug={p.slug} pscDisponible={pscConfigure()} />
              ) : (
                <Link
                  href={chemin(`/espace-pro/revendiquer/?fiche=${encodeURIComponent(p.slug)}`)}
                  className="squircle-full mt-4 inline-block bg-action px-5 py-2.5 font-medium text-action-foreground hover:bg-action-hover"
                >
                  Revendiquer cette fiche
                </Link>
              )}
            </Section>
          )}

          <Section titre="Voir aussi">
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={chemin(`/${base}/${departement}/${commune}/`)} className="text-fg underline hover:no-underline">
                  Tous les {LIBELLE[profession].pluriel.toLowerCase()} à {principal?.communeNom ?? commune}
                </Link>
              </li>
              <li>
                <Link href={chemin('/methode-de-verification/')} className="text-fg underline hover:no-underline">
                  Comment cette fiche est vérifiée
                </Link>
              </li>
            </ul>
          </Section>
        </div>

        {/*
          La carte est collée sous l'en-tête et s'arrête au bas de la colonne de
          gauche. Elle n'est rendue que si la position désigne vraiment une
          adresse : un centroïde de commune placerait le praticien au milieu de
          la ville, ce qui tromperait plus qu'il n'aiderait.
        */}
        <aside className="mt-6 lg:sticky lg:top-24">
          {situe && principal ? (
            <>
              <div className="squircle-xl overflow-hidden border border-line">
                <Carte
                  profession={base}
                  emprise={empriseAutour(principal.lon!, principal.lat!, RAYON_CARTE)}
                  className="h-72 w-full lg:h-96"
                />
              </div>
              <p className="mt-2 text-xs text-fg-2">
                {principal.precisionPosition === 'numero'
                  ? 'Position au numéro, d’après la Base Adresse Nationale.'
                  : 'Position approchée, voir la mention sous l’adresse.'}
              </p>
            </>
          ) : (
            /*
              Pas de carte plutôt qu'une fausse carte. La seule position connue
              est le centre de la commune, et un point posé là désignerait une
              adresse qui n'est pas la bonne, parfois à trois kilomètres.
            */
            <div className="squircle-xl border border-line bg-bg-soft p-5">
              <h2 className="text-sm font-semibold text-fg">Pas de carte pour cette fiche</h2>
              <p className="mt-2 text-sm text-fg-2">
                L’adresse du registre n’a pas pu être située à la rue près. La seule position connue est le centre de
                la commune, et l’afficher sur une carte laisserait croire à une adresse exacte.
              </p>
              <p className="mt-3 text-sm">
                <Link href={chemin('/methode-de-verification/')} className="text-fg underline hover:no-underline">
                  Comment les adresses sont situées
                </Link>
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}

/** Un lieu d'exercice, avec tout ce que le registre en dit. */
function DetailLieu({ lieu }: { lieu: Lieu }) {
  return (
    <>
      <Adresse
        ligne={lieu.adresseLigne}
        codePostal={lieu.codePostal}
        commune={lieu.communeNom}
        approximative={lieu.approximative}
        precision={lieu.precisionPosition}
      />
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <Champ libelle="Téléphone">
          <TelephoneProtege lieuId={lieu.id} possede={lieu.aTelephone} />
          {lieu.aTelephone && <span className="ml-2 text-xs text-fg-2">numéro figurant au registre</span>}
        </Champ>
        {lieu.finess && (
          <Champ libelle="FINESS du site" mono>
            {lieu.finess}
          </Champ>
        )}
        {lieu.lon != null && lieu.lat != null && (
          <Champ libelle="Coordonnées" mono>
            {lieu.lat.toFixed(5)}, {lieu.lon.toFixed(5)}
          </Champ>
        )}
      </dl>
    </>
  )
}

function Champ({ libelle, mono, children }: { libelle: string; mono?: boolean; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-fg-2">{libelle}</dt>
      <dd className={mono ? 'font-mono text-fg' : 'text-fg'}>{children}</dd>
    </>
  )
}

function Etiquette({ accent, children }: { accent?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`squircle-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        accent ? 'bg-partiel-bg text-partiel ring-partiel-line' : 'bg-bg text-fg ring-line'
      }`}
    >
      {children}
    </span>
  )
}
