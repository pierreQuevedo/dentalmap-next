import { PageDepartement, metadonneesDepartement } from '@/components/annuaire/departement'

type Params = { departement: string }

/** Bloquante : un département inconnu doit renvoyer 404. */
export const instant = false

export async function generateMetadata(props: { params: Promise<Params> }) {
  return metadonneesDepartement('prothesiste', await props.params)
}

export default function Page(props: { params: Promise<Params> }) {
  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <PageDepartement profession="prothesiste" params={props.params} />
    </main>
  )
}
