import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'

export const metadata = metadonneesEnAttente('Contact', 'Nous signaler une erreur ou poser une question.')

export default function Page() {
  return <PageEnAttente titre="Contact" resume="Nous signaler une erreur ou poser une question." />
}
