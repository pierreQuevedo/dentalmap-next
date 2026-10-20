'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Euro, Loader2, MapPin, Percent, TriangleAlert, X } from 'lucide-react'
import { enregistrerOffre, type EtatFormulaireOffre } from '@/lib/emploi/actions-offres'
import { LIBELLE_CONTRAT, METIERS, type CodeContrat, type CodeMetier } from '@/lib/emploi/metiers'
import { AVANTAGES, DUREE_OFFRE_JOURS, enPourcentage, modeDuContrat } from '@/lib/emploi/offre-pro'
import { chemin } from '@/lib/navigation'

const CONTRATS: CodeContrat[] = ['cdi', 'cdd', 'remplacement', 'collaboration', 'alternance', 'stage']

export type ValeursOffre = {
  id?: string
  metier: CodeMetier
  titre: string
  contrat: CodeContrat
  tempsPlein: boolean
  heuresHebdo: number | null
  debut: string | null
  fin: string | null
  min: number | null
  max: number | null
  lieuId: string | null
  description: string
  profil: string | null
  avantages: string[]
}

const champ = 'squircle-xl w-full border border-line bg-bg px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong'
const etiquette = 'mb-1.5 block text-sm font-medium text-fg'

/**
 * Le tiroir « Publier une offre » (OUV-PD-OFFRE) : poste, contrat, temps,
 * dates, rémunération (obligatoire, en euros ou en pourcentage selon le
 * contrat), lieu, description, profil, avantages. Publier, ou garder en
 * brouillon.
 */
export function FormulaireOffre({ fiche, fermer, lieux, valeurs }: { fiche: string; fermer: string; lieux: { id: string; libelle: string }[]; valeurs: ValeursOffre }) {
  const [etat, action, enCours] = useActionState<EtatFormulaireOffre, FormData>(enregistrerOffre, null)
  const [contrat, setContrat] = useState<CodeContrat>(valeurs.contrat)
  const [tempsPlein, setTempsPlein] = useState(valeurs.tempsPlein)
  const [metier, setMetier] = useState<CodeMetier>(valeurs.metier)
  const [titre, setTitre] = useState(valeurs.titre)
  const [description, setDescription] = useState(valeurs.description)
  const pourcent = enPourcentage(contrat)
  const stage = modeDuContrat(contrat) === 'gratification'
  const avecFin = contrat === 'cdd' || contrat === 'remplacement' || contrat === 'stage'
  const invalide = (c: string) => (etat?.champ === c ? 'border-destructive' : '')
  const Unite = pourcent ? Percent : Euro

  return (
    <form action={action} className="flex h-full flex-col">
      <input type="hidden" name="fiche" value={fiche} />
      {valeurs.id && <input type="hidden" name="offre" value={valeurs.id} />}
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-2">Emploi · {valeurs.id ? 'modifier l’offre' : 'nouvelle offre'}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-fg">{valeurs.id ? 'Modifier l’offre' : 'Publier une offre'}</h2>
          <p className="mt-1 text-sm text-fg-2">L’offre apparaît sur votre fiche et dans la recherche d’emploi, triée par distance.</p>
        </div>
        <Link href={chemin(fermer)} aria-label="Fermer" className="grid size-9 shrink-0 place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg">
          <X className="size-5" aria-hidden />
        </Link>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={etiquette}>Poste</span>
            <select
              name="metier"
              value={metier}
              onChange={(e) => {
                const m = e.target.value as CodeMetier
                // L'intitulé suit le poste tant qu'il n'a pas été réécrit.
                if (titre === METIERS.find((x) => x.code === metier)?.nom) setTitre(METIERS.find((x) => x.code === m)?.nom ?? titre)
                setMetier(m)
              }}
              className={champ}
            >
              {METIERS.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.nom}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={etiquette}>Intitulé de l’offre</span>
            <input name="titre" value={titre} onChange={(e) => setTitre(e.target.value)} maxLength={120} required className={`${champ} ${invalide('titre')}`} />
          </label>
        </div>

        <fieldset>
          <legend className={etiquette}>Contrat</legend>
          <div className="flex flex-wrap gap-2">
            {CONTRATS.map((c) => (
              <label key={c} className={`squircle-full cursor-pointer border px-3.5 py-1.5 text-sm ${contrat === c ? 'border-teal bg-teal/10 font-medium text-teal' : 'border-line text-fg hover:border-line-strong'}`}>
                <input type="radio" name="contrat" value={c} checked={contrat === c} onChange={() => setContrat(c)} className="sr-only" />
                {LIBELLE_CONTRAT[c]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
          <fieldset>
            <legend className={etiquette}>Temps de travail</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['plein', 'Temps plein'],
                  ['partiel', 'Temps partiel'],
                ] as const
              ).map(([v, l]) => (
                <label key={v} className={`squircle-full cursor-pointer border px-3.5 py-1.5 text-sm ${(v === 'plein') === tempsPlein ? 'border-teal bg-teal/10 font-medium text-teal' : 'border-line text-fg hover:border-line-strong'}`}>
                  <input type="radio" name="temps" value={v} checked={(v === 'plein') === tempsPlein} onChange={() => setTempsPlein(v === 'plein')} className="sr-only" />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className={etiquette}>Heures par semaine</span>
            <input name="heures" type="number" min={1} max={48} defaultValue={valeurs.heuresHebdo ?? ''} placeholder="Facultatif" className={champ} />
          </label>
        </div>

        <div className={`grid gap-4 ${avecFin ? 'sm:grid-cols-2' : ''}`}>
          <label className="block">
            <span className={etiquette}>Début</span>
            <input name="debut" type="date" defaultValue={valeurs.debut ?? ''} className={champ} />
            <span className="mt-1 block text-xs text-fg-2">Vide : dès que possible.</span>
          </label>
          {avecFin && (
            <label className="block">
              <span className={etiquette}>Fin</span>
              <input name="fin" type="date" defaultValue={valeurs.fin ?? ''} className={champ} />
            </label>
          )}
        </div>

        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(['min', 'max'] as const).map((c) => (
              <label key={c} className="block">
                <span className={etiquette}>{c === 'min' ? 'Rémunération minimum' : 'Maximum'}</span>
                <span className={`squircle-xl flex items-center gap-2 border bg-bg px-3.5 focus-within:border-line-strong ${invalide(c) || 'border-line'}`}>
                  <input name={c} type="number" min={0} max={pourcent ? 100 : 20000} defaultValue={valeurs[c] ?? ''} required={!stage} className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-fg outline-none" />
                  <Unite className="size-4 text-fg-2" aria-hidden />
                </span>
                <span className="mt-1 block text-xs text-fg-2">{pourcent ? 'des honoraires' : stage ? 'Gratification par mois' : 'Brut mensuel'}</span>
              </label>
            ))}
          </div>
          <p className="squircle-xl mt-3 flex items-start gap-2 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
            <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
            {pourcent
              ? 'Obligatoire : la fourchette de rétrocession ou de redevance. Sans elle, l’offre n’est pas publiée.'
              : stage
                ? 'Gratification : laissez zéro pour un stage de deux mois au plus, la mention légale s’affiche.'
                : 'Obligatoire : une fourchette brute mensuelle. Sans elle, l’offre n’est pas publiée.'}
          </p>
        </div>

        <label className="block">
          <span className={etiquette}>Lieu</span>
          <span className={`squircle-xl flex items-center gap-2 border bg-bg px-3.5 ${invalide('lieu') || 'border-line'}`}>
            <MapPin className="size-4 text-fg-2" aria-hidden />
            <select name="lieu" defaultValue={valeurs.lieuId ?? lieux[0]?.id} className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-fg outline-none">
              {lieux.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.libelle}
                </option>
              ))}
            </select>
          </span>
          <span className="mt-1 block text-xs text-fg-2">Parmi vos lieux d’exercice.</span>
        </label>

        <label className="block">
          <span className={etiquette}>Description</span>
          <textarea
            name="description"
            rows={6}
            maxLength={1500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Le cabinet, l’équipe, les missions du poste…"
            className={`${champ} resize-y ${invalide('description')}`}
          />
          <span className={`mt-1 block text-right text-xs ${description.trim().length < 100 ? 'text-fg-2' : 'text-teal'}`}>{description.trim().length} / 1 500 caractères, 100 au moins</span>
        </label>

        <label className="block">
          <span className={etiquette}>Profil recherché</span>
          <textarea name="profil" rows={3} maxLength={800} defaultValue={valeurs.profil ?? ''} placeholder="Facultatif : diplôme, expérience, qualités…" className={`${champ} resize-y`} />
        </label>

        <fieldset>
          <legend className={etiquette}>Avantages</legend>
          <div className="flex flex-wrap gap-2">
            {AVANTAGES.map((a) => (
              <label key={a} className="squircle-full cursor-pointer border border-line px-3 py-1.5 text-sm text-fg has-[:checked]:border-teal has-[:checked]:bg-teal/10 has-[:checked]:text-teal">
                <input type="checkbox" name="avantages" value={a} defaultChecked={valeurs.avantages.includes(a)} className="sr-only" />
                {a}
              </label>
            ))}
          </div>
        </fieldset>

        <p className="text-xs text-fg-2">Publiée {DUREE_OFFRE_JOURS} jours, renouvelable en un clic. Vous la confirmez tous les 15 jours, d’un clic ; sans confirmation, elle est retirée.</p>
      </div>

      <div className="border-t border-line px-6 py-4">
        {etat?.erreur && <p className="squircle-xl mb-3 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">{etat.erreur}</p>}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="submit" name="intention" value="brouillon" disabled={enCours} className="inline-flex h-11 cursor-pointer items-center rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong disabled:opacity-60">
            Enregistrer le brouillon
          </button>
          <button type="submit" name="intention" value="publier" disabled={enCours} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
            {enCours && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {valeurs.id ? 'Publier les modifications' : 'Publier l’offre'}
          </button>
        </div>
      </div>
    </form>
  )
}
