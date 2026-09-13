import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'

export const metadata = metadonneesEnAttente('Le projet DentalMap', 'Ce que fait DentalMap, comment, et ce qu’il ne fait pas.')

export default function Page() {
  return <PageEnAttente titre="Le projet DentalMap" resume="Ce que fait DentalMap, comment, et ce qu’il ne fait pas." />
}
