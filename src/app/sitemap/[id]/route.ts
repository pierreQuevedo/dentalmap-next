import {
  getCommunesIndexables,
  getDepartementsIndexables,
  getFichesIndexables,
  type EntreeSitemap,
} from '@/lib/annuaire/queries'
import { url } from '@/lib/seo/site'

/**
 * Tranches de sitemap.
 *
 * Écrites à la main plutôt qu'avec `generateSitemaps` : la convention de
 * nommage de Next produit `/sitemap/0.xml`, qui n'apprend rien à qui lit le
 * fichier. `/sitemap/dentistes-0.xml` se comprend seul dans la Search Console.
 */
const PAGES_FIXES = ['/', '/dentistes/', '/prothesistes/', '/methode-de-verification/']

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

async function contenu(id: string): Promise<string | null> {
  const maintenant = new Date().toISOString().replace(/\.\d+Z$/, 'Z')

  if (id === 'pages') return xml(PAGES_FIXES.map((chemin) => ({ chemin, majLe: maintenant })))
  if (id === 'departements') return xml(await getDepartementsIndexables())
  if (id === 'communes') return xml(await getCommunesIndexables())

  const m = id.match(/^(dentistes|prothesistes)-(\d+)$/)
  if (!m) return null
  const [, base, tranche] = m
  const profession = base === 'dentistes' ? 'dentiste' : 'prothesiste'
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
