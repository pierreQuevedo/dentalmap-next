/**
 * Les thèmes de la formation continue, une seule liste pour toute la rubrique
 * (décision du 13 octobre 2026) : la liste d'attente des organismes (W1), les
 * filtres et les fiches des formations privées, et l'alerte des praticiens.
 * L'ordre est celui de l'affichage.
 */
export const THEMES_FORMATION = [
  'Implantologie',
  'Endodontie',
  'Parodontologie',
  'Orthodontie',
  'Prothèse et CFAO',
  'Chirurgie orale',
  'Esthétique',
  'Hygiène',
  'Radioprotection',
  'Gestion du cabinet',
] as const

export type ThemeFormation = (typeof THEMES_FORMATION)[number]
