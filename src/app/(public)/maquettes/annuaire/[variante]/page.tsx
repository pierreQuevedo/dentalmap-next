/**
 * MAQUETTE, à supprimer une fois le lien Annuaire et Emploi codé : page
 * commune et recherche avec la pastille « Recrute » et le bloc « Ils recrutent
 * près d’ici », capturées vers Figma. Jamais indexée.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CommuneRecrute, RechercheRecrute } from '../_page'

export const metadata: Metadata = { title: 'Maquette Annuaire', robots: { index: false, follow: false } }

const VARIANTES: Record<string, () => React.ReactNode> = {
  'commune-recrute': CommuneRecrute,
  'recherche-recrute': RechercheRecrute,
}

export function generateStaticParams() {
  return Object.keys(VARIANTES).map((variante) => ({ variante }))
}

export default async function Page(props: { params: Promise<{ variante: string }> }) {
  const { variante } = await props.params
  const V = VARIANTES[variante]
  if (!V) notFound()
  return <V />
}
