'use client'

import { useState } from 'react'
import { Check, GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react'
import { NIVEAUX, VOIES, manqueFormation, resumeFormation, type FormationDeclaree, type Voie } from '@/lib/espace-pro/etablissement'

/**
 * Les formations d'un établissement (O3a, puis « Formations » du tableau de
 * bord). Chaque formation s'active ou se désactive sans être supprimée ; le
 * crayon ouvre ses champs sur place. Le formulaire reçoit la liste en JSON,
 * nue (`formations`) ou dans l'enveloppe d'un bloc (`valeur`).
 */
const champ = 'squircle-lg h-10 w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-line-strong'

export function SaisieFormations({ initiales, enveloppe = false }: { initiales: FormationDeclaree[]; enveloppe?: boolean }) {
  const [formations, setFormations] = useState(initiales)
  const [ouverte, setOuverte] = useState<string | null>(null)
  const maj = (id: string, p: Partial<FormationDeclaree>) => setFormations((x) => x.map((f) => (f.id === id ? { ...f, ...p } : f)))
  const valides = formations.filter((f) => f.intitule.trim().length >= 2)
  const json = JSON.stringify(enveloppe ? { formations: valides } : valides)

  const ajouter = () => {
    const id = `formation-${Date.now().toString(36)}`
    setFormations((x) => [...x, { id, intitule: '', niveau: null, duree: null, voies: [], acces: null, places: null, active: true }])
    setOuverte(id)
  }

  return (
    <div>
      <input type="hidden" name={enveloppe ? 'valeur' : 'formations'} value={json} />
      <ul className="space-y-2">
        {formations.map((f) => {
          const edition = ouverte === f.id
          return (
            <li key={f.id} className={`squircle-xl border bg-bg ${edition ? 'border-line-strong' : 'border-line'}`}>
              <div className="flex items-center gap-3 px-4 py-3">
                <GraduationCap className={`size-4 shrink-0 ${f.active ? 'text-fg' : 'text-fg-2'}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${f.active ? 'text-fg' : 'text-fg-2'}`}>{f.intitule || 'Nouvelle formation'}</p>
                  <p className="truncate text-xs text-fg-2">{resumeFormation(f) || 'Niveau, durée et voies à préciser'}</p>
                  {f.active && f.intitule && manqueFormation(f) && <p className="mt-0.5 truncate text-xs text-amber-700 dark:text-amber-300">{manqueFormation(f)}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setOuverte(edition ? null : f.id)}
                  aria-expanded={edition}
                  aria-label={`Modifier ${f.intitule || 'la formation'}`}
                  className="grid size-8 cursor-pointer place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg"
                >
                  {edition ? <Check className="size-4" aria-hidden /> : <Pencil className="size-4" aria-hidden />}
                </button>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" checked={f.active} onChange={(e) => maj(f.id, { active: e.target.checked })} className="peer sr-only" aria-label={`${f.intitule || 'Formation'} active`} />
                  <span className="h-6 w-10 rounded-full bg-line transition-colors peer-checked:bg-teal peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-action" />
                  <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                </label>
              </div>
              {edition && (
                <div className="space-y-3 border-t border-line px-4 py-4">
                  <div>
                    <label htmlFor={`${f.id}-intitule`} className="mb-1 block text-xs font-medium text-fg">
                      Intitulé du diplôme
                    </label>
                    <input id={`${f.id}-intitule`} value={f.intitule} maxLength={140} onChange={(e) => maj(f.id, { intitule: e.target.value })} placeholder="BTS Prothésiste dentaire" className={champ} autoFocus />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`${f.id}-niveau`} className="mb-1 block text-xs font-medium text-fg">
                        Niveau
                      </label>
                      <select id={`${f.id}-niveau`} value={f.niveau ?? ''} onChange={(e) => maj(f.id, { niveau: e.target.value || null })} className={champ}>
                        <option value="">À préciser</option>
                        {[...new Set([...(f.niveau ? [f.niveau] : []), ...NIVEAUX])].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`${f.id}-duree`} className="mb-1 block text-xs font-medium text-fg">
                        Durée
                      </label>
                      <input id={`${f.id}-duree`} value={f.duree ?? ''} maxLength={40} onChange={(e) => maj(f.id, { duree: e.target.value || null })} placeholder="2 ans" className={champ} />
                    </div>
                  </div>
                  <fieldset>
                    <legend className="mb-1.5 text-xs font-medium text-fg">Voies</legend>
                    <div className="flex flex-wrap gap-2">
                      {VOIES.map((v) => {
                        const on = f.voies.includes(v.code)
                        return (
                          <label key={v.code} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-bg px-3 text-xs font-medium text-fg has-[:checked]:border-fg has-[:checked]:bg-fg has-[:checked]:text-bg">
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => maj(f.id, { voies: (on ? f.voies.filter((x) => x !== v.code) : [...f.voies, v.code]) as Voie[] })}
                              className="sr-only"
                            />
                            {on && <Check className="size-3.5" aria-hidden />}
                            {v.libelle}
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>
                  <div>
                    <label htmlFor={`${f.id}-acces`} className="mb-1 block text-xs font-medium text-fg">
                      Conditions d’accès
                    </label>
                    <input id={`${f.id}-acces`} value={f.acces ?? ''} maxLength={200} onChange={(e) => maj(f.id, { acces: e.target.value || null })} placeholder="Après le bac, sur dossier et entretien" className={champ} />
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <div className="w-32">
                      <label htmlFor={`${f.id}-places`} className="mb-1 block text-xs font-medium text-fg">
                        Places par an
                      </label>
                      <input
                        id={`${f.id}-places`}
                        type="number"
                        min={1}
                        max={2000}
                        value={f.places ?? ''}
                        onChange={(e) => maj(f.id, { places: e.target.value ? Math.max(1, Math.min(2000, Math.round(Number(e.target.value)))) : null })}
                        className={champ}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormations((x) => x.filter((y) => y.id !== f.id))
                        setOuverte(null)
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
      </ul>
      {formations.length < 20 && (
        <button
          type="button"
          onClick={ajouter}
          className="squircle-full mt-2 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 border border-line bg-bg text-sm font-medium text-fg hover:border-line-strong"
        >
          <Plus className="size-4" aria-hidden /> Ajouter une formation
        </button>
      )}
    </div>
  )
}
