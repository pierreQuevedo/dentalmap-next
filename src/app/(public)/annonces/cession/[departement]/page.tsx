import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ListeAnnonces } from '@/components/cessions/liste'
import { getDepartement, getEmpriseDepartement } from '@/lib/annuaire/queries'
import { Balisage, filAriane } from '@/lib/seo/jsonld'
import { filtrerAnnonces, lireFiltres, lireVue, type ParametresListe } from '@/lib/cessions/format'
import { getAnnoncesDepartement, getDepartementsCession } from '@/lib/cessions/queries'
import { LISTE_CESSIONS, cheminDepartementCession } from '@/lib/cessions/routes'

type Params = Promise<{ departement: string }>
type Recherche = Promise<ParametresListe>

/** Bloquante : un département inconnu doit renvoyer 404, et les filtres viennent de l'URL. */
export const instant = false

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { departement } = await props.params
  const d = await getDepartement(departement)
  if (!d) return { title: 'Département introuvable' }
  const { annonces } = await getAnnoncesDepartement(d.code)
  const base = cheminDepartementCession(d.slug)
  const titre = `Cessions de cabinet dentaire en ${d.nom} (${d.code})`
  return {
    title: titre,
    description: annonces.length
      ? `${annonces.length} annonce${annonces.length > 1 ? 's' : ''} de cession en ${d.nom} : cabinets, parts de société, patientèles et locaux, publiées par des praticiens vérifiés.`
      : `Aucune annonce de cession de cabinet en ${d.nom} pour le moment. Créez une alerte pour être prévenu(e) de la prochaine.`,
    alternates: { canonical: base },
    openGraph: { title: titre, url: base, type: 'website' },
    // Une liste vide n'entre pas dans l'index, mais ses liens restent suivis.
    robots: annonces.length ? undefined : { index: false, follow: true },
  }
}

export default async function Page(props: { params: Params; searchParams: Recherche }) {
  const { departement } = await props.params
  const d = await getDepartement(departement)
  if (!d) notFound()
  const p = await props.searchParams
  const filtres = lireFiltres(p)
  const [{ annonces: toutes }, departements, emprise] = await Promise.all([getAnnoncesDepartement(d.code), getDepartementsCession(), getEmpriseDepartement(d.code)])
  const ariane = [{ libelle: 'Accueil', href: '/' }, { libelle: 'Cessions de cabinet', href: LISTE_CESSIONS }, { libelle: d.nom }]
  return (
    <>
      <Balisage
        donnees={filAriane([
          { nom: 'Accueil', chemin: '/' },
          { nom: 'Cessions de cabinet', chemin: LISTE_CESSIONS },
          { nom: d.nom, chemin: cheminDepartementCession(d.slug) },
        ])}
      />
      <ListeAnnonces
        mode={lireVue(p)}
        titre={`Cessions de cabinet en ${d.nom}`}
        ariane={ariane}
        annonces={filtrerAnnonces(toutes, filtres)}
        toutes={toutes}
        filtres={filtres}
        departements={departements}
        departement={{ code: d.code, nom: d.nom, slug: d.slug }}
        emprise={emprise}
      />
    </>
  )
}
