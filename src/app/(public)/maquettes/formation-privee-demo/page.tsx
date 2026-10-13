/** Démonstration de la liste des formations privées (voir `_donnees.ts`). Jamais indexée. */
import type { Metadata } from 'next'
import { ListeFormations } from '@/components/formation/liste-formations'
import { PageFormationsPrivees } from '@/components/formation/liste-formations-privees'
import { BASE_DEMO, getVuesDemo } from './_donnees'

/** Bloquante : la liste dépend de l'URL. */
export const instant = false

export const metadata: Metadata = { title: 'Démonstration Formations privées', robots: { index: false, follow: false } }

export default async function Page(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [vues, recherche] = await Promise.all([getVuesDemo(), props.searchParams])
  // Sans données de démonstration, l'état d'attente de la page publique.
  if (!vues.length) return <ListeFormations type="formations-privees" params={{}} />
  return <PageFormationsPrivees vues={vues} recherche={recherche} base={BASE_DEMO} />
}
