'use client'

import { Carte } from '@/components/map/carte'
import { useRecherche } from './contexte'

/**
 * La carte, branchée sur l'état partagé.
 *
 * Un composant de trois lignes, mais qui garde `Carte` ignorante du contexte :
 * la carte reçoit des rappels, elle ne va rien chercher elle-même.
 */
export function CarteRecherche() {
  // L'emprise courante et non celle du serveur : sous `lg`, la carte n'est
  // montée qu'à sa première ouverture, et doit reprendre où en est la liste.
  const { base, emprise, survol, setSurvol, deplacer, filtres, cadrage } = useRecherche()
  return (
    <Carte
      profession={base}
      emprise={emprise}
      className="size-full"
      onEmprise={deplacer}
      survol={survol}
      onSurvol={setSurvol}
      filtres={filtres}
      cadrage={cadrage}
    />
  )
}
