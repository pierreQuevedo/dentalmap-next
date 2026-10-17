/**
 * MAQUETTE, à supprimer une fois les fiches codées : fiches dentiste,
 * laboratoire et établissement, capturées vers Figma. Jamais indexée.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { FicheDentiste } from '../_fiche-dentiste'
import { FicheLabo } from '../_fiche-labo'
import { FicheEtablissement } from '../_fiche-etablissement'
import { FicheFaculte } from '../_fiche-faculte'
import { OFFRES_DENTISTE, OFFRES_LABO } from '../_recrute'

export const metadata: Metadata = { title: 'Maquette', robots: { index: false, follow: false } }

/** `*-recrute` : la même fiche, avec la pastille « Recrute » et la section d'offres. */
const VARIANTES: Record<string, () => React.ReactNode> = {
  dentiste: () => <FicheDentiste />,
  labo: () => <FicheLabo />,
  etablissement: FicheEtablissement,
  faculte: FicheFaculte,
  'dentiste-recrute': () => <FicheDentiste recrute={OFFRES_DENTISTE} />,
  'labo-recrute': () => <FicheLabo recrute={OFFRES_LABO} />,
}

export function generateStaticParams() {
  return Object.keys(VARIANTES).map((variante) => ({ variante }))
}

export default async function Page(props: { params: Promise<{ variante: string }> }) {
  const { variante } = await props.params
  const V = VARIANTES[variante]
  if (!V) notFound()
  return (
    <>
      <HeaderTransparent />
      <V />
    </>
  )
}
