import type { Metadata } from 'next'
import { PageAPropos } from '@/components/vitrine/a-propos/page-a-propos'

export const metadata: Metadata = {
  title: 'Le projet DentalMap',
  description:
    'L’annuaire dentaire vérifié par les registres officiels : d’où viennent les fiches, comment elles sont rapprochées chaque jour, comment les résultats sont classés et comment revendiquer la vôtre.',
  alternates: { canonical: '/a-propos/' },
}

export default function Page() {
  return <PageAPropos />
}
