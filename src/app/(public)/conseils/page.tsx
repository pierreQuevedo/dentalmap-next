import Link from 'next/link'
import { FilAriane } from '@/components/annuaire/primitives'
import { CarteConseil, LIBELLE_CATEGORIE } from '@/components/conseils/primitives'
import { chemin, CONSEIL_CATEGORIES } from '@/lib/navigation'
import { getConseils } from '@/lib/wp/queries'

export const instant = false

export const metadata = {
  title: 'Conseils et ressources',
  description:
    'Articles pour les patients, les praticiens et les prothésistes, écrits à partir des règles et des registres officiels.',
}

export default async function IndexConseils() {
  const conseils = await getConseils()

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 md:px-10">
      <FilAriane segments={[{ libelle: 'Accueil', href: '/' }, { libelle: 'Conseils' }]} />

      <header className="mt-5">
        <h1 className="text-fg">Conseils et ressources</h1>
        <p className="mt-3 max-w-2xl text-fg-2">
          Ce que les registres ne disent pas : comment vérifier une inscription, ce que recouvre un
          secteur de conventionnement, ce qu’un laboratoire doit pouvoir justifier.
        </p>
      </header>

      <nav aria-label="Rubriques" className="mt-6 flex flex-wrap gap-2">
        {CONSEIL_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={chemin(`/conseils/${c}/`)}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fg hover:bg-bg-soft"
          >
            {LIBELLE_CATEGORIE[c]}
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        {conseils.length > 0 ? (
          conseils.map((c) => <CarteConseil key={c.slug} conseil={c} />)
        ) : (
          <p className="rounded-lg border border-line bg-bg-soft p-4 text-sm text-fg-2">
            Aucun article publié pour le moment.
          </p>
        )}
      </div>
    </main>
  )
}
