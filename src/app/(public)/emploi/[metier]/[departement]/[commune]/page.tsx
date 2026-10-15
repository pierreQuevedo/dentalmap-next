import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageCommuneEmploi } from '@/components/emploi/liste'
import { getCommune } from '@/lib/annuaire/queries'
import { cheminCommune } from '@/lib/emploi/chemins'
import { estFiltree, lireFiltres, type RechercheEmploi } from '@/lib/emploi/filtres'
import { metierDepuisSlug, robotsListe } from '@/lib/emploi/metiers'
import { getOffresCommune } from '@/lib/emploi/queries'

type Params = { metier: string; departement: string; commune: string }

/** Bloquante : une commune inconnue doit renvoyer 404, pas un 200 vide. */
export const instant = false

/**
 * Une commune sans offre reste servie en 200, avec les offres voisines, mais
 * en `noindex, follow`. Une page filtrée n'est pas indexée non plus ; la vue
 * carte non plus, sa canonique est la vue liste.
 */
export async function generateMetadata(props: { params: Promise<Params>; searchParams: Promise<RechercheEmploi> }): Promise<Metadata> {
  const { metier, departement, commune } = await props.params
  const m = metierDepuisSlug(metier)
  const c = m ? await getCommune(departement, commune) : null
  if (!m || !c) return { title: 'Page introuvable' }
  const f = lireFiltres(await props.searchParams)
  const total = (await getOffresCommune(m.code, c.codeInsee)).length
  const lieu = `${c.nom}${c.departementNom !== c.nom ? ` (${c.departementNom})` : ''}`
  return {
    title: total ? `Offres ${m.de} à ${lieu}` : `Aucune offre ${m.de} à ${c.nom}`,
    description: total
      ? `${total} offre${total > 1 ? 's' : ''} ${m.de} à ${c.nom}, publiée${total > 1 ? 's' : ''} par des recruteurs vérifiés. La rémunération est affichée sur chaque offre.`
      : `Aucune offre ${m.de} à ${c.nom} pour le moment. Les offres les plus proches, et une alerte pour être prévenu(e).`,
    alternates: { canonical: cheminCommune(m.slug, c.departementSlug, c.slug) },
    robots: robotsListe(total, estFiltree(f) || f.vue === 'carte'),
  }
}

export default async function Page(props: { params: Promise<Params>; searchParams: Promise<RechercheEmploi> }) {
  const { metier, departement, commune } = await props.params
  const m = metierDepuisSlug(metier)
  if (!m) notFound()
  const c = await getCommune(departement, commune)
  if (!c) notFound()
  const f = lireFiltres(await props.searchParams)
  return <PageCommuneEmploi m={m} c={c} f={f} />
}
