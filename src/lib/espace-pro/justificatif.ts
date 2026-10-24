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

export function controlerJustificatif(fichier: { type: string; size: number; name: string }, options: { pdfSeul?: boolean } = {}): ControleJustificatif {
  if (!fichier.size) return { ok: false, erreur: 'Choisissez un fichier.' }
  if (options.pdfSeul && fichier.type !== 'application/pdf') return { ok: false, erreur: 'Le document doit être un PDF.' }
  if (!(TYPES_JUSTIFICATIF as readonly string[]).includes(fichier.type)) return { ok: false, erreur: 'Le document doit être un PDF, un JPG ou un PNG.' }
  if (fichier.size > TAILLE_MAX_JUSTIFICATIF) return { ok: false, erreur: 'Le document dépasse 10 Mo.' }
  return { ok: true }
}

/**
 * Un stockage Vercel Blob est branché : par jeton (`BLOB_READ_WRITE_TOKEN`,
 * anciens stockages) ou par identifiant de stockage (`BLOB_STORE_ID`), le
 * SDK s'authentifiant alors avec le jeton OIDC du déploiement.
 */
export function stockageBlob(): boolean {
  return !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
}

/**
 * Le téléversement direct depuis le navigateur demande le jeton de lecture et
 * d'écriture (jeton client signé avec lui). Sans lui, le fichier part avec le
 * formulaire et l'action le range.
 */
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
  if (stockageBlob()) {
    try {
      const blob = await put(chemin, fichier, { access: 'private', contentType: fichier.type, addRandomSuffix: false })
      return `blob:${blob.pathname}`
    } catch (e) {
      // En local, le jeton OIDC de Vercel expire en quelques heures : le document est rangé sur le disque plutôt que perdu.
      if (process.env.NODE_ENV === 'production') throw e
      console.warn('[dev] Vercel Blob indisponible, justificatif rangé en local :', (e as Error).message)
    }
  }
  if (process.env.NODE_ENV === 'production') throw new Error('Aucun stockage Vercel Blob (BLOB_READ_WRITE_TOKEN ou BLOB_STORE_ID) : dépôt des justificatifs impossible')
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
