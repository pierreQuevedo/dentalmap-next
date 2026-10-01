import { Cta42 } from '@/components/cta42'

/** Après les formations : l'appel au praticien, une seule action, revendiquer sa fiche. */
export function HomePro() {
  return (
    <Cta42
      className="pt-0 pb-20 md:pb-24"
      heading="Vous êtes chirurgien-dentiste ou prothésiste ?"
      description="Votre fiche existe déjà, construite depuis les registres. Revendiquez-la pour ajouter vos horaires, vos langues parlées et les informations d’accessibilité de votre cabinet."
      image={{ src: '/images/demo/pexels-7800669.jpg', alt: '' }}
      buttons={{ primary: { text: 'Revendiquer ma fiche', url: '/espace-pro/revendiquer/' } }}
    />
  )
}
