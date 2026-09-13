import Link from 'next/link'
import { Suspense } from 'react'
import { getAccesRapide } from '@/lib/annuaire/acces-rapide'
import type { NavLink } from '@/lib/navigation'
import { SearchIcon } from './nav-icon'
import { ThemeToggle } from './theme-toggle'
import { MainNav } from './main-nav'
import { MobileNav } from './mobile-nav'
import { UserMenu } from './user-menu'

/**
 * En-tête du site.
 *
 * Une seule barre, de hauteur fixe, qui ne porte que la navigation. La ligne
 * de recherche dépliée et son repli au défilement ont été retirés : la
 * recherche se fait depuis la page dédiée, l'icône de loupe y mène depuis
 * n'importe quelle page.
 *
 * Composant serveur : il charge les communes de l'accès rapide (requête
 * cachée, tag `annuaire`) et les passe au méga-menu. Seuls les fragments qui
 * ont besoin du navigateur ou de la session sont des composants client.
 */
export async function Header() {
  const communes = await getAccesRapide(8)
  const accesRapide: NavLink[] = communes.map((c) => ({ label: c.label, href: c.href }))

  return (
    <header id="site-header" className="sticky top-0 z-50 h-20 border-b border-line bg-bg">
      <div className="grid h-20 grid-cols-[auto_1fr_auto] items-center px-5 md:grid-cols-[1fr_auto_1fr] md:px-10 xl:px-20">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-brand">
          <span aria-hidden className="size-[30px] rounded-md bg-brand" />
          DentalMap
        </Link>

        <MainNav accesRapide={accesRapide} />

        <div className="flex items-center justify-end gap-2">
          <Link
            href="/recherche"
            aria-label="Rechercher un professionnel"
            className="grid size-9 place-items-center rounded-full text-fg hover:bg-bg-soft"
          >
            <SearchIcon className="size-[18px]" />
          </Link>
          <Link
            href="/espace-pro/revendiquer"
            className="hidden whitespace-nowrap rounded-full px-3 py-3 text-sm font-medium text-fg hover:bg-bg-soft lg:inline-block"
          >
            Vous êtes praticien ?
          </Link>
          <ThemeToggle tailleReservee="size-9" />
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
