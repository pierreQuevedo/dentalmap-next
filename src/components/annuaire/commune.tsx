import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getCommune,
  getCommunesVoisinesAvecPraticiens,
  getPraticiensDeCommune,
} from '@/lib/annuaire/queries'
import { BASE_URL, nomAffiche, type Profession } from '@/lib/annuaire/types'
import { Adresse, chemin, FilAriane, Telephone, Verification } from './primitives'

type Params = { departement: string; commune: string }

const LIBELLE: Record<Profession, { singulier: string; pluriel: string }> = {
  dentiste: { singulier: 'chirurgien-dentiste', pluriel: 'chirurgiens-dentistes' },
  prothesiste: { singulier: 'laboratoire de prothèse dentaire', pluriel: 'laboratoires de prothèse dentaire' },
}

export async function metadonneesCommune(profession: Profession, params: Params): Promise<Metadata> {
  const { departement, commune } = await params
  const c = await getCommune(departement, commune)
  if (!c) return { title: 'Commune introuvable' }
  const liste = await getPraticiensDeCommune(profession, c.codeInsee)
  const l = LIBELLE[profession]
  const titre = liste.length
    ? `${l.pluriel.charAt(0).toUpperCase()}${l.pluriel.slice(1)} à ${c.nom} (${c.departementNom})`
    : `Aucun ${l.singulier} à ${c.nom}`

  return {
    title: titre,
    description: liste.length
      ? `${liste.length} ${liste.length > 1 ? l.pluriel : l.singulier} à ${c.nom}. Adresses, téléphones et informations vérifiées auprès des registres officiels.`
      : `Aucun ${l.singulier} recensé à ${c.nom}. Consultez les communes voisines.`,
    alternates: { canonical: `/${BASE_URL[profession]}/${departement}/${commune}/` },
    // Une archive vide ne doit pas entrer dans l'index : elle n'apporte rien et
    // dilue la qualité perçue du site. Elle reste servie en 200 avec une
    // orientation vers les communes voisines, comportement de l'ancien site.
    robots: liste.length ? undefined : { index: false, follow: true },
  }
}

export async function PageCommune({ profession, params }: { profession: Profession; params: Promise<Params> }) {
  const { departement, commune } = await params
  const c = await getCommune(departement, commune)
  if (!c) notFound()

  const base = BASE_URL[profession]
  const l = LIBELLE[profession]
  const liste = await getPraticiensDeCommune(profession, c.codeInsee)

  return (
    <>
      <FilAriane
        segments={[
          { libelle: 'Accueil', href: '/' },
          { libelle: `${l.pluriel.charAt(0).toUpperCase()}${l.pluriel.slice(1)}`, href: `/${base}/` },
          { libelle: c.departementNom, href: `/${base}/${departement}/` },
          { libelle: c.nom },
        ]}
      />

      <header className="mt-5">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {liste.length > 0
            ? `${l.pluriel.charAt(0).toUpperCase()}${l.pluriel.slice(1)} à ${c.nom}`
            : `Aucun ${l.singulier} à ${c.nom}`}
        </h1>
        <p className="mt-2 text-slate-600">
          {liste.length > 0 ? (
            <>
              {liste.length} {liste.length > 1 ? l.pluriel : l.singulier} recensés, classés par ordre alphabétique.
            </>
          ) : (
            <>Aucun professionnel de cette catégorie n&apos;est recensé sur cette commune.</>
          )}
        </p>
      </header>

      {liste.length > 0 ? (
        <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
          {liste.map((p) => (
            <li key={p.slug} className="py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-lg font-medium">
                  <Link
                    href={chemin(`/${base}/${p.departementSlug}/${p.communeSlug}/${p.slug}/`)}
                    className="text-slate-900 hover:underline"
                  >
                    {nomAffiche({ profession, nom: p.nom, prenom: p.prenom, raisonSociale: p.raisonSociale })}
                  </Link>
                </h2>
                <Verification statut={p.statutVerification} />
              </div>
              <div className="mt-2 text-sm">
                <Adresse ligne={p.adresseLigne} codePostal={p.codePostal} commune={p.communeNom} />
                {p.telephone && (
                  <p className="mt-1">
                    <Telephone numero={p.telephone} />
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <CommunesVoisines profession={profession} codeInsee={c.codeInsee} nomCommune={c.nom} />
      )}

      <p className="mt-8 text-sm text-slate-600">
        Le classement est alphabétique. Aucune mise en avant payante n&apos;existe sur DentalMap.{' '}
        <Link href={chemin('/methode-de-verification/')} className="underline hover:text-slate-900">
          Méthode de vérification et de classement
        </Link>
        .
      </p>
    </>
  )
}

async function CommunesVoisines({
  profession,
  codeInsee,
  nomCommune,
}: {
  profession: Profession
  codeInsee: string
  nomCommune: string
}) {
  const voisines = await getCommunesVoisinesAvecPraticiens(profession, codeInsee)
  const base = BASE_URL[profession]
  if (voisines.length === 0) return null
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Les plus proches de {nomCommune}
      </h2>
      <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
        {voisines.map((v) => (
          <li key={`${v.departementSlug}/${v.slug}`} className="flex items-baseline justify-between gap-4 py-3">
            <Link
              href={chemin(`/${base}/${v.departementSlug}/${v.slug}/`)}
              className="text-slate-900 hover:underline"
            >
              {v.nom}
            </Link>
            <span className="text-sm tabular-nums text-slate-500">
              {v.total} à {v.km.toLocaleString('fr-FR')} km
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
