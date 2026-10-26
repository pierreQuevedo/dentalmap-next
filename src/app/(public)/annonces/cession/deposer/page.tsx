import type { Metadata } from 'next'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { Deposer } from '@/components/cessions/deposer'
import { DEPOSER_CESSION } from '@/lib/cessions/routes'
import { IMAGE_PARTAGE, OPEN_GRAPH } from '@/lib/seo/site'

export const metadata: Metadata = {
  title: 'Déposer une annonce de cession de cabinet',
  description: 'Cédez votre cabinet dentaire en toute discrétion : un secteur, jamais d’adresse, des messages reçus dans votre espace pro sans afficher vos coordonnées.',
  alternates: { canonical: DEPOSER_CESSION },
  openGraph: { ...OPEN_GRAPH, title: 'Déposer une annonce de cession de cabinet', url: DEPOSER_CESSION, images: [IMAGE_PARTAGE] },
}

export default function Page() {
  return (
    <>
      <HeaderTransparent />
      <Deposer />
    </>
  )
}
