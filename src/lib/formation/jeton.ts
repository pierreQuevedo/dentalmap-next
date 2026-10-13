import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/** Les jetons de l'alerte formations : confirmation (aléatoire, gardé en condensat) et désinscription (signée). */
export const condensat = (jeton: string) => createHash('sha256').update(jeton).digest('hex')
export const nouveauJeton = () => randomBytes(24).toString('base64url')

/**
 * Le lien de désinscription : l'identifiant de l'alerte signé. Il reste
 * valable dans chaque email envoyé, sans jeton à garder en base.
 */
const SECRET = process.env.BETTER_AUTH_SECRET ?? 'dentalmap-dev'
const signature = (id: string) => createHmac('sha256', SECRET).update(`alerte-formation:${id}`).digest('base64url').slice(0, 32)
export const jetonDesinscription = (id: string) => `${id}~${signature(id)}`
export function alerteDesinscription(jeton: string): string | null {
  const [id, sig] = decodeURIComponent(jeton).split('~')
  if (!id || !sig) return null
  const attendu = Buffer.from(signature(id)), recu = Buffer.from(sig)
  return attendu.length === recu.length && timingSafeEqual(attendu, recu) ? id : null
}

