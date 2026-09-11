import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/site'

export default function robots(): MetadataRoute.Robots {
  // Tant que le site vit sur une URL de déploiement, on n'ouvre rien aux
  // moteurs : indexer une préproduction crée des doublons qu'il faut ensuite
  // désindexer un par un.
  const enProduction = process.env.VERCEL_ENV === 'production' && SITE_URL === 'https://dentalmap.fr'
  if (!enProduction) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // La recherche produit une infinité de combinaisons de paramètres,
        // sans valeur pour un index. Les pages canoniques sont les pages
        // hiérarchiques.
        disallow: ['/recherche/', '/espace-pro/', '/api/', '/setup-check/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
