import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'

export const metadata = metadonneesEnAttente('Plan du site', 'Toutes les pages de DentalMap.')

export default function Page() {
  return <PageEnAttente titre="Plan du site" resume="Toutes les pages de DentalMap." />
}
