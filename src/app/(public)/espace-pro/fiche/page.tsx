import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'

export const metadata = metadonneesEnAttente('Ma fiche', 'Compléter les informations que vous seul pouvez fournir.')

export default function Page() {
  return <PageEnAttente titre="Ma fiche" resume="Compléter les informations que vous seul pouvez fournir." />
}
