/**
 * Les adresses de la rubrique Emploi, en un seul endroit. Toutes finissent par
 * un slash, comme le reste du site (`trailingSlash`).
 */
export const EMPLOI = '/emploi/'
export const ALTERNANCE = '/emploi/alternance/'
export const REMPLACEMENTS = '/emploi/remplacements/'
export const RECRUTER = '/emploi/recruter/'
export const RECHERCHE_EMPLOI = '/emploi/recherche/'

/**
 * Publication d'une offre : écran de l'espace pro (D-EMPLOI), codé par la
 * session de l'espace pro. À remplacer par la route définitive si elle change.
 */
export const ROUTE_PUBLIER_OFFRE = '/espace-pro/emploi/'

export const cheminMetier = (metier: string) => `/emploi/${metier}/`
export const cheminDepartement = (metier: string, departement: string) => `/emploi/${metier}/${departement}/`
export const cheminCommune = (metier: string, departement: string, commune: string) => `/emploi/${metier}/${departement}/${commune}/`
export const cheminOffre = (slug: string) => `/emploi/offre/${slug}/`
export const cheminRemplacementsDepartement = (departement: string) => `/emploi/remplacements/${departement}/`

/** La fiche métier des Ressources, même slug que la page métier de l'emploi. */
export const cheminFicheMetier = (metier: string) => `/conseils/metiers/${metier}/`

/**
 * Le tiroir « Postuler » de la page de l'offre (`?postuler=1`). Postuler
 * exige un compte connecté, sans palier : sans session, le tiroir mène à la
 * connexion, qui ramène sur l'offre avec le tiroir ouvert.
 */
export const cheminPostuler = (slug: string) => `${cheminOffre(slug)}?postuler=1`
