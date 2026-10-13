import { cacheLife, cacheTag } from 'next/cache'
import { lignes } from '@/lib/conseils/metier'

/**
 * Article modulaire des Ressources.
 *
 * Un article est un conseil WordPress complété par le groupe ACF « Article
 * modulaire » (`docs/acf/article-modules.json`) : un en-tête (chapô, relecture),
 * jusqu'à douze sections, puis les sources et « À lire aussi ». ACF est en
 * version gratuite, sans contenu flexible ni répéteur : chaque section est un
 * groupe « Section 1 » à « Section 12 » avec un select « Type de module » et des
 * champs en logique conditionnelle ; les listes sont des zones de texte, une
 * ligne par élément, colonnes séparées par « | ».
 *
 * Les champs sont lus par l'API REST, comme la fiche métier : tant que le groupe
 * n'est pas importé, `acf` est vide ou absent et l'article garde le rendu du
 * contenu WordPress. Les parseurs sont purs : la maquette
 * `/maquettes/article-modulaire/` les emploie sur des données locales.
 */

export const TYPES_MODULE = ['texte', 'a_retenir', 'etapes', 'encadre', 'chiffres', 'comparatif', 'questions', 'citation', 'image', 'appel'] as const
export type TypeModule = (typeof TYPES_MODULE)[number]

export const NOMBRE_SECTIONS = 12

export type ImageArticle = { url: string; alt: string; largeur: number | null; hauteur: number | null }

export type TonEncadre = 'information' | 'conseil' | 'attention'
export type DestinationAppel = 'recherche' | 'revendiquer' | 'lien'

export type Module =
  | { type: 'texte'; titre: string | null; html: string }
  | { type: 'a_retenir'; titre: string; points: string[] }
  | { type: 'etapes'; titre: string | null; etapes: { titre: string; detail: string }[] }
  | { type: 'encadre'; ton: TonEncadre; titre: string | null; texte: string }
  | { type: 'chiffres'; titre: string | null; chiffres: { valeur: string; libelle: string }[]; source: string | null }
  | { type: 'comparatif'; titre: string | null; entetes: string[]; rangees: string[][]; note: string | null }
  | { type: 'questions'; titre: string; questions: { question: string; reponse: string }[] }
  | { type: 'citation'; citation: string; auteur: string | null; fonction: string | null; photo: ImageArticle | null }
  | { type: 'image'; image: ImageArticle; legende: string | null; credit: string | null; format: 'large' | 'portrait' }
  | { type: 'appel'; destination: DestinationAppel; titre: string; texte: string | null; href: string; libelle: string }

/** Une section rendue : le module, et l'ancre de son intertitre s'il entre au sommaire. */
export type SectionArticle = { ancre: string | null; module: Module }

export type Source = { libelle: string; url: string | null }

export type ArticleModulaire = {
  chapo: string | null
  reluPar: string | null
  /** AAAA-MM-JJ. */
  dateRelecture: string | null
  sections: SectionArticle[]
  sources: Source[]
  /** Articles liés choisis dans WordPress, par identifiant ou par slug. */
  lies: { ids: number[]; slugs: string[] }
}

/** Plafonds des notes Figma : au-delà, les lignes sont ignorées. */
export const MAX = { points: 5, etapes: 6, chiffres: 4, colonnes: 4, questions: 8, lies: 3 } as const

/* ------------------------------------------------------------------ */
/* Lecture des valeurs brutes                                          */
/* ------------------------------------------------------------------ */

export function texteOuNull(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

/** « a | b | c » : la première colonne, puis le reste recollé (une réponse peut contenir « | »). */
function paires(texte: unknown): [string, string][] {
  return lignes(texte)
    .map((l) => [l[0] ?? '', l.slice(1).join(' | ').trim()] as [string, string])
    .filter(([a, b]) => a && b)
}

/** Adresse sûre pour un lien : https, http, ou un chemin du site. */
export function lienSur(v: unknown): string | null {
  const s = texteOuNull(v)
  if (!s) return null
  if (s.startsWith('/') && !s.startsWith('//')) return s
  try {
    const u = new URL(s)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null
  } catch {
    return null
  }
}

/**
 * Une image ACF : tableau (format « standard » de l'API), adresse seule, ou
 * identifiant de média (format « light »), résolu par `medias`.
 */
export function lireImage(v: unknown, medias: ReadonlyMap<number, ImageArticle> = new Map()): ImageArticle | null {
  if (typeof v === 'number') return medias.get(v) ?? null
  if (typeof v === 'string') {
    if (/^\d+$/.test(v)) return medias.get(Number(v)) ?? null
    const url = lienSur(v)
    return url ? { url, alt: '', largeur: null, hauteur: null } : null
  }
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    const url = lienSur(o.url ?? o.source_url)
    if (!url) return typeof o.id === 'number' ? (medias.get(o.id) ?? null) : null
    const nombre = (x: unknown) => (typeof x === 'number' && x > 0 ? x : null)
    return { url, alt: texteOuNull(o.alt ?? o.alt_text) ?? '', largeur: nombre(o.width), hauteur: nombre(o.height) }
  }
  return null
}

/** Identifiants de média à résoudre quand l'API renvoie le format « light ». */
export function idsMedias(acf: Record<string, unknown> | null | undefined): number[] {
  if (!acf) return []
  const ids = new Set<number>()
  for (let n = 1; n <= NOMBRE_SECTIONS; n++) {
    const s = acf[`section_${n}`]
    if (!s || typeof s !== 'object') continue
    for (const champ of ['image', 'photo']) {
      const v = (s as Record<string, unknown>)[champ]
      if (typeof v === 'number') ids.add(v)
      else if (typeof v === 'string' && /^\d+$/.test(v)) ids.add(Number(v))
    }
  }
  return [...ids]
}

/** « 20261011 », « 2026-10-11 » ou « 11/10/2026 » : AAAA-MM-JJ, ou `null`. */
export function lireDate(v: unknown): string | null {
  const s = texteOuNull(v)
  if (!s) return null
  const iso8601 = /^(\d{4})-?(\d{2})-?(\d{2})/.exec(s)
  const francaise = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s)
  const iso = iso8601 ? `${iso8601[1]}-${iso8601[2]}-${iso8601[3]}` : francaise ? `${francaise[3]}-${francaise[2]}-${francaise[1]}` : null
  if (!iso) return null
  return Number.isNaN(new Date(`${iso}T00:00:00Z`).getTime()) ? null : iso
}

/**
 * Le contenu de l'éditeur visuel. Au format « light », WordPress n'a pas
 * encore posé les paragraphes : on les pose ici, sur les lignes vides. Les
 * titres sont rabaissés en paragraphes gras, l'intertitre de la section
 * suffit.
 */
export function lireContenu(v: unknown): string | null {
  const s = texteOuNull(v)
  if (!s) return null
  const avecParagraphes = /<(p|ul|ol|div|blockquote)[\s>]/i.test(s)
    ? s
    : s
        .split(/\r?\n\s*\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${p.replace(/\r?\n/g, '<br />')}</p>`)
        .join('\n')
  return avecParagraphes.replace(/<h[1-6][^>]*>/gi, '<p><strong>').replace(/<\/h[1-6]>/gi, '</strong></p>')
}

const DESTINATIONS: Record<DestinationAppel, { titre: string; libelle: string; href: string } | null> = {
  recherche: { titre: 'Trouver un chirurgien-dentiste vérifié près de chez vous', libelle: 'Rechercher un praticien', href: '/recherche/' },
  revendiquer: { titre: 'Vous exercez ? Revendiquez votre fiche', libelle: 'Revendiquer ma fiche', href: '/espace-pro/revendiquer' },
  lien: null,
}

function choix<T extends string>(v: unknown, valeurs: readonly T[], defaut: T): T {
  return typeof v === 'string' && (valeurs as readonly string[]).includes(v) ? (v as T) : defaut
}

/* ------------------------------------------------------------------ */
/* Modules                                                             */
/* ------------------------------------------------------------------ */

/**
 * Un module depuis le groupe ACF d'une section. `null` quand la section est
 * sur « Aucun » ou que ses champs obligatoires sont vides : une section à
 * moitié remplie ne s'affiche pas plutôt que de montrer un bloc vide.
 */
export function lireModule(brut: unknown, medias: ReadonlyMap<number, ImageArticle> = new Map()): Module | null {
  if (!brut || typeof brut !== 'object' || Array.isArray(brut)) return null
  const s = brut as Record<string, unknown>
  const titre = texteOuNull(s.titre)
  switch (s.type) {
    case 'texte': {
      const html = lireContenu(s.contenu)
      return html ? { type: 'texte', titre, html } : null
    }
    case 'a_retenir': {
      const points = lignes(s.points)
        .map((l) => l.join(' | '))
        .slice(0, MAX.points)
      return points.length ? { type: 'a_retenir', titre: titre ?? 'À retenir', points } : null
    }
    case 'etapes': {
      const etapes = paires(s.etapes)
        .slice(0, MAX.etapes)
        .map(([t, detail]) => ({ titre: t, detail }))
      return etapes.length ? { type: 'etapes', titre, etapes } : null
    }
    case 'encadre': {
      const texte = texteOuNull(s.texte)
      return texte ? { type: 'encadre', ton: choix(s.ton, ['information', 'conseil', 'attention'], 'information'), titre, texte } : null
    }
    case 'chiffres': {
      const chiffres = paires(s.chiffres)
        .slice(0, MAX.chiffres)
        .map(([valeur, libelle]) => ({ valeur, libelle }))
      return chiffres.length ? { type: 'chiffres', titre, chiffres, source: texteOuNull(s.source) } : null
    }
    case 'comparatif': {
      const [entetes, ...rangees] = lignes(s.tableau).map((l) => l.slice(0, MAX.colonnes))
      if (!entetes || entetes.length < 2 || rangees.length === 0) return null
      // Chaque rangée prend le nombre de colonnes des en-têtes : une case
      // manquante reste vide plutôt que de décaler le tableau.
      const n = entetes.length
      return {
        type: 'comparatif',
        titre,
        entetes,
        rangees: rangees.map((r) => Array.from({ length: n }, (_, i) => r[i] ?? '')),
        note: texteOuNull(s.note),
      }
    }
    case 'questions': {
      const questions = paires(s.questions)
        .slice(0, MAX.questions)
        .map(([question, reponse]) => ({ question, reponse }))
      return questions.length ? { type: 'questions', titre: titre ?? 'Questions fréquentes', questions } : null
    }
    case 'citation': {
      // Les guillemets sont ceux du site : on retire ceux qu'on aurait saisis.
      const citation = texteOuNull(typeof s.citation === 'string' ? s.citation.trim().replace(/^[«"“\s]+|[»"”\s]+$/g, '') : null)
      return citation ? { type: 'citation', citation, auteur: texteOuNull(s.auteur), fonction: texteOuNull(s.fonction), photo: lireImage(s.photo, medias) } : null
    }
    case 'image': {
      const image = lireImage(s.image, medias)
      return image ? { type: 'image', image, legende: texteOuNull(s.legende), credit: texteOuNull(s.credit), format: choix(s.format, ['large', 'portrait'], 'large') } : null
    }
    case 'appel': {
      const destination = choix(s.destination, ['recherche', 'revendiquer', 'lien'], 'recherche')
      const defaut = DESTINATIONS[destination]
      const href = defaut?.href ?? lienSur(s.lien_url)
      const libelle = defaut?.libelle ?? texteOuNull(s.lien_libelle)
      const t = titre ?? defaut?.titre
      return href && libelle && t ? { type: 'appel', destination, titre: t, texte: texteOuNull(s.texte), href, libelle } : null
    }
    default:
      return null
  }
}

/** L'intertitre d'un module, s'il entre au sommaire. */
export function intertitre(m: Module): string | null {
  switch (m.type) {
    case 'texte':
    case 'a_retenir':
    case 'etapes':
    case 'chiffres':
    case 'comparatif':
    case 'questions':
      return m.titre
    default:
      return null
  }
}

/** « Ce que le devis doit indiquer » → « ce-que-le-devis-doit-indiquer ». */
export function ancre(texte: string): string {
  return (
    texte
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
      .replace(/-+$/, '') || 'section'
  )
}

/** Les sections dans l'ordre, avec des ancres uniques pour le sommaire. */
export function lireSections(acf: Record<string, unknown>, medias: ReadonlyMap<number, ImageArticle> = new Map()): SectionArticle[] {
  const vues = new Map<string, number>()
  const sections: SectionArticle[] = []
  for (let n = 1; n <= NOMBRE_SECTIONS; n++) {
    const m = lireModule(acf[`section_${n}`], medias)
    if (!m) continue
    const titre = intertitre(m)
    let id: string | null = null
    if (titre) {
      const base = ancre(titre)
      const k = (vues.get(base) ?? 0) + 1
      vues.set(base, k)
      id = k === 1 ? base : `${base}-${k}`
    }
    sections.push({ ancre: id, module: m })
  }
  return sections
}

/** Le sommaire : les intertitres des sections, dans l'ordre. */
export function sommaire(sections: SectionArticle[]): { ancre: string; titre: string }[] {
  return sections.flatMap((s) => {
    const titre = intertitre(s.module)
    return s.ancre && titre ? [{ ancre: s.ancre, titre }] : []
  })
}

export function lireSources(v: unknown): Source[] {
  return lignes(v)
    .filter((l) => l[0])
    .map((l) => {
      // L'adresse est la dernière colonne si elle en a l'air ; sinon la ligne
      // entière est le libellé, sans lien.
      const derniere = l.length > 1 ? lienSur(l[l.length - 1]) : null
      return { libelle: (derniere ? l.slice(0, -1) : l).join(' | '), url: derniere }
    })
}

function lireLies(v: unknown): { ids: number[]; slugs: string[] } {
  const ids: number[] = []
  const slugs: string[] = []
  for (const x of Array.isArray(v) ? v : []) {
    if (typeof x === 'number') ids.push(x)
    else if (typeof x === 'string' && /^\d+$/.test(x)) ids.push(Number(x))
    else if (x && typeof x === 'object') {
      const o = x as Record<string, unknown>
      if (typeof o.post_name === 'string' && o.post_name) slugs.push(o.post_name)
      else if (typeof o.slug === 'string' && o.slug) slugs.push(o.slug)
      else if (typeof o.ID === 'number') ids.push(o.ID)
    }
  }
  return { ids: ids.slice(0, MAX.lies), slugs: slugs.slice(0, MAX.lies) }
}

/**
 * Lit le groupe « Article modulaire ». `null` tant qu'aucune section n'est
 * remplie : la page garde alors le rendu du contenu WordPress.
 */
export function lireArticleModulaire(acf: unknown, medias: ReadonlyMap<number, ImageArticle> = new Map()): ArticleModulaire | null {
  if (!acf || typeof acf !== 'object' || Array.isArray(acf)) return null
  const a = acf as Record<string, unknown>
  const sections = lireSections(a, medias)
  if (sections.length === 0) return null
  return {
    chapo: texteOuNull(a.article_chapo),
    reluPar: texteOuNull(a.article_relu_par),
    dateRelecture: lireDate(a.article_date_relecture),
    sections,
    sources: lireSources(a.article_sources),
    lies: lireLies(a.article_lies),
  }
}

/* ------------------------------------------------------------------ */
/* Dérivés                                                             */
/* ------------------------------------------------------------------ */

function texteDuModule(m: Module): string {
  switch (m.type) {
    case 'texte':
      return `${m.titre ?? ''} ${m.html.replace(/<[^>]+>/g, ' ')}`
    case 'a_retenir':
      return `${m.titre} ${m.points.join(' ')}`
    case 'etapes':
      return `${m.titre ?? ''} ${m.etapes.map((e) => `${e.titre} ${e.detail}`).join(' ')}`
    case 'encadre':
      return `${m.titre ?? ''} ${m.texte}`
    case 'chiffres':
      return `${m.titre ?? ''} ${m.chiffres.map((c) => `${c.valeur} ${c.libelle}`).join(' ')}`
    case 'comparatif':
      return `${m.titre ?? ''} ${[m.entetes, ...m.rangees].flat().join(' ')} ${m.note ?? ''}`
    case 'questions':
      return `${m.titre} ${m.questions.map((q) => `${q.question} ${q.reponse}`).join(' ')}`
    case 'citation':
      return m.citation
    case 'image':
      return m.legende ?? ''
    case 'appel':
      return `${m.titre} ${m.texte ?? ''}`
  }
}

/** Minutes de lecture, à 200 mots par minute, une au minimum. */
export function tempsDeLecture(article: Pick<ArticleModulaire, 'chapo' | 'sections'>): number {
  const texte = [article.chapo ?? '', ...article.sections.map((s) => texteDuModule(s.module))].join(' ')
  const mots = texte.split(/\s+/).filter((m) => /[\p{L}\p{N}]/u.test(m)).length
  return Math.max(1, Math.round(mots / 200))
}

/** Les questions de tous les modules « Questions fréquentes », pour le balisage FAQPage. */
export function questionsDe(sections: SectionArticle[]): { question: string; reponse: string }[] {
  return sections.flatMap((s) => (s.module.type === 'questions' ? s.module.questions : []))
}

/** Initiales d'un nom, sans le titre « Dr » : « Dr Camille Rivière » → « CR ». */
export function initiales(nom: string): string {
  return nom
    .split(',')[0]!
    .replace(/^(dr|pr|docteur|professeur)\.?\s+/i, '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]!.toUpperCase())
    .join('')
}

/* ------------------------------------------------------------------ */
/* Accès WordPress                                                     */
/* ------------------------------------------------------------------ */

function origineWp(): string | null {
  const graphql = process.env.WP_GRAPHQL_URL
  return graphql ? new URL(graphql).origin : null
}

async function json<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    return res.ok ? ((await res.json()) as T) : null
  } catch {
    return null
  }
}

async function resoudreMedias(origine: string, ids: number[]): Promise<Map<number, ImageArticle>> {
  const medias = new Map<number, ImageArticle>()
  if (ids.length === 0) return medias
  const liste = await json<{ id: number; source_url?: string; alt_text?: string; media_details?: { width?: number; height?: number } }[]>(
    `${origine}/wp-json/wp/v2/media?include=${ids.join(',')}&per_page=${ids.length}&_fields=id,source_url,alt_text,media_details`,
  )
  for (const m of liste ?? []) {
    const image = lireImage({ url: m.source_url, alt: m.alt_text, width: m.media_details?.width, height: m.media_details?.height })
    if (image) medias.set(m.id, image)
  }
  return medias
}

/**
 * Le groupe « Article modulaire » d'un conseil, ou `null` si aucune section
 * n'est remplie, si le groupe n'est pas importé ou si WordPress ne répond pas.
 * Les articles liés choisis par identifiant sont rendus en slugs.
 */
export async function getArticleModulaire(slug: string): Promise<ArticleModulaire | null> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:conseil', `wp:conseil:${slug}`)
  const origine = origineWp()
  if (!origine) return null
  const res = await json<{ acf?: unknown }[]>(`${origine}/wp-json/wp/v2/conseil?slug=${encodeURIComponent(slug)}&_fields=acf&acf_format=standard`)
  const acf = res?.[0]?.acf
  if (!acf || typeof acf !== 'object' || Array.isArray(acf)) return null
  const medias = await resoudreMedias(origine, idsMedias(acf as Record<string, unknown>))
  const article = lireArticleModulaire(acf, medias)
  if (!article || article.lies.ids.length === 0) return article
  const lies = await json<{ id: number; slug: string }[]>(
    `${origine}/wp-json/wp/v2/conseil?include=${article.lies.ids.join(',')}&per_page=${MAX.lies}&_fields=id,slug`,
  )
  const parId = new Map((lies ?? []).map((c) => [c.id, c.slug]))
  const slugs = [...article.lies.slugs, ...article.lies.ids.flatMap((id) => (parId.has(id) ? [parId.get(id)!] : []))]
  return { ...article, lies: { ids: [], slugs: slugs.slice(0, MAX.lies) } }
}
