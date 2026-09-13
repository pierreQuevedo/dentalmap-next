import { notFound } from 'next/navigation'
import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'
import { FORMATION_TYPES, type FormationType } from '@/lib/navigation'

const LIBELLES: Record<FormationType, string> = {
  'ecoles-de-prothese': 'Écoles de prothèse dentaire',
  'facultes-odontologie': "Facultés d'odontologie",
  'formations-privees': 'Formations privées',
}

function estType(v: string): v is FormationType {
  return (FORMATION_TYPES as readonly string[]).includes(v)
}

export const instant = false

export async function generateMetadata(props: { params: Promise<{ type: string }> }) {
  const { type } = await props.params
  if (!estType(type)) return metadonneesEnAttente('Formation')
  return metadonneesEnAttente(LIBELLES[type])
}

export default async function Page(props: { params: Promise<{ type: string }> }) {
  const { type } = await props.params
  if (!estType(type)) notFound()
  return <PageEnAttente titre={LIBELLES[type]} />
}
