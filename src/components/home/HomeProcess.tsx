import { Process2 } from '@/components/process2'

/** Z5. Les trois étapes patient, plus le signalement d'erreur : le block en veut quatre. */
export function HomeProcess() {
  return (
    <Process2
      className="py-20 md:py-24"
      heading="Comment ça marche"
      description="DentalMap ne prend pas de rendez-vous, ne vend pas de créneaux et ne s’interpose pas entre vous et votre praticien. Le site sert à trouver la bonne information, puis à vous laisser appeler."
      link={{ text: 'Les questions que vous vous posez', url: '#faq' }}
      steps={[
        {
          step: '01',
          title: 'Indiquez où vous êtes',
          image: '/images/demo/pexels-6627447.jpg',
          description:
            'Une ville, un code postal ou une adresse précise. La recherche fonctionne aussi sans géolocalisation, et rien d’autre ne vous est demandé.',
        },
        {
          step: '02',
          title: 'Comparez les fiches vérifiées',
          image: '/images/demo/pexels-6627320.jpg',
          description:
            'Coordonnées, horaires, accès et conventionnement, triés par distance. Chaque information porte sa source : registre officiel, ou déclaration du praticien après vérification d’identité.',
        },
        {
          step: '03',
          title: 'Contactez le cabinet directement',
          image: '/images/demo/pexels-6627471.jpg',
          description:
            'Le numéro affiché est celui du cabinet, sans numéro de suivi. DentalMap ne sait pas si vous avez appelé, et ne facture personne pour cet appel.',
        },
        {
          step: '04',
          title: 'Signalez ce qui ne va pas',
          image: '/images/demo/pexels-8413334.jpg',
          description:
            'Un horaire faux, un cabinet fermé, une adresse obsolète. Le signalement se fait sans compte, et nous indiquons publiquement quand la correction dépend d’un registre.',
        },
      ]}
    />
  )
}
