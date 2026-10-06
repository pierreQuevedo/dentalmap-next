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
      <aside className="relative isolate h-40 overflow-hidden bg-[#0e1317] text-white sm:h-56 lg:h-auto lg:min-h-dvh">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <CarteFrance className="h-[170%] w-auto max-w-none lg:h-auto lg:w-[94%]" />
        </div>
        <span aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-[#0e1317] to-transparent" />

        <div className="relative flex h-full flex-col justify-between p-6 lg:p-10">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-white">
            <span aria-hidden className="size-[26px] rounded-md bg-white" />
            DentalMap
          </Link>
          <blockquote className="hidden max-w-sm lg:block">
            <p className="text-balance text-2xl font-semibold leading-snug tracking-tight">
              Chaque fiche est vérifiée auprès des registres officiels avant d’apparaître ici.
            </p>
            <footer className="mt-3 text-sm text-white/60">Chirurgiens-dentistes, laboratoires, spécialistes du visage.</footer>
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
