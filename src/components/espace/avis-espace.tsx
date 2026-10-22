'use client'

import { useActionState, useState } from 'react'
import { MessageSquareQuote, Pencil } from 'lucide-react'
import { repondreAvis, type EtatAvis } from '@/lib/formation/actions-avis'
import { REPONSE_MAX } from '@/lib/formation/avis'

/** Répondre à un avis au nom de l'établissement, ou modifier la réponse ; vide, elle est retirée. */
export function ReponseAvis({ avis, reponse, nom }: { avis: string; reponse: string | null; nom: string }) {
  const [ouvert, setOuvert] = useState(false)
  const [etat, action, enCours] = useActionState<EtatAvis, FormData>(repondreAvis, null)
  const [texte, setTexte] = useState(reponse ?? '')

  if (!ouvert) {
    return reponse ? (
      <div className="squircle-xl mt-4 border-l-2 border-teal bg-bg-soft p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-fg">
            <MessageSquareQuote className="size-3.5 text-teal" aria-hidden /> Votre réponse
          </p>
          <button type="button" onClick={() => setOuvert(true)} className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-fg-2 hover:text-fg">
            <Pencil className="size-3" aria-hidden /> Modifier
          </button>
        </div>
        <p className="mt-1.5 whitespace-pre-line text-sm text-fg-2">{reponse}</p>
      </div>
    ) : (
      <button type="button" onClick={() => setOuvert(true)} className="mt-4 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line px-3.5 text-sm font-medium text-fg hover:border-line-strong">
        <MessageSquareQuote className="size-4" aria-hidden /> Répondre
      </button>
    )
  }
  return (
    <form action={action} className="mt-4 space-y-2">
      <input type="hidden" name="avis" value={avis} />
      <label className="block text-xs font-medium text-fg-2" htmlFor={`reponse-${avis}`}>
        Réponse publique, signée {nom}
      </label>
      <textarea
        id={`reponse-${avis}`}
        name="reponse"
        rows={4}
        maxLength={REPONSE_MAX}
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        placeholder="Remerciez, précisez, dites ce qui a changé. Une réponse courte et factuelle rassure plus qu’une défense."
        className="squircle-lg w-full border border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-line-strong"
      />
      {etat?.erreur && <p className="text-xs text-destructive">{etat.erreur}</p>}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-fg-2">
          {texte.length} sur {REPONSE_MAX.toLocaleString('fr-FR')}
          {reponse ? ' · vide, la réponse est retirée' : ''}
        </span>
        <span className="flex gap-2">
          <button type="button" onClick={() => setOuvert(false)} className="h-9 cursor-pointer rounded-full px-3 text-sm text-fg-2 hover:text-fg">
            Annuler
          </button>
          <button type="submit" disabled={enCours} className="h-9 cursor-pointer rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
            {reponse ? 'Mettre à jour' : 'Publier la réponse'}
          </button>
        </span>
      </div>
    </form>
  )
}
