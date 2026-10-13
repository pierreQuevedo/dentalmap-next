'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check } from 'lucide-react'

/**
 * « Enregistré » après une écriture réussie (paramètre `enregistre=1`), en
 * tête du tableau de bord. Le paramètre est retiré de l'adresse aussitôt
 * lu : un rechargement ne réaffiche pas le message.
 */
export function Enregistre({ enLigne }: { enLigne: boolean }) {
  const params = useSearchParams()
  const [visible] = useState(() => params.get('enregistre') === '1')

  useEffect(() => {
    if (!visible) return
    const url = new URL(window.location.href)
    url.searchParams.delete('enregistre')
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
  }, [visible])

  if (!visible) return null
  return (
    <p role="status" className="squircle-xl mb-4 flex items-center gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
      <Check className="size-4 shrink-0" aria-hidden />
      {enLigne ? 'Enregistré. Votre fiche publique est à jour.' : 'Enregistré. Ce sera publié dès la vérification de votre identité.'}
    </p>
  )
}
