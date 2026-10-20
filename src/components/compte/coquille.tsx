import Link from 'next/link'
import { Logo } from '@/components/site/logo'
import { ArrowLeft, X } from 'lucide-react'
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

export async function Coquille({
  children,
  retour = '/',
  libelleRetour = 'Retour au site',
  fermer = false,
  volet,
  accroche,
}: {
  children: React.ReactNode
  retour?: string
  libelleRetour?: string
  /** Une croix au lieu de la flèche : « Enregistrer et quitter » de l'onboarding. */
  fermer?: boolean
  /** Un autre volet de gauche : la carte du parcours de revendication, par exemple. */
  volet?: React.ReactNode
  /** Le texte de la carte de verre, à la place des chiffres de l'annuaire (organismes). */
  accroche?: { titre: string; texte: string }
}) {
  if (volet) {
    return (
      <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <aside className="sticky top-0 hidden h-dvh lg:block">{volet}</aside>
        <Droite retour={retour} libelleRetour={libelleRetour} fermer={fermer}>
          {children}
        </Droite>
      </div>
    )
  }
  const chiffres = accroche ? null : await getChiffresCles()
  const professionnels = chiffres ? millierInferieur(chiffres.dentistes + chiffres.prothesistes) : ''
  const communes = chiffres?.communes.toLocaleString('fr-FR') ?? ''

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
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
            <Link href="/" className="inline-flex items-center" aria-label="DentalMap, accueil">
              <Logo />
            </Link>
          </div>
          {/* Carte de verre, dans les marges du site : le titre sur deux lignes et le sous-titre. */}
          <blockquote className="mx-5 mb-8 rounded-2xl border border-line bg-bg/50 p-6 shadow-pop backdrop-blur-xl md:mx-10 xl:mx-20 xl:p-8">
            <p className="text-balance text-2xl font-semibold leading-snug tracking-tight text-fg xl:text-3xl">
              {accroche ? (
                accroche.titre
              ) : (
                <>
                  Plus de {professionnels} professionnels
                  <br />
                  dans {communes} communes.
                </>
              )}
            </p>
            <footer className="mt-3 max-w-lg text-sm text-fg-2">
              {accroche?.texte ??
                'Chirurgiens-dentistes, laboratoires de prothèse et spécialistes du visage, rapprochés des registres officiels chaque semaine.'}
            </footer>
          </blockquote>
        </div>
      </aside>

      <Droite retour={retour} libelleRetour={libelleRetour}>
        {children}
      </Droite>
    </div>
  )
}

/** La colonne de droite : le lien de retour, puis le contenu centré. */
function Droite({ children, retour, libelleRetour, fermer = false }: { children: React.ReactNode; retour: string; libelleRetour: string; fermer?: boolean }) {
  return (
    <main className="relative isolate flex flex-col px-5 py-8 sm:px-10 lg:px-16 lg:py-12">
      <Link href={chemin(retour)} className="inline-flex items-center gap-2 self-start text-sm text-fg-2 hover:text-fg">
        {fermer ? <X className="size-4" aria-hidden /> : <ArrowLeft className="size-4" aria-hidden />}
        {libelleRetour}
      </Link>
      {/* Le contenu est centré : cette marge ne compte que pour un écran qui déborde, réduite sur grand écran pour que tout tienne. */}
      <div className="flex flex-1 items-center py-10 lg:py-4">
        {/* Tablette : l'encart. Mobile et desktop : le formulaire nu. */}
        <div className="mx-auto w-full max-w-md md:rounded-3xl md:border md:border-line md:bg-bg md:p-8 md:shadow-pop lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          {children}
        </div>
      </div>
    </main>
  )
}
