import { ArrowUpRight } from 'lucide-react'
import { Cta18 } from '@/components/cta18'

/**
 * Z6. Encart réservé à DentalBridge, le logiciel de gestion de cabinet édité
 * par la même équipe, vendu séparément de l'annuaire.
 *
 * Il remplace l'appel à revendiquer sa fiche, qui reste accessible depuis le
 * header, le pied de page et chaque fiche. L'arbitrage de
 * `navigation-hierarchie.md`, qui cantonnait ce lien au pied de page, est
 * tranché dans l'autre sens : l'encart dit clairement qu'il s'agit d'un
 * produit distinct, et le lien vers le financement du site l'accompagne.
 */
export function HomeDentalBridge() {
  return (
    <Cta18
      className="pt-0 pb-20 md:pb-24"
      heading="Gérer un cabinet : un autre métier que se faire trouver"
      description="DentalBridge est notre logiciel de gestion de cabinet, vendu séparément de l’annuaire. Agenda, devis et facturation, commandes de prothèses au laboratoire, hébergeur de données de santé certifié. Aucun effet sur votre fiche annuaire, aucun compte DentalMap requis."
      image={{ src: '/images/demo/pexels-6627320.jpg', alt: '' }}
      buttons={{
        primary: { text: 'Découvrir DentalBridge', url: 'https://dentalbridge.fr', icon: <ArrowUpRight className="size-4" /> },
        secondary: { text: 'En savoir plus sur DentalMap', url: '/a-propos/' },
      }}
    />
  )
}
