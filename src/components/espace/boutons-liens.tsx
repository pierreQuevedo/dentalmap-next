'use client'

import { useEffect, useState } from 'react'
import { CalendarCheck, ExternalLink, Globe } from 'lucide-react'

/**
 * Mission « Liens du cabinet » : les boutons de la fiche tels qu'ils
 * apparaîtront, qui suivent les champs `#lien-site` et `#lien-rdv` pendant
 * la saisie. Un champ vide, pas de bouton.
 */
export function BoutonsLiens({ site: siteInitial, rdv: rdvInitial }: { site: string; rdv: string }) {
  const [site, setSite] = useState(siteInitial)
  const [rdv, setRdv] = useState(rdvInitial)
  useEffect(() => {
    const suivre = (e: Event) => {
      const cible = e.target as HTMLInputElement
      if (cible.id === 'lien-site') setSite(cible.value.trim())
      if (cible.id === 'lien-rdv') setRdv(cible.value.trim())
    }
    document.addEventListener('input', suivre)
    return () => document.removeEventListener('input', suivre)
  }, [])
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <span className="inline-flex h-9 items-center gap-2 rounded-full bg-action px-4 text-xs font-semibold text-action-foreground">Appeler le cabinet</span>
      {rdv && (
        <span className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-bg px-4 text-xs font-medium text-fg">
          <CalendarCheck className="size-3.5" aria-hidden /> Prendre rendez-vous <ExternalLink className="size-3" aria-hidden />
        </span>
      )}
      {site && (
        <span className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-bg px-4 text-xs font-medium text-fg">
          <Globe className="size-3.5" aria-hidden /> Site du cabinet <ExternalLink className="size-3" aria-hidden />
        </span>
      )}
    </div>
  )
}
