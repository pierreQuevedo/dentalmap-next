import type { Metadata } from 'next'
import { CarteDepartements } from '@/components/map/carte-departements'
import { BarreRecherche } from '@/components/recherche/barre-recherche'
import { GrilleRecherche } from '@/components/recherche/mise-en-page'
import { LIBELLE, compte, majuscule } from '@/lib/annuaire/libelles'
import { getDepartementsAvecPraticiens, getTotalProfession } from '@/lib/annuaire/queries'
import { BASE_URL, type Profession } from '@/lib/annuaire/types'
import { Balisage, filAriane } from '@/lib/seo/jsonld'
import { ListeDepartementsParRegion } from './index-profession'
import { FilAriane } from './primitives'

export async function metadonneesParDepartement(profession: Profession): Promise<Metadata> {
  const l = LIBELLE[profession]
  const { total } = await getTotalProfession(profession)
  return {
    title: `${majuscule(l.pluriel)} par département`,
    description: `Carte de France des ${l.pluriel} par département : ${compte(profession, total)} recensés à partir ${l.registre}. Survolez un département pour son effectif, cliquez pour sa page.`,
    alternates: { canonical: `/${BASE_URL[profession]}/par-departement/` },
  }
}

/**
 * La carte de France par département : mêmes colonnes que la recherche,
 * mais la carte dessine les départements en zones au lieu des praticiens en
 * points, et la colonne de gauche liste les départements par région.
 */
export async function PageParDepartement({ profession }: { profession: Profession }) {
  const base = BASE_URL[profession]
  const l = LIBELLE[profession]
  const [{ total }, departements] = await Promise.all([getTotalProfession(profession), getDepartementsAvecPraticiens(profession)])
  const pluriel = majuscule(l.pluriel)
  const segments = [
    { nom: 'Accueil', chemin: '/' },
    { nom: pluriel, chemin: `/${base}/` },
    { nom: 'Par département', chemin: `/${base}/par-departement/` },
  ]

  return (
    <>
      <Balisage donnees={filAriane(segments)} />
      <GrilleRecherche
        enTete={
          <>
            <FilAriane segments={segments.map((s, i) => (i < segments.length - 1 ? { libelle: s.nom, href: s.chemin } : { libelle: s.nom }))} />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-fg md:text-3xl">{pluriel} par département</h1>
            <p className="mt-2 text-fg-2">
              {compte(profession, total)} recensés à partir {l.registre}. Survolez un département sur la carte pour voir son
              effectif, cliquez pour ouvrir sa page. Les départements d&apos;outre-mer sont dans la liste.
            </p>
          </>
        }
        carte={<CarteDepartements base={base} comptes={departements.map((d) => ({ code: d.code, nom: d.nom, slug: d.slug, total: d.total }))} />}
        contenu={<ListeDepartementsParRegion base={base} departements={departements} />}
        barre={<BarreRecherche base={base} valeurLieu="" />}
      />
    </>
  )
}
