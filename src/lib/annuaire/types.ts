import { formaterNom, formaterRaisonSociale } from './nom'

/**
 * Les professions de l'annuaire.
 *
 * Deux registres : le RPPS pour les chirurgiens-dentistes et les médecins
 * (chirurgiens maxillo-faciaux, stomatologues, ORL), Sirene pour les
 * laboratoires de prothèse. Les médecins sont distingués par leur spécialité
 * ordinale ; la chirurgie orale reste une spécialité des dentistes.
 */
export type Profession = 'dentiste' | 'prothesiste' | 'maxillo_facial' | 'stomatologue' | 'orl'

/** Les professions du RPPS : personnes, avec un numéro RPPS et une civilité. */
export const PROFESSIONS_RPPS: readonly Profession[] = ['dentiste', 'maxillo_facial', 'stomatologue', 'orl'] as const

export function estPersonne(profession: Profession): boolean {
  return profession !== 'prothesiste'
}

/**
 * Civilité au registre. Nulle pour les laboratoires, qui sont des structures.
 *
 * Elle ne sert qu'au choix du visuel de remplacement des fiches sans photo, et
 * n'est jamais affichée : le nom d'usage porte déjà le « Dr ».
 */
export type Civilite = 'M' | 'MME'

/**
 * Ce que désigne une position, repris du `result_type` de l'API Adresse.
 *
 * `numero` seul vaut une adresse exacte. `voie` place le point au milieu de la
 * rue, ce qui peut faire cent mètres en ville : utilisable, mais à dire.
 */
export type PrecisionPosition = 'numero' | 'voie' | 'lieu_dit' | 'commune'

/** Segment d'URL correspondant à une profession. La hiérarchie est figée. */
export const BASE_URL: Record<Profession, 'dentistes' | 'prothesistes' | 'maxillo-faciaux' | 'stomatologues' | 'orl'> = {
  dentiste: 'dentistes',
  prothesiste: 'prothesistes',
  maxillo_facial: 'maxillo-faciaux',
  stomatologue: 'stomatologues',
  orl: 'orl',
}

export const PROFESSION_PAR_BASE = {
  dentistes: 'dentiste',
  prothesistes: 'prothesiste',
  'maxillo-faciaux': 'maxillo_facial',
  stomatologues: 'stomatologue',
  orl: 'orl',
} as const satisfies Record<string, Profession>

export const PROFESSIONS: readonly Profession[] = ['dentiste', 'prothesiste', 'maxillo_facial', 'stomatologue', 'orl'] as const

export function estBaseUrl(v: string): v is BaseUrl {
  return v in PROFESSION_PAR_BASE
}

export type BaseUrl = keyof typeof PROFESSION_PAR_BASE

export type Lieu = {
  id: string
  adresseLigne: string | null
  codePostal: string | null
  /**
   * Le numéro lui-même ne circule plus dans l'application.
   *
   * Il n'est lu qu'à la demande, par `/api/praticiens/telephone`, et seulement
   * pour une session ouverte. Ne garder ici qu'un booléen évite qu'il ne
   * réapparaisse par inadvertance dans une page, une tuile ou une réponse
   * d'API : le type l'interdit.
   */
  aTelephone: boolean
  /** Numéro FINESS du site, présent quand le lieu dépend d'un établissement. */
  finess: string | null
  principal: boolean
  approximative: boolean
  precisionPosition: PrecisionPosition | null
  lon: number | null
  lat: number | null
  communeNom: string | null
  communeSlug: string | null
  departementSlug: string | null
}

export type Praticien = {
  id: string
  slug: string
  profession: Profession
  civilite: Civilite | null
  nom: string
  prenom: string | null
  raisonSociale: string | null
  rpps: string | null
  siren: string | null
  siret: string | null
  /** Spécialité ordinale, quand le registre en déclare une. */
  specialite: string | null
  /** Libéral, salarié ou bénévole, tel que libellé par le registre. */
  modeExercice: string | null
  /** « Civil », « Étudiant » ou « Agent public ». */
  categorieProfessionnelle: string | null
  statutVerification: 'verifie' | 'partiel' | 'non_verifie'
  indexable: boolean
  supprimeLe: string | null
  majLe: string
  lieux: Lieu[]
}

/** Ligne de liste : le strict nécessaire pour afficher une carte de résultat. */
export type PraticienResume = {
  slug: string
  /** Lieu retenu pour ce résumé, clé de lecture du téléphone protégé. */
  lieuId: string
  civilite: Civilite | null
  nom: string
  prenom: string | null
  raisonSociale: string | null
  statutVerification: 'verifie' | 'partiel' | 'non_verifie'
  adresseLigne: string | null
  codePostal: string | null
  /** Voir `Lieu.aTelephone` : le numéro ne circule pas, seule son existence. */
  aTelephone: boolean
  /** Une revendication acceptée existe : le professionnel gère sa fiche. */
  revendiquee: boolean
  communeNom: string | null
  communeSlug: string | null
  departementSlug: string | null
  precisionPosition: PrecisionPosition | null
  lon: number | null
  lat: number | null
}

/**
 * Nom d'affichage : raison sociale pour un laboratoire, civilité pour un
 * praticien. Les sources livrent tout en capitales, la mise en forme est faite
 * ici pour qu'aucune page n'ait à y penser.
 */
export function nomAffiche(p: {
  profession?: Profession
  nom: string
  prenom?: string | null
  raisonSociale?: string | null
}): string {
  if (p.profession === 'prothesiste') return formaterRaisonSociale(p.raisonSociale || p.nom)
  const complet = [formaterNom(p.prenom), formaterNom(p.nom)].filter(Boolean).join(' ')
  return complet ? `Dr ${complet}` : formaterNom(p.nom)
}

export function cheminPraticien(base: BaseUrl, departement: string, commune: string, slug: string): string {
  return `/${base}/${departement}/${commune}/${slug}/`
}
