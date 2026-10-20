'use client'

import { useActionState, useTransition } from 'react'
import Link from 'next/link'
import { Loader2, X } from 'lucide-react'
import { enregistrerAlerte, type EtatAlerte } from '@/lib/emploi/actions-alertes-compte'
import { FREQUENCES, RAYONS_ALERTE, type Frequence } from '@/lib/emploi/alertes-compte'
import { LIBELLE_CONTRAT, METIERS, type CodeContrat, type CodeMetier } from '@/lib/emploi/metiers'
import { chemin } from '@/lib/navigation'
import { ChampCommune } from './champ-commune'
import { Puce, champ, etiquette } from './champs-candidat'

const CONTRATS: CodeContrat[] = ['cdi', 'cdd', 'remplacement', 'collaboration', 'alternance', 'stage']

export type ValeursAlerte = {
  id?: string
  titre: string
  metiers: CodeMetier[]
  contrats: CodeContrat[]
  commune: string | null
  communeNom: string
  rayonKm: number
  frequence: Frequence
}

/** OUV-C-ALERTE : créer ou modifier une alerte, en fenêtre par-dessus la liste. */
export function FormulaireAlerte({ v, fermer }: { v: ValeursAlerte; fermer: string }) {
  const [etat, action, enCours] = useActionState<EtatAlerte, FormData>(enregistrerAlerte, null)
  const [, demarrer] = useTransition()
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <Link href={chemin(fermer)} aria-label="Fermer" className="absolute inset-0 bg-[#0e1317]/50 backdrop-blur-[2px]" />
      <form
        // Envoi à la main : sur une erreur, la saisie reste en place.
        onSubmit={(e) => {
          e.preventDefault()
          const d = new FormData(e.currentTarget)
          demarrer(() => action(d))
        }}
        role="dialog"
        aria-modal="true"
        aria-label={v.id ? 'Modifier l’alerte' : 'Créer une alerte'}
        className="squircle-2xl relative max-h-full w-full max-w-lg overflow-y-auto bg-bg shadow-pop"
      >
        {v.id && <input type="hidden" name="alerte" value={v.id} />}
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <h2 className="text-xl font-semibold tracking-tight text-fg">{v.id ? 'Modifier l’alerte' : 'Créer une alerte'}</h2>
          <Link href={chemin(fermer)} aria-label="Fermer" className="grid size-9 shrink-0 place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg">
            <X className="size-5" aria-hidden />
          </Link>
        </div>
        <div className="space-y-5 px-6 py-5">
          <fieldset>
            <legend className={etiquette}>Poste</legend>
            <div className="flex flex-wrap gap-2">
              {METIERS.map((m) => (
                <Puce key={m.code} name="metiers" value={m.code} coche={v.metiers.includes(m.code)}>
                  {m.nom}
                </Puce>
              ))}
            </div>
            <span className="mt-1 block text-xs text-fg-2">Aucun coché : tous les métiers.</span>
          </fieldset>
          <fieldset>
            <legend className={etiquette}>Contrat</legend>
            <div className="flex flex-wrap gap-2">
              {CONTRATS.map((c) => (
                <Puce key={c} name="contrats" value={c} coche={v.contrats.includes(c)}>
                  {LIBELLE_CONTRAT[c]}
                </Puce>
              ))}
            </div>
            <span className="mt-1 block text-xs text-fg-2">Aucun coché : tous les contrats.</span>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
            <div>
              <span className={etiquette}>Autour de</span>
              <ChampCommune code={v.commune} libelle={v.communeNom} invalide={etat?.champ === 'commune'} />
            </div>
            <label className="block">
              <span className={etiquette}>Rayon</span>
              <select name="rayon" defaultValue={v.rayonKm} className={champ}>
                {RAYONS_ALERTE.map((r) => (
                  <option key={r} value={r}>
                    {r} km
                  </option>
                ))}
              </select>
            </label>
          </div>
          <fieldset>
            <legend className={etiquette}>Fréquence</legend>
            <div className="flex flex-wrap gap-2">
              {FREQUENCES.map((f) => (
                <Puce key={f.cle} type="radio" name="frequence" value={f.cle} coche={v.frequence === f.cle}>
                  {f.libelle}
                </Puce>
              ))}
            </div>
            <span className="mt-1 block text-xs text-fg-2">Par email, seulement s’il y a de nouvelles offres.</span>
          </fieldset>
          <label className="block">
            <span className={etiquette}>Nom de l’alerte</span>
            <input name="titre" defaultValue={v.titre} maxLength={80} placeholder="Facultatif : un nom est proposé d’après les critères" className={champ} />
          </label>
        </div>
        <div className="border-t border-line px-6 py-4">
          {etat?.erreur && <p className="squircle-xl mb-3 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">{etat.erreur}</p>}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link href={chemin(fermer)} className="inline-flex h-11 items-center rounded-full px-4 text-sm font-medium text-fg-2 hover:text-fg">
              Annuler
            </Link>
            <button type="submit" disabled={enCours} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
              {enCours && <Loader2 className="size-4 animate-spin" aria-hidden />} {v.id ? 'Enregistrer' : 'Créer l’alerte'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
