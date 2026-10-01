import { cacheLife, cacheTag } from 'next/cache'
import { decoderEntites, lireDiplomes, type DiplomeEcole } from '@/lib/formation/faculte'
import { graphql } from './generated'
import { wp } from './client'

const ConseilsRecentsDocument = graphql(`
  query ConseilsRecents($first: Int = 5) {
    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        slug
        title
        excerpt
        date
        conseilFields { tempsLecture }
      }
    }
  }
`)

export async function getConseilsRecents(first = 5) {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:conseil')
  const data = await wp(ConseilsRecentsDocument, { first })
  return data.conseils?.nodes ?? []
}

const ConseilsDocument = graphql(`
  query Conseils($first: Int = 100) {
    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        slug
        title
        excerpt
        date
        conseilFields { categorie tempsLecture }
      }
    }
  }
`)

const ConseilDocument = graphql(`
  query Conseil($slug: ID!) {
    conseil(id: $slug, idType: SLUG) {
      id
      slug
      title
      content
      excerpt
      date
      modified
      conseilFields { categorie tempsLecture }
      seoFields { metaTitle metaDescription noindex }
    }
  }
`)

export type ConseilResume = {
  slug: string
  titre: string
  extrait: string | null
  date: string | null
  categorie: string | null
  tempsLecture: number | null
}

/** Enlève les balises que WordPress met autour de l'extrait. */
function texteBrut(html: string | null | undefined): string | null {
  if (!html) return null
  const texte = decoderEntites(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
  return texte || null
}

/**
 * Tous les conseils, les plus récents d'abord.
 *
 * Le filtrage par catégorie se fait en mémoire : la catégorie est un champ ACF,
 * que WPGraphQL n'expose pas aux arguments `where`. À l'échelle d'un blog de
 * quelques dizaines d'articles, la requête filtrée ne vaudrait pas la
 * complication ; au-delà de deux cents, il faudra une vraie taxonomie.
 */
export async function getConseils(categorie?: string): Promise<ConseilResume[]> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:conseil')
  const data = await wp(ConseilsDocument, { first: 100 })
  const nodes = data.conseils?.nodes ?? []
  return nodes
    .map((n) => ({
      slug: n.slug ?? '',
      titre: n.title ?? '',
      extrait: texteBrut(n.excerpt),
      date: n.date ?? null,
      categorie: n.conseilFields?.categorie?.[0] ?? null,
      tempsLecture: n.conseilFields?.tempsLecture ?? null,
    }))
    .filter((c) => c.slug && (!categorie || c.categorie === categorie))
}

export type ConseilComplet = ConseilResume & {
  contenu: string | null
  modifie: string | null
  seoTitre: string | null
  seoDescription: string | null
  noindex: boolean
}

export async function getConseil(slug: string): Promise<ConseilComplet | null> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:conseil', `wp:conseil:${slug}`)
  const data = await wp(ConseilDocument, { slug })
  const n = data.conseil
  if (!n?.slug) return null
  return {
    slug: n.slug,
    titre: n.title ?? '',
    extrait: texteBrut(n.excerpt),
    contenu: n.content ?? null,
    date: n.date ?? null,
    modifie: n.modified ?? null,
    categorie: n.conseilFields?.categorie?.[0] ?? null,
    tempsLecture: n.conseilFields?.tempsLecture ?? null,
    seoTitre: n.seoFields?.metaTitle ?? null,
    seoDescription: n.seoFields?.metaDescription ?? null,
    noindex: n.seoFields?.noindex ?? false,
  }
}

/* ------------------------------------------------------------------ */
/* Page d'accueil                                                      */
/* ------------------------------------------------------------------ */

const ConseilsAccueilDocument = graphql(`
  query ConseilsAccueil($first: Int = 3) {
    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        slug
        title
        date
        excerpt
        featuredImage { node { sourceUrl altText } }
        conseilFields { categorie }
      }
    }
  }
`)

export type ConseilAccueil = {
  slug: string
  titre: string
  extrait: string | null
  date: string | null
  categorie: string | null
  image: { url: string; alt: string } | null
}

/** Les trois derniers conseils, avec image et catégorie, pour la grille de l'accueil. */
export async function getConseilsAccueil(first = 3): Promise<ConseilAccueil[]> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:conseil', 'wp:conseils')
  const data = await wp(ConseilsAccueilDocument, { first })
  return (data.conseils?.nodes ?? [])
    .filter((n) => n.slug)
    .map((n) => ({
      slug: n.slug!,
      titre: n.title ?? '',
      extrait: texteBrut(n.excerpt),
      date: n.date ?? null,
      categorie: n.conseilFields?.categorie?.[0] ?? null,
      image: n.featuredImage?.node?.sourceUrl
        ? { url: n.featuredImage.node.sourceUrl, alt: n.featuredImage.node.altText ?? '' }
        : null,
    }))
}

const AnnoncesRecentesDocument = graphql(`
  query AnnoncesRecentes($first: Int = 10) {
    annonces(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        slug
        title
        date
        annonceFields { typeAnnonce departement dateExpiration }
      }
    }
  }
`)

export type AnnonceResume = {
  slug: string
  titre: string
  date: string | null
  /** « il y a 3 jours », calculé ici, dans le cache, et non au rendu. */
  depuis: string | null
  type: string | null
  /** Code du département tel que saisi dans WordPress, « 33 » par exemple. */
  departement: string | null
}

/**
 * Ancienneté relative en français, sans bibliothèque.
 *
 * Calculée dans la fonction cachée et non dans le composant : lire l'heure
 * courante pendant le prérendu d'une page est interdit par Cache Components,
 * et le cache éditorial d'une heure rend l'approximation acceptable.
 */
function depuis(date: string, maintenant: number): string {
  const jours = Math.round((maintenant - new Date(date).getTime()) / 86_400_000)
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
  if (jours < 1) return rtf.format(0, 'day')
  if (jours < 30) return rtf.format(-jours, 'day')
  return rtf.format(-Math.round(jours / 30), 'month')
}

/**
 * Les dernières annonces encore valides.
 *
 * L'expiration est filtrée en mémoire : WPGraphQL ne sait pas filtrer sur un
 * champ ACF. On demande donc un peu plus large que nécessaire, puis on coupe.
 */
export async function getAnnoncesRecentes(limite = 5): Promise<AnnonceResume[]> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:annonce', 'wp:annonces')
  const data = await wp(AnnoncesRecentesDocument, { first: limite * 3 })
  const maintenant = Date.now()
  return (data.annonces?.nodes ?? [])
    .filter((n) => {
      if (!n.slug) return false
      const exp = n.annonceFields?.dateExpiration
      return !exp || new Date(exp).getTime() > maintenant
    })
    .slice(0, limite)
    .map((n) => ({
      slug: n.slug!,
      titre: n.title ?? '',
      date: n.date ?? null,
      depuis: n.date ? depuis(n.date, maintenant) : null,
      type: n.annonceFields?.typeAnnonce?.[0] ?? null,
      departement: n.annonceFields?.departement ?? null,
    }))
}

const FaqDocument = graphql(`
  query Faq($first: Int = 50) {
    faqs(first: $first) {
      nodes {
        id
        title
        content
        faqFields { ordre }
      }
    }
  }
`)

export type QuestionFaq = { id: string; question: string; reponseHtml: string; reponseTexte: string }

/**
 * Questions fréquentes, dans l'ordre éditorial du champ `ordre`.
 *
 * `reponseTexte` est la version sans balises, destinée au JSON-LD `FAQPage`
 * qui doit porter exactement ce que la page affiche.
 */
export async function getFaq(limite = 7): Promise<QuestionFaq[]> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:faq')
  const data = await wp(FaqDocument, { first: 50 })
  return (data.faqs?.nodes ?? [])
    .filter((n) => n.title && n.content)
    .sort((a, b) => (a.faqFields?.ordre ?? 999) - (b.faqFields?.ordre ?? 999))
    .slice(0, limite)
    .map((n) => ({
      id: n.id,
      question: n.title!,
      reponseHtml: n.content!,
      reponseTexte: texteBrut(n.content) ?? '',
    }))
}

const VillesFormationDocument = graphql(`
  query VillesFormation($first: Int = 500) {
    formations(first: $first) {
      nodes {
        id
        formationFields { ville }
      }
    }
  }
`)

export type VilleFormation = { ville: string; total: number }

/**
 * Villes comptant le plus d'établissements de formation.
 *
 * Le comptage se fait en mémoire : la ville est un champ ACF, hors de portée
 * des arguments `where` de WPGraphQL. Quelques centaines d'établissements au
 * plus, la requête reste légère.
 */
export async function getVillesFormation(limite = 8): Promise<VilleFormation[]> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:formation')
  const data = await wp(VillesFormationDocument, { first: 500 })
  const compte = new Map<string, number>()
  for (const n of data.formations?.nodes ?? []) {
    const ville = n.formationFields?.ville?.trim()
    if (ville) compte.set(ville, (compte.get(ville) ?? 0) + 1)
  }
  return [...compte.entries()]
    .map(([ville, total]) => ({ ville, total }))
    .sort((a, b) => b.total - a.total || a.ville.localeCompare(b.ville, 'fr'))
    .slice(0, limite)
}

const FormationsAccueilDocument = graphql(`
  query FormationsAccueil($first: Int = 8) {
    formations(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        slug
        title
        featuredImage { node { sourceUrl altText } }
        formationFields { ville diplome duree typeFormation }
      }
    }
  }
`)

export type FormationAccueil = {
  slug: string
  titre: string
  ville: string | null
  diplome: string | null
  duree: string | null
  type: string | null
  image: { url: string; alt: string } | null
}

/** Les formations mises en avant sur l'accueil : les dernières publiées, avec leur image. */
export async function getFormationsAccueil(limite = 8): Promise<FormationAccueil[]> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:formation')
  const data = await wp(FormationsAccueilDocument, { first: limite })
  return (data.formations?.nodes ?? [])
    .filter((n) => n.slug && n.title)
    .map((n) => ({
      slug: n.slug!,
      titre: n.title!,
      ville: n.formationFields?.ville ?? null,
      diplome: n.formationFields?.diplome ?? null,
      duree: n.formationFields?.duree ?? null,
      type: n.formationFields?.typeFormation?.[0] ?? null,
      image: n.featuredImage?.node?.sourceUrl
        ? { url: n.featuredImage.node.sourceUrl, alt: n.featuredImage.node.altText ?? '' }
        : null,
    }))
}

/* ------------------------------------------------------------------ */
/* Formations                                                          */
/* ------------------------------------------------------------------ */

const FormationsDocument = graphql(`
  query Formations($first: Int = 200) {
    formations(first: $first, where: { orderby: { field: TITLE, order: ASC } }) {
      nodes {
        id
        slug
        title
        excerpt
        content
        featuredImage { node { sourceUrl altText } }
        formationFields { typeFormation ville departement diplome duree }
      }
    }
    logos: mediaItems(first: 300, where: { search: "logo", mimeType: IMAGE_PNG }) {
      nodes { slug sourceUrl altText }
    }
  }
`)

const FormationDocument = graphql(`
  query Formation($slug: ID!, $logo: ID!) {
    formation(id: $slug, idType: SLUG) {
      id
      slug
      title
      content
      excerpt
      date
      modified
      featuredImage { node { sourceUrl altText caption } }
      formationFields { typeFormation ville departement diplome duree siteWeb }
      seoFields { metaTitle metaDescription noindex }
    }
    logo: mediaItem(id: $logo, idType: SLUG) { sourceUrl altText }
  }
`)

export type FormationResume = {
  slug: string
  titre: string
  extrait: string | null
  /** Code ACF : `ecole_prothese`, `faculte` ou `privee`. */
  type: string | null
  ville: string | null
  /** Code du département, tel que saisi dans WordPress. */
  departement: string | null
  diplome: string | null
  duree: string | null
  image: { url: string; alt: string } | null
  /** Diplômes listés dans le contenu balisé d'une école ; vide pour les autres fiches. */
  diplomes: DiplomeEcole[]
  /**
   * Logo de l'établissement. Le CMS n'a pas de champ pour lui : c'est le
   * média nommé `logo-<slug de la formation>` dans la médiathèque, par
   * convention, en attendant un champ ACF dédié (voir docs/acf).
   */
  logo: { url: string; alt: string } | null
}

/** Préfixe du nom de média qui porte le logo d'une formation. */
export const PREFIXE_LOGO = 'logo-'

export type FormationComplete = FormationResume & {
  /** Légende du média dans WordPress : le crédit de la photo, à afficher avec elle. */
  creditImage: string | null
  contenu: string | null
  date: string | null
  modifie: string | null
  siteWeb: string | null
  seoTitre: string | null
  seoDescription: string | null
  noindex: boolean
}

function resumeFormation(n: {
  slug?: string | null
  title?: string | null
  excerpt?: string | null
  content?: string | null
  featuredImage?: { node?: { sourceUrl?: string | null; altText?: string | null } | null } | null
  formationFields?: {
    typeFormation?: (string | null)[] | null
    ville?: string | null
    departement?: string | null
    diplome?: string | null
    duree?: string | null
  } | null
}, logo?: { sourceUrl?: string | null; altText?: string | null } | null): FormationResume {
  return {
    slug: n.slug ?? '',
    titre: n.title ?? '',
    extrait: texteBrut(n.excerpt),
    type: n.formationFields?.typeFormation?.[0] ?? null,
    ville: n.formationFields?.ville?.trim() || null,
    departement: n.formationFields?.departement?.trim() || null,
    diplome: n.formationFields?.diplome?.trim() || null,
    duree: n.formationFields?.duree?.trim() || null,
    image: n.featuredImage?.node?.sourceUrl
      ? { url: n.featuredImage.node.sourceUrl, alt: n.featuredImage.node.altText ?? '' }
      : null,
    diplomes: lireDiplomes(n.content),
    logo: logo?.sourceUrl ? { url: logo.sourceUrl, alt: logo.altText ?? '' } : null,
  }
}

/**
 * Toutes les formations publiées, par titre.
 *
 * Le filtrage par type et par lieu se fait en mémoire : ce sont des champs
 * ACF, hors de portée des arguments `where` de WPGraphQL, et quelques
 * centaines d'établissements au plus.
 */
export async function getFormations(): Promise<FormationResume[]> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:formation')
  const data = await wp(FormationsDocument, { first: 200 })
  const logos = new Map((data.logos?.nodes ?? []).filter((l) => l.slug?.startsWith(PREFIXE_LOGO)).map((l) => [l.slug!.slice(PREFIXE_LOGO.length), l]))
  return (data.formations?.nodes ?? []).filter((n) => n.slug && n.title).map((n) => resumeFormation(n, logos.get(n.slug!)))
}

export async function getFormation(slug: string): Promise<FormationComplete | null> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:formation', `wp:formation:${slug}`)
  const data = await wp(FormationDocument, { slug, logo: `${PREFIXE_LOGO}${slug}` })
  const n = data.formation
  if (!n?.slug) return null
  return {
    ...resumeFormation(n, data.logo),
    creditImage: texteBrut(n.featuredImage?.node?.caption),
    contenu: n.content ?? null,
    date: n.date ?? null,
    modifie: n.modified ?? null,
    siteWeb: n.formationFields?.siteWeb?.trim() || null,
    seoTitre: n.seoFields?.metaTitle ?? null,
    seoDescription: n.seoFields?.metaDescription ?? null,
    noindex: n.seoFields?.noindex ?? false,
  }
}
