'use client'

import { useEffect, useState, useTransition } from 'react'
import { KeyRound, Lock, Smartphone } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { pastille, saisie } from '@/components/compte/ui'
import { Criteres } from '@/components/compte/connexion'
import { MESSAGE_MOT_DE_PASSE, motDePasseValide } from '@/lib/tunnel/mot-de-passe'

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
          if (error) setMessage({ ok: false, texte: error.code === 'PASSWORD_TOO_WEAK' || error.code === 'PASSWORD_TOO_SHORT' ? MESSAGE_MOT_DE_PASSE : 'Le mot de passe actuel ne correspond pas.' })
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
        <input type="password" required minLength={12} autoComplete="new-password" value={nouveau} onChange={(e) => setNouveau(e.target.value)} placeholder="Nouveau mot de passe" aria-label="Nouveau mot de passe" className={saisie} />
      </div>
      <Criteres motDePasse={nouveau} />
      {message && (
        <p role="status" className={`text-sm ${message.ok ? 'text-teal' : 'text-destructive'}`}>
          {message.texte}
        </p>
      )}
      <button type="submit" disabled={enCours || !motDePasseValide(nouveau)} className="inline-flex h-10 cursor-pointer items-center rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong disabled:opacity-60">
        {enCours ? 'Enregistrement…' : 'Changer le mot de passe'}
      </button>
    </form>
  )
}

export function Appareils({ jetonCourant }: { jetonCourant: string | null }) {
  const [sessions, setSessions] = useState<Session[] | null>(null)
  // La liste demande une connexion de moins d'un jour (Better Auth) : au-delà, on propose de se reconnecter.
  const [ancienne, setAncienne] = useState(false)
  const [enCours, demarrer] = useTransition()
  useEffect(() => {
    let vivant = true
    authClient.listSessions().then(({ data, error }) => {
      if (!vivant) return
      if (error?.code === 'SESSION_NOT_FRESH') setAncienne(true)
      else setSessions((data as Session[] | null) ?? [])
    })
    return () => {
      vivant = false
    }
  }, [])
  if (ancienne) {
    return (
      <div className="mt-3 text-sm text-fg-2">
        <p>Par sécurité, la liste des appareils demande une connexion de moins d’un jour.</p>
        <button
          type="button"
          disabled={enCours}
          onClick={() =>
            demarrer(async () => {
              await authClient.signOut()
              window.location.assign(`/connexion/?retour=${encodeURIComponent(window.location.pathname + window.location.search)}`)
            })
          }
          className="mt-3 cursor-pointer font-medium text-fg underline underline-offset-4 hover:no-underline disabled:opacity-60"
        >
          Me reconnecter
        </button>
      </div>
    )
  }
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

type Cle = { id: string; name?: string | null; createdAt?: Date | string | null; deviceType?: string }

/** Clés d'accès (CX4) : les voir, en ajouter une sur cet appareil, en retirer une. Le mot de passe reste valable. */
export function ClesAcces() {
  const [cles, setCles] = useState<Cle[] | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null)
  const [enCours, demarrer] = useTransition()
  const recharger = () =>
    authClient.passkey.listUserPasskeys().then(({ data }) => setCles(((data as Cle[] | null) ?? []).sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0))))
  useEffect(() => {
    recharger()
  }, [])
  if (!cles) return <p className="mt-3 text-sm text-fg-2">Chargement des clés…</p>
  return (
    <div>
      {cles.length === 0 ? (
        <p className="mt-4 text-sm text-fg-2">Aucune clé. Avec une clé d’accès, vous vous connectez avec Face ID, Touch ID ou le code de votre appareil, sans mot de passe.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line text-sm">
          {cles.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-3">
              <span className="flex items-center gap-2 text-fg">
                <KeyRound className="size-4 text-fg-2" aria-hidden /> {c.name || 'Clé d’accès'}
                {c.createdAt && <span className="text-fg-2">· créée le {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
              </span>
              <button
                type="button"
                disabled={enCours}
                onClick={() =>
                  demarrer(async () => {
                    const { error } = await authClient.passkey.deletePasskey({ id: c.id })
                    setMessage(error ? { ok: false, texte: 'La clé n’a pas pu être retirée.' } : { ok: true, texte: 'Clé retirée. Pensez à la supprimer aussi de votre appareil.' })
                    await recharger()
                  })
                }
                className="cursor-pointer text-sm font-medium text-fg underline underline-offset-4 hover:no-underline disabled:opacity-60"
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      )}
      {message && (
        <p role="status" className={`mt-2 text-sm ${message.ok ? 'text-teal' : 'text-destructive'}`}>
          {message.texte}
        </p>
      )}
      <button
        type="button"
        disabled={enCours}
        onClick={() =>
          demarrer(async () => {
            const r = await authClient.passkey.addPasskey()
            setMessage(r?.error ? { ok: false, texte: 'La clé n’a pas été créée : la demande a été annulée ou votre appareil l’a refusée.' } : { ok: true, texte: 'Clé créée sur cet appareil.' })
            await recharger()
          })
        }
        className="mt-3 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong disabled:opacity-60"
      >
        <KeyRound className="size-4" aria-hidden /> {cles.length ? 'Ajouter une clé sur cet appareil' : 'Créer une clé d’accès'}
      </button>
    </div>
  )
}
