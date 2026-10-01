import { BookADemo2 } from '@/components/book-a-demo2'
import { envoyerDemandePartenariat } from '@/app/(public)/partenaires/actions'

/**
 * FAUX AVIS DE DÉMONSTRATION, à remplacer avant mise en production.
 *
 * Personnes et propos fictifs, photos de banque d'images : ils ne servent
 * qu'à vérifier que le panneau de droite du block tient avec des textes de
 * longueur réaliste. Le site ne publie pas d'avis ; ce qui restera ici est à
 * décider avec Pierre.
 */
const AVIS_DE_DEMONSTRATION = [
  {
    companyLogo: '/images/logos/universite-de-lille.webp',
    quote: {
      fullQuote:
        'Nos étudiants en dernière année trouvent enfin un annuaire où chaque cabinet est vérifié au registre. C’est devenu notre référence pour préparer les stages.',
      highlightedWords: ['vérifié', 'référence'],
    },
    author: { name: 'Dr Claire Morel', designation: 'Responsable pédagogique, faculté d’odontologie', profilePicture: '/images/demo/pexels-6627447.jpg' },
  },
  {
    companyLogo: '/images/logos/lycee-touchard-washington.png',
    quote: {
      fullQuote:
        'La fiche de notre école a été mise en ligne en deux jours, avec les diplômes et les conditions d’accès tels que nous les avons transmis. Aucune relance, aucune contrepartie demandée.',
      highlightedWords: ['deux jours', 'contrepartie'],
    },
    author: { name: 'Karim Benali', designation: 'Directeur, école de prothèse dentaire', profilePicture: '/images/demo/pexels-3881296.jpg' },
  },
  {
    companyLogo: '/images/logos/cma.png',
    quote: {
      fullQuote:
        'Nous relayons les annonces de reprise de laboratoire auprès de nos adhérents. Le classement par distance, sans favoritisme, est exactement ce que nous demandions à un annuaire.',
      highlightedWords: ['annonces', 'favoritisme'],
    },
    author: { name: 'Sophie Lambert', designation: 'Chargée de mission, chambre de métiers', profilePicture: '/images/demo/pexels-6627325.jpg' },
  },
  {
    companyLogo: '/images/logos/universite-de-strasbourg.png',
    quote: {
      fullQuote:
        'Ce qui nous a convaincus : la règle de tri est publiée, la date de synchronisation aussi, et un praticien ne peut rien modifier de ce que le registre affirme.',
      highlightedWords: ['publiée', 'registre'],
    },
    author: { name: 'Pr Antoine Girard', designation: 'Doyen, faculté de chirurgie dentaire', profilePicture: '/images/demo/pexels-8413334.jpg' },
  },
]

/** Logos de démonstration pour la bande du bas, mêmes fichiers que le hero, rendus en noir. */
const LOGOS_DE_DEMONSTRATION = [
  '/images/logos/universite-paris-descartes.png',
  '/images/logos/universite-de-lille.webp',
  '/images/logos/universite-de-toulouse.webp',
  '/images/logos/universite-de-bordeaux.webp',
  '/images/logos/universite-de-strasbourg.png',
  '/images/logos/universite-rennes-1.webp',
  '/images/logos/universite-bretagne-occidentale.webp',
  '/images/logos/cma.png',
  '/images/logos/sepr-groupe.png',
  '/images/logos/aurlom.png',
]

/**
 * Devenir partenaire, dans book-a-demo2.
 *
 * Les avatars flottants du block ne sont pas affichés. Le panneau de droite et
 * la bande de logos portent pour l'instant un contenu de démonstration, voir
 * ci-dessus.
 */
export function HomePartenaire() {
  return (
    <BookADemo2
      className="py-20 md:py-24"
      action={envoyerDemandePartenariat}
      header={{
        heading: 'Devenir partenaire',
        description: {
          text:
            'Ordres départementaux, écoles, syndicats, éditeurs : DentalMap n’affiche aucun logo institutionnel sans convention signée, et ne se réclame d’aucun soutien qu’il n’a pas. Lire notre engagement.',
          hyperlink: 'Lire notre engagement',
          url: '/a-propos/',
        },
        avatars: [],
      }}
      testimonials={AVIS_DE_DEMONSTRATION}
      footer={{
        heading: 'Établissements de formation aux métiers dentaires',
        logos: LOGOS_DE_DEMONSTRATION,
      }}
    />
  )
}
