import { timingSafeEqual } from 'node:crypto'

/**
 * La clé qui signe les liens envoyés par email (désinscription d'une alerte,
 * coupure des rappels) : `BETTER_AUTH_SECRET`. Sans elle en production, on
 * s'arrête plutôt que de signer avec une valeur connue de tous, qui rendrait
 * les liens fabricables (audit du 2026-10-26). En développement, une valeur
 * de repli.
 */
export function secretSignature(): string {
  const secret = process.env.BETTER_AUTH_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') throw new Error('BETTER_AUTH_SECRET manquant : impossible de signer les liens.')
  return 'dentalmap-dev'
}

/** Deux secrets comparés en temps constant : la durée ne révèle pas jusqu'où ils concordent. */
export function memeSecret(attendu: string | undefined, recu: string | null | undefined): boolean {
  if (!attendu) return false
  const a = Buffer.from(attendu)
  const b = Buffer.from(recu ?? '')
  return a.length === b.length && timingSafeEqual(a, b)
}
