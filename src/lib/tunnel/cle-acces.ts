/**
 * CX4 : quand proposer une clé d'accès. Après une connexion par mot de passe,
 * à partir de la deuxième, si le compte n'a aucune clé : la proposition, puis
 * une seule relance, au moins une semaine plus tard. Jamais plus.
 */
export const PROPOSITIONS_MAX = 2
export const DELAI_RELANCE_JOURS = 7

export type EtatCle = { cles: number; sessions: number; fois: number; derniere: Date | null }

/** Règle pure : à partir de l'état du compte, faut-il proposer ? */
export function proposerCle(e: EtatCle, maintenant = new Date()): boolean {
  if (e.cles > 0 || e.sessions < 2 || e.fois >= PROPOSITIONS_MAX) return false
  return !e.derniere || maintenant.getTime() - e.derniere.getTime() >= DELAI_RELANCE_JOURS * 86_400_000
}
