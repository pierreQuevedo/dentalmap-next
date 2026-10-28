import type { Metadata } from 'next'
import { PageAPropos } from '@/components/vitrine/a-propos/page-a-propos'
import { Balisage, filAriane, pageWeb } from '@/lib/seo/jsonld'

const DESCRIPTION =
  'L’annuaire dentaire vérifié par les registres officiels : d’où viennent les fiches, comment elles sont mises à jour et comment revendiquer la vôtre.'

export const metadata: Metadata = {
  // Absolu : le modèle « %s | DentalMap » répéterait la marque.
  title: { absolute: 'Le projet DentalMap, annuaire dentaire vérifié' },
  description: DESCRIPTION,
  alternates: { canonical: '/a-propos/' },
}

export default function Page() {
  return (
    <>
      <Balisage donnees={pageWeb('AboutPage', { nom: 'Le projet DentalMap', chemin: '/a-propos/', description: DESCRIPTION })} />
      <Balisage donnees={filAriane([{ nom: 'Accueil', chemin: '/' }, { nom: 'Le projet DentalMap', chemin: '/a-propos/' }])} />
      <PageAPropos />
    </>
  )
}
