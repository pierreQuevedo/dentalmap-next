'use client'

import { useActionState, useTransition } from 'react'
import Link from 'next/link'
import { Loader2, Send, X } from 'lucide-react'
import { inviterAPostuler, type EtatCandidature } from '@/lib/emploi/actions-candidatures'
import { chemin } from '@/lib/navigation'

const champ = 'squircle-xl w-full border border-line bg-bg px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong'
const etiquette = 'mb-1.5 block text-sm font-medium text-fg'

/**
 * Inviter un profil disponible à postuler : l'offre concernée parmi les
 * offres en ligne du recruteur, un mot facultatif. La personne reçoit l'offre
 * par email ; ses coordonnées ne sont transmises que si elle postule.
 */
export function FormulaireInvitation({ fiche, profil, nom, detail, offres, fermer }: { fiche: string; profil: string; nom: string; detail: string; offres: { id: string; titre: string }[]; fermer: string }) {
  const [etat, action, enCours] = useActionState<EtatCandidature, FormData>(inviterAPostuler, null)
  const [, demarrer] = useTransition()
  const invalide = (c: string) => (etat?.champ === c ? 'border-destructive' : '')
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <Link href={chemin(fermer)} scroll={false} aria-label="Fermer" className="absolute inset-0 bg-[#0e1317]/50 backdrop-blur-[2px]" />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const d = new FormData(e.currentTarget)
          demarrer(() => action(d))
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Inviter à postuler"
        className="squircle-2xl relative max-h-full w-full max-w-lg overflow-y-auto bg-bg shadow-pop"
      >
        <input type="hidden" name="fiche" value={fiche} />
        <input type="hidden" name="profil" value={profil} />
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-fg">Inviter à postuler</h2>
            <p className="mt-1 text-sm text-fg-2">
              {nom} · {detail}
            </p>
          </div>
          <Link href={chemin(fermer)} scroll={false} aria-label="Fermer" className="grid size-9 shrink-0 place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg">
            <X className="size-5" aria-hidden />
          </Link>
        </div>
        <div className="space-y-5 px-6 py-5">
          <label className="block">
            <span className={etiquette}>Offre concernée</span>
            <select name="offre" defaultValue={offres[0]?.id} className={`${champ} ${invalide('offre')}`}>
              {offres.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.titre}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={etiquette}>Un mot, facultatif</span>
            <textarea
              name="message"
              rows={4}
              maxLength={1000}
              defaultValue="Bonjour, votre profil correspond à un poste que nous proposons. N’hésitez pas à postuler."
              className={`${champ} resize-y ${invalide('message')}`}
            />
          </label>
          <p className="squircle-xl bg-bg-soft px-3.5 py-2.5 text-xs leading-relaxed text-fg-2">
            La personne reçoit votre offre par email, avec un lien pour postuler. Si elle postule, sa candidature arrive dans votre espace avec son téléphone et son email.
          </p>
        </div>
        <div className="border-t border-line px-6 py-4">
          {etat?.erreur && <p className="squircle-xl mb-3 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">{etat.erreur}</p>}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link href={chemin(fermer)} scroll={false} className="inline-flex h-11 items-center rounded-full px-4 text-sm font-medium text-fg-2 hover:text-fg">
              Annuler
            </Link>
            <button type="submit" disabled={enCours} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
              {enCours ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />} Envoyer l’invitation
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
