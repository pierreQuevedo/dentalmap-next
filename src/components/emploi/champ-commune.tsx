'use client'

import { useEffect, useRef, useState } from 'react'
import { LocateFixed, MapPin } from 'lucide-react'

type Suggestion = { type: string; nom: string; code_insee?: string; code_postal?: string | null; departement_nom?: string }

/**
 * Une commune choisie dans les suggestions (`/api/geo/autocomplete`). Le
 * formulaire reçoit le code INSEE dans `commune` et le nom dans `communeNom`.
 * Avec `cabinet` (recherche de l'espace pro), le champ vide vaut le lieu du
 * cabinet.
 */
export function ChampCommune({ code, libelle, cabinet, invalide }: { code: string | null; libelle: string; cabinet?: string; invalide?: boolean }) {
  const [texte, setTexte] = useState(code ? libelle : '')
  const [choisi, setChoisi] = useState(code ?? '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [ouvert, setOuvert] = useState(false)
  const boite = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = texte.trim()
    if (q.length < 2 || (choisi && q === libelle)) return
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      fetch(`/api/geo/autocomplete/?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d: { suggestions: Suggestion[] }) => {
          setSuggestions(d.suggestions.filter((s) => s.type === 'commune'))
          setOuvert(true)
        })
        .catch(() => {})
    }, 180)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [texte, choisi, libelle])

  useEffect(() => {
    const fermer = (e: MouseEvent) => {
      if (!boite.current?.contains(e.target as Node)) setOuvert(false)
    }
    document.addEventListener('mousedown', fermer)
    return () => document.removeEventListener('mousedown', fermer)
  }, [])

  const vider = () => {
    setTexte('')
    setChoisi('')
    setSuggestions([])
    setOuvert(false)
  }

  return (
    <div ref={boite} className="relative">
      <input type="hidden" name="commune" value={choisi} />
      <input type="hidden" name="communeNom" value={choisi ? texte : ''} />
      <span className={`squircle-xl flex h-11 items-center gap-2 border bg-bg px-3.5 focus-within:border-line-strong ${invalide ? 'border-destructive' : 'border-line'}`}>
        <MapPin className="size-4 shrink-0 text-fg-2" aria-hidden />
        <input
          value={texte}
          onChange={(e) => {
            setTexte(e.target.value)
            setChoisi('')
          }}
          onFocus={() => suggestions.length && setOuvert(true)}
          placeholder={cabinet ?? 'Votre ville'}
          aria-label="Commune"
          autoComplete="off"
          className={`min-w-0 flex-1 bg-transparent text-sm text-fg outline-none ${cabinet ? 'placeholder:text-fg' : 'placeholder:text-fg-2'}`}
        />
        {texte && cabinet && (
          <button type="button" onClick={vider} className="shrink-0 cursor-pointer text-xs font-medium text-fg-2 hover:text-fg">
            Mon cabinet
          </button>
        )}
      </span>
      {ouvert && (
        <ul className="squircle-xl absolute inset-x-0 top-full z-20 mt-1 overflow-hidden border border-line bg-bg py-1 shadow-pop">
          {cabinet && (
            <li>
              <button type="button" onClick={vider} className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2 text-left text-sm text-fg hover:bg-bg-soft">
                <LocateFixed className="size-4 text-teal" aria-hidden /> Autour de mon cabinet
              </button>
            </li>
          )}
          {suggestions.map((s) => (
            <li key={s.code_insee}>
              <button
                type="button"
                onClick={() => {
                  setTexte(s.nom)
                  setChoisi(s.code_insee ?? '')
                  setOuvert(false)
                }}
                className="flex w-full cursor-pointer items-baseline justify-between gap-3 px-3.5 py-2 text-left text-sm text-fg hover:bg-bg-soft"
              >
                <span>{s.nom}</span>
                <span className="shrink-0 text-xs text-fg-2">{[s.code_postal, s.departement_nom].filter(Boolean).join(' · ')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
