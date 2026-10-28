import type { Metadata } from 'next'
import { Accueil } from '@/components/emploi/accueil'
import { FAQ } from '@/components/emploi/blocs'
import { EMPLOI } from '@/lib/emploi/chemins'
import { Balisage, faqPage, filAriane } from '@/lib/seo/jsonld'

export const metadata: Metadata = {
  title: 'Emploi dentaire en cabinet et en laboratoire',
  description:
    'Offres d’emploi des cabinets, centres de santé et laboratoires vérifiés : assistant(e) dentaire, secrétariat, prothèse, alternance. Salaire affiché.',
  alternates: { canonical: EMPLOI },
}

export default function Page() {
  return (
    <>
      <Balisage donnees={filAriane([{ nom: 'Accueil', chemin: '/' }, { nom: 'Emploi', chemin: EMPLOI }])} />
      <Balisage donnees={faqPage(FAQ.map((f) => ({ question: f.q, reponse: f.r })))} />
      <Accueil />
    </>
  )
}
