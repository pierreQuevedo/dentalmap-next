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
  const [dentistes, prothesistes] = await Promise.all([
    compterFichesIndexables('dentiste'),
    compterFichesIndexables('prothesiste'),
  ])

  const noms = ['pages', 'departements', 'communes']
  for (let i = 0; i * TAILLE_TRANCHE < dentistes; i++) noms.push(`dentistes-${i}`)
  for (let i = 0; i * TAILLE_TRANCHE < prothesistes; i++) noms.push(`prothesistes-${i}`)

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
