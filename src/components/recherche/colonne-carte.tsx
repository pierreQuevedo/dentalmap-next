'use client'

import { useEffect, useState } from 'react'
import { List, Map as IconeCarte } from 'lucide-react'

const LARGE = '(min-width: 1024px)'

/**
 * La colonne de la carte.
 *
 * À partir de `lg`, la carte est à droite de la liste, collée sous l'en-tête.
 * En dessous, sur le modèle de SeLoger, la liste passe d'abord : la carte
 * n'est plus intercalée entre l'en-tête et les résultats, elle s'ouvre en
 * plein écran depuis un bouton « Carte » posé au-dessus de la barre de
 * recherche, et le même bouton, devenu « Liste », la referme.
 *
 * La carte n'est montée qu'au besoin : d'emblée en grand écran, à la
 * première ouverture en petit écran. Un téléphone qui ne l'ouvre jamais ne
 * charge ni MapLibre ni ses tuiles. Une fois montée, elle le reste.
 *
 * `mobile` à faux : pas de carte du tout sous `lg`, ni bouton (page par
 * département, où la liste des départements suffit).
 */
export function ColonneCarte({ mobile = true, children }: { mobile?: boolean; children: React.ReactNode }) {
  const [montee, setMontee] = useState(false)
  const [ouverte, setOuverte] = useState(false)

  useEffect(() => {
    const requete = window.matchMedia(LARGE)
    const suivre = () => {
      if (requete.matches) {
        setMontee(true)
        setOuverte(false)
      }
    }
    suivre()
    requete.addEventListener('change', suivre)
    return () => requete.removeEventListener('change', suivre)
  }, [])

  // Carte ouverte : la page dessous ne défile plus, Échap la referme.
  useEffect(() => {
    if (!ouverte) return
    const precedent = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuverte(false)
    }
    document.addEventListener('keydown', surTouche)
    return () => {
      document.body.style.overflow = precedent
      document.removeEventListener('keydown', surTouche)
    }
  }, [ouverte])

  const basculer = () => {
    setMontee(true)
    setOuverte((o) => !o)
  }

  return (
    <>
      <aside
        id="carte-resultats"
        className={`lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block lg:border-l lg:border-line ${
          ouverte ? 'max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-20 max-lg:z-30 max-lg:bg-bg' : 'max-lg:hidden'
        }`}
      >
        {/* `top-20` est la hauteur de l'en-tête collant, cinq rem. */}
        <div className="size-full lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">{montee && children}</div>
      </aside>

      {mobile && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[5.25rem] z-40 flex justify-center lg:hidden">
          <button
            type="button"
            onClick={basculer}
            aria-controls="carte-resultats"
            aria-expanded={ouverte}
            className="squircle-full pointer-events-auto inline-flex h-10 items-center gap-2 border border-line bg-bg/90 px-4 text-sm font-semibold text-fg shadow-pop backdrop-blur-xl hover:bg-bg-soft"
          >
            {ouverte ? <List className="size-4" aria-hidden /> : <IconeCarte className="size-4" aria-hidden />}
            {ouverte ? 'Liste' : 'Carte'}
          </button>
        </div>
      )}
    </>
  )
}
