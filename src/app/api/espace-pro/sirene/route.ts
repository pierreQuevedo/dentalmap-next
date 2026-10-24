import { NextResponse, type NextRequest } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { consulterSiret } from '@/lib/espace-pro/sirene'
import { getCompte } from '@/lib/tunnel/compte'

/**
 * LA1 : l'établissement d'un SIRET dans Sirene, pour préremplir la demande
 * d'ajout d'un laboratoire. Réservé à un compte connecté ; `null` quand
 * Sirene ne connaît pas ce SIRET ou ne répond pas. `fiche` : le laboratoire
 * déjà dans l'annuaire sous ce SIREN, à revendiquer plutôt qu'à ajouter.
 */
export async function GET(request: NextRequest) {
  if (!(await getCompte())) return new NextResponse('Connexion requise.', { status: 401 })
  const siret = (request.nextUrl.searchParams.get('siret') ?? '').replace(/\D/g, '')
  if (!/^\d{14}$/.test(siret)) return NextResponse.json(null)
  const [etablissement, { rows }] = await Promise.all([
    consulterSiret(siret),
    db.execute<{ slug: string }>(sql`SELECT slug FROM praticiens WHERE siren = ${siret.slice(0, 9)} AND profession = 'prothesiste' AND deleted_at IS NULL LIMIT 1`),
  ])
  return NextResponse.json(etablissement ? { ...etablissement, fiche: rows[0]?.slug ?? null } : rows[0] ? { fiche: rows[0].slug } : null)
}
