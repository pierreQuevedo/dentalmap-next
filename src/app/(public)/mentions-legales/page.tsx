import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'

export const metadata = metadonneesEnAttente('Mentions légales', 'Éditeur, hébergeur et responsabilités.')

export default function Page() {
  return <PageEnAttente titre="Mentions légales" resume="Éditeur, hébergeur et responsabilités." />
}
