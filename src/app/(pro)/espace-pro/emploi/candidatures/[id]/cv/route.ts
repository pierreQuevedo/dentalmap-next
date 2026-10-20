import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { servirCv } from '@/lib/emploi/cv'
import { getCompte } from '@/lib/tunnel/compte'

/**
 * Le CV d'une candidature, pour le recruteur (titulaire de la fiche de
 * l'offre, revendication acceptée) ou pour le candidat lui-même. Stockage
 * privé, jamais mis en cache.
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const compte = await getCompte()
  if (!compte) return new NextResponse('Connexion requise.', { status: 401 })
  const { id } = await params
  const { rows } = await db.execute<{ cv_chemin: string | null; cv_nom: string | null }>(sql`
    SELECT k.cv_chemin, k.cv_nom
    FROM candidatures k JOIN offres o ON o.id = k.offre_id
    WHERE k.id = ${id}
      AND (k.candidat_user_id = ${compte.id}::uuid
        OR EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = o.praticien_id AND v.user_id = ${compte.id}::uuid AND v.statut = 'acceptee' AND v.objet = 'revendication'))
  `)
  const r = rows[0]
  if (!r?.cv_chemin) return new NextResponse('Introuvable.', { status: 404 })
  return servirCv(r.cv_chemin, r.cv_nom ?? 'CV.pdf')
}
