import { z } from 'zod'

/**
 * Les avis sur un établissement de formation, partie pure : qui les dépose
 * (lien déclaré), ce qu'ils contiennent, et ce qu'ils pèsent dans le
 * classement des listes d'écoles et de facultés.
 *
 * Classement (décision du 22 octobre 2026) : 80 % les avis, 20 % le taux de
 * remplissage de la page. Côté avis, le nombre pèse le plus et la note
 * module ; une note portée par peu d'avis est ramenée vers une note de
 * référence, pour qu'un seul 5/5 ne suffise pas. Rien de ceci ne s'écrit sur
 * le site public.
 */

export const LIENS_AVIS = [
  { cle: 'etudiant', libelle: 'Étudiant(e)' },
  { cle: 'ancien', libelle: 'Ancien(ne) étudiant(e)' },
  { cle: 'parent', libelle: 'Parent d’étudiant' },
  { cle: 'patient', libelle: 'Patient(e) du centre de soins' },
] as const

export type LienAvis = (typeof LIENS_AVIS)[number]['cle']

export const libelleLien = (l: string) => LIENS_AVIS.find((x) => x.cle === l)?.libelle ?? 'Avis'

/** Les liens proposés : un patient ne se déclare que pour une faculté, qui a des centres de soins. */
export const liensPour = (type: 'ecole_prothese' | 'faculte') => LIENS_AVIS.filter((l) => l.cle !== 'patient' || type === 'faculte')

export const TEXTE_MIN = 40
export const TEXTE_MAX = 1500
export const REPONSE_MAX = 1000

export const Avis = z.object({
  lien: z.enum(['etudiant', 'ancien', 'parent', 'patient'], { message: 'Indiquez votre lien avec l’établissement.' }),
  annee: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => v || undefined),
  note: z.coerce.number({ message: 'Choisissez une note.' }).int().min(1, 'Choisissez une note.').max(5),
  texte: z.string().trim().min(TEXTE_MIN, `Quelques phrases au moins : ${TEXTE_MIN} caractères.`).max(TEXTE_MAX, `${TEXTE_MAX.toLocaleString('fr-FR')} caractères au plus.`),
})

/**
 * Les injures, refusées d'emblée. Pas la liste publicitaire des fiches de
 * soignants : un avis peut dire « la meilleure formation » ou citer une
 * promotion. Le reste passe par le signalement.
 */
const INJURES = ['con', 'conne', 'connard', 'connasse', 'salope', 'salaud', 'pute', 'putain', 'encule', 'enculee', 'enfoire', 'batard', 'merde', 'abruti', 'abrutie', 'debile', 'cretin', 'cretine', 'pd', 'nazi', 'nazis']

function injures(texte: string): string[] {
  const mots = texte.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^\p{L}]+/u)
  return INJURES.filter((i) => mots.includes(i))
}

/** Ce qui empêche un texte d'être publié : une injure, ou une adresse email ou un téléphone. */
export function refusTexte(texte: string): string | null {
  if (injures(texte).length) return 'Votre texte contient un terme que nous ne publions pas. Reformulez-le, sans injure ni attaque personnelle.'
  if (/[\w.+-]+@[\w-]+\.[\w.-]+/.test(texte) || /0\d(?:[ .-]?\d{2}){4}/.test(texte)) return 'Retirez les adresses email et numéros de téléphone : un avis reste public.'
  return null
}

export const MOTIFS_SIGNALEMENT = [
  { cle: 'injurieux', libelle: 'Injurieux ou diffamatoire' },
  { cle: 'faux', libelle: 'Faux, ou sans lien réel avec l’établissement' },
  { cle: 'personnel', libelle: 'Vise une personne nommément' },
  { cle: 'hors_sujet', libelle: 'Hors sujet ou publicitaire' },
  { cle: 'autre', libelle: 'Autre raison' },
] as const

export type MotifSignalement = (typeof MOTIFS_SIGNALEMENT)[number]['cle']

/* ------------------------------------------------------------------ */
/* Résumé et classement                                                 */
/* ------------------------------------------------------------------ */

export type ResumeAvis = { nombre: number; moyenne: number | null; repartition: Record<1 | 2 | 3 | 4 | 5, number> }

export function resumerAvis(notes: number[]): ResumeAvis {
  const repartition = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ResumeAvis['repartition']
  for (const n of notes) if (n >= 1 && n <= 5) repartition[n as 1] += 1
  const nombre = notes.length
  return { nombre, moyenne: nombre ? Math.round((notes.reduce((s, n) => s + n, 0) / nombre) * 10) / 10 : null, repartition }
}

/** La note de référence et son poids, en nombre d'avis fictifs : une note sur trois avis compte à moitié. */
const NOTE_REFERENCE = 4
const POIDS_REFERENCE = 3
/** Au-delà de ce nombre d'avis, la part du volume est pleine. */
const AVIS_PLEIN = 50

/** La note ramenée vers la référence tant qu'il y a peu d'avis. */
export function noteAjustee(nombre: number, moyenne: number | null): number {
  return (NOTE_REFERENCE * POIDS_REFERENCE + (moyenne ?? 0) * nombre) / (POIDS_REFERENCE + nombre)
}

/**
 * La part « avis », entre 0 et 1 : le volume (logarithmique, plein à 50 avis)
 * multiplié par un facteur de note entre 0,5 et 1. Sans avis, 0.
 */
export function scoreAvis(nombre: number, moyenne: number | null): number {
  if (!nombre) return 0
  const volume = Math.min(1, Math.log1p(nombre) / Math.log1p(AVIS_PLEIN))
  const note = 0.5 + 0.5 * ((noteAjustee(nombre, moyenne) - 1) / 4)
  return volume * note
}

/** Le score de classement d'un établissement : 80 % avis, 20 % taux de remplissage (0 à 100). */
export function scoreClassement(avis: { nombre: number; moyenne: number | null }, remplissage: number): number {
  return 0.8 * scoreAvis(avis.nombre, avis.moyenne) + 0.2 * (Math.max(0, Math.min(100, remplissage)) / 100)
}

/** « 4,6 » */
export const noteFr = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export type ChiffresEtablissement = { nombre: number; moyenne: number | null; remplissage: number }

/**
 * Les établissements dans l'ordre du classement : score décroissant, l'ordre
 * reçu départageant les égalités (tri stable). Un établissement sans page
 * gérée ni avis vaut 0.
 */
export function classerEtablissements<T extends { slug: string }>(liste: T[], chiffres: Map<string, ChiffresEtablissement>): T[] {
  const score = (slug: string) => {
    const c = chiffres.get(slug)
    return c ? scoreClassement(c, c.remplissage) : 0
  }
  return liste
    .map((x, i) => ({ x, i, s: score(x.slug) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((e) => e.x)
}

/* ------------------------------------------------------------------ */
/* Ce que rapporte un avis à son auteur                                 */
/* ------------------------------------------------------------------ */

/**
 * Un avis publié rapporte des points de mise en avant au profil candidat de
 * son auteur (Profils disponibles), quelle que soit sa note : deux avis au
 * plus comptent, et un avis retiré par l'équipe ne compte plus. Le profil
 * peut être créé après l'avis : les points l'attendent.
 */
export const POINTS_AVIS = 20
export const AVIS_COMPTES_MAX = 2

export const pointsAvis = (avisPublies: number) => Math.min(AVIS_COMPTES_MAX, Math.max(0, avisPublies)) * POINTS_AVIS

/** Ce que cherche un étudiant de cet établissement : l'alternance n'existe qu'en école de prothèse. */
export const recherchePour = (type: 'ecole_prothese' | 'faculte') => (type === 'faculte' ? 'stage ou de job étudiant' : 'stage ou d’alternance')
