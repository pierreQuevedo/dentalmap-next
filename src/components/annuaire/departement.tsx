import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCommunesDuDepartement, getDepartement } from '@/lib/annuaire/queries'
import { BASE_URL, type Profession } from '@/lib/annuaire/types'
import { chemin, FilAriane } from './primitives'

type Params = { departement: string }

const LIBELLE: Record<Profession, { singulier: string; pluriel: string }> = {
  dentiste: { singulier: 'chirurgien-dentiste', pluriel: 'chirurgiens-dentistes' },
  prothesiste: { singulier: 'laboratoire de prothèse dentaire', pluriel: 'laboratoires de prothèse dentaire' },
}

export async function metadonneesDepartement(profession: Profession, params: Params): Promise<Metadata> {
  const d = await getDepartement(params.departement)
  if (!d) return { title: 'Département introuvable' }
  const communes = await getCommunesDuDepartement(profession, d.code)
  const total = communes.reduce((n, c) => n + c.total, 0)
  const l = LIBELLE[profession]
  return {
    title: `${l.pluriel.charAt(0).toUpperCase()}${l.pluriel.slice(1)} en ${d.nom}`,
    description: `${total.toLocaleString('fr-FR')} ${total > 1 ? l.pluriel : l.singulier} recensés en ${d.nom}, répartis sur ${communes.length} communes. Informations vérifiées auprès des registres officiels.`,
    alternates: { canonical: `/${BASE_URL[profession]}/${params.departement}/` },
    robots: total > 0 ? undefined : { index: false, follow: true },
  }
}

export async function PageDepartement({
  profession,
  params,
}: {
  profession: Profession
  params: Promise<Params>
}) {
  const { departement } = await params
  const d = await getDepartement(departement)
  if (!d) notFound()

  const base = BASE_URL[profession]
  const l = LIBELLE[profession]
  const communes = await getCommunesDuDepartement(profession, d.code)
  const total = communes.reduce((n, c) => n + c.total, 0)
  // Les communes les plus dotées d'abord, puis le reste par ordre alphabétique :
  // une liste de 890 communes triée uniquement par effectif serait illisible.
  const principales = communes.slice(0, 12)
  const autres = [...communes.slice(12)].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))

  return (
    <>
      <FilAriane
        segments={[
          { libelle: 'Accueil', href: '/' },
          { libelle: `${l.pluriel.charAt(0).toUpperCase()}${l.pluriel.slice(1)}`, href: `/${base}/` },
          { libelle: d.nom },
        ]}
      />

      <header className="mt-5">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {l.pluriel.charAt(0).toUpperCase()}
          {l.pluriel.slice(1)} en {d.nom}
        </h1>
        <p className="mt-2 text-slate-600">
          {total.toLocaleString('fr-FR')} {total > 1 ? l.pluriel : l.singulier} dans{' '}
          {communes.length.toLocaleString('fr-FR')}{' '}
          {communes.length > 1 ? 'communes' : 'commune'}. Région {d.regionNom}.
        </p>
      </header>

      {principales.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Communes principales</h2>
          <ul className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {principales.map((c) => (
              <li key={c.slug} className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2">
                <Link href={chemin(`/${base}/${d.slug}/${c.slug}/`)} className="text-slate-900 hover:underline">
                  {c.nom}
                </Link>
                <span className="text-sm tabular-nums text-slate-500">{c.total}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {autres.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Toutes les autres communes
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {autres.map((c) => (
              <li key={c.slug}>
                <Link href={chemin(`/${base}/${d.slug}/${c.slug}/`)} className="text-slate-700 hover:underline">
                  {c.nom}
                </Link>
                <span className="ml-1 text-slate-400 tabular-nums">{c.total}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {communes.length === 0 && (
        <p className="mt-8 text-slate-600">
          Aucun {l.singulier} n&apos;est recensé dans ce département.
        </p>
      )}
    </>
  )
}
