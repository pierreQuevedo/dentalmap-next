'use client'

import { Carte } from '@/components/map/carte'
import type { Emprise } from '@/lib/annuaire/emprise'
import { useRecherche } from './contexte'

/**
 * La carte, branchée sur l'état partagé.
 *
 * Un composant de trois lignes, mais qui garde `Carte` ignorante du contexte :
 * la carte reçoit des rappels, elle ne va rien chercher elle-même.
 */
export function CarteRecherche({ emprise }: { emprise: Emprise }) {
  const { base, survol, setSurvol, deplacer, filtres, cadrage } = useRecherche()
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
