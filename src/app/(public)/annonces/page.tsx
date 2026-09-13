import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'

export const metadata = metadonneesEnAttente('Annonces', 'Cessions de cabinet, collaborations, remplacements et emploi.')

export default function Page() {
  return <PageEnAttente titre="Annonces" resume="Cessions de cabinet, collaborations, remplacements et emploi." />
}
