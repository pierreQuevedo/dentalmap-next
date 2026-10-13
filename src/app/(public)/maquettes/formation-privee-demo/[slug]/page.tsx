/** Démonstration de la fiche d'une formation privée (voir `../_donnees.ts`). Jamais indexée. */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { FicheFormationPrivee } from '@/components/formation/fiche-formation-privee'
import { autresFormationsPrivees } from '@/lib/formation/privee-liste'
import { BASE_DEMO, getVuesDemo } from '../_donnees'

export const metadata: Metadata = { title: 'Démonstration Formation privée', robots: { index: false, follow: false } }

/** Bloquante : une adresse inconnue renvoie 404. */
export const instant = false

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const [{ slug }, vues] = await Promise.all([props.params, getVuesDemo()])
  const vue = vues.find((v) => v.slug === slug)
  if (!vue) notFound()
  return (
    <>
      <HeaderTransparent />
      <FicheFormationPrivee f={vue} autres={autresFormationsPrivees(vues, vue)} base={BASE_DEMO} />
    </>
  )
}
