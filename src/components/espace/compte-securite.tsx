'use client'

import { useEffect, useState, useTransition } from 'react'
import { Lock, Smartphone } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { pastille, saisie } from '@/components/compte/ui'

/**
 * Compte et sécurité : changer le mot de passe, voir les appareils connectés,
 * déconnecter les autres. Tout passe par Better Auth, rien n'est stocké ici.
 */
type Session = { token: string; userAgent?: string | null; ipAddress?: string | null; updatedAt: Date | string; current?: boolean }

function appareil(ua?: string | null): string {
  if (!ua) return 'Appareil inconnu'
  const os = /iPhone|iPad/.test(ua) ? 'iPhone ou iPad' : /Android/.test(ua) ? 'Android' : /Mac OS/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Appareil'
  const nav = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'navigateur'
  return `${os} · ${nav}`
}

export function MotDePasse() {
  const [actuel, setActuel] = useState('')
  const [nouveau, setNouveau] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null)
  const [enCours, demarrer] = useTransition()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setMessage(null)
        demarrer(async () => {
          const { error } = await authClient.changePassword({ currentPassword: actuel, newPassword: nouveau, revokeOtherSessions: true })
          if (error) setMessage({ ok: false, texte: 'Le mot de passe actuel ne correspond pas, ou le nouveau fait moins de douze caractères.' })
          else {
            setMessage({ ok: true, texte: 'Mot de passe changé. Les autres appareils sont déconnectés.' })
            setActuel('')
            setNouveau('')
          }
        })
      }}
      className="mt-4 space-y-3"
    >
      <div className={pastille}>
        <Lock className="size-4 shrink-0 text-fg-2" aria-hidden />
        <input type="password" required autoComplete="current-password" value={actuel} onChange={(e) => setActuel(e.target.value)} placeholder="Mot de passe actuel" aria-label="Mot de passe actuel" className={saisie} />
      </div>
      <div className={pastille}>
        <Lock className="size-4 shrink-0 text-fg-2" aria-hidden />
        <input type="password" required minLength={12} autoComplete="new-password" value={nouveau} onChange={(e) => setNouveau(e.target.value)} placeholder="Nouveau, douze caractères au moins" aria-label="Nouveau mot de passe" className={saisie} />
      </div>
      {message && (
        <p role="status" className={`text-sm ${message.ok ? 'text-teal' : 'text-destructive'}`}>
          {message.texte}
        </p>
      )}
      <button type="submit" disabled={enCours} className="inline-flex h-10 cursor-pointer items-center rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong disabled:opacity-60">
        {enCours ? 'Enregistrement…' : 'Changer le mot de passe'}
      </button>
    </form>
  )
}

export function Appareils({ jetonCourant }: { jetonCourant: string | null }) {
  const [sessions, setSessions] = useState<Session[] | null>(null)
  const [enCours, demarrer] = useTransition()
  useEffect(() => {
    let vivant = true
    authClient.listSessions().then(({ data }) => {
      if (vivant) setSessions((data as Session[] | null) ?? [])
    })
    return () => {
      vivant = false
    }
  }, [])
  if (!sessions) return <p className="mt-3 text-sm text-fg-2">Chargement des appareils…</p>
  const tri = [...sessions].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  return (
    <div>
      <ul className="mt-2 divide-y divide-line text-sm">
        {tri.map((s) => (
          <li key={s.token} className="flex items-center justify-between gap-3 py-3">
            <span className="flex items-center gap-2 text-fg">
              <Smartphone className="size-4 text-fg-2" aria-hidden /> {appareil(s.userAgent)}
            </span>
            <span className="text-fg-2">{s.token === jetonCourant ? 'Cet appareil' : new Date(s.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
          </li>
        ))}
      </ul>
      {tri.length > 1 && (
        <button
          type="button"
          disabled={enCours}
          onClick={() =>
            demarrer(async () => {
              await authClient.revokeOtherSessions()
              setSessions((l) => (l ?? []).filter((s) => s.token === jetonCourant))
            })
          }
          className="mt-3 cursor-pointer text-sm font-medium text-fg underline underline-offset-4 hover:no-underline disabled:opacity-60"
        >
          Déconnecter les autres appareils
        </button>
      )}
    </div>
  )
}
