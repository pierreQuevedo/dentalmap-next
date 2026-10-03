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
import { ORIENTATIONS, orientationsDe, type CodeOrientation } from '@/lib/espace-pro/fiche-completee'

export { ORIENTATIONS, orientationsDe, type CodeOrientation }

/**
 * Spécialités ordinales, telles que le registre les écrit dans
 * `praticiens.specialite`, par profession.
 *
 * Seules figurent les professions où le registre distingue plusieurs
 * spécialités : les stomatologues et les ORL n'en ont qu'une dans l'annuaire,
 * un filtre n'y trierait rien. Les deux libellés de la chirurgie
 * maxillo-faciale, avant et après la réforme de 2017, sont une seule
 * spécialité pour un patient.
 */
export const SPECIALITES: readonly { code: string; libelle: string; valeurs: readonly string[]; professions: readonly Profession[] }[] = [
  { code: 'odf', libelle: 'Orthopédie dento-faciale', valeurs: ['Orthopédie dento-faciale'], professions: ['dentiste'] },
  { code: 'chirurgie-orale', libelle: 'Chirurgie orale', valeurs: ['Chirurgie Orale'], professions: ['dentiste'] },
  { code: 'medecine-bucco-dentaire', libelle: 'Médecine bucco-dentaire', valeurs: ['Médecine Bucco-Dentaire'], professions: ['dentiste'] },
  {
    code: 'maxillo-faciale',
    libelle: 'Chirurgie maxillo-faciale',
    valeurs: ['Chirurgie maxillo-faciale', 'Chirurgie maxillo-faciale (réforme 2017)'],
    professions: ['maxillo_facial'],
  },
  {
    code: 'maxillo-faciale-stomatologie',
    libelle: 'Chirurgie maxillo-faciale et stomatologie',
    valeurs: ['Chirurgie maxillo-faciale et stomatologie'],
    professions: ['maxillo_facial'],
  },
]
export type CodeSpecialite = (typeof SPECIALITES)[number]['code']

/** Les spécialités que le registre distingue pour une profession. Vide quand il n'en distingue aucune. */
export function specialitesDe(profession: Profession) {
  return SPECIALITES.filter((s) => s.professions.includes(profession))
}

/** Valeurs du registre pour le mode d'exercice. */
export const EXERCICES = [
  { code: 'liberal', libelle: 'Libéral', valeur: 'Lib,indép,artis,com' },
  { code: 'salarie', libelle: 'Salarié', valeur: 'Salarié' },
] as const
export type CodeExercice = (typeof EXERCICES)[number]['code']

export type Filtres = {
  /** Spécialité ordinale, inscrite au registre. */
  specialite?: CodeSpecialite
  /** Orientation d'exercice, déclarée par le praticien sur une fiche attribuée. */
  orientation?: CodeOrientation
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
  if (f.orientation) params.set('orientation', f.orientation)
  if (f.exercice) params.set('exercice', f.exercice)
  for (const c of CASES) if (f[c.cle]) params.set(c.cle, '1')
  return params
}

/** Les filtres lus dans des paramètres d'URL, les valeurs inconnues ignorées. */
export function lireFiltres(params: URLSearchParams): Filtres {
  const f: Filtres = {}
  const specialite = params.get('specialite')
  if (SPECIALITES.some((s) => s.code === specialite)) f.specialite = specialite as CodeSpecialite
  const orientation = params.get('orientation')
  if (ORIENTATIONS.some((o) => o.code === orientation)) f.orientation = orientation as CodeOrientation
  const exercice = params.get('exercice')
  if (EXERCICES.some((e) => e.code === exercice)) f.exercice = exercice as CodeExercice
  for (const c of CASES) if (params.get(c.cle) === '1') f[c.cle] = true
  return f
}
