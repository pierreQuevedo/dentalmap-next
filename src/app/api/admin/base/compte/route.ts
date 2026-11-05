import { cleAdminValide, refusAdmin } from '@/lib/admin/cle'
import { getCompte } from '@/lib/admin/base-pros'

/** Un compte de l'espace pro et ses fiches, en lecture seule, pour la fiche détail de « Base pros ». */
export async function GET(requete: Request) {
  if (!cleAdminValide(requete)) return refusAdmin()
  const compte = await getCompte(new URL(requete.url).searchParams.get('id') ?? '')
  return compte ? Response.json({ ok: true, compte }) : Response.json({ ok: false }, { status: 404 })
}
