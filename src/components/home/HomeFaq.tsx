import { Faq17 } from '@/components/faq17'
import { Balisage, faqPage } from '@/lib/seo/jsonld'
import { getFaq } from '@/lib/wp/queries'

/**
 * Questions fréquentes dans faq17 : la colonne de gauche porte l'invitation
 * à écrire, l'accordéon à droite vient du type de contenu `faq` de WordPress
 * dans l'ordre éditorial. Le `FAQPage` est produit depuis la même liste.
 */
export async function HomeFaq() {
  const questions = (await getFaq(7)).map((q) => ({ question: q.question, reponse: q.reponseTexte }))
  if (questions.length === 0) return null

  return (
    <div id="faq" className="border-y border-border bg-muted">
      <Balisage donnees={faqPage(questions)} />
      <Faq17
        className="py-20 md:py-24"
        heading="Questions fréquentes"
        profileInfo={{
          name: 'L’équipe DentalMap',
          title: 'Sur la provenance des fiches, sur l’argent, et sur ce que DentalMap ne fait pas.',
          image: '/images/fiche-dentiste-femme.png',
        }}
        contactSection={{
          title: 'Votre question n’y est pas ?',
          description: 'Écrivez-nous, une personne vous répond. Nous publions les réponses les plus fréquentes sur la page FAQ.',
          linkText: 'Nous écrire',
          linkUrl: '/contact/',
        }}
        items={questions.map((q) => ({ question: q.question, answer: q.reponse }))}
      />
    </div>
  )
}
