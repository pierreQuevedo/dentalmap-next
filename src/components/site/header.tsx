import Link from 'next/link'
import { Suspense } from 'react'
import { getAccesRapide } from '@/lib/annuaire/acces-rapide'
import { getConseils } from '@/lib/wp/queries'
import type { NavLink } from '@/lib/navigation'
import { ThemeToggle } from './theme-toggle'
import { MainNav } from './main-nav'
import { MobileNav } from './mobile-nav'
import { RechercheHeader } from './recherche-header'
import { BookmarkIcon } from './nav-icon'
import { UserMenu } from './user-menu'

/**
 * En-tête du site.
 *
 * Une seule barre, de hauteur fixe, qui ne porte que la navigation. La loupe
 * déplie un panneau de recherche sous la barre, sur le modèle de la navigation
 * d'Apple, avec la page floutée derrière ; la page `/recherche/` reste la
 * destination du formulaire. L'entrée « Vous êtes praticien ? » vit dans le
 * menu du compte, pas dans la barre.
 *
 * Composant serveur : il charge les communes de l'accès rapide (requête
 * cachée, tag `annuaire`) et les passe au méga-menu. Seuls les fragments qui
 * ont besoin du navigateur ou de la session sont des composants client.
 */
export async function Header() {
  // Les deux requêtes sont cachées et indépendantes : les lancer ensemble
  // évite d'ajouter l'aller-retour WordPress à celui de la base.
  const [communes, conseils] = await Promise.all([getAccesRapide(8), getConseils()])
  const accesRapide: NavLink[] = communes.map((c) => ({ label: c.label, href: c.href }))

  return (
    <header id="site-header" className="sticky top-0 z-50 h-20 bg-bg">
      <div className="grid h-20 grid-cols-[auto_1fr_auto] items-center px-5 md:grid-cols-[1fr_auto_1fr] md:px-10 xl:px-20">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-brand">
          <span aria-hidden className="size-[30px] rounded-md bg-brand" />
          DentalMap
        </Link>

        <MainNav accesRapide={accesRapide} conseils={conseils.slice(0, 2)} />

        <div className="flex items-center justify-end gap-2">
          {/* Les fiches mises de côté. La page demande la connexion : le lien reste le même pour tous. */}
          <Link href="/favoris" aria-label="Mes favoris" className="grid size-9 place-items-center rounded-full text-fg hover:bg-bg-soft">
            <BookmarkIcon className="size-[18px]" />
          </Link>
          <RechercheHeader accesRapide={accesRapide} />
          {/* `size="icon"` fait 36 px, exactement la place réservée pendant
              l'hydratation : sans cela le bouton arrive 4 px plus petit et
              décale ses voisins. */}
          <ThemeToggle size="icon" aria-label="Changer de thème" tailleReservee="size-9" />
          <MobileNav accesRapide={accesRapide} />
          {/* La session n'est lue que par ce fragment : le reste du header
              reste identique pour tout le monde, donc cachable. */}
          <Suspense fallback={<span className="hidden h-[42px] w-[86px] rounded-full border border-line md:inline-block" />}>
            <div className="hidden md:block">
              <UserMenu />
            </div>
          </Suspense>
        </div>
      </div>
    </header>
  )
}
