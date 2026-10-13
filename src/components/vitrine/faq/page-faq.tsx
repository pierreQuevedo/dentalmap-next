/**
 * Page « Questions fréquentes », version textuelle : sobre et rapide. Le
 * JSON-LD `FAQPage` porte toutes les questions de la page, produit depuis la
 * même liste que l'accordéon.
 */
import { Balisage } from '@/lib/seo/jsonld'
import { FAQ_JSONLD } from './donnees'
import { ListeFaq } from './liste'

export function PageFaq() {
  return (
    <main>
      <Balisage donnees={FAQ_JSONLD} />
      <ListeFaq />
    </main>
  )
}
