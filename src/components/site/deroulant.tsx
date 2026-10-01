'use client'

import { useEffect, useState } from 'react'
import { usePhase } from '@/lib/use-phase'

/**
 * Un menu déroulant qui entre et sort en douceur.
 *
 * Le même mouvement que le panneau de recherche de l'en-tête, ramené à la
 * taille d'un menu : le panneau descend de huit pixels, s'ouvre de 98 à
 * 100 % et apparaît en 320 ms ; il repart en 220 ms. `ouvert` pilote tout ;
 * le contenu reste monté le temps de la sortie, et c'est le dernier contenu
 * vu ouvert qui est rendu pendant qu'il s'efface, de sorte qu'une liste de
 * suggestions vidée ne se referme pas sur du vide.
 *
 * C'est ce composant qui porte le positionnement, `absolute` et ses
 * décalages : un panneau qui glisse ne peut pas être à la fois le repère de
 * ses propres décalages et l'objet du mouvement.
 */
export function Deroulant({
  ouvert,
  className = '',
  origine = 'haut',
  children,
}: {
  ouvert: boolean
  /** Position du panneau : `absolute`, ses décalages, son plan. */
  className?: string
  /** Bord d'où le panneau part : le haut pour un menu sous son bouton, le bas pour un panneau au-dessus d'une barre. */
  origine?: 'haut' | 'bas'
  children: React.ReactNode
}) {
  // État dérivé pendant le rendu : la sortie commence dans le rendu même où
  // `ouvert` passe à faux, sans attendre un effet.
  const [precedent, setPrecedent] = useState(ouvert)
  const [sortie, setSortie] = useState(false)
  const [session, setSession] = useState(0)
  if (precedent !== ouvert) {
    setPrecedent(ouvert)
    if (ouvert) {
      setSortie(false)
      setSession((s) => s + 1)
    } else {
      setSortie(true)
    }
  }
  useEffect(() => {
    if (!sortie) return
    const t = setTimeout(() => setSortie(false), DUREE_SORTIE)
    return () => clearTimeout(t)
  }, [sortie])

  // Le dernier contenu vu ouvert, gardé pour la sortie. Un état dérivé,
  // mis à jour pendant le rendu quand le contenu change : un menu ouvert
  // se remet donc à jour, et un menu qui se ferme garde ce qu'il montrait.
  const [derniers, setDerniers] = useState(children)
  if (ouvert && derniers !== children) setDerniers(children)

  if (!ouvert && !sortie) return null
  return (
    <Panneau key={session} sortie={!ouvert} className={className} origine={origine}>
      {ouvert ? children : derniers}
    </Panneau>
  )
}

const DUREE_SORTIE = 240

function Panneau({
  sortie,
  className,
  origine,
  children,
}: {
  sortie: boolean
  className: string
  origine: 'haut' | 'bas'
  children: React.ReactNode
}) {
  const phase = usePhase(sortie)
  const depuisLeHaut = origine === 'haut'
  return (
    <div
      data-phase={phase}
      className={`${className} ${depuisLeHaut ? 'origin-top' : 'origin-bottom'} transition-[opacity,translate,scale] duration-[320ms] ease-lift data-[phase=entree]:scale-[0.98] data-[phase=entree]:opacity-0 data-[phase=sortie]:scale-[0.98] data-[phase=sortie]:opacity-0 data-[phase=sortie]:duration-[220ms] motion-reduce:transition-none ${
        depuisLeHaut
          ? 'data-[phase=entree]:-translate-y-2 data-[phase=sortie]:-translate-y-2'
          : 'data-[phase=entree]:translate-y-2 data-[phase=sortie]:translate-y-2'
      }`}
    >
      {children}
    </div>
  )
}
