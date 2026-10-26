import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageRemplacements } from '@/components/emploi/remplacements'
import { getDepartement } from '@/lib/annuaire/queries'
import { cheminRemplacementsDepartement } from '@/lib/emploi/chemins'
import { robotsListe } from '@/lib/emploi/metiers'
import { PAR_PAGE_EMPLOI, getOffresDepartement } from '@/lib/emploi/queries'
import { enDepartement } from '@/lib/annuaire/libelles'

type Params = { departement: string }
type Recherche = { contrat?: string; page?: string }

/** Bloquante : un département inconnu doit renvoyer 404, pas un 200 vide. */
export const instant = false

function lire(sp: Recherche) {
  const n = Number(sp.page)
  return { collaboration: sp.contrat === 'collaboration', page: Number.isInteger(n) && n > 1 ? n : 1 }
}

const filtre = (collaboration: boolean) => ({ metier: 'chirurgien_dentiste' as const, contrats: [collaboration ? ('collaboration' as const) : ('remplacement' as const)] })

export async function generateMetadata(props: { params: Promise<Params>; searchParams: Promise<Recherche> }): Promise<Metadata> {
  const d = await getDepartement((await props.params).departement)
  if (!d) return { title: 'Département introuvable' }
  const { collaboration, page } = lire(await props.searchParams)
  const { total } = await getOffresDepartement(d.code, filtre(collaboration), page)
  return {
    title: `${collaboration ? 'Collaborations' : 'Remplacements'} de chirurgien-dentiste ${enDepartement(d.nom)}`,
    description: `Remplacements et collaborations libérales ${enDepartement(d.nom)}, publiés par des cabinets vérifiés, avec le taux de rétrocession ou de redevance affiché.`,
    alternates: { canonical: cheminRemplacementsDepartement(d.slug) },
    robots: robotsListe(total, collaboration || page > 1),
  }
}

export default async function Page(props: { params: Promise<Params>; searchParams: Promise<Recherche> }) {
  const d = await getDepartement((await props.params).departement)
  if (!d) notFound()
  const { collaboration, page } = lire(await props.searchParams)
  if (page > 1) {
    const { total } = await getOffresDepartement(d.code, filtre(collaboration), page)
    if (page > Math.max(1, Math.ceil(total / PAR_PAGE_EMPLOI))) notFound()
  }
  return <PageRemplacements collaboration={collaboration} departement={d} page={page} />
}
