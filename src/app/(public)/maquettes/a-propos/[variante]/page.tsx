/**
 * MAQUETTE, à supprimer une fois la page « Le projet DentalMap » codée : la
 * page À propos retenue (e, contrastée, héros titre et mosaïque), avec la
 * méthode sous l'ancre `#methode` du menu, capturés vers Figma à 1440 et
 * 390 px. Jamais indexée.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PageE } from '../_variante-e'
import { HeroMosaique } from '../_heros-e'

/** `e` : la page retenue, héros titre et mosaïque. */
const VARIANTES: Record<string, () => React.ReactNode> = {
  e: () => <PageE hero={<HeroMosaique />} />,
}

export const metadata: Metadata = { title: 'Maquette À propos', robots: { index: false, follow: false } }

export function generateStaticParams() {
  return Object.keys(VARIANTES).map((variante) => ({ variante }))
}

export default async function Page(props: { params: Promise<{ variante: string }> }) {
  const { variante } = await props.params
  const V = VARIANTES[variante]
  if (!V) notFound()
  return <V />
}
