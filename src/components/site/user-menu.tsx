'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { signOut, useSession } from '@/lib/auth-client'

/**
 * Menu compte.
 *
 * Isolé dans son propre composant client sous `Suspense` : il lit la session,
 * donc il est personnel, alors que tout le reste du header est cachable.
 */
export function UserMenu() {
  const { data: session } = useSession()
  const [ouvert, setOuvert] = useState(false)

  useEffect(() => {
    if (!ouvert) return
    const fermer = () => setOuvert(false)
    document.addEventListener('click', fermer)
    return () => document.removeEventListener('click', fermer)
  }, [ouvert])

  const item = 'block rounded-xl px-4 py-3 text-[15px] text-fg hover:bg-bg-soft'

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Menu du compte"
        aria-expanded={ouvert}
        aria-haspopup="true"
        onClick={(e) => {
          e.stopPropagation()
          setOuvert((o) => !o)
        }}
        className="inline-flex items-center gap-3 rounded-full border border-line py-1.5 pl-3 pr-1.5 text-fg transition-shadow hover:shadow-pill"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="size-4" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="grid size-[30px] place-items-center rounded-full bg-fg-2 text-bg">
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" aria-hidden>
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z" />
          </svg>
        </span>
      </button>

      {ouvert && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-[calc(100%+12px)] z-[55] min-w-[240px] rounded-[20px] border border-line bg-bg p-2 shadow-pop"
        >
          {session ? (
            <>
              <Link role="menuitem" href="/espace-pro" className={`${item} font-semibold`}>Espace pro</Link>
              <Link role="menuitem" href="/espace-pro/fiche" className={item}>Ma fiche</Link>
              <hr className="mx-2 my-1.5 border-line" />
              <Link role="menuitem" href="/faq" className={item}>Aide</Link>
              <button role="menuitem" type="button" onClick={() => signOut()} className={`${item} w-full text-left`}>
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link role="menuitem" href="/connexion?mode=inscription" className={`${item} font-semibold`}>
                Créer un compte
              </Link>
              <Link role="menuitem" href="/connexion" className={item}>Se connecter</Link>
              <hr className="mx-2 my-1.5 border-line" />
              <Link role="menuitem" href="/espace-pro/revendiquer" className={item}>Revendiquer ma fiche</Link>
              <Link role="menuitem" href="/faq" className={item}>Aide</Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
