import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { BASE_URL, cheminPraticien, type Profession } from '@/lib/annuaire/types'

/** La page d'une fiche à partir de son slug : le lieu principal, sinon le premier. L'accueil si elle n'existe plus. */
export async function cibleLienCourt(slug: string): Promise<string> {
  const { rows } = await db.execute<{ profession: Profession; commune_slug: string | null; departement_slug: string | null }>(sql`
    SELECT DISTINCT ON (p.id) p.profession, c.slug AS commune_slug, d.slug AS departement_slug
    FROM praticiens p
    LEFT JOIN lieux_exercice l ON l.praticien_id = p.id
    LEFT JOIN communes c ON c.code_insee = l.code_insee
    LEFT JOIN departements d ON d.code = c.departement_code
    WHERE p.slug = ${slug} AND p.deleted_at IS NULL
    ORDER BY p.id, l.principal DESC
    LIMIT 1
  `)
  const r = rows[0]
  return r?.commune_slug && r.departement_slug ? cheminPraticien(BASE_URL[r.profession], r.departement_slug, r.commune_slug, slug) : '/'
}
