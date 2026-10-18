'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Le fond d'une fenêtre du parcours : un clic autour de la fenêtre, ou la
 * touche Échap, la ferme et ramène à `retour` (la fiche publique).
 */
export function FermerFenetre({ retour }: { retour: string }) {
  const router = useRouter()
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push(retour as never)
    }
    document.addEventListener('keydown', surTouche)
    return () => document.removeEventListener('keydown', surTouche)
  }, [retour, router])
  return <button type="button" aria-label="Fermer" onClick={() => router.push(retour as never)} className="fixed inset-0 z-0 cursor-default bg-bg/40 backdrop-blur-md" />
}
