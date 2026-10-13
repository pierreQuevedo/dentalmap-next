/**
 * Mise en forme des offres : rémunération, contrat, dates. Fonctions pures,
 * testées dans `tests/emploi.test.ts`.
 */
import { LIBELLE_CONTRAT, type CodeContrat, type ModeRemuneration } from './metiers'

/** « 2 100 », séparateur des milliers du site. */
export const euros = (n: number) => n.toLocaleString('fr-FR')
export const km = (metres: number) => `${(metres / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`

const POURCENT = ' %'

function plage(min: number, max: number, unite: string): string {
  return min === max || max <= 0 ? `${euros(min)}${unite}` : `${euros(min)} à ${euros(max)}${unite}`
}

/**
 * La rémunération d'une offre en deux lignes : le principal et sa précision.
 * - Salaire : fourchette brute mensuelle.
 * - Gratification d'un stage : fourchette mensuelle, ou la mention légale si
 *   le recruteur a laissé zéro (stage de deux mois au plus).
 * - Rétrocession (remplacement) et redevance (collaboration) : pourcentage des
 *   honoraires, `min` et `max` étant des taux.
 */
export function remuneration(o: { mode: ModeRemuneration; min: number; max: number }): { principal: string; detail: string } {
  switch (o.mode) {
    case 'retrocession':
      return { principal: `Rétrocession de ${plage(o.min, o.max, POURCENT)}`, detail: 'des honoraires' }
    case 'redevance':
      return { principal: `Redevance de ${plage(o.min, o.max, POURCENT)}`, detail: 'des honoraires, versée au cabinet' }
    case 'gratification':
      return o.min > 0
        ? { principal: `Gratification de ${plage(o.min, o.max, ' €')}`, detail: 'par mois' }
        : { principal: 'Gratification légale', detail: 'au-delà de deux mois de stage' }
    default:
      return { principal: plage(o.min, o.max, ' €'), detail: 'brut par mois' }
  }
}

/** Étiquette courte d'une offre sur la carte. */
export function etiquetteCarte(o: { mode: ModeRemuneration; min: number; max: number }): string {
  if (o.mode === 'retrocession' || o.mode === 'redevance') return plage(o.min, o.max, POURCENT)
  if (o.mode === 'gratification') return 'Stage'
  return plage(o.min, o.max, ' €')
}

export function contratTexte(o: { contrat: CodeContrat }): string {
  return LIBELLE_CONTRAT[o.contrat]
}

export function tempsTexte(o: { tempsPlein: boolean; heuresHebdo: number | null }): string {
  const base = o.tempsPlein ? 'Temps plein' : 'Temps partiel'
  return o.heuresHebdo ? `${base}, ${o.heuresHebdo} h` : base
}

const ISO = /^\d{4}-\d{2}-\d{2}/

/** « 6 octobre 2026 », à l'heure de Paris. */
export function dateLongue(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).replace(/^1 /, '1er ')
}

/** « 6 oct. », pour les listes. */
export function dateCourte(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Europe/Paris' }).replace(/^1 /, '1er ')
}

/** La date de début : texte libre du recruteur, ou date ISO mise en forme. Vide : « Dès que possible ». */
export function debutTexte(debut: string | null): string {
  if (!debut?.trim()) return 'Dès que possible'
  return ISO.test(debut) ? dateLongue(debut) : debut
}

/** « Du 1er décembre 2026 au 19 décembre 2026 », ou le seul début. */
export function periodeTexte(debut: string | null, fin: string | null): string {
  if (!fin?.trim()) return debutTexte(debut)
  return `Du ${debutTexte(debut)} au ${ISO.test(fin) ? dateLongue(fin) : fin}`
}

/** Initiales du recruteur, pour le fond neutre d'une offre sans photo. */
export function monogramme(nom: string): string {
  const mots = nom
    .replace(/^(Cabinet d’orthodontie|Cabinet|Centre de santé dentaire|Laboratoire)\s+/i, '')
    .split(/\s+/)
    .filter((m) => /^[A-ZÀ-Ý]/.test(m) && !/^(Drs?|Et|SARL|SAS|SASU|EURL|SELARL)$/.test(m))
  return ((mots[0]?.[0] ?? '') + (mots[1]?.[0] ?? '')).toUpperCase()
}

/** Référence courte et stable d'une offre, affichée sur sa page et reprise dans le balisage. */
export function referenceOffre(id: string): string {
  return `DM-E-${id.replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase()}`
}

/** Un texte libre découpé en lignes non vides ; les puces « - » ou « • » de tête sont retirées. */
export function lignes(texte: string | null | undefined): string[] {
  if (!texte) return []
  return texte
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean)
}

/**
 * La description d'une offre : son premier paragraphe sert de résumé, les
 * lignes suivantes deviennent la liste des missions.
 */
export function decouperDescription(description: string): { resume: string; points: string[] } {
  const [tete = '', ...reste] = description.trim().split(/\r?\n\s*\r?\n/)
  return { resume: tete.replace(/\s*\r?\n\s*/g, ' ').trim(), points: lignes(reste.join('\n')) }
}
