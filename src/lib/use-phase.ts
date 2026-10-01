'use client'

import { useEffect, useState } from 'react'

/**
 * Phase d'un élément qui entre puis sort.
 *
 * `entree` le temps d'une image après le montage, `visible` ensuite, `sortie`
 * quand la fermeture est demandée. L'état de départ est posé par le script
 * et non par `@starting-style` : celui-ci n'est pas lu par tous les
 * navigateurs, et la transition partait alors de l'état final, sans entrée.
 */
export type Phase = 'entree' | 'visible' | 'sortie'

export function usePhase(sortie: boolean): Phase {
  const [monte, setMonte] = useState(false)
  useEffect(() => {
    // Deux images : la première pose l'état de départ, la seconde lance la
    // transition. Une seule ne suffit pas toujours, le style de départ
    // n'ayant pas encore été appliqué quand la classe change.
    let second = 0
    const premier = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setMonte(true))
    })
    return () => {
      cancelAnimationFrame(premier)
      cancelAnimationFrame(second)
    }
  }, [])
  if (sortie) return 'sortie'
  return monte ? 'visible' : 'entree'
}
