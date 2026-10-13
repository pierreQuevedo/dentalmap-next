'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'

type Entree = { ancre: string; titre: string }

/** Hauteur de l'en-tête collant du site, plus une marge de lecture. */
const SEUIL = 120

/**
 * L'entrée active : le dernier intertitre passé sous l'en-tête. Avant le
 * premier, la première entrée reste active, comme sur la maquette.
 */
function useEntreeActive(entrees: Entree[]) {
  const [active, setActive] = useState(entrees[0]?.ancre ?? null)
  useEffect(() => {
    let image = 0
    const mesurer = () => {
      image = 0
      let courante = entrees[0]?.ancre ?? null
      for (const e of entrees) {
        const el = document.getElementById(e.ancre)
        if (el && el.getBoundingClientRect().top <= SEUIL) courante = e.ancre
      }
      setActive(courante)
    }
    const auDefilement = () => {
      if (!image) image = requestAnimationFrame(mesurer)
    }
    mesurer()
    window.addEventListener('scroll', auDefilement, { passive: true })
    window.addEventListener('resize', auDefilement)
    return () => {
      window.removeEventListener('scroll', auDefilement)
      window.removeEventListener('resize', auDefilement)
      if (image) cancelAnimationFrame(image)
    }
  }, [entrees])
  return active
}

/** Colonne collante à gauche, en desktop. */
export function SommaireDesktop({ entrees }: { entrees: Entree[] }) {
  const active = useEntreeActive(entrees)
  return (
    <nav aria-label="Sommaire" className="sticky top-28 flex flex-col gap-3">
      <p className="text-sm font-semibold leading-5 text-fg">Dans cet article</p>
      <ol className="flex flex-col gap-3">
        {entrees.map((e) => {
          const actif = e.ancre === active
          return (
            <li key={e.ancre} className="flex gap-3">
              <span aria-hidden className={`w-0.5 shrink-0 self-stretch ${actif ? 'bg-action' : 'bg-line'}`} />
              <a
                href={`#${e.ancre}`}
                aria-current={actif ? 'location' : undefined}
                className={`min-w-0 flex-1 text-sm leading-5 hover:text-fg ${actif ? 'font-medium text-fg' : 'text-fg-2'}`}
              >
                {e.titre}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Repliable sous l'en-tête, en mobile et tablette. */
export function SommaireMobile({ entrees }: { entrees: Entree[] }) {
  const details = useRef<HTMLDetailsElement>(null)
  return (
    <details ref={details} className="group squircle-lg bg-bg-soft">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 text-[15px] font-medium text-fg [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          Dans cet article · {entrees.length} {entrees.length > 1 ? 'parties' : 'partie'}
        </span>
        <ChevronRight className="size-[18px] shrink-0 transition-transform group-open:rotate-90" strokeWidth={2} aria-hidden />
      </summary>
      <nav aria-label="Sommaire" className="px-4 pb-4">
        <ol className="flex flex-col gap-3 border-t border-line pt-4">
          {entrees.map((e) => (
            <li key={e.ancre}>
              <a href={`#${e.ancre}`} onClick={() => details.current?.removeAttribute('open')} className="text-sm leading-5 text-fg-2 hover:text-fg">
                {e.titre}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  )
}
