/**
 * MAQUETTE, à supprimer une fois les vraies pages d'erreur codées : 404,
 * fiche retirée (410) et erreur serveur (500), capturées vers Figma à 1440
 * et 390 px. Jamais indexée. La route répond 200 : seul le dessin compte ici.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Page404, Page410, Page500 } from '../_erreurs'

const VARIANTES: Record<string, () => React.ReactNode> = {
  '404': Page404,
  '410': Page410,
  '500': Page500,
}

export const metadata: Metadata = { title: 'Maquette Erreurs', robots: { index: false, follow: false } }

export function generateStaticParams() {
  return Object.keys(VARIANTES).map((variante) => ({ variante }))
}

export default async function Page(props: { params: Promise<{ variante: string }> }) {
  const { variante } = await props.params
  const V = VARIANTES[variante]
  if (!V) notFound()
  return <V />
}
