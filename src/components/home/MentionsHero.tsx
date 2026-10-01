'use client'

import { useEffect, useId, useRef, useState } from 'react'

/**
 * Le « i » des sources de la carte du hero.
 *
 * Même rôle que la pastille compacte de MapLibre, que le décor inerte rend
 * incliquable : un bouton rond en bas à droite, qui déplie au clic la ligne
 * d'attribution, registres pour les points, OpenFreeMap, OpenMapTiles et
 * OpenStreetMap pour le fond de plan. Les liens sont ceux que ces projets
 * demandent. Le bloc est sombre : jetons shadcn, pas les alias du site.
 *
 * Collé au bord bas, sous la bande de logos : dépliée, la ligne passe juste
 * en dessous des logos au lieu de les couvrir.
 */
export function MentionsHero() {
  const [ouvert, setOuvert] = useState(false)
  const racine = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!ouvert) return
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuvert(false)
    }
    const surClic = (e: MouseEvent) => {
      if (!racine.current?.contains(e.target as Node)) setOuvert(false)
    }
    document.addEventListener('keydown', surTouche)
    document.addEventListener('click', surClic)
    return () => {
      document.removeEventListener('keydown', surTouche)
      document.removeEventListener('click', surClic)
    }
  }, [ouvert])

  const lien = 'underline-offset-2 hover:underline'

  return (
    <div ref={racine} className="absolute right-4 bottom-2 z-20 flex items-center justify-end gap-2 md:right-6">
      <div
        id={id}
        hidden={!ouvert}
        className="rounded-full border border-border bg-background/85 px-3 py-1 text-xs leading-4 text-muted-foreground backdrop-blur-sm"
      >
        Praticiens : ANS (RPPS, ADELI), INSEE (Sirene) · Fond de plan{' '}
        <a href="https://openfreemap.org" className={lien} rel="noopener">
          OpenFreeMap
        </a>{' '}
        ©{' '}
        <a href="https://www.openmaptiles.org/" className={lien} rel="noopener">
          OpenMapTiles
        </a>
        , données ©{' '}
        <a href="https://www.openstreetmap.org/copyright" className={lien} rel="noopener">
          contributeurs OpenStreetMap
        </a>
      </div>
      <button
        type="button"
        aria-expanded={ouvert}
        aria-controls={id}
        aria-label="Sources de la carte"
        onClick={() => setOuvert((o) => !o)}
        className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background/85 text-foreground backdrop-blur-sm hover:bg-background"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
      </button>
    </div>
  )
}
