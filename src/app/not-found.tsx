import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { Page404 } from '@/components/vitrine/erreurs/pages-erreur'

/**
 * Adresse qui ne correspond à aucune route, ou `notFound()` levé hors des
 * pages publiques. Cette 404 se rend dans le seul layout racine : elle porte
 * donc elle-même l'en-tête et le pied de page du site, comme celle de
 * `(public)/not-found.tsx`. Next pose de lui-même `noindex` sur une 404.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <div id="contenu" className="flex-1">
        <Page404 />
      </div>
      <Footer />
    </>
  )
}
