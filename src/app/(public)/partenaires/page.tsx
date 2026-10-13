import type { Metadata } from 'next'
import { PagePartenaires } from '@/components/vitrine/partenaires/page-partenaires'

export const metadata: Metadata = {
  title: 'Devenir partenaire',
  description:
    'Ordres, syndicats, éditeurs, écoles, organismes de formation et collectivités : proposez un partenariat à DentalMap en six champs, sans compte. Réponse sous sept jours.',
  alternates: { canonical: '/partenaires/' },
}

export default function Page() {
  return <PagePartenaires />
}
