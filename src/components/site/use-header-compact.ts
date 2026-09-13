'use client'

import { useSyncExternalStore } from 'react'

/**
 * Vrai au-delà de `seuil` pixels de défilement.
 *
 * Implémenté avec `useSyncExternalStore` et non avec un `useState` posé depuis
 * un effet : l'effet produirait un premier rendu faux suivi d'une correction,
 * ce que React signale désormais comme une erreur, et le serveur doit de toute
 * façon rendre l'état déplié.
 */
const abonner = (rappel: () => void) => {
  window.addEventListener('scroll', rappel, { passive: true })
  return () => window.removeEventListener('scroll', rappel)
}

export function useHeaderCompact(seuil = 40) {
  return useSyncExternalStore(
    abonner,
    () => window.scrollY > seuil,
    () => false,
  )
}
