import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { get, put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { stockageBlob } from '@/lib/espace-pro/justificatif'

/**
 * Le CV joint à une candidature, en stockage privé : Vercel Blob s'il est
 * branché, sinon, hors production, un dossier temporaire. Jamais d'URL
 * publique : il est servi par `/espace-pro/emploi/candidatures/<id>/cv/`
 * après contrôle du compte.
 */
export async function rangerCv(fichier: File, userId: string): Promise<string> {
  const chemin = `cv/${userId}/${randomUUID()}.pdf`
  if (stockageBlob()) {
    const blob = await put(chemin, fichier, { access: 'private', contentType: 'application/pdf', addRandomSuffix: false })
    return `blob:${blob.pathname}`
  }
  if (process.env.NODE_ENV === 'production') throw new Error('Aucun stockage Vercel Blob : dépôt des CV impossible')
  const dossier = join(tmpdir(), 'dentalmap', 'cv', userId)
  await mkdir(dossier, { recursive: true })
  const local = join(dossier, chemin.split('/').pop()!)
  await writeFile(local, Buffer.from(await fichier.arrayBuffer()))
  return `local:${local}`
}

export async function servirCv(chemin: string, nom: string): Promise<NextResponse> {
  const entetes = { 'Cache-Control': 'private, no-store', 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${encodeURIComponent(nom)}"` }
  if (chemin.startsWith('blob:')) {
    const fichier = await get(chemin.slice(5), { access: 'private', useCache: false })
    if (!fichier) return new NextResponse('Introuvable.', { status: 404 })
    return new NextResponse(fichier.stream, { headers: entetes })
  }
  if (chemin.startsWith('local:') && process.env.NODE_ENV !== 'production') return new NextResponse(await readFile(chemin.slice(6)), { headers: entetes })
  return new NextResponse('Introuvable.', { status: 404 })
}
