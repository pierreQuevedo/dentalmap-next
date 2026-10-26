/**
 * Constantes du site.
 *
 * `SITE_URL` doit être l'origine canonique. Tant que le domaine n'est pas
 * basculé sur Vercel, elle vaut l'URL de déploiement, sans quoi les sitemaps
 * annonceraient des adresses injoignables.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === 'production'
    ? 'https://dentalmap.fr'
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')
).replace(/\/$/, '')

export const SITE_NOM = 'DentalMap'
export const SITE_DESCRIPTION =
  'Annuaire des chirurgiens-dentistes et des laboratoires de prothèse dentaire en France, ' +
  'vérifié auprès des registres officiels.'

export const url = (chemin: string) => `${SITE_URL}${chemin}`

/**
 * Socle Open Graph commun. Next ne fusionne pas `openGraph` entre segments :
 * une page qui définit le sien doit repartir de cet objet, et reprendre
 * `IMAGE_PARTAGE` (servie par `src/app/opengraph-image.tsx`) si elle n'a pas
 * d'image à elle.
 */
export const OPEN_GRAPH = { siteName: SITE_NOM, locale: 'fr_FR', type: 'website' } as const
export const IMAGE_PARTAGE_ALT = 'DentalMap, annuaire dentaire vérifié auprès des registres officiels'
export const IMAGE_PARTAGE = { url: '/opengraph-image/', width: 1200, height: 630, alt: IMAGE_PARTAGE_ALT }
