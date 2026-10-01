import { notFound } from 'next/navigation'
import { ListeFormations, metadonneesFormations, type ParamsLieu } from '@/components/formation/liste-formations'
import { estFormationType } from '@/lib/formation/types'

/** Bloquante : une famille inconnue doit renvoyer 404, et le lieu vient de l'URL. */
export const instant = false

export async function generateMetadata(props: { params: Promise<{ type: string }>; searchParams: Promise<ParamsLieu> }) {
  const { type } = await props.params
  if (!estFormationType(type)) return { title: 'Formation introuvable' }
  return metadonneesFormations(type, await props.searchParams)
}

export default async function Page(props: { params: Promise<{ type: string }>; searchParams: Promise<ParamsLieu> }) {
  const { type } = await props.params
  if (!estFormationType(type)) notFound()
  return <ListeFormations type={type} params={await props.searchParams} />
}
