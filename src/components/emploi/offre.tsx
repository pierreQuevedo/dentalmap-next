/**
 * Page d'une offre (`/emploi/offre/[slug]/`), sur la logique de la fiche
 * dentiste : héros sombre sur la carte du quartier, l'essentiel en bandeau,
 * le poste en sections numérotées, le recruteur en bande sombre. Un même
 * gabarit pour un poste salarié et pour un remplacement ou une collaboration,
 * qui change les intitulés et ajoute les conditions d'exercice.
 *
 * Les dates sont affichées : publication, dernière confirmation par le
 * recruteur (tous les 15 jours) et expiration.
 */
import Link from 'next/link'
import { ArrowRight, BadgeEuro, Bell, CalendarDays, CalendarRange, Check, Clock, ExternalLink, FileText, Flag, MapPin, Send } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { empriseAutour } from '@/lib/annuaire/emprise'
import { chemin } from '@/lib/navigation'
import {
  EMPLOI,
  REMPLACEMENTS,
  cheminCommune,
  cheminDepartement,
  cheminMetier,
  cheminPostuler,
  cheminRemplacementsDepartement,
} from '@/lib/emploi/chemins'
import { contratTexte, dateLongue, debutTexte, decouperDescription, km, lignes, periodeTexte, referenceOffre, remuneration, tempsTexte } from '@/lib/emploi/format'
import { metierDepuisCode } from '@/lib/emploi/metiers'
import { repereSalaire } from '@/lib/emploi/salaires'
import type { OffreDetail, OffreResume } from '@/lib/emploi/types'
import { AlerteEmail } from './alerte-email'
import { CarteOffres } from './carte-offres'
import { CarteOffre, Etiquette, FicheVerifiee, Photo, Remuneration, SourceSalaires, Visuel } from './blocs'
import { Partage } from './partage'

type Bloc = { titre: string; items: string[]; note?: string }

/** Rappel des règles d'exercice d'un remplacement, à titre indicatif. */
const CONDITIONS_REMPLACEMENT = [
  'Inscription au tableau de l’Ordre, ou autorisation de remplacement délivrée par le conseil départemental de l’Ordre pour un étudiant',
  'Carte de professionnel de santé (CPS) de remplaçant',
  'Contrat de remplacement écrit, communiqué au conseil départemental de l’Ordre',
  'Assurance en responsabilité civile professionnelle à jour',
]
const CONDITIONS_COLLABORATION = [
  'Inscription au tableau de l’Ordre',
  'Contrat de collaboration écrit, communiqué au conseil départemental de l’Ordre',
  'Redevance versée au titulaire, fixée au contrat en pourcentage des honoraires',
  'Assurance en responsabilité civile professionnelle à jour',
]

const ANCRE_ALERTE = 'alerte'

/** Ce que la page montre d'une offre, selon qu'il s'agit d'un poste salarié ou d'un exercice libéral. */
function vue(o: OffreDetail) {
  const liberal = o.contrat === 'remplacement' || o.contrat === 'collaboration'
  const m = metierDepuisCode(o.metier)
  const { resume, points } = decouperDescription(o.description)
  const blocs: Bloc[] = [
    { titre: o.contrat === 'remplacement' ? 'Activité pendant le remplacement' : o.contrat === 'collaboration' ? 'Activité' : 'Missions', items: points },
    { titre: 'Profil recherché', items: lignes(o.profil) },
    ...(liberal
      ? [
          {
            titre: 'Conditions d’exercice',
            items: o.contrat === 'remplacement' ? CONDITIONS_REMPLACEMENT : CONDITIONS_COLLABORATION,
            note: 'Règles d’exercice rappelées à titre indicatif, à vérifier avec l’Ordre des chirurgiens-dentistes.',
          },
        ]
      : []),
    { titre: liberal ? 'Ce que le cabinet met à disposition' : 'Avantages', items: o.avantages },
  ].filter((b) => b.items.length > 0)
  const r = remuneration(o)
  const essentiel: { icone: typeof Clock; label: string; valeur: string; detail?: string }[] = [
    { icone: FileText, label: 'Contrat', valeur: o.contrat === 'remplacement' ? 'Remplacement libéral' : o.contrat === 'collaboration' ? 'Collaboration libérale' : contratTexte(o) },
    o.fin
      ? { icone: CalendarRange, label: 'Dates', valeur: periodeTexte(o.debut, o.fin) }
      : { icone: CalendarDays, label: 'Début', valeur: debutTexte(o.debut) },
    { icone: Clock, label: liberal ? 'Rythme' : 'Temps de travail', valeur: tempsTexte(o) },
    { icone: BadgeEuro, label: 'Rémunération', valeur: r.principal, detail: r.detail },
    ...(o.metresCentre != null ? [{ icone: MapPin, label: 'Distance', valeur: km(o.metresCentre), detail: `du centre de ${o.commune}` }] : []),
  ]
  const ariane = liberal
    ? [
        { libelle: 'Emploi', href: EMPLOI },
        { libelle: 'Remplacements', href: REMPLACEMENTS },
        { libelle: o.departementNom, href: cheminRemplacementsDepartement(o.departementSlug) },
        { libelle: o.commune },
      ]
    : [
        { libelle: 'Emploi', href: EMPLOI },
        { libelle: m.nom, href: cheminMetier(m.slug) },
        { libelle: o.departementNom, href: cheminDepartement(m.slug, o.departementSlug) },
        { libelle: o.commune, href: cheminCommune(m.slug, o.departementSlug, o.communeSlug) },
      ]
  return {
    liberal,
    metier: m,
    resume,
    blocs,
    essentiel,
    ariane,
    chips: [m.nom, contratTexte(o), o.tempsPlein ? 'Temps plein' : 'Temps partiel'],
    repere: repereSalaire(o.metier, o.contrat, o.type),
    lienProches: liberal
      ? { libelle: `Remplacements en ${o.departementNom}`, href: cheminRemplacementsDepartement(o.departementSlug) }
      : { libelle: `${m.nom} à ${o.commune}`, href: cheminCommune(m.slug, o.departementSlug, o.communeSlug) },
    message: `Votre candidature part depuis votre compte, avec votre profil${liberal ? ', votre situation d’exercice' : ''} et un message à ${o.recruteur}.`,
  }
}
type Vue = ReturnType<typeof vue>

function Liste({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((x) => (
        <li key={x} className="flex gap-3 text-fg">
          <Check className="mt-1 size-4 shrink-0 text-teal" aria-hidden /> <span>{x}</span>
        </li>
      ))}
    </ul>
  )
}

function BoutonPostuler({ o, pleine }: { o: OffreDetail; pleine?: boolean }) {
  return (
    <Link
      href={chemin(cheminPostuler(o.slug))}
      className={`hover-lift inline-flex h-12 items-center justify-center gap-2 rounded-full bg-action px-7 text-sm font-semibold text-action-foreground hover:bg-action-hover ${pleine ? 'w-full' : ''}`}
    >
      <Send className="size-4" aria-hidden /> Postuler
    </Link>
  )
}

function NoteCandidature() {
  return (
    <p className="text-xs leading-relaxed text-fg-2">
      Pour postuler, il faut un compte DentalMap. Le recruteur voit votre profil et votre message ; votre téléphone et votre email ne lui sont transmis que si vous
      acceptez un échange. L’alerte, elle, fonctionne sans compte.
    </p>
  )
}

function Dates({ o }: { o: OffreDetail }) {
  return (
    <div className="text-sm text-fg-2">
      <p className="flex flex-wrap gap-x-4 gap-y-1">
        {o.publieeLe && (
          <span>
            Publiée le <span className="text-fg">{dateLongue(o.publieeLe)}</span>
          </span>
        )}
        {o.confirmeeLe && (
          <span>
            Confirmée le <span className="text-fg">{dateLongue(o.confirmeeLe)}</span>
          </span>
        )}
        {o.expireLe && (
          <span>
            Expire le <span className="text-fg">{dateLongue(o.expireLe)}</span>
          </span>
        )}
        <span>Référence {referenceOffre(o.id)}</span>
      </p>
      <p className="mt-2 text-xs text-fg-2">Le recruteur confirme son offre tous les 15 jours ; sans confirmation, elle est retirée.</p>
      <Link
        href={chemin('/contact/?objet=annonce#formulaire')}
        className="mt-2 inline-flex items-center gap-1.5 text-xs text-fg-2 underline-offset-4 hover:underline"
      >
        <Flag className="size-3.5" aria-hidden /> Signaler cette offre
      </Link>
    </div>
  )
}

function LienFiche({ o, sombre }: { o: OffreDetail; sombre?: boolean }) {
  if (!o.praticien.chemin) return null
  return (
    <Link
      href={chemin(o.praticien.chemin)}
      className={`inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline ${sombre ? 'text-white' : 'text-fg'}`}
    >
      Voir la fiche vérifiée {o.type === 'laboratoire' ? 'du laboratoire' : o.type === 'centre' ? 'du centre' : 'du cabinet'}{' '}
      <ExternalLink className="size-3.5 opacity-60" aria-hidden />
    </Link>
  )
}

const adresseComplete = (o: OffreDetail) => [o.adresse, [o.codePostal, o.commune].filter(Boolean).join(' ')].filter(Boolean).join(', ')

function Hero({ o, v }: { o: OffreDetail; v: Vue }) {
  const situe = o.lon != null && o.lat != null
  return (
    <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
      {situe && (
        <>
          <div aria-hidden inert className="pointer-events-none absolute inset-0">
            <CarteOffres emprise={empriseAutour(o.lon! - 0.004, o.lat!, 900)} mention={false} actif="recruteur" points={[{ id: 'recruteur', lon: o.lon!, lat: o.lat! }]} />
            <div className="absolute inset-0 bg-ardoise mix-blend-color" />
            <div className="absolute inset-0 [background:radial-gradient(ellipse_70%_80%_at_70%_45%,color-mix(in_oklch,var(--background)_30%,transparent)_0%,var(--background)_85%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>
          <p className="absolute bottom-3 right-4 z-10 text-[11px] text-white/45">Plans © OpenStreetMap, OpenMapTiles, via OpenFreeMap</p>
        </>
      )}

      <div className="container relative z-10 pb-14 pt-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/70">
              <FilAriane segments={v.ariane} />
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-2">
              {v.chips.map((c) => (
                <Etiquette key={c} ton="sombre">
                  {c}
                </Etiquette>
              ))}
              {o.publieeLe && (
                <span className="inline-flex items-center gap-1.5 text-xs text-white/60">
                  <Clock className="size-3.5" aria-hidden /> Publiée le {dateLongue(o.publieeLe)}
                </span>
              )}
            </div>
            <h1 className="mt-5 text-4xl font-normal tracking-tight text-white md:text-6xl">{o.titre}</h1>
            <p className="mt-3 text-lg text-white/75">
              {o.recruteur} · {adresseComplete(o)}
            </p>
            <div className="mt-4">
              <FicheVerifiee sombre />
            </div>
            <div className="mt-8">
              <Remuneration o={o} sombre grand />
            </div>
            <div className="mt-8 grid grid-cols-[1fr_auto_auto] gap-2 sm:flex sm:flex-wrap">
              <BoutonPostuler o={o} />
              <a
                href={`#${ANCRE_ALERTE}`}
                aria-label="Créer une alerte pour ce type d’offre"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 text-sm font-medium text-white sm:px-5"
              >
                <Bell className="size-4" aria-hidden /> <span className="hidden sm:inline">Créer une alerte</span>
              </a>
              <Partage titre={o.titre} sombre />
            </div>
          </div>
          <div className="squircle-2xl shadow-pop overflow-hidden border border-white/10 bg-[#161c21]">
            {o.photo ? <Photo src={o.photo} className="aspect-[16/10]" /> : <Visuel o={o} className="aspect-[16/10]" />}
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">Le recruteur</p>
              <p className="mt-1 text-lg font-semibold text-white">{o.recruteur}</p>
              <p className="text-sm text-white/70">{o.type === 'laboratoire' ? 'Laboratoire de prothèse dentaire' : o.type === 'centre' ? 'Centre de santé' : 'Cabinet dentaire'}</p>
              {o.photo && <p className="mt-1 text-xs text-white/50">Photo déposée par le recruteur</p>}
              <div className="mt-4">
                <LienFiche o={o} sombre />
              </div>
            </div>
          </div>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-8 md:grid-cols-3 xl:grid-cols-5">
          {v.essentiel.map((e) => (
            <div key={e.label}>
              <dt className="flex items-center gap-1.5 text-sm text-white/60">
                <e.icone className="size-4 text-teal" aria-hidden /> {e.label}
              </dt>
              <dd className="mt-1.5 text-lg font-semibold leading-snug tracking-tight text-white">{e.valeur}</dd>
              {e.detail && <dd className="text-sm text-white/60">{e.detail}</dd>}
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function SectionPoste({ o, v }: { o: OffreDetail; v: Vue }) {
  const r = remuneration(o)
  return (
    <section className="container py-20 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Le poste</h2>
          <p className="mt-5 whitespace-pre-line leading-relaxed text-fg-2">{v.resume}</p>
          <div className="squircle-2xl mt-8 border border-line bg-bg-soft p-4">
            <p className="text-sm font-semibold text-fg">
              Cette offre : {r.principal} {r.detail}
            </p>
            {v.repere && (
              <>
                <p className="mt-1 text-sm text-fg-2">{v.repere.texte}</p>
                <SourceSalaires className="mt-2" objet={v.repere.objet} sources={v.repere.sources} />
              </>
            )}
          </div>
          <div className="mt-6">
            <Dates o={o} />
          </div>
        </div>
        {v.blocs.length > 0 ? (
          <ol>
            {v.blocs.map((b, k) => (
              <li key={b.titre} className="border-b border-line py-10 first:pt-0">
                <p className="text-6xl font-light tabular-nums tracking-tight text-fg md:text-7xl">0{k + 1}</p>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-fg">{b.titre}</h3>
                <div className="mt-4">
                  <Liste items={b.items} />
                </div>
                {b.note && <p className="squircle-xl mt-4 bg-partiel-bg px-3 py-2 text-sm text-partiel">{b.note}</p>}
              </li>
            ))}
          </ol>
        ) : (
          <div />
        )}
      </div>
    </section>
  )
}

function SectionRecruteur({ o }: { o: OffreDetail }) {
  const situe = o.lon != null && o.lat != null
  return (
    <section className="dark bg-background py-20 text-fg">
      <div className="container">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {o.type === 'laboratoire' ? 'Le laboratoire' : o.type === 'centre' ? 'Le centre de santé' : 'Le cabinet'}
          <span className="block text-white/55">Ce que dit sa fiche vérifiée.</span>
        </h2>
        <div className={`mt-10 grid gap-4 ${situe ? 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]' : ''}`}>
          <div className="squircle-2xl grid gap-8 border border-line bg-bg-soft p-6 sm:grid-cols-2 md:p-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-fg-2">Adresse</p>
              <p className="mt-1 text-white">{adresseComplete(o)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-fg-2">Recruteur</p>
              <p className="mt-1 text-white">{o.recruteur}</p>
            </div>
            {o.praticien.presentation && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-fg-2">Présentation</p>
                <p className="mt-1 line-clamp-6 whitespace-pre-line text-white">{o.praticien.presentation}</p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 sm:col-span-2">
              <span className="flex flex-wrap items-center gap-3">
                <FicheVerifiee sombre />
                {o.praticien.presentation && o.praticien.presentationConfirmeeLe && (
                  <span className="text-xs text-fg-2">Renseigné par le praticien, confirmé le {dateLongue(o.praticien.presentationConfirmeeLe)}</span>
                )}
              </span>
              <LienFiche o={o} sombre />
            </div>
          </div>
          {situe && (
            <div className="squircle-2xl overflow-hidden border border-line">
              <CarteOffres
                className="h-72 lg:h-full lg:min-h-72"
                emprise={empriseAutour(o.lon!, o.lat!, 450)}
                actif="recruteur"
                points={[{ id: 'recruteur', lon: o.lon!, lat: o.lat!, etiquette: o.recruteur }]}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function SectionPostuler({ o, v }: { o: OffreDetail; v: Vue }) {
  return (
    <section className="container py-20">
      <div className="squircle-3xl grid gap-8 border border-line bg-bg-soft p-6 md:p-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">Ce poste vous intéresse ?</h2>
          <p className="mt-3 max-w-xl text-fg-2">{v.message}</p>
          <div className="mt-5 max-w-xl">
            <NoteCandidature />
          </div>
          <div className="mt-6 max-w-xs">
            <BoutonPostuler o={o} pleine />
          </div>
        </div>
        <div id={ANCRE_ALERTE} className="scroll-mt-24">
          <p className="flex items-center gap-2 text-sm font-semibold text-fg">
            <Bell className="size-4 text-teal" aria-hidden /> Créer une alerte pour ce type d’offre
          </p>
          <p className="mt-1 text-sm text-fg-2">
            {v.metier.nom}
            {v.liberal ? `, ${o.contrat === 'remplacement' ? 'remplacements' : 'collaborations'}` : ''}, à {o.commune} et dans un rayon de 20 km. Sans compte.
          </p>
          <div className="mt-4">
            <AlerteEmail compacte criteres={{ metiers: [o.metier], contrats: v.liberal ? [o.contrat] : [], commune: o.communeCode, rayonKm: 20 }} />
          </div>
        </div>
      </div>
    </section>
  )
}

function OffresProches({ proches, v }: { proches: OffreResume[]; v: Vue }) {
  if (!proches.length) return null
  return (
    <section className="container pb-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Offres proches</h2>
        <Link href={chemin(v.lienProches.href)} className="inline-flex items-center gap-2 text-sm font-medium text-fg">
          {v.lienProches.libelle} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <p className="mt-2 text-sm text-fg-2">Les plus proches de ce recruteur d’abord.</p>
      <ul className="mt-6 space-y-3 sm:hidden">
        {proches.map((p) => (
          <CarteOffre key={p.id} o={p} forme="ligne" />
        ))}
      </ul>
      <ul className="mt-6 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {proches.map((p) => (
          <CarteOffre key={p.id} o={p} />
        ))}
      </ul>
    </section>
  )
}

/** Barre « Postuler » collée en bas d'écran sur mobile. */
function BarrePostulerMobile({ o }: { o: OffreDetail }) {
  const r = remuneration(o)
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{o.titre}</p>
          <p className="truncate text-xs tabular-nums text-fg-2">
            {r.principal} {r.detail}
          </p>
        </div>
        <a href={`#${ANCRE_ALERTE}`} aria-label="Créer une alerte" className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-fg">
          <Bell className="size-5" aria-hidden />
        </a>
        <Link href={chemin(cheminPostuler(o.slug))} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground">
          <Send className="size-4" aria-hidden /> Postuler
        </Link>
      </div>
    </div>
  )
}

export function PageOffre({ o, proches }: { o: OffreDetail; proches: OffreResume[] }) {
  const v = vue(o)
  return (
    <>
      <main className="pb-20 lg:pb-0">
        <Hero o={o} v={v} />
        <SectionPoste o={o} v={v} />
        <SectionRecruteur o={o} />
        <SectionPostuler o={o} v={v} />
        <OffresProches proches={proches} v={v} />
      </main>
      <BarrePostulerMobile o={o} />
    </>
  )
}
