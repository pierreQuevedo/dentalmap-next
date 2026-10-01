import type { Metadata } from 'next'
import { PageCartes } from '@/components/site/style-guide/cartes'

/**
 * Banc d'essai des cartes de résultats, page de travail.
 *
 * Plusieurs formes de carte par public, dentistes, laboratoires, écoles et
 * formations, posées côte à côte avec de vrais jetons et de vraies largeurs,
 * pour choisir celle de la recherche. Toutes les données sont inventées.
 * Hors index.
 */
export const metadata: Metadata = {
  title: 'Cartes de résultats',
  description: 'Banc d’essai des cartes de la recherche.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <PageCartes />
}
