'use client'

import { useEffect, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Deroulant } from '@/components/site/deroulant'

/** L'identifiant de la bascule « Liste | Carte » de l'en-tête, que la barre surveille. */
export const ID_VUES_EN_TETE = 'vues-cessions'

/**
 * La barre flottante des cessions, sur le modèle de celle de l'annuaire :
 * fixée en bas de l'écran, centrée, avec la bascule « Liste | Carte » et le
 * bouton des filtres, qui ouvre son panneau au-dessus de la barre.
 *
 * Toujours là sous `lg`, où l'en-tête ne porte plus la bascule. En grand
 * écran, elle n'apparaît qu'une fois la bascule de l'en-tête sortie de
 * l'écran : tant que celle-ci est visible, deux commandes identiques à
 * l'écran feraient doublon.
 */
export function BarreCessions({ vues, filtres, actifs }: { vues: React.ReactNode; filtres: React.ReactNode; actifs: number }) {
  // `null` avant la première mesure : masquée d'office en grand écran, pour ne pas apparaître le temps du chargement.
  const [enTeteVisible, setEnTeteVisible] = useState<boolean | null>(null)
  const [ouvert, setOuvert] = useState(false)

  useEffect(() => {
    const cible = document.getElementById(ID_VUES_EN_TETE)
    if (!cible) return
    const observateur = new IntersectionObserver(([e]) => setEnTeteVisible(!!e?.isIntersecting))
    observateur.observe(cible)
    return () => observateur.disconnect()
  }, [])

  useEffect(() => {
    if (!ouvert) return
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuvert(false)
    }
    document.addEventListener('keydown', surTouche)
    return () => document.removeEventListener('keydown', surTouche)
  }, [ouvert])

  // Masquée en grand écran seulement : sous `lg`, la cible est cachée et l'observateur la dit hors écran.
  const masquee = enTeteVisible === true && !ouvert
  const etat = enTeteVisible === null ? 'lg:translate-y-4 lg:opacity-0' : masquee ? 'translate-y-4 opacity-0' : ''
  const cliquable = enTeteVisible === null ? 'pointer-events-auto lg:pointer-events-none' : masquee ? '' : 'pointer-events-auto'

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 transition-[opacity,translate] duration-300 ${
        etat
      }`}
    >
      <div className={`relative ${cliquable}`}>
        <Deroulant ouvert={ouvert} origine="bas" className="absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2">
          <div role="dialog" aria-label="Filtres" className="squircle-2xl w-[22rem] max-w-[calc(100vw-2rem)] border border-line bg-bg shadow-pop">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h2 className="text-base font-semibold text-fg">Filtres</h2>
              <button
                type="button"
                onClick={() => setOuvert(false)}
                aria-label="Fermer les filtres"
                className="grid size-8 cursor-pointer place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-5 py-5">{filtres}</div>
          </div>
        </Deroulant>

        <div className="squircle-full flex items-center gap-1 border border-line bg-bg/90 p-1.5 shadow-pop backdrop-blur-xl">
          {vues}
          <span aria-hidden className="mx-0.5 h-6 w-px bg-line" />
          <button
            type="button"
            onClick={() => setOuvert((o) => !o)}
            aria-expanded={ouvert}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-fg px-4 text-sm font-semibold text-bg transition-colors hover:bg-fg/85"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filtres
            {actifs > 0 && <span className="grid size-5 place-items-center rounded-full bg-teal text-[11px] font-semibold text-white">{actifs}</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
