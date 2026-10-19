import { redirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'

export const instant = false

/** L'entrée de l'onboarding : B0, la fiche gardée. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; demande?: string }> }) {
  const { fiche, demande } = await props.searchParams
  const q = new URLSearchParams({ ...(fiche ? { fiche } : {}), ...(demande ? { demande: '1' } : {}) }).toString()
  redirect(chemin(`/espace-pro/onboarding/recuperation/${q ? `?${q}` : ''}`))
}
