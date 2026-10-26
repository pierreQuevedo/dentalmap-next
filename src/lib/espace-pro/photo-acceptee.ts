/**
 * Une adresse de photo que l'on accepte d'enregistrer sur une fiche ou un
 * profil : seulement nos propres stockages (audit du 2026-10-26).
 *
 * - `/photos/<uuid>.jpg` : stockage privé de DentalMap, servi par le site ;
 * - le stockage public Vercel Blob de DentalMap, et lui seul (`BLOB_URL_PUBLIQUE`,
 *   sinon l'identifiant tiré du jeton) : n'importe quel autre stockage public
 *   laissait poser une image hébergée chez un tiers ;
 * - `/uploads/…`, le disque local, en développement uniquement.
 */
export function photoAcceptee(url: string): boolean {
  if (/^\/photos\/[0-9a-f-]{36}\.jpg$/.test(url)) return true
  if (process.env.NODE_ENV !== 'production' && /^\/uploads\/[\w-]+\/[\w-]+\.(jpg|jpeg|png|webp)$/i.test(url)) return true
  const magasin = magasinPublic()
  return !!magasin && url.startsWith(`${magasin}/`) && !url.includes('..')
}

function magasinPublic(): string | null {
  const fixe = process.env.BLOB_URL_PUBLIQUE?.replace(/\/$/, '')
  if (fixe) return fixe
  const id = /^vercel_blob_rw_([a-z0-9]+)_/i.exec(process.env.BLOB_READ_WRITE_TOKEN ?? '')?.[1]
  return id ? `https://${id.toLowerCase()}.public.blob.vercel-storage.com` : null
}
