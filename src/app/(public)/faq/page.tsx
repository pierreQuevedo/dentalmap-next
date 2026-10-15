import type { Metadata } from 'next'
import { PageFaq } from '@/components/vitrine/faq/page-faq'

export const metadata: Metadata = {
  title: 'Questions fréquentes',
  description: 'Origine des fiches, vérification par les registres officiels, revendication, emploi et données personnelles : les réponses courtes.',
  alternates: { canonical: '/faq/' },
}

export default function Page() {
  return <PageFaq />
}
