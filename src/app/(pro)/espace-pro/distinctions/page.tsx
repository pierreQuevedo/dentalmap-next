import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'

export const metadata: Metadata = { robots: { index: false, follow: false } }
export const instant = false

/** « Distinctions » est devenue « Progression » : les anciens liens y mènent, la fiche choisie gardée. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const { fiche } = await props.searchParams
  redirect(chemin(`/espace-pro/progression/${fiche ? `?fiche=${encodeURIComponent(fiche)}` : ''}`))
}
