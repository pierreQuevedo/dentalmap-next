import { BASE_URL, PROFESSIONS } from '@/lib/annuaire/types'
import { compterFichesIndexables } from '@/lib/annuaire/queries'
import { url } from '@/lib/seo/site'

/**
 * Index des sitemaps.
 *
 * Écrit à la main plutôt que via `sitemap.ts` : la convention Next produit un
 * `<urlset>`, alors qu'un index doit être un `<sitemapindex>`. Un index servi
 * en `<urlset>` est accepté sans erreur par Google mais interprété comme une
 * liste de pages, et les tranches ne sont jamais lues.
 *
 * Un sitemap est limité à 50 000 URL. Les fiches sont découpées en tranches de
 * 10 000 : fichiers légers, régénération peu coûteuse.
 */
export const TAILLE_TRANCHE = 10_000

export async function GET() {
  const comptes = await Promise.all(PROFESSIONS.map((p) => compterFichesIndexables(p)))
  const [dentistes, prothesistes] = [comptes[0]!, comptes[1]!]
  void ([
    dentistes,
    prothesistes,
  ])

  const noms = ['pages', 'regions', 'departements', 'communes']
  PROFESSIONS.forEach((p, k) => {
    for (let i = 0; i * TAILLE_TRANCHE < comptes[k]!; i++) noms.push(`${BASE_URL[p]}-${i}`)
  })

  const maintenant = new Date().toISOString().replace(/\.\d+Z$/, 'Z')
  const corps = noms
    .map((n) => `  <sitemap><loc>${url(`/sitemap/${n}.xml`)}</loc><lastmod>${maintenant}</lastmod></sitemap>`)
    .join('\n')

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${corps}\n</sitemapindex>\n`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  )
}
