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
