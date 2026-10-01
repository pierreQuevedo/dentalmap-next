'use client'

import type { BaseUrl } from '@/lib/annuaire/types'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSuggestionsCommune, type SuggestionCommune } from '@/lib/annuaire/use-suggestions'
import { Deroulant } from '@/components/site/deroulant'

/**
 * Champ de localisation avec suggestions.
 *
 * Le débit des suggestions vit dans `useSuggestionsCommune`, partagé avec le
 * champ de l'accueil : la table des communes est interrogée avec un index
 * trigramme, les fautes de frappe et les accents manquants sont rattrapés côté
 * base, pas ici.
 *
 * Le formulaire fonctionne sans JavaScript : la soumission envoie le texte
 * saisi et la page serveur résout la commune. Les suggestions ne sont qu'un
 * confort.
 */
export function ChampLieu({
  valeurInitiale,
  profession,
}: {
  valeurInitiale: string
  profession: BaseUrl
}) {
  const router = useRouter()
  const [texte, setTexte] = useState(valeurInitiale)
  const [ferme, setFerme] = useState(false)
  const [indexActif, setIndexActif] = useState(-1)
  const idListe = useId()

  const suggestions = useSuggestionsCommune(texte, valeurInitiale)
  const visibles = ferme ? [] : suggestions

  const choisir = (s: SuggestionCommune) => {
    setTexte(s.nom)
    setFerme(true)
    router.push(`/recherche/?profession=${profession}&lieu=${encodeURIComponent(s.code_insee)}` as never)
  }

  return (
    <div className="relative">
      <label htmlFor={idListe} className="block text-sm font-medium text-fg">
        Où cherchez-vous ?
      </label>
      <input
        id={idListe}
        name="q"
        value={texte}
        onChange={(e) => {
          setTexte(e.target.value)
          setFerme(false)
          setIndexActif(-1)
        }}
        onFocus={() => setFerme(false)}
        onBlur={() => setTimeout(() => setFerme(true), 120)}
        onKeyDown={(e) => {
          if (visibles.length === 0) return
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
            setFerme(true)
          }
        }}
        placeholder="Commune ou code postal"
        autoComplete="off"
        role="combobox"
        aria-expanded={visibles.length > 0}
        aria-controls={`${idListe}-liste`}
        aria-autocomplete="list"
        className="mt-1 w-full rounded-md border border-line-strong px-3 py-2 text-fg outline-none focus:border-fg"
      />
      <Deroulant ouvert={visibles.length > 0} className="absolute z-10 mt-1 w-full">
        <ul id={`${idListe}-liste`} role="listbox" className="w-full overflow-hidden rounded-md border border-line bg-bg shadow-lg">
          {visibles.map((s, i) => (
            <li key={s.code_insee}>
              <button
                type="button"
                role="option"
                aria-selected={i === indexActif}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choisir(s)}
                className={`flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm ${
                  i === indexActif ? 'bg-bg-soft' : 'hover:bg-bg-soft'
                }`}
              >
                <span className="text-fg">{s.nom}</span>
                <span className="shrink-0 text-xs text-fg-2">
                  {s.code_postal} {s.departement_nom}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Deroulant>
    </div>
  )
}
