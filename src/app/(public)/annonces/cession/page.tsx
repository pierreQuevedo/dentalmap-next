import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ListeAnnonces } from '@/components/cessions/liste'
import { EMPRISE_FRANCE } from '@/lib/annuaire/emprise'
import { chemin } from '@/lib/navigation'
import { Balisage, filAriane } from '@/lib/seo/jsonld'
import { IMAGE_PARTAGE, OPEN_GRAPH } from '@/lib/seo/site'
import { chaineFiltres, filtrerAnnonces, lireFiltres, lireVue, premier, type ParametresListe } from '@/lib/cessions/format'
import { getAnnoncesFrance, getDepartementsCession } from '@/lib/cessions/queries'
import { LISTE_CESSIONS, cheminDepartementCession } from '@/lib/cessions/routes'

type Recherche = Promise<ParametresListe>

/** Bloquante : les filtres viennent de l'URL. */
export const instant = false

export const metadata: Metadata = {
  title: 'Cessions de cabinet dentaire',
  description: 'Cabinets dentaires, parts de société, patientèles et locaux à reprendre partout en France. Annonces de praticiens vérifiés, relues par l’équipe.',
  // Filtres et vue carte reprennent la même liste : une seule adresse canonique.
  alternates: { canonical: LISTE_CESSIONS },
  openGraph: { ...OPEN_GRAPH, title: 'Cessions de cabinet dentaire', url: LISTE_CESSIONS, images: [IMAGE_PARTAGE] },
}

export default async function Page(props: { searchParams: Recherche }) {
  const p = await props.searchParams
  const filtres = lireFiltres(p)
  // Le formulaire de filtres, sans JavaScript, envoie le département en paramètre : il passe dans le chemin.
  const dep = premier(p.departement)
  if (dep && /^[a-z0-9-]+$/.test(dep)) {
    redirect(chemin(`${cheminDepartementCession(dep)}${chaineFiltres(filtres, { vue: lireVue(p) === 'carte' ? 'carte' : undefined })}`))
  }

  const [toutes, departements] = await Promise.all([getAnnoncesFrance(), getDepartementsCession()])
  const ariane = [{ libelle: 'Accueil', href: '/' }, { libelle: 'Cessions de cabinet' }]
  return (
    <>
      <Balisage donnees={filAriane([{ nom: 'Accueil', chemin: '/' }, { nom: 'Cessions de cabinet', chemin: LISTE_CESSIONS }])} />
      <ListeAnnonces
        mode={lireVue(p)}
        titre="Cessions de cabinet dentaire"
        ariane={ariane}
        annonces={filtrerAnnonces(toutes, filtres)}
        toutes={toutes}
        filtres={filtres}
        departements={departements}
        departement={null}
        emprise={EMPRISE_FRANCE}
      />
    </>
  )
}
