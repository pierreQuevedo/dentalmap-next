'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/** Un texte à copier d'un clic : le lien court, le code du badge. */
export function Copier({ texte, affiche, mono = true }: { texte: string; affiche?: string; mono?: boolean }) {
  const [fait, setFait] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(texte)
        setFait(true)
        setTimeout(() => setFait(false), 1600)
      }}
      className={`squircle-lg flex h-11 w-full cursor-pointer items-center gap-2 border border-line bg-bg-soft px-3 text-left text-sm text-fg hover:border-line-strong ${mono ? 'font-mono' : ''}`}
    >
      <span className="min-w-0 flex-1 truncate">{affiche ?? texte}</span>
      <span className="flex shrink-0 items-center gap-1 text-xs text-fg-2" aria-live="polite">
        {fait ? <Check className="size-4 text-teal" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        {fait ? 'Copié' : 'Copier'}
      </span>
    </button>
  )
}
