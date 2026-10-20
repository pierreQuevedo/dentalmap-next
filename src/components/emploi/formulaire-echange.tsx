'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Loader2, MessageSquare, X } from 'lucide-react'
import { proposerEchange, type EtatCandidature } from '@/lib/emploi/actions-candidatures'
import { chemin } from '@/lib/navigation'

const champ = 'squircle-xl w-full border border-line bg-bg px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong'
const etiquette = 'mb-1.5 block text-sm font-medium text-fg'

/**
 * OUV-PD-ECHANGE : proposer un échange à un candidat. Un message, deux ou
 * trois créneaux, le téléphone du cabinet et la personne qui appellera.
 */
export function FormulaireEchange({ fiche, candidature, nom, detail, fermer, offre }: { fiche: string; candidature: string; nom: string; detail: string; fermer: string; offre: string }) {
  const [etat, action, enCours] = useActionState<EtatCandidature, FormData>(proposerEchange, null)
  const invalide = (c: string) => (etat?.champ === c ? 'border-destructive' : '')
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <Link href={chemin(fermer)} aria-label="Fermer" className="absolute inset-0 bg-[#0e1317]/50 backdrop-blur-[2px]" />
      <form action={action} role="dialog" aria-modal="true" aria-label="Proposer un échange" className="squircle-2xl relative max-h-full w-full max-w-lg overflow-y-auto bg-bg shadow-pop">
        <input type="hidden" name="fiche" value={fiche} />
        <input type="hidden" name="candidature" value={candidature} />
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-fg">Proposer un échange</h2>
            <p className="mt-1 text-sm text-fg-2">
              {nom} · {detail}
            </p>
          </div>
          <Link href={chemin(fermer)} aria-label="Fermer" className="grid size-9 shrink-0 place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg">
            <X className="size-5" aria-hidden />
          </Link>
        </div>
        <div className="space-y-5 px-6 py-5">
          <label className="block">
            <span className={etiquette}>Message</span>
            <textarea
              name="message"
              rows={4}
              maxLength={1000}
              defaultValue={`Bonjour, merci pour votre candidature à l’offre « ${offre} ». Seriez-vous disponible pour un premier échange au cabinet ou par téléphone ?`}
              className={`${champ} resize-y ${invalide('message')}`}
            />
          </label>
          <fieldset>
            <legend className={etiquette}>Créneaux proposés</legend>
            <div className="grid gap-2">
              {[0, 1, 2].map((i) => (
                <input key={i} name="creneaux" type="datetime-local" required={i < 2} aria-label={`Créneau ${i + 1}${i === 2 ? ', facultatif' : ''}`} className={`${champ} ${invalide('creneaux')}`} />
              ))}
            </div>
            <span className="mt-1 block text-xs text-fg-2">Deux ou trois créneaux : la personne en choisit un.</span>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={etiquette}>Téléphone du cabinet</span>
              <input name="telephone" type="tel" required autoComplete="tel" placeholder="05 56 00 00 00" className={`${champ} ${invalide('telephone')}`} />
            </label>
            <label className="block">
              <span className={etiquette}>Qui appellera</span>
              <input name="contact" maxLength={80} placeholder="Facultatif" className={champ} />
            </label>
          </div>
          <p className="squircle-xl bg-bg-soft px-3.5 py-2.5 text-xs leading-relaxed text-fg-2">
            Si la personne accepte, vous recevez son téléphone et son adresse email, et elle reçoit ceux du cabinet. Sinon, rien n’est partagé.
          </p>
        </div>
        <div className="border-t border-line px-6 py-4">
          {etat?.erreur && <p className="squircle-xl mb-3 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">{etat.erreur}</p>}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link href={chemin(fermer)} className="inline-flex h-11 items-center rounded-full px-4 text-sm font-medium text-fg-2 hover:text-fg">
              Annuler
            </Link>
            <button type="submit" disabled={enCours} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
              {enCours ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <MessageSquare className="size-4" aria-hidden />} Envoyer la proposition
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
