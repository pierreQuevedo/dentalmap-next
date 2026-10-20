import { redirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'

/** Redirection selon `searchParams` : page bloquante, comme le reste de l'onboarding laboratoire. */
export const instant = false

/** L'entrée de l'onboarding laboratoire : LO0, la fiche gardée. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; demande?: string }> }) {
  const { fiche, demande } = await props.searchParams
  const q = new URLSearchParams({ ...(fiche ? { fiche } : {}), ...(demande ? { demande: '1' } : {}) }).toString()
  redirect(chemin(`/espace-pro/laboratoire/onboarding/recuperation/${q ? `?${q}` : ''}`))
}
