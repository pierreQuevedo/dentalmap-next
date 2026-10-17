/**
 * MAQUETTE, à supprimer une fois la page « Devenir partenaire » codée : la
 * variante B retenue, orientée formulaire, capturée vers Figma à
 * 1440 et 390 px. Jamais indexée.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { VarianteB } from '../_variante-b'

const VARIANTES: Record<string, () => React.ReactNode> = { b: VarianteB }

export const metadata: Metadata = { title: 'Maquette Partenaires', robots: { index: false, follow: false } }

export function generateStaticParams() {
  return Object.keys(VARIANTES).map((variante) => ({ variante }))
}

export default async function Page(props: { params: Promise<{ variante: string }> }) {
  const { variante } = await props.params
  const V = VARIANTES[variante]
  if (!V) notFound()
  return <V />
}
