import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'

export const metadata = metadonneesEnAttente('Devenir partenaire', 'Institutions, écoles et éditeurs.')

export default function Page() {
  return <PageEnAttente titre="Devenir partenaire" resume="Institutions, écoles et éditeurs." />
}
