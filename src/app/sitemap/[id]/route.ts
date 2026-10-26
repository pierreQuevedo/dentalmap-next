import { BASE_URL, PROFESSION_PAR_BASE, PROFESSIONS, type BaseUrl } from '@/lib/annuaire/types'
import {
  getCommunesIndexables,
  getDepartementsIndexables,
  getFichesIndexables,
  getRegionsIndexables,
  type EntreeSitemap,
} from '@/lib/annuaire/queries'
import { url } from '@/lib/seo/site'
import { CONSEIL_CATEGORIES } from '@/lib/navigation'
import {
  ALTERNANCE,
  EMPLOI,
  RECRUTER,
  REMPLACEMENTS,
  cheminCommune,
  cheminDepartement,
  cheminMetier,
  cheminOffre,
  cheminRemplacementsDepartement,
} from '@/lib/emploi/chemins'
import { METIERS, PARCOURS } from '@/lib/emploi/metiers'
import { getOffresPourSitemap } from '@/lib/emploi/queries'
import { RESSOURCES_VISIBLE } from '@/lib/visibilite'

/**
 * Tranches de sitemap.
 *
 * Écrites à la main plutôt qu'avec `generateSitemaps` : la convention de
 * nommage de Next produit `/sitemap/0.xml`, qui n'apprend rien à qui lit le
 * fichier. `/sitemap/dentistes-0.xml` se comprend seul dans la Search Console.
 */
const PAGES_FIXES = [
  '/',
  ...PROFESSIONS.map((p) => `/${BASE_URL[p]}/`),
  // Vitrine. Seules les pages indexables : les pages d'attente portent
  // `noindex` et restent hors sitemap jusqu'à leur ouverture.
  '/a-propos/',
  '/faq/',
  '/partenaires/',
  '/contact/',
  '/plan-du-site/',
  '/mentions-legales/',
  '/cgu/',
  '/confidentialite/',
  // Ressources et leurs rubriques, dont Métiers ; hors sitemap tant qu'elles sont masquées.
  ...(RESSOURCES_VISIBLE ? ['/conseils/', ...CONSEIL_CATEGORIES.map((c) => `/conseils/${c}/`)] : []),
  // Formation : l'accueil et les deux rubriques ouvertes.
  '/formation/',
  '/formation/ecoles-de-prothese/',
  '/formation/facultes-odontologie/',
]

function xml(entrees: EntreeSitemap[]): string {
  const corps = entrees
    .map(
      (e) =>
        `  <url><loc>${url(e.chemin)}</loc>` +
        (e.majLe ? `<lastmod>${e.majLe}</lastmod>` : '') +
        `</url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${corps}\n</urlset>\n`
}

/**
 * La rubrique Emploi : ses pages fixes, puis les offres visibles et les listes
 * qui en contiennent au moins une. Une liste prend la date de sa dernière
 * offre publiée ou confirmée.
 */
async function entreesEmploi(): Promise<EntreeSitemap[]> {
  const offres = await getOffresPourSitemap()
  const slugMetier = new Map(METIERS.map((m) => [m.code, m.slug]))
  const listes = new Map<string, string>()
  const ajouter = (chemin: string, maj: string) => {
    const avant = listes.get(chemin)
    if (!avant || maj > avant) listes.set(chemin, maj)
  }
  for (const o of offres) {
    const metier = slugMetier.get(o.metier)
    if (!metier) continue
    ajouter(cheminDepartement(metier, o.departement), o.maj)
    ajouter(cheminCommune(metier, o.departement, o.commune), o.maj)
    if (PARCOURS.remplacements.contrats.includes(o.contrat)) ajouter(cheminRemplacementsDepartement(o.departement), o.maj)
  }
  return [
    ...[EMPLOI, ALTERNANCE, REMPLACEMENTS, RECRUTER, ...METIERS.map((m) => cheminMetier(m.slug))].map((chemin) => ({ chemin })),
    ...[...listes].map(([chemin, majLe]) => ({ chemin, majLe })),
    ...offres.map((o) => ({ chemin: cheminOffre(o.slug), majLe: o.maj })),
  ]
}

async function contenu(id: string): Promise<string | null> {
  if (id === 'pages') return xml(PAGES_FIXES.map((chemin) => ({ chemin })))
  if (id === 'emploi') return xml(await entreesEmploi())
  if (id === 'regions') return xml(await getRegionsIndexables())
  if (id === 'departements') return xml(await getDepartementsIndexables())
  if (id === 'communes') return xml(await getCommunesIndexables())

  const m = id.match(/^(dentistes|prothesistes|maxillo-faciaux|stomatologues|orl)-(\d+)$/)
  if (!m) return null
  const [, base, tranche] = m
  const profession = PROFESSION_PAR_BASE[base as BaseUrl]
  return xml(await getFichesIndexables(profession, Number(tranche)))
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const corps = await contenu(id.replace(/\.xml$/, ''))
  if (!corps) return new Response('Sitemap introuvable', { status: 404 })
  return new Response(corps, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
