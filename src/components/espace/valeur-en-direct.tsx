'use client'

import { useEffect, useState } from 'react'

/** La saisie annonce par cet événement la nouvelle valeur d'un bloc de l'aperçu : `{ cle, valeur }`. */
export const EVENEMENT_APERCU = 'dm-apercu'

/**
 * Une valeur de l'aperçu de l'onboarding qui suit la saisie : la ligne
 * « Délais » se met à jour dès qu'un délai est réglé, sans attendre
 * l'enregistrement.
 */
export function ValeurEnDirect({ cle, initiale }: { cle: string; initiale: string | null }) {
  const [valeur, setValeur] = useState(initiale)
  useEffect(() => {
    const ecouter = (e: Event) => {
      const d = (e as CustomEvent<{ cle: string; valeur: string | null }>).detail
      if (d.cle === cle) setValeur(d.valeur)
    }
    window.addEventListener(EVENEMENT_APERCU, ecouter)
    return () => window.removeEventListener(EVENEMENT_APERCU, ecouter)
  }, [cle])
  return <span className={`block truncate text-xs ${valeur ? 'text-fg' : 'text-fg-2'}`}>{valeur ?? 'À compléter'}</span>
}
