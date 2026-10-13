'use client'

import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'

/**
 * Partager une offre : la feuille de partage du système quand elle existe
 * (mobile), sinon le lien copié dans le presse-papiers.
 */
export function Partage({ titre, sombre }: { titre: string; sombre?: boolean }) {
  const [copie, setCopie] = useState(false)
  async function partager() {
    const url = window.location.href.split('?')[0]!
    try {
      if (navigator.share) {
        await navigator.share({ title: titre, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopie(true)
      setTimeout(() => setCopie(false), 2000)
    } catch {
      // Partage annulé par la personne, ou presse-papiers refusé : rien à signaler.
    }
  }
  return (
    <button
      type="button"
      onClick={partager}
      aria-label={copie ? 'Lien copié' : 'Partager cette offre'}
      title={copie ? 'Lien copié' : 'Partager'}
      className={`inline-flex size-12 cursor-pointer items-center justify-center rounded-full border ${sombre ? 'border-white/20 bg-white/5 text-white' : 'border-line text-fg hover:bg-bg-soft'}`}
    >
      {copie ? <Check className="size-4" aria-hidden /> : <Share2 className="size-4" aria-hidden />}
    </button>
  )
}
