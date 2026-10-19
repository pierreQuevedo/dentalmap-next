import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { put } from '@vercel/blob'
import { NextResponse, type NextRequest } from 'next/server'
import { stockageBlob } from '@/lib/espace-pro/justificatif'
import { getCompte } from '@/lib/tunnel/compte'

/**
 * Envoi d'une photo (profil, réalisations) par le serveur, quand le navigateur
 * ne peut pas téléverser lui-même (pas de jeton client) : vers le stockage
 * Vercel Blob public s'il est branché (jeton ou identifiant de stockage), sinon,
 * hors production, dans `public/uploads/` pour tester de bout en bout.
 */
export async function POST(request: NextRequest) {
  const blob = stockageBlob()
  if (process.env.NODE_ENV === 'production' && !blob) return new NextResponse('Indisponible.', { status: 404 })
  if (!(await getCompte())) return new NextResponse('Connexion requise.', { status: 401 })
  const fichier = (await request.formData()).get('photo')
  if (!(fichier instanceof File) || fichier.type !== 'image/jpeg' || fichier.size > 5 * 1024 * 1024) return new NextResponse('Photo refusée.', { status: 400 })
  const nom = `${randomUUID()}.jpg`
  if (blob) {
    const envoye = await put(`cabinets/${nom}`, fichier, { access: 'public', contentType: 'image/jpeg', addRandomSuffix: false })
    return NextResponse.json({ url: envoye.url })
  }
  const dossier = join(process.cwd(), 'public', 'uploads', 'cabinets')
  await mkdir(dossier, { recursive: true })
  await writeFile(join(dossier, nom), Buffer.from(await fichier.arrayBuffer()))
  return NextResponse.json({ url: `/uploads/cabinets/${nom}` })
}
