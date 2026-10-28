/**
 * Fiches retirées à la demande du professionnel.
 *
 * Le retrait est modélisé dans `praticiens.retire_le` (voir `appliquerRetrait`
 * dans `src/lib/espace-pro/revendication.ts`) : la fiche est marquée supprimée
 * et datée. Pendant trente jours, le professionnel peut revenir sur sa
 * décision et l'adresse répond 410 avec la page « fiche retirée ».
 */
import { cacheLife, cacheTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { DELAI_ANNULATION_RETRAIT_JOURS } from '@/lib/espace-pro/chemins'
import type { Profession } from './types'

/**
 * Date de retrait d'une fiche, résolue comme `getPraticien` sur le couple
 * département et commune : une URL non canonique n'est pas une fiche retirée.
 * `null` si la fiche n'existe pas ou n'a pas été retirée.
 *
 * Le tag `annuaire` est invalidé par le retrait et par son annulation.
 */
export async function getRetrait(
  profession: Profession,
  departementSlug: string,
  communeSlug: string,
  slug: string,
): Promise<string | null> {
  'use cache: remote'
  cacheLife('praticien')
  cacheTag('annuaire', `praticien:${slug}`)
  const { rows } = await db.execute<{ retire_le: string }>(sql`
    SELECT p.retire_le
    FROM praticiens p
    WHERE p.slug = ${slug}
      AND p.profession = ${profession}
      AND p.retire_le IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM lieux_exercice l
        JOIN communes c ON c.code_insee = l.code_insee
        JOIN departements d ON d.code = c.departement_code
        WHERE l.praticien_id = p.id AND c.slug = ${communeSlug} AND d.slug = ${departementSlug}
      )
    LIMIT 1
  `)
  return rows[0]?.retire_le ?? null
}

/** Dernier instant où le retrait s'annule, et où l'adresse répond 410. */
export function finDuDelai(retireLe: string | Date): Date {
  return new Date(new Date(retireLe).getTime() + DELAI_ANNULATION_RETRAIT_JOURS * 86_400_000)
}

/** Le délai de trente jours est-il passé ? Comparé à l'heure de l'appel. */
export function delaiEcoule(retireLe: string | Date): boolean {
  return finDuDelai(retireLe).getTime() <= Date.now()
}
