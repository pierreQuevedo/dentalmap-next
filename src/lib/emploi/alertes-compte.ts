/**
 * Les alertes emploi d'un compte (CAND-ALERTES), partie pure : fréquence,
 * titre proposé, puces affichées, rythme d'envoi. Le job `alertes-emploi`
 * sert aussi les alertes sans compte, envoyées chaque semaine.
 */
import { LIBELLE_CONTRAT, metierDepuisCode, type CodeContrat, type CodeMetier } from './metiers'

export const FREQUENCES = [
  { cle: 'quotidienne', libelle: 'Chaque jour' },
  { cle: 'hebdomadaire', libelle: 'Chaque semaine' },
] as const
export type Frequence = (typeof FREQUENCES)[number]['cle']

export function lireFrequence(v: unknown): Frequence {
  return v === 'quotidienne' ? 'quotidienne' : 'hebdomadaire'
}

export const RAYONS_ALERTE = [5, 10, 15, 20, 30, 50] as const
/** Dix alertes par compte au plus. */
export const ALERTES_MAX = 10

const JOUR = 86_400_000

/** Une alerte peut repartir : un jour, ou une semaine, après son dernier envoi (marge d'une heure pour l'horaire du job). */
export function peutEnvoyer(frequence: Frequence, dernierEnvoi: Date | string | null, maintenant: Date): boolean {
  if (!dernierEnvoi) return true
  const ecart = maintenant.getTime() - new Date(dernierEnvoi).getTime()
  return ecart >= (frequence === 'quotidienne' ? 1 : 7) * JOUR - 3_600_000
}

type Criteres = { metiers: CodeMetier[]; contrats: CodeContrat[]; rayonKm?: number }

/** Le titre proposé quand la personne n'en donne pas : « Assistant(e) dentaire, CDI ». */
export function titreAlerte(c: Criteres): string {
  const metier = c.metiers.length === 1 ? metierDepuisCode(c.metiers[0]).nom : c.metiers.length ? 'Plusieurs métiers' : 'Tous les métiers'
  const contrats = c.contrats.length === 1 ? LIBELLE_CONTRAT[c.contrats[0]] : c.contrats.length === 2 ? `${LIBELLE_CONTRAT[c.contrats[0]]} ou ${LIBELLE_CONTRAT[c.contrats[1]]}` : null
  return contrats ? `${metier}, ${contrats}` : metier
}

/** Les puces de la carte d'alerte : métiers, contrats, lieu. */
export function pucesAlerte(c: Criteres, lieu: string | null): string[] {
  return [
    ...(c.metiers.length ? c.metiers.map((m) => metierDepuisCode(m).nom) : ['Tous les métiers']),
    ...(c.contrats.length ? c.contrats.map((x) => LIBELLE_CONTRAT[x]) : ['Tous les contrats']),
    lieu ? (c.rayonKm ? `${c.rayonKm} km autour de ${lieu}` : lieu) : 'Toute la France',
  ]
}
