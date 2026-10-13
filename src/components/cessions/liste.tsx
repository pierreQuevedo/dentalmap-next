/**
 * Liste des cessions de cabinet (`/annonces/cession/` et
 * `/annonces/cession/[departement]/`), dans le gabarit des listes Emploi :
 * en-tête sur fond doux, bascule « Liste | Carte » (`?vue=carte`), filtres en
 * colonne portés par l'URL, résultats, alerte sans compte.
 *
 * Tri : dans un département, distance au centre de sa commune la plus
 * peuplée, puis titre ; pour la France entière, faute de point d'origine, les
 * plus récentes d'abord, puis titre. Aucun tri payant ni score.
 */
import { ArrowDownWideNarrow, ChevronLeft, ChevronRight, List, Map as IconeCarte, Plus, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { FilAriane } from '@/components/annuaire/primitives'
import type { Emprise } from '@/lib/annuaire/emprise'
import { PAR_PAGE, chaineFiltres, compterParType, filtresActifs, prixCourt } from '@/lib/cessions/format'
import { DEPOSER_CESSION, LISTE_CESSIONS, cheminAnnonceCession, cheminDepartementCession } from '@/lib/cessions/routes'
import type { AnnonceResume, DepartementCession, FiltresCession } from '@/lib/cessions/types'
import { CarteSecteur, type PointAnnonce } from './carte'
import { CarteAnnonce } from './blocs'
import { FiltresCessions } from './filtres'
import { AlerteCessions } from './alerte'

type Props = {
  mode: 'liste' | 'carte'
  titre: string
  ariane: { libelle: string; href?: string }[]
  /** Annonces après filtres, dans l'ordre de tri. */
  annonces: AnnonceResume[]
  /** Annonces avant filtres, pour les compteurs par type. */
  toutes: AnnonceResume[]
  filtres: FiltresCession
  departements: DepartementCession[]
  departement: { code: string; nom: string; slug: string } | null
  /** Ville d'où la distance est mesurée ; `null` : tri par date. */
  origine: string | null
  emprise: Emprise
}

const nombre = (n: number) => `${n} annonce${n > 1 ? 's' : ''}`

function Vues({ mode, base, filtres }: { mode: 'liste' | 'carte'; base: string; filtres: FiltresCession }) {
  const b = (actif: boolean) =>
    `inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold sm:flex-none ${actif ? 'bg-fg text-bg shadow-sm' : 'text-fg hover:bg-bg-soft'}`
  return (
    <nav aria-label="Affichage des annonces" className="flex w-full rounded-full border border-line bg-bg p-1 sm:inline-flex sm:w-auto">
      <Link href={chemin(`${base}${chaineFiltres(filtres)}`)} aria-current={mode === 'liste' ? 'page' : undefined} className={b(mode === 'liste')} scroll={false}>
        <List className="size-4" aria-hidden /> Liste
      </Link>
      <Link href={chemin(`${base}${chaineFiltres(filtres, { vue: 'carte' })}`)} aria-current={mode === 'carte' ? 'page' : undefined} className={b(mode === 'carte')} scroll={false}>
        <IconeCarte className="size-4" aria-hidden /> Carte
      </Link>
    </nav>
  )
}

function Compteur({ total, origine }: { total: number; origine: string | null }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line pb-4">
      <p className="text-sm font-semibold text-fg">{nombre(total)}</p>
      {total > 1 && (
        <p className="text-sm text-fg-2">
          <ArrowDownWideNarrow className="mr-1.5 inline size-4 align-[-3px]" aria-hidden />
          {origine ? (
            <>
              <span className="font-medium text-fg">Les plus proches d’abord</span>, depuis {origine}
            </>
          ) : (
            <span className="font-medium text-fg">Les plus récentes d’abord</span>
          )}
        </p>
      )}
    </div>
  )
}

function EnTete({ titre, ariane, mode, base, filtres }: Pick<Props, 'titre' | 'ariane' | 'mode' | 'filtres'> & { base: string }) {
  return (
    <section className="border-b border-line bg-bg-soft">
      <div className="container py-8 md:py-12">
        <FilAriane segments={ariane} />
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">{titre}</h1>
            <p className="mt-2 text-fg-2">Cabinets, parts de société, patientèles et locaux, publiés par des praticiens vérifiés et relus par l’équipe.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={chemin(DEPOSER_CESSION)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-bg px-5 text-sm font-semibold text-fg hover:bg-bg-soft"
            >
              <Plus className="size-4" aria-hidden /> Déposer une annonce
            </Link>
            <Vues mode={mode} base={base} filtres={filtres} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Vide({ departement, filtres, base }: { departement: Props['departement']; filtres: FiltresCession; base: string }) {
  return (
    <div className="squircle-2xl mt-5 border border-dashed border-line-strong p-8 text-center">
      <p className="font-semibold text-fg">{filtresActifs(filtres) ? 'Aucune annonce ne répond à ces filtres.' : `Aucune annonce de cession${departement ? ` en ${departement.nom}` : ''} pour le moment.`}</p>
      <p className="mt-2 text-sm text-fg-2">Créez une alerte pour être prévenu(e) de la prochaine, ou élargissez la recherche.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm font-medium">
        {filtresActifs(filtres) && (
          <Link href={chemin(base)} className="text-fg underline underline-offset-4">
            Effacer les filtres
          </Link>
        )}
        {departement && (
          <Link href={chemin(LISTE_CESSIONS)} className="text-fg underline underline-offset-4">
            Toutes les cessions en France
          </Link>
        )}
      </div>
    </div>
  )
}

function Pagination({ page, pages, base, filtres }: { page: number; pages: number; base: string; filtres: FiltresCession }) {
  if (pages <= 1) return null
  const lien = (p: number) => chemin(`${base}${chaineFiltres(filtres, { page: p > 1 ? String(p) : undefined })}`)
  const b = 'inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-medium text-fg hover:bg-bg-soft'
  return (
    <nav aria-label="Pages" className="mt-6 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={lien(page - 1)} className={b} rel="prev">
          <ChevronLeft className="size-4" aria-hidden /> Précédentes
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-fg-2">
        Page {page} sur {pages}
      </span>
      {page < pages ? (
        <Link href={lien(page + 1)} className={b} rel="next">
          Suivantes <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}

export function ListeAnnonces({ mode, titre, ariane, annonces, toutes, filtres, departements, departement, origine, emprise }: Props) {
  const base = departement ? cheminDepartementCession(departement.slug) : LISTE_CESSIONS
  const comptes = compterParType(toutes)
  const cle = `${departement?.slug ?? 'france'}${chaineFiltres(filtres)}`
  const filtresProps = { departements, departementSlug: departement?.slug ?? null, filtres, comptes, vue: mode }
  const alerte = <AlerteCessions departementCode={departement?.code} departementNom={departement?.nom} types={filtres.types} />
  const actifs = (filtres.types.length ? 1 : 0) + (filtres.fauteuils ? 1 : 0) + (filtres.dispo ? 1 : 0) + (departement ? 1 : 0)

  const filtresRepliables = (idPrefixe: string, classe: string) => (
    <details className={`group relative ${classe}`}>
      <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-bg px-3.5 text-sm font-medium text-fg [&::-webkit-details-marker]:hidden">
        <SlidersHorizontal className="size-4" aria-hidden /> Filtres
        {actifs > 0 && <span className="grid size-5 place-items-center rounded-full bg-fg text-[11px] text-bg">{actifs}</span>}
      </summary>
      <div className="squircle-2xl absolute left-0 top-11 z-20 w-[min(20rem,calc(100vw-2rem))] border border-line bg-bg p-5 shadow-pop">
        <FiltresCessions key={cle} idPrefixe={idPrefixe} {...filtresProps} />
      </div>
    </details>
  )

  if (mode === 'carte') {
    const points: PointAnnonce[] = annonces.map((a) => ({
      id: a.id,
      lon: a.lon,
      lat: a.lat,
      etiquette: prixCourt(a.prix),
      href: cheminAnnonceCession(a.departementSlug, a.slug),
      titre: a.titre,
    }))
    const premiere = annonces[0]
    return (
      <main>
        <EnTete titre={titre} ariane={ariane} mode={mode} base={base} filtres={filtres} />
        <div className="border-b border-line">
          <div className="container py-4">{filtresRepliables('filtres-carte', '')}</div>
        </div>
        <div className="hidden lg:grid lg:grid-cols-[28rem_minmax(0,1fr)]">
          <div className="max-h-[44rem] overflow-y-auto border-r border-line px-6 py-6 xl:pl-10">
            <Compteur total={annonces.length} origine={origine} />
            {annonces.length ? (
              <ul className="mt-4 space-y-3">
                {annonces.map((a, i) => (
                  <CarteAnnonce key={a.id} a={a} forme="compacte" actif={i === 0} />
                ))}
              </ul>
            ) : (
              <Vide departement={departement} filtres={filtres} base={base} />
            )}
            <div className="[&_.alerte>div]:flex-col! [&_.alerte>div]:items-start!">{alerte}</div>
          </div>
          <CarteSecteur key={cle} className="h-full min-h-[44rem]" emprise={emprise} actif={premiere?.id} points={points} />
        </div>
        <div className="relative h-[42rem] lg:hidden">
          <CarteSecteur key={cle} className="size-full" emprise={emprise} actif={premiere?.id} points={points} mention={false} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-line bg-bg px-4 pb-5 pt-2 shadow-[0_-8px_28px_rgb(22_34_43/0.16)]">
            <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-line-strong" aria-hidden />
            <Compteur total={annonces.length} origine={origine} />
            {premiere && (
              <ul className="mt-3">
                <CarteAnnonce a={premiere} forme="compacte" actif />
              </ul>
            )}
            <Link
              href={chemin(`${base}${chaineFiltres(filtres)}`)}
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line text-sm font-medium text-fg"
            >
              <List className="size-4" aria-hidden /> Voir {annonces.length > 1 ? `les ${annonces.length} annonces` : 'l’annonce'} en liste
            </Link>
            <p className="mt-2 text-center text-[10px] text-fg-2">© OpenStreetMap, OpenMapTiles, OpenFreeMap</p>
          </div>
        </div>
        <p className="container py-6 text-xs text-fg-2">Les repères de la carte marquent le centre d’un secteur, jamais l’adresse du cabinet.</p>
      </main>
    )
  }

  const pages = Math.max(1, Math.ceil(annonces.length / PAR_PAGE))
  const page = Math.min(filtres.page, pages)
  const visibles = annonces.slice((page - 1) * PAR_PAGE, page * PAR_PAGE)
  return (
    <main>
      <EnTete titre={titre} ariane={ariane} mode={mode} base={base} filtres={filtres} />
      <div className="container grid gap-10 py-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12 lg:py-10">
        <aside className="hidden lg:block">
          <FiltresCessions key={cle} idPrefixe="filtres" {...filtresProps} />
        </aside>
        <div className="min-w-0">
          <div className="mb-5 lg:hidden">{filtresRepliables('filtres-mobile', '')}</div>
          <Compteur total={annonces.length} origine={origine} />
          {visibles.length ? (
            <ul className="mt-5 space-y-3">
              {visibles.map((a) => (
                <CarteAnnonce key={a.id} a={a} />
              ))}
            </ul>
          ) : (
            <Vide departement={departement} filtres={filtres} base={base} />
          )}
          <Pagination page={page} pages={pages} base={base} filtres={filtres} />
          {alerte}
        </div>
      </div>
    </main>
  )
}
