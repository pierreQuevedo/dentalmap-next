'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Suggestions de lieux, partagées par les deux champs de localisation.
 *
 * Le champ de la page de recherche et celui de l'accueil ne se ressemblent pas
 * du tout à l'écran, mais ils posent la même question au même endpoint, avec
 * les mêmes deux précautions : un délai de frappe, et une garde contre les
 * réponses qui reviennent dans le désordre. Ces deux précautions sont la seule
 * chose qui mérite d'être écrite une fois.
 */
export type SuggestionCommune = {
  type: 'commune'
  nom: string
  slug: string
  code_insee: string
  departement_nom: string
  departement_slug: string
  code_postal: string | null
  lon: number | null
  lat: number | null
}
export type SuggestionDepartement = { type: 'departement'; nom: string; slug: string; code: string; region_nom: string }
export type SuggestionRegion = { type: 'region'; nom: string; slug: string; code: string }
/** Ce que renvoie l'autocomplétion : communes, départements et régions mêlés, les deux derniers en tête. */
export type SuggestionLieu = SuggestionCommune | SuggestionDepartement | SuggestionRegion

export function useSuggestionsLieu(texte: string, valeurInitiale: string): SuggestionLieu[] {
  const [suggestions, setSuggestions] = useState<SuggestionLieu[]>([])
  const dernierAppel = useRef(0)

  // Deux caractères au minimum, et rien tant que la saisie n'a pas bougé depuis
  // la valeur rendue par le serveur : sans cela, arriver sur `/recherche/` avec
  // une commune déjà résolue rouvrirait aussitôt la liste sous le champ.
  const inerte = texte.trim().length < 2 || texte === valeurInitiale

  useEffect(() => {
    if (inerte) return
    const appel = ++dernierAppel.current
    const minuteur = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geo/autocomplete/?q=${encodeURIComponent(texte)}`)
        const data = await res.json()
        // Une réponse en retard ne doit pas écraser une saisie plus récente.
        if (appel === dernierAppel.current) setSuggestions(data.suggestions ?? [])
      } catch {
        if (appel === dernierAppel.current) setSuggestions([])
      }
    }, 180)
    return () => clearTimeout(minuteur)
  }, [texte, inerte])

  // La liste est dérivée de la saisie plutôt que vidée depuis l'effet : un
  // `setState` synchrone dans un effet provoque un rendu en cascade.
  return inerte ? [] : suggestions
}

/** Les communes seules, pour le champ de la page de recherche qui ne sait situer qu'une commune. */
export function useSuggestionsCommune(texte: string, valeurInitiale: string): SuggestionCommune[] {
  const lieux = useSuggestionsLieu(texte, valeurInitiale)
  return lieux.filter((l): l is SuggestionCommune => l.type === 'commune')
}
