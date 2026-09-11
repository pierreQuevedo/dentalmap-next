import { PageFiche, metadonneesFiche } from '@/components/annuaire/fiche'

type Params = { departement: string; commune: string; slug: string }

/**
 * Route bloquante, volontairement.
 *
 * Avec le rendu en flux, la coquille part avec un code 200 avant que le
 * composant ait pu décider : une fiche inexistante était servie en 200 au lieu
 * de 404, et une ancienne URL ne redirigeait pas. Un « soft 404 » sur un
 * annuaire de 45 000 pages est exactement ce qu'il faut éviter.
 *
 * Le coût est limité : les requêtes sont en `use cache` avec le profil
 * `praticien`, donc une fiche n'est calculée qu'une fois par semaine.
 */
export const instant = false

export async function generateMetadata(props: { params: Promise<Params> }) {
  return metadonneesFiche('dentiste', await props.params)
}

export default function Page(props: { params: Promise<Params> }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <PageFiche profession="dentiste" params={props.params} />
    </main>
  )
}
