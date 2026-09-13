import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'

export const metadata = metadonneesEnAttente('Politique de confidentialité', 'Données collectées, durée de conservation et droits.')

export default function Page() {
  return <PageEnAttente titre="Politique de confidentialité" resume="Données collectées, durée de conservation et droits." />
}
