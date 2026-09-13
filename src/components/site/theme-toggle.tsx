'use client'

import { useSyncExternalStore } from 'react'
import {
  ThemeTogglerButton,
  type ThemeTogglerButtonProps,
} from '@/components/matos-ui/theme-toggler-button'

/**
 * Enveloppe du bouton de thème.
 *
 * Le composant de matos-ui choisit son icône d'après le thème résolu, que le
 * serveur ne connaît pas : il rend un soleil côté serveur et une lune côté
 * client, ce qui provoquait une erreur d'hydratation et faisait regénérer
 * l'arbre à chaque chargement. `suppressHydrationWarning` sur `<html>` ne
 * couvre que cet élément, pas ses descendants, et masquerait le symptôme sans
 * traiter la cause.
 *
 * Le bouton n'est donc rendu qu'après le montage, la place étant réservée pour
 * éviter tout décalage de mise en page. Le composant installé n'est pas modifié.
 */

/** Jamais appelé : l'état « monté » ne change plus après le premier rendu client. */
const sansAbonnement = () => () => {}

export function ThemeToggle({
  tailleReservee,
  className,
  ...props
}: ThemeTogglerButtonProps & { tailleReservee: string }) {
  // `useSyncExternalStore` distingue serveur et client sans passer par un
  // `setState` dans un effet, qui déclencherait un rendu en cascade.
  const monte = useSyncExternalStore(
    sansAbonnement,
    () => true,
    () => false,
  )

  if (!monte) return <span aria-hidden className={`inline-block shrink-0 ${tailleReservee}`} />
  return <ThemeTogglerButton className={className} {...props} />
}
