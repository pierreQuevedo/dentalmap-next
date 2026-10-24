'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { EVENEMENT_COCHES } from './volet-carte'

/**
 * Le bouton d'un formulaire de cases à cocher (LE1) : désactivé tant
 * qu'aucune case `name` n'est cochée, avec la phrase qui le dit. Avec
 * `carte`, il annonce aussi les index des cases cochées au volet carte.
 */
export function BoutonSelection({ name, libelle, consigne, carte = false, className = '' }: { name: string; libelle: string; consigne: string; carte?: boolean; className?: string }) {
  const bouton = useRef<HTMLButtonElement>(null)
  const [coches, setCoches] = useState<number | null>(null)
  useEffect(() => {
    const formulaire = bouton.current?.closest('form')
    if (!formulaire) return
    const compter = () => {
      const cases = [...formulaire.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)]
      const cochees = cases.flatMap((c, i) => (c.checked ? [i] : []))
      setCoches(cochees.length)
      if (carte) window.dispatchEvent(new CustomEvent(EVENEMENT_COCHES, { detail: cochees }))
    }
    compter()
    formulaire.addEventListener('change', compter)
    return () => formulaire.removeEventListener('change', compter)
  }, [name, carte])
  const vide = coches === 0
  return (
    <>
      <button ref={bouton} type="submit" disabled={vide} className={`${className} disabled:cursor-not-allowed disabled:opacity-50`}>
        {libelle}
        <ArrowRight className="size-4" aria-hidden />
      </button>
      {vide && (
        <p role="status" className="mt-2 text-center text-xs text-fg-2">
          {consigne}
        </p>
      )}
    </>
  )
}
