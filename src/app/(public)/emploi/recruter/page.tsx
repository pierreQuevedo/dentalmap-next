import type { Metadata } from 'next'
import { FAQ_RECRUTEURS, Recruter } from '@/components/emploi/recruter'
import { EMPLOI, RECRUTER } from '@/lib/emploi/chemins'
import { Balisage, faqPage, filAriane } from '@/lib/seo/jsonld'

export const metadata: Metadata = {
  title: 'Recruter : publiez une offre d’emploi dentaire',
  description:
    'Cabinets, centres de santé et laboratoires vérifiés : publiez vos offres d’assistant(e), de secrétaire, de prothésiste ou de remplaçant depuis l’espace pro.',
  alternates: { canonical: RECRUTER },
}

export default function Page() {
  return (
    <>
      <Balisage donnees={filAriane([{ nom: 'Accueil', chemin: '/' }, { nom: 'Emploi', chemin: EMPLOI }, { nom: 'Recruter', chemin: RECRUTER }])} />
      <Balisage donnees={faqPage(FAQ_RECRUTEURS.map((f) => ({ question: f.q, reponse: f.r })))} />
      <Recruter />
    </>
  )
}
