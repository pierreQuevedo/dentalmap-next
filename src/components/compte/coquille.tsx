import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { getChiffresCles } from '@/lib/annuaire/queries'
import { CarteFrance } from './carte-france'

/**
 * La coquille des pages du compte : à gauche la carte, à droite le contenu.
 *
 * Le volet de gauche a les couleurs des cartes « Rien de déclaratif » de
 * l'accueil, `bg-muted` en clair comme en sombre : la carte pointillée, un
 * voile de la couleur du fond qui s'épaissit vers les bords, et en bas une
 * carte de verre dans les marges du site, qui dit la taille de l'annuaire
 * avec ses chiffres réels. Sur tablette, le volet disparaît et le formulaire
 * tient dans un encart ; sur mobile, ni volet ni encart. À droite, le
 * formulaire sur le fond du site, le lien de retour et la marque.
 */
/** « 67 000 » pour 67 697 : le millier inférieur, pour annoncer « plus de ». */
const millierInferieur = (n: number) => (Math.floor(n / 1000) * 1000).toLocaleString('fr-FR')

export async function Coquille({ children, retour = '/' }: { children: React.ReactNode; retour?: string }) {
  const chiffres = await getChiffresCles()
  const professionnels = millierInferieur(chiffres.dentistes + chiffres.prothesistes)
  const communes = chiffres.communes.toLocaleString('fr-FR')

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative isolate hidden min-h-dvh overflow-hidden bg-muted text-fg lg:block">
        <CarteFrance className="absolute inset-0 -z-20 size-full" />
        {/* Le voile : la couleur du fond, transparente au centre, pleine aux bords, adoucie par un flou. */}
        <span
          aria-hidden
          className="absolute -inset-8 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 60% 55% at 50% 46%, transparent 0%, color-mix(in srgb, var(--muted) 0%, transparent) 60%, color-mix(in srgb, var(--muted) 70%, transparent) 88%, var(--muted) 100%)',
            boxShadow: 'inset 0 0 90px 30px var(--muted)',
            filter: 'blur(12px)',
          }}
        />

        <div className="relative flex h-full flex-col justify-between">
          {/* Même place et même taille que dans l'en-tête du site : barre de 5 rem, mêmes marges. */}
          <div className="flex h-20 items-center px-5 md:px-10 xl:px-20">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-brand">
              <span aria-hidden className="size-[30px] rounded-md bg-brand" />
              DentalMap
            </Link>
          </div>
          {/* Carte de verre, dans les marges du site : le titre sur deux lignes et le sous-titre. */}
          <blockquote className="mx-5 mb-8 rounded-2xl border border-line bg-bg/50 p-6 shadow-pop backdrop-blur-xl md:mx-10 xl:mx-20 xl:p-8">
            <p className="text-balance text-2xl font-semibold leading-snug tracking-tight text-fg xl:text-3xl">
              Plus de {professionnels} professionnels
              <br />
              dans {communes} communes.
            </p>
            <footer className="mt-3 max-w-lg text-sm text-fg-2">
              Chirurgiens-dentistes, laboratoires de prothèse et spécialistes du visage, rapprochés des registres officiels
              chaque semaine.
            </footer>
          </blockquote>
        </div>
      </aside>

      <main className="relative isolate flex flex-col px-5 py-8 sm:px-10 lg:px-16 lg:py-12">
        <Link href={chemin(retour)} className="inline-flex items-center gap-2 self-start text-sm text-fg-2 hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden />
          Retour au site
        </Link>
        <div className="flex flex-1 items-center py-10">
          {/* Tablette : l'encart. Mobile et desktop : le formulaire nu. */}
          <div className="mx-auto w-full max-w-md md:rounded-3xl md:border md:border-line md:bg-bg md:p-8 md:shadow-pop lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
