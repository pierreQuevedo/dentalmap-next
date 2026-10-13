'use client'

/**
 * Les fiches proches d'une fiche retirée, dans la carte de résultat du site
 * (`CarteFiche`). L'appelant les passe déjà classées par distance, puis par
 * ordre alphabétique, comme toute liste de l'annuaire.
 *
 * Composant client parce que `CarteFiche` l'est : elle attend un rappel de
 * survol, sans objet ici puisqu'il n'y a pas de carte à côté.
 */
import { CarteFiche } from '@/components/recherche/carte-fiche'
import type { PraticienProche } from '@/lib/annuaire/queries'
import type { Profession } from '@/lib/annuaire/types'

const rien = () => {}

export function FichesProches({ fiches, base, profession }: { fiches: PraticienProche[]; base: string; profession: Profession }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-3 max-sm:[&>li]:min-h-[19rem]">
      {fiches.map((p) => (
        <CarteFiche key={p.slug} praticien={p} base={base} profession={profession} actif={false} onSurvol={rien} reference="de l’ancienne adresse" />
      ))}
    </ol>
  )
}
