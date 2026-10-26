import type { Metadata } from 'next'

/**
 * Anciennes adresses de l'espace candidat : elles ne font que rediriger vers
 * l'espace pro, après connexion. La redirection part pendant le rendu en
 * flux, si bien que la réponse est un 200 sans contenu : hors index.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function EspaceCandidatLayout({ children }: LayoutProps<'/espace-candidat'>) {
  return children
}
