import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getDepartementsDeRegion,
  getEmpriseRegion,
  getPraticiensDansEmprise,
  type Region,
} from '@/lib/annuaire/queries'
import { LIBELLE, compte, enRegion, majuscule } from '@/lib/annuaire/libelles'
import { BASE_URL, type Profession } from '@/lib/annuaire/types'
import { MiseEnPageRecherche } from '@/components/recherche/mise-en-page'
import { Balisage, filAriane } from '@/lib/seo/jsonld'
import { ListeTerritoires, numeroPage } from './commune'
import { FilAriane } from './primitives'

type Recherche = { page?: string }

export async function metadonneesRegion(profession: Profession, r: Region, recherche: Recherche = {}): Promise<Metadata> {
  const departements = await getDepartementsDeRegion(profession, r.code)
  const total = departements.reduce((n, d) => n + d.total, 0)
  const l = LIBELLE[profession]
  const page = numeroPage(recherche.page)
  const cheminBase = `/${BASE_URL[profession]}/${r.slug}/`
  return {
    title: `${majuscule(l.pluriel)} ${enRegion(r.slug, r.nom)}${page > 1 ? ` — page ${page}` : ''}`,
    description: `${compte(profession, total)} recensés ${enRegion(r.slug, r.nom)}, dans ${departements.length} départements, sur la carte et en liste. Informations vérifiées auprès des registres officiels.`,
    alternates: { canonical: cheminBase },
    robots: total > 0 && page === 1 ? undefined : { index: false, follow: true },
  }
}

/**
 * Page d'une région : la carte cadrée sur elle, les praticiens les plus
 * proches de son centre en liste, et ses départements en liens.
 */
export async function PageRegion({ profession, region: r, page }: { profession: Profession; region: Region; page: number }) {
  const base = BASE_URL[profession]
  const l = LIBELLE[profession]
  const [departements, emprise] = await Promise.all([getDepartementsDeRegion(profession, r.code), getEmpriseRegion(r.code)])
  const initial = await getPraticiensDansEmprise(profession, emprise, page)
  if (page > initial.pages) notFound()
  const total = departements.reduce((n, d) => n + d.total, 0)

  const pluriel = majuscule(l.pluriel)
  const segments = [
    { nom: 'Accueil', chemin: '/' },
    { nom: pluriel, chemin: `/${base}/` },
    { nom: r.nom, chemin: `/${base}/${r.slug}/` },
  ]

  return (
    <>
      <Balisage donnees={filAriane(segments)} />
      <MiseEnPageRecherche
        cle={`${base}:reg:${r.code}:${page}`}
        base={base}
        emprise={emprise}
        initial={initial}
        mode="territoire"
        territoire={{ libelle: 'dans la zone affichée', classement: 'distance' }}
        valeurLieu={r.nom}
        lieu={{ type: 'region', code: r.code, slug: r.slug }}
        enTete={
          <>
            <FilAriane segments={segments.map((s, i) => (i < segments.length - 1 ? { libelle: s.nom, href: s.chemin } : { libelle: s.nom }))} />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-fg md:text-3xl">
              {pluriel} {enRegion(r.slug, r.nom)}
            </h1>
            <p className="mt-2 text-fg-2">
              {compte(profession, total)} dans {departements.length}{' '}
              {departements.length > 1 ? 'départements' : 'département'}, recensés à partir {l.registre}. La carte montre la
              région entière ; la liste suit ce qu&apos;elle affiche.
            </p>
          </>
        }
        apres={
          <ListeTerritoires
            titre="Par département"
            liens={departements.map((d) => ({ libelle: d.nom, href: `/${base}/${d.slug}/`, total: d.total }))}
          />
        }
      />
    </>
  )
}
