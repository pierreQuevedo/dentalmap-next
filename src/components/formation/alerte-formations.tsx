'use client'

import { useActionState, useState } from 'react'
import { Bell, Check, CircleCheck } from 'lucide-react'
import { inscrireAlerteFormation, type EtatAlerte } from '@/lib/formation/actions-privee'
import { PUBLICS_FORMATION, REGIONS_FORMATION } from '@/lib/formation/privee'
import { THEMES_FORMATION } from '@/lib/formation/themes'

/**
 * C : l'alerte des praticiens sur les nouvelles formations privées. Sans
 * compte : une adresse, des thèmes, une région, un public ; la confirmation
 * passe par un lien envoyé par email. Aucun thème coché vaut « tous ».
 */
const puce = 'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-bg px-3 text-xs font-medium text-fg has-[:checked]:border-fg has-[:checked]:bg-fg has-[:checked]:text-bg'
const champ = 'squircle-full h-11 w-full border border-line bg-bg px-4 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong'

export function AlerteFormations({ themesInitiaux = [], publicsInitiaux = [], regionInitiale = null }: { themesInitiaux?: string[]; publicsInitiaux?: string[]; regionInitiale?: string | null } = {}) {
  const [etat, envoyer, enCours] = useActionState<EtatAlerte, FormData>(inscrireAlerteFormation, null)
  // Depuis la liste, l'alerte reprend les filtres en cours.
  const [themes, setThemes] = useState<string[]>(themesInitiaux)
  const [publics, setPublics] = useState<string[]>(publicsInitiaux)

  if (etat?.ok) {
    return (
      <p role="status" className="squircle-xl flex items-start gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
        <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden /> {etat.message}
      </p>
    )
  }
  return (
    <form action={envoyer} className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-xs font-medium text-fg">Thèmes (aucun coché : tous)</legend>
        <div className="flex flex-wrap gap-2">
          {THEMES_FORMATION.map((t) => (
            <label key={t} className={puce}>
              <input type="checkbox" name="themes" value={t} checked={themes.includes(t)} onChange={() => setThemes((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))} className="sr-only" />
              {themes.includes(t) && <Check className="size-3.5" aria-hidden />}
              {t}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 md:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-xs font-medium text-fg">Vous êtes (aucun coché : tous)</legend>
          <div className="flex flex-wrap gap-2">
            {PUBLICS_FORMATION.map((p) => (
              <label key={p} className={puce}>
                <input type="checkbox" name="publics" value={p} checked={publics.includes(p)} onChange={() => setPublics((x) => (x.includes(p) ? x.filter((y) => y !== p) : [...x, p]))} className="sr-only" />
                {publics.includes(p) && <Check className="size-3.5" aria-hidden />}
                {p}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="alerte-region" className="mb-2 block text-xs font-medium text-fg">Région</label>
          <select id="alerte-region" name="regions" defaultValue={regionInitiale ?? ''} className={champ}>
            <option value="">Toute la France</option>
            {REGIONS_FORMATION.map((r) => (
              <option key={r.code} value={r.code}>{r.nom}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-fg-2">Les formations en ligne vous sont toujours signalées.</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="alerte-email" className="sr-only">Adresse électronique</label>
        <input id="alerte-email" name="email" type="email" required autoComplete="email" placeholder="prenom.nom@exemple.fr" className={champ} />
        <button type="submit" disabled={enCours} className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
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
  )
}
