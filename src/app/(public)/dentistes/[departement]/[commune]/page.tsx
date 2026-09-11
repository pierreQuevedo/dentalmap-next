import { PageCommune, metadonneesCommune } from '@/components/annuaire/commune'

type Params = { departement: string; commune: string }
type Recherche = { page?: string }

/** Bloquante : une commune inconnue doit renvoyer 404, pas un 200 vide. */
export const instant = false

export async function generateMetadata(props: {
  params: Promise<Params>
  searchParams: Promise<Recherche>
}) {
  return metadonneesCommune('dentiste', await props.params, await props.searchParams)
}

export default function Page(props: { params: Promise<Params>; searchParams: Promise<Recherche> }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <PageCommune profession="dentiste" params={props.params} searchParams={props.searchParams} />
    </main>
  )
}
