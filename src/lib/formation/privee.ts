import { z } from 'zod'
import { THEMES_FORMATION } from './themes'

/**
 * Les formations privées proposées par les professionnels (décisions du
 * 13 octobre 2026) : le schéma d'une proposition, les listes fermées, et la
 * correspondance avec les alertes des praticiens. Fonctions pures, testées.
 *
 * Le détail d'une formation (sessions, programme, public, format, tarif,
 * prise en charge) vit dans Neon, comme les données déclarées d'un
 * établissement ; WordPress ne porte que l'article minimal (titre, type
 * `privee`, ville, durée, site) qui donne l'adresse publique.
 */

export const PUBLICS_FORMATION = ['Chirurgiens-dentistes', 'Assistant(e)s', 'Prothésistes'] as const
export const FORMATS_FORMATION = ['Présentiel', 'Distanciel', 'Mixte'] as const
export const PRISES_EN_CHARGE = ['DPC', 'FIF PL', 'Qualiopi'] as const
export type PriseEnCharge = (typeof PRISES_EN_CHARGE)[number]

/** Où l'on vérifie chaque mention : sans vérification, elle reste « déclarée par l'organisme ». */
export const SOURCES_VERIFICATION: Record<PriseEnCharge, string> = {
  DPC: 'liste des actions de l’ANDPC',
  'FIF PL': 'prise en charge du FIF PL',
  Qualiopi: 'liste publique des organismes certifiés',
}

/** Régions de France, métropole et départements d'outre-mer (codes INSEE de la table `regions`). */
export const REGIONS_FORMATION = [
  { code: '84', nom: 'Auvergne-Rhône-Alpes' },
  { code: '27', nom: 'Bourgogne-Franche-Comté' },
  { code: '53', nom: 'Bretagne' },
  { code: '24', nom: 'Centre-Val de Loire' },
  { code: '94', nom: 'Corse' },
  { code: '44', nom: 'Grand Est' },
  { code: '32', nom: 'Hauts-de-France' },
  { code: '11', nom: 'Île-de-France' },
  { code: '28', nom: 'Normandie' },
  { code: '75', nom: 'Nouvelle-Aquitaine' },
  { code: '76', nom: 'Occitanie' },
  { code: '52', nom: 'Pays de la Loire' },
  { code: '93', nom: 'Provence-Alpes-Côte d’Azur' },
  { code: '01', nom: 'Guadeloupe' },
  { code: '02', nom: 'Martinique' },
  { code: '03', nom: 'Guyane' },
  { code: '04', nom: 'La Réunion' },
  { code: '06', nom: 'Mayotte' },
] as const
/** Une session sans lieu physique : elle concerne toutes les régions. */
export const EN_LIGNE = 'en-ligne'
const CODES_REGION = new Set<string>([EN_LIGNE, ...REGIONS_FORMATION.map((r) => r.code)])

export const nomRegion = (code: string) => (code === EN_LIGNE ? 'En ligne' : (REGIONS_FORMATION.find((r) => r.code === code)?.nom ?? code))

const texte = (min: number, max: number, message: string) => z.string().trim().min(min, message).max(max, message)
// `null` accepté en entrée : une proposition stockée (déjà transformée) se relit avec le même schéma.
const facultatif = (max: number) => z.string().trim().max(max).nullable().transform((v) => v || null)

export const SessionFormation = z.object({
  /** Dates telles que l'organisme les écrit : « 14 et 15 novembre 2026 ». */
  dates: texte(4, 80, 'Indiquez les dates de chaque session.'),
  /** Premier jour, pour trier et faire expirer la session. */
  debut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Indiquez le premier jour de chaque session.'),
  region: z.string().refine((c) => CODES_REGION.has(c), 'Choisissez la région de chaque session, ou « En ligne ».'),
  ville: facultatif(80),
  places: z.number().int().min(1).max(500).nullable().default(null),
})
export type SessionFormation = z.infer<typeof SessionFormation>

export const EtapeProgramme = z.object({
  titre: texte(2, 100, 'Chaque étape du programme a un titre.'),
  detail: facultatif(300),
  duree: facultatif(40),
})

export const Proposition = z.object({
  organisme: texte(2, 160, 'Indiquez le nom de l’organisme.'),
  /** Contrôlé par Sirene, comme pour un laboratoire ; facultatif. */
  siren: z
    .string()
    .nullable()
    .transform((v) => (v ?? '').replace(/\s+/g, ''))
    .refine((v) => v === '' || /^\d{9}$/.test(v), 'Le SIREN compte 9 chiffres.')
    .transform((v) => v || null),
  intitule: texte(6, 160, 'L’intitulé compte 6 caractères au moins.'),
  theme: z.enum(THEMES_FORMATION, { message: 'Choisissez un thème.' }),
  publics: z.array(z.enum(PUBLICS_FORMATION)).min(1, 'Choisissez au moins un public.'),
  format: z.enum(FORMATS_FORMATION, { message: 'Choisissez le format.' }),
  duree: texte(2, 60, 'Indiquez la durée.'),
  sessions: z.array(SessionFormation).min(1, 'Ajoutez au moins une session.').max(12),
  resume: facultatif(400),
  programme: z.array(EtapeProgramme).max(12).default([]),
  prerequis: z.array(texte(2, 160, 'Un prérequis est trop long.')).max(8).default([]),
  /** « 2 400 € », « Sur devis » : affiché « indiqué par l'organisme ». */
  tarif: facultatif(60),
  priseEnCharge: z.array(z.enum(PRISES_EN_CHARGE)).max(3).default([]),
  lienInscription: z.string().trim().url('Le lien d’inscription doit commencer par https://').refine((u) => u.startsWith('https://'), 'Le lien d’inscription doit commencer par https://'),
  siteOrganisme: z
    .string()
    .nullable()
    .transform((v) => v?.trim() || null)
    .refine((v) => v === null || /^https:\/\/\S+\.\S+/.test(v), 'Le site de l’organisme doit commencer par https://'),
})
export type Proposition = z.infer<typeof Proposition>

/** Mentions vérifiées par l'équipe : la source citée, par mention. */
export type Verifications = Partial<Record<PriseEnCharge, string>>

/** « Déclaré par l'organisme », ou « Vérifié : <source> ». */
export function libellePriseEnCharge(nom: PriseEnCharge, verifications: Verifications): string {
  const source = verifications[nom]
  return source ? `Vérifié sur la ${source}` : 'Déclaré par l’organisme'
}

/** Les régions concernées par une formation : celles de ses sessions ; « en ligne » vaut partout. */
export function regionsDe(p: Pick<Proposition, 'sessions'>): { partout: boolean; codes: string[] } {
  const codes = [...new Set(p.sessions.map((s) => s.region))]
  return { partout: codes.includes(EN_LIGNE), codes: codes.filter((c) => c !== EN_LIGNE) }
}

export type CriteresAlerte = { themes: string[]; regions: string[]; publics: string[] }

/**
 * Une formation répond-elle à une alerte ? Thème parmi ceux choisis, au
 * moins un public commun, et une session dans une région choisie ou en
 * ligne. Une liste vide dans l'alerte veut dire « tous ».
 */
export function correspond(alerte: CriteresAlerte, f: Pick<Proposition, 'theme' | 'publics' | 'sessions'>): boolean {
  if (alerte.themes.length && !alerte.themes.includes(f.theme)) return false
  if (alerte.publics.length && !f.publics.some((p) => alerte.publics.includes(p))) return false
  if (!alerte.regions.length) return true
  const r = regionsDe(f)
  return r.partout || r.codes.some((c) => alerte.regions.includes(c))
}

/** Une semaine au moins entre deux emails d'alerte à la même adresse. */
export const INTERVALLE_ALERTE_JOURS = 7

export function peutEnvoyer(dernierEnvoi: string | Date | null, maintenant = new Date()): boolean {
  if (!dernierEnvoi) return true
  return maintenant.getTime() - new Date(dernierEnvoi).getTime() >= INTERVALLE_ALERTE_JOURS * 86_400_000
}

/** Les sessions à venir, dans l'ordre. */
export function sessionsAVenir(sessions: SessionFormation[], maintenant = new Date()): SessionFormation[] {
  const jour = maintenant.toISOString().slice(0, 10)
  return [...sessions].filter((s) => s.debut >= jour).sort((a, b) => a.debut.localeCompare(b.debut))
}
