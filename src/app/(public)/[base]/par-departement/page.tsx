import { PageParDepartement, metadonneesParDepartement } from '@/components/annuaire/par-departement'
import { professionDuSegment } from '../base'

type Params = { base: string }

export const instant = false

export async function generateMetadata(props: { params: Promise<Params> }) {
  const { base } = await props.params
  return metadonneesParDepartement(professionDuSegment(base))
}

export default async function Page(props: { params: Promise<Params> }) {
  const { base } = await props.params
  return <PageParDepartement profession={professionDuSegment(base)} />
}
