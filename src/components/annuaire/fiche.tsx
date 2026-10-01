import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import {
  Accessibility,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  Building2,
  Clock,
  CreditCard,
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
  PAIEMENTS,
  TIERS_PAYANT,
  aDuContenu,
  libelle,
  type FicheCompletee,
} from '@/lib/espace-pro/fiche-completee'
import { pscConfigure } from '@/lib/psc/config'
import { RevendiquerDialog } from './revendiquer-dialog'
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

  const [completee, compte, voisins] = await Promise.all([
    getFicheCompletee(slug),
    getCompte(),
    situe ? getPraticiensProches(profession, principal.lon!, principal.lat!, RAYON_VOISINS, 4) : Promise.resolve([]),
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
                {geree && <BadgeGeree profession={profession === 'prothesiste' ? 'prothesiste' : 'dentiste'} className="ring-1 ring-inset ring-line" />}
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
              <ModuleCabinet fiche={completee} />
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
                  Les professions du RPPS sont dans Pro Santé Connect : la
                  fenêtre leur propose la vérification par carte. Les laboratoires
                  n'y sont pas et gardent la demande manuelle.
                */}
                <div className="mt-4">
                  {personne ? (
                    <RevendiquerDialog slug={p.slug} pscDisponible={pscConfigure()} />
                  ) : (
                    <Link
                      href={chemin(`/espace-pro/revendiquer/?fiche=${encodeURIComponent(p.slug)}`)}
                      className="squircle-full inline-block bg-action px-5 py-2.5 text-sm font-medium text-action-foreground hover:bg-action-hover"
                    >
                      Revendiquer cette fiche
                    </Link>
                  )}
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
function ModuleCabinet({ fiche }: { fiche: FicheCompletee }) {
  const horaires = fiche.horaires ?? {}
  const maj = new Date(fiche.majLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const aujourdhui = JOURS[(new Date().getDay() + 6) % 7]
  return (
    <Module id="pratique" titre="Horaires, langues, accès et paiement" intro={`Déclarés par le cabinet, dont l’identité a été vérifiée avant qu’il puisse écrire ici. Mis à jour le ${maj}.`}>
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
        {(fiche.paiements.length > 0 || fiche.tiersPayant) && (
          <Bloc icone={CreditCard} titre="Paiement">
            {fiche.paiements.map((c) => (
              <Etiquette key={c}>{libelle(PAIEMENTS, c)}</Etiquette>
            ))}
            {fiche.tiersPayant && <p className="basis-full text-sm text-fg-2">{libelle(TIERS_PAYANT, fiche.tiersPayant)}</p>}
          </Bloc>
        )}
      </div>
    </Module>
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
