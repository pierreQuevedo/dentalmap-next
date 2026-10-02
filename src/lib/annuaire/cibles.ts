import type { SuggestionLieu } from './use-suggestions'

/**
 * Les quatre cibles d'une recherche, et la destination d'un lieu choisi.
 *
 * Partagé par le champ unique de l'accueil et par la recherche de l'en-tête :
 * les deux posent la même question, l'un sur le hero, l'autre dans un panneau
 * déplié sous la barre. Ce qui se passe une fois le lieu choisi ne doit pas
 * dépendre de l'endroit où on l'a tapé.
 */
export type Cible = 'dentistes' | 'prothesistes' | 'maxillo-faciaux' | 'stomatologues' | 'orl' | 'ecoles' | 'formations'

/** Cibles qui mènent à l'annuaire des praticiens, avec carte et filtres. */
export const CIBLES_ANNUAIRE: readonly Cible[] = ['dentistes', 'prothesistes', 'maxillo-faciaux', 'stomatologues', 'orl'] as const

export const CIBLES: { cle: Cible; label: string; aide: string }[] = [
  {
    cle: 'dentistes',
    label: 'Dentiste',
    aide: 'Chirurgiens-dentistes inscrits au répertoire partagé des professionnels de santé',
  },
  {
    cle: 'prothesistes',
    label: 'Prothésiste',
    aide: 'Laboratoires de prothèse dentaire, issus du répertoire Sirene',
  },
  {
    cle: 'maxillo-faciaux',
    label: 'Maxillo-facial',
    aide: 'Chirurgiens maxillo-faciaux inscrits au répertoire partagé des professionnels de santé',
  },
  {
    cle: 'stomatologues',
    label: 'Stomatologue',
    aide: 'Médecins stomatologues inscrits au répertoire partagé des professionnels de santé',
  },
  {
    cle: 'orl',
    label: 'ORL',
    aide: 'Oto-rhino-laryngologistes inscrits au répertoire partagé des professionnels de santé',
  },
  {
    cle: 'ecoles',
    label: 'École',
    aide: 'Écoles de prothèse dentaire et facultés d’odontologie',
  },
  {
    cle: 'formations',
    label: 'Formation',
    aide: 'Formations continues et diplômes universitaires',
  },
]

/**
 * Destination d'une suggestion choisie, selon la cible et le type de lieu.
 *
 * Une commune, un département et une région mènent à leur page dans
 * l'annuaire, qui est une recherche déjà faite sur ce territoire.
 * Pour les écoles et les formations, le lieu part en paramètre de la page de
 * formation, quel que soit son type.
 */
/**
 * Ce qu'il faut d'un lieu pour construire sa destination : une suggestion
 * de l'autocomplétion, ou le territoire de la page courante.
 */
export type LieuChoisi =
  | { type: 'commune'; code_insee: string; slug: string; departement_slug: string }
  | { type: 'departement' | 'region'; code: string; slug: string }

export function destination(cible: Cible, lieu: LieuChoisi): string {
  if (cible === 'ecoles' || cible === 'formations') {
    const base = cible === 'ecoles' ? '/formation/ecoles-de-prothese/' : '/formation/'
    const cle = lieu.type === 'commune' ? 'lieu' : lieu.type
    const valeur = lieu.type === 'commune' ? lieu.code_insee : lieu.code
    return `${base}?${cle}=${encodeURIComponent(valeur)}`
  }
  if (lieu.type === 'commune') return `/${cible}/${lieu.departement_slug}/${lieu.slug}/`
  return `/${cible}/${lieu.slug}/`
}

export const LIBELLE_TYPE: Record<SuggestionLieu['type'], string> = {
  commune: 'Commune',
  departement: 'Département',
  region: 'Région',
}

/** Ligne secondaire d'une suggestion : code postal et département, région, ou code. */
export function precision(lieu: SuggestionLieu): string {
  if (lieu.type === 'commune') return [lieu.code_postal, lieu.departement_nom].filter(Boolean).join(' ')
  if (lieu.type === 'departement') return `${lieu.code} · ${lieu.region_nom}`
  return 'Région'
}
