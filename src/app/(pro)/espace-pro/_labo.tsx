import { redirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'
import { chargerTableau, type Tableau } from './_commun'
import type { CleNav } from '@/components/espace/coque'

/** Les pages propres au laboratoire : un soignant qui s'y égare revient à sa vue d'ensemble. */
export async function chargerLabo(page: CleNav, slug?: string): Promise<Tableau> {
  const t = await chargerTableau(page, slug)
  if (!t.espace.labo) redirect(chemin(`/espace-pro/${t.q}`))
  return t
}

/** Les champs cachés communs aux formulaires du tableau de bord. */
export function Caches({ t, page }: { t: Tableau; page: string }) {
  const ici = `/espace-pro/${page}/${t.q}`
  return (
    <>
      <input type="hidden" name="fiche" value={t.espace.fiche.slug} />
      <input type="hidden" name="avant" value={t.espace.force.total} />
      <input type="hidden" name="suite" value={ici} />
      <input type="hidden" name="ici" value={ici} />
    </>
  )
}
