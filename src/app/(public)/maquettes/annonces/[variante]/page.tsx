/**
 * MAQUETTE, à supprimer une fois les pages Annonces codées : cessions de
 * cabinet en liste (et en carte), détail d'une annonce, et page « Déposer une
 * annonce », capturées vers Figma à 1440 et 390 px. Jamais indexée.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { ListeAnnonces } from '../_liste'
import { PageAnnonce } from '../_annonce'
import { Deposer } from '../_deposer'

/** `transparent` : héros sombre sous l'en-tête, comme l'offre d'emploi. */
const VARIANTES: Record<string, { V: () => React.ReactNode; transparent?: boolean }> = {
  liste: { V: () => <ListeAnnonces /> },
  'liste-carte': { V: () => <ListeAnnonces mode="carte" /> },
  annonce: { V: PageAnnonce, transparent: true },
  deposer: { V: Deposer, transparent: true },
}

export const metadata: Metadata = { title: 'Maquette Annonces', robots: { index: false, follow: false } }

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
