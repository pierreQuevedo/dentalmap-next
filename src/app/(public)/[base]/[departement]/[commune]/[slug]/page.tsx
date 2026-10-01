import { PageFiche, metadonneesFiche } from '@/components/annuaire/fiche'
import { professionDuSegment } from '../../../base'

type Params = { base: string; departement: string; commune: string; slug: string }

/**
 * Route bloquante, volontairement.
 *
 * Avec le rendu en flux, la coquille part avec un code 200 avant que le
 * composant ait pu décider : une fiche inexistante était servie en 200 au lieu
 * de 404, et une ancienne URL ne redirigeait pas. Un « soft 404 » sur un
 * annuaire de cinquante mille pages est exactement ce qu'il faut éviter.
 *
 * Le coût est limité : les requêtes sont en `use cache` avec le profil
 * `praticien`, donc une fiche n'est calculée qu'une fois par semaine.
 */
export const instant = false

export async function generateMetadata(props: { params: Promise<Params> }) {
  const { base, ...params } = await props.params
  return metadonneesFiche(professionDuSegment(base), params)
}

export default async function Page(props: { params: Promise<Params> }) {
  const { base, ...params } = await props.params
  return (
    <main>
      <PageFiche profession={professionDuSegment(base)} params={Promise.resolve(params)} />
    </main>
  )
}
