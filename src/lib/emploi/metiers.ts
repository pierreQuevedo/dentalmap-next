/**
 * Référentiel de l'emploi : métiers, contrats, modes de rémunération.
 *
 * Fonctions pures, sans accès aux données : partagées par les requêtes, les
 * pages, le balisage et les tests. Les codes sont ceux des colonnes de la
 * table `offres` ; les slugs sont ceux des URL publiques.
 */

export const CODES_METIER = ['assistant_dentaire', 'secretaire', 'prothesiste', 'aide_dentaire', 'chirurgien_dentiste', 'assistant_specialise'] as const
export type CodeMetier = (typeof CODES_METIER)[number]

export const CODES_CONTRAT = ['cdi', 'cdd', 'alternance', 'stage', 'remplacement', 'collaboration'] as const
export type CodeContrat = (typeof CODES_CONTRAT)[number]

export const MODES_REMUNERATION = ['salaire', 'retrocession', 'redevance', 'gratification'] as const
export type ModeRemuneration = (typeof MODES_REMUNERATION)[number]

export type Metier = {
  code: CodeMetier
  /** Segment d'URL : `/emploi/assistant-dentaire/`. */
  slug: string
  /** Nom complet, inclusif : titres et fil d'Ariane. */
  nom: string
  /** Complément du nom dans une phrase : « Offres d’assistant(e) dentaire ». */
  de: string
  /** Libellé de la carte de l'accueil. */
  detail: string
  /** Photo d'illustration du métier (jamais celle d'un recruteur). */
  photo: string
}

/** Dans l'ordre d'affichage : le métier le plus demandé d'abord. */
export const METIERS: readonly Metier[] = [
  {
    code: 'assistant_dentaire',
    slug: 'assistant-dentaire',
    nom: 'Assistant(e) dentaire',
    de: 'd’assistant(e) dentaire',
    detail: 'CDI, CDD, temps plein ou partiel',
    photo: '/images/demo/pexels-6627320.jpg',
  },
  {
    code: 'secretaire',
    slug: 'secretaire-assistant-gestion',
    nom: 'Secrétaire de cabinet dentaire',
    de: 'de secrétaire de cabinet dentaire',
    detail: 'Accueil, planning, facturation',
    photo: '/images/demo/pexels-6627471.jpg',
  },
  {
    code: 'prothesiste',
    slug: 'prothesiste-dentaire',
    nom: 'Prothésiste dentaire',
    de: 'de prothésiste dentaire',
    detail: 'Laboratoires de prothèse',
    photo: '/images/demo/pexels-6627325.jpg',
  },
  {
    code: 'aide_dentaire',
    slug: 'aide-dentaire',
    nom: 'Aide dentaire',
    de: 'd’aide dentaire',
    detail: 'Stérilisation, hygiène, accueil',
    photo: '/images/demo/pexels-3881296.jpg',
  },
  {
    code: 'chirurgien_dentiste',
    slug: 'chirurgien-dentiste',
    nom: 'Chirurgien-dentiste',
    de: 'de chirurgien-dentiste',
    detail: 'Salariat, remplacements, collaborations',
    photo: '/images/demo/pexels-7800669.jpg',
  },
  {
    code: 'assistant_specialise',
    slug: 'assistant-specialise',
    nom: 'Assistant(e) spécialisé(e)',
    de: 'd’assistant(e) spécialisé(e)',
    detail: 'Orthodontie, chirurgie, parodontie',
    photo: '/images/demo/pexels-8413334.jpg',
  },
]

const PAR_SLUG = new Map(METIERS.map((m) => [m.slug, m]))
const PAR_CODE = new Map(METIERS.map((m) => [m.code, m]))

/** Le métier d'un segment d'URL, ou `null` : la page répond alors 404. */
export function metierDepuisSlug(slug: string): Metier | null {
  return PAR_SLUG.get(slug) ?? null
}

export function metierDepuisCode(code: CodeMetier): Metier {
  return PAR_CODE.get(code)!
}

export const LIBELLE_CONTRAT: Record<CodeContrat, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  alternance: 'Alternance',
  stage: 'Stage',
  remplacement: 'Remplacement',
  collaboration: 'Collaboration',
}

export function estContrat(v: string): v is CodeContrat {
  return (CODES_CONTRAT as readonly string[]).includes(v)
}

/** Les deux parcours de l'accueil et leurs pages : contrats regroupés. */
export const PARCOURS = {
  alternance: { contrats: ['alternance', 'stage'] as CodeContrat[], nom: 'Alternance et stages' },
  remplacements: { contrats: ['remplacement', 'collaboration'] as CodeContrat[], nom: 'Remplacements et collaborations' },
} as const

/**
 * Indexation d'une page de liste : une commune sans offre est servie en 200,
 * avec les offres voisines, mais hors index (`noindex, follow`), comme les
 * pages commune vides de l'annuaire. Une page filtrée n'est jamais indexée :
 * sa canonique est la page sans filtre.
 */
export function robotsListe(total: number, filtree = false): { index: boolean; follow: boolean } | undefined {
  if (total === 0 || filtree) return { index: false, follow: true }
  return undefined
}
