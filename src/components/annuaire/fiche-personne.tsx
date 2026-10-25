/**
 * Fiche d'une personne : chirurgien-dentiste, chirurgien maxillo-facial,
 * stomatologue, ORL.
 *
 * En-tête sombre sur la carte du quartier, puis le cabinet en étapes
 * numérotées, les horaires et les lieux sur une bande sombre, enfin ce que
 * dit le registre. Le registre et le déclaratif restent séparés : l'un se
 * vérifie, l'autre porte la mention « renseigné par le praticien ».
 */
import Link from 'next/link'
import { Accessibility, CalendarCheck, CreditCard, ExternalLink, Globe, Languages, Navigation, Stethoscope } from 'lucide-react'
import { Carte } from '@/components/map/carte'
import { empriseAutour } from '@/lib/annuaire/emprise'
import { illustration } from '@/lib/annuaire/illustration'
import { aDesHoraires, ouverture as calculerOuverture, plagesDuJour } from '@/lib/annuaire/ouverture'
import { formaterAdresse } from '@/lib/annuaire/nom'
import type { Lieu } from '@/lib/annuaire/types'
import {
  ACCESSIBILITE,
  LANGUES,
  LIBELLE_JOUR,
  ORIENTATIONS,
  PAIEMENTS,
  SECTEURS,
  TIERS_PAYANT,
  libelle,
  libelleAge,
  type FicheCompletee,
} from '@/lib/espace-pro/fiche-completee'
import { Adresse, chemin } from './primitives'
import { BadgeRecruteFiche } from './recrutement'
import { BoutonAppeler, TelephoneProtege } from './telephone-protege'
import {
  ArianeSombre,
  AsideFiche,
  BarreMobile,
  BOUTON_PRINCIPAL,
  BOUTON_SOMBRE,
  BoutonFavori,
  BoutonItineraire,
  Etiquette,
  FondCarte,
  HorairesListe,
  MarqueGeree,
  PastilleSombre,
  Photo,
  Registre,
  Renseigne,
  Semaine,
  Statut,
  Titre2,
  VerificationSombre,
  dateLongue,
  LienFicheLiee,
  lienItineraire,
  type ContexteFiche,
} from './fiche-blocs'

/** Rayon de la carte d'en-tête : de quoi situer la rue, pas le quartier. */
const RAYON_CARTE = 900
/** Au-delà de six mois sans confirmation, les horaires ne valent plus « ouvert maintenant ». */
const HORAIRES_VALIDES_JOURS = 180

/**
 * Le registre libelle le mode d'exercice en abrégé, « Lib,indép,artis,com ».
 * On l'écrit en toutes lettres sans en changer le sens.
 */
const MODE_EXERCICE: Record<string, string> = {
  'Lib,indép,artis,com': 'Exercice libéral',
  Salarié: 'Exercice salarié',
  Bénévole: 'Exercice bénévole',
}

function horairesAJour(f: FicheCompletee, maintenant: Date): boolean {
  return maintenant.getTime() - new Date(f.horairesConfirmesLe ?? f.majLe).getTime() <= HORAIRES_VALIDES_JOURS * 86_400_000
}

export function FichePersonne({ c }: { c: ContexteFiche }) {
  const { p, fiche, principal } = c
  const horaires = fiche && aDesHoraires(fiche.horaires) ? fiche.horaires : null
  const aJour = fiche ? horairesAJour(fiche, c.maintenant) : false
  const ouverture = horaires && aJour ? calculerOuverture(horaires, c.maintenant) : null
  const adresse = principal ? [principal.adresseLigne && formaterAdresse(principal.adresseLigne), principal.communeNom].filter(Boolean).join(', ') : ''
  const sousTitre = [p.raisonSociale, adresse].filter(Boolean).join(' · ')
  const photo = fiche?.photoUrl ?? null

  return (
    <>
      <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
        <FondCarte base={c.base} lieu={principal} rayon={RAYON_CARTE} />
        <div className="container relative z-10 grid gap-10 pb-16 pt-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="min-w-0">
            <ArianeSombre segments={c.ariane} />
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <PastilleSombre>{c.qualite}</PastilleSombre>
              {p.specialite && <PastilleSombre>{p.specialite}</PastilleSombre>}
              {ouverture && <Statut ouverture={ouverture} sombre />}
            </div>
            <h1 className="mt-5 text-balance break-words text-5xl font-normal tracking-tight text-white md:text-6xl">{c.nom}</h1>
            {sousTitre && <p className="mt-3 text-lg text-white/75">{sousTitre}</p>}
            {c.liee && <LienFicheLiee liee={c.liee} labo={false} />}
            <div className="mt-5 flex flex-wrap gap-2">
              <VerificationSombre statut={p.statutVerification} />
              {c.geree && <MarqueGeree labo={false} />}
              {c.recrute && <BadgeRecruteFiche />}
              {c.etudiant && <Etiquette accent>Inscrit comme étudiant au registre</Etiquette>}
              {c.radie && <Etiquette accent>Ne figure plus au registre</Etiquette>}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {c.appel && (
                <BoutonAppeler lieuId={c.appel.id} possede={c.appel.aTelephone} libelle="Appeler le cabinet" className={`col-span-2 ${BOUTON_PRINCIPAL}`} />
              )}
              {fiche?.rdvEnLigne && (
                <a href={fiche.rdvEnLigne} target="_blank" rel="noopener nofollow" className={BOUTON_SOMBRE}>
                  <CalendarCheck className="size-4" aria-hidden /> <span className="sm:hidden">Rendez-vous</span>
                  <span className="hidden sm:inline">Prendre rendez-vous</span> <ExternalLink className="size-3.5 opacity-60" aria-hidden />
                </a>
              )}
              {principal && <BoutonItineraire lieu={principal} />}
              <BoutonFavori slug={p.slug} retour={c.cheminFiche} favori={c.favori} />
            </div>
          </div>

          <div className="squircle-2xl shadow-pop overflow-hidden border border-white/10 bg-[#161c21]">
            {photo ? (
              <Photo src={photo} alt="" className="aspect-[4/3] [&_img]:object-[center_26%]" sizes="(min-width: 1024px) 22rem, 100vw" />
            ) : (
              // Pas de photo déposée : le visuel de remplacement des listes, choisi sur la civilité du registre.
              <Photo src={illustration(p.profession, p.civilite)} alt="" className="aspect-[4/3] [&_img]:object-[center_26%] [&_img]:brightness-[0.55]" sizes="(min-width: 1024px) 22rem, 100vw" />
            )}
            <div className="p-5">
              {horaires ? (
                <>
                  <p className="text-xs font-medium uppercase tracking-wide text-white/60">
                    <span className="lg:hidden">Aujourd’hui, {LIBELLE_JOUR[c.aujourdhui].toLowerCase()}</span>
                    <span className="hidden lg:inline">Cette semaine</span>
                  </p>
                  <p className="mt-2 tabular-nums text-white lg:hidden">{plagesDuJour(horaires, c.aujourdhui).join(' · ') || 'Fermé'}</p>
                  <div className="mt-2 hidden lg:block">
                    <HorairesListe horaires={horaires} aujourdhui={c.aujourdhui} />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium uppercase tracking-wide text-white/60">Horaires</p>
                  <p className="mt-2 text-sm text-white/75">Non communiqués : aucun registre ne les donne, seul le cabinet peut les renseigner.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <BarreMobile
        titre={c.nom}
        detail={ouverture ? `${ouverture.texte} · ${ouverture.detail}` : (principal?.communeNom ?? null)}
        ouvert={ouverture?.ouvert}
        lieu={c.appel}
        libelleAppel="Appeler"
        secondaire={
          fiche?.rdvEnLigne
            ? { href: fiche.rdvEnLigne, libelle: 'Prendre rendez-vous', icone: <CalendarCheck className="size-5" aria-hidden />, externe: true }
            : principal
              ? { href: lienItineraire(principal), libelle: 'Itinéraire', icone: <Navigation className="size-5" aria-hidden /> }
              : undefined
        }
      />

      {c.radie && (
        <div className="container pt-10">
          <p className="squircle-xl border border-partiel-line bg-partiel-bg p-4 text-sm text-partiel">
            Ce professionnel ne figure plus au registre officiel. La fiche est conservée à titre d’archive.
          </p>
        </div>
      )}

      <SectionCabinet c={c} />
      <SectionHoraires c={c} horaires={horaires} aJour={aJour} />
      <SectionRegistre c={c} />
    </>
  )
}

/** Le cabinet, en étapes numérotées : seules celles que le praticien a renseignées. */
function SectionCabinet({ c }: { c: ContexteFiche }) {
  const f = c.fiche
  const etapes = f ? etapesCabinet(f) : []
  const titre = 'Le cabinet'
  if (!f || (etapes.length === 0 && !f.presentation && !f.siteWeb)) {
    return (
      <section className="container py-20 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">{titre}</h2>
          <div className="squircle-2xl border border-dashed border-line p-6 text-fg-2">
            <p>Horaires, soins pratiqués, langues, accès et paiement ne viennent d’aucun registre : seul le cabinet peut les donner. Il ne l’a pas encore fait.</p>
            {!c.radie && (
              <p className="mt-3 text-sm">
                C’est votre fiche ?{' '}
                <Link href={chemin(`/espace-pro/revendiquer/?fiche=${encodeURIComponent(c.p.slug)}`)} className="font-medium text-fg underline underline-offset-4">
                  Revendiquez-la
                </Link>{' '}
                et complétez-la : plus elle est complète, plus elle remonte dans les recherches.
              </p>
            )}
          </div>
        </div>
      </section>
    )
  }
  return (
    <section id="cabinet" className="container scroll-mt-24 py-20 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">{titre}</h2>
          {f.presentation && <p className="mt-5 whitespace-pre-line leading-relaxed text-fg-2">{f.presentation}</p>}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {f.siteWeb && (
              <a href={f.siteWeb} target="_blank" rel="noopener nofollow" className="inline-flex items-center gap-2 text-sm font-medium text-fg underline-offset-4 hover:underline">
                <Globe className="size-4 text-teal" aria-hidden /> {hote(f.siteWeb)} <ExternalLink className="size-3.5 opacity-60" aria-hidden />
              </a>
            )}
            <Renseigne par="praticien" confirmeLe={f.presentation ? f.presentationConfirmeeLe : f.accueilConfirmeLe} majLe={f.majLe} />
          </div>
        </div>
        <ol>
          {etapes.map((b, k) => (
            <li key={b.titre} className="border-b border-line py-10 first:pt-0">
              <p className="text-6xl font-light tabular-nums tracking-tight text-fg md:text-7xl">{String(k + 1).padStart(2, '0')}</p>
              <h3 className="mt-6 flex items-center gap-2 text-xl font-semibold tracking-tight text-fg">
                <b.icone className="size-5 text-teal" aria-hidden /> {b.titre}
              </h3>
              {b.valeurs.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {b.valeurs.map((x) => (
                    <Etiquette key={x}>{x}</Etiquette>
                  ))}
                </div>
              )}
              {b.notes.map((n) => (
                <p key={n} className="mt-3 text-sm text-fg-2">
                  {n}
                </p>
              ))}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

type Etape = { icone: typeof Stethoscope; titre: string; valeurs: string[]; notes: string[] }

function etapesCabinet(f: FicheCompletee): Etape[] {
  const etapes: Etape[] = []
  if (f.orientations.length) {
    etapes.push({
      icone: Stethoscope,
      titre: 'Soins pratiqués',
      valeurs: f.orientations.map((o) => libelle(ORIENTATIONS, o)),
      notes: ['Déclarés par le praticien, ce ne sont pas des spécialités de l’Ordre.'],
    })
  }
  if (f.langues.length) etapes.push({ icone: Languages, titre: 'Langues parlées', valeurs: f.langues.map((l) => libelle(LANGUES, l)), notes: [] })
  const acces = [
    ...f.accessibilite.map((a) => libelle(ACCESSIBILITE, a)),
    ...(f.accesPmr === 'partiel' ? ['Accès PMR partiel'] : f.accesPmr === 'non' ? ['Pas d’accès PMR'] : []),
    ...(f.ageMinimum !== null ? [`Patients reçus : ${libelleAge(f.ageMinimum).toLowerCase()}`] : []),
  ]
  if (acces.length || f.accessibiliteCommentaire) {
    etapes.push({ icone: Accessibility, titre: 'Accès au cabinet', valeurs: acces, notes: f.accessibiliteCommentaire ? [f.accessibiliteCommentaire] : [] })
  }
  const secteur = f.secteur ? SECTEURS.find((s) => s.code === f.secteur) : undefined
  if (secteur || f.paiements.length || f.tiersPayant) {
    etapes.push({
      icone: CreditCard,
      titre: 'Paiement',
      valeurs: [...(secteur ? [secteur.libelle] : []), ...f.paiements.map((m) => libelle(PAIEMENTS, m))],
      notes: [[secteur?.detail, f.tiersPayant && `${libelle(TIERS_PAYANT, f.tiersPayant)}.`].filter(Boolean).join(' ')].filter(Boolean),
    })
  }
  return etapes
}

/** « https://www.cabinet.fr/accueil » devient « cabinet.fr ». */
function hote(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Horaires et lieux, sur une bande sombre. Toujours rendue : un lieu au moins vient du registre. */
function SectionHoraires({ c, horaires, aJour }: { c: ContexteFiche; horaires: FicheCompletee['horaires']; aJour: boolean }) {
  const lieux = [...c.p.lieux].sort((a, b) => Number(b === c.principal) - Number(a === c.principal))
  const plusieurs = lieux.length > 1
  const titre = horaires ? 'Horaires et lieux' : plusieurs ? 'Lieux d’exercice' : 'Lieu d’exercice'
  return (
    <section id="horaires" className="dark scroll-mt-24 bg-background py-20 text-fg">
      <div className="container">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {titre}
          {plusieurs && <span className="block text-white/55">Le praticien exerce dans {lieux.length} lieux.</span>}
        </h2>
        {horaires && (
          <div className="mt-10">
            {!aJour && <p className="mb-3 text-sm text-white/70">Horaires non confirmés par le cabinet depuis plus de six mois : appelez avant de vous déplacer.</p>}
            <Semaine horaires={horaires} aujourdhui={c.aujourdhui} />
          </div>
        )}
        <div className={`${horaires ? 'mt-6' : 'mt-10'} grid gap-3 md:grid-cols-2`}>
          {lieux.map((l, i) => (
            <CarteLieu key={l.id} lieu={l} base={c.base} titre={plusieurs ? (l === c.principal ? 'Lieu principal' : i === 1 ? 'Second lieu' : `Lieu ${i + 1}`) : 'Adresse'} />
          ))}
        </div>
        {horaires && c.fiche && (
          <div className="mt-4">
            <Renseigne par="praticien" confirmeLe={c.fiche.horairesConfirmesLe} majLe={c.fiche.majLe} sombre />
          </div>
        )}
      </div>
    </section>
  )
}

/** Un lieu d'exercice : sa carte s'il est situé au numéro ou à la voie, ce que le registre en dit. */
function CarteLieu({ lieu, base, titre }: { lieu: Lieu; base: ContexteFiche['base']; titre: string }) {
  const situe = lieu.lon != null && lieu.lat != null && !lieu.approximative
  return (
    <div className={`squircle-2xl grid overflow-hidden border border-line bg-bg-soft ${situe ? 'sm:grid-cols-[12rem_1fr]' : ''}`}>
      {situe && (
        <div className="relative h-36 sm:h-auto sm:min-h-36 [&_.maplibregl-control-container]:hidden">
          <Carte profession={base} emprise={empriseAutour(lieu.lon!, lieu.lat!, 400)} className="size-full" />
        </div>
      )}
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-2">{titre}</p>
        <div className="mt-1">
          <Adresse ligne={lieu.adresseLigne} codePostal={lieu.codePostal} commune={lieu.communeNom} approximative={lieu.approximative} precision={lieu.precisionPosition} />
        </div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-fg-2">Téléphone</dt>
          <dd>
            <TelephoneProtege lieuId={lieu.id} possede={lieu.aTelephone} />
          </dd>
          {lieu.finess && (
            <>
              <dt className="text-fg-2">FINESS</dt>
              <dd className="font-mono text-fg">{lieu.finess}</dd>
            </>
          )}
        </dl>
      </div>
    </div>
  )
}

function SectionRegistre({ c }: { c: ContexteFiche }) {
  const { p } = c
  const lignes: [string, string][] = [['Profession', c.qualite]]
  if (p.specialite) lignes.push(['Spécialité ordinale', p.specialite])
  if (p.modeExercice) lignes.push(['Mode d’exercice', MODE_EXERCICE[p.modeExercice] ?? p.modeExercice])
  if (p.categorieProfessionnelle) lignes.push(['Catégorie', p.categorieProfessionnelle === 'Etudiant' ? 'Étudiant' : p.categorieProfessionnelle])
  if (p.rpps) lignes.push(['Numéro RPPS', p.rpps])
  if (p.siret) lignes.push(['SIRET', p.siret])
  if (p.siren) lignes.push(['SIREN', p.siren])
  lignes.push(['Registre', 'Annuaire Santé, Agence du Numérique en Santé'])
  lignes.push(['Adresses situées par', 'Base Adresse Nationale'])
  lignes.push(['Dernière vérification', dateLongue(p.majLe)])
  return (
    <section id="registre" className="container scroll-mt-24 py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <Titre2 sous="Ces informations viennent de registres publics et ne sont pas modifiables par le praticien.">Ce que dit le registre</Titre2>
          <div className="mt-6">
            <Registre lignes={lignes} />
          </div>
          <p className="mt-6 max-w-2xl text-sm text-fg-2">
            {!p.specialite
              ? 'Le registre ne déclare aucune spécialité ordinale, ce qui est le cas de la grande majorité des praticiens : cela ne dit rien des domaines de pratique. '
              : ''}
            Le FINESS, quand il existe, figure sous l’adresse du lieu concerné : il identifie l’établissement, pas le praticien.
          </p>
        </div>
        <AsideFiche slug={p.slug} radie={c.radie} labo={false} liens={c.liens} />
      </div>
    </section>
  )
}
