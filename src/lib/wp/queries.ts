import { cacheLife, cacheTag } from 'next/cache'
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
  const texte = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
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
