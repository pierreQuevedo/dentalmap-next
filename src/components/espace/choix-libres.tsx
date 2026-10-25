'use client'

import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { PERSO_MAX, PREFIXE_PERSO, nomLibre } from '@/lib/espace-pro/labo'

/** La carte à cocher d'une marque (mission Marques) : initiales, nom, coche. */
export const CARTE_CHOIX =
  'group squircle-xl flex cursor-pointer items-center gap-3 border border-line bg-bg p-3 transition-colors hover:border-line-strong has-[:checked]:border-fg has-[:checked]:bg-bg-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action'

/** Les initiales d'un nom, pour la vignette d'une carte : « Nobel Biocare » → « NB ». */
export const initiales = (nom: string) =>
  nom
    .replace(/\(.*?\)/g, '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]!.toUpperCase())
    .join('')

/** Le contenu d'une carte à cocher : vignette, nom, case. */
export function ContenuCarte({ nom }: { nom: string }) {
  return (
    <>
      <span aria-hidden className="squircle-lg grid size-9 shrink-0 place-items-center bg-bg-soft text-xs font-bold text-fg-2 group-has-[:checked]:bg-fg group-has-[:checked]:text-bg">
        {initiales(nom)}
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium leading-tight text-fg">{nom}</span>
      <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-[5px] border border-line-strong bg-bg text-bg group-has-[:checked]:border-fg group-has-[:checked]:bg-fg">
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    </>
  )
}

const PUCE =
  'group inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-bg px-3 text-xs font-medium text-fg transition-colors hover:border-line-strong has-[:checked]:border-fg has-[:checked]:bg-fg has-[:checked]:text-bg has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action'

/**
 * Savoir-faire : les techniques ou matériaux que la liste ne propose pas,
 * nommés par le laboratoire. Chacun est une pastille cochée comme les
 * autres (`name` = `<prefixe><nom>`, `perso:` par défaut) ; décochée, elle
 * part à l'enregistrement. Cinq au plus. En `carte`, chaque nom est une carte
 * à cocher, comme les marques.
 */
export function ChoixLibres({ name, initiaux, ajout, exemple, prefixe = PREFIXE_PERSO, carte = false }: { name: string; initiaux: string[]; ajout: string; exemple: string; prefixe?: string; carte?: boolean }) {
  const [noms, setNoms] = useState(() => initiaux.filter((c) => c.startsWith(prefixe)).map((c) => c.slice(prefixe.length)))
  const [saisie, setSaisie] = useState<string | null>(null)
  const valide = saisie === null ? null : nomLibre(saisie)
  const ajouter = () => {
    if (!valide) return
    setNoms((n) => (n.includes(valide) ? n : [...n, valide]))
    setSaisie(null)
  }
  return (
    <>
      {noms.map((n) =>
        carte ? (
          <label key={n} className={CARTE_CHOIX}>
            <input type="checkbox" name={name} value={prefixe + n} defaultChecked className="sr-only" />
            <ContenuCarte nom={n} />
          </label>
        ) : (
          <label key={n} className={PUCE}>
            <input type="checkbox" name={name} value={prefixe + n} defaultChecked className="sr-only" />
            <Check className="hidden size-3.5 group-has-[:checked]:block" aria-hidden />
            {n}
          </label>
        ),
      )}
      {saisie === null ? (
        noms.length < PERSO_MAX && (
          <button
            type="button"
            onClick={() => setSaisie('')}
            className={
              carte
                ? 'squircle-xl flex cursor-pointer items-center justify-center gap-1.5 border border-dashed border-teal/50 p-3 text-sm font-medium text-teal hover:border-teal'
                : 'inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-dashed border-teal/50 px-3 text-xs font-medium text-teal hover:border-teal'
            }
          >
            <Plus className="size-3.5" aria-hidden /> {ajout}
          </button>
        )
      ) : (
        <span className={`flex w-full flex-wrap items-center gap-2 ${carte ? 'col-span-full' : ''}`}>
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
