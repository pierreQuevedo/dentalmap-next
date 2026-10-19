/**
 * Le parrainage, partie pure : le bonus de mise en avant et la lecture des
 * adresses saisies. Importé par les pages, les actions, le classement et les
 * tests ; les requêtes sont dans `parrainage-donnees.ts`.
 */

/** Points ajoutés au taux de remplissage, pour le parrain comme pour le filleul, par parrainage réussi. */
export const BONUS_PARRAINAGE = 5
/** Durée de chaque bonus, à compter de la vérification du filleul. */
export const DUREE_BONUS_JOURS = 90
/** Les bonus se cumulent jusqu'à ce plafond. */
export const PLAFOND_BONUS = 15
/** Invitations par compte sur sept jours glissants. */
export const INVITATIONS_PAR_SEMAINE = 10
/** Une seule relance, sept jours après l'invitation, si personne n'a donné suite. */
export const RELANCE_JOURS = 7

const JOUR = 86_400_000

export type Bonus = { points: number; actifs: number; jusquau: Date | null }

/**
 * Le bonus en cours d'une fiche, d'après les dates de réussite de ses
 * parrainages (comme parrain ou comme filleul). `jusquau` : la fin du bonus
 * le plus long encore actif.
 */
export function bonusParrainage(reussites: Date[], maintenant = new Date()): Bonus {
  const fins = reussites.map((d) => d.getTime() + DUREE_BONUS_JOURS * JOUR).filter((f) => f > maintenant.getTime())
  if (!fins.length) return { points: 0, actifs: 0, jusquau: null }
  return { points: Math.min(PLAFOND_BONUS, fins.length * BONUS_PARRAINAGE), actifs: fins.length, jusquau: new Date(Math.max(...fins)) }
}

const ADRESSE = /^[^\s@<>(),;:"]+@[^\s@<>(),;:"]+\.[a-z]{2,}$/i

/** Les adresses d'une saisie libre (virgules, points-virgules, espaces ou retours à la ligne), en minuscules et sans doublon. */
export function lireAdresses(saisie: string): { valides: string[]; invalides: string[] } {
  const valides = new Set<string>()
  const invalides: string[] = []
  for (const brut of saisie.split(/[\s,;]+/)) {
    const a = brut.trim().replace(/^<|>$/g, '').toLowerCase()
    if (!a) continue
    if (ADRESSE.test(a)) valides.add(a)
    else invalides.push(brut.trim())
  }
  return { valides: [...valides], invalides }
}
