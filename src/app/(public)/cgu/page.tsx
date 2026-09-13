import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'

export const metadata = metadonneesEnAttente('Conditions d’utilisation', 'Règles d’usage du site.')

export default function Page() {
  return <PageEnAttente titre="Conditions d’utilisation" resume="Règles d’usage du site." />
}
