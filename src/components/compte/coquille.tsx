import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { getChiffresCles } from '@/lib/annuaire/queries'
import { CarteFrance } from './carte-france'

/**
 * La coquille des pages du compte : à gauche la carte, à droite le contenu.
 *
 * Le volet de gauche est sombre quel que soit le thème, c'est une image :
 * l'ardoise du site, la carte pointillée, un voile de la couleur du fond qui
 * s'épaissit vers les bords, et en bas une carte de verre sur toute la
 * largeur, qui dit la taille de l'annuaire avec ses chiffres réels. Sur petit
 * écran le volet devient un bandeau au-dessus du contenu. À droite, deux
 * lueurs sarcelle derrière le formulaire, le lien de retour et la marque.
 */
const ARDOISE = '#16222b'

/** « 67 000 » pour 67 697 : le millier inférieur, pour annoncer « plus de ». */
const millierInferieur = (n: number) => (Math.floor(n / 1000) * 1000).toLocaleString('fr-FR')

export async function Coquille({ children, retour = '/' }: { children: React.ReactNode; retour?: string }) {
  const chiffres = await getChiffresCles()
  const professionnels = millierInferieur(chiffres.dentistes + chiffres.prothesistes)
  const communes = chiffres.communes.toLocaleString('fr-FR')

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative isolate h-44 overflow-hidden text-white sm:h-60 lg:h-auto lg:min-h-dvh" style={{ backgroundColor: ARDOISE }}>
        <CarteFrance className="absolute inset-0 -z-20 size-full" />
        {/* Le voile : la couleur du fond, transparente au centre, pleine aux bords, adoucie par un flou. */}
        <span
          aria-hidden
          className="absolute -inset-8 -z-10"
          style={{
            background: `radial-gradient(ellipse 60% 55% at 50% 46%, transparent 0%, ${ARDOISE}00 60%, ${ARDOISE}b3 88%, ${ARDOISE} 100%)`,
            boxShadow: `inset 0 0 90px 30px ${ARDOISE}`,
            filter: 'blur(12px)',
          }}
        />

        <div className="relative flex h-full flex-col justify-between">
          {/* Même place et même taille que dans l'en-tête du site : barre de 5 rem, mêmes marges. */}
          <div className="flex h-20 items-center px-5 md:px-10 xl:px-20">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              <span aria-hidden className="size-[30px] rounded-md bg-white" />
              DentalMap
            </Link>
          </div>
          {/* Carte de verre sur toute la largeur : le titre sur deux lignes et le sous-titre. */}
          <blockquote className="hidden border-t border-white/15 bg-white/10 px-5 py-8 shadow-pop backdrop-blur-xl md:px-10 lg:block xl:px-20">
            <p className="text-balance text-2xl font-semibold leading-snug tracking-tight xl:text-3xl">
              Plus de {professionnels} professionnels
              <br />
              dans {communes} communes.
            </p>
            <footer className="mt-3 max-w-lg text-sm text-white/70">
              Chirurgiens-dentistes, laboratoires de prothèse et spécialistes du visage, rapprochés des registres officiels
              chaque semaine.
            </footer>
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
