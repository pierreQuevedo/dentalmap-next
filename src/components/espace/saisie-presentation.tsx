'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { PRESENTATION_MAX, PRESENTATION_MIN, termesRefuses } from '@/lib/espace-pro/fiche-completee'

/**
 * MIS-2 : la présentation, avec son compteur et le contrôle des termes refusés
 * en direct. Rien n'est réécrit : le texte est publié tel quel, mais ne
 * rapporte rien tant qu'un terme refusé y figure.
 */
export function SaisiePresentation({ initiale }: { initiale: string }) {
  const [texte, setTexte] = useState(initiale)
  const n = texte.trim().length
  const refuses = termesRefuses(texte)
  const ok = n >= PRESENTATION_MIN && n <= PRESENTATION_MAX && refuses.length === 0
  return (
    <div>
      <label htmlFor="presentation" className="sr-only">
        Présentation du cabinet
      </label>
      <textarea
        id="presentation"
        name="presentation"
        rows={8}
        maxLength={PRESENTATION_MAX + 200}
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        placeholder="Cabinet de deux fauteuils au cœur de la ville, à deux pas du tram. Nous assurons les soins courants et recevons volontiers les enfants…"
        className="squircle-xl w-full resize-y border border-line bg-bg p-4 text-[15px] leading-relaxed text-fg outline-none focus:border-line-strong"
      />
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3 text-sm" aria-live="polite">
        {refuses.length > 0 ? (
          <p className="flex items-start gap-2 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> « {refuses.join(' », « ')} » : terme refusé (publicité comparative ou promesse). La présentation reste à 0 point tant qu’il est présent.
          </p>
        ) : ok ? (
          <p className="flex items-center gap-2 text-teal">
            <CheckCircle2 className="size-4" aria-hidden /> La présentation compte pour la force de la fiche.
          </p>
        ) : (
          <p className="text-fg-2">Entre {PRESENTATION_MIN} et {PRESENTATION_MAX} caractères pour compter.</p>
        )}
        <p className={`tabular-nums ${n > PRESENTATION_MAX ? 'text-destructive' : 'text-fg-2'}`}>
          {n} / {PRESENTATION_MAX} caractères · minimum {PRESENTATION_MIN}
        </p>
      </div>
    </div>
  )
}
