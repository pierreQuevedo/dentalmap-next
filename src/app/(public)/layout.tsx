import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'

/**
 * Toutes les pages publiques partagent l'en-tête et le pied de page. Les deux
 * lisent des requêtes cachées avec le tag `annuaire` : ils ne rendent pas les
 * pages dynamiques et se rafraîchissent avec la synchronisation.
 */
export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  )
}
