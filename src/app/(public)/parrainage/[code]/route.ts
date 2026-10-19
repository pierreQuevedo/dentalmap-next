import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { COOKIE_PARRAINAGE, REVENDIQUER } from '@/lib/espace-pro/chemins'

/**
 * Le lien de l'email de parrainage : il note l'ouverture, garde le code
 * quatre-vingt-dix jours dans un cookie (le parcours de revendication
 * rattache ensuite le compte au parrain) et mène à la revendication.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params
  const { rows } = await db.execute(sql`
    UPDATE parrainages SET ouverte_le = COALESCE(ouverte_le, now()) WHERE code = ${code} AND desinscrit_le IS NULL RETURNING 1
  `)
  const reponse = NextResponse.redirect(new URL(`${REVENDIQUER}/`, req.url), 307)
  if (rows.length) reponse.cookies.set(COOKIE_PARRAINAGE, code, { maxAge: 90 * 86_400, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' })
  return reponse
}
