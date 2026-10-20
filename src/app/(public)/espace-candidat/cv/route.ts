import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { servirCv } from '@/lib/emploi/cv'
import { getCompte } from '@/lib/tunnel/compte'

/** Le CV du profil candidat, pour son titulaire seulement. Stockage privé, jamais mis en cache. */
export async function GET() {
  const compte = await getCompte()
  if (!compte) return new NextResponse('Connexion requise.', { status: 401 })
  const { rows } = await db.execute<{ cv_chemin: string | null; cv_nom: string | null }>(sql`SELECT cv_chemin, cv_nom FROM candidats WHERE user_id = ${compte.id}::uuid`)
  if (!rows[0]?.cv_chemin) return new NextResponse('Introuvable.', { status: 404 })
  return servirCv(rows[0].cv_chemin, rows[0].cv_nom ?? 'CV.pdf')
}
