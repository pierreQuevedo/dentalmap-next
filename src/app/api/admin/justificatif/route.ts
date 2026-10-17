import type { NextRequest } from 'next/server'
import { cleAdminValide, refusAdmin } from '@/lib/admin/cle'
import { servirJustificatif } from '@/lib/espace-pro/lecture-justificatif'

/**
 * Un justificatif pour le SAV WordPress, qui le relaie à la personne de
 * l'équipe connectée : `?id=…&doc=…` (voir servirJustificatif).
 */
export async function GET(requete: NextRequest) {
  if (!cleAdminValide(requete)) return refusAdmin()
  const id = requete.nextUrl.searchParams.get('id') ?? ''
  if (!id) return Response.json({ ok: false }, { status: 400 })
  return servirJustificatif(id, requete.nextUrl.searchParams.get('doc'))
}
