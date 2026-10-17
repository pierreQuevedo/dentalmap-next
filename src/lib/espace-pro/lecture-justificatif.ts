import { readFile } from 'node:fs/promises'
import { NextResponse } from 'next/server'
import { get } from '@vercel/blob'
import { sql } from 'drizzle-orm'
import { db } from '@/db'

/**
 * Le document d'une demande, lu dans le stockage privé. Sans contrôle
 * d'accès : la route appelante s'en charge (modérateur connecté, ou clé du
 * back-office). Jamais mis en cache.
 *
 * `doc` : `mandat` (mandat du gérant, salarié mandaté), `creation` (Kbis
 * d'une demande d'ajout de laboratoire, LA1), `attestation` (attestation de
 * fonction d'un établissement, OAT) ; absent, le justificatif de la
 * revendication.
 */
export async function servirJustificatif(id: string, doc: string | null): Promise<NextResponse> {
  const { rows } = await db.execute<{ chemin: string | null; nom: string | null }>(
    doc === 'mandat'
      ? sql`SELECT mandat_chemin AS chemin, mandat_nom AS nom FROM revendications WHERE id = ${id} LIMIT 1`
      : doc === 'creation'
        ? sql`SELECT justificatif_chemin AS chemin, justificatif_nom AS nom FROM demandes_creation_fiche WHERE id = ${id} LIMIT 1`
        : doc === 'attestation'
          ? sql`SELECT justificatif_chemin AS chemin, justificatif_nom AS nom FROM revendications_etablissement WHERE id = ${id} LIMIT 1`
          : sql`SELECT justificatif_chemin AS chemin, justificatif_nom AS nom FROM revendications WHERE id = ${id} LIMIT 1`,
  )
  const r = rows[0]
  if (!r?.chemin) return new NextResponse('Introuvable.', { status: 404 })
  const entetes = { 'Cache-Control': 'private, no-store', 'Content-Disposition': `inline; filename="${encodeURIComponent(r.nom ?? 'justificatif')}"` }

  if (r.chemin.startsWith('blob:')) {
    const fichier = await get(r.chemin.slice(5), { access: 'private', useCache: false })
    if (!fichier) return new NextResponse('Introuvable.', { status: 404 })
    return new NextResponse(fichier.stream, { headers: { ...entetes, 'Content-Type': fichier.blob.contentType ?? 'application/octet-stream' } })
  }
  if (r.chemin.startsWith('local:') && process.env.NODE_ENV !== 'production') {
    const nom = r.chemin.slice(6)
    const type = nom.endsWith('.pdf') ? 'application/pdf' : nom.endsWith('.png') ? 'image/png' : 'image/jpeg'
    return new NextResponse(await readFile(nom), { headers: { ...entetes, 'Content-Type': type } })
  }
  return new NextResponse('Introuvable.', { status: 404 })
}
