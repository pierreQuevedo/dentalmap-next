import { sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/db'

/**
 * Numéro de téléphone d'un lieu d'exercice, réservé aux comptes connectés.
 *
 * Le numéro ne figure nulle part dans le HTML des pages publiques : ni dans le
 * balisage, ni dans les tuiles de la carte, ni dans la réponse de recherche. Un
 * verrou qui laisserait la valeur dans la source ne serait qu'un décor.
 *
 * Jamais mis en cache : la réponse dépend de la session.
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return Response.json({ erreur: 'connexion requise' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }

  const lieu = new URL(request.url).searchParams.get('lieu')
  if (!lieu) return Response.json({ erreur: 'lieu manquant' }, { status: 400 })

  const { rows } = await db.execute<{ telephone: string | null }>(sql`
    SELECT l.telephone_officiel AS telephone
    FROM lieux_exercice l
    JOIN praticiens p ON p.id = l.praticien_id
    WHERE l.id = ${lieu} AND p.deleted_at IS NULL
    LIMIT 1
  `)

  return Response.json(
    { telephone: rows[0]?.telephone ?? null },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
