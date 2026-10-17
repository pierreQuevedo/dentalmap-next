import { NextResponse, type NextRequest } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { BASE_URL, cheminPraticien, type Profession } from '@/lib/annuaire/types'

/**
 * Le lien court d'une fiche, `/p/<slug>/`, à coller dans une fiche Google ou
 * sur le site du cabinet. Il mène à la fiche, où qu'elle soit rangée, et
 * survit à un changement de commune.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
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
  const cible = r?.commune_slug && r.departement_slug ? cheminPraticien(BASE_URL[r.profession], r.departement_slug, r.commune_slug, slug) : '/'
  return NextResponse.redirect(new URL(cible, request.url), 308)
}
