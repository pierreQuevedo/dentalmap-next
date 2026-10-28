import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageDepartementEmploi } from '@/components/emploi/liste'
import { getDepartement } from '@/lib/annuaire/queries'
import { cheminDepartement } from '@/lib/emploi/chemins'
import { metierDepuisSlug, robotsListe } from '@/lib/emploi/metiers'
import { PAR_PAGE_EMPLOI, getOffresDepartement } from '@/lib/emploi/queries'
import { enDepartement } from '@/lib/annuaire/libelles'

type Params = { metier: string; departement: string }
type Recherche = { page?: string }

/** Bloquante : un département inconnu doit renvoyer 404, pas un 200 vide. */
export const instant = false

function numeroPage(v: string | undefined): number {
  const n = Number(v)
  return Number.isInteger(n) && n > 1 ? n : 1
}

export async function generateMetadata(props: { params: Promise<Params>; searchParams: Promise<Recherche> }): Promise<Metadata> {
  const { metier, departement } = await props.params
  const m = metierDepuisSlug(metier)
  const d = m ? await getDepartement(departement) : null
  if (!m || !d) return { title: 'Page introuvable' }
  const page = numeroPage((await props.searchParams).page)
  const { total } = await getOffresDepartement(d.code, { metier: m.code }, page)
  const base = cheminDepartement(m.slug, d.slug)
  return {
    title: total ? `Offres ${m.de} ${enDepartement(d.nom)}${page > 1 ? `, page ${page}` : ''}` : `Emploi ${m.de} ${enDepartement(d.nom)}`,
    description: total
      ? `${total} offre${total > 1 ? 's' : ''} ${m.de} ${enDepartement(d.nom)}, publiée${total > 1 ? 's' : ''} par des recruteurs vérifiés, avec la rémunération affichée.`
      : `Aucune offre ${m.de} ${enDepartement(d.nom)} pour le moment. Créez une alerte pour être prévenu(e) des prochaines.`,
    alternates: { canonical: page > 1 ? `${base}?page=${page}` : base },
    robots: robotsListe(total),
  }
}

export default async function Page(props: { params: Promise<Params>; searchParams: Promise<Recherche> }) {
  const { metier, departement } = await props.params
  const m = metierDepuisSlug(metier)
  if (!m) notFound()
  const d = await getDepartement(departement)
  if (!d) notFound()
  const page = numeroPage((await props.searchParams).page)
  if (page > 1) {
    const { total } = await getOffresDepartement(d.code, { metier: m.code }, page)
    if (page > Math.max(1, Math.ceil(total / PAR_PAGE_EMPLOI))) notFound()
  }
  return <PageDepartementEmploi m={m} d={d} page={page} />
}
