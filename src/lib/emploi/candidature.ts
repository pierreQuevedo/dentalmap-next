/**
 * Les candidatures, partie pure : statuts et leurs libellés de chaque côté,
 * nom affiché au recruteur avant l'échange, filtres de la liste, contrôle des
 * créneaux. Importé par les pages, les actions et les tests.
 */

export type StatutCandidature = 'nouvelle' | 'vue' | 'echange_propose' | 'echange_accepte' | 'retenue' | 'non_retenue'

/** Message de motivation : 1 000 caractères au plus. CV : un PDF de 5 Mo au plus. */
export const MESSAGE_MAX = 1000
export const CV_MAX_OCTETS = 5 * 1024 * 1024

/** Côté recruteur : le libellé et la pastille de chaque statut. */
export const STATUT_RECRUTEUR: Record<StatutCandidature, { libelle: string; classe: string }> = {
  nouvelle: { libelle: 'Nouvelle', classe: 'bg-teal/10 text-teal ring-teal/30' },
  vue: { libelle: 'Vue', classe: 'bg-bg-soft text-fg-2 ring-line' },
  echange_propose: { libelle: 'Échange proposé', classe: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30' },
  echange_accepte: { libelle: 'Échange accepté', classe: 'bg-teal/10 text-teal ring-teal/30' },
  retenue: { libelle: 'Retenue', classe: 'bg-fg text-bg ring-fg' },
  non_retenue: { libelle: 'Non retenue', classe: 'bg-bg text-fg-2 ring-line' },
}

/** Côté candidat : ce que la personne voit de sa candidature. */
export const STATUT_CANDIDAT: Record<StatutCandidature, string> = {
  nouvelle: 'Envoyée',
  vue: 'Vue par le recruteur',
  echange_propose: 'Échange proposé',
  echange_accepte: 'Échange accepté',
  retenue: 'Retenue',
  non_retenue: 'Non retenue',
}

export const FILTRES_CANDIDATURES = [
  { cle: 'toutes', libelle: 'Toutes' },
  { cle: 'nouvelles', libelle: 'Nouvelles' },
  { cle: 'echange', libelle: 'Échange proposé' },
  { cle: 'retenues', libelle: 'Retenues' },
] as const

export type FiltreCandidatures = (typeof FILTRES_CANDIDATURES)[number]['cle']

export function lireFiltre(v: string | undefined): FiltreCandidatures {
  return FILTRES_CANDIDATURES.some((f) => f.cle === v) ? (v as FiltreCandidatures) : 'toutes'
}

export function dansFiltre(statut: StatutCandidature, f: FiltreCandidatures): boolean {
  if (f === 'nouvelles') return statut === 'nouvelle'
  if (f === 'echange') return statut === 'echange_propose' || statut === 'echange_accepte'
  if (f === 'retenues') return statut === 'retenue'
  return true
}

/**
 * Avant l'échange accepté, le recruteur voit le prénom et l'initiale du nom :
 * « Julie R. ». Après, le nom complet, avec les coordonnées.
 */
export function nomCandidat(nom: string, complet: boolean): string {
  const mots = nom.trim().split(/\s+/).filter(Boolean)
  if (complet || mots.length < 2) return mots.join(' ') || 'Candidat'
  return `${mots[0]} ${mots[mots.length - 1][0].toUpperCase()}.`
}

/** Initiales de la pastille : « JR ». */
export function initiales(nom: string): string {
  const mots = nom.trim().split(/\s+/).filter(Boolean)
  return ((mots[0]?.[0] ?? '') + (mots.length > 1 ? mots[mots.length - 1][0] : '')).toUpperCase() || '?'
}

/** Les créneaux saisis : non vides, sans doublon, deux ou trois. */
export function creneauxValides(saisis: string[]): { ok: true; creneaux: string[] } | { ok: false; erreur: string } {
  const creneaux = [...new Set(saisis.map((c) => c.trim()).filter(Boolean))]
  if (creneaux.length < 2) return { ok: false, erreur: 'Proposez deux créneaux au moins.' }
  if (creneaux.length > 3) return { ok: false, erreur: 'Trois créneaux au plus.' }
  return { ok: true, creneaux }
}

/** Un créneau saisi au format `2026-10-28T18:00` : « mardi 28 octobre, 18h00 ». */
export function libelleCreneau(valeur: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(valeur)
  if (!m) return valeur
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const jour = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return `${jour}, ${m[4]}h${m[5]}`
}

/** Un numéro de téléphone français ou international plausible. */
export function telephoneValide(v: string): boolean {
  const chiffres = v.replace(/[\s.()-]/g, '')
  return /^(\+\d{8,15}|0\d{9})$/.test(chiffres)
}
