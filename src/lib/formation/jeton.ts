import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { secretSignature } from '@/lib/secret'

/**
 * Les jetons des alertes sans compte (formations, emploi) : confirmation
 * (aléatoire, gardé en condensat) et désinscription (signée). La portée
 * distingue les alertes : un lien de désinscription de l'une ne vaut rien
 * pour l'autre.
 */
export const condensat = (jeton: string) => createHash('sha256').update(jeton).digest('hex')
export const nouveauJeton = () => randomBytes(24).toString('base64url')

/**
 * Le lien de désinscription : l'identifiant de l'alerte signé. Il reste
 * valable dans chaque email envoyé, sans jeton à garder en base.
 */
export type PorteeAlerte = 'alerte-formation' | 'alerte-emploi'
const signature = (id: string, portee: PorteeAlerte) => createHmac('sha256', secretSignature()).update(`${portee}:${id}`).digest('base64url').slice(0, 32)
export const jetonDesinscription = (id: string, portee: PorteeAlerte = 'alerte-formation') => `${id}~${signature(id, portee)}`
export function alerteDesinscription(jeton: string, portee: PorteeAlerte = 'alerte-formation'): string | null {
  const [id, sig] = decodeURIComponent(jeton).split('~')
  if (!id || !sig) return null
  const attendu = Buffer.from(signature(id, portee)), recu = Buffer.from(sig)
  return attendu.length === recu.length && timingSafeEqual(attendu, recu) ? id : null
}

