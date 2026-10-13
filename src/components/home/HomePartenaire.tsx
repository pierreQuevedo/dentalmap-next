import { BookADemo2 } from '@/components/book-a-demo2'
import { envoyerDemandePartenariat } from '@/app/(public)/partenaires/actions'

const L = '/images/demo/partenaires-fictifs'

/**
 * AVIS DE DÉMONSTRATION, fictifs et assumés comme tels.
 *
 * Personnes et organismes inventés (faculté de l’Estuaire, Institut Ardoise…),
 * logos dessinés pour l’occasion : aucune institution réelle n’est citée ni
 * représentée, ce qui laisserait croire à un soutien qu’elle n’a pas donné
 * (décision du 13 octobre 2026). À remplacer par de vrais témoignages, avec
 * l’accord écrit de leurs auteurs, une fois les conventions signées.
 */
const AVIS_DE_DEMONSTRATION = [
  {
    companyLogo: `${L}/faculte-estuaire.svg`,
    quote: {
      fullQuote:
        'Nos étudiants en dernière année trouvent enfin un annuaire où chaque cabinet est vérifié au registre. C’est devenu notre référence pour préparer les stages.',
      highlightedWords: ['vérifié', 'référence'],
    },
    author: { name: 'Dr Hélène Varin', designation: 'Responsable pédagogique, faculté de l’Estuaire', profilePicture: '/images/demo/pexels-6627447.jpg' },
  },
  {
    companyLogo: `${L}/ecole-prothese-val.svg`,
    quote: {
      fullQuote:
        'La fiche de notre école a été mise en ligne en deux jours, avec les diplômes et les conditions d’accès tels que nous les avons transmis.',
      highlightedWords: ['deux jours', 'diplômes'],
    },
    author: { name: 'Malik Ferrand', designation: 'Directeur, école de prothèse du Val', profilePicture: '/images/demo/pexels-3881296.jpg' },
  },
  {
    companyLogo: `${L}/chambre-metiers-vallee.svg`,
    quote: {
      fullQuote:
        'Nous relayons les annonces de reprise de laboratoire auprès de nos adhérents. Le classement par distance, sans favoritisme, est exactement ce que nous demandions à un annuaire.',
      highlightedWords: ['annonces', 'favoritisme'],
    },
    author: { name: 'Claire Bastide', designation: 'Chargée de mission, chambre des métiers de la Vallée', profilePicture: '/images/demo/pexels-6627325.jpg' },
  },
  {
    companyLogo: `${L}/universite-trois-ponts.svg`,
    quote: {
      fullQuote:
        'Ce qui nous a convaincus : la règle de tri est publiée, la date de synchronisation aussi, et un praticien ne peut rien modifier de ce que le registre affirme.',
      highlightedWords: ['publiée', 'registre'],
    },
    author: { name: 'Pr Julien Aubert', designation: 'Doyen, université des Trois Ponts', profilePicture: '/images/demo/pexels-8413334.jpg' },
  },
]

/** Bande du bas : organismes fictifs, mêmes réserves que les avis. */
const LOGOS_DE_DEMONSTRATION = [
  'faculte-estuaire',
  'faculte-rive-gauche',
  'institut-ardoise',
  'ecole-prothese-val',
  'universite-trois-ponts',
  'lycee-marcel-ardent',
  'ifad-littoral',
  'campus-sante-garonne',
  'faculte-plateau',
  'institut-maillard',
].map((nom) => `${L}/${nom}.svg`)

/**
 * Devenir partenaire, dans book-a-demo2.
 *
 * Les avatars flottants du block ne sont pas affichés. Le panneau de droite et
 * la bande de logos portent un contenu de démonstration fictif, voir ci-dessus.
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
            'Ordres départementaux, écoles, syndicats, éditeurs : construisons ensemble un annuaire fiable. DentalMap ne se réclame d’aucun soutien qu’il n’a pas. Lire notre engagement.',
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
