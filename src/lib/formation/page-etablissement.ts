import type { CapaciteFaculte, DiplomeEcole } from './faculte'
import { VOIES, actives, portesOuvertesAJour, type Donnees } from '@/lib/espace-pro/etablissement'

/**
 * La page d'un établissement de formation (école de prothèse, faculté
 * d'odontologie) : ce qui se calcule sans base ni réseau, à partir du contenu
 * WordPress lu par `lireEcole` et `lireFaculte` et de ce que l'établissement
 * déclare dans Neon. Fonctions pures, testées.
 */

/** Un diplôme tel que la page le montre, qu'il vienne du déclaratif ou du contenu relevé. */
export type FormationAffichee = {
  id: string
  intitule: string
  niveau: string | null
  duree: string | null
  /** Voies lisibles : « Formation initiale », « Apprentissage »… */
  voies: string[]
  /** Conditions d'accès, déclarées seulement. */
  acces: string | null
  places: number | null
  apprentissage: boolean
}

/**
 * Les formations d'une école : celles que l'établissement a déclarées et
 * laissées actives, sinon les diplômes relevés dans son contenu.
 */
export function formationsAffichees(donnees: Donnees | null, diplomes: DiplomeEcole[]): { formations: FormationAffichee[]; declarees: boolean } {
  const declarees = donnees ? actives(donnees) : []
  if (declarees.length) {
    return {
      declarees: true,
      formations: declarees.map((f) => ({
        id: f.id,
        intitule: f.intitule,
        niveau: f.niveau,
        duree: f.duree,
        voies: VOIES.filter((v) => f.voies.includes(v.code)).map((v) => v.libelle),
        acces: f.acces,
        places: f.places,
        apprentissage: f.voies.includes('apprentissage'),
      })),
    }
  }
  return {
    declarees: false,
    formations: diplomes.map((d, k) => ({
      id: `${k}-${d.intitule}`,
      intitule: d.intitule,
      niveau: d.niveau,
      duree: d.duree,
      voies: d.modalite ? [d.modalite] : [],
      acces: null,
      places: null,
      apprentissage: /apprentissage|alternance/i.test(d.modalite ?? ''),
    })),
  }
}

/** Rang d'un niveau pour retenir le plus élevé : CAP, Bac, puis Bac + n. */
function rangNiveau(niveau: string): number {
  const plus = /bac\s*\+\s*(\d)/i.exec(niveau)
  if (plus) return 10 + Number(plus[1])
  if (/^\s*bac\b/i.test(niveau)) return 10
  if (/cap/i.test(niveau)) return 5
  return 0
}

/** Le niveau le plus élevé parmi les formations, écrit « Bac + 3 ». */
export function niveauMax(formations: Pick<FormationAffichee, 'niveau'>[]): string | null {
  const niveaux = formations.map((f) => f.niveau?.trim()).filter((n): n is string => !!n && rangNiveau(n) > 0)
  if (!niveaux.length) return null
  const max = niveaux.reduce((a, b) => (rangNiveau(b) > rangNiveau(a) ? b : a))
  return max.replace(/\s*\+\s*/, ' + ')
}

/** « BTS, Bac pro » : le sigle de chaque diplôme, pour une ligne courte. */
export function siglesDiplomes(diplomes: Pick<DiplomeEcole, 'intitule'>[]): string {
  const sigles = diplomes.map((d) => {
    const m = /^(bac\s*pro|btms|btm|bts|cap|dts|licence|bachelor|bac\s*\+\s*\d)/i.exec(d.intitule.trim())
    return m ? m[1]!.replace(/\s+/g, ' ').replace(/^bac pro/i, 'Bac pro').replace(/^(btms|btm|bts|cap|dts)$/i, (s) => s.toUpperCase()) : d.intitule
  })
  return [...new Set(sigles)].join(', ')
}

/**
 * Une présentation coupée pour la citation : la première phrase en avant,
 * le reste en dessous. Une première phrase trop longue n'est pas mise en avant.
 */
export function couperPresentation(texte: string, max = 220): { avant: string | null; suite: string | null } {
  const t = texte.trim()
  const m = /^(.+?[.!?])\s+(?=[A-ZÀ-ÖØ-Þ«])/.exec(t)
  const avant = m ? m[1]! : t
  if (avant.length > max) return { avant: null, suite: t }
  const suite = t.slice(avant.length).trim()
  return { avant, suite: suite || null }
}

/**
 * Sans accroche déclarée, la présentation relevée garde la mise en page de la
 * citation : sa première phrase en grand quand elle est courte, le reste en
 * texte courant.
 */
export function citationRelevee(texte: string): { avant: string | null; suite: null; texte: string | null } {
  const { avant, suite } = couperPresentation(texte, 140)
  return { avant, suite: null, texte: suite }
}

/** Initiales d'un nom d'établissement, à défaut de logo : « Lycée professionnel Charles Péguy » donne « LCP ». */
export function monogramme(nom: string): string {
  const mots = nom
    .replace(/[’']/g, ' ')
    .split(/[\s,-]+/)
    .filter((m) => m.length > 2 && !/^(des|les|une|pour|sur|aux|campus|professionnel|polyvalent)$/i.test(m))
  return (mots.slice(0, 3).map((m) => m[0]!.toUpperCase()).join('') || nom.slice(0, 2)).toUpperCase()
}

/**
 * Les places en deuxième année par année : celle de la capacité, et les
 * années précédentes citées dans le détail (« En 2025-2026 : 80 »). Le
 * détail rendu ne répète pas ce que le graphique montre.
 */
export function capacitesParAnnee(c: CapaciteFaculte): { annees: { annee: string; n: number }[]; detail: string | null } {
  const annees = new Map<string, number>()
  let detail = c.detail ?? ''
  for (const m of detail.matchAll(/en (\d{4}-\d{4})\s*:\s*(\d+)\.?/gi)) {
    annees.set(m[1]!, Number(m[2]))
    detail = detail.replace(m[0], '')
  }
  if (c.nombre !== null && c.annee) annees.set(c.annee, c.nombre)
  detail = detail.replace(/\s+/g, ' ').replace(/[\s;,]+$/, '').trim()
  return {
    annees: [...annees].map(([annee, n]) => ({ annee, n })).sort((a, b) => a.annee.localeCompare(b.annee)),
    detail: detail ? (/[.!?]$/.test(detail) ? detail : `${detail}.`) : null,
  }
}

/** « 2026-2027 » devient « rentrée 2026 ». */
export function rentree(annee: string | null): string | null {
  const m = /^(\d{4})-\d{4}$/.exec(annee ?? '')
  return m ? `rentrée ${m[1]}` : annee
}

export type LigneFrais = { libelle: string; montant: string; detail: string | null }

/**
 * Les frais de scolarité relevés, une ligne par diplôme quand le texte les
 * sépare : « Bac pro : 6 990 euros par an (2026) ; BTS : 7 150 euros… ».
 * Le montant est mis en avant, le reste de la phrase le suit tel quel.
 */
export function lignesFrais(frais: string | null): LigneFrais[] {
  if (!frais?.trim()) return []
  return frais
    .split(/\s*;\s*/)
    .filter(Boolean)
    .map((morceau) => {
      const etiquette = /^([^:]{2,40}?)\s*:\s*(.+)$/.exec(morceau)
      const libelle = etiquette ? etiquette[1]!.trim() : 'Frais de scolarité'
      const reste = etiquette ? etiquette[2]!.trim() : morceau.trim()
      const montant = /^\d[\d\s  ]*(?:,\d+)?\s*(?:euros?|€)(?:\s+par an)?/i.exec(reste)
      if (!montant) return { libelle: libelle.charAt(0).toUpperCase() + libelle.slice(1), montant: reste.charAt(0).toUpperCase() + reste.slice(1), detail: null }
      const detail = reste.slice(montant[0].length).trim().replace(/^[,.]\s*/, '')
      return { libelle: libelle.charAt(0).toUpperCase() + libelle.slice(1), montant: montant[0].trim(), detail: detail || null }
    })
}

/** Durée de l'internat par spécialité, fixée par les textes du troisième cycle long. */
export const DUREE_INTERNAT: [RegExp, string][] = [
  [/orthop/i, '4 ans'],
  [/chirurgie/i, '4 ans'],
  [/m[ée]decine/i, '3 ans'],
]

export function dureeInternat(specialite: string): string | null {
  return DUREE_INTERNAT.find(([re]) => re.test(specialite))?.[1] ?? null
}

/** La date des prochaines portes ouvertes, si elle est à venir. */
export function prochainesPortesOuvertes(d: Donnees | null, maintenant = new Date()): string | null {
  if (!d?.portesOuvertes || d.aucunePorteOuverte) return null
  return portesOuvertesAJour(d, maintenant) ? d.portesOuvertes : null
}

/** « 12 septembre 2026 », depuis une date ou un horodatage ISO. */
export function dateLisible(iso: string, avecJour = false): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso)
  const texte = d.toLocaleDateString('fr-FR', { ...(avecJour ? { weekday: 'long' as const } : {}), day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
  return avecJour ? texte.charAt(0).toUpperCase() + texte.slice(1) : texte
}

/** Le site sans protocole ni barre finale, pour l'afficher. */
export function siteLisible(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
}
