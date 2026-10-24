'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'

/**
 * Le bouton d'un formulaire de cases à cocher (LE1) : désactivé tant
 * qu'aucune case `name` n'est cochée, avec la phrase qui le dit.
 */
export function BoutonSelection({ name, libelle, consigne, className = '' }: { name: string; libelle: string; consigne: string; className?: string }) {
  const bouton = useRef<HTMLButtonElement>(null)
  const [coches, setCoches] = useState<number | null>(null)
  useEffect(() => {
    const formulaire = bouton.current?.closest('form')
    if (!formulaire) return
    const compter = () => setCoches(formulaire.querySelectorAll(`input[name="${name}"]:checked`).length)
    compter()
    formulaire.addEventListener('change', compter)
    return () => formulaire.removeEventListener('change', compter)
  }, [name])
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
