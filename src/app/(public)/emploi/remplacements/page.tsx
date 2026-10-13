import type { Metadata } from 'next'
import { PageRemplacements } from '@/components/emploi/remplacements'
import { REMPLACEMENTS } from '@/lib/emploi/chemins'

type Recherche = { contrat?: string }

/** L'onglet Collaborations vient de l'URL : page rendue à la demande, ses données restent en cache. */
export const instant = false

export async function generateMetadata(props: { searchParams: Promise<Recherche> }): Promise<Metadata> {
  const collaboration = (await props.searchParams).contrat === 'collaboration'
  return {
    title: collaboration ? 'Collaborations libérales de chirurgien-dentiste' : 'Remplacements et collaborations de chirurgien-dentiste',
    description:
      'Remplacements et collaborations libérales publiés par des cabinets vérifiés, avec le taux de rétrocession ou de redevance affiché, et les conditions d’exercice à connaître.',
    alternates: { canonical: REMPLACEMENTS },
    ...(collaboration ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function Page(props: { searchParams: Promise<Recherche> }) {
  const collaboration = (await props.searchParams).contrat === 'collaboration'
  return <PageRemplacements collaboration={collaboration} />
}
