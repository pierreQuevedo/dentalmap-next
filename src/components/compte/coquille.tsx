import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { CarteFrance } from './carte-france'

/**
 * La coquille des pages du compte : à gauche la carte, à droite le contenu.
 *
 * Le volet de gauche est sombre quel que soit le thème, c'est une image. Sur
 * petit écran il devient un bandeau au-dessus du contenu, la carte recadrée
 * sur sa partie haute. À droite, deux lueurs sarcelle derrière le formulaire,
 * le lien de retour au site et la marque.
 */
export function Coquille({ children, retour = '/' }: { children: React.ReactNode; retour?: string }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* L'ardoise du site, quel que soit le thème : c'est une image. */}
      <aside className="relative isolate h-44 overflow-hidden bg-[#16222b] text-white sm:h-60 lg:h-auto lg:min-h-dvh">
        <CarteFrance className="absolute inset-0 -z-10 size-full" />

        <div className="relative flex h-full flex-col justify-between">
          {/* Même place et même taille que dans l'en-tête du site : barre de 5 rem, mêmes marges. */}
          <div className="flex h-20 items-center px-5 md:px-10 xl:px-20">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              <span aria-hidden className="size-[30px] rounded-md bg-white" />
              DentalMap
            </Link>
          </div>
          {/* Carte de verre : le titre sur deux lignes et le sous-titre, posés sur la carte. */}
          <blockquote className="mx-5 mb-8 hidden max-w-md rounded-2xl border border-white/15 bg-white/10 p-6 shadow-pop backdrop-blur-xl md:mx-10 lg:block xl:mx-20">
            <p className="text-2xl font-semibold leading-snug tracking-tight">
              Chaque fiche est vérifiée
              <br />
              auprès des registres officiels.
            </p>
            <footer className="mt-3 text-sm text-white/70">Chirurgiens-dentistes, laboratoires, spécialistes du visage.</footer>
          </blockquote>
        </div>
      </aside>

      <main className="relative isolate flex flex-col px-5 py-8 sm:px-10 lg:px-16 lg:py-12">
        <span aria-hidden className="pointer-events-none absolute left-1/4 top-1/4 -z-10 size-80 rounded-full bg-teal/15 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute bottom-1/4 right-0 -z-10 size-72 rounded-full bg-teal/10 blur-3xl" />
        <Link href={chemin(retour)} className="inline-flex items-center gap-2 self-start text-sm text-fg-2 hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden />
          Retour au site
        </Link>
        <div className="flex flex-1 items-center py-10">
          <div className="w-full max-w-md lg:mx-auto">{children}</div>
        </div>
      </main>
    </div>
  )
}
