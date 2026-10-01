import { PageCommune, metadonneesCommune } from '@/components/annuaire/commune'
import { professionDuSegment } from '../../base'

type Params = { base: string; departement: string; commune: string }
type Recherche = { page?: string }

/** Bloquante : une commune inconnue doit renvoyer 404, pas un 200 vide. */
export const instant = false

export async function generateMetadata(props: { params: Promise<Params>; searchParams: Promise<Recherche> }) {
  const { base, ...params } = await props.params
  return metadonneesCommune(professionDuSegment(base), params, await props.searchParams)
}

export default async function Page(props: { params: Promise<Params>; searchParams: Promise<Recherche> }) {
  const { base, ...params } = await props.params
  return <PageCommune profession={professionDuSegment(base)} params={Promise.resolve(params)} searchParams={props.searchParams} />
}
