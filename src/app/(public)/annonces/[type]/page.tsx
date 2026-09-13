import { notFound } from 'next/navigation'
import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'
import { ANNONCE_TYPES, type AnnonceType } from '@/lib/navigation'

const LIBELLES: Record<AnnonceType, string> = {
  cession: 'Cessions de cabinet',
  collaboration: 'Collaborations',
  remplacement: 'Remplacements',
  emploi: 'Emploi',
}

/** Voir la note de `/conseils/[categorie]` : les types réservés priment sur les slugs. */
function estType(v: string): v is AnnonceType {
  return (ANNONCE_TYPES as readonly string[]).includes(v)
}

export const instant = false

export async function generateMetadata(props: { params: Promise<{ type: string }> }) {
  const { type } = await props.params
  if (!estType(type)) return metadonneesEnAttente('Annonces')
  return metadonneesEnAttente(LIBELLES[type])
}

export default async function Page(props: { params: Promise<{ type: string }> }) {
  const { type } = await props.params
  if (!estType(type)) notFound()
  return <PageEnAttente titre={LIBELLES[type]} />
}
