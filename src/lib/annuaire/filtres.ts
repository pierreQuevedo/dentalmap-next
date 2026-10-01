/**
 * Filtres de la recherche.
 *
 * Partagé par la barre de recherche, le contexte, la route de résultats et
 * la requête : un filtre qui n'est pas ici n'existe pas. Chaque filtre
 * repose sur une donnée réellement présente dans la base, telle que les
 * registres ou les praticiens la livrent ; aucun ne repose sur une
 * déclaration non sourcée.
 */
import { PROFESSIONS, PROFESSIONS_RPPS, type Profession } from './types'

export const SPECIALITES = [
  { code: 'odf', libelle: 'Orthopédie dento-faciale', valeur: 'Orthopédie dento-faciale' },
  { code: 'chirurgie-orale', libelle: 'Chirurgie orale', valeur: 'Chirurgie Orale' },
  { code: 'medecine-bucco-dentaire', libelle: 'Médecine bucco-dentaire', valeur: 'Médecine Bucco-Dentaire' },
] as const
export type CodeSpecialite = (typeof SPECIALITES)[number]['code']

/** Valeurs du registre pour le mode d'exercice. */
export const EXERCICES = [
  { code: 'liberal', libelle: 'Libéral', valeur: 'Lib,indép,artis,com' },
  { code: 'salarie', libelle: 'Salarié', valeur: 'Salarié' },
] as const
export type CodeExercice = (typeof EXERCICES)[number]['code']

export type Filtres = {
  specialite?: CodeSpecialite
  exercice?: CodeExercice
  /** Identité confirmée par un registre. */
  verifie?: boolean
  /** Fiche gérée par le professionnel, revendication acceptée. */
  geree?: boolean
  /** Un numéro de téléphone est connu du registre. */
  telephone?: boolean
  /** Position au numéro, pas au milieu de la voie ou de la commune. */
  exacte?: boolean
  /** Accessible aux personnes à mobilité réduite, déclaré par le praticien. */
  pmr?: boolean
}

export const AUCUN_FILTRE: Filtres = {}

/** Cases à cocher, avec leur libellé et les professions concernées. */
export const CASES: { cle: keyof Filtres & ('verifie' | 'geree' | 'telephone' | 'exacte' | 'pmr'); libelle: string; professions: Profession[] }[] = [
  { cle: 'verifie', libelle: 'Vérifié auprès des registres officiels', professions: [...PROFESSIONS] },
  { cle: 'geree', libelle: 'Fiche gérée par le professionnel', professions: [...PROFESSIONS] },
  { cle: 'telephone', libelle: 'Téléphone renseigné', professions: [...PROFESSIONS] },
  { cle: 'exacte', libelle: 'Adresse localisée au numéro', professions: [...PROFESSIONS] },
  { cle: 'pmr', libelle: 'Accessible aux personnes à mobilité réduite', professions: [...PROFESSIONS_RPPS] },
]

export function nombreDeFiltres(f: Filtres): number {
  return Object.values(f).filter((v) => v !== undefined && v !== false).length
}

/** Les filtres en paramètres d'URL, pour la route de résultats. */
export function filtresEnParams(f: Filtres, params = new URLSearchParams()): URLSearchParams {
  if (f.specialite) params.set('specialite', f.specialite)
  if (f.exercice) params.set('exercice', f.exercice)
  for (const c of CASES) if (f[c.cle]) params.set(c.cle, '1')
  return params
}

/** Les filtres lus dans des paramètres d'URL, les valeurs inconnues ignorées. */
export function lireFiltres(params: URLSearchParams): Filtres {
  const f: Filtres = {}
  const specialite = params.get('specialite')
  if (SPECIALITES.some((s) => s.code === specialite)) f.specialite = specialite as CodeSpecialite
  const exercice = params.get('exercice')
  if (EXERCICES.some((e) => e.code === exercice)) f.exercice = exercice as CodeExercice
  for (const c of CASES) if (params.get(c.cle) === '1') f[c.cle] = true
  return f
}
