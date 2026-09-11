import { Suspense } from 'react'
import { PageDepartement, metadonneesDepartement } from '@/components/annuaire/departement'
import { SqueletteContenu } from '@/components/annuaire/squelette'

type Params = { departement: string }

export async function generateMetadata(props: { params: Promise<Params> }) {
  return metadonneesDepartement('prothesiste', await props.params)
}

export default async function Page(props: { params: Promise<Params> }) {
  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <Suspense fallback={<SqueletteContenu />}>
        <PageDepartement profession="prothesiste" params={props.params} />
      </Suspense>
    </main>
  )
}
