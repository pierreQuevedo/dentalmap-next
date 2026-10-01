import { ListeFormations, metadonneesFormations, type ParamsLieu } from '@/components/formation/liste-formations'

/** Bloquante : le lieu vient de l'URL. */
export const instant = false

export async function generateMetadata(props: { searchParams: Promise<ParamsLieu> }) {
  return metadonneesFormations(null, await props.searchParams)
}

export default async function Page(props: { searchParams: Promise<ParamsLieu> }) {
  return <ListeFormations type={null} params={await props.searchParams} />
}
