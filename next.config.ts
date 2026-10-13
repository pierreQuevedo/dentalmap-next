import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    editorial: { stale: 3600, revalidate: 3600, expire: 86400 },
    praticien: { stale: 86400, revalidate: 86400, expire: 604800 },
    listing: { stale: 43200, revalidate: 86400, expire: 604800 },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cms.dentalmap.fr' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  typedRoutes: true,
  /*
   * Hors Vercel Blob (développement sans jeton), le justificatif passe par
   * l'action serveur : 10 Mo et la marge du multipart. En production il part
   * directement du navigateur vers le stockage, voir `/api/espace-pro/justificatif/televerser/`.
   */
  experimental: { serverActions: { bodySizeLimit: '11mb' } },
  /**
   * Les URL de DentalMap se terminent par un slash, comme celles de l'ancien
   * site : `/dentistes/gironde/bordeaux/dr-martin-dupont/`. Sans ce réglage,
   * Next redirige en 308 vers la forme sans slash, ce qui casserait la parité
   * d'URL et ajouterait une redirection à chaque page indexée.
   *
   * Attention : le réglage vaut aussi pour les routes d'API. `/api/revalidate`
   * renvoie une 308 vers `/api/revalidate/`, et `wp_remote_post` en mode non
   * bloquant ne suit pas les redirections : le webhook WordPress est parti en
   * silence jusqu'à ce que la constante soit corrigée. Tout appelant d'API doit
   * inclure le slash final.
   */
  trailingSlash: true,
  /**
   * Anciennes rubriques d'annonces, passées dans Emploi. Les annonces ne
   * portent plus que les cessions de cabinet (`ANNONCE_TYPES`).
   *
   * `:reste*` couvre la page de rubrique comme ses annonces : les anciennes
   * annonces n'ont pas d'équivalent une à une, elles mènent à la liste la plus
   * proche. Les collaborations rejoignent les remplacements, page
   * « Remplacements et collaborations » de la rubrique Emploi. Avec
   * `trailingSlash`, Next ajoute le slash final avant d'appliquer la règle :
   * la destination l'écrit pour éviter une seconde redirection.
   */
  async redirects() {
    return [
      { source: '/annonces/collaboration/:reste*', destination: '/emploi/remplacements/', permanent: true },
      { source: '/annonces/remplacement/:reste*', destination: '/emploi/remplacements/', permanent: true },
      { source: '/annonces/emploi/:reste*', destination: '/emploi/', permanent: true },
    ]
  },
}

export default nextConfig
