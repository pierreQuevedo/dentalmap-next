import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getArrondissements,
  getCommune,
  getCommunesVoisinesAvecPraticiens,
  getEmpriseCommune,
  getPraticiensDeCommune,
  PAR_PAGE,
} from '@/lib/annuaire/queries'
import { LIBELLE, compte, majuscule } from '@/lib/annuaire/libelles'
import { BASE_URL, type Profession } from '@/lib/annuaire/types'
import { MiseEnPageRecherche } from '@/components/recherche/mise-en-page'
import { chemin, FilAriane } from './primitives'
import { Balisage, filAriane } from '@/lib/seo/jsonld'

type Params = { departement: string; commune: string }
type Recherche = { page?: string }

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
  const titre = total ? `${majuscule(l.pluriel)} à ${c.nom}${precisionDepartement(c)}${suffixe}` : `Aucun ${l.singulier} à ${c.nom}`

  const cheminBase = `/${BASE_URL[profession]}/${departement}/${commune}/`
  return {
    title: titre,
    description: total
      ? `${compte(profession, total)} à ${c.nom}, sur la carte et en liste. Adresses et informations vérifiées auprès des registres officiels.`
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

/** « (Gironde) » après le nom de la commune, sauf quand le département porte le même nom, Paris. */
function precisionDepartement(c: { nom: string; departementNom: string }): string {
  return c.departementNom === c.nom ? '' : ` (${c.departementNom})`
}

/** Numéro de page valide, 1 par défaut. */
export function numeroPage(valeur: string | undefined): number {
  const n = Number(valeur)
  return Number.isInteger(n) && n > 1 ? n : 1
}

/**
 * Page d'une commune : une recherche déjà faite.
 *
 * La carte est cadrée sur les lieux d'exercice de la commune, la liste est
 * celle de ses praticiens par ordre alphabétique, paginée par de vrais liens,
 * et le formulaire est prérempli. Bouger la carte fait basculer la liste sur
 * ce qu'elle montre, comme sur la recherche. Paris, Lyon et Marseille
 * agrègent leurs arrondissements, listés en dessous.
 */
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
  const [{ liste, total }, emprise, arrondissements] = await Promise.all([
    getPraticiensDeCommune(profession, c.codeInsee, page),
    getEmpriseCommune(c.codeInsee),
    getArrondissements(profession, c.codeInsee),
  ])
  const pages = Math.max(1, Math.ceil(total / PAR_PAGE))
  if (page > pages) notFound()

  const pluriel = majuscule(l.pluriel)
  const segments = [
    { nom: 'Accueil', chemin: '/' },
    { nom: pluriel, chemin: `/${base}/` },
    { nom: c.departementNom, chemin: `/${base}/${departement}/` },
    { nom: c.nom, chemin: `/${base}/${departement}/${commune}/` },
  ]

  return (
    <>
      <Balisage donnees={filAriane(segments)} />
      <MiseEnPageRecherche
        cle={`${base}:${c.codeInsee}:${page}`}
        base={base}
        emprise={emprise}
        initial={{ total, page, pages, plafonne: false, resultats: liste }}
        mode="territoire"
        territoire={{ libelle: `à ${c.nom}`, classement: 'alphabetique' }}
        valeurLieu={c.nom}
        lieu={{ type: 'commune', code_insee: c.codeInsee, slug: c.slug, departement_slug: c.departementSlug }}
        enTete={
          <>
            <FilAriane segments={segments.map((s, i) => (i < segments.length - 1 ? { libelle: s.nom, href: s.chemin } : { libelle: s.nom }))} />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-fg md:text-3xl">
              {total > 0 ? `${pluriel} à ${c.nom}` : `Aucun ${l.singulier} à ${c.nom}`}
            </h1>
            <p className="mt-2 text-fg-2">
              {total > 0 ? (
                <>
                  {compte(profession, total)} à {c.nom}{precisionDepartement(c)}, recensés à partir {l.registre}
                  {pages > 1 ? `, page ${page} sur ${pages}` : ''}. Les informations ne sont pas déclaratives : elles
                  proviennent de registres publics et sont rapprochées chaque semaine.
                </>
              ) : (
                <>Aucun professionnel de cette catégorie n&apos;est recensé sur cette commune. Les plus proches sont listés ci-dessous.</>
              )}
            </p>
          </>
        }
        apres={
          <>
            {arrondissements.length > 0 && (
              <ListeTerritoires titre={`Par arrondissement`} liens={arrondissements.map((a) => ({ libelle: a.nom, href: `/${base}/${departement}/${a.slug}/`, total: a.total }))} />
            )}
            <CommunesVoisines profession={profession} codeInsee={c.codeInsee} nomCommune={c.nom} />
          </>
        }
      />
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
    <ListeTerritoires
      titre={`Autour de ${nomCommune}`}
      liens={voisines.map((v) => ({
        libelle: v.nom,
        href: `/${base}/${v.departementSlug}/${v.slug}/`,
        total: v.total,
        detail: `${v.km.toLocaleString('fr-FR')} km`,
      }))}
    />
  )
}

/**
 * Liste de liens vers d'autres territoires, avec leur effectif.
 *
 * Commune aux pages de commune, de département et de région : ce sont ces
 * listes que les moteurs suivent d'une page à l'autre.
 */
export function ListeTerritoires({
  titre,
  liens,
  compact = false,
}: {
  titre: string
  liens: { libelle: string; href: string; total: number; detail?: string }[]
  /** Liste serrée, pour des centaines de communes. */
  compact?: boolean
}) {
  if (liens.length === 0) return null
  return (
    <section className="mt-10">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-2">{titre}</h2>
      {compact ? (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {liens.map((l) => (
            <li key={l.href}>
              <Link href={chemin(l.href)} className="text-fg hover:underline">
                {l.libelle}
              </Link>
              <span className="ml-1 tabular-nums text-fg-2">{l.total}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          {liens.map((l) => (
            <li key={l.href} className="flex items-baseline justify-between gap-4 border-b border-line py-2">
              <Link href={chemin(l.href)} className="text-fg hover:underline">
                {l.libelle}
              </Link>
              <span className="shrink-0 text-sm tabular-nums text-fg-2">
                {l.total.toLocaleString('fr-FR')}
                {l.detail ? ` · ${l.detail}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
