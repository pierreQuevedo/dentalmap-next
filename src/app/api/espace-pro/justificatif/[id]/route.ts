import { NextResponse, type NextRequest } from 'next/server'
import { servirJustificatif } from '@/lib/espace-pro/lecture-justificatif'
import { estModerateur, getCompte } from '@/lib/tunnel/compte'

/**
 * Lecture d'un justificatif, réservée aux modérateurs.
 *
 * Le document vit en stockage privé : il n'a pas d'URL publique, il passe par
 * ici, après contrôle du compte. Jamais mis en cache.
 * `?doc=mandat`, `?doc=creation`, `?doc=attestation` : voir servirJustificatif.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const compte = await getCompte()
  if (!compte || !estModerateur(compte.email)) return new NextResponse('Réservé aux modérateurs.', { status: 403 })
  const { id } = await params
  return servirJustificatif(id, request.nextUrl.searchParams.get('doc'))
}
