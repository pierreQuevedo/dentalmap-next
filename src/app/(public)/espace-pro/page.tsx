import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'

export const metadata = metadonneesEnAttente('Espace professionnel', 'Tableau de bord des praticiens et laboratoires.')

export default function Page() {
  return <PageEnAttente titre="Espace professionnel" resume="Tableau de bord des praticiens et laboratoires." />
}
