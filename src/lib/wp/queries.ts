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
