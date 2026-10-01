'use client'

import { CarteFiche } from '@/components/recherche/carte-fiche'
import type { PraticienProche } from '@/lib/annuaire/queries'
import type { BaseUrl, Profession } from '@/lib/annuaire/types'

/**
 * Les confrères les plus proches, en cartes de résultat.
 *
 * La carte de résultat est un composant client qui attend un rappel de
 * survol ; une page serveur ne peut pas lui en passer un. Ce composant fait
 * le pont et ne survole rien : ici, pas de carte à synchroniser.
 */
export function Voisins({ praticiens, base, profession }: { praticiens: PraticienProche[]; base: BaseUrl; profession: Profession }) {
  return (
    <ol className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {praticiens.map((v, i) => (
        <CarteFiche key={v.slug} praticien={v} base={base} profession={profession} actif={false} onSurvol={() => {}} rang={i} />
      ))}
    </ol>
  )
}
