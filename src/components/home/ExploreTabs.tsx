'use client'

import { useState } from 'react'
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { Feature287 } from '@/components/feature287'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type OngletExplore = {
  valeur: string
  libelle: string
  /** Ligne grise sous le titre, propre à l'onglet. */
  sousTitre: string
  cartes: { title: string; description: string; href: string; image?: { src: string; alt: string } }[]
  bouton: { text: string; url: string }
  /** Mention d'attribution des images de l'onglet, quand elles en exigent une. */
  attribution?: string
}

/**
 * Onglets Dentistes, Prothésistes, Formations au-dessus du carrousel des
 * grandes villes. Les trois listes sont déjà dans la page : l'onglet ne fait
 * que choisir laquelle le block affiche, et le bouton de recherche suit.
 *
 * L'indicateur glisse d'un onglet à l'autre grâce aux variables CSS que Base
 * UI expose sur `Tabs.Indicator`.
 */
export function ExploreTabs({ onglets }: { onglets: OngletExplore[] }) {
  const [actif, setActif] = useState(onglets[0]?.valeur ?? '')
  const onglet = onglets.find((o) => o.valeur === actif) ?? onglets[0]
  if (!onglet) return null

  return (
    <Tabs value={actif} onValueChange={(v) => setActif(String(v))}>
      <Feature287
        className="py-20 md:py-24"
        heading="Explorer l’annuaire"
        subheading={onglet.sousTitre}
        tabs={
          <TabsList className="relative h-10 rounded-full p-1">
            <TabsPrimitive.Indicator className="absolute top-1/2 left-0 z-0 h-[calc(100%-8px)] w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-1/2 rounded-full bg-background shadow-sm transition-[width,translate] duration-300 ease-out" />
            {onglets.map((o) => (
              <TabsTrigger
                key={o.valeur}
                value={o.valeur}
                className="relative z-10 h-full rounded-full px-4 data-active:bg-transparent data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-transparent"
              >
                {o.libelle}
              </TabsTrigger>
            ))}
          </TabsList>
        }
        cards={onglet.cartes}
        button={onglet.bouton}
        attribution={onglet.attribution}
      />
    </Tabs>
  )
}
