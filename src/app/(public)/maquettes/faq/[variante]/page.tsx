/**
 * MAQUETTE, à supprimer une fois la page FAQ codée : la version textuelle de
 * `/faq`, retenue le 12 octobre 2026, capturée vers Figma à 1440 et 390 px.
 * Jamais indexée. Elle produit le JSON-LD `FAQPage` de ses questions.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { FaqTextuelle } from '../_textuelle'

const VARIANTES: Record<string, () => React.ReactNode> = {
  textuelle: FaqTextuelle,
}

export const metadata: Metadata = { title: 'Maquette FAQ', robots: { index: false, follow: false } }

export function generateStaticParams() {
  return Object.keys(VARIANTES).map((variante) => ({ variante }))
}

export default async function Page(props: { params: Promise<{ variante: string }> }) {
  const { variante } = await props.params
  const V = VARIANTES[variante]
  if (!V) notFound()
  return <V />
}
