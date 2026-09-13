import { PageEnAttente, metadonneesEnAttente } from '@/components/site/page-en-attente'

export const metadata = metadonneesEnAttente('Revendiquer ma fiche', 'Retrouvez votre fiche et faites-en la demande.')

export default function Page() {
  return <PageEnAttente titre="Revendiquer ma fiche" resume="Retrouvez votre fiche et faites-en la demande." />
}
