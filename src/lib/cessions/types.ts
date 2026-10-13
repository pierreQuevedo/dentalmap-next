/**
 * Les annonces de cession : types et constantes partagés par les pages, les
 * composants (y compris côté client) et les requêtes. Aucun accès à la base
 * ici : les requêtes vivent dans `queries.ts`.
 */

/** Les valeurs de la colonne `annonces_cession.type`, dans l'ordre d'affichage. */
export const TYPES_CESSION = ['cabinet', 'parts', 'patientele', 'murs'] as const
export type TypeCession = (typeof TYPES_CESSION)[number]

export const LIBELLE_TYPE: Record<TypeCession, string> = {
  cabinet: 'Cabinet individuel',
  parts: 'Parts de société',
  patientele: 'Patientèle',
  murs: 'Murs ou locaux',
}

export function estTypeCession(v: unknown): v is TypeCession {
  return typeof v === 'string' && (TYPES_CESSION as readonly string[]).includes(v)
}

/**
 * Classe de disponibilité, calculée à la lecture à partir du champ libre
 * `disponibilite` (voir `classerDisponibilite`). `null` : non reconnue,
 * l'annonce ne ressort alors que sans filtre de disponibilité.
 */
export type ClasseDisponibilite = 'immediate' | 'six_mois' | 'plus_tard' | null

/** Une annonce telle que les listes l'affichent. Montants en milliers d'euros. */
export type AnnonceResume = {
  id: string
  slug: string
  type: TypeCession
  titre: string
  /** Libellé du secteur, ou à défaut le nom de la commune. */
  secteur: string
  communeNom: string
  departementCode: string
  departementSlug: string
  departementNom: string
  /** Centre du secteur flou (jamais l'adresse du cabinet). */
  lon: number
  lat: number
  rayonM: number
  fauteuils: number | null
  caMin: number | null
  caMax: number | null
  prix: number | null
  surface: number | null
  disponibilite: string | null
  classeDisponibilite: ClasseDisponibilite
  /** URL publique de la première photo, ou `null` : fond neutre. */
  photo: string | null
  /** Dates ISO. */
  publieeLe: string
  expireLe: string
  /** Distance au point d'origine de la liste, en kilomètres, quand la liste en a un. */
  km?: number
}

export type AnnonceDetail = AnnonceResume & {
  description: string
  equipements: string[]
  conditions: string | null
  locaux: string | null
  photos: string[]
  /** Lu côté serveur seulement : sert à refuser d'écrire à sa propre annonce. Jamais affiché. */
  auteurUserId: string
}

/** Filtres de la liste, lus dans l'URL. */
export type FiltresCession = {
  types: TypeCession[]
  /** 1, 2, ou 3 pour « 3 et plus ». */
  fauteuils: 1 | 2 | 3 | null
  dispo: 'immediate' | 'six-mois' | null
  page: number
}

export type DepartementCession = { code: string; nom: string; slug: string; total: number }
