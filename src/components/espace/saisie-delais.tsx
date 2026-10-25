'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Minus, Plus, X } from 'lucide-react'
import {
  DELAI_MAX,
  DELAI_MIN,
  DELAI_PERSO_DEFAUT,
  ETENDUES,
  JOURS_RAMASSAGE,
  PIECES,
  PIECES_DEMANDEES,
  PIECES_DEPART,
  PIECES_ONBOARDING,
  PIECES_PERSO_MAX,
  PREFIXE_PIECE,
  RAYON_MAX,
  RAYON_MIN,
  libellePiece,
  nomPiece,
  resumeZone,
} from '@/lib/espace-pro/labo'
import { CarteRayon } from './carte-rayon'
import { EVENEMENT_APERCU } from './valeur-en-direct'

/** L'aperçu de l'onboarding se met à jour pendant la saisie : `ValeurEnDirect` écoute cet événement. */
const annoncer = (cle: string, valeur: string | null) => window.dispatchEvent(new CustomEvent(EVENEMENT_APERCU, { detail: { cle, valeur } }))

/**
 * LO2 et « Délais de fabrication » : un délai moyen par pièce, en jours
 * ouvrés, réglé au bouton ; une pièce s'ajoute ou se retire. Rien n'est
 * prérempli : une pièce proposée reste « à indiquer » tant que le
 * laboratoire n'a pas réglé son délai, et seuls les délais réglés partent
 * dans le formulaire, en `delai_<pièce>`. Après l'onboarding (`toutes`),
 * toutes les pièces du catalogue s'ajoutent, les plus demandées en tête,
 * et le laboratoire peut nommer une pièce absente du catalogue.
 */
export function SaisieDelais({ initiaux, toutes = false }: { initiaux: Record<string, number> | null; toutes?: boolean }) {
  const [delais, setDelais] = useState<Record<string, number | null>>(() =>
    initiaux && Object.keys(initiaux).length ? { ...initiaux } : Object.fromEntries(PIECES_DEPART.map((c) => [c, null])),
  )
  const [nom, setNom] = useState<string | null>(null)
  const catalogue = toutes ? PIECES : PIECES.filter((p) => PIECES_ONBOARDING.includes(p.code))
  const reste = catalogue.filter((p) => !(p.code in delais))
  const demandees = toutes ? reste.filter((p) => PIECES_DEMANDEES.includes(p.code)) : reste
  const autres = toutes ? reste.filter((p) => !PIECES_DEMANDEES.includes(p.code)) : []
  // Le catalogue dans son ordre, puis les pièces nommées par le laboratoire.
  const lignes = [...PIECES.filter((p) => p.code in delais).map((p) => p.code), ...Object.keys(delais).filter((c) => c.startsWith(PREFIXE_PIECE))]
  const persos = lignes.filter((c) => c.startsWith(PREFIXE_PIECE)).length
  const regler = (code: string, pas: number) => {
    const defaut = PIECES.find((x) => x.code === code)?.defaut ?? DELAI_PERSO_DEFAUT
    setDelais((d) => ({ ...d, [code]: d[code] == null ? defaut : Math.min(DELAI_MAX, Math.max(DELAI_MIN, d[code]! + pas)) }))
  }
  const nomValide = nom === null ? null : nomPiece(nom)
  const ajouterPerso = () => {
    if (!nomValide) return
    setDelais((d) => ({ ...d, [PREFIXE_PIECE + nomValide]: d[PREFIXE_PIECE + nomValide] ?? null }))
    setNom(null)
  }
  useEffect(() => {
    const regles = Object.entries(delais).filter((e): e is [string, number] => e[1] != null)
    annoncer('delais', regles.length ? regles.slice(0, 2).map(([c, j]) => `${libellePiece(c).split(' ')[0]} ${j} j`).join(' · ') : null)
  }, [delais])
  const pastille = (p: { code: string; libelle: string }) => (
    <button key={p.code} type="button" onClick={() => setDelais((d) => ({ ...d, [p.code]: null }))} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-dashed border-line px-3 text-xs font-medium text-fg-2 hover:border-line-strong hover:text-fg">
      <Plus className="size-3.5" aria-hidden /> {p.libelle}
    </button>
  )
  return (
    <div>
      <ul className="divide-y divide-line border-y border-line">
        {lignes.map((code) => {
          const p = { code, libelle: libellePiece(code) }
          const j = delais[p.code]
          return (
            <li key={p.code} className="flex items-center gap-3 py-2">
              {j != null && <input type="hidden" name={`delai_${p.code}`} value={j} />}
              <span className="min-w-0 flex-1 text-sm text-fg">{p.libelle}</span>
              <span className={`squircle-full flex items-center gap-1 border p-1 ${j == null ? 'border-dashed border-line-strong' : 'border-line'}`}>
                <button type="button" onClick={() => regler(p.code, -1)} aria-label={`Réduire le délai : ${p.libelle}`} className="grid size-7 cursor-pointer place-items-center rounded-full bg-bg-soft text-fg hover:bg-line">
                  <Minus className="size-3.5" aria-hidden />
                </button>
                <span className={`w-20 whitespace-nowrap text-center tabular-nums ${j == null ? 'text-xs text-fg-2' : 'font-mono text-sm text-fg'}`} aria-live="polite">
                  {j == null ? 'à régler' : `${j} j`}
                </span>
                <button type="button" onClick={() => regler(p.code, 1)} aria-label={`Allonger le délai : ${p.libelle}`} className="grid size-7 cursor-pointer place-items-center rounded-full bg-bg-soft text-fg hover:bg-line">
                  <Plus className="size-3.5" aria-hidden />
                </button>
              </span>
              <button
                type="button"
                onClick={() =>
                  setDelais((d) => {
                    const n = { ...d }
                    delete n[p.code]
                    return n
                  })
                }
                aria-label={`Retirer : ${p.libelle}`}
                className="grid size-8 cursor-pointer place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>
      {(demandees.length > 0 || toutes) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {demandees.map(pastille)}
          {toutes && persos < PIECES_PERSO_MAX && nom === null && (
            <button type="button" onClick={() => setNom('')} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-dashed border-teal/50 px-3 text-xs font-medium text-teal hover:border-teal">
              <Plus className="size-3.5" aria-hidden /> Pièce non listée
            </button>
          )}
        </div>
      )}
      {nom !== null && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label htmlFor="piece-perso" className="sr-only">
            Nom de la pièce
          </label>
          <input
            id="piece-perso"
            autoFocus
            value={nom}
            maxLength={40}
            placeholder="Ex. : Couronne zircone stratifiée"
            onChange={(e) => setNom(e.target.value)}
            onKeyDown={(e) => {
              // Entrée ajoute la pièce sans envoyer le formulaire ; Échap annule.
              if (e.key === 'Enter') {
                e.preventDefault()
                ajouterPerso()
              } else if (e.key === 'Escape') setNom(null)
            }}
            className="squircle-full h-9 min-w-0 flex-1 border border-line bg-bg px-4 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong"
          />
          <button type="button" onClick={ajouterPerso} disabled={!nomValide} className="inline-flex h-9 cursor-pointer items-center rounded-full bg-fg px-4 text-sm font-semibold text-bg disabled:cursor-not-allowed disabled:opacity-40">
            Ajouter
          </button>
          <button type="button" onClick={() => setNom(null)} className="inline-flex h-9 cursor-pointer items-center rounded-full px-3 text-sm text-fg-2 hover:text-fg">
            Annuler
          </button>
        </div>
      )}
      {autres.length > 0 && (
        <details className="group mt-3">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-fg-2 hover:text-fg [&::-webkit-details-marker]:hidden">
            Autres pièces ({autres.length})
            <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">{autres.map(pastille)}</div>
        </details>
      )}
      <p className="mt-2 text-xs text-fg-2">
        Réglez chaque délai avec − et + : un délai moyen, pas un engagement, la fiche le dit aux cabinets.{!toutes && ' D’autres pièces s’ajoutent ensuite dans votre espace.'}
      </p>
    </div>
  )
}

/** La zone desservie : le rayon au curseur, le ramassage et ses jours, l'envoi au-delà. */
export function SaisieZone({
  rayon,
  ramassage,
  jours,
  transporteur,
  complete = false,
  centre = null,
  etendue = null,
}: {
  rayon: number | null
  ramassage: boolean | null
  jours: string[]
  transporteur: boolean | null
  /** Le tableau de bord montre aussi les jours de passage et le transporteur. */
  complete?: boolean
  /** La position du laboratoire : le rayon se dessine sur un plan. */
  centre?: { lon: number; lat: number } | null
  /** Toute la France, ou la France et l'étranger, au-delà du rayon. */
  etendue?: 'france' | 'international' | null
}) {
  const [km, setKm] = useState(rayon ?? 40)
  const [passe, setPasse] = useState(ramassage ?? true)
  const [portee, setPortee] = useState<'' | 'france' | 'international'>(etendue ?? '')
  useEffect(() => {
    annoncer('zone', resumeZone({ rayonKm: km, ramassage: passe, zoneEtendue: portee || null }))
  }, [km, passe, portee])
  return (
    <div>
      <fieldset className="mb-4">
        <legend className="mb-2 text-sm text-fg">Vous desservez</legend>
        <div className="squircle-full inline-flex flex-wrap gap-1 bg-bg-soft p-1 text-sm">
          {ETENDUES.map((e) => (
            <label key={e.code} className="squircle-full cursor-pointer px-3.5 py-1.5 font-medium text-fg-2 has-[:checked]:bg-bg has-[:checked]:text-fg has-[:checked]:shadow-sm">
              <input type="radio" name="etendue" value={e.code} checked={portee === e.code} onChange={() => setPortee(e.code)} className="sr-only" />
              {e.libelle}
            </label>
          ))}
        </div>
        {portee && <p className="mt-2 text-xs text-fg-2">Les pièces partent par transporteur{portee === 'international' ? ', en France comme à l’étranger' : ' dans toute la France'}. Le rayon ci-dessous reste celui du ramassage au cabinet.</p>}
      </fieldset>
      <div className="flex items-center justify-between text-sm">
        <label htmlFor="zone-rayon" className="text-fg">
          {portee ? 'Rayon de ramassage' : 'Rayon desservi'}
        </label>
        <span className="font-mono tabular-nums text-fg">{km} km</span>
      </div>
      <input id="zone-rayon" name="rayon" type="range" min={RAYON_MIN} max={RAYON_MAX} step={5} value={km} onChange={(e) => setKm(Number(e.target.value))} className="mt-2 w-full accent-teal" />
      <div className="flex justify-between text-[11px] text-fg-2">
        <span>{RAYON_MIN} km</span>
        <span>{RAYON_MAX} km</span>
      </div>
      {centre && <CarteRayon lon={centre.lon} lat={centre.lat} km={km} />}
      <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-fg">
        <input type="checkbox" name="ramassage" checked={passe} onChange={() => setPasse((p) => !p)} className="peer sr-only" />
        <span aria-hidden className="relative h-5 w-9 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-teal peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-action after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
        Ramassage des empreintes au cabinet
      </label>
      {complete && passe && (
        <fieldset className="mt-3">
          <legend className="mb-2 text-xs text-fg-2">Jours de passage</legend>
          <div className="flex flex-wrap gap-1.5">
            {JOURS_RAMASSAGE.map((j) => (
              <label key={j.code} className="squircle-lg grid h-10 w-14 cursor-pointer place-items-center border border-line text-sm text-fg-2 has-[:checked]:border-teal/40 has-[:checked]:bg-teal/10 has-[:checked]:font-medium has-[:checked]:text-teal">
                <input type="checkbox" name="jour" value={j.code} defaultChecked={jours.includes(j.code)} className="sr-only" />
                {j.court}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {complete && (
        <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-fg">
          <input type="checkbox" name="transporteur" defaultChecked={transporteur ?? false} className="peer sr-only" />
          <span aria-hidden className="relative h-5 w-9 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-teal after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
          Envoi par transporteur au-delà de la zone
        </label>
      )}
    </div>
  )
}
