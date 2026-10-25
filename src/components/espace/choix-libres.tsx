'use client'

import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { PERSO_MAX, PREFIXE_PERSO, nomLibre } from '@/lib/espace-pro/labo'

const PUCE =
  'group inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-bg px-3 text-xs font-medium text-fg transition-colors hover:border-line-strong has-[:checked]:border-fg has-[:checked]:bg-fg has-[:checked]:text-bg has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action'

/**
 * Savoir-faire : les techniques ou matériaux que la liste ne propose pas,
 * nommés par le laboratoire. Chacun est une pastille cochée comme les
 * autres (`name` = `perso:<nom>`) ; décochée, elle part à l'enregistrement.
 * Cinq au plus.
 */
export function ChoixLibres({ name, initiaux, ajout, exemple }: { name: string; initiaux: string[]; ajout: string; exemple: string }) {
  const [noms, setNoms] = useState(() => initiaux.filter((c) => c.startsWith(PREFIXE_PERSO)).map((c) => c.slice(PREFIXE_PERSO.length)))
  const [saisie, setSaisie] = useState<string | null>(null)
  const valide = saisie === null ? null : nomLibre(saisie)
  const ajouter = () => {
    if (!valide) return
    setNoms((n) => (n.includes(valide) ? n : [...n, valide]))
    setSaisie(null)
  }
  return (
    <>
      {noms.map((n) => (
        <label key={n} className={PUCE}>
          <input type="checkbox" name={name} value={PREFIXE_PERSO + n} defaultChecked className="sr-only" />
          <Check className="hidden size-3.5 group-has-[:checked]:block" aria-hidden />
          {n}
        </label>
      ))}
      {saisie === null ? (
        noms.length < PERSO_MAX && (
          <button type="button" onClick={() => setSaisie('')} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-dashed border-teal/50 px-3 text-xs font-medium text-teal hover:border-teal">
            <Plus className="size-3.5" aria-hidden /> {ajout}
          </button>
        )
      ) : (
        <span className="flex w-full flex-wrap items-center gap-2">
          <input
            autoFocus
            aria-label={ajout}
            value={saisie}
            maxLength={40}
            placeholder={`Ex. : ${exemple}`}
            onChange={(e) => setSaisie(e.target.value)}
            onKeyDown={(e) => {
              // Entrée ajoute sans envoyer le formulaire ; Échap annule.
              if (e.key === 'Enter') {
                e.preventDefault()
                ajouter()
              } else if (e.key === 'Escape') setSaisie(null)
            }}
            className="squircle-full h-9 min-w-0 flex-1 border border-line bg-bg px-4 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong"
          />
          <button type="button" onClick={ajouter} disabled={!valide} className="inline-flex h-9 cursor-pointer items-center rounded-full bg-fg px-4 text-sm font-semibold text-bg disabled:cursor-not-allowed disabled:opacity-40">
            Ajouter
          </button>
          <button type="button" onClick={() => setSaisie(null)} className="inline-flex h-9 cursor-pointer items-center rounded-full px-3 text-sm text-fg-2 hover:text-fg">
            Annuler
          </button>
        </span>
      )}
    </>
  )
}
