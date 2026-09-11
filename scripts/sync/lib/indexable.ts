import { sql } from 'drizzle-orm'
import { db } from '@/db'

/**
 * Recalcule la colonne `praticiens.indexable`, seule source de vérité pour la
 * présence dans les sitemaps et l'absence de balise noindex.
 *
 * La règle vit ici et nulle part ailleurs. Elle était auparavant dupliquée dans
 * trois jobs, qui se contredisaient : le géocodage remettait en index des
 * laboratoires que l'import avait volontairement écartés.
 *
 * Une fiche est indexable si les trois conditions sont réunies :
 *
 *  1. elle a au moins un lieu positionné. Un praticien sans adresse exploitable
 *     ne peut apparaître ni sur la carte ni dans une liste par commune : sa page
 *     n'apporterait rien et diluerait la qualité de l'annuaire. Il reste en base
 *     et trouvable par recherche nominative, et rentrera dans l'index le jour où
 *     il revendiquera sa fiche et renseignera son adresse ;
 *
 *  2. son identité est confirmée par un registre, `statut_verification` valant
 *     `verifie`. Cela exclut les laboratoires rapprochés de Sirene par leur
 *     seule adresse, ou pour lesquels plusieurs entreprises étaient candidates :
 *     deux sociétés partagent souvent une adresse, et publier une identité
 *     fausse serait pire que de ne rien publier ;
 *
 *  3. aucun registre ne l'a déclaré radié ou cessé.
 *
 * Pour les chirurgiens-dentistes, qui viennent du RPPS et sont donc tous
 * `verifie`, la règle se réduit de fait à la première condition.
 */
export async function recalculerIndexables(): Promise<{ total: number; indexables: number }> {
  await db.execute(sql`
    UPDATE praticiens p SET indexable = (
      EXISTS (SELECT 1 FROM lieux_exercice l WHERE l.praticien_id = p.id AND l.position IS NOT NULL)
      AND p.statut_verification = 'verifie'
      AND NOT EXISTS (
        SELECT 1 FROM verifications v
        WHERE v.praticien_id = p.id AND v.statut IN ('radie', 'cesse')
      )
    )
    WHERE p.deleted_at IS NULL
  `)
  const [bilan] = (
    await db.execute<{ total: number; indexables: number }>(sql`
      SELECT count(*)::int AS total, count(*) FILTER (WHERE indexable)::int AS indexables
      FROM praticiens WHERE deleted_at IS NULL
    `)
  ).rows
  return bilan ?? { total: 0, indexables: 0 }
}
