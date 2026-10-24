'use client'

import { useEffect, useState } from 'react'

/**
 * La carte de verre du volet de gauche, qui suit le profil choisi dans le
 * formulaire d'inscription : le formulaire annonce le profil par l'événement
 * `dm-profil`, la carte affiche ses chiffres. En connexion, ou avant tout
 * choix, la variante par défaut.
 */
export type VarianteChiffres = { titre: [string, string]; texte: string }

export const EVENEMENT_PROFIL = 'dm-profil'

export function ChiffresProfil({ variantes, defaut }: { variantes: Record<string, VarianteChiffres>; defaut: VarianteChiffres }) {
  const [profil, setProfil] = useState<string | null>(null)
  useEffect(() => {
    const ecouter = (e: Event) => setProfil((e as CustomEvent<string | null>).detail)
    window.addEventListener(EVENEMENT_PROFIL, ecouter)
    return () => window.removeEventListener(EVENEMENT_PROFIL, ecouter)
  }, [])
  const v = (profil && variantes[profil]) || defaut
  return (
    <>
      <p className="text-balance text-2xl font-semibold leading-snug tracking-tight text-fg xl:text-3xl">
        {v.titre[0]}
        <br />
        {v.titre[1]}
      </p>
      <footer className="mt-3 max-w-lg text-sm text-fg-2">{v.texte}</footer>
    </>
  )
}
