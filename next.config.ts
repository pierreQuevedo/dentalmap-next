import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  // En développement, une seconde adresse locale (cookies séparés) pour tester un autre compte à côté du sien.
  allowedDevOrigins: ['test.localhost'],
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
  /*
   * En-têtes de sécurité, sur toutes les réponses. Aucune page n'est faite
   * pour être affichée dans le cadre d'un autre site : `frame-ancestors` et
   * `X-Frame-Options` l'interdisent (clickjacking). La CSP s'en tient aux
   * directives sans risque pour GTM, Axeptio, Clarity et la carte ; une
   * politique des scripts demanderait des nonces, à mener à part.
   * La géolocalisation reste permise au site (« Autour de moi »).
   */
  async headers() {
    return [
      {
        source: '/:chemin*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self), interest-cohort=()' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/annonces/collaboration/:reste*', destination: '/emploi/remplacements/', permanent: true },
      { source: '/annonces/remplacement/:reste*', destination: '/emploi/remplacements/', permanent: true },
      { source: '/annonces/emploi/:reste*', destination: '/emploi/', permanent: true },
      /*
       * Fiches de l'ancien site WordPress (prototype en Gironde), recopiées de
       * la table `redirections` que remplit `scripts/sync/redirections-ancien-site.ts`.
       * La page de fiche sait aussi rediriger, mais en cours de rendu : le
       * statut parti est 200 et la bascule se fait côté navigateur. Ici, la
       * réponse est une vraie 308, que les moteurs suivent.
       */
      { source: '/dentistes/gironde/begles/dr-chloe-maradeix/', destination: '/dentistes/gironde/begles/dr-chloe-maradeix-8507/', permanent: true },
      { source: '/dentistes/gironde/bordeaux/dr-clementine-balloy/', destination: '/dentistes/gironde/langon/dr-clementine-balloy-8581/', permanent: true },
      { source: '/dentistes/gironde/bordeaux/dr-jerome-leclair/', destination: '/dentistes/gironde/bordeaux/', permanent: true },
      { source: '/dentistes/gironde/bordeaux/dr-leilanie-firuu/', destination: '/dentistes/gironde/bordeaux/dr-leilanie-firuu-4240/', permanent: true },
      { source: '/dentistes/gironde/bordeaux/dr-marie-helene-biray/', destination: '/dentistes/gironde/bordeaux/', permanent: true },
      { source: '/dentistes/gironde/bruges/dr-eva-ilharreguy/', destination: '/dentistes/gironde/salles/dr-eva-ilharreguy-1904/', permanent: true },
      { source: '/dentistes/gironde/bruges/dr-josephine-natiez/', destination: '/dentistes/gironde/bruges/dr-josephine-natiez-7837/', permanent: true },
      { source: '/dentistes/gironde/fargues-saint-hilaire/dr-mohamed-ilyas-bekaddour/', destination: '/dentistes/gironde/fargues-saint-hilaire/dr-mohamed-ilyas-bekaddour-5125/', permanent: true },
      { source: '/dentistes/gironde/saint-loubes/dr-valentine-charpentier/', destination: '/dentistes/gironde/saint-loubes/dr-valentine-charpentier-0722/', permanent: true },
      { source: '/dentistes/gironde/saint-medard-en-jalles/dr-adrien-hottiaux/', destination: '/dentistes/gironde/saint-medard-en-jalles/dr-adrien-hottiaux-3110/', permanent: true },
      { source: '/prothesistes/gironde/bordeaux/andre-thierry/', destination: '/prothesistes/gironde/bordeaux/', permanent: true },
      { source: '/prothesistes/gironde/bordeaux/art-dental/', destination: '/prothesistes/gironde/bordeaux/', permanent: true },
      { source: '/prothesistes/gironde/bordeaux/artdent/', destination: '/prothesistes/gironde/bordeaux/artdent-7552/', permanent: true },
      { source: '/prothesistes/gironde/bordeaux/biesse/', destination: '/prothesistes/gironde/bordeaux/', permanent: true },
      { source: '/prothesistes/gironde/bordeaux/bodinaud/', destination: '/prothesistes/gironde/bordeaux/bodinaud-dentaire-2928/', permanent: true },
      { source: '/prothesistes/gironde/bordeaux/bouyssou/', destination: '/prothesistes/gironde/bordeaux/', permanent: true },
      { source: '/prothesistes/gironde/bouliac/corus-lso-bertin/', destination: '/prothesistes/gironde/bouliac/', permanent: true },
      { source: '/prothesistes/gironde/bouliac/corus-ortho-ios/', destination: '/prothesistes/gironde/bouliac/', permanent: true },
      { source: '/prothesistes/gironde/eysines/aquitaine-adjointe-wojeik-frederic/', destination: '/prothesistes/gironde/eysines/aquitaine-adjointe-wojeik-frederic-a3ca/', permanent: true },
      { source: '/prothesistes/gironde/pessac/bourdy-marc/', destination: '/prothesistes/gironde/pessac/', permanent: true },
    ]
  },
}

export default nextConfig
