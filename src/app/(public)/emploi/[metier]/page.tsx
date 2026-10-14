import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageMetier } from '@/components/emploi/metier'
import { cheminMetier } from '@/lib/emploi/chemins'
import { METIERS, metierDepuisSlug } from '@/lib/emploi/metiers'

type Params = { metier: string }

/** Les six métiers sont connus : pages construites d'avance. */
export function generateStaticParams() {
  return METIERS.map((m) => ({ metier: m.slug }))
}

/** Bloquante : tout autre segment doit répondre 404, pas un 200 vide. */
export const instant = false

export async function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata> {
  const m = metierDepuisSlug((await props.params).metier)
  if (!m) return { title: 'Métier introuvable' }
  return {
    title: `Offres d’emploi ${m.de} en France`,
    description: `Les offres d’emploi ${m.de} publiées par des recruteurs vérifiés auprès des registres officiels, avec la rémunération affichée. Salaire minimum conventionnel par secteur et offres par département.`,
    alternates: { canonical: cheminMetier(m.slug) },
  }
}

export default async function Page(props: { params: Promise<Params> }) {
  const m = metierDepuisSlug((await props.params).metier)
  if (!m) notFound()
  return <PageMetier metier={m} />
}
