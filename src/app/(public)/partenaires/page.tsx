import type { Metadata } from 'next'
import { PagePartenaires } from '@/components/vitrine/partenaires/page-partenaires'
import { Balisage, filAriane, pageWeb } from '@/lib/seo/jsonld'

const DESCRIPTION =
  'Ordres, syndicats, éditeurs, écoles et collectivités : proposez un partenariat à DentalMap en six champs, sans compte. Réponse sous sept jours.'

export const metadata: Metadata = {
  title: 'Devenir partenaire',
  description: DESCRIPTION,
  alternates: { canonical: '/partenaires/' },
}

export default function Page() {
  return (
    <>
      <Balisage donnees={pageWeb('ContactPage', { nom: 'Devenir partenaire de DentalMap', chemin: '/partenaires/', description: DESCRIPTION })} />
      <Balisage donnees={filAriane([{ nom: 'Accueil', chemin: '/' }, { nom: 'Devenir partenaire', chemin: '/partenaires/' }])} />
      <PagePartenaires />
    </>
  )
}
