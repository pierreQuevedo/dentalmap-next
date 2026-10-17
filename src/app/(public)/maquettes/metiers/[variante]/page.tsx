/**
 * MAQUETTE, à supprimer une fois la rubrique ouverte : fiches métier des
 * Ressources, le hub et la fiche, capturés vers Figma à
 * 1440 et 390 px. Jamais indexée.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { FicheMetier, Hub } from '../_pages'
import { FICHES } from '../_donnees'

const VARIANTES: Record<string, { V: () => React.ReactNode; transparent?: boolean }> = {
  hub: { V: Hub },
  'fiche-a': { V: () => <FicheMetier />, transparent: true },
  ...Object.fromEntries(Object.keys(FICHES).map((slug) => [`fiche-${slug}`, { V: () => <FicheMetier slug={slug} />, transparent: true }])),
}

export const metadata: Metadata = { title: 'Maquette Fiches métier', robots: { index: false, follow: false } }

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
