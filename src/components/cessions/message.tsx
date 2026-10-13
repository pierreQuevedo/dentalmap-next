'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CircleCheck, Mail, Send, Share2 } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { envoyerMessageCession, type ResultatMessage } from '@/lib/cessions/actions'
import { MESSAGE_MAX, MESSAGE_MIN } from '@/lib/cessions/format'

/**
 * Le message au cédant, pour un compte connecté : le bouton « Contacter le
 * cédant » ouvre le formulaire ; le message part dans la messagerie de
 * l'espace pro du cédant, qui est prévenu par email.
 */
export function FormulaireMessage({ annonceId, retour }: { annonceId: string; retour: string }) {
  const [ouvert, setOuvert] = useState(false)
  const [corps, setCorps] = useState('')
  const [resultat, setResultat] = useState<ResultatMessage | null>(null)
  const [enCours, demarrer] = useTransition()

  if (resultat?.ok) {
    return (
      <p role="status" className="squircle-xl flex items-start gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
        <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden /> {resultat.message}
      </p>
    )
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-action text-sm font-semibold text-action-foreground hover:bg-action-hover"
      >
        <Mail className="size-4" aria-hidden /> Contacter le cédant
      </button>
    )
  }

  const longueur = corps.trim().length
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        demarrer(async () => setResultat(await envoyerMessageCession(annonceId, corps)))
      }}
    >
      <div>
        <label htmlFor="cession-message" className="mb-1.5 block text-sm font-medium text-fg">
          Votre message
        </label>
        <textarea
          id="cession-message"
          rows={6}
          autoFocus
          required
          minLength={MESSAGE_MIN}
          maxLength={MESSAGE_MAX}
          value={corps}
          onChange={(e) => setCorps(e.target.value)}
          placeholder="Votre situation, votre projet de reprise et vos disponibilités pour une visite."
          className="w-full resize-y rounded-lg border border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong"
        />
        <p className="mt-1 text-right text-xs tabular-nums text-fg-2">
          {longueur.toLocaleString('fr-FR')} / {MESSAGE_MAX.toLocaleString('fr-FR')}
        </p>
      </div>
      {resultat && !resultat.ok && (
        <p role="alert" className="text-sm text-destructive">
          {resultat.erreur}
          {resultat.connexion && (
            <>
              {' '}
              <Link href={chemin(`/connexion/?retour=${encodeURIComponent(retour)}`)} className="font-medium underline underline-offset-4">
                Se connecter
              </Link>
            </>
          )}
        </p>
      )}
      <button
        type="submit"
        disabled={enCours || longueur < MESSAGE_MIN}
        className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-action text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="size-4" aria-hidden /> {enCours ? 'Envoi…' : 'Envoyer au cédant'}
      </button>
      <p className="text-xs text-fg-2">Votre adresse électronique n’est pas transmise : le cédant vous répond par la messagerie DentalMap.</p>
    </form>
  )
}

/** Partager l'annonce : la feuille de partage du système, sinon copie du lien. */
export function BoutonPartager({ titre }: { titre: string }) {
  const [copie, setCopie] = useState(false)
  return (
    <button
      type="button"
      aria-label={copie ? 'Lien copié' : 'Partager'}
      title={copie ? 'Lien copié' : 'Partager'}
      onClick={async () => {
        const url = window.location.href
        try {
          if (navigator.share) await navigator.share({ title: titre, url })
          else {
            await navigator.clipboard.writeText(url)
            setCopie(true)
            setTimeout(() => setCopie(false), 2000)
          }
        } catch {
          // Partage annulé par la personne : rien à faire.
        }
      }}
      className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
    >
      {copie ? <CircleCheck className="size-4" aria-hidden /> : <Share2 className="size-4" aria-hidden />}
    </button>
  )
}

