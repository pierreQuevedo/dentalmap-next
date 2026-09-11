import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getCommune,
  getCommunesVoisinesAvecPraticiens,
  getPraticiensDeCommune,
} from '@/lib/annuaire/queries'
import { BASE_URL, nomAffiche, type Profession } from '@/lib/annuaire/types'
import { PAR_PAGE } from '@/lib/annuaire/queries'
import { Adresse, chemin, FilAriane, Telephone, Verification } from './primitives'
import { Balisage, filAriane } from '@/lib/seo/jsonld'

type Params = { departement: string; commune: string }
type Recherche = { page?: string }

const LIBELLE: Record<Profession, { singulier: string; pluriel: string }> = {
  dentiste: { singulier: 'chirurgien-dentiste', pluriel: 'chirurgiens-dentistes' },
  prothesiste: { singulier: 'laboratoire de prothèse dentaire', pluriel: 'laboratoires de prothèse dentaire' },
}

export async function metadonneesCommune(
  profession: Profession,
  params: Params,
  recherche: Recherche = {},
): Promise<Metadata> {
  const { departement, commune } = params
  const c = await getCommune(departement, commune)
  if (!c) return { title: 'Commune introuvable' }
  const page = numeroPage(recherche.page)
  const { total } = await getPraticiensDeCommune(profession, c.codeInsee, page)
  const l = LIBELLE[profession]
  const suffixe = page > 1 ? ` — page ${page}` : ''
  const titre = total
    ? `${l.pluriel.charAt(0).toUpperCase()}${l.pluriel.slice(1)} à ${c.nom} (${c.departementNom})${suffixe}`
    : `Aucun ${l.singulier} à ${c.nom}`

  const cheminBase = `/${BASE_URL[profession]}/${departement}/${commune}/`
  return {
    title: titre,
    description: total
      ? `${total} ${total > 1 ? l.pluriel : l.singulier} à ${c.nom}. Adresses, téléphones et informations vérifiées auprès des registres officiels.`
      : `Aucun ${l.singulier} recensé à ${c.nom}. Consultez les communes voisines.`,
    // Chaque page de pagination est canonique d'elle-même : la désigner comme un
    // doublon de la première ferait disparaître de l'index les praticiens qui
    // n'y figurent pas.
    alternates: { canonical: page > 1 ? `${cheminBase}?page=${page}` : cheminBase },
    // Une archive vide ne doit pas entrer dans l'index : elle n'apporte rien et
    // dilue la qualité perçue du site. Elle reste servie en 200 avec une
    // orientation vers les communes voisines, comportement de l'ancien site.
    robots: total ? undefined : { index: false, follow: true },
  }
}

/** Numéro de page valide, 1 par défaut. */
export function numeroPage(valeur: string | undefined): number {
  const n = Number(valeur)
  return Number.isInteger(n) && n > 1 ? n : 1
}

export async function PageCommune({
  profession,
  params,
  searchParams,
}: {
  profession: Profession
  params: Promise<Params>
  searchParams: Promise<Recherche>
}) {
  const { departement, commune } = await params
  const page = numeroPage((await searchParams).page)
  const c = await getCommune(departement, commune)
  if (!c) notFound()

  const base = BASE_URL[profession]
  const l = LIBELLE[profession]
  const { liste, total } = await getPraticiensDeCommune(profession, c.codeInsee, page)
  const pages = Math.max(1, Math.ceil(total / PAR_PAGE))
  const cheminBase = `/${base}/${departement}/${commune}/`
  if (page > pages) notFound()

  return (
    <>
      <Balisage
        donnees={filAriane([
          { nom: 'Accueil', chemin: '/' },
          { nom: `${l.pluriel.charAt(0).toUpperCase()}${l.pluriel.slice(1)}`, chemin: `/${base}/` },
          { nom: c.departementNom, chemin: `/${base}/${departement}/` },
          { nom: c.nom, chemin: `/${base}/${departement}/${commune}/` },
        ])}
      />
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
          {total > 0
            ? `${l.pluriel.charAt(0).toUpperCase()}${l.pluriel.slice(1)} à ${c.nom}`
            : `Aucun ${l.singulier} à ${c.nom}`}
        </h1>
        <p className="mt-2 text-slate-600">
          {total > 0 ? (
            <>
              {total.toLocaleString('fr-FR')} {total > 1 ? l.pluriel : l.singulier} recensés, classés par ordre
              alphabétique{pages > 1 ? ` — page ${page} sur ${pages}` : ''}.
            </>
          ) : (
            <>Aucun professionnel de cette catégorie n&apos;est recensé sur cette commune.</>
          )}
        </p>
      </header>

      {total > 0 ? (
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

      {pages > 1 && <Pagination base={cheminBase} page={page} pages={pages} />}

      <p className="mt-8 text-sm text-slate-600">
        Le classement est alphabétique. Aucune mise en avant payante n&apos;existe sur DentalMap.
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

/**
 * Pagination des listes de commune.
 *
 * Les liens sont de vrais liens, rendus côté serveur : un moteur doit pouvoir
 * atteindre la page 8 de Toulouse sans exécuter de JavaScript.
 */
function Pagination({ base, page, pages }: { base: string; page: number; pages: number }) {
  const lien = (n: number) => (n === 1 ? base : `${base}?page=${n}`)
  const fenetre = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 2,
  )

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center gap-2">
      {page > 1 && (
        <Link href={chemin(lien(page - 1))} rel="prev" className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:border-slate-900">
          Précédent
        </Link>
      )}
      {fenetre.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && fenetre[i - 1] !== n - 1 && <span className="text-slate-400">…</span>}
          {n === page ? (
            <span aria-current="page" className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">
              {n}
            </span>
          ) : (
            <Link href={chemin(lien(n))} className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:border-slate-900">
              {n}
            </Link>
          )}
        </span>
      ))}
      {page < pages && (
        <Link href={chemin(lien(page + 1))} rel="next" className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:border-slate-900">
          Suivant
        </Link>
      )}
    </nav>
  )
}
