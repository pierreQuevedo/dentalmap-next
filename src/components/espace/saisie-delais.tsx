'use client'

import { useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { DELAI_MAX, DELAI_MIN, JOURS_RAMASSAGE, PIECES, PIECES_DEPART, RAYON_MAX, RAYON_MIN } from '@/lib/espace-pro/labo'

/**
 * LO2 et « Délais de fabrication » : un délai moyen par pièce, en jours
 * ouvrés, réglé au bouton ; une pièce s'ajoute ou se retire. Les délais
 * partent dans le formulaire en `delai_<pièce>`.
 */
export function SaisieDelais({ initiaux }: { initiaux: Record<string, number> | null }) {
  const [delais, setDelais] = useState<Record<string, number>>(() =>
    initiaux && Object.keys(initiaux).length ? { ...initiaux } : Object.fromEntries(PIECES.filter((p) => PIECES_DEPART.includes(p.code)).map((p) => [p.code, p.defaut])),
  )
  const reste = PIECES.filter((p) => !(p.code in delais))
  const regler = (code: string, pas: number) => setDelais((d) => ({ ...d, [code]: Math.min(DELAI_MAX, Math.max(DELAI_MIN, (d[code] ?? 1) + pas)) }))
  return (
    <div>
      <ul className="divide-y divide-line border-y border-line">
        {PIECES.filter((p) => p.code in delais).map((p) => (
          <li key={p.code} className="flex items-center gap-3 py-2.5">
            <input type="hidden" name={`delai_${p.code}`} value={delais[p.code]} />
            <span className="min-w-0 flex-1 text-sm text-fg">{p.libelle}</span>
            <span className="squircle-full flex items-center gap-1 border border-line p-1">
              <button type="button" onClick={() => regler(p.code, -1)} aria-label={`Réduire le délai : ${p.libelle}`} className="grid size-7 cursor-pointer place-items-center rounded-full bg-bg-soft text-fg hover:bg-line">
                <Minus className="size-3.5" aria-hidden />
              </button>
              <span className="w-12 text-center font-mono text-sm tabular-nums text-fg" aria-live="polite">
                {delais[p.code]} j
              </span>
              <button type="button" onClick={() => regler(p.code, 1)} aria-label={`Allonger le délai : ${p.libelle}`} className="grid size-7 cursor-pointer place-items-center rounded-full bg-bg-soft text-fg hover:bg-line">
                <Plus className="size-3.5" aria-hidden />
              </button>
            </span>
            <button
              type="button"
              onClick={() =>
                setDelais((d) => {
                  const n = { ...d }
                  delete n[p.code]
                  return n
                })
              }
              aria-label={`Retirer : ${p.libelle}`}
              className="grid size-8 cursor-pointer place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg"
            >
              <X className="size-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      {reste.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {reste.map((p) => (
            <button key={p.code} type="button" onClick={() => setDelais((d) => ({ ...d, [p.code]: p.defaut }))} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-dashed border-line px-3 text-xs font-medium text-fg-2 hover:border-line-strong hover:text-fg">
              <Plus className="size-3.5" aria-hidden /> {p.libelle}
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-fg-2">Délais moyens en jours ouvrés, de la réception de l’empreinte à l’expédition. Un délai moyen, pas un engagement : la fiche le dit aux cabinets.</p>
    </div>
  )
}

/** La zone desservie : le rayon au curseur, le ramassage et ses jours, l'envoi au-delà. */
export function SaisieZone({
  rayon,
  ramassage,
  jours,
  transporteur,
  complete = false,
}: {
  rayon: number | null
  ramassage: boolean | null
  jours: string[]
  transporteur: boolean | null
  /** Le tableau de bord montre aussi les jours de passage et le transporteur. */
  complete?: boolean
}) {
  const [km, setKm] = useState(rayon ?? 40)
  const [passe, setPasse] = useState(ramassage ?? true)
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <label htmlFor="zone-rayon" className="text-fg">
          Rayon desservi
        </label>
        <span className="font-mono tabular-nums text-fg">{km} km</span>
      </div>
      <input id="zone-rayon" name="rayon" type="range" min={RAYON_MIN} max={RAYON_MAX} step={5} value={km} onChange={(e) => setKm(Number(e.target.value))} className="mt-2 w-full accent-teal" />
      <div className="flex justify-between text-[11px] text-fg-2">
        <span>{RAYON_MIN} km</span>
        <span>{RAYON_MAX} km</span>
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-fg">
        <input type="checkbox" name="ramassage" checked={passe} onChange={() => setPasse((p) => !p)} className="peer sr-only" />
        <span aria-hidden className="relative h-5 w-9 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-teal peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-action after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
        Ramassage des empreintes au cabinet
      </label>
      {complete && passe && (
        <fieldset className="mt-3">
          <legend className="mb-2 text-xs text-fg-2">Jours de passage</legend>
          <div className="flex flex-wrap gap-1.5">
            {JOURS_RAMASSAGE.map((j) => (
              <label key={j.code} className="squircle-lg grid h-10 w-14 cursor-pointer place-items-center border border-line text-sm text-fg-2 has-[:checked]:border-teal/40 has-[:checked]:bg-teal/10 has-[:checked]:font-medium has-[:checked]:text-teal">
                <input type="checkbox" name="jour" value={j.code} defaultChecked={jours.includes(j.code)} className="sr-only" />
                {j.court}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {complete && (
        <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-fg">
          <input type="checkbox" name="transporteur" defaultChecked={transporteur ?? false} className="peer sr-only" />
          <span aria-hidden className="relative h-5 w-9 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-teal after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
          Envoi par transporteur au-delà de la zone
        </label>
      )}
    </div>
  )
}
