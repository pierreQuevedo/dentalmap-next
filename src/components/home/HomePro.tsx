import { Cta42 } from '@/components/cta42'

/** Après les formations : l'appel au praticien, une seule action, revendiquer sa fiche. */
export function HomePro() {
  return (
    <Cta42
      className="pt-0 pb-20 md:pb-24"
      heading="Votre fiche existe déjà. Faites-la passer devant."
      description="Chirurgien-dentiste, laboratoire de prothèse : plus votre fiche est complète, plus elle remonte dans les recherches de votre secteur. Horaires, photo, présentation, langues : quelques minutes, et c’est vous que l’on trouve en premier."
      image={{ src: '/images/demo/pexels-7800669.jpg', alt: '' }}
      buttons={{ primary: { text: 'Revendiquer ma fiche', url: '/espace-pro/revendiquer/' } }}
    />
  )
}
