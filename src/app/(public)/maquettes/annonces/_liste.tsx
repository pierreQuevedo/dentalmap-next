/**
 * MAQUETTE. Liste des cessions de cabinet (`/annonces/cession`, où mène
 * aussi `/annonces`), dans le gabarit B validé pour l'emploi : en-tête sur
 * fond doux, bascule « Liste | Carte », filtres en colonne, résultats.
 *
 * - `liste` : vue liste.
 * - `liste-carte` : la même page en vue carte, liste compacte à côté.
 *
 * Tri affiché : distance au centre de la ville choisie, comme le reste du
 * site. [À valider : tri d'une liste départementale d'annonces.]
 */
import { ArrowDownWideNarrow, Bell, ChevronDown, List, Map as IconeCarte, Plus, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { FilAriane } from '@/components/annuaire/primitives'
import { empriseAutour } from '@/lib/annuaire/emprise'
import { CarteSecteur, type PointAnnonce } from './_carte'
import { AValider, CarteAnnonce } from './_blocs'
import { ANNONCES, EMPRISE_GIRONDE_ANNONCES, TYPES, etiquettePrix } from './_donnees'

const ARIANE = [{ libelle: 'Accueil', href: '/' }, { libelle: 'Annonces', href: '/annonces/' }, { libelle: 'Cessions de cabinet', href: '/annonces/cession/' }, { libelle: 'Gironde' }]

const FILTRES = [
  { k: 'Département', v: 'Gironde', actif: true },
  { k: 'Type', v: 'Tous' },
  { k: 'Fauteuils', v: 'Tous' },
  { k: 'Disponibilité', v: 'Toutes' },
]

function FiltresBarre({ pastilles }: { pastilles?: boolean }) {
  return (
    <div>
      {pastilles && (
        <ul className="hidden flex-wrap gap-2 lg:flex">
          {FILTRES.map((f) => (
            <li key={f.k}>
              <button type="button" className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm ${f.actif ? 'border-fg bg-fg text-bg' : 'border-line bg-bg text-fg'}`}>
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
        <span className="inline-flex h-9 items-center rounded-full border border-fg bg-fg px-3.5 text-sm text-bg">Gironde</span>
      </div>
    </div>
  )
}

function Case({ coche }: { coche?: boolean }) {
  return (
    <span className={`grid size-4 place-items-center rounded border ${coche ? 'border-fg bg-fg' : 'border-line-strong bg-bg'}`}>
      {coche && (
        <svg viewBox="0 0 16 16" className="size-3 text-bg" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M3 8.5l3.5 3.5L13 5" />
        </svg>
      )}
    </span>
  )
}

function FiltresPanneau() {
  const groupe = 'border-b border-line py-5 first:pt-0'
  const titre = 'text-sm font-semibold text-fg'
  return (
    <form className="text-sm">
      <fieldset className={groupe}>
        <legend className={titre}>Département</legend>
        <div className="mt-3 flex h-10 items-center justify-between rounded-lg border border-line px-3">
          <span className="text-fg">Gironde (33)</span>
          <ChevronDown className="size-4 text-fg-2" aria-hidden />
        </div>
      </fieldset>
      <fieldset className={groupe}>
        <legend className={titre}>Type de cession</legend>
        <ul className="mt-3 space-y-2">
          {TYPES.map((t) => (
            <li key={t} className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2.5 text-fg">
                <Case coche />
                {t}
              </span>
              <span className="tabular-nums text-fg-2">{ANNONCES.filter((a) => a.type === t).length}</span>
            </li>
          ))}
        </ul>
      </fieldset>
      <fieldset className={groupe}>
        <legend className={titre}>Fauteuils</legend>
        <div className="mt-3 grid grid-cols-4 rounded-full bg-bg-soft p-1 text-center text-xs">
          {['Tous', '1', '2', '3 et +'].map((t, i) => (
            <span key={t} className={`rounded-full py-1.5 ${i === 0 ? 'bg-bg font-medium text-fg shadow-sm' : 'text-fg-2'}`}>
              {t}
            </span>
          ))}
        </div>
      </fieldset>
      <fieldset className={groupe}>
        <legend className={titre}>Disponibilité</legend>
        <ul className="mt-3 space-y-2">
          {['Immédiate', 'D’ici six mois', 'Toutes dates'].map((t, i) => (
            <li key={t} className="flex items-center gap-2.5 text-fg">
              <span className={`grid size-4 place-items-center rounded-full border ${i === 2 ? 'border-fg' : 'border-line-strong'}`}>{i === 2 && <span className="size-2 rounded-full bg-fg" />}</span>
              {t}
            </li>
          ))}
        </ul>
      </fieldset>
      <button type="button" className="mt-5 text-sm font-medium text-fg underline underline-offset-4">
        Effacer les filtres
      </button>
    </form>
  )
}

function Vues({ mode }: { mode: 'liste' | 'carte' }) {
  const b = (actif: boolean) => `inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold sm:flex-none ${actif ? 'bg-fg text-bg shadow-sm' : 'text-fg'}`
  return (
    <div role="tablist" aria-label="Affichage des annonces" className="flex w-full rounded-full border border-line bg-bg p-1 sm:inline-flex sm:w-auto">
      <a role="tab" aria-selected={mode === 'liste'} className={b(mode === 'liste')}>
        <List className="size-4" aria-hidden /> Liste
      </a>
      <a role="tab" aria-selected={mode === 'carte'} className={b(mode === 'carte')}>
        <IconeCarte className="size-4" aria-hidden /> Carte
      </a>
    </div>
  )
}

function Compteur() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line pb-4">
      <p className="text-sm font-semibold text-fg">{ANNONCES.length} annonces</p>
      <p className="text-sm text-fg-2">
        <ArrowDownWideNarrow className="mr-1.5 inline size-4 align-[-3px]" aria-hidden />
        <span className="font-medium text-fg">Les plus proches d’abord</span>, depuis Bordeaux
        <AValider />
      </p>
    </div>
  )
}

function Alerte() {
  return (
    <div className="alerte squircle-2xl mt-6 flex flex-col gap-4 bg-bg-soft p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-3 text-sm text-fg">
        <Bell className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
        <span>Soyez prévenu(e) des prochaines cessions en Gironde, par email et sans compte.</span>
      </p>
      <a className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground">Créer l’alerte</a>
    </div>
  )
}

function EnTete({ mode }: { mode: 'liste' | 'carte' }) {
  return (
    <section className="border-b border-line bg-bg-soft">
      <div className="container py-8 md:py-12">
        <FilAriane segments={ARIANE} />
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">Cessions de cabinet en Gironde</h1>
            <p className="mt-2 text-fg-2">Cabinets, parts de société, patientèles et locaux, publiés par des praticiens vérifiés.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={chemin('/maquettes/annonces/deposer/')} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-bg px-5 text-sm font-semibold text-fg hover:bg-bg-soft">
              <Plus className="size-4" aria-hidden /> Déposer une annonce
            </Link>
            <Vues mode={mode} />
          </div>
        </div>
        <p className="mt-4 text-xs text-fg-2">Annonces d’exemple : secteurs, montants et dates inventés.</p>
      </div>
    </section>
  )
}

const points: PointAnnonce[] = ANNONCES.map((a) => ({ id: a.id, lon: a.lon, lat: a.lat, etiquette: etiquettePrix(a) }))

export function ListeAnnonces({ mode = 'liste' }: { mode?: 'liste' | 'carte' }) {
  return (
    <main>
      <EnTete mode={mode} />
      {mode === 'liste' ? (
        <div className="container grid gap-10 py-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12 lg:py-10">
          <aside className="hidden lg:block">
            <FiltresPanneau />
          </aside>
          <div className="min-w-0">
            <div className="mb-5 lg:hidden">
              <FiltresBarre />
            </div>
            <Compteur />
            <ul className="mt-5 space-y-3">
              {ANNONCES.map((a) => (
                <CarteAnnonce key={a.id} a={a} />
              ))}
            </ul>
            <Alerte />
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-line">
            <div className="container py-4">
              <FiltresBarre pastilles />
            </div>
          </div>
          <div className="hidden lg:grid lg:grid-cols-[28rem_minmax(0,1fr)]">
            <div className="border-r border-line px-6 py-6 xl:pl-10 [&_.alerte]:flex-col! [&_.alerte]:items-start!">
              <Compteur />
              <ul className="mt-4 space-y-3">
                {ANNONCES.map((a, i) => (
                  <CarteAnnonce key={a.id} a={a} forme="compacte" actif={i === 0} />
                ))}
              </ul>
              <Alerte />
            </div>
            <CarteSecteur className="h-full min-h-[44rem]" emprise={EMPRISE_GIRONDE_ANNONCES} actif={ANNONCES[0]!.id} points={points} />
          </div>
          <div className="relative h-[42rem] lg:hidden">
            <CarteSecteur className="size-full" emprise={empriseAutour(-0.6, 44.72, 16000)} actif={ANNONCES[0]!.id} points={points} mention={false} />
            <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-line bg-bg px-4 pb-5 pt-2 shadow-[0_-8px_28px_rgb(22_34_43/0.16)]">
              <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-line-strong" aria-hidden />
              <Compteur />
              <ul className="mt-3">
                <CarteAnnonce a={ANNONCES[0]!} forme="compacte" actif />
              </ul>
              <a className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line text-sm font-medium text-fg">
                <List className="size-4" aria-hidden /> Voir les {ANNONCES.length} annonces en liste
              </a>
              <p className="mt-2 text-center text-[10px] text-fg-2">© OpenStreetMap, OpenMapTiles, OpenFreeMap</p>
            </div>
          </div>
        </>
      )}
      {mode === 'carte' && <p className="container py-6 text-xs text-fg-2">Les repères de la carte marquent le centre d’un secteur, jamais l’adresse du cabinet.</p>}
    </main>
  )
}
