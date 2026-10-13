/**
 * MAQUETTE. Page d'une offre, style retenu (A) : la logique de la fiche
 * dentiste validée (B1 « Étapes »). Héros sombre sur la carte du quartier,
 * l'essentiel en bandeau, le poste en sections numérotées, le cabinet en
 * bande sombre. Deux offres sur le même gabarit : un CDI d'assistant(e)
 * dentaire et un remplacement de chirurgien-dentiste.
 *
 * Données structurées : `JOB_POSTING` (voir `_donnees.ts`) est à injecter sur
 * la vraie page avec `<Balisage donnees={JOB_POSTING} />`. Les maquettes ne
 * l'injectent pas.
 */
import {
  ArrowRight,
  BadgeEuro,
  Bell,
  CalendarDays,
  CalendarRange,
  Check,
  Clock,
  ExternalLink,
  FileText,
  Flag,
  Link2,
  Mail,
  MapPin,
  Send,
  Share2,
  Timer,
} from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { empriseAutour } from '@/lib/annuaire/emprise'
import { CarteOffres } from './_carte-offres'
import { CarteOffre, Etiquette, FicheVerifiee, Photo, Remuneration, SourceSalaires, euros, remuneration } from './_blocs'
import { DETAIL, DETAIL_REMP, OFFRE, OFFRES_PROCHES, OFFRES_PROCHES_REMP, R1, RETROCESSION_MOYENNE, SALAIRES, type Offre } from './_donnees'

type Cabinet = typeof DETAIL.cabinet
type Bloc = { titre: string; items: string[]; note?: string }

type PageOffre = {
  o: Offre
  ariane: { libelle: string; href?: string }[]
  chips: string[]
  cabinet: Cabinet
  resume: string
  blocs: Bloc[]
  essentiel: { icone: typeof Clock; label: string; valeur: string; detail?: string }[]
  reference: string
  confirmee: string
  expire: string
  /** Repère issu d'études, pas des offres. */
  repere: string
  objetRepere?: string
  proches: Offre[]
  lienProches: string
  message: string
}

const PAGE_AD: PageOffre = {
  o: OFFRE,
  ariane: [
    { libelle: 'Emploi', href: '/emploi/' },
    { libelle: 'Assistant(e) dentaire', href: '/emploi/assistant-dentaire/' },
    { libelle: 'Gironde', href: '/emploi/assistant-dentaire/gironde/' },
    { libelle: 'Bordeaux', href: '/emploi/assistant-dentaire/gironde/bordeaux/' },
  ],
  chips: ['Assistant(e) dentaire', 'CDI', 'Temps plein'],
  cabinet: DETAIL.cabinet,
  resume: DETAIL.resume,
  blocs: [
    { titre: 'Missions', items: DETAIL.missions },
    { titre: 'Profil recherché', items: DETAIL.profil },
    { titre: 'Avantages', items: DETAIL.avantages },
    { titre: 'Horaires du poste', items: [DETAIL.horaires] },
  ],
  essentiel: [
    { icone: FileText, label: 'Contrat', valeur: 'CDI' },
    { icone: Clock, label: 'Temps de travail', valeur: OFFRE.temps },
    { icone: CalendarDays, label: 'Début', valeur: OFFRE.debut },
    { icone: BadgeEuro, label: 'Rémunération', valeur: remuneration(OFFRE).principal, detail: 'brut par mois' },
    { icone: MapPin, label: 'Distance', valeur: '0,5 km', detail: 'du centre de Bordeaux' },
    { icone: Timer, label: 'Trajet', valeur: '7 min à pied', detail: '4 min en tram' },
  ],
  reference: DETAIL.reference,
  confirmee: '11 octobre 2026',
  expire: DETAIL.expire,
  repere: `Salaire moyen d’un(e) assistant(e) dentaire en cabinet libéral : ${euros(SALAIRES[0]!.valeurs[0]!)} € brut par mois.`,
  proches: OFFRES_PROCHES,
  lienProches: 'Assistant(e) dentaire à Bordeaux',
  message: 'Votre candidature part depuis votre compte, avec votre profil et un message au Dr Martin Dupont.',
}

const PAGE_REMP: PageOffre = {
  o: R1,
  ariane: [
    { libelle: 'Emploi', href: '/emploi/' },
    { libelle: 'Remplacements', href: '/emploi/remplacements/' },
    { libelle: 'Gironde', href: '/emploi/remplacements/gironde/' },
    { libelle: 'Pessac' },
  ],
  chips: ['Chirurgien-dentiste', 'Remplacement', '3 semaines'],
  cabinet: DETAIL_REMP.cabinet,
  resume: DETAIL_REMP.resume,
  blocs: [
    { titre: 'Activité pendant le remplacement', items: DETAIL_REMP.activite },
    { titre: 'Profil recherché', items: DETAIL_REMP.attentes },
    {
      titre: 'Conditions d’exercice',
      items: DETAIL_REMP.conditions,
      note: 'Règles d’exercice rappelées à titre indicatif, à vérifier avec l’Ordre des chirurgiens-dentistes.',
    },
    { titre: 'Ce que le cabinet met à disposition', items: DETAIL_REMP.materiel },
  ],
  essentiel: [
    { icone: FileText, label: 'Contrat', valeur: 'Remplacement libéral' },
    { icone: CalendarRange, label: 'Dates', valeur: DETAIL_REMP.dates },
    { icone: Clock, label: 'Rythme', valeur: R1.temps, detail: 'du lundi au jeudi' },
    { icone: BadgeEuro, label: 'Rémunération', valeur: remuneration(R1).principal, detail: 'des honoraires encaissés' },
    { icone: MapPin, label: 'Distance', valeur: '7 km', detail: 'du centre de Bordeaux' },
    { icone: Timer, label: 'Trajet', valeur: '22 min en tram', detail: '15 min en voiture' },
  ],
  reference: DETAIL_REMP.reference,
  confirmee: '12 octobre 2026',
  expire: DETAIL_REMP.expire,
  repere: `Rétrocession moyenne pour un remplacement : ${RETROCESSION_MOYENNE.remplacement}\u202f% des honoraires.`,
  objetRepere: 'Taux moyen issu d’études',
  proches: OFFRES_PROCHES_REMP,
  lienProches: 'Remplacements en Gironde',
  message: 'Votre candidature part depuis votre compte, avec votre profil, votre situation d’exercice et un message au Dr Antoine Leroy.',
}

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

function BoutonPostuler({ pleine }: { pleine?: boolean }) {
  return (
    <a className={`hover-lift inline-flex h-12 items-center justify-center gap-2 rounded-full bg-action px-7 text-sm font-semibold text-action-foreground ${pleine ? 'w-full' : ''}`}>
      <Send className="size-4" aria-hidden /> Postuler
    </a>
  )
}

function BoutonAlerte() {
  return (
    <a className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-bg px-4 py-2 text-center text-sm font-medium leading-tight text-fg hover:bg-bg-soft">
      <Bell className="size-4 shrink-0" aria-hidden /> Créer une alerte pour ce type d’offre
    </a>
  )
}

function NoteCandidature() {
  return (
    <p className="text-xs leading-relaxed text-fg-2">
      Pour postuler, il faut un compte DentalMap. Le cabinet voit votre profil et votre message ; votre téléphone et votre email ne lui sont transmis que si vous
      acceptez un échange. L’alerte, elle, fonctionne sans compte.
    </p>
  )
}

function Partage() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-fg-2">Partager</span>
      {[
        { i: Link2, t: 'Copier le lien' },
        { i: Mail, t: 'Envoyer par email' },
        { i: Share2, t: 'Autres applications' },
      ].map((b) => (
        <a key={b.t} title={b.t} aria-label={b.t} className="grid size-9 place-items-center rounded-full border border-line text-fg hover:bg-bg-soft">
          <b.i className="size-4" aria-hidden />
        </a>
      ))}
    </div>
  )
}

function Dates({ p }: { p: PageOffre }) {
  return (
    <div className="text-sm text-fg-2">
      <p className="flex flex-wrap gap-x-4 gap-y-1">
        <span>
          Publiée le <span className="text-fg">{p.o.publiee}</span>
        </span>
        <span>
          Confirmée le <span className="text-fg">{p.confirmee}</span>
        </span>
        <span>
          Expire le <span className="text-fg">{p.expire}</span>
        </span>
        <span>Référence {p.reference}</span>
      </p>
      <p className="mt-2 text-xs text-fg-2">Le recruteur confirme son offre tous les 15 jours ; sans confirmation, elle est retirée.</p>
      <a className="mt-2 inline-flex items-center gap-1.5 text-xs text-fg-2 underline-offset-4 hover:underline">
        <Flag className="size-3.5" aria-hidden /> Signaler cette offre
      </a>
    </div>
  )
}

function LienFiche({ sombre }: { sombre?: boolean }) {
  return (
    <a className={`inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline ${sombre ? 'text-white' : 'text-fg'}`}>
      Voir la fiche vérifiée du cabinet <ExternalLink className="size-3.5 opacity-60" aria-hidden />
    </a>
  )
}

function Hero({ p }: { p: PageOffre }) {
  const c = p.cabinet
  return (
    <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
      <div aria-hidden inert className="pointer-events-none absolute inset-0">
        <CarteOffres emprise={empriseAutour(p.o.lon - 0.004, p.o.lat, 900)} mention={false} actif="cabinet" points={[{ id: 'cabinet', lon: p.o.lon, lat: p.o.lat }]} />
        <div className="absolute inset-0 bg-ardoise mix-blend-color" />
        <div className="absolute inset-0 [background:radial-gradient(ellipse_70%_80%_at_70%_45%,color-mix(in_oklch,var(--background)_30%,transparent)_0%,var(--background)_85%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>
      <p className="absolute bottom-3 right-4 z-10 text-[11px] text-white/45">Plans © OpenStreetMap, OpenMapTiles, via OpenFreeMap</p>

      <div className="container relative z-10 pb-14 pt-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/70">
              <FilAriane segments={p.ariane} />
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-2">
              {p.chips.map((c) => (
                <Etiquette key={c} ton="sombre">
                  {c}
                </Etiquette>
              ))}
              <span className="inline-flex items-center gap-1.5 text-xs text-white/60">
                <Clock className="size-3.5" aria-hidden /> Publiée {p.o.depuis}
              </span>
            </div>
            <h1 className="mt-5 text-4xl font-normal tracking-tight text-white md:text-6xl">{p.o.titre}</h1>
            <p className="mt-3 text-lg text-white/75">
              {c.nom} · {p.o.adresse}, {p.o.commune}
            </p>
            <div className="mt-4">
              <FicheVerifiee sombre />
            </div>
            <div className="mt-8">
              <Remuneration o={p.o} sombre grand />
            </div>
            <div className="mt-8 grid grid-cols-[1fr_auto_auto] gap-2 sm:flex sm:flex-wrap">
              <BoutonPostuler />
              <a aria-label="Créer une alerte pour ce type d’offre" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 text-sm font-medium text-white sm:px-5">
                <Bell className="size-4" aria-hidden /> <span className="hidden sm:inline">Créer une alerte</span>
              </a>
              <a aria-label="Partager" className="inline-flex size-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white">
                <Share2 className="size-4" aria-hidden />
              </a>
            </div>
          </div>
          <div className="squircle-2xl shadow-pop overflow-hidden border border-white/10 bg-[#161c21]">
            <Photo src={c.photo} className="aspect-[16/10]" />
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">Le recruteur</p>
              <p className="mt-1 text-lg font-semibold text-white">{c.nom}</p>
              <p className="text-sm text-white/70">
                {c.praticien} · {c.equipe}
              </p>
              <p className="mt-1 text-xs text-white/50">Photo déposée par le cabinet</p>
              <div className="mt-4">
                <LienFiche sombre />
              </div>
            </div>
          </div>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-8 md:grid-cols-3 xl:grid-cols-6">
          {p.essentiel.map((e) => (
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

function SectionPoste({ p }: { p: PageOffre }) {
  const r = remuneration(p.o)
  return (
    <section className="container py-20 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Le poste</h2>
          <p className="mt-5 leading-relaxed text-fg-2">{p.resume}</p>
          <Photo src={p.cabinet.photos[0]!} className="squircle-2xl mt-8 aspect-[4/3] border border-line" />
          <p className="mt-2 text-xs text-fg-2">Photo déposée par le cabinet</p>
          <div className="squircle-2xl mt-6 border border-line bg-bg-soft p-4">
            <p className="text-sm font-semibold text-fg">
              Cette offre : {r.principal} {r.detail}
            </p>
            {r.estimation && <p className="mt-0.5 text-sm text-fg-2">{r.estimation}</p>}
            <p className="mt-1 text-sm text-fg-2">{p.repere}</p>
            <SourceSalaires className="mt-2" objet={p.objetRepere} />
          </div>
          <div className="mt-6 space-y-5">
            <Dates p={p} />
            <Partage />
          </div>
        </div>
        <ol>
          {p.blocs.map((b, k) => (
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
      </div>
    </section>
  )
}

function SectionCabinet({ p }: { p: PageOffre }) {
  const c = p.cabinet
  return (
    <section className="dark bg-background py-20 text-fg">
      <div className="container">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Le cabinet
          <span className="block text-white/55">Ce que dit sa fiche vérifiée.</span>
        </h2>
        <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="squircle-2xl grid gap-8 border border-line bg-bg-soft p-6 sm:grid-cols-2 md:p-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-fg-2">Adresse</p>
              <p className="mt-1 text-white">{c.adresse}</p>
              <p className="mt-1 text-sm text-fg-2">{c.acces}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-fg-2">Horaires du cabinet</p>
              <p className="mt-1 text-white">{c.horaires}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-fg-2">Équipe déclarée</p>
              <p className="mt-1 text-white">{c.equipe}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-fg-2">Plateau technique</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.plateau.map((x) => (
                  <Etiquette key={x} ton="sombre">
                    {x}
                  </Etiquette>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 sm:col-span-2">
              <span className="flex flex-wrap items-center gap-3">
                <FicheVerifiee sombre />
                <span className="text-xs text-fg-2">Déclaré par le cabinet, confirmé le {c.declareLe}</span>
              </span>
              <LienFiche sombre />
            </div>
          </div>
          <div className="squircle-2xl overflow-hidden border border-line">
            <CarteOffres
              className="h-72 lg:h-full lg:min-h-72"
              emprise={empriseAutour(p.o.lon, p.o.lat, 450)}
              actif="cabinet"
              points={[{ id: 'cabinet', lon: p.o.lon, lat: p.o.lat, etiquette: c.nom }]}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionPostuler({ p }: { p: PageOffre }) {
  return (
    <section className="container py-20">
      <div className="squircle-3xl grid gap-8 border border-line bg-bg-soft p-6 md:p-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">Ce poste vous intéresse ?</h2>
          <p className="mt-3 max-w-xl text-fg-2">{p.message}</p>
          <div className="mt-5 max-w-xl">
            <NoteCandidature />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <BoutonPostuler pleine />
          <BoutonAlerte />
        </div>
      </div>
    </section>
  )
}

function OffresProches({ p }: { p: PageOffre }) {
  return (
    <section className="container pb-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Offres proches</h2>
        <a className="inline-flex items-center gap-2 text-sm font-medium text-fg">
          {p.lienProches} <ArrowRight className="size-4" aria-hidden />
        </a>
      </div>
      <p className="mt-2 text-sm text-fg-2">Les plus proches de ce cabinet d’abord.</p>
      <ul className="mt-6 space-y-3 sm:hidden">
        {p.proches.map((o) => (
          <CarteOffre key={o.id} o={o} forme="ligne" />
        ))}
      </ul>
      <ul className="mt-6 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {p.proches.map((o) => (
          <CarteOffre key={o.id} o={o} />
        ))}
      </ul>
    </section>
  )
}

/**
 * Barre « Postuler » de mobile. En production elle est collée en bas d'écran
 * (`fixed inset-x-0 bottom-0`) ; dans la maquette elle est posée en fin de page,
 * pour ne pas couper la capture pleine page, et le héros porte son propre bouton.
 */
function BarrePostulerMobile({ p }: { p: PageOffre }) {
  const r = remuneration(p.o)
  return (
    <div className="border-t border-line bg-bg/95 px-4 pb-6 pt-3 lg:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{p.o.titre}</p>
          <p className="truncate text-xs tabular-nums text-fg-2">
            {r.principal} {r.detail}
          </p>
        </div>
        <a aria-label="Créer une alerte" className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-fg">
          <Bell className="size-5" aria-hidden />
        </a>
        <a className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground">
          <Send className="size-4" aria-hidden /> Postuler
        </a>
      </div>
    </div>
  )
}

function FicheOffre({ p }: { p: PageOffre }) {
  return (
    <>
      <main>
        <Hero p={p} />
        <SectionPoste p={p} />
        <SectionCabinet p={p} />
        <SectionPostuler p={p} />
        <OffresProches p={p} />
      </main>
      <BarrePostulerMobile p={p} />
    </>
  )
}

export function OffreAssistant() {
  return <FicheOffre p={PAGE_AD} />
}

export function OffreRemplacement() {
  return <FicheOffre p={PAGE_REMP} />
}
