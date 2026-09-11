import Link from 'next/link'
import type { Metadata } from 'next'
import { getDepartementsAvecPraticiens, getTotalProfession } from '@/lib/annuaire/queries'
import { BASE_URL, type Profession } from '@/lib/annuaire/types'
import { chemin, FilAriane } from './primitives'

const LIBELLE: Record<Profession, { singulier: string; pluriel: string; registre: string }> = {
  dentiste: {
    singulier: 'chirurgien-dentiste',
    pluriel: 'chirurgiens-dentistes',
    registre: 'du répertoire partagé des professionnels de santé',
  },
  prothesiste: {
    singulier: 'laboratoire de prothèse dentaire',
    pluriel: 'laboratoires de prothèse dentaire',
    registre: 'de la base Sirene de l’INSEE',
  },
}

export async function metadonneesIndex(profession: Profession): Promise<Metadata> {
  const { total, communes } = await getTotalProfession(profession)
  const l = LIBELLE[profession]
  return {
    title: `${l.pluriel.charAt(0).toUpperCase()}${l.pluriel.slice(1)} en France`,
    description: `${total.toLocaleString('fr-FR')} ${l.pluriel} recensés dans ${communes.toLocaleString('fr-FR')} communes, à partir ${l.registre}. Recherche par département et par commune.`,
    alternates: { canonical: `/${BASE_URL[profession]}/` },
  }
}

export async function PageIndexProfession({ profession }: { profession: Profession }) {
  const base = BASE_URL[profession]
  const l = LIBELLE[profession]
  const { total, communes } = await getTotalProfession(profession)
  const departements = await getDepartementsAvecPraticiens(profession)

  // Regroupement par région : 109 départements en liste plate seraient illisibles.
  const parRegion = new Map<string, typeof departements>()
  for (const d of departements) {
    const liste = parRegion.get(d.regionNom) ?? []
    liste.push(d)
    parRegion.set(d.regionNom, liste)
  }

  return (
    <>
      <FilAriane segments={[{ libelle: 'Accueil', href: '/' }, { libelle: l.pluriel.charAt(0).toUpperCase() + l.pluriel.slice(1) }]} />

      <header className="mt-5">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {l.pluriel.charAt(0).toUpperCase()}
          {l.pluriel.slice(1)} en France
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          {total.toLocaleString('fr-FR')} professionnels recensés dans {communes.toLocaleString('fr-FR')} communes, à
          partir {l.registre}. Les informations ne sont pas déclaratives : elles proviennent de registres publics et
          sont rapprochées chaque semaine.
        </p>
      </header>

      {[...parRegion.entries()].map(([region, liste]) => (
        <section key={region} className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{region}</h2>
          <ul className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {liste.map((d) => (
              <li key={d.slug} className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2">
                <Link href={chemin(`/${base}/${d.slug}/`)} className="text-slate-900 hover:underline">
                  {d.nom}
                </Link>
                <span className="text-sm tabular-nums text-slate-500">{d.total.toLocaleString('fr-FR')}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
