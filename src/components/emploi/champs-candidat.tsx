'use client'

import { useState } from 'react'
import { LIBELLE_CONTRAT } from '@/lib/emploi/metiers'
import { ANNEES, CONTRATS_CANDIDAT, DISPONIBILITES, RAYONS_CANDIDAT, RECHERCHES_ETUDIANT, type Criteres, type Formation } from '@/lib/emploi/profil-candidat'
import { ChampCommune } from './champ-commune'

/** Les champs partagés par le parcours de bienvenue et la page « Mon profil ». */

export const champ = 'squircle-xl w-full border border-line bg-bg px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong'
export const etiquette = 'mb-1.5 block text-sm font-medium text-fg'
export const aide = 'mt-1 block text-xs text-fg-2'

export function Puce({ name, value, coche, type = 'checkbox', children }: { name: string; value: string; coche: boolean; type?: 'checkbox' | 'radio'; children: React.ReactNode }) {
  return (
    <label className="squircle-full cursor-pointer border border-line px-3.5 py-1.5 text-sm text-fg has-[:checked]:border-teal has-[:checked]:bg-teal/10 has-[:checked]:font-medium has-[:checked]:text-teal">
      <input type={type} name={name} value={value} defaultChecked={coche} className="sr-only" />
      {children}
    </label>
  )
}

/** SE2 et « Ce que vous cherchez » : contrats, temps, ville, rayon, disponibilité. */
export function ChampsRecherche({ c, invalide, etudiant }: { c: Criteres; invalide: (k: string) => boolean; etudiant: boolean }) {
  const [rayon, setRayon] = useState(c.rayonKm)
  const contrats = c.contrats.length ? c.contrats : etudiant ? ['alternance', 'stage'] : ['cdi']
  return (
    <>
      <fieldset>
        <legend className={etiquette}>Contrats recherchés</legend>
        <div className={`flex flex-wrap gap-2 ${invalide('contrats') ? 'squircle-xl p-1 ring-1 ring-destructive' : ''}`}>
          {CONTRATS_CANDIDAT.map((x) => (
            <Puce key={x} name="contrats" value={x} coche={contrats.includes(x)}>
              {LIBELLE_CONTRAT[x]}
            </Puce>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className={etiquette}>Temps de travail</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['tous', 'Indifférent'],
              ['plein', 'Temps plein'],
              ['partiel', 'Temps partiel'],
            ] as const
          ).map(([v, l]) => (
            <Puce key={v} type="radio" name="temps" value={v} coche={c.temps === v}>
              {l}
            </Puce>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className={etiquette}>Votre ville</span>
          <ChampCommune code={c.commune ?? null} libelle={c.communeNom ?? ''} invalide={invalide('commune')} />
          <span className={aide}>Seule la distance est montrée aux recruteurs, jamais votre adresse.</span>
        </div>
        <label className="block">
          <span className={etiquette}>
            Mobilité : <span className="tabular-nums">{rayon} km</span> autour
          </span>
          <select name="rayon" value={rayon} onChange={(e) => setRayon(Number(e.target.value))} className={champ}>
            {RAYONS_CANDIDAT.map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block sm:max-w-xs">
        <span className={etiquette}>Disponibilité</span>
        <select name="disponibilite" defaultValue={c.disponibilite ?? DISPONIBILITES[0]} className={champ}>
          {DISPONIBILITES.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </label>
    </>
  )
}

/** SE3E et « Ma formation » : école, cursus, année, ce qui est recherché. */
export function ChampsFormation({ f, ecoles }: { f: Formation | null; ecoles: { slug: string; nom: string }[] }) {
  return (
    <>
      <label className="block">
        <span className={etiquette}>École</span>
        <select name="ecole" defaultValue={f?.ecole ? `${f.ecole}|${f.ecoleNom ?? ''}` : ''} className={champ}>
          <option value="">Choisir parmi les écoles et facultés</option>
          {ecoles.map((e) => (
            <option key={e.slug} value={`${e.slug}|${e.nom}`}>
              {e.nom}
            </option>
          ))}
        </select>
        <span className={aide}>Les écoles et facultés de l’annuaire DentalMap.</span>
      </label>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="block">
          <span className={etiquette}>Formation</span>
          <input name="cursus" defaultValue={f?.cursus ?? ''} maxLength={120} placeholder="BTS prothésiste dentaire, titre d’assistant(e) dentaire…" className={champ} />
        </label>
        <label className="block">
          <span className={etiquette}>Année</span>
          <select name="annee" defaultValue={f?.annee ?? ANNEES[0]} className={champ}>
            {ANNEES.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>
      <fieldset>
        <legend className={etiquette}>Vous recherchez</legend>
        <div className="flex flex-wrap gap-2">
          {RECHERCHES_ETUDIANT.map((r) => (
            <Puce key={r.cle} name="recherche" value={r.cle} coche={f ? f.recherche.includes(r.cle) : r.cle !== 'job'}>
              {r.libelle}
            </Puce>
          ))}
        </div>
      </fieldset>
    </>
  )
}
