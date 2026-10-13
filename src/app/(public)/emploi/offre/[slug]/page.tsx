import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { PageOffre } from '@/components/emploi/offre'
import { cheminOffre } from '@/lib/emploi/chemins'
import { offreJobPosting } from '@/lib/emploi/jsonld'
import { decouperDescription, remuneration } from '@/lib/emploi/format'
import { getOffre, getOffresProches } from '@/lib/emploi/queries'
import { Balisage } from '@/lib/seo/jsonld'

type Params = { slug: string }

/**
 * Bloquante : une offre inconnue, ou qui n'est plus en ligne (pourvue,
 * expirée, retirée), répond 404. Un 410 demanderait de passer par le proxy,
 * comme les fiches retirées : à envisager si le volume d'offres closes
 * indexées le justifie.
 */
export const instant = false

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const o = await getOffre((await props.params).slug)
  if (!o || !o.visible) return { title: 'Offre introuvable', robots: { index: false, follow: true } }
  const r = remuneration(o)
  return {
    title: `${o.titre} à ${o.commune}, ${o.recruteur}`,
    description: `${r.principal} ${r.detail}. ${decouperDescription(o.description).resume}`.slice(0, 300),
    alternates: { canonical: cheminOffre(o.slug) },
  }
}

export default async function Page(props: { params: Promise<Params> }) {
  const { slug } = await props.params
  const o = await getOffre(slug)
  if (!o || !o.visible) notFound()
  const proches = await getOffresProches(slug, 3)
  return (
    <>
      <Balisage donnees={offreJobPosting(o)} />
      <HeaderTransparent />
      <PageOffre o={o} proches={proches} />
    </>
  )
}
