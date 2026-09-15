import { notFound } from 'next/navigation'
import { FilAriane } from '@/components/annuaire/primitives'
import { CarteConseil, LIBELLE_CATEGORIE } from '@/components/conseils/primitives'
import { CONSEIL_CATEGORIES, type ConseilCategorie } from '@/lib/navigation'
import { getConseils } from '@/lib/wp/queries'

export const instant = false

const INTRO: Record<ConseilCategorie, string> = {
  patients: 'Choisir un praticien, comprendre un devis, savoir ce qui est remboursé.',
  praticiens: 'Installation, conventionnement, obligations d’affichage et de publicité.',
  prothesistes: 'Traçabilité, marquage CE, sous-traitance et relations avec les cabinets.',
}

/**
 * Le segment est confronté aux rubriques réservées. Les articles vivent un
 * cran plus bas, sous `/conseils/{rubrique}/{slug}`, ce qui évite qu'un slug
 * d'article puisse un jour porter le nom d'une rubrique.
 */
function estCategorie(v: string): v is ConseilCategorie {
  return (CONSEIL_CATEGORIES as readonly string[]).includes(v)
}

type Params = Promise<{ categorie: string }>

export async function generateMetadata(props: { params: Params }) {
  const { categorie } = await props.params
  if (!estCategorie(categorie)) return {}
  return {
    title: `Conseils pour les ${LIBELLE_CATEGORIE[categorie].toLowerCase()}`,
    description: INTRO[categorie],
  }
}

export default async function RubriqueConseils(props: { params: Params }) {
  const { categorie } = await props.params
  if (!estCategorie(categorie)) notFound()

  const conseils = await getConseils(categorie)

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 md:px-10">
      <FilAriane
        segments={[
          { libelle: 'Accueil', href: '/' },
          { libelle: 'Conseils', href: '/conseils' },
          { libelle: LIBELLE_CATEGORIE[categorie] },
        ]}
      />

      <header className="mt-5">
        <h1 className="text-fg">Conseils pour les {LIBELLE_CATEGORIE[categorie].toLowerCase()}</h1>
        <p className="mt-3 max-w-2xl text-fg-2">{INTRO[categorie]}</p>
      </header>

      <div className="mt-6">
        {conseils.length > 0 ? (
          conseils.map((c) => <CarteConseil key={c.slug} conseil={c} />)
        ) : (
          <p className="rounded-lg border border-line bg-bg-soft p-4 text-sm text-fg-2">
            Aucun article publié dans cette rubrique pour le moment.
          </p>
        )}
      </div>
    </main>
  )
}
