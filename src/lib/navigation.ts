import type { Route } from 'next'

/**
 * Source unique de la navigation.
 *
 * Header, méga-menu, tiroir mobile, pied de page et plan du site lisent cette
 * structure. Aucun lien n'est écrit en dur dans un composant : un lien qui
 * n'est pas ici n'existe pas.
 *
 * Les `href` internes n'ont pas de slash final. Le site tourne avec
 * `trailingSlash: true` et Next normalise les `Link` à la construction ; la
 * convention sans slash garde le fichier lisible et testable.
 */

/**
 * Les chemins composés à l'exécution, ou porteurs d'une chaîne de requête, ne
 * peuvent pas être connus de `typedRoutes` à la compilation. Cette fonction
 * isole la conversion en un seul endroit, plutôt que de parsemer le code de
 * conversions de type.
 */
export const chemin = (href: string) => href as Route

export type NavLink = {
  label: string
  href: Route | string
  external?: boolean
  description?: string
}

export type NavColumn = {
  title: string
  links: NavLink[]
  highlight?: boolean
  dynamic?: 'acces-rapide'
  /** Texte d'explication affiché avant les liens, pour la colonne mise en avant. */
  note?: string
}

export type NavEntry = {
  label: string
  href: Route
  columns?: NavColumn[]
  links?: NavLink[]
}

export const CONSEIL_CATEGORIES = ['patients', 'praticiens', 'prothesistes'] as const
export const ANNONCE_TYPES = ['cession', 'collaboration', 'remplacement', 'emploi'] as const
export const FORMATION_TYPES = ['ecoles-de-prothese', 'facultes-odontologie', 'formations-privees'] as const

export type ConseilCategorie = (typeof CONSEIL_CATEGORIES)[number]
export type AnnonceType = (typeof ANNONCE_TYPES)[number]
export type FormationType = (typeof FORMATION_TYPES)[number]

export type NavIcon = 'map' | 'article' | 'mail' | 'school' | 'info'

export const mainNavIcons: Record<string, NavIcon> = {
  Annuaire: 'map',
  Conseils: 'article',
  Annonces: 'mail',
  Formation: 'school',
  'À propos': 'info',
}

export const mainNav: NavEntry[] = [
  {
    label: 'Annuaire',
    href: '/dentistes',
    columns: [
      {
        title: 'Chirurgiens-dentistes',
        links: [
          { label: 'Tous les dentistes', href: '/dentistes' },
          { label: 'Par département', href: '/dentistes#departements' },
          { label: 'Trouver un dentiste près de chez vous', href: '/recherche?profession=dentistes' },
        ],
      },
      {
        title: 'Prothésistes dentaires',
        links: [
          { label: 'Tous les laboratoires', href: '/prothesistes' },
          { label: 'Par département', href: '/prothesistes#departements' },
          { label: 'Trouver un laboratoire', href: '/recherche?profession=prothesistes' },
        ],
      },
      { title: 'Accès rapide', links: [], dynamic: 'acces-rapide' },
      {
        // Colonne d'affirmation, sans lien : elle rappelle la promesse de
        // neutralité au moment où le visiteur entre dans l'annuaire.
        title: 'Notre méthode',
        highlight: true,
        note:
          'Chaque fiche est vérifiée dans les registres RPPS, ADELI et Sirene. ' +
          'Le classement se fait par distance puis par ordre alphabétique. La place ne s’achète pas.',
        links: [],
      },
    ],
  },
  {
    label: 'Conseils',
    href: '/conseils',
    links: [
      { label: 'Tous les conseils', href: '/conseils' },
      { label: 'Pour les patients', href: '/conseils/patients' },
      { label: 'Pour les praticiens', href: '/conseils/praticiens' },
      { label: 'Pour les prothésistes', href: '/conseils/prothesistes' },
    ],
  },
  {
    label: 'Annonces',
    href: '/annonces',
    links: [
      { label: 'Toutes les annonces', href: '/annonces' },
      { label: 'Cessions de cabinet', href: '/annonces/cession' },
      { label: 'Collaborations', href: '/annonces/collaboration' },
      { label: 'Remplacements', href: '/annonces/remplacement' },
      { label: 'Emploi', href: '/annonces/emploi' },
    ],
  },
  {
    label: 'Formation',
    href: '/formation',
    links: [
      { label: 'Toutes les formations', href: '/formation' },
      { label: 'Écoles de prothèse dentaire', href: '/formation/ecoles-de-prothese' },
      { label: "Facultés d'odontologie", href: '/formation/facultes-odontologie' },
      { label: 'Formations privées', href: '/formation/formations-privees' },
    ],
  },
  {
    label: 'À propos',
    href: '/a-propos',
    links: [
      { label: 'Le projet DentalMap', href: '/a-propos' },
      { label: 'Questions fréquentes', href: '/faq' },
      { label: 'Devenir partenaire', href: '/partenaires' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

/**
 * Colonnes du pied de page, modèle Airbnb à trois colonnes.
 *
 * DentalBridge n'apparaît qu'ici, dans la colonne Professionnels, en lien
 * externe signalé.
 */
export const footerCols: NavColumn[] = [
  {
    title: 'Assistance',
    links: [
      { label: 'Questions fréquentes', href: '/faq' },
      { label: 'Signaler une erreur sur une fiche', href: '/contact?objet=erreur-fiche' },
      { label: 'Contact', href: '/contact' },
      { label: 'Vos données personnelles', href: '/confidentialite' },
    ],
  },
  {
    title: 'Professionnels',
    links: [
      { label: 'Revendiquer ma fiche', href: '/espace-pro/revendiquer' },
      { label: 'Espace pro', href: '/espace-pro' },
      { label: 'Créer un compte', href: '/connexion?mode=inscription' },
      { label: 'Déposer une annonce', href: '/annonces' },
      {
        label: 'DentalBridge, logiciel de gestion de cabinet',
        href: 'https://dentalbridge.fr',
        external: true,
        description: 'site externe',
      },
    ],
  },
  {
    title: 'DentalMap',
    links: [
      { label: 'Le projet', href: '/a-propos' },
      { label: 'Notre engagement de neutralité', href: '/a-propos#neutralite' },
      { label: 'Devenir partenaire', href: '/partenaires' },
      { label: 'Conseils et ressources', href: '/conseils' },
      { label: 'Formation', href: '/formation' },
    ],
  },
]

export const legalNav: NavLink[] = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Politique de confidentialité', href: '/confidentialite' },
  { label: "Conditions d'utilisation", href: '/cgu' },
  { label: 'Plan du site', href: '/plan-du-site' },
]

export type ExploreLink = { title: string; sub: string; href: string }
export type ExplorePanel = { id: string; label: string; links: ExploreLink[] }

export const exploreStatic: ExplorePanel = {
  id: 'conseils',
  label: 'Conseils',
  links: [
    { title: 'Pour les patients', sub: 'Choisir, comprendre, préparer', href: '/conseils/patients' },
    { title: 'Pour les praticiens', sub: 'Installation, réglementation', href: '/conseils/praticiens' },
    { title: 'Pour les prothésistes', sub: 'Laboratoire, normes, matériaux', href: '/conseils/prothesistes' },
    { title: 'Questions fréquentes', sub: 'Vérification, données, fiches', href: '/faq' },
    { title: 'Annonces', sub: 'Cessions, remplacements, emploi', href: '/annonces' },
    { title: 'Devenir partenaire', sub: 'Institutions, écoles, éditeurs', href: '/partenaires' },
  ],
}
