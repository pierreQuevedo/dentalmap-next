import { JOURS, LANGUES, SECTEURS, TIERS_PAYANT_COURT, libelleAge, orientationsDe, type FicheCompletee, type Jour } from './fiche-completee'
import { horairesRenseignes } from './force'
import type { Profession } from '@/lib/annuaire/types'
import { MATERIAUX, PREFIXE_PERSO, TECHNIQUES, libelleDe, resumeZone } from './labo'
import { resumeDelais } from './force-labo'

/**
 * Les phrases courtes qui résument chaque bloc de la fiche, pour l'aperçu
 * patient, le récapitulatif et le tableau de bord. Fonctions pures.
 */

const heure = (h: string) => {
  const [hh, mm] = h.split(':')
  return mm === '00' ? `${Number(hh)} h` : `${Number(hh)} h ${mm}`
}

/** « Ouvert aujourd'hui jusqu'à 19 h », « Fermé aujourd'hui », ou null sans horaires. */
export function resumeAujourdhui(f: FicheCompletee | null, maintenant = new Date()): string | null {
  if (!horairesRenseignes(f)) return null
  const jour = JOURS[(maintenant.getDay() + 6) % 7] as Jour
  const plages = f?.horaires?.[jour] ?? []
  if (!plages.length) return 'Fermé aujourd’hui'
  return `Ouvert aujourd’hui jusqu’à ${heure(plages[plages.length - 1].fin)}`
}

/** « 5 jours, fermé le week-end », « 6 jours, fermé le dimanche »… */
export function resumeSemaine(f: FicheCompletee | null): string | null {
  if (!horairesRenseignes(f)) return null
  const ouverts = JOURS.filter((j) => (f?.horaires?.[j]?.length ?? 0) > 0)
  const fermes = JOURS.filter((j) => !ouverts.includes(j))
  const fin = fermes.length === 0 ? 'ouvert tous les jours' : fermes.length === 2 && fermes.includes('samedi') && fermes.includes('dimanche') ? 'fermé le week-end' : `fermé le ${fermes.join(', le ')}`
  return `${ouverts.length} jour${ouverts.length > 1 ? 's' : ''}, ${fin}`
}

export function resumeConventionnement(f: FicheCompletee | null): string | null {
  if (!f?.secteur && !f?.tiersPayant) return null
  const secteur = SECTEURS.find((s) => s.code === f?.secteur)?.libelle
  const tiers = TIERS_PAYANT_COURT.find((t) => t.code === f?.tiersPayant)?.libelle
  const t = tiers === 'Oui' ? 'tiers payant' : tiers === 'Partiel' ? 'tiers payant partiel' : tiers === 'Non' ? 'sans tiers payant' : null
  return [secteur, t].filter(Boolean).join(', ').replace(/^./, (c) => c.toUpperCase())
}

export function resumeAccueil(f: FicheCompletee | null): string | null {
  if (!f || (!f.langues.length && !f.accesPmr && f.ageMinimum === null)) return null
  const langues = f.langues.map((c) => LANGUES.find((l) => l.code === c)?.libelle.toLowerCase() ?? c).join(', ')
  const pmr = f.accesPmr === 'oui' ? 'PMR' : f.accesPmr === 'partiel' ? 'PMR partiel' : f.accesPmr === 'non' ? 'sans accès PMR' : null
  const age = f.ageMinimum === null ? null : f.ageMinimum === 0 ? 'tous âges' : `dès ${f.ageMinimum} ans`
  return [langues, pmr, age].filter(Boolean).join(' · ').replace(/^./, (c) => c.toUpperCase())
}

export function resumeSoins(f: FicheCompletee | null, profession: Profession): string | null {
  if (!f?.orientations.length) return null
  const dispo = orientationsDe(profession)
  // Un domaine nommé par le praticien s'affiche sous son nom.
  return f.orientations.map((c) => (c.startsWith(PREFIXE_PERSO) ? c.slice(PREFIXE_PERSO.length) : (dispo.find((o) => o.code === c)?.court ?? c))).join(', ')
}

export function resumePresentation(f: FicheCompletee | null): string | null {
  const t = f?.presentation?.trim()
  if (!t) return null
  return t.length > 70 ? `${t.slice(0, 68).trimEnd()}…` : t
}

export { libelleAge }

/* ------------------------------------------------------------------ */
/* Laboratoire                                                          */
/* ------------------------------------------------------------------ */

export function resumesLabo(f: FicheCompletee | null): Record<'savoir_faire' | 'materiaux' | 'delais' | 'zone' | 'realisations' | 'ansm', string | null> {
  const liste = (codes: string[], vocab: readonly { code: string; libelle: string }[]) =>
    codes.length ? codes.map((c) => libelleDe(vocab, c)).join(', ') : null
  const materiaux = [liste(f?.materiaux ?? [], MATERIAUX), f?.usinage ? 'usinage' : null].filter(Boolean).join(' · ') || null
  return {
    savoir_faire: liste(f?.techniques ?? [], TECHNIQUES),
    materiaux,
    delais: resumeDelais(f),
    zone: f ? resumeZone(f) : null,
    realisations: f?.realisations.length ? `${f.realisations.length} photo${f.realisations.length > 1 ? 's' : ''}` : null,
    ansm: f?.ansmNumero ? `Déclaré · ${f.ansmNumero}` : null,
  }
}
