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
      {/* Lien d'évitement : invisible jusqu'au premier Tab, il saute la barre de navigation. */}
      <a
        href="#contenu"
        className="sr-only z-[70] rounded-md bg-bg px-4 py-2 text-sm font-medium text-fg ring-2 ring-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Aller au contenu
      </a>
      <Header />
      <div id="contenu" className="flex-1">{children}</div>
      <Footer />
    </>
  )
}
