/**
 * Les adresses des annonces de cession, en un seul endroit.
 */

/**
 * Où mène « Déposer depuis mon espace pro ». L'écran de dépôt est codé par la
 * session de l'espace pro : quand sa route existe (par exemple
 * `/espace-pro/cessions/nouvelle/`), c'est cette seule constante qu'il faut
 * changer.
 */
export const ROUTE_DEPOT_CESSION = '/espace-pro/'

/**
 * La messagerie de l'espace pro, où le cédant lit et répond aux messages des
 * repreneurs. Même remarque : à remplacer par la route exacte quand elle existe.
 */
export const ROUTE_MESSAGERIE_CESSION = '/espace-pro/'

export const LISTE_CESSIONS = '/annonces/cession/'
export const DEPOSER_CESSION = '/annonces/cession/deposer/'

export const cheminDepartementCession = (departementSlug: string) => `/annonces/cession/${departementSlug}/`
export const cheminAnnonceCession = (departementSlug: string, slug: string) => `/annonces/cession/${departementSlug}/${slug}/`
