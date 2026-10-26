/**
 * Rubriques masquées pour le moment. Passer un drapeau à `true` réaffiche la
 * rubrique partout d'un coup ; les pages et leur code restent en place.
 */

/**
 * DentalBridge, le logiciel de gestion de cabinet de la même équipe : masqué
 * tant que sa landing (dentalbridge.fr) n'est pas prête. Section de
 * l'accueil, encart du menu, lien du pied de page, mention sur la page
 * Partenaires.
 */
export const DENTALBRIDGE_VISIBLE = false

/**
 * Ressources (`/conseils/`) : masquées le 2026-10-26. Plus aucun lien n'y
 * mène (menu, accueil, pied de page, plan du site, page 404, fiche métier de
 * l'emploi) et elles sortent du sitemap. Les pages répondent encore à leur
 * adresse, hors de l'index (`robots`).
 */
export const RESSOURCES_VISIBLE = false

/**
 * Favoris : masqués le 2026-10-26, avec la fin des comptes patients. Plus de
 * bouton « Mettre de côté » sur les fiches, ni de lien dans l'en-tête, le menu,
 * le plan du site et la FAQ. Les anciens comptes patients gardent leur page
 * `/favoris/`, par le menu de leur compte.
 */
export const FAVORIS_VISIBLE = false
