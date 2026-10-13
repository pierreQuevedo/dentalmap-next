import type { Metadata } from 'next'
import { PageAlternance } from '@/components/emploi/alternance'
import { ALTERNANCE } from '@/lib/emploi/chemins'

type Recherche = { contrat?: string }

/** L'onglet Stages vient de l'URL : page rendue à la demande, ses données restent en cache. */
export const instant = false

export async function generateMetadata(props: { searchParams: Promise<Recherche> }): Promise<Metadata> {
  const stages = (await props.searchParams).contrat === 'stage'
  return {
    title: stages ? 'Stages dans les cabinets dentaires et les laboratoires' : 'Alternance et stages en cabinet dentaire et en laboratoire',
    description:
      'Contrats d’alternance et stages publiés par des cabinets, centres de santé et laboratoires vérifiés, avec la rémunération affichée. Rythme école et entreprise, écoles, salaire moyen d’un alternant.',
    alternates: { canonical: ALTERNANCE },
    ...(stages ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function Page(props: { searchParams: Promise<Recherche> }) {
  const stages = (await props.searchParams).contrat === 'stage'
  return <PageAlternance stages={stages} />
}
