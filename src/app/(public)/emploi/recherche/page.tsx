import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { chercherCommune } from '@/lib/annuaire/queries'
import { chemin } from '@/lib/navigation'
import { EMPLOI, cheminCommune, cheminMetier } from '@/lib/emploi/chemins'
import { estContrat, metierDepuisSlug } from '@/lib/emploi/metiers'

export const metadata: Metadata = { title: 'Recherche d’offres d’emploi', robots: { index: false, follow: false } }

type Recherche = { metier?: string; ville?: string; contrat?: string }

/**
 * Le formulaire de recherche des pages Emploi : il résout la ville saisie
 * (nom ou code postal) et redirige vers la page de la commune pour le métier
 * choisi, le contrat en filtre. Sans ville, ou ville introuvable : la page
 * nationale du métier.
 */
export const instant = false

export default async function Page(props: { searchParams: Promise<Recherche> }) {
  const sp = await props.searchParams
  const m = metierDepuisSlug(sp.metier ?? '')
  if (!m) redirect(chemin(EMPLOI))
  const ville = sp.ville?.trim()
  const c = ville ? await chercherCommune(ville) : null
  if (!c) redirect(chemin(cheminMetier(m.slug)))
  const contrat = sp.contrat && estContrat(sp.contrat) ? `?contrat=${sp.contrat}` : ''
  redirect(chemin(`${cheminCommune(m.slug, c.departementSlug, c.slug)}${contrat}`))
}
