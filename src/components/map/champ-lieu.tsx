'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Champ de localisation avec suggestions.
 *
 * Interroge `/api/geo/autocomplete/`, qui cherche dans la table des communes
 * avec un index trigramme : les fautes de frappe et les accents manquants sont
 * rattrapés côté base, pas ici.
 *
 * Le formulaire fonctionne sans JavaScript : la soumission envoie le texte
 * saisi et la page serveur résout la commune. Les suggestions ne sont qu'un
 * confort.
 */
type Suggestion = {
  nom: string
  slug: string
  code_insee: string
  departement_nom: string
  departement_slug: string
  code_postal: string | null
  lon: number | null
  lat: number | null
}

export function ChampLieu({
  valeurInitiale,
  profession,
}: {
  valeurInitiale: string
  profession: 'dentistes' | 'prothesistes'
}) {
  const router = useRouter()
  const [texte, setTexte] = useState(valeurInitiale)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [ouvert, setOuvert] = useState(false)
  const [indexActif, setIndexActif] = useState(-1)
  const idListe = useId()
  const dernierAppel = useRef(0)

  // La liste affichée est dérivée de la saisie plutôt que vidée depuis l'effet :
  // un setState synchrone dans un effet provoque un rendu en cascade.
  const visibles = texte.trim().length < 2 || texte === valeurInitiale ? [] : suggestions

  useEffect(() => {
    if (texte.trim().length < 2 || texte === valeurInitiale) return
    const appel = ++dernierAppel.current
    const minuteur = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geo/autocomplete/?q=${encodeURIComponent(texte)}`)
        const data = await res.json()
        // Une réponse en retard ne doit pas écraser une saisie plus récente.
        if (appel === dernierAppel.current) {
          setSuggestions(data.suggestions ?? [])
          setOuvert(true)
          setIndexActif(-1)
        }
      } catch {
        setSuggestions([])
      }
    }, 180)
    return () => clearTimeout(minuteur)
  }, [texte, valeurInitiale])

  const choisir = (s: Suggestion) => {
    setTexte(s.nom)
    setOuvert(false)
    router.push(`/recherche/?profession=${profession}&lieu=${encodeURIComponent(s.code_insee)}` as never)
  }

  return (
    <div className="relative">
      <label htmlFor={idListe} className="block text-sm font-medium text-slate-700">
        Où cherchez-vous ?
      </label>
      <input
        id={idListe}
        name="q"
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        onFocus={() => visibles.length > 0 && setOuvert(true)}
        onBlur={() => setTimeout(() => setOuvert(false), 120)}
        onKeyDown={(e) => {
          if (!ouvert || visibles.length === 0) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setIndexActif((i) => Math.min(i + 1, visibles.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setIndexActif((i) => Math.max(i - 1, 0))
          } else if (e.key === 'Enter' && indexActif >= 0) {
            e.preventDefault()
            choisir(visibles[indexActif]!)
          } else if (e.key === 'Escape') {
            setOuvert(false)
          }
        }}
        placeholder="Commune ou code postal"
        autoComplete="off"
        role="combobox"
        aria-expanded={ouvert}
        aria-controls={`${idListe}-liste`}
        aria-autocomplete="list"
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900"
      />
      {ouvert && visibles.length > 0 && (
        <ul
          id={`${idListe}-liste`}
          role="listbox"
          className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
        >
          {visibles.map((s, i) => (
            <li key={s.code_insee}>
              <button
                type="button"
                role="option"
                aria-selected={i === indexActif}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choisir(s)}
                className={`flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm ${
                  i === indexActif ? 'bg-slate-100' : 'hover:bg-slate-50'
                }`}
              >
                <span className="text-slate-900">{s.nom}</span>
                <span className="shrink-0 text-xs text-slate-500">
                  {s.code_postal} {s.departement_nom}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
