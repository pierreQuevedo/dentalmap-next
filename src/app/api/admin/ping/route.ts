import { cleAdminValide, refusAdmin } from '@/lib/admin/cle'

/**
 * Bouton « Tester la connexion » de Réglages › DentalMap dans le back-office
 * WordPress : vérifie que la clé partagée `DM_API_KEY` est la même des deux
 * côtés. Ne renvoie rien d'autre.
 */
export async function GET(requete: Request) {
  if (!process.env.DM_API_KEY) return Response.json({ ok: false, raison: 'cle-absente' }, { status: 503 })
  if (!cleAdminValide(requete)) return refusAdmin()
  return Response.json({ ok: true })
}
