import type { Metadata } from 'next'

/**
 * Gabarit des pages dont le contenu n'est pas encore rédigé.
 *
 * Elles existent pour que la navigation soit complète et que `typedRoutes`
 * valide les liens : une entrée de menu sans cible est pire qu'une page
 * d'attente. Elles portent toutes `noindex` et sortent des sitemaps, le temps
 * d'être écrites.
 */
export function metadonneesEnAttente(titre: string, resume?: string): Metadata {
  return {
    title: titre,
    description: resume,
    robots: { index: false, follow: true },
  }
}

export function PageEnAttente({ titre, resume }: { titre: string; resume?: string }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-fg">{titre}</h1>
      {resume && <p className="mt-3 text-fg-2">{resume}</p>}
      <p className="mt-6 rounded-lg border border-line bg-bg-soft p-4 text-sm text-fg-2">
        Cette page est en cours de rédaction. Son contenu arrivera avec la reprise éditoriale.
      </p>
    </main>
  )
}
