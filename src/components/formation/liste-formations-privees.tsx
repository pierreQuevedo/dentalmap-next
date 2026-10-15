/**
 * Liste des formations privées (`/formation/formations-privees`), retenue le
 * 13 octobre 2026 : le gabarit des pages Emploi (en-tête sur fond doux,
 * filtres en colonne, sessions en lignes datées), en vue unique sans carte,
 * avec les pastilles de familles de la rubrique Formation. Tant qu'aucune
 * formation n'est publiée, la page garde l'état d'attente de `ListeFormations`.
 *
 * Ordre et filtres : `filtrerEtTrier` (`src/lib/formation/privee-liste.ts`).
 */
import Link from 'next/link'
import { Bell, SlidersHorizontal, X } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { chemin } from '@/lib/navigation'
import { Balisage, filAriane } from '@/lib/seo/jsonld'
import { nomRegion } from '@/lib/formation/privee'
import { CHOIX_FORMAT, TRANCHES_DUREE, enTheme, filtrerEtTrier, lireFiltres, nombreFiltres, requeteFiltres, type FiltresPrivees, type FormationPriveeVue } from '@/lib/formation/privee-liste'
import { resoudreLieu } from '@/lib/formation/filtre-lieu'
import { getDepartementParCode } from '@/lib/annuaire/queries'
import type { ParamsLieu } from './liste-formations'
import { AlerteFormations } from './alerte-formations'
import { ARIANE, BASE_PRIVEES, LigneSession } from './blocs-formation-privee'
import { FiltresFormationsPrivees } from './filtres-formations-privees'

const FAMILLES = [
  { titre: 'Écoles de prothèse dentaire', href: '/formation/ecoles-de-prothese/' },
  { titre: 'Facultés d’odontologie', href: '/formation/facultes-odontologie/' },
  { titre: 'Formations privées', href: BASE_PRIVEES, actif: true },
]

export type ListeFormationsPriveesProps = {
  /** Les formations retenues, déjà filtrées et ordonnées. */
  formations: FormationPriveeVue[]
  filtres: FiltresPrivees
  /** Le lieu de la barre de recherche, résolu, et ses paramètres d'URL bruts. */
  lieu: { libelle: string; dans: string } | null
  paramsLieu: Record<string, string>
  /** Adresse de la liste et des fiches (`/formation/formations-privees/`, ou celle de la démonstration). */
  base?: string
}

/** Les filtres actifs, chacun avec l'adresse de la liste sans lui. */
function actifs(f: FiltresPrivees, paramsLieu: Record<string, string>, base: string) {
  const sans = (g: Partial<FiltresPrivees>) => chemin(`${base}${requeteFiltres({ ...f, ...g }, paramsLieu)}`)
  return [
    ...f.themes.map((t) => ({ libelle: t, href: sans({ themes: f.themes.filter((x) => x !== t) }) })),
    ...f.publics.map((p) => ({ libelle: p, href: sans({ publics: f.publics.filter((x) => x !== p) }) })),
    ...(f.format ? [{ libelle: CHOIX_FORMAT.find((c) => c.cle === f.format)!.libelle, href: sans({ format: null }) }] : []),
    ...(f.zone ? [{ libelle: nomRegion(f.zone), href: sans({ zone: null }) }] : []),
    ...f.durees.map((d) => ({ libelle: TRANCHES_DUREE.find((t) => t.cle === d)!.libelle, href: sans({ durees: f.durees.filter((x) => x !== d) }) })),
    ...f.prises.map((p) => ({ libelle: p, href: sans({ prises: f.prises.filter((x) => x !== p) }) })),
  ]
}

export function ListeFormationsPrivees({ formations, filtres, lieu, paramsLieu, base = BASE_PRIVEES }: ListeFormationsPriveesProps) {
  const cle = requeteFiltres(filtres, paramsLieu)
  const chips = actifs(filtres, paramsLieu, base)
  const n = nombreFiltres(filtres)
  const theme = filtres.themes.length === 1 ? filtres.themes[0]! : null
  const segments = ARIANE.map((s) => ({ nom: s.libelle, chemin: s.href }))
  const filtresForm = (id: string) => <FiltresFormationsPrivees action={base} filtres={filtres} lieu={paramsLieu} cle={cle} id={id} />

  return (
    <main>
      <Balisage donnees={filAriane(segments)} />
      <section className="border-b border-line bg-bg-soft">
        <div className="container py-8 md:py-12">
          <FilAriane segments={ARIANE.map((s, i) => (i < ARIANE.length - 1 ? s : { libelle: s.libelle }))} />
          <div className="mt-4">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">Formations privées</h1>
              <p className="mt-2 text-fg-2">Les prochaines sessions de formation continue, sur place ou en ligne.</p>
            </div>
            <nav aria-label="Familles de formation" className="mt-6 flex flex-wrap items-center gap-2">
              <Link href={chemin('/formation/')} className="rounded-full border border-line bg-bg px-4 py-2 text-sm font-medium text-fg hover:bg-bg-soft">
                Toutes
              </Link>
              {FAMILLES.map((f) => (
                <Link
                  key={f.href}
                  href={chemin(f.href)}
                  aria-current={f.actif ? 'page' : undefined}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${f.actif ? 'border-fg bg-fg text-bg' : 'border-line bg-bg text-fg hover:bg-bg-soft'}`}
                >
                  {f.titre}
                </Link>
              ))}
              {lieu && (
                <Link
                  href={chemin(`${base}${requeteFiltres(filtres)}`)}
                  className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-2 text-sm font-medium text-teal ring-1 ring-inset ring-teal/30 hover:bg-teal/15"
                >
                  {lieu.libelle}
                  <X className="size-3.5" aria-hidden />
                  <span className="sr-only">Retirer le lieu</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </section>
      <div className="container grid gap-10 py-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12 lg:py-10">
        <aside className="hidden lg:block" aria-label="Filtres">
          {filtresForm('filtres')}
        </aside>
        <div className="min-w-0">
          <details className="group mb-5 lg:hidden">
            <summary className="flex cursor-pointer list-none flex-wrap gap-2 [&::-webkit-details-marker]:hidden">
              <span className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-bg px-3.5 text-sm font-medium text-fg">
                <SlidersHorizontal className="size-4" aria-hidden /> Filtres
                {n > 0 && <span className="grid size-5 place-items-center rounded-full bg-fg text-[11px] text-bg">{n}</span>}
              </span>
            </summary>
            <div className="squircle-2xl mt-3 border border-line bg-bg p-5">{filtresForm('filtres-mobile')}</div>
          </details>
          {chips.length > 0 && (
            <div className="-mt-3 mb-5 flex flex-wrap gap-2 lg:hidden">
              {chips.map((c) => (
                <Link key={c.libelle} href={c.href} scroll={false} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-fg bg-fg px-3.5 text-sm text-bg">
                  {c.libelle}
                  <X className="size-3.5" aria-hidden />
                  <span className="sr-only">Retirer ce filtre</span>
                </Link>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line pb-4">
            <p className="text-sm font-semibold text-fg" aria-live="polite">
              {formations.length} {formations.length > 1 ? 'formations' : 'formation'}
              {lieu ? ` ${lieu.dans} ou en ligne` : ''}
            </p>
          </div>
          {formations.length > 0 ? (
            <ul className="mt-5 space-y-3">
              {formations.map((f, i) => (
                <LigneSession key={f.slug} f={f} actif={i === 0} base={base} />
              ))}
            </ul>
          ) : (
            <div className="squircle-2xl mt-5 border border-dashed border-line p-6 text-sm text-fg-2">
              <p>Aucune session à venir ne répond à ces critères.</p>
              <Link href={chemin(base)} scroll={false} className="mt-2 inline-block font-medium text-fg underline underline-offset-4">
                Effacer les filtres
              </Link>
            </div>
          )}
          <details className="squircle-2xl group mt-6 bg-bg-soft">
            <summary className="flex cursor-pointer list-none flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
              <span className="flex items-start gap-3 text-sm text-fg">
                <Bell className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                <span>Soyez prévenu(e) des nouvelles sessions{theme ? ` ${enTheme(theme)}` : ''}, par email et sans compte.</span>
              </span>
              <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground group-open:hidden">Créer l’alerte</span>
            </summary>
            <div className="border-t border-line p-5">
              <AlerteFormations themesInitiaux={filtres.themes} publicsInitiaux={filtres.publics} regionInitiale={filtres.zone} />
            </div>
          </details>
        </div>
      </div>
    </main>
  )
}

type Recherche = Record<string, string | string[] | undefined>

/** Le lieu de la barre de recherche, ramené à une ville et une région de session. */
async function lieuDeRecherche(sp: Recherche) {
  const un = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  const paramsLieu = Object.fromEntries((['lieu', 'departement', 'region'] as const).flatMap((k) => (un(sp[k]) ? [[k, un(sp[k])!]] : []))) as ParamsLieu
  const lieu = await resoudreLieu(paramsLieu)
  const dep = lieu?.departements?.[0] ? await getDepartementParCode(lieu.departements[0]) : null
  return { paramsLieu: paramsLieu as Record<string, string>, lieu, session: lieu ? { ville: lieu.ville, region: dep?.regionCode ?? null } : null }
}

/**
 * La liste à partir des formations publiques et de l'URL : filtres, lieu,
 * ordre. Partagée par la route publique et la démonstration.
 */
export async function PageFormationsPrivees({ vues, recherche, base = BASE_PRIVEES }: { vues: FormationPriveeVue[]; recherche: Recherche; base?: string }) {
  const filtres = lireFiltres(recherche)
  const { paramsLieu, lieu, session } = await lieuDeRecherche(recherche)
  return <ListeFormationsPrivees formations={filtrerEtTrier(vues, filtres, session)} filtres={filtres} lieu={lieu} paramsLieu={paramsLieu} base={base} />
}
