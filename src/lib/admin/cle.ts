import { timingSafeEqual } from 'node:crypto'

/**
 * Les routes /api/admin/ ne servent qu'au back-office WordPress
 * (cms.dentalmap.fr). Elles s'authentifient par la clé partagée `DM_API_KEY`,
 * envoyée dans l'en-tête `x-dentalmap-admin`, la même que la constante du
 * wp-config.
 */
export function cleAdminValide(requete: Request): boolean {
  const cle = process.env.DM_API_KEY
  if (!cle) return false
  const a = Buffer.from(cle)
  const b = Buffer.from(requete.headers.get('x-dentalmap-admin') ?? '')
  return a.length === b.length && timingSafeEqual(a, b)
}

export function refusAdmin(): Response {
  return Response.json({ ok: false }, { status: 401 })
}
