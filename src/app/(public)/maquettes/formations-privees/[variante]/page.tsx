/**
 * MAQUETTE, à supprimer une fois la rubrique ouverte : Formations privées,
 * la liste retenue, la fiche d'une formation et l'état actuel (liste
 * d'attente), capturés vers Figma à 1440 et 390 px. Jamais indexée.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { Liste } from '../_listes'
import { Fiche } from '../_fiche'
import { Attente } from '../_attente'

const VARIANTES: Record<string, { V: () => React.ReactNode; transparent?: boolean }> = {
  liste: { V: Liste },
  fiche: { V: Fiche, transparent: true },
  attente: { V: Attente },
}

export const metadata: Metadata = { title: 'Maquette Formations privées', robots: { index: false, follow: false } }

export function generateStaticParams() {
  return Object.keys(VARIANTES).map((variante) => ({ variante }))
}

export default async function Page(props: { params: Promise<{ variante: string }> }) {
  const { variante } = await props.params
  const v = VARIANTES[variante]
  if (!v) notFound()
  return (
    <>
      {v.transparent && <HeaderTransparent />}
      <v.V />
    </>
  )
}
