/** Les durées de conservation, sans accès aux données : appliquées par `src/lib/conservation.ts`. */

/** Offres retirées, pourvues ou expirées, et leurs candidatures : six mois après. */
export const CONSERVATION_OFFRES_MOIS = 6
/** Compte sans connexion : supprimé au bout de deux ans… */
export const INACTIVITE_MOIS = 24
/** … un mois après l'email d'avertissement. */
export const PREAVIS_JOURS = 30

export const JOUR = 86_400_000

export function moisAvant(maintenant: Date, mois: number): Date {
  const d = new Date(maintenant)
  d.setMonth(d.getMonth() - mois)
  return d
}

/**
 * Où en est un compte : rien à faire, à avertir (un mois avant les deux ans),
 * ou à supprimer (deux ans passés et l'avertissement parti depuis un mois au
 * moins). Un avertissement manqué repousse la suppression d'autant : jamais
 * de compte supprimé sans email.
 */
export function etapeInactivite(
  c: { derniereActivite: Date; avertiLe: Date | null },
  maintenant = new Date(),
): 'actif' | 'avertir' | 'supprimer' {
  const limite = moisAvant(maintenant, INACTIVITE_MOIS)
  if (c.avertiLe) return c.derniereActivite < limite && maintenant.getTime() - c.avertiLe.getTime() >= PREAVIS_JOURS * JOUR ? 'supprimer' : 'actif'
  return c.derniereActivite.getTime() < limite.getTime() + PREAVIS_JOURS * JOUR ? 'avertir' : 'actif'
}
