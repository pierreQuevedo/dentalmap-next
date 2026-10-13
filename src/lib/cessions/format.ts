/**
 * Les règles pures des annonces de cession : secteur flou, montants, dates de
 * publication, disponibilité, filtres et validation du message au cédant.
 * Sans accès à la base ni à l'heure courante (passée en argument), donc
 * testables et utilisables côté client. Tests : `tests/cessions.test.ts`.
 */
import { TYPES_CESSION, estTypeCession, type AnnonceResume, type ClasseDisponibilite, type FiltresCession, type TypeCession } from './types'

/* ------------------------------------------------------------------ */
/* Secteur flou                                                         */
/* ------------------------------------------------------------------ */

/**
 * Seuils de population de la commune (recensement INSEE, `communes.population`).
 *
 * - Ville, 50 000 habitants et plus : 2 km. Dans une ville de cette taille, un
 *   cercle de 2 km couvre des dizaines de cabinets ; le cédant n'est pas
 *   reconnaissable.
 * - Périurbain, de 5 000 à 49 999 habitants : 5 km. Une commune de cette
 *   taille compte quelques cabinets ; le cercle déborde sur les voisines.
 * - Rural, moins de 5 000 habitants, ou population inconnue : 10 km. Un bourg
 *   n'a souvent qu'un cabinet ; seul un large cercle protège le cédant.
 *
 * Le seuil de 5 000 habitants est celui que l'INSEE retient pour les petites
 * villes ; celui de 50 000, le seuil des « villes moyennes » et des
 * communautés d'agglomération.
 */
export const SEUIL_VILLE = 50_000
export const SEUIL_PERIURBAIN = 5_000

export const RAYON_VILLE_M = 2_000
export const RAYON_PERIURBAIN_M = 5_000
export const RAYON_RURAL_M = 10_000

/** Rayon du secteur affiché, en mètres, selon la population de la commune. */
export function rayonSecteur(population: number | null | undefined): number {
  if (population == null || !Number.isFinite(population)) return RAYON_RURAL_M
  if (population >= SEUIL_VILLE) return RAYON_VILLE_M
  if (population >= SEUIL_PERIURBAIN) return RAYON_PERIURBAIN_M
  return RAYON_RURAL_M
}

/* ------------------------------------------------------------------ */
/* Montants (en milliers d'euros)                                       */
/* ------------------------------------------------------------------ */

const nombre = (n: number) => n.toLocaleString('fr-FR')

/** Prix demandé en toutes lettres : « 210 000 € », ou « Sur demande ». */
export function prixLong(prixK: number | null | undefined): string {
  return prixK ? `${nombre(prixK * 1000)} €` : 'Sur demande'
}

/** Prix court pour les repères et les cartes : « 210 k€ », ou « Sur demande ». */
export function prixCourt(prixK: number | null | undefined): string {
  return prixK ? `${nombre(prixK)} k€` : 'Sur demande'
}

/** Chiffre d'affaires indicatif : « 380 à 450 k€ », « 450 k€ », ou « non communiqué ». */
export function chiffreAffaires(min: number | null | undefined, max: number | null | undefined): string {
  const a = min || null
  const b = max || null
  if (a && b && a !== b) return `${nombre(Math.min(a, b))} à ${nombre(Math.max(a, b))} k€`
  const seul = a ?? b
  return seul ? `${nombre(seul)} k€` : 'non communiqué'
}

export const km = (n: number) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`

export const fauteuils = (n: number) => `${n} fauteuil${n > 1 ? 's' : ''}`

/* ------------------------------------------------------------------ */
/* Dates de publication                                                 */
/* ------------------------------------------------------------------ */

/** Durée de publication d'une annonce, renouvelable d'un clic. */
export const DUREE_PUBLICATION_JOURS = 90
/** Le rappel de renouvellement part une semaine avant l'échéance. */
export const RAPPEL_AVANT_JOURS = 7

const JOUR_MS = 86_400_000

/** Date d'expiration d'une annonce publiée (ou renouvelée) à `depuis` : 90 jours plus tard. */
export function dateExpiration(depuis: Date): Date {
  return new Date(depuis.getTime() + DUREE_PUBLICATION_JOURS * JOUR_MS)
}

/** Date à partir de laquelle le rappel de renouvellement doit partir. */
export function dateRappel(expireLe: Date): Date {
  return new Date(expireLe.getTime() - RAPPEL_AVANT_JOURS * JOUR_MS)
}

/** « 2 octobre 2026 », à l'heure de Paris. */
export function dateLongue(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
}

/** « 2 oct. 2026 », pour les listes. */
export function dateCourte(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Paris' })
}

/** Référence affichée, stable : « CES-2026-3F9A1C ». */
export function referenceAnnonce(id: string, publieeLe: string | Date): string {
  const annee = new Date(publieeLe).getUTCFullYear()
  const cle = id.replace(/^demo_/, '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()
  return `CES-${annee}-${cle}`
}

/* ------------------------------------------------------------------ */
/* Disponibilité                                                        */
/* ------------------------------------------------------------------ */

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

/**
 * Le champ `disponibilite` est libre. Convention attendue de l'écran de dépôt :
 * `immediate`, ou un mois `AAAA-MM` (une date `AAAA-MM-JJ` est aussi
 * reconnue). Un texte libre reste accepté et affiché tel quel ; il n'est
 * reconnu par les filtres que s'il dit « immédiate » ou « six mois ».
 */
export function classerDisponibilite(d: string | null | undefined, maintenant: Date): ClasseDisponibilite {
  if (!d) return null
  const t = d.trim().toLowerCase()
  if (/^imm[ée]diate?s?$|^imm[ée]diatement$|^d[eè]s maintenant$/.test(t)) return 'immediate'
  const m = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(t)
  if (m) {
    const ecart = (Number(m[1]) - maintenant.getUTCFullYear()) * 12 + (Number(m[2]) - 1 - maintenant.getUTCMonth())
    if (ecart <= 0) return 'immediate'
    return ecart <= 6 ? 'six_mois' : 'plus_tard'
  }
  if (/(six|6)\s*mois/.test(t)) return 'six_mois'
  return null
}

/** « Immédiate », « Janvier 2027 », ou le texte saisi. */
export function formaterDisponibilite(d: string | null | undefined): string | null {
  if (!d) return null
  const t = d.trim()
  if (/^imm[ée]diate$/i.test(t)) return 'Immédiate'
  const m = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(t)
  if (m) {
    const mois = MOIS[Number(m[2]) - 1]
    if (mois) return `${mois[0]!.toUpperCase()}${mois.slice(1)} ${m[1]}`
  }
  return t
}

/** Pour une phrase : « Disponible immédiatement », « Disponible en janvier 2027 », « Disponible d’ici six mois ». */
export function phraseDisponibilite(d: string | null | undefined): string | null {
  const f = formaterDisponibilite(d)
  if (!f) return null
  if (f === 'Immédiate') return 'Disponible immédiatement'
  if (/^\p{Lu}\p{Ll}+ \d{4}$/u.test(f)) return `Disponible en ${f.toLowerCase()}`
  return `Disponible : ${f.charAt(0).toLowerCase()}${f.slice(1)}`
}

/* ------------------------------------------------------------------ */
/* Filtres de la liste                                                  */
/* ------------------------------------------------------------------ */

/** Paramètres d'URL tels que Next les donne. */
export type ParametresListe = Record<string, string | string[] | undefined>

export const PAR_PAGE = 30

/** Première valeur d'un paramètre d'URL. */
export const premier = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v)

export function lireFiltres(p: ParametresListe): FiltresCession {
  const types = (Array.isArray(p.type) ? p.type : p.type ? p.type.split(',') : []).filter(estTypeCession)
  const f = Number(premier(p.fauteuils))
  const page = Number.parseInt(premier(p.page) ?? '', 10)
  const dispo = premier(p.dispo)
  return {
    types: TYPES_CESSION.filter((t) => types.includes(t)),
    fauteuils: f === 1 || f === 2 || f === 3 ? f : null,
    dispo: dispo === 'immediate' || dispo === 'six-mois' ? dispo : null,
    page: Number.isFinite(page) && page > 1 ? page : 1,
  }
}

export const lireVue = (p: ParametresListe): 'liste' | 'carte' => (premier(p.vue) === 'carte' ? 'carte' : 'liste')

export const filtresActifs = (f: FiltresCession) => f.types.length > 0 || f.fauteuils !== null || f.dispo !== null

/** Chaîne de requête des filtres (sans la page), pour les liens et les redirections. */
export function chaineFiltres(f: FiltresCession, extra: Record<string, string | undefined> = {}): string {
  const q = new URLSearchParams()
  for (const t of f.types) q.append('type', t)
  if (f.fauteuils) q.set('fauteuils', String(f.fauteuils))
  if (f.dispo) q.set('dispo', f.dispo)
  for (const [k, v] of Object.entries(extra)) if (v) q.set(k, v)
  const s = q.toString()
  return s ? `?${s}` : ''
}

export function filtrerAnnonces<A extends Pick<AnnonceResume, 'type' | 'fauteuils' | 'classeDisponibilite'>>(annonces: A[], f: FiltresCession): A[] {
  return annonces.filter((a) => {
    if (f.types.length && !f.types.includes(a.type)) return false
    if (f.fauteuils) {
      if (a.fauteuils == null) return false
      if (f.fauteuils === 3 ? a.fauteuils < 3 : a.fauteuils !== f.fauteuils) return false
    }
    if (f.dispo === 'immediate' && a.classeDisponibilite !== 'immediate') return false
    if (f.dispo === 'six-mois' && a.classeDisponibilite !== 'immediate' && a.classeDisponibilite !== 'six_mois') return false
    return true
  })
}

export function compterParType<A extends Pick<AnnonceResume, 'type'>>(annonces: A[]): Record<TypeCession, number> {
  const r = { cabinet: 0, parts: 0, patientele: 0, murs: 0 }
  for (const a of annonces) r[a.type]++
  return r
}

/* ------------------------------------------------------------------ */
/* Textes saisis                                                        */
/* ------------------------------------------------------------------ */

/** Un texte saisi en lignes (conditions, locaux) : une puce par ligne non vide. */
export function lignes(texte: string | null | undefined): string[] {
  if (!texte) return []
  return texte
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean)
}

/** Paragraphes d'une description. */
export function paragraphes(texte: string | null | undefined): string[] {
  if (!texte) return []
  return texte
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/* ------------------------------------------------------------------ */
/* Message au cédant                                                    */
/* ------------------------------------------------------------------ */

export const MESSAGE_MIN = 20
export const MESSAGE_MAX = 2000

export type MessageValide = { ok: true; corps: string } | { ok: false; erreur: string }

/** Nettoie et contrôle le message : espaces superflus retirés, 20 à 2 000 caractères. */
export function validerMessage(brut: unknown): MessageValide {
  if (typeof brut !== 'string') return { ok: false, erreur: 'Votre message est vide.' }
  const corps = brut
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  if (!corps) return { ok: false, erreur: 'Votre message est vide.' }
  if (corps.length < MESSAGE_MIN) return { ok: false, erreur: `Votre message est trop court : ${MESSAGE_MIN} caractères au moins, pour que le cédant comprenne votre projet.` }
  if (corps.length > MESSAGE_MAX) return { ok: false, erreur: `Votre message est trop long : ${MESSAGE_MAX.toLocaleString('fr-FR')} caractères au plus.` }
  return { ok: true, corps }
}

/* ------------------------------------------------------------------ */
/* Alerte                                                               */
/* ------------------------------------------------------------------ */

export const INTERVALLE_ALERTE_JOURS = 7

/** Un email d'alerte par semaine au plus. */
export function peutEnvoyerAlerte(dernierEnvoi: string | Date | null, maintenant: Date): boolean {
  if (!dernierEnvoi) return true
  return maintenant.getTime() - new Date(dernierEnvoi).getTime() >= INTERVALLE_ALERTE_JOURS * JOUR_MS
}

/** Une annonce répond à une alerte : aucun département ou type coché vaut « tous ». */
export function correspondAlerte(alerte: { departements: string[]; types: string[] }, a: { departementCode: string; type: TypeCession }): boolean {
  return (!alerte.departements.length || alerte.departements.includes(a.departementCode)) && (!alerte.types.length || alerte.types.includes(a.type))
}
