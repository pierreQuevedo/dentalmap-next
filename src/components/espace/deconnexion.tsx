'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth-client'

/** Se déconnecter depuis l'espace pro : la session se ferme, retour à l'accueil du site. */
export function Deconnexion() {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()
  return (
    <button
      type="button"
      disabled={enCours}
      onClick={() =>
        demarrer(async () => {
          await signOut()
          router.push('/')
          router.refresh()
        })
      }
      className="squircle-lg flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-sm text-fg-2 hover:bg-bg hover:text-fg disabled:cursor-default disabled:opacity-60"
    >
      <LogOut className="size-4" aria-hidden />
      <span className="flex-1 text-left">{enCours ? 'Déconnexion…' : 'Se déconnecter'}</span>
    </button>
  )
}
