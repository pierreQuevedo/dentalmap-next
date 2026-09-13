'use client'

import Link from 'next/link'
import { useState } from 'react'
import { chemin, type ExplorePanel } from '@/lib/navigation'

/** Au-delà, le panneau est replié derrière « Afficher plus ». */
const REPLIE = 17

export function FooterExplore({ panels }: { panels: ExplorePanel[] }) {
  const [actif, setActif] = useState(panels[0]?.id)
  const [deplie, setDeplie] = useState(false)
  const panel = panels.find((p) => p.id === actif) ?? panels[0]
  if (!panel) return null
  const liens = deplie ? panel.links : panel.links.slice(0, REPLIE)
  const davantage = panel.links.length > REPLIE

  return (
    <>
      <div role="tablist" className="flex gap-6 overflow-x-auto border-b border-line [scrollbar-width:none]">
        {panels.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`explore-tab-${p.id}`}
            aria-selected={p.id === panel.id}
            aria-controls={`explore-panel-${p.id}`}
            onClick={() => {
              setActif(p.id)
              setDeplie(false)
            }}
            className={[
              '-mb-px whitespace-nowrap border-b-2 py-3 font-medium transition-colors',
              p.id === panel.id ? 'border-fg text-fg' : 'border-transparent text-fg-2 hover:text-fg',
            ].join(' ')}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`explore-panel-${panel.id}`}
        aria-labelledby={`explore-tab-${panel.id}`}
        className="grid grid-cols-2 gap-x-6 gap-y-4 py-8 md:grid-cols-3 xl:grid-cols-6"
      >
        {liens.map((l) => (
          <Link key={l.href + l.title} href={chemin(l.href)} className="group block leading-[1.35]">
            <span className="block font-semibold text-fg group-hover:underline">{l.title}</span>
            <span className="text-fg-2">{l.sub}</span>
          </Link>
        ))}
        {davantage && (
          <button
            type="button"
            onClick={() => setDeplie((d) => !d)}
            className="self-end text-left font-semibold text-fg underline"
          >
            {deplie ? 'Afficher moins' : 'Afficher plus'}
          </button>
        )}
      </div>
    </>
  )
}
