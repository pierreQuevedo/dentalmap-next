import type { Metadata } from 'next'
import { PageAlternance } from '@/components/emploi/alternance'
import { ALTERNANCE, EMPLOI } from '@/lib/emploi/chemins'
import { Balisage, filAriane } from '@/lib/seo/jsonld'

type Recherche = { contrat?: string }

/** L'onglet Stages vient de l'URL : page rendue à la demande, ses données restent en cache. */
export const instant = false

export async function generateMetadata(props: { searchParams: Promise<Recherche> }): Promise<Metadata> {
  const stages = (await props.searchParams).contrat === 'stage'
  return {
    title: stages ? 'Stages en cabinet dentaire et en laboratoire' : 'Alternance et stages en cabinet dentaire',
    description:
      'Contrats d’alternance et stages en cabinet dentaire et en laboratoire vérifiés, rémunération affichée. Rythme école et entreprise, écoles, salaire minimum.',
    alternates: { canonical: ALTERNANCE },
    ...(stages ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function Page(props: { searchParams: Promise<Recherche> }) {
  const stages = (await props.searchParams).contrat === 'stage'
  return (
    <>
      <Balisage donnees={filAriane([{ nom: 'Accueil', chemin: '/' }, { nom: 'Emploi', chemin: EMPLOI }, { nom: 'Alternance et stages', chemin: ALTERNANCE }])} />
      <PageAlternance stages={stages} />
    </>
  )
}
