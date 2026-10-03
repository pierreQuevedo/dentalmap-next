'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { chemin } from '@/lib/navigation'
import { Telephone } from './primitives'

/**
 * Numéro de téléphone derrière une connexion.
 *
 * Le numéro n'est pas rendu par le serveur puis masqué en CSS : il n'est pas
 * dans la page du tout, et n'arrive qu'après un appel authentifié. Sans cela,
 * n'importe quel visiteur le lirait dans la source, et le verrou ne servirait
 * qu'à irriter.
 *
 * `possede` dit si le registre porte un numéro pour ce lieu : il vaut mieux
 * annoncer une absence que de faire cliquer vers un vide.
 */
export function TelephoneProtege({ lieuId, possede }: { lieuId: string; possede: boolean }) {
  const { data: session, isPending } = useSession()
  const chemin_ = usePathname()
  const [numero, setNumero] = useState<string | null>(null)
  const [etat, setEtat] = useState<'repos' | 'chargement' | 'erreur'>('repos')
  // La session peut être déjà connue au premier rendu client, alors que le
  // serveur a rendu l'attente : on attend d'être hydraté pour en tenir compte,
  // sinon l'hydratation trouve un lien là où elle attendait un point de suspension.
  const monte = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!possede) return <span className="text-fg-2">Non communiqué au registre</span>

  if (numero) return <Telephone numero={numero} />

  if (!monte || isPending) return <span className="text-fg-2">…</span>

  if (!session) {
    return (
      <Link
        href={chemin(`/connexion/?retour=${encodeURIComponent(chemin_)}`)}
        className="squircle-full inline-flex items-center gap-2 border border-line-strong px-3 py-1 text-sm font-medium text-fg hover:border-fg"
      >
        <Cadenas className="size-3.5" />
        Se connecter pour voir le numéro
      </Link>
    )
  }

  return (
    <button
      type="button"
      disabled={etat === 'chargement'}
      onClick={async () => {
        setEtat('chargement')
        try {
          const res = await fetch(`/api/praticiens/telephone/?lieu=${encodeURIComponent(lieuId)}`)
          if (!res.ok) throw new Error(String(res.status))
          const donnees = (await res.json()) as { telephone: string | null }
          if (donnees.telephone) setNumero(donnees.telephone)
          else setEtat('erreur')
        } catch {
          setEtat('erreur')
        }
      }}
      className="squircle-full inline-flex items-center gap-2 border border-line-strong px-3 py-1 text-sm font-medium text-fg hover:border-fg disabled:opacity-60"
    >
      {etat === 'chargement' ? 'Affichage…' : etat === 'erreur' ? 'Numéro indisponible' : 'Afficher le numéro'}
    </button>
  )
}

function Cadenas({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}
