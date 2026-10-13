import { THEMES_FORMATION } from './themes'
import { memeVille } from './types'
import {
  EN_LIGNE,
  FORMATS_FORMATION,
  PRISES_EN_CHARGE,
  PUBLICS_FORMATION,
  REGIONS_FORMATION,
  libellePriseEnCharge,
  nomRegion,
  sessionsAVenir,
  type PriseEnCharge,
  type Proposition,
  type SessionFormation,
  type Verifications,
} from './privee'

/**
 * Les pages publiques des formations privées : l'assemblage d'une formation
 * publiée (article WordPress de type `privee` et détail déclaré dans Neon),
 * les filtres de la liste et son ordre. Fonctions pures, testées.
 *
 * Ordre de la liste, sans score : sans lieu, la prochaine session puis
 * l'ordre alphabétique. Avec un lieu (barre de recherche), la proximité puis
 * l'ordre alphabétique. Les sessions ne sont pas géocodées (une ville et une
 * région, saisies par l'organisme) : la proximité se compte en paliers, la
 * même ville, puis la même région, puis en ligne. Les sessions plus
 * lointaines sortent de la liste, comme les formations hors du lieu dans les
 * autres familles.
 */

/** Ce que la liste et la fiche lisent de l'article WordPress. */
export type ArticleFormation = { slug: string; titre: string; image: { url: string; alt: string } | null }

/** Le détail déclaré, tel que `getFormationPrivee` le rend. */
export type DetailFormation = { d: Proposition; verifications: Verifications; publieeLe: string }

export type FormationPriveeVue = ArticleFormation &
  DetailFormation & {
    /** Les sessions à venir, dans l'ordre. */
    avenir: SessionFormation[]
    /** La session montrée dans la liste : la prochaine, ou la plus proche du lieu. */
    session: SessionFormation | null
  }

/**
 * Une formation n'est publique que si elle a les deux moitiés : l'article
 * WordPress (l'adresse, le titre, la photo) et le détail publié dans Neon.
 */
export function assembler(articles: ArticleFormation[], details: Map<string, DetailFormation>, maintenant = new Date()): FormationPriveeVue[] {
  return articles.flatMap((a) => {
    const det = details.get(a.slug)
    if (!det) return []
    const avenir = sessionsAVenir(det.d.sessions, maintenant)
    return [{ ...a, ...det, avenir, session: avenir[0] ?? null }]
  })
}

/* Filtres ----------------------------------------------------------- */

export const TRANCHES_DUREE = [
  { cle: 'journee', libelle: 'Une journée ou moins' },
  { cle: 'jours', libelle: 'Deux à trois jours' },
  { cle: 'long', libelle: 'Plus de trois jours' },
] as const
export type TrancheDuree = (typeof TRANCHES_DUREE)[number]['cle']

/** Les formats, avec le libellé du sélecteur et la valeur d'URL. */
export const CHOIX_FORMAT = [
  { cle: 'sur-place', libelle: 'Sur place', format: 'Présentiel' },
  { cle: 'en-ligne', libelle: 'En ligne', format: 'Distanciel' },
  { cle: 'mixte', libelle: 'Mixte', format: 'Mixte' },
] as const satisfies readonly { cle: string; libelle: string; format: (typeof FORMATS_FORMATION)[number] }[]

const NOMBRES: Record<string, number> = { une: 1, un: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10 }

/**
 * La tranche d'une durée écrite par l'organisme : « 6 heures », « 2 jours »,
 * « une journée », « 3 semaines ». `null` quand elle ne se lit pas : la
 * formation sort alors de la liste dès qu'une tranche est demandée.
 */
export function trancheDuree(duree: string): TrancheDuree | null {
  const t = duree.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (/demi[- ]journee/.test(t)) return 'journee'
  const m = t.match(/(\d+(?:[.,]\d+)?|une?|deux|trois|quatre|cinq|six|sept|huit|neuf|dix)\s*(h\b|heures?|jours?|journees?|j\b|semaines?|mois)/)
  if (!m) return null
  const n = NOMBRES[m[1]!] ?? Number(m[1]!.replace(',', '.'))
  const unite = m[2]!
  const jours = unite.startsWith('h') ? n / 7 : unite.startsWith('semaine') ? n * 5 : unite === 'mois' ? n * 20 : n
  return jours <= 1 ? 'journee' : jours <= 3 ? 'jours' : 'long'
}

export type FiltresPrivees = {
  themes: string[]
  publics: string[]
  format: (typeof CHOIX_FORMAT)[number]['cle'] | null
  /** Code INSEE de la région. */
  zone: string | null
  durees: TrancheDuree[]
  prises: PriseEnCharge[]
}

type Brut = Record<string, string | string[] | undefined>
const liste = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : [])
const dans = <T extends string>(valeurs: readonly T[], v: string | string[] | undefined): T[] => liste(v).filter((x): x is T => (valeurs as readonly string[]).includes(x))

/** Les filtres lus dans l'URL ; une valeur inconnue est ignorée. */
export function lireFiltres(p: Brut): FiltresPrivees {
  const format = liste(p.format)[0]
  const zone = liste(p.zone)[0]
  return {
    themes: dans(THEMES_FORMATION, p.theme),
    publics: dans(PUBLICS_FORMATION, p.public),
    format: CHOIX_FORMAT.find((c) => c.cle === format)?.cle ?? null,
    zone: zone && REGIONS_FORMATION.some((r) => r.code === zone) ? zone : null,
    durees: dans(TRANCHES_DUREE.map((t) => t.cle), p.duree),
    prises: dans(PRISES_EN_CHARGE, p.prise),
  }
}

export function nombreFiltres(f: FiltresPrivees): number {
  return f.themes.length + f.publics.length + (f.format ? 1 : 0) + (f.zone ? 1 : 0) + f.durees.length + f.prises.length
}

/** La chaîne de requête des filtres et du lieu, dans un ordre stable. */
export function requeteFiltres(f: FiltresPrivees, lieu: Record<string, string | undefined> = {}): string {
  const q = new URLSearchParams()
  for (const [cle, v] of Object.entries(lieu)) if (v) q.append(cle, v)
  f.themes.forEach((v) => q.append('theme', v))
  f.publics.forEach((v) => q.append('public', v))
  if (f.format) q.set('format', f.format)
  if (f.zone) q.set('zone', f.zone)
  f.durees.forEach((v) => q.append('duree', v))
  f.prises.forEach((v) => q.append('prise', v))
  const s = q.toString()
  return s ? `?${s}` : ''
}

/** Le lieu demandé, ramené à ce qu'une session porte : une ville, une région. */
export type LieuSession = { ville: string | null; region: string | null }

/** 0 : même ville ; 1 : même région ; 2 : en ligne ; 3 : ailleurs. */
export function palier(s: SessionFormation, lieu: LieuSession): number {
  if (lieu.ville && memeVille(s.ville, lieu.ville)) return 0
  if (lieu.region && s.region === lieu.region) return 1
  if (s.region === EN_LIGNE) return 2
  return 3
}

const alpha = (a: FormationPriveeVue, b: FormationPriveeVue) => a.titre.localeCompare(b.titre, 'fr')

/**
 * Filtre et ordonne. La région et le lieu choisissent la session montrée :
 * la prochaine qui y répond (les sessions en ligne répondent à toutes les
 * régions). Une formation sans session à venir qui réponde sort de la liste.
 */
export function filtrerEtTrier(vues: FormationPriveeVue[], f: FiltresPrivees, lieu: LieuSession | null = null): FormationPriveeVue[] {
  const format = CHOIX_FORMAT.find((c) => c.cle === f.format)?.format
  const retenues = vues.flatMap((v) => {
    if (f.themes.length && !f.themes.includes(v.d.theme)) return []
    if (f.publics.length && !v.d.publics.some((p) => f.publics.includes(p))) return []
    if (format && v.d.format !== format) return []
    if (f.prises.length && !f.prises.some((p) => v.d.priseEnCharge.includes(p))) return []
    if (f.durees.length) {
      const t = trancheDuree(v.d.duree)
      if (!t || !f.durees.includes(t)) return []
    }
    let sessions = v.avenir
    if (f.zone) sessions = sessions.filter((s) => s.region === f.zone || s.region === EN_LIGNE)
    if (lieu) {
      sessions = sessions.filter((s) => palier(s, lieu) < 3)
      sessions = [...sessions].sort((a, b) => palier(a, lieu) - palier(b, lieu) || a.debut.localeCompare(b.debut))
    }
    const session = sessions[0]
    return session ? [{ ...v, session }] : []
  })
  return retenues.sort((a, b) =>
    lieu ? palier(a.session!, lieu) - palier(b.session!, lieu) || alpha(a, b) : a.session!.debut.localeCompare(b.session!.debut) || alpha(a, b),
  )
}

/* Affichage --------------------------------------------------------- */

const PETITS_MOTS = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'au', 'aux', 'pour', 'sur', 'l', 'd'])

/** Les initiales de l'organisme, à défaut de logo : « Atelier Implanto Formation » donne « AI ». */
export function monogramme(organisme: string): string {
  const mots = organisme
    .split(/[\s'’-]+/)
    .filter((m) => m && !PETITS_MOTS.has(m.toLowerCase()))
  return (mots.slice(0, 2).map((m) => m[0]!.toUpperCase()).join('') || organisme.slice(0, 2).toUpperCase()).slice(0, 2)
}

const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

/** Le pavé de date d'une session : « 14 » et « nov. ». */
export function pave(s: SessionFormation): { jour: string; mois: string } {
  const [, m, j] = s.debut.split('-')
  return { jour: String(Number(j)), mois: MOIS[Number(m) - 1] ?? '' }
}

export const enLigne = (s: SessionFormation) => s.region === EN_LIGNE

/** Le lieu d'une session : sa ville, sinon « En ligne » ou sa région. */
export const lieuSession = (s: SessionFormation) => (enLigne(s) ? 'En ligne' : (s.ville ?? nomRegion(s.region)))

export type MentionPrise = { nom: PriseEnCharge; source: string | null; libelle: string }

/** Les mentions de prise en charge, chacune « déclarée » ou « vérifiée » avec sa source. */
export function mentions(d: Pick<Proposition, 'priseEnCharge'>, verifications: Verifications): MentionPrise[] {
  return PRISES_EN_CHARGE.filter((p) => d.priseEnCharge.includes(p)).map((nom) => ({
    nom,
    source: verifications[nom] ?? null,
    libelle: libellePriseEnCharge(nom, verifications),
  }))
}

/** « Qualiopi vérifié sur la liste publique des organismes certifiés ; DPC déclaré par l’organisme. » */
export function phraseMentions(m: MentionPrise[]): string | null {
  if (!m.length) return null
  const verifiees = m.filter((x) => x.source).map((x) => `${x.nom} vérifié sur la ${x.source}`)
  const declarees = m.filter((x) => !x.source).map((x) => x.nom)
  const morceaux = [...verifiees]
  if (declarees.length) morceaux.push(`${declarees.join(', ')} ${declarees.length > 1 ? 'déclarés' : 'déclaré'} par l’organisme`)
  return `${morceaux.join(' ; ')}.`
}

/** « en implantologie », « en prothèse et CFAO » : le thème dans une phrase. */
export const enTheme = (t: string) => `en ${t.charAt(0).toLowerCase()}${t.slice(1)}`

/** Le domaine d'un lien, pour un bouton : « atelier-implanto.fr ». */
export function domaine(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Les autres formations d'une fiche : les trois prochaines sessions, la formation elle-même exclue. */
export function autresFormationsPrivees(vues: FormationPriveeVue[], ici: Pick<FormationPriveeVue, 'slug'>, n = 3): FormationPriveeVue[] {
  const vide: FiltresPrivees = { themes: [], publics: [], format: null, zone: null, durees: [], prises: [] }
  return filtrerEtTrier(vues.filter((v) => v.slug !== ici.slug), vide).slice(0, n)
}
