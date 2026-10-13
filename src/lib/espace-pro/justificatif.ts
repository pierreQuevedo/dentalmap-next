import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { put } from '@vercel/blob'

/**
 * Le dépôt des justificatifs (JD1).
 *
 * Stockage privé Vercel Blob : le document n'a jamais d'URL publique, seule
 * l'équipe le lit, par une route réservée. Hors production et sans jeton, le
 * fichier est posé dans le dossier temporaire de la machine, pour que le
 * parcours se teste de bout en bout.
 */
export const TYPES_JUSTIFICATIF = ['application/pdf', 'image/jpeg', 'image/png'] as const
export const TAILLE_MAX_JUSTIFICATIF = 10 * 1024 * 1024

export type ControleJustificatif = { ok: true } | { ok: false; erreur: string }

export function controlerJustificatif(fichier: { type: string; size: number; name: string }): ControleJustificatif {
  if (!fichier.size) return { ok: false, erreur: 'Choisissez un fichier.' }
  if (!(TYPES_JUSTIFICATIF as readonly string[]).includes(fichier.type)) return { ok: false, erreur: 'Le document doit être un PDF, un JPG ou un PNG.' }
  if (fichier.size > TAILLE_MAX_JUSTIFICATIF) return { ok: false, erreur: 'Le document dépasse 10 Mo.' }
  return { ok: true }
}

/** Le téléversement direct est possible : le navigateur envoie au stockage, l'action ne reçoit que le chemin. */
export function televersementDirect(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

/** Type déduit de l'extension d'un chemin déjà téléversé. */
export function typeDepuisNom(nom: string): string {
  return /\.pdf$/i.test(nom) ? 'application/pdf' : /\.png$/i.test(nom) ? 'image/png' : /\.jpe?g$/i.test(nom) ? 'image/jpeg' : ''
}

/** Range le document et rend son chemin de stockage, préfixé de son support. */
export async function rangerJustificatif(fichier: File, praticienId: string): Promise<string> {
  const extension = fichier.type === 'application/pdf' ? 'pdf' : fichier.type === 'image/png' ? 'png' : 'jpg'
  const chemin = `justificatifs/${praticienId}/${randomUUID()}.${extension}`
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(chemin, fichier, { access: 'private', contentType: fichier.type, addRandomSuffix: false })
    return `blob:${blob.pathname}`
  }
  if (process.env.NODE_ENV === 'production') throw new Error('BLOB_READ_WRITE_TOKEN manquant : dépôt des justificatifs impossible')
  const dossier = join(tmpdir(), 'dentalmap', 'justificatifs', praticienId)
  await mkdir(dossier, { recursive: true })
  const local = join(dossier, chemin.split('/').pop()!)
  await writeFile(local, Buffer.from(await fichier.arrayBuffer()))
  console.log(`[dev] justificatif rangé dans ${local}`)
  return `local:${local}`
}

/** « 412 Ko », « 1,2 Mo ». */
export function tailleLisible(octets: number | null): string {
  if (!octets) return ''
  if (octets < 1024 * 1024) return `${Math.max(1, Math.round(octets / 1024))} Ko`
  return `${(octets / 1024 / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`
}
