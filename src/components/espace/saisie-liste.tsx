'use client'

import { useState } from 'react'
import { placesParVoie } from '@/lib/espace-pro/etablissement'
import { Check, Pencil, Plus, Trash2 } from 'lucide-react'

/**
 * Une liste d'éléments à champs simples : étapes d'accès aux études, cycles,
 * centres de soins. Chaque ligne s'ouvre sur place au crayon. Le formulaire
 * reçoit `{ [cle]: [...] }` en JSON dans `valeur`, validé par l'action.
 */
export type ChampListe =
  | { cle: string; libelle: string; type: 'texte'; exemple?: string; max: number; large?: boolean }
  | { cle: string; libelle: string; type: 'puces'; options: readonly string[]; courts?: Record<string, string> }

type Element = Record<string, string | string[]>

const champ = 'squircle-lg h-10 w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-line-strong'

export function SaisieListe({
  cle,
  initiales,
  champs,
  titre,
  sousTitre,
  ajout,
  max,
  prefixe,
  places,
}: {
  /** Nom de la liste dans le document : `voiesAcces`, `cycles`, `centres`. */
  cle: string
  initiales: Element[]
  champs: ChampListe[]
  /** Champ qui donne le titre de la ligne, et celui qui le complète. */
  titre: string
  sousTitre?: string
  ajout: string
  max: number
  prefixe: string
  /** Voies d'accès d'une faculté : le détail de la capacité d'accueil, d'où l'on lit les places de chaque voie. */
  places?: string | null
}) {
  const [elements, setElements] = useState<Element[]>(initiales)
  const [ouvert, setOuvert] = useState<string | null>(null)
  const maj = (id: string, p: Element) => setElements((x) => x.map((e) => (e.id === id ? { ...e, ...p } : e)))
  const valides = elements.filter((e) => String(e[titre] ?? '').trim().length >= 1)

  const ajouter = () => {
    const id = `${prefixe}-${Date.now().toString(36)}`
    const vide: Element = { id }
    for (const c of champs) vide[c.cle] = c.type === 'puces' ? [] : ''
    setElements((x) => [...x, vide])
    setOuvert(id)
  }

  return (
    <div>
      <input type="hidden" name="valeur" value={JSON.stringify({ [cle]: valides })} />
      <ol className="space-y-2">
        {elements.map((e, k) => {
          const id = String(e.id)
          const edition = ouvert === id
          const sous = sousTitre ? String(e[sousTitre] ?? '') : ''
          return (
            <li key={id} className={`squircle-2xl border bg-bg ${edition ? 'border-line-strong' : 'border-line'}`}>
              <div className="flex items-center gap-4 p-4">
                <span className="w-7 text-center text-xl font-light tabular-nums text-fg-2">{String(k + 1).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-fg">{String(e[titre] ?? '') || 'Nouvel élément'}</p>
                  {sous && <p className="truncate text-sm text-fg-2">{sous}</p>}
                </div>
                {places !== undefined && placesParVoie(places, String(e[titre] ?? '')) !== null && (
                  <span className="squircle-full shrink-0 bg-teal/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-teal">{placesParVoie(places, String(e[titre] ?? ''))} places</span>
                )}
                <button
                  type="button"
                  onClick={() => setOuvert(edition ? null : id)}
                  aria-expanded={edition}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong"
                >
                  {edition ? <Check className="size-3.5" aria-hidden /> : <Pencil className="size-3.5" aria-hidden />}
                  {edition ? 'Fermer' : 'Modifier'}
                </button>
              </div>
              {edition && (
                <div className="grid grid-cols-1 gap-3 border-t border-line p-4 sm:grid-cols-2">
                  {champs.map((c) =>
                    c.type === 'texte' ? (
                      <div key={c.cle} className={c.large ? 'sm:col-span-2' : ''}>
                        <label htmlFor={`${id}-${c.cle}`} className="mb-1 block text-xs font-medium text-fg">
                          {c.libelle}
                        </label>
                        <input
                          id={`${id}-${c.cle}`}
                          value={String(e[c.cle] ?? '')}
                          maxLength={c.max}
                          placeholder={c.exemple}
                          onChange={(ev) => maj(id, { [c.cle]: ev.target.value })}
                          className={champ}
                        />
                      </div>
                    ) : (
                      <fieldset key={c.cle} className="sm:col-span-2">
                        <legend className="mb-1.5 text-xs font-medium text-fg">{c.libelle}</legend>
                        <div className="flex flex-wrap gap-1.5">
                          {c.options.map((o) => {
                            const liste = (e[c.cle] as string[] | undefined) ?? []
                            const on = liste.includes(o)
                            return (
                              <label key={o} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-line bg-bg px-3 text-xs font-medium text-fg has-[:checked]:border-teal/30 has-[:checked]:bg-teal/10 has-[:checked]:text-teal">
                                <input type="checkbox" checked={on} onChange={() => maj(id, { [c.cle]: on ? liste.filter((x) => x !== o) : [...liste, o] })} className="sr-only" />
                                {on && <Check className="size-3" aria-hidden />}
                                {c.courts?.[o] ?? o}
                              </label>
                            )
                          })}
                        </div>
                      </fieldset>
                    ),
                  )}
                  <div className="flex justify-end sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        setElements((x) => x.filter((y) => y.id !== id))
                        setOuvert(null)
                      }}
                      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium text-fg-2 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" aria-hidden /> Retirer
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
        {elements.length < max && (
          <li>
            <button type="button" onClick={ajouter} className="squircle-2xl flex w-full cursor-pointer items-center gap-2 border border-dashed border-line p-4 text-sm font-medium text-fg hover:border-line-strong">
              <Plus className="size-4" aria-hidden /> {ajout}
            </button>
          </li>
        )}
      </ol>
    </div>
  )
}
