/**
 * MAQUETTE, brouillon à faire relire par un juriste : mentions légales,
 * conditions d'utilisation et politique de confidentialité, capturées vers
 * Figma à 1440 et 390 px. Jamais indexée. Pas de page cookies : le site ne
 * dépose aucun cookie non essentiel, la section est dans la confidentialité.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PAGES, trouverPage } from '../_contenu'
import { PageLegaleVue } from '../_gabarit'

export const metadata: Metadata = { title: 'Maquette Légal', robots: { index: false, follow: false } }

export function generateStaticParams() {
  return PAGES.map((p) => ({ page: p.slug }))
}

export default async function Page(props: { params: Promise<{ page: string }> }) {
  const { page } = await props.params
  const p = trouverPage(page)
  if (!p) notFound()
  return <PageLegaleVue page={p} />
}
