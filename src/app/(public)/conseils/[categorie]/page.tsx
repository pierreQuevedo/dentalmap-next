import { notFound } from 'next/navigation'
import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'
import { CONSEIL_CATEGORIES, type ConseilCategorie } from '@/lib/navigation'

const LIBELLES: Record<ConseilCategorie, string> = {
  patients: 'Conseils pour les patients',
  praticiens: 'Conseils pour les praticiens',
  prothesistes: 'Conseils pour les prothésistes',
}

/**
 * Le segment est d'abord confronté aux catégories réservées. Sans ce test, il
 * entrerait en collision avec `/conseils/{slug}` des articles : le document de
 * hiérarchie impose que les catégories l'emportent et soient interdites comme
 * slug côté CMS.
 */
function estCategorie(v: string): v is ConseilCategorie {
  return (CONSEIL_CATEGORIES as readonly string[]).includes(v)
}

export const instant = false

export async function generateMetadata(props: { params: Promise<{ categorie: string }> }) {
  const { categorie } = await props.params
  if (!estCategorie(categorie)) return metadonneesEnAttente('Conseils')
  return metadonneesEnAttente(LIBELLES[categorie])
}

export default async function Page(props: { params: Promise<{ categorie: string }> }) {
  const { categorie } = await props.params
  if (!estCategorie(categorie)) notFound()
  return <PageEnAttente titre={LIBELLES[categorie]} />
}
