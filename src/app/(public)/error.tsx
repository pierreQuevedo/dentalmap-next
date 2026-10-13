'use client'

import { Page500 } from '@/components/vitrine/erreurs/page-500'

/**
 * Erreur dans une page publique : rendue sous l'en-tête et au-dessus du pied
 * de page du layout `(public)`, qui ne sont pas concernés par la limite.
 */
export default function Erreur({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <Page500 retry={retry} reference={error.digest} />
}
