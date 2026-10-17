import { redirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'

/** L'entrée de l'onboarding laboratoire : LO0, la fiche gardée. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const { fiche } = await props.searchParams
  redirect(chemin(`/espace-pro/laboratoire/onboarding/recuperation/${fiche ? `?fiche=${encodeURIComponent(fiche)}` : ''}`))
}
