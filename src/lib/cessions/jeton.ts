import { createHmac, timingSafeEqual } from 'node:crypto'
import { secretSignature } from '@/lib/secret'

export { condensat, nouveauJeton } from '@/lib/formation/jeton'

/**
 * Les jetons de l'alerte cessions, sur le modèle de l'alerte formations :
 * confirmation par un jeton aléatoire gardé en condensat (`condensat`,
 * `nouveauJeton`), désinscription par l'identifiant de l'alerte signé. La
 * signature porte son propre préfixe : un lien de désinscription des
 * formations ne vaut pas pour les cessions.
 */
const signature = (id: string) => createHmac('sha256', secretSignature()).update(`alerte-cession:${id}`).digest('base64url').slice(0, 32)

export const jetonDesinscription = (id: string) => `${id}~${signature(id)}`

export function alerteDesinscription(jeton: string): string | null {
  const [id, sig] = decodeURIComponent(jeton).split('~')
  if (!id || !sig) return null
  const attendu = Buffer.from(signature(id)),
    recu = Buffer.from(sig)
  return attendu.length === recu.length && timingSafeEqual(attendu, recu) ? id : null
}
