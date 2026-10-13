import { Page404 } from '@/components/vitrine/erreurs/pages-erreur'

/**
 * `notFound()` levé par une page publique : la 404 s'affiche entre l'en-tête
 * et le pied de page du layout `(public)`. Next pose de lui-même
 * `noindex` sur une réponse 404.
 */
export default function NotFound() {
  return <Page404 />
}
