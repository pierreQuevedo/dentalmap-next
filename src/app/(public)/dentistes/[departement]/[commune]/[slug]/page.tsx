import { Suspense } from 'react'
import { PageFiche, metadonneesFiche } from '@/components/annuaire/fiche'
import { SqueletteContenu } from '@/components/annuaire/squelette'

type Params = { departement: string; commune: string; slug: string }

export async function generateMetadata(props: { params: Promise<Params> }) {
  return metadonneesFiche('dentiste', await props.params)
}

/**
 * La coquille est prérendue, le contenu est streamé dans la même réponse HTTP.
 * Les 45 000 fiches ne peuvent pas être prégénérées : elles se remplissent à la
 * demande puis restent en cache selon le profil `praticien`, porté par les
 * requêtes de `lib/annuaire`.
 */
export default async function Page(props: { params: Promise<Params> }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Suspense fallback={<SqueletteContenu />}>
        <PageFiche profession="dentiste" params={props.params} />
      </Suspense>
    </main>
  )
}
