/**
 * Les candidatures, partie pure : les quatre statuts et leurs libellés de
 * chaque côté, nom masqué des profils disponibles, filtres de la liste,
 * contrôle du téléphone. Importé par les pages, les actions et les tests.
 */

/**
 * Quatre statuts : le recruteur a les coordonnées dès la candidature et
 * contacte la personne directement (téléphone ou email), sans étape d'échange.
 */
export type StatutCandidature = 'nouvelle' | 'vue' | 'retenue' | 'non_retenue'

/** Message de motivation : 1 000 caractères au plus. CV : un PDF de 5 Mo au plus. */
export const MESSAGE_MAX = 1000
export const CV_MAX_OCTETS = 5 * 1024 * 1024

/** Côté recruteur : le libellé et la pastille de chaque statut. */
export const STATUT_RECRUTEUR: Record<StatutCandidature, { libelle: string; classe: string }> = {
  nouvelle: { libelle: 'Nouvelle', classe: 'bg-teal/10 text-teal ring-teal/30' },
  vue: { libelle: 'Vue', classe: 'bg-bg-soft text-fg-2 ring-line' },
  retenue: { libelle: 'Retenue', classe: 'bg-fg text-bg ring-fg' },
  non_retenue: { libelle: 'Non retenue', classe: 'bg-bg text-fg-2 ring-line' },
}

/** Côté candidat : ce que la personne voit de sa candidature. */
export const STATUT_CANDIDAT: Record<StatutCandidature, string> = {
  nouvelle: 'Envoyée',
  vue: 'Vue par le recruteur',
  retenue: 'Retenue',
  non_retenue: 'Non retenue',
}

export const FILTRES_CANDIDATURES = [
  { cle: 'toutes', libelle: 'Toutes' },
  { cle: 'nouvelles', libelle: 'Nouvelles' },
  { cle: 'retenues', libelle: 'Retenues' },
  { cle: 'non_retenues', libelle: 'Non retenues' },
] as const

export type FiltreCandidatures = (typeof FILTRES_CANDIDATURES)[number]['cle']

export function lireFiltre(v: string | undefined): FiltreCandidatures {
  return FILTRES_CANDIDATURES.some((f) => f.cle === v) ? (v as FiltreCandidatures) : 'toutes'
}

export function dansFiltre(statut: StatutCandidature, f: FiltreCandidatures): boolean {
  if (f === 'nouvelles') return statut === 'nouvelle'
  if (f === 'retenues') return statut === 'retenue'
  if (f === 'non_retenues') return statut === 'non_retenue'
  return true
}

/**
 * Un profil disponible montre le prénom et l'initiale du nom : « Julie R. ».
 * Une candidature, elle, montre le nom complet, avec les coordonnées.
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

/** Un numéro de téléphone français ou international plausible. */
export function telephoneValide(v: string): boolean {
  const chiffres = v.replace(/[\s.()-]/g, '')
  return /^(\+\d{8,15}|0\d{9})$/.test(chiffres)
}
