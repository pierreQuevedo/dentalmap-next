/**
 * MAQUETTE, à supprimer une fois les pages Emploi codées : accueil, offres,
 * recherche, métier, département, alternance, remplacements et recrutement,
 * capturés vers Figma. Jamais indexée.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { Accueil } from '../_accueil'
import { OffreAssistant, OffreRemplacement } from '../_offre'
import { Departement, Liste, ListeCarte, ListeVide } from '../_liste'
import { Metier } from '../_metier'
import { Alternance } from '../_alternance'
import { Remplacements } from '../_remplacements'
import { Recruter } from '../_recruter'

/** `transparent` : l'en-tête du site passe en blanc sur le héros sombre, comme sur l'accueil. */
const VARIANTES: Record<string, { V: () => React.ReactNode; transparent?: boolean }> = {
  accueil: { V: Accueil },
  offre: { V: OffreAssistant, transparent: true },
  'offre-remplacement': { V: OffreRemplacement, transparent: true },
  liste: { V: Liste },
  'liste-carte': { V: ListeCarte },
  'liste-vide': { V: ListeVide },
  metier: { V: Metier },
  departement: { V: Departement },
  alternance: { V: Alternance },
  remplacements: { V: Remplacements },
  recruter: { V: Recruter },
}

export function generateStaticParams() {
  return Object.keys(VARIANTES).map((variante) => ({ variante }))
}

/**
 * Toutes les maquettes sont hors index. La commune sans offre porte la règle
 * retenue pour la vraie page : `noindex, follow`, comme les pages commune
 * vides de l'annuaire.
 */
export async function generateMetadata(props: { params: Promise<{ variante: string }> }): Promise<Metadata> {
  const { variante } = await props.params
  return {
    title: 'Maquette Emploi',
    robots: variante === 'liste-vide' ? { index: false, follow: true } : { index: false, follow: false },
  }
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
