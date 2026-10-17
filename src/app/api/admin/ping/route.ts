import { timingSafeEqual } from 'node:crypto'

/**
 * Bouton « Tester la connexion » de Réglages › DentalMap dans le back-office
 * WordPress : vérifie que la clé partagée `DM_API_KEY` est la même des deux
 * côtés. Ne renvoie rien d'autre.
 */
export async function GET(requete: Request) {
  const cle = process.env.DM_API_KEY
  const recue = requete.headers.get('x-dentalmap-admin') ?? ''
  if (!cle) return Response.json({ ok: false, raison: 'cle-absente' }, { status: 503 })

  const a = Buffer.from(cle)
  const b = Buffer.from(recue)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return Response.json({ ok: false }, { status: 401 })
  return Response.json({ ok: true })
}
