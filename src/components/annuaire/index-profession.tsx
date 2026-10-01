import Link from 'next/link'
import type { Metadata } from 'next'
import {
  getDepartementsAvecPraticiens,
  getPraticiensDansEmprise,
  getTotalProfession,
  type DepartementCompte,
} from '@/lib/annuaire/queries'
import { AutourDeMoi } from '@/components/recherche/autour-de-moi'
import { EMPRISE_FRANCE } from '@/lib/annuaire/emprise'
import { LIBELLE, compte, majuscule } from '@/lib/annuaire/libelles'
import { BASE_URL, type Profession } from '@/lib/annuaire/types'
import { MiseEnPageRecherche } from '@/components/recherche/mise-en-page'
import { numeroPage } from './commune'
import { chemin, FilAriane } from './primitives'

type Recherche = { page?: string }

export async function metadonneesIndex(profession: Profession, recherche: Recherche = {}, autourDeMoi = false): Promise<Metadata> {
  const { total, communes } = await getTotalProfession(profession)
  const l = LIBELLE[profession]
  const page = numeroPage(recherche.page)
  if (autourDeMoi) {
    return {
      title: `${majuscule(l.pluriel)} près de chez vous`,
      description: `Autorisez la localisation et voyez les ${l.pluriel} autour de vous sur la carte, avec leurs adresses vérifiées auprès des registres officiels.`,
      alternates: { canonical: `/${BASE_URL[profession]}/pres-de-chez-vous/` },
    }
  }
  return {
    title: `${majuscule(l.pluriel)} en France${page > 1 ? ` — page ${page}` : ''}`,
    description: `${compte(profession, total)} recensés dans ${communes.toLocaleString('fr-FR')} communes, à partir ${l.registre}. Carte de France, recherche par région, département et commune.`,
    alternates: { canonical: `/${BASE_URL[profession]}/` },
    robots: page === 1 ? undefined : { index: false, follow: true },
  }
}

/**
 * Index d'une profession : la France entière sur la carte, et tous les
 * départements en liens, groupés par région, chaque région ayant sa page.
 */
/** Les départements groupés par région, chaque région menant à sa page. Partagé avec la page par département. */
export function ListeDepartementsParRegion({ base, departements }: { base: string; departements: DepartementCompte[] }) {
  // Regroupement par région : 109 départements en liste plate seraient illisibles.
  const parRegion = new Map<string, { slug: string; departements: DepartementCompte[] }>()
  for (const d of departements) {
    const groupe = parRegion.get(d.regionNom) ?? { slug: d.regionSlug, departements: [] }
    groupe.departements.push(d)
    parRegion.set(d.regionNom, groupe)
  }
  return (
    /* L'ancre est la cible des liens « Par département » du méga-menu. */
    <div id="departements" className="scroll-mt-24">
      {[...parRegion.entries()].map(([region, groupe]) => (
        <section key={region} id={groupe.slug} className="mt-10 scroll-mt-24">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-2">
            <Link href={chemin(`/${base}/${groupe.slug}/`)} className="hover:text-fg hover:underline">
              {region}
            </Link>
          </h2>
          <ul className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {groupe.departements.map((d) => (
              <li key={d.slug} className="flex items-baseline justify-between gap-4 border-b border-line py-2">
                <Link href={chemin(`/${base}/${d.slug}/`)} className="text-fg hover:underline">
                  {d.nom}
                </Link>
                <span className="text-sm tabular-nums text-fg-2">{d.total.toLocaleString('fr-FR')}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export async function PageIndexProfession({
  profession,
  searchParams,
  autourDeMoi = false,
}: {
  profession: Profession
  searchParams: Promise<Recherche>
  /** Variante « près de chez vous » : demande la position et recadre la carte dessus. */
  autourDeMoi?: boolean
}) {
  const base = BASE_URL[profession]
  const l = LIBELLE[profession]
  const page = numeroPage((await searchParams).page)
  const [{ total, communes }, departements, initial] = await Promise.all([
    getTotalProfession(profession),
    getDepartementsAvecPraticiens(profession),
    getPraticiensDansEmprise(profession, EMPRISE_FRANCE, page),
  ])

  const pluriel = majuscule(l.pluriel)

  return (
    <MiseEnPageRecherche
      cle={`${base}:france:${page}`}
      base={base}
      emprise={EMPRISE_FRANCE}
      initial={initial}
      mode="territoire"
      territoire={{ libelle: 'dans la zone affichée', classement: 'distance' }}
      valeurLieu=""
      enTete={
        <>
          <FilAriane
            segments={[
              { libelle: 'Accueil', href: '/' },
              autourDeMoi ? { libelle: pluriel, href: `/${base}/` } : { libelle: pluriel },
              ...(autourDeMoi ? [{ libelle: 'Près de chez vous' }] : []),
            ]}
          />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-fg md:text-3xl">
            {autourDeMoi ? `${pluriel} près de chez vous` : `${pluriel} en France`}
          </h1>
          <p className="mt-2 text-fg-2">
            {compte(profession, total)} recensés dans {communes.toLocaleString('fr-FR')} communes, à partir {l.registre}. Les
            informations ne sont pas déclaratives : elles proviennent de registres publics et sont rapprochées chaque
            semaine.{' '}
            {autourDeMoi
              ? 'Autorisez la localisation pour cadrer la carte autour de vous.'
              : 'Resserrez la carte, ou choisissez une région ou un département.'}
          </p>
          {autourDeMoi && <AutourDeMoi base={base} />}
        </>
      }
      apres={<ListeDepartementsParRegion base={base} departements={departements} />}
    />
  )
}
