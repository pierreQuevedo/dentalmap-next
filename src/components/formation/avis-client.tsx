'use client'

import { Suspense, useActionState, useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Flag, Star } from 'lucide-react'
import { deposerAvis, signalerAvis, type EtatAvis } from '@/lib/formation/actions-avis'
import { MOTIFS_SIGNALEMENT, TEXTE_MAX, TEXTE_MIN, type LienAvis } from '@/lib/formation/avis'

const champ = 'squircle-lg w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-line-strong'

/** Le retour après un dépôt ou un signalement, lu dans l'adresse (`?avis=merci`, `?avis=signale`). */
export function RetourAvis() {
  return (
    <Suspense fallback={null}>
      <Retour />
    </Suspense>
  )
}

function Retour() {
  const p = useSearchParams().get('avis')
  if (p !== 'merci' && p !== 'signale') return null
  return (
    <p role="status" className="squircle-xl mb-8 flex items-center gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
      <Check className="size-4 shrink-0" aria-hidden />
      {p === 'merci' ? 'Merci, votre avis est en ligne. Vous pouvez le modifier à tout moment.' : 'Merci, l’équipe examine ce signalement. L’avis reste affiché d’ici sa décision.'}
    </p>
  )
}

/** « Signaler » sous un avis : la raison, une précision, puis l'envoi (connexion demandée). */
export function SignalerAvis({ avis }: { avis: string }) {
  const [ouvert, setOuvert] = useState(false)
  const [etat, action, enCours] = useActionState<EtatAvis, FormData>(signalerAvis, null)
  if (!ouvert) {
    return (
      <button type="button" onClick={() => setOuvert(true)} className="inline-flex cursor-pointer items-center gap-1 text-xs text-fg-2 hover:text-fg">
        <Flag className="size-3" aria-hidden /> Signaler
      </button>
    )
  }
  return (
    <form action={action} className="squircle-xl w-full space-y-3 border border-line bg-bg-soft p-4">
      <input type="hidden" name="avis" value={avis} />
      <p className="text-sm font-medium text-fg">Pourquoi signaler cet avis ?</p>
      <div className="space-y-1.5">
        {MOTIFS_SIGNALEMENT.map((m) => (
          <label key={m.cle} className="flex cursor-pointer items-center gap-2 text-sm text-fg-2">
            <input type="radio" name="motif" value={m.cle} required className="accent-[var(--teal)]" /> {m.libelle}
          </label>
        ))}
      </div>
      <textarea name="detail" rows={2} maxLength={500} placeholder="Une précision, facultative" className={`${champ} py-2`} />
      {etat?.erreur && <p className="text-xs text-destructive">{etat.erreur}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setOuvert(false)} className="h-9 cursor-pointer rounded-full px-3 text-sm text-fg-2 hover:text-fg">
          Annuler
        </button>
        <button type="submit" disabled={enCours} className="h-9 cursor-pointer rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
          Envoyer le signalement
        </button>
      </div>
    </form>
  )
}

/**
 * Le formulaire d'avis : le lien avec l'établissement, la note, le texte. Les
 * saisies restent en place si l'envoi échoue.
 */
export function FormulaireAvis({
  slug,
  liens,
  initial,
}: {
  slug: string
  liens: readonly { cle: LienAvis; libelle: string }[]
  initial: { lien: LienAvis; annee: string | null; note: number; texte: string } | null
}) {
  const [etat, setEtat] = useState<EtatAvis>(null)
  const [enCours, demarrer] = useTransition()
  const [note, setNote] = useState(initial?.note ?? 0)
  const [survol, setSurvol] = useState(0)
  const [texte, setTexte] = useState(initial?.texte ?? '')
  useEffect(() => {
    if (etat?.champ) document.getElementsByName(etat.champ)[0]?.focus()
  }, [etat])
  const erreur = (c: string) => (etat?.champ === c ? <p className="mt-1.5 text-xs text-destructive">{etat.erreur}</p> : null)
  const affichee = survol || note

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        demarrer(async () => setEtat(await deposerAvis(null, fd)))
      }}
      className="space-y-8"
    >
      <input type="hidden" name="slug" value={slug} />
      <fieldset>
        <legend className="text-sm font-semibold text-fg">Votre lien avec l’établissement</legend>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {liens.map((l) => (
            <label key={l.cle} className="squircle-xl flex cursor-pointer items-center gap-3 border border-line bg-bg p-3 text-sm text-fg has-[:checked]:border-teal has-[:checked]:bg-teal/5">
              <input type="radio" name="lien" value={l.cle} defaultChecked={initial?.lien === l.cle} required className="accent-[var(--teal)]" /> {l.libelle}
            </label>
          ))}
        </div>
        {erreur('lien')}
        <label className="mt-4 block">
          <span className="text-sm font-medium text-fg">Promotion ou année</span>
          <span className="ml-1 text-xs text-fg-2">facultatif</span>
          <input name="annee" maxLength={40} defaultValue={initial?.annee ?? ''} placeholder="Promotion 2024, ou 2e année" className={`${champ} mt-1.5 h-10`} />
        </label>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-fg">Votre note</legend>
        <input type="hidden" name="note" value={note || ''} />
        <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setSurvol(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} sur 5`}
              aria-pressed={note === n}
              onMouseEnter={() => setSurvol(n)}
              onClick={() => setNote(n)}
              className="cursor-pointer rounded-md p-0.5 focus-visible:outline-2 focus-visible:outline-teal"
            >
              <Star className={`size-8 transition-colors ${n <= affichee ? 'text-amber-400' : 'text-line'}`} fill="currentColor" strokeWidth={0} aria-hidden />
            </button>
          ))}
          <span className="ml-3 text-sm text-fg-2">{affichee ? ['', 'Décevant', 'Moyen', 'Bien', 'Très bien', 'Excellent'][affichee] : 'Choisissez'}</span>
        </div>
        {erreur('note')}
      </fieldset>

      <label className="block">
        <span className="text-sm font-semibold text-fg">Votre expérience</span>
        <span className="mt-1 block text-xs text-fg-2">L’enseignement, l’encadrement, les ateliers ou la clinique, l’ambiance, ce que vous auriez aimé savoir avant.</span>
        <textarea name="texte" rows={7} maxLength={TEXTE_MAX} value={texte} onChange={(e) => setTexte(e.target.value)} className={`${champ} mt-2 py-2.5 leading-relaxed`} />
        <span className={`mt-1 block text-right text-xs ${texte.trim().length < TEXTE_MIN ? 'text-fg-2' : 'text-teal'}`}>
          {texte.trim().length < TEXTE_MIN ? `Encore ${TEXTE_MIN - texte.trim().length} caractères` : `${texte.length} sur ${TEXTE_MAX.toLocaleString('fr-FR')}`}
        </span>
        {erreur('texte')}
      </label>

      {etat?.erreur && !['lien', 'note', 'texte'].includes(etat.champ ?? '') && (
        <p role="alert" className="squircle-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {etat.erreur}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <p className="max-w-md text-xs text-fg-2">Votre prénom et l’initiale de votre nom s’affichent avec l’avis. Ni adresse email, ni téléphone, ni attaque personnelle.</p>
        <button type="submit" disabled={enCours} className="inline-flex h-11 cursor-pointer items-center rounded-full bg-action px-6 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
          {enCours ? 'Envoi…' : initial ? 'Mettre à jour mon avis' : 'Publier mon avis'}
        </button>
      </div>
    </form>
  )
}
