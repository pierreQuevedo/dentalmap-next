import { Suspense } from 'react'
import { PageIndexProfession, metadonneesIndex } from '@/components/annuaire/index-profession'
import { SqueletteContenu } from '@/components/annuaire/squelette'

export const generateMetadata = () => metadonneesIndex('dentiste')

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <Suspense fallback={<SqueletteContenu />}>
        <PageIndexProfession profession="dentiste" />
      </Suspense>
    </main>
  )
}
