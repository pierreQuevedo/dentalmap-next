import type { Metadata } from 'next'
import { FAQ_RECRUTEURS, Recruter } from '@/components/emploi/recruter'
import { RECRUTER } from '@/lib/emploi/chemins'
import { Balisage, faqPage } from '@/lib/seo/jsonld'

export const metadata: Metadata = {
  title: 'Recruter : publiez une offre d’emploi dentaire',
  description:
    'Cabinets, centres de santé et laboratoires vérifiés : publiez vos offres d’assistant(e) dentaire, de secrétaire, de prothésiste, de remplacement ou de collaboration depuis l’espace pro.',
  alternates: { canonical: RECRUTER },
}

export default function Page() {
  return (
    <>
      <Balisage donnees={faqPage(FAQ_RECRUTEURS.map((f) => ({ question: f.q, reponse: f.r })))} />
      <Recruter />
    </>
  )
}
