'use client'

import { useActionState, useState } from 'react'
import { FileText, Loader2, Send } from 'lucide-react'
import { postuler, type EtatCandidature } from '@/lib/emploi/actions-candidatures'
import { MESSAGE_MAX } from '@/lib/emploi/candidature'

const champ = 'squircle-xl w-full border border-line bg-bg px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong'

/** OUV-C-POSTULER : le message, le CV facultatif, l'envoi. */
export function FormulairePostuler({ slug }: { slug: string }) {
  const [etat, action, enCours] = useActionState<EtatCandidature, FormData>(postuler, null)
  const [message, setMessage] = useState('')
  const [cv, setCv] = useState<string | null>(null)
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="offre" value={slug} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-fg">Votre message</span>
        <textarea
          name="message"
          rows={6}
          maxLength={MESSAGE_MAX}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Votre parcours, ce qui vous intéresse dans ce poste, vos disponibilités."
          className={`${champ} resize-y ${etat?.champ === 'message' ? 'border-destructive' : ''}`}
        />
        <span className="mt-1 block text-right text-xs text-fg-2">
          {message.length} / {MESSAGE_MAX.toLocaleString('fr-FR')} caractères
        </span>
      </label>
      <label className={`squircle-xl flex cursor-pointer items-center gap-3 border border-dashed p-4 hover:border-line-strong ${etat?.champ === 'cv' ? 'border-destructive' : 'border-line'}`}>
        <span className="squircle-lg grid size-10 shrink-0 place-items-center bg-bg-soft text-fg-2">
          <FileText className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-fg">{cv ?? 'Joindre un CV, facultatif'}</span>
          <span className="block text-xs text-fg-2">PDF, 5 Mo au plus</span>
        </span>
        <input type="file" name="cv" accept="application/pdf" className="sr-only" onChange={(e) => setCv(e.target.files?.[0]?.name ?? null)} />
      </label>
      <p className="squircle-xl bg-bg-soft px-3.5 py-2.5 text-xs leading-relaxed text-fg-2">
        Le recruteur voit votre prénom, l’initiale de votre nom, votre message et votre CV. Votre téléphone et votre email ne lui sont transmis que si vous acceptez un échange.
      </p>
      {etat?.erreur && <p className="squircle-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">{etat.erreur}</p>}
      <button type="submit" disabled={enCours} className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
        {enCours ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />} Envoyer ma candidature
      </button>
    </form>
  )
}
