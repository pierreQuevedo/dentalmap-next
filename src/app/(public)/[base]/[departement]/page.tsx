import { PageTerritoire, metadonneesTerritoire } from '@/components/annuaire/departement'
import { professionDuSegment } from '../base'

type Params = { base: string; departement: string }
type Recherche = { page?: string }

/** Bloquante : un département ou une région inconnus doivent renvoyer 404. */
export const instant = false

export async function generateMetadata(props: { params: Promise<Params>; searchParams: Promise<Recherche> }) {
  const { base, ...params } = await props.params
  return metadonneesTerritoire(professionDuSegment(base), params, await props.searchParams)
}

export default async function Page(props: { params: Promise<Params>; searchParams: Promise<Recherche> }) {
  const { base, ...params } = await props.params
  return <PageTerritoire profession={professionDuSegment(base)} params={Promise.resolve(params)} searchParams={props.searchParams} />
}
