import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { connection } from 'next/server'
import type { Metadata } from 'next'
import {
  Accessibility,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  Building2,
  Clock,
  CreditCard,
  ExternalLink,
  Languages,
  MapPin,
  Navigation,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { getFicheCompletee, getPraticien, getPraticiensProches, getRedirection } from '@/lib/annuaire/queries'
import {
  ACCESSIBILITE,
  JOURS,
  LANGUES,
  LIBELLE_JOUR,
  ORIENTATIONS,
  PAIEMENTS,
  SECTEURS,
  TIERS_PAYANT,
  aDuContenu,
  libelle,
  libelleAge,
  type FicheCompletee,
} from '@/lib/espace-pro/fiche-completee'
import { MATERIAUX, PIECES, TECHNIQUES, libelleDe } from '@/lib/espace-pro/labo'
import { clePosition, empriseAutour } from '@/lib/annuaire/emprise'
import { illustration } from '@/lib/annuaire/illustration'
import { LIBELLE as LIBELLE_PROFESSION } from '@/lib/annuaire/libelles'
import { BASE_URL, estPersonne, nomAffiche, type Lieu, type Profession } from '@/lib/annuaire/types'
import { formaterAdresse } from '@/lib/annuaire/nom'
import { Carte } from '@/components/map/carte'
import { Voisins } from './voisins'
import { basculerFavori } from '@/lib/tunnel/actions'
import { estFavori, getCompte } from '@/lib/tunnel/compte'
import { Adresse, BadgeGeree, chemin, FilAriane, Verification } from './primitives'
import { TelephoneProtege } from './telephone-protege'
import { BadgeRecruteFiche, SectionRecrute } from './recrutement'
import { getOffresEnLigne } from '@/lib/annuaire/recrutement'
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
/** Rayon de recherche des confrères proposés en bas de fiche, en mètres. */
const RAYON_VOISINS = 3_000

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
 * Deux natures d'information, toujours distinguées : ce que le registre
 * affirme, identité, adresses, identifiants, qui se vérifie ; et ce que le
 * cabinet déclare, horaires, langues, accès, paiement, qui se croit. La page
 * se lit de haut en bas comme une visite : qui, où, quand, comment payer,
 * puis qui d'autre à côté. Rien de public n'est retenu, et chaque valeur est
 * donnée avec sa source.
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

  const base = BASE_URL[profession]
  const principal = p.lieux.find((l) => l.principal) ?? p.lieux[0]
  const autres = p.lieux.filter((l) => l !== principal)
  const nom = nomAffiche(p)
  const radie = p.supprimeLe !== null
  const etudiant = p.categorieProfessionnelle === 'Etudiant'
  const cheminFiche = `/${base}/${departement}/${commune}/${slug}/`
  const situe = principal?.lon != null && principal.lat != null && !principal.approximative
  const personne = estPersonne(profession)

  const [completee, compte, voisins, offres] = await Promise.all([
    getFicheCompletee(slug),
    getCompte(),
    situe ? getPraticiensProches(profession, principal.lon!, principal.lat!, RAYON_VOISINS, 4) : Promise.resolve([]),
    // Offres d'emploi en ligne : pastille « Recrute » et section en fin de fiche.
    getOffresEnLigne(p.id, slug),
  ])
  const geree = completee !== null
  const favori = compte ? await estFavori(compte.id, slug) : false
  const proches = voisins.filter((v) => v.slug !== slug).slice(0, 3)
  const majLe = new Date(p.majLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const segments = [
    { nom: 'Accueil', chemin: '/' },
    { nom: LIBELLE[profession].pluriel, chemin: `/${base}/` },
    { nom: principal?.communeNom ?? commune, chemin: `/${base}/${departement}/${commune}/` },
    { nom, chemin: cheminFiche },
  ]

  return (
    <>
      <Balisage donnees={fichePraticien(p, cheminFiche, nom)} />
      <Balisage donnees={filAriane(segments)} />

      <div className="container pb-20 pt-8">
        <FilAriane segments={segments.map((s, i) => (i < segments.length - 1 ? { libelle: s.nom, href: s.chemin } : { libelle: s.nom }))} />

        {/* En-tête : le praticien à gauche, son quartier à droite. */}
        <header className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center">
          <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-start">
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
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-2">
                <span className="inline-flex rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-medium text-teal ring-1 ring-inset ring-teal/30">
                  {LIBELLE[profession].singulier}
                </span>
                {p.specialite && <span>{p.specialite}</span>}
              </p>
              <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-fg md:text-5xl">{nom}</h1>
              {p.raisonSociale && personne && <p className="mt-2 text-fg-2">{p.raisonSociale}</p>}
              {principal && (
                <p className="mt-3 flex items-start gap-2 text-fg-2">
                  <MapPin className="mt-1 size-4 shrink-0 text-teal" aria-hidden />
                  <span>
                    {principal.adresseLigne && <>{formaterAdresse(principal.adresseLigne)}, </>}
                    {principal.codePostal} {principal.communeNom}
                  </span>
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Verification statut={p.statutVerification} />
                {geree && <BadgeGeree profession={profession} className="ring-1 ring-inset ring-line" />}
                {offres.length > 0 && <BadgeRecruteFiche />}
                {p.modeExercice && <Etiquette>{MODE_EXERCICE[p.modeExercice] ?? p.modeExercice}</Etiquette>}
                {etudiant && <Etiquette accent>Inscrit comme étudiant au registre</Etiquette>}
                {radie && <Etiquette accent>Ne figure plus au registre</Etiquette>}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {principal && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([principal.adresseLigne, principal.codePostal, principal.communeNom].filter(Boolean).join(' '))}`}
                    rel="noopener"
                    className="hover-lift inline-flex h-11 items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover"
                  >
                    <Navigation className="size-4" aria-hidden />
                    Itinéraire
                  </a>
                )}
                {/*
                  Mettre de côté : un favori par compte. Sans session, le
                  formulaire conduit à la connexion et revient ici.
                */}
                <form action={basculerFavori}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="retour" value={cheminFiche} />
                  <button
                    type="submit"
                    aria-pressed={favori}
                    className={`inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium ${favori ? 'border-teal bg-teal/10 text-teal' : 'border-line bg-bg text-fg hover:bg-bg-soft'}`}
                  >
                    {favori ? <BookmarkCheck className="size-4" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
                    {favori ? 'Dans vos favoris' : 'Mettre de côté'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/*
            La carte n'est rendue que si la position désigne vraiment une
            adresse : un centroïde de commune placerait le praticien au milieu
            de la ville, ce qui tromperait plus qu'il n'aiderait.
          */}
          <figure className="min-w-0">
            {situe && principal ? (
              <>
                <div className="squircle-2xl relative aspect-[4/3] overflow-hidden border border-line bg-bg-soft">
                  {/* Le halo de survol marque ce cabinet parmi les points du quartier. */}
                  <Carte
                    profession={base}
                    emprise={empriseAutour(principal.lon!, principal.lat!, RAYON_CARTE)}
                    className="size-full"
                    survol={clePosition(principal.lon!, principal.lat!)}
                  />
                </div>
                <figcaption className="mt-2 text-xs text-fg-2">
                  {principal.precisionPosition === 'numero'
                    ? 'Position au numéro, d’après la Base Adresse Nationale.'
                    : 'Position approchée, voir la mention sous l’adresse.'}
                </figcaption>
              </>
            ) : (
              <div className="squircle-2xl flex aspect-[4/3] flex-col justify-center border border-line bg-bg-soft p-6">
                <h2 className="text-sm font-semibold text-fg">Pas de carte pour cette fiche</h2>
                <p className="mt-2 text-sm text-fg-2">
                  L’adresse du registre n’a pas pu être située à la rue près. La seule position connue est le centre de la
                  commune, et l’afficher sur une carte laisserait croire à une adresse exacte.
                </p>
              </div>
            )}
          </figure>
        </header>

        {/* Chiffres clés : quatre tuiles, pas plus. */}
        <dl className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Tuile
            icone={Stethoscope}
            libelle={personne ? 'Spécialité ordinale' : 'Activité'}
            valeur={p.specialite ?? (personne ? 'Aucune déclarée' : 'Prothèse dentaire')}
            note={p.specialite ? 'inscrite au registre' : personne ? 'cas de la plupart des praticiens' : undefined}
            petite
          />
          <Tuile icone={Building2} libelle={p.lieux.length > 1 ? 'Lieux d’exercice' : 'Lieu d’exercice'} valeur={String(p.lieux.length)} note={principal?.communeNom ?? undefined} />
          <Tuile
            icone={Clock}
            libelle="Horaires"
            valeur={completee && aHoraires(completee) ? 'Renseignés' : '—'}
            note={completee && aHoraires(completee) ? 'par le cabinet' : 'non communiqués'}
            petite
          />
          <Tuile icone={ShieldCheck} libelle="Dernière vérification" valeur={majLe} note={LIBELLE_PROFESSION[profession].registre.replace(/^d[ue] /, '')} petite />
        </dl>

        <div className="mt-14 grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="min-w-0 space-y-16">
            {radie && (
              <p className="squircle-xl border border-partiel-line bg-partiel-bg p-4 text-sm text-partiel">
                Ce professionnel ne figure plus au registre officiel. La fiche est conservée à titre d’archive.
              </p>
            )}

            <Module id="cabinet" titre={autres.length > 0 ? 'Les lieux d’exercice' : personne ? 'Le cabinet' : 'Le laboratoire'}>
              <ol className="space-y-4">
                {p.lieux.map((l, i) => (
                  <li key={l.id} className="squircle-xl border border-line p-5">
                    {p.lieux.length > 1 && (
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-2">
                        {l.principal ? 'Lieu principal' : `Lieu ${i + 1}`}
                      </p>
                    )}
                    <DetailLieu lieu={l} />
                  </li>
                ))}
              </ol>
            </Module>

            {aDuContenu(completee) ? (
              <ModuleCabinet fiche={completee} labo={!personne} />
            ) : (
              <Module id="pratique" titre="Horaires, langues, accès et paiement">
                <div className="squircle-xl border border-dashed border-line p-5 text-sm text-fg-2">
                  Ces informations ne viennent d’aucun registre : seul le cabinet peut les donner. Il ne l’a pas encore fait.
                  {!radie && personne && ' Si vous êtes ce praticien, revendiquez la fiche pour les renseigner.'}
                </div>
              </Module>
            )}

            <Module id="registre" titre="Ce que dit le registre">
              <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                <Champ libelle="Profession">{LIBELLE[profession].singulier}</Champ>
                {p.specialite && <Champ libelle="Spécialité ordinale">{p.specialite}</Champ>}
                {p.modeExercice && <Champ libelle="Mode d’exercice">{MODE_EXERCICE[p.modeExercice] ?? p.modeExercice}</Champ>}
                {p.categorieProfessionnelle && (
                  <Champ libelle="Catégorie">{p.categorieProfessionnelle === 'Etudiant' ? 'Étudiant' : p.categorieProfessionnelle}</Champ>
                )}
                {p.rpps && <Champ libelle="Numéro RPPS" mono>{p.rpps}</Champ>}
                {p.siret && <Champ libelle="SIRET" mono>{p.siret}</Champ>}
                {p.siren && <Champ libelle="SIREN" mono>{p.siren}</Champ>}
                <Champ libelle="Registre">
                  {personne ? 'Annuaire Santé, Agence du Numérique en Santé' : 'Base Sirene, INSEE'}
                </Champ>
                <Champ libelle="Adresses situées par">Base Adresse Nationale</Champ>
                <Champ libelle="Dernière mise à jour">{majLe}</Champ>
              </dl>
              <p className="mt-4 text-sm text-fg-2">
                {!p.specialite && personne
                  ? 'Le registre ne déclare aucune spécialité ordinale, ce qui est le cas de la grande majorité des praticiens : cela ne dit rien des domaines de pratique. '
                  : ''}
                Ces informations proviennent de registres publics et ne sont pas modifiables par le professionnel. Le FINESS, quand
                il existe, figure sous l’adresse du lieu concerné : il identifie l’établissement, pas le praticien.
              </p>
            </Module>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            {!radie && (
              <div className="squircle-2xl border border-line bg-bg-soft p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
                  <BadgeCheck className="size-4 text-teal" aria-hidden />
                  Vous êtes ce professionnel ?
                </h2>
                <p className="mt-2 text-sm text-fg-2">
                  Revendiquez votre fiche pour ajouter vos horaires, vos langues et l’accessibilité de votre cabinet, et pour
                  être joint par les patients qui vous cherchent.
                </p>
                {/*
                  Un seul point d'entrée : la revendication s'ouvre sur cette
                  fiche, la recherche déjà faite. Pro Santé Connect y est
                  proposé aux professions du RPPS.
                */}
                <div className="mt-4">
                  <Link
                    href={chemin(`/espace-pro/revendiquer/?fiche=${encodeURIComponent(p.slug)}`)}
                    className="squircle-full inline-block bg-action px-5 py-2.5 text-sm font-medium text-action-foreground hover:bg-action-hover"
                  >
                    Revendiquer cette fiche
                  </Link>
                </div>
              </div>
            )}

            <nav aria-label="Voir aussi" className="squircle-2xl border border-line p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-2">Voir aussi</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href={chemin(`/${base}/${departement}/${commune}/`)} className="text-fg hover:underline">
                    Tous les {LIBELLE_PROFESSION[profession].pluriel} à {principal?.communeNom ?? commune}
                  </Link>
                </li>
                <li>
                  <Link href={chemin(`/${base}/${departement}/`)} className="text-fg hover:underline">
                    Dans le département
                  </Link>
                </li>
                <li>
                  <Link href={chemin('/a-propos/#methode')} className="text-fg hover:underline">
                    Comment cette fiche est vérifiée
                  </Link>
                </li>
              </ul>
            </nav>

            <p className="px-1 text-xs leading-relaxed text-fg-2">
              Une erreur sur cette fiche ?{' '}
              <Link href={chemin(`/contact/?objet=erreur-fiche&fiche=${encodeURIComponent(slug)}`)} className="underline underline-offset-2 hover:text-fg">
                Signalez-la
              </Link>
              , nous la vérifions auprès du registre.
            </p>
          </aside>
        </div>

        {proches.length > 0 && principal && (
          <section className="mt-20 border-t border-line pt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-fg">
                {LIBELLE[profession].pluriel} à proximité
              </h2>
              <Link href={chemin(`/${base}/${departement}/${commune}/`)} className="text-sm font-medium text-fg hover:underline">
                Tous à {principal.communeNom ?? commune}
              </Link>
            </div>
            <p className="mt-2 text-sm text-fg-2">Les plus proches de ce cabinet, par distance puis par ordre alphabétique.</p>
            <Voisins praticiens={proches} base={base} profession={profession} />
          </section>
        )}

        {/* Après tout ce qui sert le patient : les offres de la structure, s'il y en a. */}
        <SectionRecrute offres={offres} recruteur={nom} labo={!personne} />
      </div>
    </>
  )
}

function aHoraires(f: FicheCompletee): boolean {
  return f.horaires ? JOURS.some((j) => (f.horaires?.[j]?.length ?? 0) > 0) : false
}

/**
 * Ce que le cabinet a lui-même déclaré : horaires en grille de semaine,
 * langues, accès et paiement en étiquettes. Rendu à part des données de
 * registre, avec la date de déclaration : l'un se vérifie, l'autre se croit.
 */
async function ModuleCabinet({ fiche, labo = false }: { fiche: FicheCompletee; labo?: boolean }) {
  const horaires = fiche.horaires ?? {}
  const maj = new Date(fiche.majLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  // Le jour courant change entre deux rendus : il se lit à la requête, jamais au prérendu.
  await connection()
  const aujourdhui = JOURS[(new Date().getDay() + 6) % 7]
  const horairesExpires = new Date().getTime() - new Date(fiche.horairesConfirmesLe ?? fiche.majLe).getTime() > 180 * 86_400_000
  return (
    <Module
      id="pratique"
      titre={labo ? 'Le laboratoire, en ses mots' : 'Le cabinet, en ses mots'}
      intro={`Déclaré par le ${labo ? 'laboratoire' : 'cabinet'}, dont l’identité a été vérifiée avant qu’il puisse écrire ici. Mis à jour le ${maj}.`}
    >
      {labo && <ModuleLabo fiche={fiche} />}
      {fiche.photoUrl && (
        <div className="squircle-2xl relative mb-6 aspect-video overflow-hidden border border-line bg-bg-soft">
          <Image src={fiche.photoUrl} alt="Le cabinet" fill sizes="(min-width: 1024px) 48rem, 100vw" className="object-cover" />
        </div>
      )}
      {fiche.presentation && <p className="mb-6 max-w-3xl whitespace-pre-line text-[15px] leading-relaxed text-fg">{fiche.presentation}</p>}
      {(fiche.siteWeb || fiche.rdvEnLigne) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {fiche.rdvEnLigne && (
            <a href={fiche.rdvEnLigne} target="_blank" rel="noopener nofollow" className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
              Prendre rendez-vous <ExternalLink className="size-3.5" aria-hidden />
            </a>
          )}
          {fiche.siteWeb && (
            <a href={fiche.siteWeb} target="_blank" rel="noopener nofollow" className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong">
              Site du cabinet <ExternalLink className="size-3.5" aria-hidden />
            </a>
          )}
        </div>
      )}
      {horairesExpires && <p className="mb-3 text-sm text-fg-2">Horaires non confirmés par le cabinet depuis plus de six mois : appelez avant de vous déplacer.</p>}
      {aHoraires(fiche) && (
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {JOURS.map((j) => {
            const plages = horaires[j] ?? []
            const ouvert = plages.length > 0
            return (
              <li
                key={j}
                aria-current={j === aujourdhui ? 'date' : undefined}
                className={`squircle-lg border p-3 text-sm ${ouvert ? 'border-line bg-bg' : 'border-dashed border-line bg-bg-soft text-fg-2'} ${j === aujourdhui ? 'ring-2 ring-teal/40' : ''}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-fg-2">{LIBELLE_JOUR[j]}</p>
                {ouvert ? (
                  <ul className="mt-1.5 space-y-0.5 tabular-nums text-fg">
                    {plages.map((pl) => (
                      <li key={pl.debut}>
                        {pl.debut.replace(':', 'h')} à {pl.fin.replace(':', 'h')}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1.5">Fermé</p>
                )}
              </li>
            )
          })}
        </ol>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {fiche.langues.length > 0 && (
          <Bloc icone={Languages} titre="Langues parlées">
            {fiche.langues.map((c) => (
              <Etiquette key={c}>{libelle(LANGUES, c)}</Etiquette>
            ))}
          </Bloc>
        )}
        {(fiche.accessibilite.length > 0 || fiche.accessibiliteCommentaire) && (
          <Bloc icone={Accessibility} titre="Accès">
            {fiche.accessibilite.map((c) => (
              <Etiquette key={c}>{libelle(ACCESSIBILITE, c)}</Etiquette>
            ))}
            {fiche.accessibiliteCommentaire && <p className="basis-full text-sm text-fg-2">{fiche.accessibiliteCommentaire}</p>}
          </Bloc>
        )}
        {(fiche.secteur || fiche.ageMinimum !== null || fiche.accesPmr) && (
          <Bloc icone={BadgeCheck} titre="Conventionnement et accueil">
            {fiche.secteur && <Etiquette>{libelle(SECTEURS, fiche.secteur)}</Etiquette>}
            {fiche.ageMinimum !== null && <Etiquette>{libelleAge(fiche.ageMinimum)}</Etiquette>}
            {fiche.accesPmr && fiche.accesPmr !== 'oui' && <Etiquette>{fiche.accesPmr === 'partiel' ? 'Accès PMR partiel' : 'Pas d’accès PMR'}</Etiquette>}
          </Bloc>
        )}
        {(fiche.paiements.length > 0 || fiche.tiersPayant) && (
          <Bloc icone={CreditCard} titre="Paiement">
            {fiche.paiements.map((c) => (
              <Etiquette key={c}>{libelle(PAIEMENTS, c)}</Etiquette>
            ))}
            {fiche.tiersPayant && <p className="basis-full text-sm text-fg-2">{libelle(TIERS_PAYANT, fiche.tiersPayant)}</p>}
          </Bloc>
        )}
        {fiche.orientations.length > 0 && (
          <Bloc icone={Stethoscope} titre="Orientations déclarées">
            {fiche.orientations.map((c) => (
              <Etiquette key={c}>{libelle(ORIENTATIONS, c)}</Etiquette>
            ))}
            <p className="basis-full text-sm text-fg-2">Déclarées par le praticien ; ce ne sont pas des spécialités reconnues par l’Ordre.</p>
          </Bloc>
        )}
      </div>
    </Module>
  )
}

/** Ce qu'un laboratoire déclare pour les cabinets : savoir-faire, délais, zone, réalisations, ANSM. */
function ModuleLabo({ fiche }: { fiche: FicheCompletee }) {
  const delais = Object.entries(fiche.delais ?? {})
  const delaisAffiches = delais.length > 0 && new Date().getTime() - new Date(fiche.delaisConfirmesLe ?? fiche.majLe).getTime() < 365 * 86_400_000
  const max = Math.max(10, ...delais.map(([, j]) => j))
  return (
    <div className="mb-6 space-y-6">
      {fiche.realisations.length > 0 && (
        <figure>
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {fiche.realisations.map((r, i) => (
              <li key={r.url} className={`squircle-xl relative overflow-hidden border border-line bg-bg-soft ${i === 0 ? 'col-span-2 row-span-2 aspect-[4/3]' : 'aspect-[4/3]'}`}>
                <Image src={r.url} alt={r.legende || 'Réalisation du laboratoire'} fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />
                {r.legende && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 text-xs text-white">{r.legende}</span>}
              </li>
            ))}
          </ol>
          {fiche.creditPhotos && <figcaption className="mt-2 text-xs text-fg-2">Crédit photo : {fiche.creditPhotos}</figcaption>}
        </figure>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {(fiche.techniques.length > 0 || fiche.materiaux.length > 0) && (
          <Bloc icone={Stethoscope} titre="Savoir-faire et matériaux">
            {fiche.techniques.map((c) => (
              <Etiquette key={c}>{libelleDe(TECHNIQUES, c)}</Etiquette>
            ))}
            {fiche.materiaux.map((c) => (
              <Etiquette key={c}>{libelleDe(MATERIAUX, c)}</Etiquette>
            ))}
            {fiche.usinage && <Etiquette>Usinage sur place</Etiquette>}
            {fiche.empreintesStl && <Etiquette>Empreintes STL acceptées</Etiquette>}
            {fiche.impression3d && <Etiquette>Impression 3D</Etiquette>}
          </Bloc>
        )}
        {(fiche.rayonKm || fiche.ansmNumero) && (
          <Bloc icone={Navigation} titre="Zone et conformité">
            {fiche.rayonKm && <Etiquette>Dessert {fiche.rayonKm} km</Etiquette>}
            {fiche.ramassage && <Etiquette>Ramassage des empreintes</Etiquette>}
            {fiche.transporteur && <Etiquette>Envoi par transporteur au-delà</Etiquette>}
            {fiche.ansmNumero && <Etiquette>Fabricant déclaré à l’ANSM</Etiquette>}
          </Bloc>
        )}
      </div>
      {delaisAffiches && (
        <div className="squircle-xl border border-line p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
            <Clock className="size-4 text-teal" aria-hidden /> Délais moyens
          </h3>
          <ul className="mt-3 space-y-2.5">
            {delais.map(([code, j]) => (
              <li key={code}>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-fg">{libelleDe(PIECES, code)}</span>
                  <span className="tabular-nums text-fg">{j} j ouvrés</span>
                </div>
                <span className="mt-1 block h-1.5 rounded-full bg-line">
                  <span className="block h-full rounded-full bg-teal" style={{ width: `${(j / max) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-fg-2">Délais moyens déclarés par le laboratoire, de la réception de l’empreinte à l’expédition. Ce n’est pas un engagement.</p>
        </div>
      )}
    </div>
  )
}

function Bloc({ icone: Icone, titre, children }: { icone: typeof Clock; titre: string; children: React.ReactNode }) {
  return (
    <div className="squircle-xl border border-line p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
        <Icone className="size-4 text-teal" aria-hidden />
        {titre}
      </h3>
      <div className="mt-3 flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

/** Un lieu d'exercice, avec tout ce que le registre en dit. */
function DetailLieu({ lieu }: { lieu: Lieu }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
      <Adresse
        ligne={lieu.adresseLigne}
        codePostal={lieu.codePostal}
        commune={lieu.communeNom}
        approximative={lieu.approximative}
        precision={lieu.precisionPosition}
      />
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm sm:min-w-[16rem]">
        <Champ libelle="Téléphone">
          <TelephoneProtege lieuId={lieu.id} possede={lieu.aTelephone} />
        </Champ>
        {lieu.finess && (
          <Champ libelle="FINESS" mono>
            {lieu.finess}
          </Champ>
        )}
        {lieu.lon != null && lieu.lat != null && (
          <Champ libelle="GPS" mono>
            {lieu.lat.toFixed(5)}, {lieu.lon.toFixed(5)}
          </Champ>
        )}
      </dl>
    </div>
  )
}

function Tuile({
  icone: Icone,
  libelle,
  valeur,
  note,
  petite,
}: {
  icone: typeof Clock
  libelle: string
  valeur: string
  note?: string
  petite?: boolean
}) {
  return (
    <div className="squircle-xl border border-line bg-bg-soft p-4 md:p-5">
      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-fg-2">
        <Icone className="size-4 shrink-0 text-teal" aria-hidden />
        {libelle}
      </dt>
      <dd className="mt-3">
        <span className={`block font-semibold tracking-tight text-fg ${petite ? 'text-base leading-snug' : 'text-3xl tabular-nums'}`}>{valeur}</span>
        {note && <span className="mt-1 block text-xs text-fg-2">{note}</span>}
      </dd>
    </div>
  )
}

function Module({ id, titre, intro, children }: { id: string; titre: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className="scroll-mt-24">
      <h2 id={`${id}-titre`} className="text-2xl font-semibold tracking-tight text-fg">
        {titre}
      </h2>
      {intro && <p className="mt-2 max-w-2xl text-fg-2">{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
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
