import Link from 'next/link'
import { Suspense } from 'react'
import { getAccesRapide } from '@/lib/annuaire/acces-rapide'
import type { NavLink } from '@/lib/navigation'
import { CacherEnCompact } from './cacher-en-compact'
import { ThemeToggle } from './theme-toggle'
import { MainNav } from './main-nav'
import { MobileNav } from './mobile-nav'
import { SearchPill } from './search-pill'
import { UserMenu } from './user-menu'

/**
 * En-tête du site.
 *
 * Composant serveur : il charge les communes de l'accès rapide (requête
 * cachée, tag `annuaire`) et les passe au méga-menu. Seuls les fragments qui
 * ont besoin du navigateur ou de la session sont des composants client.
 */
export async function Header() {
  const communes = await getAccesRapide(8)
  const accesRapide: NavLink[] = communes.map((c) => ({ label: c.label, href: c.href }))

  return (
    // La hauteur du header ne varie jamais : la ligne de recherche est posée
    // hors du flux par `SearchPill`, et le contenu des pages lui réserve
    // `--h-recherche`.
    <header id="site-header" className="sticky top-0 z-50 h-20 bg-bg">
      <div className="relative grid h-20 grid-cols-[auto_1fr_auto] items-center px-5 md:grid-cols-[1fr_auto_1fr] md:px-10 xl:px-20">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-brand">
          <span aria-hidden className="size-[30px] rounded-md bg-brand" />
          DentalMap
        </Link>

        <MainNav accesRapide={accesRapide} />

        <div className="flex items-center justify-end gap-2">
          <CacherEnCompact>
            <Link
              href="/espace-pro/revendiquer"
              className="hidden rounded-full px-3 py-3 text-sm font-medium text-fg hover:bg-bg-soft lg:inline-block"
            >
              Vous êtes praticien ?
            </Link>
          </CacherEnCompact>
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
      <SearchPill />
    </header>
  )
}
