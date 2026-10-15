import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { calculerForce } from '@/lib/espace-pro/force'
import { calculerForceLabo } from '@/lib/espace-pro/force-labo'
import { COLONNES_FICHE, ficheDepuisLigne, type LigneFiche } from '@/lib/espace-pro/fiche-lecture'
import type { Profession } from './types'

/**
 * Le taux de remplissage des fiches, sur 100, qui ordonne les listes de
 * résultats avant la distance.
 *
 * C'est la force de l'espace pro (`calculerForce`, `calculerForceLabo`),
 * calculée de la même façon, pour qu'un praticien voie dans son tableau de
 * bord exactement ce qui le classe. Seule une fiche attribuée compte : ce
 * qu'elle déclare n'est affiché qu'à cette condition. Une fiche non revendiquée
 * vaut zéro.
 */
export async function getRemplissages(profession: Profession, praticiens: { id: string; revendiquee: boolean }[]): Promise<Map<string, number>> {
  const scores = new Map<string, number>()
  const attribuees = praticiens.filter((p) => p.revendiquee).map((p) => p.id)
  if (!attribuees.length) return scores

  const calculer = profession === 'prothesiste' ? calculerForceLabo : calculerForce
  const contexte = { identiteVerifiee: true, viaPsc: false, nombreDeLieux: 1, lieuxGeres: 1 }
  // Une fiche attribuée sans rien de complété vaut déjà les points de l'identité vérifiée.
  for (const id of attribuees) scores.set(id, calculer(null, contexte).total)

  const { rows } = await db.execute<LigneFiche & { praticien_id: string }>(sql`
    SELECT f.praticien_id, ${COLONNES_FICHE}
    FROM fiches_completees f
    WHERE f.praticien_id IN (${sql.join(
      attribuees.map((id) => sql`${id}`),
      sql`, `,
    )})
  `)
  const maintenant = new Date()
  for (const r of rows) scores.set(r.praticien_id, calculer(ficheDepuisLigne(r), contexte, maintenant).total)
  return scores
}
