import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NextResponse, type NextRequest } from 'next/server'
import { getCompte } from '@/lib/tunnel/compte'

/**
 * Hors production et sans jeton Vercel Blob : la photo est posée dans
 * `public/uploads/`, pour que la mission se teste de bout en bout. Refusé en
 * production.
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' || process.env.BLOB_READ_WRITE_TOKEN) return new NextResponse('Indisponible.', { status: 404 })
  if (!(await getCompte())) return new NextResponse('Connexion requise.', { status: 401 })
  const fichier = (await request.formData()).get('photo')
  if (!(fichier instanceof File) || fichier.type !== 'image/jpeg' || fichier.size > 5 * 1024 * 1024) return new NextResponse('Photo refusée.', { status: 400 })
  const dossier = join(process.cwd(), 'public', 'uploads', 'cabinets')
  await mkdir(dossier, { recursive: true })
  const nom = `${randomUUID()}.jpg`
  await writeFile(join(dossier, nom), Buffer.from(await fichier.arrayBuffer()))
  return NextResponse.json({ url: `/uploads/cabinets/${nom}` })
}
