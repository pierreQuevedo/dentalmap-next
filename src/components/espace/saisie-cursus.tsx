'use client'

import { useState } from 'react'
import { GraduationCap, Map as Plan, Plus, Trash2 } from 'lucide-react'

/**
 * Le cursus d'une faculté : trois cycles au plus, et les diplômes préparés
 * après le diplôme d'État. Le formulaire reçoit les deux listes ensemble,
 * en JSON dans `valeur`.
 */
type Cycle = { id: string; titre: string; annees: string; detail: string }

const champ = 'squircle-lg h-10 w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-line-strong'

export function CursusClient({ cycles: c0, autres: a0 }: { cycles: Cycle[]; autres: string[] }) {
  const [cycles, setCycles] = useState(c0)
  const [autres, setAutres] = useState(a0)
  const [nouveau, setNouveau] = useState('')
  const maj = (id: string, p: Partial<Cycle>) => setCycles((x) => x.map((c) => (c.id === id ? { ...c, ...p } : c)))
  const valeur = JSON.stringify({ cycles: cycles.filter((c) => c.titre.trim()), autresDiplomes: autres.filter((a) => a.trim().length >= 2) })

  return (
    <>
      <input type="hidden" name="valeur" value={valeur} />
      <section className="squircle-2xl border border-line bg-bg p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
          <Plan className="size-4 text-fg-2" aria-hidden /> Cycles
        </h2>
        <ol className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {cycles.map((c) => (
            <li key={c.id} className="squircle-xl space-y-2 border border-line p-3">
              <input aria-label="Années" value={c.annees} maxLength={60} onChange={(e) => maj(c.id, { annees: e.target.value })} placeholder="2e et 3e années" className={`${champ} h-8 text-xs`} />
              <input aria-label="Cycle" value={c.titre} maxLength={80} onChange={(e) => maj(c.id, { titre: e.target.value })} placeholder="DFGSO" className={`${champ} font-semibold`} />
              <textarea aria-label="Ce qu’on y fait" value={c.detail} maxLength={300} rows={3} onChange={(e) => maj(c.id, { detail: e.target.value })} className={`${champ} h-auto py-2 text-xs`} />
              <button type="button" onClick={() => setCycles((x) => x.filter((y) => y.id !== c.id))} className="inline-flex cursor-pointer items-center gap-1 text-xs text-fg-2 hover:text-destructive">
                <Trash2 className="size-3" aria-hidden /> Retirer
              </button>
            </li>
          ))}
          {cycles.length < 6 && (
            <li>
              <button
                type="button"
                onClick={() => setCycles((x) => [...x, { id: `cycle-${Date.now().toString(36)}`, titre: '', annees: '', detail: '' }])}
                className="squircle-xl grid h-full min-h-32 w-full cursor-pointer place-items-center border border-dashed border-line text-sm font-medium text-fg hover:border-line-strong"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Plus className="size-4" aria-hidden /> Ajouter un cycle
                </span>
              </button>
            </li>
          )}
        </ol>
      </section>
      <section className="squircle-2xl border border-line bg-bg p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
          <GraduationCap className="size-4 text-fg-2" aria-hidden /> Diplômes après le diplôme d’État
        </h2>
        <ul className="mt-3 divide-y divide-line text-sm">
          {autres.map((a, i) => (
            <li key={`${a}-${i}`} className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-fg">{a}</span>
              <button type="button" onClick={() => setAutres((x) => x.filter((_, k) => k !== i))} aria-label={`Retirer ${a}`} className="cursor-pointer text-fg-2 hover:text-destructive">
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        {autres.length < 20 && (
          <div className="mt-3 flex gap-2">
            <input
              value={nouveau}
              maxLength={140}
              onChange={(e) => setNouveau(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (nouveau.trim().length >= 2) setAutres((x) => [...x, nouveau.trim()])
                  setNouveau('')
                }
              }}
              placeholder="Diplôme universitaire d’implantologie"
              aria-label="Nouveau diplôme"
              className={champ}
            />
            <button
              type="button"
              onClick={() => {
                if (nouveau.trim().length >= 2) setAutres((x) => [...x, nouveau.trim()])
                setNouveau('')
              }}
              className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong"
            >
              <Plus className="size-4" aria-hidden /> Ajouter
            </button>
          </div>
        )}
      </section>
    </>
  )
}
