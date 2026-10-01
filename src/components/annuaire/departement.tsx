import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getCommunesDuDepartement,
  getDepartement,
  getEmpriseDepartement,
  getPraticiensDansEmprise,
  getRegion,
} from '@/lib/annuaire/queries'
import { LIBELLE, compte, majuscule } from '@/lib/annuaire/libelles'
import { BASE_URL, type Profession } from '@/lib/annuaire/types'
import { MiseEnPageRecherche } from '@/components/recherche/mise-en-page'
import { Balisage, filAriane } from '@/lib/seo/jsonld'
import { ListeTerritoires, numeroPage } from './commune'
import { FilAriane } from './primitives'
import { metadonneesRegion, PageRegion } from './region'

type Params = { departement: string }
type Recherche = { page?: string }

/**
 * Le second segment de l'annuaire est un département ou une région.
 *
 * Les deux vivent sous la même URL, `/dentistes/gironde/` comme
 * `/dentistes/nouvelle-aquitaine/` : c'est ce qu'un moteur et un visiteur
 * attendent d'une adresse de lieu. Le département est cherché d'abord ; les
 * régions d'outre-mer, qui portent le même slug que leur unique département,
 * sont donc servies par la page de département.
 */
export async function metadonneesTerritoire(
  profession: Profession,
  params: Params,
  recherche: Recherche = {},
): Promise<Metadata> {
  const d = await getDepartement(params.departement)
  if (d) return metadonneesDepartement(profession, params, recherche)
  const r = await getRegion(params.departement)
  if (r) return metadonneesRegion(profession, r, recherche)
  return { title: 'Territoire introuvable' }
}

export async function PageTerritoire({
  profession,
  params,
  searchParams,
}: {
  profession: Profession
  params: Promise<Params>
  searchParams: Promise<Recherche>
}) {
  const { departement } = await params
  const page = numeroPage((await searchParams).page)
  const d = await getDepartement(departement)
  if (d) return <PageDepartement profession={profession} slug={departement} page={page} />
  const r = await getRegion(departement)
  if (r) return <PageRegion profession={profession} region={r} page={page} />
  notFound()
}

export async function metadonneesDepartement(
  profession: Profession,
  params: Params,
  recherche: Recherche = {},
): Promise<Metadata> {
  const d = await getDepartement(params.departement)
  if (!d) return { title: 'Département introuvable' }
  const communes = await getCommunesDuDepartement(profession, d.code)
  const total = communes.filter((c) => c.type === 'commune').reduce((n, c) => n + c.total, 0)
  const l = LIBELLE[profession]
  const page = numeroPage(recherche.page)
  const cheminBase = `/${BASE_URL[profession]}/${params.departement}/`
  return {
    title: `${majuscule(l.pluriel)} en ${d.nom}${page > 1 ? ` — page ${page}` : ''}`,
    description: `${compte(profession, total)} recensés en ${d.nom}, dans ${communes.length} communes, sur la carte et en liste. Informations vérifiées auprès des registres officiels.`,
    alternates: { canonical: cheminBase },
    // La pagination d'un département suit la distance au centre de la carte :
    // utile au visiteur, sans valeur propre pour un index. Seule la première
    // page, qui porte la liste des communes, est indexée.
    robots: total > 0 && page === 1 ? undefined : { index: false, follow: true },
  }
}

/**
 * Page d'un département : la carte cadrée sur lui, les praticiens les plus
 * proches de son centre en liste, et toutes ses communes en liens.
 */
export async function PageDepartement({ profession, slug, page }: { profession: Profession; slug: string; page: number }) {
  const d = await getDepartement(slug)
  if (!d) notFound()

  const base = BASE_URL[profession]
  const l = LIBELLE[profession]
  const [communes, emprise] = await Promise.all([getCommunesDuDepartement(profession, d.code), getEmpriseDepartement(d.code)])
  const initial = await getPraticiensDansEmprise(profession, emprise, page)
  if (page > initial.pages) notFound()

  const total = communes.filter((c) => c.type === 'commune').reduce((n, c) => n + c.total, 0)
  // Les communes les plus dotées d'abord, puis le reste par ordre alphabétique :
  // une liste de 890 communes triée uniquement par effectif serait illisible.
  const principales = communes.slice(0, 12)
  const autres = [...communes.slice(12)].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
  const lien = (c: { nom: string; slug: string; total: number }) => ({ libelle: c.nom, href: `/${base}/${d.slug}/${c.slug}/`, total: c.total })

  const pluriel = majuscule(l.pluriel)
  const segments = [
    { nom: 'Accueil', chemin: '/' },
    { nom: pluriel, chemin: `/${base}/` },
    { nom: d.nom, chemin: `/${base}/${d.slug}/` },
  ]

  return (
    <>
      <Balisage donnees={filAriane(segments)} />
      <MiseEnPageRecherche
        cle={`${base}:dep:${d.code}:${page}`}
        base={base}
        emprise={emprise}
        initial={initial}
        mode="territoire"
        territoire={{ libelle: 'dans la zone affichée', classement: 'distance' }}
        valeurLieu={d.nom}
        enTete={
          <>
            <FilAriane segments={segments.map((s, i) => (i < segments.length - 1 ? { libelle: s.nom, href: s.chemin } : { libelle: s.nom }))} />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-fg md:text-3xl">
              {pluriel} en {d.nom}
            </h1>
            <p className="mt-2 text-fg-2">
              {compte(profession, total)} dans {communes.length.toLocaleString('fr-FR')}{' '}
              {communes.length > 1 ? 'communes' : 'commune'}, région {d.regionNom}, recensés à partir {l.registre}. La carte
              montre le département entier ; la liste suit ce qu&apos;elle affiche.
            </p>
          </>
        }
        apres={
          <>
            <ListeTerritoires titre="Communes principales" liens={principales.map(lien)} />
            <ListeTerritoires titre="Toutes les autres communes" liens={autres.map(lien)} compact />
            {communes.length === 0 && (
              <p className="mt-8 text-fg-2">Aucun {l.singulier} n&apos;est recensé dans ce département.</p>
            )}
          </>
        }
      />
    </>
  )
}
