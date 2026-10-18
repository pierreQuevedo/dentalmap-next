'use client'

import { EVENEMENT_CHOIX } from './volet-carte'

/**
 * Une fiche de la liste des homonymes (H1) : la survoler, la cibler au
 * clavier ou la cocher la montre sur la carte de gauche.
 */
export function SurvolFiche({ index, children }: { index: number; children: React.ReactNode }) {
  const montrer = () => window.dispatchEvent(new CustomEvent(EVENEMENT_CHOIX, { detail: index }))
  return (
    <div onMouseEnter={montrer} onFocus={montrer} onChange={montrer}>
      {children}
    </div>
  )
}
