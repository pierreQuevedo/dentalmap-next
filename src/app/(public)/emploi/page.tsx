import type { Metadata } from 'next'
import { Accueil } from '@/components/emploi/accueil'
import { FAQ } from '@/components/emploi/blocs'
import { EMPLOI } from '@/lib/emploi/chemins'
import { Balisage, faqPage } from '@/lib/seo/jsonld'

export const metadata: Metadata = {
  title: 'Emploi dentaire : offres d’assistant(e) dentaire, secrétaire, prothésiste',
  description:
    'Offres d’emploi des cabinets dentaires, centres de santé et laboratoires vérifiés auprès des registres officiels : assistant(e) dentaire, secrétariat, prothèse, alternance, remplacements. Rémunération affichée sur chaque offre.',
  alternates: { canonical: EMPLOI },
}

export default function Page() {
  return (
    <>
      <Balisage donnees={faqPage(FAQ.map((f) => ({ question: f.q, reponse: f.r })))} />
      <Accueil />
    </>
  )
}
