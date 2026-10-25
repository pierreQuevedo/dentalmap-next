/**
 * CX4 : quand proposer une clé d'accès. Dès la première connexion par mot de
 * passe, si le compte n'a aucune clé : la proposition, puis une seule
 * relance, au moins une semaine plus tard. Jamais plus. (Attendre la
 * deuxième connexion ne marchait pas : les sessions comptées s'effacent à
 * chaque déconnexion.)
 */
export const PROPOSITIONS_MAX = 2
export const DELAI_RELANCE_JOURS = 7

export type EtatCle = { cles: number; fois: number; derniere: Date | null }

/** Règle pure : à partir de l'état du compte, faut-il proposer ? */
export function proposerCle(e: EtatCle, maintenant = new Date()): boolean {
  if (e.cles > 0 || e.fois >= PROPOSITIONS_MAX) return false
  return !e.derniere || maintenant.getTime() - e.derniere.getTime() >= DELAI_RELANCE_JOURS * 86_400_000
}

/**
 * Jamais au milieu d'un parcours : revendication, onboarding, inscription,
 * établissement. La clé se propose en arrivant sur l'espace pro ou le site,
 * pas entre deux étapes.
 */
const EN_PARCOURS = ['/espace-pro/revendiquer', '/espace-pro/laboratoire/revendiquer', '/espace-pro/onboarding', '/espace-pro/laboratoire/onboarding', '/espace-pro/organisme', '/espace-pro/lieux', '/inscription', '/connexion']
export function moment(retour: string): boolean {
  return !EN_PARCOURS.some((p) => retour.startsWith(p))
}
