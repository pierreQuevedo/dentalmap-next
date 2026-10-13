import type { Metadata } from 'next'
import { PlanDuSite } from '@/components/vitrine/plan-du-site/plan-du-site'

export const metadata: Metadata = {
  title: 'Plan du site',
  description: 'Toutes les pages de DentalMap, par rubrique : annuaire, départements, grandes villes, formation, ressources et espace professionnel.',
  alternates: { canonical: '/plan-du-site/' },
}

export default function Page() {
  return <PlanDuSite />
}
