import { Suspense } from 'react'
import { PageCommune, metadonneesCommune } from '@/components/annuaire/commune'
import { SqueletteContenu } from '@/components/annuaire/squelette'

type Params = { departement: string; commune: string }

export async function generateMetadata(props: { params: Promise<Params> }) {
  return metadonneesCommune('dentiste', await props.params)
}

export default async function Page(props: { params: Promise<Params> }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Suspense fallback={<SqueletteContenu />}>
        <PageCommune profession="dentiste" params={props.params} />
      </Suspense>
    </main>
  )
}
