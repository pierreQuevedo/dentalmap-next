import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'

export const metadata = metadonneesEnAttente('Questions fréquentes', 'Vérification des fiches, données, revendication.')

export default function Page() {
  return <PageEnAttente titre="Questions fréquentes" resume="Vérification des fiches, données, revendication." />
}
