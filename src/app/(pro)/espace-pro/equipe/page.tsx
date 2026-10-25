import { redirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'

/** L'équipe est fermée (voir `EQUIPE_OUVERTE`) : l'ancienne adresse mène à la vue d'ensemble. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const { fiche } = await props.searchParams
  redirect(chemin(`/espace-pro/${fiche ? `?fiche=${encodeURIComponent(fiche)}` : ''}`))
}
