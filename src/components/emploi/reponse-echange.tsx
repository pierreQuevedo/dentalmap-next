'use client'

import { useActionState, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { repondreEchange, type EtatCandidature } from '@/lib/emploi/actions-candidatures'
import { libelleCreneau } from '@/lib/emploi/candidature'

/** OUV-C-ECHANGE : choisir un créneau et accepter, en donnant son téléphone ; ou décliner. */
export function ReponseEchange({ candidature, creneaux, email }: { candidature: string; creneaux: string[]; email: string }) {
  const [etat, action, enCours] = useActionState<EtatCandidature, FormData>(repondreEchange, null)
  const [choisi, setChoisi] = useState(creneaux[0] ?? '')
  return (
    <form action={action} className="mt-4 space-y-4">
      <input type="hidden" name="candidature" value={candidature} />
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-fg">Choisissez un créneau</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {creneaux.map((c) => (
            <label key={c} className={`squircle-xl cursor-pointer border px-3.5 py-2.5 text-sm ${choisi === c ? 'border-teal bg-teal/10 font-medium text-teal' : 'border-line text-fg hover:border-line-strong'}`}>
              <input type="radio" name="creneau" value={c} checked={choisi === c} onChange={() => setChoisi(c)} className="sr-only" />
              {libelleCreneau(c)}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block max-w-xs">
        <span className="mb-1.5 block text-sm font-medium text-fg">Votre téléphone</span>
        <input
          name="telephone"
          type="tel"
          autoComplete="tel"
          placeholder="06 00 00 00 00"
          className={`squircle-xl w-full border bg-bg px-3.5 py-2.5 text-sm text-fg outline-none focus:border-line-strong ${etat?.champ === 'telephone' ? 'border-destructive' : 'border-line'}`}
        />
      </label>
      <p className="text-xs text-fg-2">En acceptant, le recruteur reçoit votre nom, ce téléphone et votre adresse {email}. Vous recevez le téléphone du cabinet.</p>
      {etat?.erreur && <p className="squircle-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">{etat.erreur}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" name="reponse" value="accepter" disabled={enCours} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
          {enCours && <Loader2 className="size-4 animate-spin" aria-hidden />} Accepter l’échange
        </button>
        <button type="submit" name="reponse" value="refuser" disabled={enCours} className="inline-flex h-10 cursor-pointer items-center rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong disabled:opacity-60">
          Décliner
        </button>
      </div>
    </form>
  )
}
