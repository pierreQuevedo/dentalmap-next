import { PageIndexProfession, metadonneesIndex } from '@/components/annuaire/index-profession'
import { professionDuSegment } from './base'

type Params = { base: string }
type Recherche = { page?: string }

/** Bloquante : la liste dépend du numéro de page dans l'URL, et un segment inconnu doit renvoyer 404. */
export const instant = false

export async function generateMetadata(props: { params: Promise<Params>; searchParams: Promise<Recherche> }) {
  const { base } = await props.params
  return metadonneesIndex(professionDuSegment(base), await props.searchParams)
}

export default async function Page(props: { params: Promise<Params>; searchParams: Promise<Recherche> }) {
  const { base } = await props.params
  return <PageIndexProfession profession={professionDuSegment(base)} searchParams={props.searchParams} />
}
