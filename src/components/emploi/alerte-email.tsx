'use client'

import { useActionState, useId } from 'react'
import { Bell, CircleCheck } from 'lucide-react'
import { inscrireAlerteEmploi, type EtatAlerteEmploi } from '@/lib/emploi/actions-alerte'
import type { CriteresAlerte } from '@/lib/emploi/alerte'

/**
 * Alerte email sans compte. Les critères viennent de la page (métier, lieu,
 * rayon) et partent en champs cachés ; la personne ne saisit que son adresse.
 * La confirmation passe par un lien envoyé par email, comme pour l'alerte
 * formations.
 */
export function AlerteEmail({
  criteres,
  titre = 'Recevez les nouvelles offres par email',
  detail = 'Un email par semaine au plus, et un lien de désinscription dans chaque envoi.',
  compacte,
}: {
  criteres: Partial<CriteresAlerte>
  titre?: string
  detail?: string
  compacte?: boolean
}) {
  const [etat, envoyer, enCours] = useActionState<EtatAlerteEmploi, FormData>(inscrireAlerteEmploi, null)
  const id = useId()

  const entete = !compacte && (
    <>
      <p className="inline-flex items-center gap-2 text-sm font-medium text-teal">
        <Bell className="size-4" aria-hidden /> Alerte email, sans compte
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fg md:text-3xl">{titre}</h2>
      <p className="mt-2 max-w-xl text-fg-2">{detail}</p>
    </>
  )

  if (etat?.ok) {
    return (
      <div>
        {entete}
        <p role="status" className={`squircle-xl flex items-start gap-2 bg-teal/10 px-4 py-3 text-sm text-teal ${compacte ? '' : 'mt-6'}`}>
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden /> {etat.message}
        </p>
      </div>
    )
  }

  return (
    <div>
      {entete}
      <form action={envoyer} className={`${compacte ? '' : 'mt-6'} flex flex-col gap-2 sm:flex-row`}>
        {criteres.metiers?.map((m) => <input key={m} type="hidden" name="metiers" value={m} />)}
        {criteres.contrats?.map((c) => <input key={c} type="hidden" name="contrats" value={c} />)}
        {criteres.departement && <input type="hidden" name="departement" value={criteres.departement} />}
        {criteres.commune && <input type="hidden" name="commune" value={criteres.commune} />}
        {criteres.rayonKm != null && <input type="hidden" name="rayonKm" value={criteres.rayonKm} />}
        <label className="sr-only" htmlFor={id}>
          Votre adresse email
        </label>
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="vous@exemple.fr"
          className="h-11 w-full min-w-0 rounded-full border border-line bg-bg px-5 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong sm:flex-1"
        />
        <button
          type="submit"
          disabled={enCours}
          className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground disabled:opacity-60"
        >
          <Bell className="size-4" aria-hidden /> {enCours ? 'Envoi…' : 'Créer l’alerte'}
        </button>
      </form>
      {etat && !etat.ok && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {etat.message}
        </p>
      )}
      <p className="mt-3 text-xs text-fg-2">Votre adresse ne sert qu’à cette alerte. Elle n’est jamais transmise aux recruteurs.</p>
    </div>
  )
}
