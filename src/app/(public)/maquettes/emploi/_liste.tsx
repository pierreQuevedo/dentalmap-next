/**
 * MAQUETTE. Pages de recherche par métier et lieu, gabarit retenu (B) :
 * en-tête sur fond doux, filtres en colonne, résultats pleine largeur, et un
 * sélecteur « Liste | Carte » pour passer en vue carte.
 *
 * - `liste` : `/emploi/assistant-dentaire/gironde/bordeaux`, vue liste.
 * - `liste-carte` : la même page en vue carte. Liste compacte et carte côte à
 *   côte sur grand écran ; sur mobile, la carte avec la liste en panneau bas.
 * - `liste-vide` : une commune sans offre (Saint-Émilion), servie en 200 avec
 *   `noindex, follow` (voir la metadata de la route).
 * - `departement` : `/emploi/assistant-dentaire/gironde`, avec les communes.
 *
 * Tri unique et affiché : par distance au centre de la commune, puis date.
 */
import type { ReactNode } from 'react'
import { ArrowDownWideNarrow, ArrowRight, Bell, ChevronDown, List, Map as IconeCarte, MapPin, SlidersHorizontal } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import type { Emprise } from '@/lib/annuaire/emprise'
import { CarteOffres, type PointOffre } from './_carte-offres'
import { AlerteEmail, CarteOffre, LienFicheMetier, ListeLiens, SalairesSecteurs, etiquetteCarte } from './_blocs'
import {
  COMMUNES_GIRONDE_AD,
  EMPRISE_BORDEAUX,
  EMPRISE_GIRONDE,
  EMPRISE_SE,
  OFFRES_BORDEAUX,
  OFFRES_GIRONDE,
  OFFRES_VOISINES_SE,
  SAINT_EMILION,
  type Offre,
} from './_donnees'

type Ariane = { libelle: string; href?: string }[]

const FILTRES = [
  { k: 'Contrat', v: 'CDI, CDD', actif: true },
  { k: 'Temps', v: 'Plein ou partiel' },
  { k: 'Distance', v: 'Commune seule' },
  { k: 'Salaire minimum', v: 'Aucun' },
  { k: 'Début', v: 'Toutes dates' },
  { k: 'Compétences', v: 'Toutes' },
]

/** Filtres en pastilles : vue carte sur grand écran, et toutes les vues sur mobile (un bouton et les filtres actifs). */
function FiltresBarre({ pastilles }: { pastilles?: boolean }) {
  return (
    <div>
      {pastilles && (
        <ul className="hidden flex-wrap gap-2 lg:flex">
          {FILTRES.map((f) => (
            <li key={f.k}>
              <button
                type="button"
                className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm ${f.actif ? 'border-fg bg-fg text-bg' : 'border-line bg-bg text-fg'}`}
              >
                <span className={f.actif ? 'text-bg/70' : 'text-fg-2'}>{f.k}</span> {f.v} <ChevronDown className="size-3.5 opacity-60" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2 lg:hidden">
        <button type="button" className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-bg px-3.5 text-sm font-medium text-fg">
          <SlidersHorizontal className="size-4" aria-hidden /> Filtres <span className="grid size-5 place-items-center rounded-full bg-fg text-[11px] text-bg">1</span>
        </button>
        {FILTRES.filter((f) => f.actif).map((f) => (
          <span key={f.k} className="inline-flex h-9 items-center rounded-full border border-fg bg-fg px-3.5 text-sm text-bg">
            {f.v}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Filtres en colonne, tous visibles. */
const CONTRATS_BX: [string, number, boolean][] = [
  ['CDI', 4, true],
  ['CDD', 2, true],
  ['Alternance', 3, false],
  ['Stage', 1, false],
]

/** Compteurs par contrat calculés sur les offres affichées. */
function contratsDe(offres: { contrat: string }[]): [string, number, boolean][] {
  return (['CDI', 'CDD', 'Alternance', 'Stage'] as const).map((k) => {
    const n = offres.filter((o) => o.contrat === k).length
    return [k, n, n > 0]
  })
}

function FiltresPanneau({ contrats = CONTRATS_BX }: { contrats?: [string, number, boolean][] }) {
  const groupe = 'border-b border-line py-5 first:pt-0'
  const titre = 'text-sm font-semibold text-fg'
  return (
    <form className="text-sm">
      <fieldset className={groupe}>
        <legend className={titre}>Contrat</legend>
        <ul className="mt-3 space-y-2">
          {contrats.map(([k, n, c]) => (
            <li key={k} className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2.5 text-fg">
                <span className={`grid size-4 place-items-center rounded border ${c ? 'border-fg bg-fg' : 'border-line-strong bg-bg'}`}>
                  {c && (
                    <svg viewBox="0 0 16 16" className="size-3 text-bg" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                      <path d="M3 8.5l3.5 3.5L13 5" />
                    </svg>
                  )}
                </span>
                {k}
              </span>
              <span className="tabular-nums text-fg-2">{n}</span>
            </li>
          ))}
        </ul>
      </fieldset>
      <fieldset className={groupe}>
        <legend className={titre}>Temps de travail</legend>
        <div className="mt-3 grid grid-cols-3 rounded-full bg-bg-soft p-1 text-center text-xs">
          {['Tous', 'Plein', 'Partiel'].map((t, i) => (
            <span key={t} className={`rounded-full py-1.5 ${i === 0 ? 'bg-bg font-medium text-fg shadow-sm' : 'text-fg-2'}`}>
              {t}
            </span>
          ))}
        </div>
      </fieldset>
      <fieldset className={groupe}>
        <legend className={`${titre} flex w-full justify-between`}>
          Distance <span className="font-normal text-fg-2">Commune seule</span>
        </legend>
        <div className="relative mt-4 h-1.5 rounded-full bg-bg-soft">
          <span className="absolute left-0 top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-geo bg-bg" />
        </div>
        <div className="mt-2 flex justify-between text-xs text-fg-2">
          <span>Commune</span>
          <span>30 km</span>
        </div>
      </fieldset>
      <fieldset className={groupe}>
        <legend className={titre}>Rémunération minimale</legend>
        <div className="mt-3 flex h-10 items-center justify-between rounded-lg border border-line px-3">
          <span className="tabular-nums text-fg">2 000 €</span>
          <span className="text-xs text-fg-2">brut par mois</span>
        </div>
      </fieldset>
      <fieldset className={groupe}>
        <legend className={titre}>Début</legend>
        <ul className="mt-3 space-y-2">
          {['Dès que possible', 'D’ici trois mois', 'Toutes dates'].map((t, i) => (
            <li key={t} className="flex items-center gap-2.5 text-fg">
              <span className={`grid size-4 place-items-center rounded-full border ${i === 2 ? 'border-fg' : 'border-line-strong'}`}>
                {i === 2 && <span className="size-2 rounded-full bg-fg" />}
              </span>
              {t}
            </li>
          ))}
        </ul>
      </fieldset>
      <fieldset className={groupe}>
        <legend className={titre}>Compétences</legend>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['Assistance au fauteuil', 'Implantologie', 'Orthodontie', 'Pédodontie', 'Radiologie', 'Stérilisation', 'Accueil'].map((t, i) => (
            <span key={t} className={`rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ${i === 1 ? 'bg-teal/10 text-teal ring-teal/30' : 'text-fg ring-line'}`}>
              {t}
            </span>
          ))}
        </div>
      </fieldset>
      <button type="button" className="mt-5 text-sm font-medium text-fg underline underline-offset-4">
        Effacer les filtres
      </button>
    </form>
  )
}

/** Le sélecteur de vue, bien visible dans l'en-tête. */
function Vues({ mode }: { mode: 'liste' | 'carte' }) {
  const b = (actif: boolean) =>
    `inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold sm:flex-none ${actif ? 'bg-fg text-bg shadow-sm' : 'text-fg'}`
  return (
    <div role="tablist" aria-label="Affichage des résultats" className="flex w-full rounded-full border border-line bg-bg p-1 sm:inline-flex sm:w-auto">
      <a role="tab" aria-selected={mode === 'liste'} className={b(mode === 'liste')}>
        <List className="size-4" aria-hidden /> Liste
      </a>
      <a role="tab" aria-selected={mode === 'carte'} className={b(mode === 'carte')}>
        <IconeCarte className="size-4" aria-hidden /> Carte
      </a>
    </div>
  )
}

function Compteur({ n, depuis }: { n: number; depuis: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line pb-4">
      <p className="text-sm font-semibold text-fg">{n} offres</p>
      <p className="text-sm text-fg-2">
        <ArrowDownWideNarrow className="mr-1.5 inline size-4 align-[-3px]" aria-hidden />
        <span className="font-medium text-fg">Les plus proches d’abord</span>, depuis {depuis}
      </p>
    </div>
  )
}

function AlerteLigne({ texte }: { texte: string }) {
  return (
    <div className="alerte squircle-2xl mt-6 flex flex-col gap-4 bg-bg-soft p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-3 text-sm text-fg">
        <Bell className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
        <span>{texte}</span>
      </p>
      <a className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground">Créer l’alerte</a>
    </div>
  )
}

/**
 * Cadrage mobile de la vue carte : le panneau bas couvre la moitié inférieure,
 * le centre est donc décalé vers le sud pour que les offres restent visibles.
 */
function empriseMobile(e: Emprise): Emprise {
  const d = (e.est - e.ouest) * Math.cos((((e.nord + e.sud) / 2) * Math.PI) / 180) * 0.45
  return { ...e, sud: e.sud - d, nord: e.nord - d }
}

const points = (offres: Offre[]): PointOffre[] => offres.map((o) => ({ id: o.id, lon: o.lon, lat: o.lat, etiquette: etiquetteCarte(o) }))

type Gabarit = {
  ariane: Ariane
  titre: string
  intro: string
  mode: 'liste' | 'carte'
  offres: Offre[]
  total: number
  depuis: string
  emprise: Emprise
  pointsCarte?: PointOffre[]
  actif?: string
  rayon?: { lon: number; lat: number; metres: number }
  /** Compteurs du filtre Contrat, sinon ceux de Bordeaux. */
  contrats?: [string, number, boolean][]
  /** En tête de la colonne de résultats : message et alerte d'une page vide. */
  avant?: ReactNode
  /** Sous les résultats, dans la colonne. */
  suite?: ReactNode
  /** Pleine largeur, sous la recherche. */
  apres?: ReactNode
}

function EnTete({ g }: { g: Gabarit }) {
  return (
    <section className="border-b border-line bg-bg-soft">
      <div className="container py-8 md:py-12">
        <FilAriane segments={g.ariane} />
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">{g.titre}</h1>
            <p className="mt-2 text-fg-2">{g.intro}</p>
          </div>
          <Vues mode={g.mode} />
        </div>
      </div>
    </section>
  )
}

function Recherche({ g }: { g: Gabarit }) {
  const pts = g.pointsCarte ?? points(g.offres)
  if (g.mode === 'liste') {
    return (
      <div className="container grid gap-10 py-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12 lg:py-10">
        <aside className="hidden lg:block">
          <FiltresPanneau contrats={g.contrats} />
        </aside>
        <div className="min-w-0">
          <div className="mb-5 lg:hidden">
            <FiltresBarre />
          </div>
          {g.avant}
          <Compteur n={g.total} depuis={g.depuis} />
          <ul className="mt-5 space-y-3">
            {g.offres.map((o) => (
              <CarteOffre key={o.id} o={o} forme="ligne" />
            ))}
          </ul>
          {g.suite}
        </div>
      </div>
    )
  }
  /* Vue carte. */
  return (
    <>
      <div className="border-b border-line">
        <div className="container py-4">
          <FiltresBarre pastilles />
        </div>
      </div>
      {/* Grand écran : liste compacte et carte côte à côte, la carte couvre toute la hauteur de la liste. */}
      <div className="hidden lg:grid lg:grid-cols-[28rem_minmax(0,1fr)]">
        <div className="border-r border-line px-6 py-6 xl:pl-10 [&_.alerte]:flex-col! [&_.alerte]:items-start!">
          {g.avant}
          <Compteur n={g.total} depuis={g.depuis} />
          <ul className="mt-4 space-y-3">
            {g.offres.map((o, i) => (
              <CarteOffre key={o.id} o={o} forme="compacte" actif={i === 0} />
            ))}
          </ul>
          {g.suite}
        </div>
        <CarteOffres className="h-full min-h-[44rem]" emprise={g.emprise} actif={g.actif ?? g.offres[0]?.id} points={pts} rayon={g.rayon} />
      </div>
      {/* Mobile : la carte, et la liste en panneau bas qui se tire vers le haut. */}
      <div className="relative h-[42rem] lg:hidden">
        <CarteOffres className="size-full" emprise={empriseMobile(g.emprise)} actif={g.actif ?? g.offres[0]?.id} points={pts} rayon={g.rayon} mention={false} />
        <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-line bg-bg px-4 pb-5 pt-2 shadow-[0_-8px_28px_rgb(22_34_43/0.16)]">
          <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-line-strong" aria-hidden />
          <Compteur n={g.total} depuis={g.depuis} />
          <ul className="mt-3">
            {g.offres.slice(0, 1).map((o) => (
              <CarteOffre key={o.id} o={o} forme="compacte" actif />
            ))}
          </ul>
          <a className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line text-sm font-medium text-fg">
            <List className="size-4" aria-hidden /> Voir les {g.total} offres en liste
          </a>
          <p className="mt-2 text-center text-[10px] text-fg-2">© OpenStreetMap, OpenMapTiles, OpenFreeMap</p>
        </div>
      </div>
    </>
  )
}

function Gabarit({ g }: { g: Gabarit }) {
  return (
    <main>
      <EnTete g={g} />
      <Recherche g={g} />
      {g.apres}
    </main>
  )
}

/* Assistant(e) dentaire à Bordeaux. */

const ARIANE_BX: Ariane = [
  { libelle: 'Emploi', href: '/emploi/' },
  { libelle: 'Assistant(e) dentaire', href: '/emploi/assistant-dentaire/' },
  { libelle: 'Gironde', href: '/emploi/assistant-dentaire/gironde/' },
  { libelle: 'Bordeaux' },
]

function BasDePage({ voisines }: { voisines: { nom: string; n: number; detail?: string }[] }) {
  return (
    <>
      <section className="border-t border-line">
        <div className="container grid gap-14 py-16 md:py-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Salaire moyen d’un(e) assistant(e) dentaire</h2>
            <p className="mt-2 text-fg-2">Selon le secteur. Pour situer les offres ci-dessus.</p>
            <div className="mt-6">
              <SalairesSecteurs metiers={['Assistant(e) dentaire']} />
            </div>
          </div>
          <AlerteEmail detail="Assistant(e) dentaire à Bordeaux et dans un rayon de 10 km. Un email par semaine au plus, et un lien de désinscription dans chaque envoi." />
        </div>
      </section>
      <section className="border-t border-line bg-bg-soft">
        <div className="container grid gap-12 py-16 lg:grid-cols-2 lg:gap-16">
          <ListeLiens titre="Assistant(e) dentaire autour de Bordeaux" liens={voisines} />
          <ListeLiens
            titre="Autres offres à Bordeaux"
            liens={[
              { nom: 'Secrétaire ou assistant(e) de gestion', n: 5 },
              { nom: 'Prothésiste dentaire', n: 2 },
              { nom: 'Aide dentaire', n: 3 },
              { nom: 'Alternance', n: 6 },
              { nom: 'Remplacements', n: 4 },
              { nom: 'Collaborations', n: 3 },
            ]}
          />
        </div>
        <div className="container border-t border-line py-6">
          <LienFicheMetier />
        </div>
      </section>
    </>
  )
}

const VOISINES_BX = [
  { nom: 'Mérignac', n: 5, detail: '6 km' },
  { nom: 'Pessac', n: 4, detail: '7 km' },
  { nom: 'Talence', n: 3, detail: '4 km' },
  { nom: 'Le Bouscat', n: 2, detail: '3 km' },
  { nom: 'Bègles', n: 2, detail: '4 km' },
  { nom: 'Cenon', n: 1, detail: '4 km' },
]

function gabaritBordeaux(mode: 'liste' | 'carte'): Gabarit {
  return {
    ariane: ARIANE_BX,
    titre: 'Offres d’assistant(e) dentaire à Bordeaux',
    intro: `${OFFRES_BORDEAUX.length} offres d’assistant(e) dentaire à Bordeaux (Gironde), publiées par des cabinets vérifiés auprès des registres officiels. La rémunération est affichée sur chaque offre.`,
    mode,
    offres: OFFRES_BORDEAUX,
    total: OFFRES_BORDEAUX.length,
    depuis: 'le centre de Bordeaux',
    emprise: EMPRISE_BORDEAUX,
    suite: (
      <>
        <p className="mt-6 text-sm text-fg-2">Toutes les offres de Bordeaux sont affichées. Élargir à 10 km ajoute 17 offres, à Mérignac, Pessac, Talence et alentour.</p>
        <AlerteLigne texte="Soyez prévenu(e) des prochaines offres d’assistant(e) dentaire à Bordeaux, par email et sans compte." />
      </>
    ),
    apres: <BasDePage voisines={VOISINES_BX} />,
  }
}

export function Liste() {
  return <Gabarit g={gabaritBordeaux('liste')} />
}

export function ListeCarte() {
  return <Gabarit g={gabaritBordeaux('carte')} />
}

/* Commune sans offre : Saint-Émilion. */

export function ListeVide() {
  return (
    <Gabarit
      g={{
        ariane: [
          { libelle: 'Emploi', href: '/emploi/' },
          { libelle: 'Assistant(e) dentaire', href: '/emploi/assistant-dentaire/' },
          { libelle: 'Gironde', href: '/emploi/assistant-dentaire/gironde/' },
          { libelle: 'Saint-Émilion' },
        ],
        titre: 'Aucune offre d’assistant(e) dentaire à Saint-Émilion pour le moment',
        intro: 'Aucun cabinet de Saint-Émilion n’a d’offre en ligne aujourd’hui. Les offres les plus proches sont listées ci-dessous, par distance depuis Saint-Émilion.',
        mode: 'liste',
        offres: OFFRES_VOISINES_SE,
        total: OFFRES_VOISINES_SE.length,
        depuis: 'Saint-Émilion',
        emprise: EMPRISE_SE,
        contrats: contratsDe(OFFRES_VOISINES_SE),
        avant: (
          <div className="squircle-2xl mb-8 border border-teal/25 bg-teal/[0.06] p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-fg">
              <Bell className="size-4 text-teal" aria-hidden /> Être prévenu(e) dès qu’une offre paraît
            </p>
            <p className="mt-1 text-sm text-fg-2">Assistant(e) dentaire à Saint-Émilion et dans un rayon de 15 km. Sans compte.</p>
            <div className="mt-4">
              <AlerteEmail compacte />
            </div>
          </div>
        ),
        suite: (
          <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-fg-2">
            Élargir la recherche :
            {['25 km, 6 offres', '40 km, 19 offres'].map((t) => (
              <a key={t} className="inline-flex h-8 items-center rounded-full border border-line px-3 text-fg">
                {t}
              </a>
            ))}
          </p>
        ),
        rayon: { lon: SAINT_EMILION.lon, lat: SAINT_EMILION.lat, metres: 15000 },
        apres: (
          <section className="border-t border-line bg-bg-soft">
            <div className="container grid gap-12 py-16 lg:grid-cols-2 lg:gap-16">
              <ListeLiens
                titre="Assistant(e) dentaire autour de Saint-Émilion"
                liens={[
                  { nom: 'Libourne', n: 2, detail: '7 km' },
                  { nom: 'Castillon-la-Bataille', n: 1, detail: '11 km' },
                  { nom: 'Coutras', n: 1, detail: '18 km' },
                  { nom: 'Saint-André-de-Cubzac', n: 2, detail: '27 km' },
                ]}
              />
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-2">Aller plus loin</h2>
                <ul className="mt-3 divide-y divide-line border-y border-line">
                  {[
                    { t: 'Assistant(e) dentaire en Gironde', d: '46 offres' },
                    { t: 'Assistant(e) dentaire en France', d: '1 284 offres' },
                    { t: 'Alternance en Gironde', d: '14 offres' },
                  ].map((l) => (
                    <li key={l.t}>
                      <a className="flex items-center justify-between gap-4 py-2.5 text-fg hover:underline">
                        <span className="min-w-0">{l.t}</span>
                        <span className="inline-flex shrink-0 items-center gap-2 text-sm text-fg-2">
                          {l.d} <ArrowRight className="size-3.5" aria-hidden />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            <div className="container flex flex-wrap items-center justify-between gap-4 border-t border-line py-6">
              <LienFicheMetier />
              <p className="inline-flex items-center gap-1.5 text-xs text-fg-2">
                <MapPin className="size-3.5 text-geo" aria-hidden /> Distances à vol d’oiseau depuis le centre de Saint-Émilion
              </p>
            </div>
          </section>
        ),
      }}
    />
  )
}

/* Département : Gironde. */

export function Departement() {
  const top = COMMUNES_GIRONDE_AD.slice(0, 6)
  return (
    <Gabarit
      g={{
        ariane: [
          { libelle: 'Emploi', href: '/emploi/' },
          { libelle: 'Assistant(e) dentaire', href: '/emploi/assistant-dentaire/' },
          { libelle: 'Gironde' },
        ],
        titre: 'Offres d’assistant(e) dentaire en Gironde',
        intro: '46 offres d’assistant(e) dentaire dans 25 communes de Gironde, publiées par des cabinets et centres de santé vérifiés auprès des registres officiels.',
        mode: 'liste',
        offres: OFFRES_GIRONDE,
        total: 46,
        depuis: 'Bordeaux, chef-lieu du département',
        emprise: EMPRISE_GIRONDE,
        avant: (
          <div className="mb-6">
            <p className="text-sm font-semibold text-fg">Par commune</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {top.map((c) => (
                <li key={c.nom}>
                  <a className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-bg px-3.5 text-sm text-fg">
                    {c.nom} <span className="tabular-nums text-fg-2">{c.n}</span>
                  </a>
                </li>
              ))}
              <li>
                <a className="inline-flex h-9 items-center gap-1.5 px-2 text-sm font-medium text-fg underline underline-offset-4">Toutes les communes</a>
              </li>
            </ul>
          </div>
        ),
        suite: (
          <>
            <a className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line text-sm font-medium text-fg">
              Afficher les offres suivantes <ArrowRight className="size-4" aria-hidden />
            </a>
            <AlerteLigne texte="Soyez prévenu(e) des prochaines offres d’assistant(e) dentaire en Gironde, par email et sans compte." />
          </>
        ),
        apres: (
          <>
            <section className="border-t border-line">
              <div className="container py-16">
                <ListeLiens titre="Les communes de Gironde avec des offres" liens={COMMUNES_GIRONDE_AD} colonnes={3} />
              </div>
            </section>
            <section className="border-t border-line bg-bg-soft">
              <div className="container grid gap-12 py-16 lg:grid-cols-2 lg:gap-16">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Salaire moyen d’un(e) assistant(e) dentaire</h2>
                  <div className="mt-6">
                    <SalairesSecteurs metiers={['Assistant(e) dentaire']} />
                  </div>
                </div>
                <ListeLiens
                  titre="Autres offres en Gironde"
                  liens={[
                    { nom: 'Secrétaire ou assistant(e) de gestion', n: 12 },
                    { nom: 'Prothésiste dentaire', n: 9 },
                    { nom: 'Aide dentaire', n: 7 },
                    { nom: 'Alternance', n: 14 },
                    { nom: 'Remplacements', n: 11 },
                    { nom: 'Collaborations', n: 8 },
                  ]}
                />
              </div>
              <div className="container border-t border-line py-6">
                <LienFicheMetier />
              </div>
            </section>
          </>
        ),
      }}
    />
  )
}
