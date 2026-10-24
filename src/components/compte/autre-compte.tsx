'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-client'
import { chemin } from '@/lib/navigation'

/**
 * « C'est vous ? » : la fiche est peut-être gérée par votre autre compte.
 * On ferme la session en cours et on ouvre la connexion, où l'adresse de cet
 * autre compte reçoit, au besoin, un code.
 */
export function AutreCompte({ retour, children }: { retour: string; children: React.ReactNode }) {
  const [enCours, demarrer] = useTransition()
  const routeur = useRouter()
  return (
    <button
      type="button"
      disabled={enCours}
      onClick={() =>
        demarrer(async () => {
          await signOut()
          routeur.push(chemin(`/connexion/?retour=${encodeURIComponent(retour)}`))
        })
      }
      className="cursor-pointer font-semibold text-fg underline underline-offset-2 hover:no-underline disabled:opacity-60"
    >
      {children}
    </button>
  )
}
