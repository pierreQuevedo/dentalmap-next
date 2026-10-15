/**
 * Liste des cessions de cabinet (`/annonces/cession/` et
 * `/annonces/cession/[departement]/`), dans le gabarit des listes Emploi :
 * en-tête sur fond doux, filtres en colonne portés par l'URL, résultats,
 * alerte sans compte. La vue carte reprend la mise en page de l'annuaire :
 * la liste à gauche, la carte collée à droite. La bascule « Liste | Carte »
 * (`?vue=carte`) et les filtres vivent aussi dans une barre flottante en bas
 * de l'écran, comme dans l'annuaire : voir `BarreCessions`.
 *
 * Tri : dans un département, distance au centre de sa commune la plus
 * peuplée, puis titre ; pour la France entière, faute de point d'origine, les
 * plus récentes d'abord, puis titre. Aucun tri payant ni score.
 */
import { ArrowDownWideNarrow, ChevronLeft, ChevronRight, List, Map as IconeCarte, Plus } from 'lucide-react'
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
import { BarreCessions, ID_VUES_EN_TETE } from './barre'

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

function Vues({ mode, base, filtres, dansBarre = false }: { mode: 'liste' | 'carte'; base: string; filtres: FiltresCession; dansBarre?: boolean }) {
  const b = (actif: boolean) =>
    `inline-flex h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold ${dansBarre ? 'px-4' : 'flex-1 px-5 sm:flex-none'} ${actif ? 'bg-fg text-bg shadow-sm' : 'text-fg hover:bg-bg-soft'}`
  return (
    <nav
      aria-label="Affichage des annonces"
      id={dansBarre ? undefined : ID_VUES_EN_TETE}
      className={dansBarre ? 'flex gap-1' : 'hidden rounded-full border border-line bg-bg p-1 lg:inline-flex'}
    >
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

/** Le bouton de dépôt, sous le sous-titre. */
function Deposer() {
  return (
    <Link
      href={chemin(DEPOSER_CESSION)}
      className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-bg px-5 text-sm font-semibold text-fg hover:bg-bg-soft sm:w-auto"
    >
      <Plus className="size-4" aria-hidden /> Déposer une annonce
    </Link>
  )
}

const SOUS_TITRE = 'Cabinets, parts de société, patientèles et locaux, publiés par des praticiens vérifiés et relus par l’équipe.'

function EnTete({ titre, ariane, mode, base, filtres }: Pick<Props, 'titre' | 'ariane' | 'mode' | 'filtres'> & { base: string }) {
  return (
    <section className="border-b border-line bg-bg-soft">
      <div className="container py-8 md:py-12">
        <FilAriane segments={ariane} />
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">{titre}</h1>
            <p className="mt-2 text-fg-2">{SOUS_TITRE}</p>
            <Deposer />
          </div>
          <Vues mode={mode} base={base} filtres={filtres} />
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

  const barre = (
    <BarreCessions
      vues={<Vues mode={mode} base={base} filtres={filtres} dansBarre />}
      filtres={<FiltresCessions key={cle} idPrefixe="filtres-barre" {...filtresProps} />}
      actifs={actifs}
    />
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
    /*
     * La grille de l'annuaire : liste à gauche, qui défile avec la page, carte
     * collée sous l'en-tête à droite, jusqu'au bas de la liste. Sous `lg`, la
     * carte prend tout l'écran sous l'en-tête, la barre flottante par-dessus.
     */
    return (
      <>
        <main className="grid grid-cols-1 pb-28 lg:grid-cols-[9fr_11fr]">
          <section className="px-5 pt-8 max-lg:hidden md:px-10 lg:col-start-1 xl:px-12">
            <FilAriane segments={ariane} />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-fg md:text-3xl">{titre}</h1>
            <p className="mt-2 text-fg-2">{SOUS_TITRE}</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <Deposer />
              <Vues mode={mode} base={base} filtres={filtres} />
            </div>
            <div className="mt-8">
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
              {alerte}
              <p className="mt-6 text-xs text-fg-2">Les repères de la carte marquent le centre d’un secteur, jamais l’adresse du cabinet.</p>
            </div>
          </section>
          <aside className="max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-20 max-lg:z-30 lg:col-start-2 lg:row-start-1 lg:border-l lg:border-line">
            {/* `top-20` est la hauteur de l'en-tête collant, cinq rem. */}
            <div className="size-full lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
              <CarteSecteur key={cle} className="size-full" emprise={emprise} actif={premiere?.id} points={points} />
            </div>
          </aside>
        </main>
        {barre}
      </>
    )
  }

  const pages = Math.max(1, Math.ceil(annonces.length / PAR_PAGE))
  const page = Math.min(filtres.page, pages)
  const visibles = annonces.slice((page - 1) * PAR_PAGE, page * PAR_PAGE)
  return (
    <main className="pb-24">
      <EnTete titre={titre} ariane={ariane} mode={mode} base={base} filtres={filtres} />
      {barre}
      <div className="container grid gap-10 py-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12 lg:py-10">
        <aside className="hidden lg:block">
          <FiltresCessions key={cle} idPrefixe="filtres" {...filtresProps} />
        </aside>
        <div className="min-w-0">
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
