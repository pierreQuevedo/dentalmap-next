import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'

export const metadata = metadonneesEnAttente('Conseils et ressources', 'Articles pour les patients, les praticiens et les prothésistes.')

export default function Page() {
  return <PageEnAttente titre="Conseils et ressources" resume="Articles pour les patients, les praticiens et les prothésistes." />
}
