import { cacheLife, cacheTag } from 'next/cache'
import { getConseils } from '@/lib/wp/queries'

/**
 * Fiches métier de la rubrique « Métiers » des Ressources.
 *
 * Une fiche métier est un conseil WordPress de catégorie `metiers`, complété
 * par le groupe ACF « Fiche métier » (`docs/acf/fiche-metier.json`). ACF est
 * en version gratuite, sans répéteur : chaque liste est une zone de texte,
 * une ligne par élément, colonnes séparées par « | ».
 *
 * Les champs sont lus par l'API REST et non par WPGraphQL : le schéma versionné
 * du site n'a pas à attendre l'import du groupe, et une fiche sans champs
 * remplis s'affiche simplement comme un article.
 */

export const SECTEURS = ['Cabinet libéral', 'Centre de santé', 'Laboratoire de prothèse', 'Hôpital ou centre universitaire'] as const

export const ICONES_MISSION = ['fauteuil', 'hygiene', 'accueil', 'gestion', 'diagnostic', 'atelier', 'controle', 'planning'] as const
export type IconeMission = (typeof ICONES_MISSION)[number]

/**
 * Une ligne du tableau des salaires : un minimum brut mensuel (avec, le cas
 * échéant, le haut de la fourchette), ou un texte affiché tel quel
 * (« Honoraires »), avec une précision facultative. `null` : pas de grille
 * de référence dans ce secteur.
 */
export type CaseSalaireFiche =
  | { montant: number; haut: number | null; precision: string | null }
  | { texte: string; precision: string | null }
  | null

export type FicheMetier = {
  accroche: string | null
  formationCourte: string | null
  salaireRepere: number | null
  chiffres: { valeur: string; libelle: string }[]
  missions: { icone: IconeMission; titre: string; detail: string }[]
  qualites: string[]
  formation: string | null
  etapes: { titre: string; detail: string }[]
  /** Dans l'ordre de `SECTEURS` ; `null` : pas de grille de référence dans ce secteur. */
  salaires: CaseSalaireFiche[]
  sourceSalaires: string | null
  evolutions: { titre: string; detail: string }[]
  sources: string[]
  /** Slug du métier dans les pages Emploi, pour le lien vers les offres. */
  metierEmploi: string | null
}

/** Découpe une zone de texte ACF en lignes non vides, puis en colonnes « a | b ». */
export function lignes(texte: unknown): string[][] {
  if (typeof texte !== 'string') return []
  return texte
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split('|').map((c) => c.trim()))
}

function texteOuNull(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

/** « 2 050 », « 2050 € », « 2050,00 » : un entier, ou `null` si rien de lisible. */
export function montant(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v)
  if (typeof v !== 'string') return null
  const n = Number(v.replace(/[^\d,.]/g, '').replace(',', '.'))
  return v.trim() && Number.isFinite(n) && n > 0 ? Math.round(n) : null
}

/** Un montant seul (« 2113 », « 2 113 € », « 2113,00 ») : les chiffres, espaces, séparateurs et l'euro, rien d'autre. */
function estMontant(v: string): boolean {
  return /^\d[\d\s\u00a0\u202f.,]*€?$/.test(v.trim())
}

/**
 * Une ligne de `metier_salaires` : `Secteur | montant | montant haut | précision`.
 * L'ancien format `Secteur | montant` reste lisible. Un montant non numérique
 * est un texte affiché tel quel ; une ligne sans montant ne donne rien.
 */
export function caseSalaire(colonnes: string[]): CaseSalaireFiche {
  const [, valeur = '', haut = '', precision = ''] = colonnes
  if (!valeur) return null
  const p = precision || null
  if (!estMontant(valeur)) return { texte: valeur, precision: p }
  const m = montant(valeur)
  if (m === null) return null
  const h = estMontant(haut) ? montant(haut) : null
  return { montant: m, haut: h !== null && h > m ? h : null, precision: p }
}

/**
 * Lit les champs ACF bruts d'une fiche. Une ligne incomplète est ignorée
 * plutôt que d'afficher une case vide ; une icône inconnue devient
 * « gestion », l'icône neutre.
 */
export function lireFicheMetier(acf: Record<string, unknown> | null | undefined): FicheMetier | null {
  if (!acf || typeof acf !== 'object') return null
  const paire = (texte: unknown) => lignes(texte).filter((l) => l[0] && l[1]).map(([titre, detail]) => ({ titre: titre!, detail: detail! }))
  const salairesParSecteur = new Map(lignes(acf.metier_salaires).map((l) => [l[0]?.toLowerCase() ?? '', caseSalaire(l)]))
  const fiche: FicheMetier = {
    accroche: texteOuNull(acf.metier_accroche),
    formationCourte: texteOuNull(acf.metier_formation_courte),
    salaireRepere: montant(acf.metier_salaire_repere),
    chiffres: lignes(acf.metier_chiffres)
      .filter((l) => l[0] && l[1])
      .map(([valeur, libelle]) => ({ valeur: valeur!, libelle: libelle! })),
    missions: lignes(acf.metier_missions)
      .filter((l) => l[1] && l[2])
      .map(([icone, titre, detail]) => ({
        icone: (ICONES_MISSION as readonly string[]).includes(icone ?? '') ? (icone as IconeMission) : 'gestion',
        titre: titre!,
        detail: detail!,
      })),
    qualites: lignes(acf.metier_qualites).map((l) => l[0]!),
    formation: texteOuNull(acf.metier_formation),
    etapes: paire(acf.metier_etapes),
    salaires: SECTEURS.map((s) => salairesParSecteur.get(s.toLowerCase()) ?? null),
    sourceSalaires: texteOuNull(acf.metier_source_salaires),
    evolutions: paire(acf.metier_evolutions),
    sources: lignes(acf.metier_sources).map((l) => l.join(' | ')),
    metierEmploi: texteOuNull(acf.metier_emploi),
  }
  const remplie = fiche.chiffres.length > 0 || fiche.missions.length > 0 || fiche.etapes.length > 0
  return remplie ? fiche : null
}

function baseRest(): string | null {
  const graphql = process.env.WP_GRAPHQL_URL
  if (!graphql) return null
  return `${new URL(graphql).origin}/wp-json/wp/v2/conseil`
}

/** Les champs « Fiche métier » d'un conseil, ou `null` si le groupe n'est pas rempli. */
export async function getFicheMetier(slug: string): Promise<FicheMetier | null> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:conseil', `wp:conseil:${slug}`)
  const base = baseRest()
  if (!base) return null
  const res = await fetch(`${base}?slug=${encodeURIComponent(slug)}&_fields=acf`, { headers: { Accept: 'application/json' } })
  if (!res.ok) return null
  const json = (await res.json()) as { acf?: Record<string, unknown> | unknown[] }[]
  const acf = json[0]?.acf
  return Array.isArray(acf) ? null : lireFicheMetier(acf)
}

export type CarteMetier = {
  slug: string
  nom: string
  accroche: string | null
  formation: string | null
  salaire: number | null
  image: { url: string; alt: string } | null
}

/**
 * Les fiches de la rubrique, pour le hub et « Les autres métiers ». L'ordre est
 * celui de WordPress (les plus récentes d'abord) : pas de classement éditorial
 * caché. Une fiche sans groupe « Fiche métier » rempli reste listée, sans les
 * pastilles de formation et de salaire.
 */
export async function getMetiers(): Promise<CarteMetier[]> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:conseil')
  const conseils = await getConseils('metiers')
  const fiches = await Promise.all(conseils.map((c) => getFicheMetier(c.slug)))
  return conseils.map((c, i) => ({
    slug: c.slug,
    nom: c.titre,
    accroche: fiches[i]?.accroche ?? c.extrait,
    formation: fiches[i]?.formationCourte ?? null,
    salaire: fiches[i]?.salaireRepere ?? null,
    image: c.image,
  }))
}
