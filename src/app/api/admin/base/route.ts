import { cleAdminValide, refusAdmin } from '@/lib/admin/cle'
import { listerBase, type Vue } from '@/lib/admin/base-pros'

const VUES: Vue[] = ['tous', 'revendiques', 'comptes', 'contacts']

/**
 * La liste de la rubrique « Base pros » de wp-admin : comptes de l'espace pro
 * et contacts saisis par l'équipe. `tout=1` renvoie toutes les lignes
 * filtrées, sans pagination, pour l'export CSV.
 */
export async function GET(requete: Request) {
  if (!cleAdminValide(requete)) return refusAdmin()
  const p = new URL(requete.url).searchParams
  const vue = VUES.find((v) => v === p.get('vue')) ?? 'tous'
  const resultat = await listerBase({
    q: (p.get('q') ?? '').slice(0, 100),
    vue,
    profession: p.get('profession') || undefined,
    page: Number(p.get('page')) || 1,
    tout: p.get('tout') === '1',
  })
  return Response.json({ ok: true, ...resultat })
}
