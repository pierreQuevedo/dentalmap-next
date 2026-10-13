'use client'

import { useActionState, useState } from 'react'
import { Bell, CircleCheck } from 'lucide-react'
import { inscrireAlerteCession, type EtatAlerteCession } from '@/lib/cessions/actions'
import type { TypeCession } from '@/lib/cessions/types'

/**
 * L'alerte cessions, sans compte : une adresse, confirmée par un lien envoyé
 * par email. Les critères sont ceux de la liste affichée (département et
 * types cochés) ; aucun critère vaut « toutes les cessions ».
 */
export function AlerteCessions({ departementCode, departementNom, types, id = 'alerte' }: { departementCode?: string; departementNom?: string; types: TypeCession[]; id?: string }) {
  const [etat, envoyer, enCours] = useActionState<EtatAlerteCession, FormData>(inscrireAlerteCession, null)
  const [ouvert, setOuvert] = useState(false)
  const lieu = departementNom ? ` en ${departementNom}` : ''

  return (
    <div id={id} className="alerte squircle-2xl mt-6 scroll-mt-24 bg-bg-soft p-5">
      {etat?.ok ? (
        <p role="status" className="flex items-start gap-2 text-sm text-teal">
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden /> {etat.message}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-3 text-sm text-fg">
              <Bell className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
              <span>Soyez prévenu(e) des prochaines cessions{lieu}, par email et sans compte.</span>
            </p>
            {!ouvert && (
              <button
                type="button"
                onClick={() => setOuvert(true)}
                className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground hover:bg-brand-hover"
              >
                Créer l’alerte
              </button>
            )}
          </div>
          {ouvert && (
            <form action={envoyer} className="mt-4 space-y-2">
              {departementCode && <input type="hidden" name="departements" value={departementCode} />}
              {types.map((t) => (
                <input key={t} type="hidden" name="types" value={t} />
              ))}
              <div className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor={`${id}-email`} className="sr-only">
                  Adresse électronique
                </label>
                <input
                  id={`${id}-email`}
                  name="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="prenom.nom@exemple.fr"
                  className="squircle-full h-11 w-full border border-line bg-bg px-4 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong"
                />
                <button
                  type="submit"
                  disabled={enCours}
                  className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60"
                >
                  <Bell className="size-4" aria-hidden /> {enCours ? 'Envoi…' : 'M’alerter'}
                </button>
              </div>
              {etat && !etat.ok && (
                <p role="alert" className="text-sm text-destructive">
                  {etat.message}
                </p>
              )}
              <p className="text-xs text-fg-2">Un email par semaine au plus, seulement s’il y a du nouveau. Désinscription en un clic depuis chaque email.</p>
            </form>
          )}
        </>
      )}
    </div>
  )
}
