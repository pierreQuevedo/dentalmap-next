'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { chemin } from '@/lib/navigation'
import { grouper, Telephone } from './primitives'

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
function useTelephone(lieuId: string) {
  const { data: session, isPending } = useSession()
  const page = usePathname()
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
  async function reveler(): Promise<string | null> {
    setEtat('chargement')
    try {
      const res = await fetch(`/api/praticiens/telephone/?lieu=${encodeURIComponent(lieuId)}`)
      if (!res.ok) throw new Error(String(res.status))
      const donnees = (await res.json()) as { telephone: string | null }
      if (donnees.telephone) {
        setNumero(donnees.telephone)
        return donnees.telephone
      }
      setEtat('erreur')
    } catch {
      setEtat('erreur')
    }
    return null
  }
  return {
    numero,
    etat,
    pret: monte && !isPending,
    connecte: !!session,
    connexion: chemin(`/connexion/?retour=${encodeURIComponent(page)}`),
    reveler,
  }
}

export function TelephoneProtege({ lieuId, possede }: { lieuId: string; possede: boolean }) {
  const t = useTelephone(lieuId)

  if (!possede) return <span className="text-fg-2">Non communiqué au registre</span>

  if (t.numero) return <Telephone numero={t.numero} />

  if (!t.pret) return <span className="text-fg-2">…</span>

  if (!t.connecte) {
    return (
      <Link
        href={t.connexion}
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
      disabled={t.etat === 'chargement'}
      onClick={() => void t.reveler()}
      className="squircle-full inline-flex items-center gap-2 border border-line-strong px-3 py-1 text-sm font-medium text-fg hover:border-fg disabled:opacity-60"
    >
      {t.etat === 'chargement' ? 'Affichage…' : t.etat === 'erreur' ? 'Numéro indisponible' : 'Afficher le numéro'}
    </button>
  )
}

/**
 * Bouton « Appeler » de l'en-tête et de la barre mobile, même verrou.
 *
 * Sans session, il mène à la connexion, cadenas à l'appui ; avec, le premier
 * clic lit le numéro et le bouton devient un lien `tel:` qui l'affiche. Sans
 * numéro au registre, il n'est pas rendu : rien à appeler.
 */
export function BoutonAppeler({
  lieuId,
  possede,
  libelle,
  className,
}: {
  lieuId: string
  possede: boolean
  libelle: string
  className: string
}) {
  const t = useTelephone(lieuId)
  if (!possede) return null

  if (t.numero) {
    return (
      <a href={`tel:${t.numero.replace(/[^\d+]/g, '')}`} className={className}>
        <Phone className="size-4" aria-hidden /> <span className="tabular-nums">{grouper(t.numero)}</span>
      </a>
    )
  }

  if (!t.connecte || !t.pret) {
    return (
      <Link href={t.connexion} className={className} title="Connectez-vous pour voir le numéro">
        <Phone className="size-4" aria-hidden /> {libelle}
        <Cadenas className="size-3.5 opacity-70" />
        <span className="sr-only"> : connexion requise pour voir le numéro</span>
      </Link>
    )
  }

  return (
    <button type="button" disabled={t.etat === 'chargement'} onClick={() => void t.reveler()} className={`${className} disabled:opacity-60`}>
      <Phone className="size-4" aria-hidden />
      {t.etat === 'chargement' ? 'Affichage…' : t.etat === 'erreur' ? 'Numéro indisponible' : libelle}
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
