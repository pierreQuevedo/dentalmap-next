import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'

export const metadata = metadonneesEnAttente('Formation', 'Écoles de prothèse, facultés d’odontologie et formations privées.')

export default function Page() {
  return <PageEnAttente titre="Formation" resume="Écoles de prothèse, facultés d’odontologie et formations privées." />
}
