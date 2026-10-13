/**
 * Pages de recherche par métier et lieu : en-tête sur fond doux, filtres en
 * colonne, résultats pleine largeur, et un sélecteur « Liste | Carte ».
 *
 * - Commune : `/emploi/assistant-dentaire/gironde/bordeaux/`, vue liste, ou
 *   vue carte avec `?vue=carte` (liste compacte et carte côte à côte sur grand
 *   écran ; sur mobile, la carte avec la première offre en panneau bas).
 * - Commune sans offre : servie en 200 avec `noindex, follow`, les offres
 *   voisines par distance et l'alerte en tête.
 * - Département : `/emploi/assistant-dentaire/gironde/`, avec les communes.
 *
 * Tri unique et affiché : distance au centre de la commune (ou à la commune
 * la plus peuplée du département), puis ordre alphabétique.
 */
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowDownWideNarrow, ArrowRight, Bell, List, Map as IconeCarte, MapPin, SlidersHorizontal } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import type { Commune, Departement } from '@/lib/annuaire/queries'
import type { Emprise } from '@/lib/annuaire/emprise'
import { chemin } from '@/lib/navigation'
import { empriseOffres } from '@/lib/emploi/carte'
import { EMPLOI, cheminCommune, cheminDepartement, cheminMetier } from '@/lib/emploi/chemins'
import { estFiltree, filtrerOffres, urlFiltres, type FiltresEmploi } from '@/lib/emploi/filtres'
import { etiquetteCarte } from '@/lib/emploi/format'
import { LIBELLE_CONTRAT, METIERS, type CodeContrat, type Metier } from '@/lib/emploi/metiers'
import {
  PAR_PAGE_EMPLOI,
  getComptes,
  getCommunesAvecOffres,
  getCommunesVoisinesAvecOffres,
  getOffresAutour,
  getOffresCommune,
  getOffresDepartement,
  getOrigineDepartement,
} from '@/lib/emploi/queries'
import { SALAIRES } from '@/lib/emploi/salaires'
import type { OffreResume } from '@/lib/emploi/types'
import type { CriteresAlerte } from '@/lib/emploi/alerte'
import { AlerteEmail } from './alerte-email'
import { CarteOffres, type PointOffre } from './carte-offres'
import { CarteOffre, LienFicheMetier, ListeLiens, SalairesSecteurs, nombreOffres } from './blocs'

type Ariane = { libelle: string; href?: string }[]

const CONTRATS_FILTRE: CodeContrat[] = ['cdi', 'cdd', 'alternance', 'stage', 'remplacement', 'collaboration']
const ANCRE_ALERTE = 'alerte'

/**
 * Filtres en colonne : formulaire GET sur la page elle-même. Les compteurs
 * par contrat portent sur toutes les offres de la commune, filtres compris
 * ou non : ils disent ce qu'un clic donnerait.
 */
function FiltresPanneau({ f, comptes, action }: { f: FiltresEmploi; comptes: Partial<Record<CodeContrat, number>>; action: string }) {
  const groupe = 'border-b border-line py-5 first:pt-0'
  const titre = 'text-sm font-semibold text-fg'
  const contrats = CONTRATS_FILTRE.filter((c) => (comptes[c] ?? 0) > 0 || f.contrats.includes(c))
  return (
    <form action={action} method="get" className="text-sm">
      {f.vue === 'carte' && <input type="hidden" name="vue" value="carte" />}
      {contrats.length > 0 && (
        <fieldset className={groupe}>
          <legend className={titre}>Contrat</legend>
          <ul className="mt-3 space-y-2">
            {contrats.map((c) => (
              <li key={c}>
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2.5 text-fg">
                    <input type="checkbox" name="contrat" value={c} defaultChecked={f.contrats.includes(c)} className="size-4 accent-[var(--fg)]" />
                    {LIBELLE_CONTRAT[c]}
                  </span>
                  <span className="tabular-nums text-fg-2">{comptes[c] ?? 0}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}
      <fieldset className={groupe}>
        <legend className={titre}>Temps de travail</legend>
        <div className="mt-3 grid grid-cols-3 rounded-full bg-bg-soft p-1 text-center text-xs">
          {(
            [
              ['tous', 'Tous'],
              ['plein', 'Plein'],
              ['partiel', 'Partiel'],
            ] as const
          ).map(([v, t]) => (
            <label key={v} className="cursor-pointer rounded-full py-1.5 text-fg-2 has-[:checked]:bg-bg has-[:checked]:font-medium has-[:checked]:text-fg has-[:checked]:shadow-sm">
              <input type="radio" name="temps" value={v} defaultChecked={f.temps === v} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className={groupe}>
        <legend className={titre}>Rémunération minimale</legend>
        <label className="mt-3 flex h-10 items-center justify-between gap-2 rounded-lg border border-line px-3">
          <span className="sr-only">Salaire brut mensuel minimal, en euros</span>
          <input
            type="number"
            name="min"
            min={0}
            step={50}
            inputMode="numeric"
            defaultValue={f.min ?? ''}
            placeholder="Aucune"
            className="w-full min-w-0 bg-transparent tabular-nums text-fg outline-none placeholder:text-fg-2"
          />
          <span className="shrink-0 text-xs text-fg-2">€ brut par mois</span>
        </label>
        <p className="mt-2 text-xs text-fg-2">Postes salariés seulement.</p>
      </fieldset>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="submit" className="inline-flex h-10 cursor-pointer items-center rounded-full bg-fg px-5 text-sm font-semibold text-bg">
          Appliquer
        </button>
        {estFiltree(f) && (
          <Link href={chemin(urlFiltres(action, { ...f, contrats: [], temps: 'tous', min: null }))} className="text-sm font-medium text-fg underline underline-offset-4">
            Effacer les filtres
          </Link>
        )}
      </div>
    </form>
  )
}

/** Mobile et vue carte : les filtres repliés derrière un bouton, le nombre de filtres actifs en pastille. */
function FiltresBarre({ f, comptes, action }: { f: FiltresEmploi; comptes: Partial<Record<CodeContrat, number>>; action: string }) {
  const actifs = f.contrats.length + (f.temps !== 'tous' ? 1 : 0) + (f.min !== null ? 1 : 0)
  return (
    <details className="group">
      <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-bg px-3.5 text-sm font-medium text-fg [&::-webkit-details-marker]:hidden">
        <SlidersHorizontal className="size-4" aria-hidden /> Filtres
        {actifs > 0 && <span className="grid size-5 place-items-center rounded-full bg-fg text-[11px] text-bg">{actifs}</span>}
      </summary>
      <div className="squircle-2xl mt-3 max-w-sm border border-line bg-bg p-5 shadow-pop">
        <FiltresPanneau f={f} comptes={comptes} action={action} />
      </div>
    </details>
  )
}

/** Le sélecteur de vue, bien visible dans l'en-tête. */
function Vues({ mode, liens }: { mode: 'liste' | 'carte'; liens: { liste: string; carte: string } }) {
  const b = (actif: boolean) =>
    `inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold sm:flex-none ${actif ? 'bg-fg text-bg shadow-sm' : 'text-fg'}`
  return (
    <nav aria-label="Affichage des résultats" className="flex w-full rounded-full border border-line bg-bg p-1 sm:inline-flex sm:w-auto">
      <Link href={chemin(liens.liste)} aria-current={mode === 'liste' ? 'page' : undefined} className={b(mode === 'liste')}>
        <List className="size-4" aria-hidden /> Liste
      </Link>
      <Link href={chemin(liens.carte)} aria-current={mode === 'carte' ? 'page' : undefined} className={b(mode === 'carte')}>
        <IconeCarte className="size-4" aria-hidden /> Carte
      </Link>
    </nav>
  )
}

function Compteur({ n, depuis }: { n: number; depuis: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line pb-4">
      <p className="text-sm font-semibold text-fg">{nombreOffres(n)}</p>
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
      <a href={`#${ANCRE_ALERTE}`} className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground">
        Créer l’alerte
      </a>
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

const points = (offres: OffreResume[]): PointOffre[] =>
  offres.flatMap((o) => (o.lon != null && o.lat != null ? [{ id: o.id, lon: o.lon, lat: o.lat, etiquette: etiquetteCarte(o) }] : []))

type Gabarit = {
  ariane: Ariane
  titre: string
  intro: string
  mode: 'liste' | 'carte'
  offres: OffreResume[]
  total: number
  depuis: string
  emprise: Emprise
  rayon?: { lon: number; lat: number; metres: number }
  /** Filtres et sélecteur de vue : pages commune seulement. */
  filtres?: { f: FiltresEmploi; comptes: Partial<Record<CodeContrat, number>>; action: string }
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
          {g.filtres && g.offres.length > 0 && (
            <Vues mode={g.mode} liens={{ liste: urlFiltres(g.filtres.action, g.filtres.f, 'liste'), carte: urlFiltres(g.filtres.action, g.filtres.f, 'carte') }} />
          )}
        </div>
      </div>
    </section>
  )
}

function Resultats({ g }: { g: Gabarit }) {
  const pts = points(g.offres)
  const cle = g.offres.map((o) => o.id).join('|')
  if (g.mode === 'liste' || g.offres.length === 0) {
    return (
      <div className={`container grid gap-10 py-8 lg:gap-12 lg:py-10 ${g.filtres ? 'lg:grid-cols-[16rem_minmax(0,1fr)]' : ''}`}>
        {g.filtres && (
          <aside className="hidden lg:block">
            <FiltresPanneau {...g.filtres} />
          </aside>
        )}
        <div className="min-w-0">
          {g.filtres && (
            <div className="mb-5 lg:hidden">
              <FiltresBarre {...g.filtres} />
            </div>
          )}
          {g.avant}
          {g.offres.length > 0 && (
            <>
              <Compteur n={g.total} depuis={g.depuis} />
              <ul className="mt-5 space-y-3">
                {g.offres.map((o) => (
                  <CarteOffre key={o.id} o={o} forme="ligne" />
                ))}
              </ul>
            </>
          )}
          {g.suite}
        </div>
      </div>
    )
  }
  /* Vue carte. */
  return (
    <>
      {g.filtres && (
        <div className="border-b border-line">
          <div className="container py-4">
            <FiltresBarre {...g.filtres} />
          </div>
        </div>
      )}
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
        <CarteOffres key={cle} className="h-full min-h-[44rem]" emprise={g.emprise} actif={g.offres[0]?.id} points={pts} rayon={g.rayon} />
      </div>
      {/* Mobile : la carte, et la première offre en panneau bas. */}
      <div className="relative h-[42rem] lg:hidden">
        <CarteOffres key={cle} className="size-full" emprise={empriseMobile(g.emprise)} actif={g.offres[0]?.id} points={pts} rayon={g.rayon} mention={false} />
        <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-line bg-bg px-4 pb-5 pt-2 shadow-[0_-8px_28px_rgb(22_34_43/0.16)]">
          <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-line-strong" aria-hidden />
          <Compteur n={g.total} depuis={g.depuis} />
          <ul className="mt-3">
            {g.offres.slice(0, 1).map((o) => (
              <CarteOffre key={o.id} o={o} forme="compacte" actif />
            ))}
          </ul>
          {g.filtres && (
            <Link
              href={chemin(urlFiltres(g.filtres.action, g.filtres.f, 'liste'))}
              className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line text-sm font-medium text-fg"
            >
              <List className="size-4" aria-hidden /> Voir {g.total > 1 ? `les ${g.total} offres` : 'l’offre'} en liste
            </Link>
          )}
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
      <Resultats g={g} />
      {g.apres}
    </main>
  )
}

/** Salaire moyen du métier (études) et alerte, côte à côte. Sans repère de salaire pour ce métier, l'alerte seule. */
function SalaireEtAlerte({ m, criteres, detail }: { m: Metier; criteres: Partial<CriteresAlerte>; detail: string }) {
  const avecSalaires = Boolean(SALAIRES[m.code])
  return (
    <section className="border-t border-line">
      <div className={`container grid gap-14 py-16 md:py-20 lg:gap-16 ${avecSalaires ? 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]' : 'lg:max-w-3xl'}`}>
        {avecSalaires && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Salaire moyen par secteur</h2>
            <p className="mt-2 text-fg-2">{m.nom}, selon le secteur. Pour situer les offres ci-dessus.</p>
            <div className="mt-6">
              <SalairesSecteurs metiers={[m.code]} />
            </div>
          </div>
        )}
        <div id={ANCRE_ALERTE} className="scroll-mt-24">
          <AlerteEmail criteres={criteres} detail={detail} />
        </div>
      </div>
    </section>
  )
}

/** Liens vers les autres métiers d'un territoire, avec leurs compteurs. */
function autresMetiers(
  m: Metier,
  parMetier: Partial<Record<string, number>>,
  href: (slug: string) => string,
): { nom: string; href: string; n: number }[] {
  return METIERS.filter((x) => x.code !== m.code && (parMetier[x.code] ?? 0) > 0).map((x) => ({ nom: x.nom, href: href(x.slug), n: parMetier[x.code]! }))
}

/* ------------------------------------------------------------------ */
/* Commune                                                              */
/* ------------------------------------------------------------------ */

export async function PageCommuneEmploi({ m, c, f }: { m: Metier; c: Commune; f: FiltresEmploi }) {
  const base = cheminCommune(m.slug, c.departementSlug, c.slug)
  const [toutes, voisines, comptes] = await Promise.all([
    getOffresCommune(m.code, c.codeInsee),
    getCommunesVoisinesAvecOffres(m.code, c.codeInsee, 6),
    getComptes({ communeCode: c.codeInsee }),
  ])
  const ariane: Ariane = [
    { libelle: 'Emploi', href: EMPLOI },
    { libelle: m.nom, href: cheminMetier(m.slug) },
    { libelle: c.departementNom, href: cheminDepartement(m.slug, c.departementSlug) },
    { libelle: c.nom },
  ]
  const centre = { lon: c.lon, lat: c.lat }
  const lienVoisines = voisines.map((v) => ({ nom: v.nom, href: cheminCommune(m.slug, v.departementSlug, v.slug), n: v.total, detail: `${v.km.toLocaleString('fr-FR')} km` }))
  const criteres: Partial<CriteresAlerte> = { metiers: [m.code], contrats: f.contrats, commune: c.codeInsee, rayonKm: 10 }
  const comptesContrat: Partial<Record<CodeContrat, number>> = {}
  for (const o of toutes) comptesContrat[o.contrat] = (comptesContrat[o.contrat] ?? 0) + 1

  /* Commune sans offre : les offres voisines, l'alerte en tête. */
  if (toutes.length === 0) {
    const { offres: proches, total: totalProches } = await getOffresAutour(m.code, c.codeInsee, 40_000, 10)
    return (
      <Gabarit
        g={{
          ariane,
          titre: `Aucune offre ${m.de} à ${c.nom} pour le moment`,
          intro: proches.length
            ? `Aucun recruteur de ${c.nom} n’a d’offre en ligne aujourd’hui. Les offres les plus proches sont listées ci-dessous, par distance depuis ${c.nom}.`
            : `Aucun recruteur de ${c.nom} ni des environs n’a d’offre en ligne aujourd’hui. Créez une alerte pour être prévenu(e) dès qu’une offre paraît.`,
          mode: 'liste',
          offres: proches,
          total: totalProches,
          depuis: c.nom,
          emprise: empriseOffres(points(proches), centre, 15_000),
          rayon: c.lon != null && c.lat != null ? { lon: c.lon, lat: c.lat, metres: 15_000 } : undefined,
          avant: (
            <div id={ANCRE_ALERTE} className="squircle-2xl mb-8 scroll-mt-24 border border-teal/25 bg-teal/[0.06] p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-fg">
                <Bell className="size-4 text-teal" aria-hidden /> Être prévenu(e) dès qu’une offre paraît
              </p>
              <p className="mt-1 text-sm text-fg-2">
                {m.nom} à {c.nom} et dans un rayon de 15 km. Sans compte.
              </p>
              <div className="mt-4">
                <AlerteEmail compacte criteres={{ ...criteres, contrats: [], rayonKm: 15 }} />
              </div>
            </div>
          ),
          suite: (
            <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-fg-2">
              Élargir la recherche :
              <Link href={chemin(cheminDepartement(m.slug, c.departementSlug))} className="inline-flex h-8 items-center rounded-full border border-line px-3 text-fg">
                {m.nom} en {c.departementNom}
              </Link>
              <Link href={chemin(cheminMetier(m.slug))} className="inline-flex h-8 items-center rounded-full border border-line px-3 text-fg">
                En France
              </Link>
            </p>
          ),
          apres: (
            <section className="border-t border-line bg-bg-soft">
              <div className="container grid gap-12 py-16 lg:grid-cols-2 lg:gap-16">
                <ListeLiens titre={`${m.nom} autour de ${c.nom}`} liens={lienVoisines} />
                <ListeLiens titre={`Autres offres à ${c.nom}`} liens={autresMetiers(m, comptes.parMetier, (s) => cheminCommune(s, c.departementSlug, c.slug))} />
              </div>
              <div className="container flex flex-wrap items-center justify-between gap-4 border-t border-line py-6">
                <LienFicheMetier metier={m} />
                <p className="inline-flex items-center gap-1.5 text-xs text-fg-2">
                  <MapPin className="size-3.5 text-geo" aria-hidden /> Distances à vol d’oiseau depuis le centre de {c.nom}
                </p>
              </div>
            </section>
          ),
        }}
      />
    )
  }

  const offres = filtrerOffres(toutes, f)
  const { total: autour10 } = await getOffresAutour(m.code, c.codeInsee, 10_000, 1)
  return (
    <Gabarit
      g={{
        ariane,
        titre: `Offres ${m.de} à ${c.nom}`,
        intro: `${nombreOffres(toutes.length)} ${m.de} à ${c.nom}${c.departementNom !== c.nom ? ` (${c.departementNom})` : ''}, publiée${toutes.length > 1 ? 's' : ''} par des recruteurs vérifiés auprès des registres officiels. La rémunération est affichée sur chaque offre.`,
        mode: f.vue,
        offres,
        total: offres.length,
        depuis: `le centre de ${c.nom}`,
        emprise: empriseOffres(points(offres), centre),
        filtres: { f, comptes: comptesContrat, action: base },
        avant:
          offres.length === 0 ? (
            <div className="squircle-2xl mb-6 border border-line bg-bg-soft p-5 text-sm text-fg-2">
              Aucune offre ne correspond à ces filtres.{' '}
              <Link href={chemin(urlFiltres(base, { ...f, contrats: [], temps: 'tous', min: null }))} className="font-medium text-fg underline underline-offset-4">
                Voir les {nombreOffres(toutes.length).toLocaleLowerCase('fr')}
              </Link>
            </div>
          ) : undefined,
        suite: (
          <>
            {autour10 > 0 && (
              <p className="mt-6 text-sm text-fg-2">
                Toutes les offres de {c.nom} sont affichées. {nombreOffres(autour10)} {m.de} {autour10 > 1 ? 'sont publiées' : 'est publiée'} à moins de 10 km, dans les communes voisines.
              </p>
            )}
            <AlerteLigne texte={`Soyez prévenu(e) des prochaines offres ${m.de} à ${c.nom}, par email et sans compte.`} />
          </>
        ),
        apres: (
          <>
            <SalaireEtAlerte m={m} criteres={criteres} detail={`${m.nom} à ${c.nom} et dans un rayon de 10 km. Un email par semaine au plus, et un lien de désinscription dans chaque envoi.`} />
            <section className="border-t border-line bg-bg-soft">
              <div className="container grid gap-12 py-16 lg:grid-cols-2 lg:gap-16">
                <ListeLiens titre={`${m.nom} autour de ${c.nom}`} liens={lienVoisines} />
                <ListeLiens titre={`Autres offres à ${c.nom}`} liens={autresMetiers(m, comptes.parMetier, (s) => cheminCommune(s, c.departementSlug, c.slug))} />
              </div>
              <div className="container border-t border-line py-6">
                <LienFicheMetier metier={m} />
              </div>
            </section>
          </>
        ),
      }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Département                                                          */
/* ------------------------------------------------------------------ */

export async function PageDepartementEmploi({ m, d, page }: { m: Metier; d: Departement; page: number }) {
  const [{ offres, total }, origine, communes, comptes] = await Promise.all([
    getOffresDepartement(d.code, { metier: m.code }, page),
    getOrigineDepartement(d.code),
    getCommunesAvecOffres(m.code, d.code),
    getComptes({ departementCode: d.code }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAR_PAGE_EMPLOI))
  const base = cheminDepartement(m.slug, d.slug)
  const liensCommunes = communes.map((x) => ({ nom: x.nom, href: cheminCommune(m.slug, d.slug, x.slug), n: x.total }))
  return (
    <Gabarit
      g={{
        ariane: [{ libelle: 'Emploi', href: EMPLOI }, { libelle: m.nom, href: cheminMetier(m.slug) }, { libelle: d.nom }],
        titre: total > 0 ? `Offres ${m.de} en ${d.nom}` : `Aucune offre ${m.de} en ${d.nom} pour le moment`,
        intro:
          total > 0
            ? `${nombreOffres(total)} ${m.de} dans ${communes.length > 1 ? `${communes.length} communes` : 'une commune'} du département, publiée${total > 1 ? 's' : ''} par des recruteurs vérifiés auprès des registres officiels.`
            : `Aucun recruteur du département n’a d’offre ${m.de} en ligne aujourd’hui. Créez une alerte pour être prévenu(e) dès qu’une offre paraît.`,
        mode: 'liste',
        offres,
        total,
        depuis: origine ? origine.nom : d.nom,
        emprise: empriseOffres(points(offres), null),
        avant:
          liensCommunes.length > 0 ? (
            <div className="mb-6">
              <p className="text-sm font-semibold text-fg">Par commune</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {liensCommunes.slice(0, 6).map((x) => (
                  <li key={x.href}>
                    <Link href={chemin(x.href)} className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-bg px-3.5 text-sm text-fg">
                      {x.nom} <span className="tabular-nums text-fg-2">{x.n}</span>
                    </Link>
                  </li>
                ))}
                {liensCommunes.length > 6 && (
                  <li>
                    <a href="#communes" className="inline-flex h-9 items-center gap-1.5 px-2 text-sm font-medium text-fg underline underline-offset-4">
                      Toutes les communes
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ) : undefined,
        suite: (
          <>
            {page < pages && (
              <Link
                href={chemin(`${base}?page=${page + 1}`)}
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line text-sm font-medium text-fg"
              >
                Afficher les offres suivantes <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
            <AlerteLigne texte={`Soyez prévenu(e) des prochaines offres ${m.de} en ${d.nom}, par email et sans compte.`} />
          </>
        ),
        apres: (
          <>
            {liensCommunes.length > 0 && (
              <section id="communes" className="scroll-mt-24 border-t border-line">
                <div className="container py-16">
                  <ListeLiens titre={`Les communes de ${d.nom} avec des offres`} liens={liensCommunes} colonnes={3} />
                </div>
              </section>
            )}
            <SalaireEtAlerte
              m={m}
              criteres={{ metiers: [m.code], contrats: [], departement: d.code }}
              detail={`${m.nom} en ${d.nom}. Un email par semaine au plus, et un lien de désinscription dans chaque envoi.`}
            />
            <section className="border-t border-line bg-bg-soft">
              <div className="container grid gap-12 py-16 lg:grid-cols-2 lg:gap-16">
                <ListeLiens titre={`Autres offres en ${d.nom}`} liens={autresMetiers(m, comptes.parMetier, (s) => cheminDepartement(s, d.slug))} />
              </div>
              <div className="container border-t border-line py-6">
                <LienFicheMetier metier={m} />
              </div>
            </section>
          </>
        ),
      }}
    />
  )
}

