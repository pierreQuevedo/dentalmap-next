import { get } from '@vercel/blob'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Une photo déposée par un professionnel (profil, réalisations), lue dans le
 * stockage Vercel Blob, privé, et servie à tous : elle est publiée sur la
 * fiche. Le nom est un identifiant aléatoire, jamais réécrit : la réponse se
 * garde un an.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ nom: string }> }) {
  const { nom } = await params
  if (!/^[0-9a-f-]{36}\.jpg$/.test(nom)) return new NextResponse('Introuvable.', { status: 404 })
  const fichier = await get(`photos/${nom}`, { access: 'private' }).catch(() => null)
  if (!fichier) return new NextResponse('Introuvable.', { status: 404 })
  return new NextResponse(fichier.stream, {
    headers: { 'Content-Type': fichier.blob.contentType ?? 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}
