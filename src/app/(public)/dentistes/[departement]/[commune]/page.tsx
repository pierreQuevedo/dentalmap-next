import { PageCommune, metadonneesCommune } from '@/components/annuaire/commune'

type Params = { departement: string; commune: string }

/** Bloquante pour la même raison que la fiche : une commune inconnue doit renvoyer 404. */
export const instant = false

export async function generateMetadata(props: { params: Promise<Params> }) {
  return metadonneesCommune('dentiste', await props.params)
}

export default function Page(props: { params: Promise<Params> }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <PageCommune profession="dentiste" params={props.params} />
    </main>
  )
}
