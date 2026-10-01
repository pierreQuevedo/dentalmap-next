import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowUpRight, X } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { chemin, FORMATION_TYPES, type FormationType } from '@/lib/navigation'
import { FAMILLES, typeDe } from '@/lib/formation/types'
import { repondAuLieu, resoudreLieu } from '@/lib/formation/filtre-lieu'
import { getFormations } from '@/lib/wp/queries'
import { Balisage, filAriane } from '@/lib/seo/jsonld'
import { CarteFormation } from './carte-formation'

export type ParamsLieu = { lieu?: string; departement?: string; region?: string }

/** Chaîne de requête du lieu, conservée quand on change de famille. */
function requeteLieu(p: ParamsLieu): string {
  const q = new URLSearchParams()
  for (const cle of ['lieu', 'departement', 'region'] as const) if (p[cle]) q.set(cle, p[cle]!)
  const s = q.toString()
  return s ? `?${s}` : ''
}

export async function metadonneesFormations(type: FormationType | null, params: ParamsLieu): Promise<Metadata> {
  const lieu = await resoudreLieu(params)
  const titre = type ? FAMILLES[type].titre : 'Formation aux métiers dentaires'
  const suffixe = lieu ? ` ${lieu.dans}` : ''
  return {
    title: `${titre}${suffixe}`,
    description: type
      ? FAMILLES[type].intro
      : 'Écoles de prothèse dentaire, facultés d’odontologie et formations privées, recensées avec leurs diplômes, leurs durées et leurs villes.',
    alternates: { canonical: type ? `/formation/${type}/` : '/formation/' },
    // Une liste filtrée par lieu est une vue de la liste canonique, pas une page à
    // indexer ; une famille annoncée mais vide non plus, tant qu'elle l'est.
    robots: lieu || (type && FAMILLES[type].aVenir) ? { index: false, follow: true } : undefined,
  }
}

/**
 * Liste des formations, pour l'index et pour chaque famille.
 *
 * Toutes les formations viennent du CMS en une requête cachée ; la famille et
 * le lieu filtrent en mémoire. Le lieu arrive de la barre de recherche et
 * s'affiche en étiquette qu'un clic retire, sans quoi une recherche
 * « écoles à Lyon » sans résultat ressemblerait à un site vide.
 */
export async function ListeFormations({ type, params }: { type: FormationType | null; params: ParamsLieu }) {
  const [toutes, lieu] = await Promise.all([getFormations(), resoudreLieu(params)])
  const parFamille = type ? toutes.filter((f) => typeDe(f) === type) : toutes
  const formations = lieu ? parFamille.filter((f) => repondAuLieu(f, lieu)) : parFamille
  const famille = type ? FAMILLES[type] : null
  const requete = requeteLieu(params)

  const segments = [
    { nom: 'Accueil', chemin: '/' },
    ...(type ? [{ nom: 'Formation', chemin: '/formation/' }, { nom: famille!.titre, chemin: `/formation/${type}/` }] : [{ nom: 'Formation', chemin: '/formation/' }]),
  ]

  return (
    <main className="container py-10">
      <Balisage donnees={filAriane(segments)} />
      <FilAriane segments={segments.map((s, i) => (i < segments.length - 1 ? { libelle: s.nom, href: s.chemin } : { libelle: s.nom }))} />

      <header className="mt-5 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
          {famille ? famille.titre : 'Se former aux métiers dentaires'}
        </h1>
        <p className="mt-3 text-fg-2">
          {famille
            ? famille.intro
            : 'Les établissements et les formations, leurs diplômes et leurs conditions d’accès, recensés au même titre que les praticiens.'}
        </p>
      </header>

      <nav aria-label="Familles de formation" className="mt-6 flex flex-wrap items-center gap-2">
        <Link
          href={chemin(`/formation/${requete}`)}
          aria-current={type ? undefined : 'page'}
          className={`rounded-full border px-4 py-2 text-sm font-medium ${type ? 'border-line text-fg hover:bg-bg-soft' : 'border-fg bg-fg text-bg'}`}
        >
          Toutes
        </Link>
        {FORMATION_TYPES.map((t) => (
          <Link
            key={t}
            href={chemin(`/formation/${t}/${requete}`)}
            aria-current={t === type ? 'page' : undefined}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${t === type ? 'border-fg bg-fg text-bg' : 'border-line text-fg hover:bg-bg-soft'}`}
          >
            {FAMILLES[t].titre}
            {FAMILLES[t].aVenir && (
              <span className={`rounded-full px-1.5 py-px text-[11px] font-medium ${t === type ? 'bg-bg/20 text-bg' : 'bg-bg-soft text-fg-2 ring-1 ring-inset ring-line'}`}>
                Bientôt
              </span>
            )}
          </Link>
        ))}
        {lieu && (
          <Link
            href={chemin(type ? `/formation/${type}/` : '/formation/')}
            className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-2 text-sm font-medium text-teal ring-1 ring-inset ring-teal/30 hover:bg-teal/15"
          >
            {lieu.libelle}
            <X className="size-3.5" aria-hidden />
            <span className="sr-only">Retirer le lieu</span>
          </Link>
        )}
      </nav>

      {famille?.aVenir && formations.length === 0 ? (
        <AVenir />
      ) : (
        <p className="mt-6 text-sm text-fg-2" aria-live="polite">
          {formations.length === 0
            ? lieu
              ? `Aucune formation recensée ${lieu.dans}${famille ? ` parmi les ${famille.titre.toLowerCase()}` : ''}.`
              : 'Aucune formation publiée pour le moment.'
            : `${formations.length} ${formations.length > 1 ? 'formations' : 'formation'}${lieu ? ` ${lieu.dans}` : ''}, par ordre alphabétique.`}
        </p>
      )}

      {formations.length > 0 ? (
        <ol className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {formations.map((f) => (
            <CarteFormation key={f.slug} formation={f} />
          ))}
        </ol>
      ) : (
        lieu && parFamille.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-2">Partout en France</h2>
            <ol className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {parFamille.slice(0, 6).map((f) => (
                <CarteFormation key={f.slug} formation={f} />
              ))}
            </ol>
          </section>
        )
      )}
    </main>
  )
}

/**
 * Famille annoncée, pas encore recensée. Une liste vide se lit comme une
 * panne ; ce bloc dit ce qui arrive et renvoie vers ce qui existe déjà.
 */
function AVenir() {
  return (
    <section className="mt-8 grid gap-6 squircle-2xl border border-line bg-bg-soft p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8">
      <div>
        <span className="inline-flex rounded-full bg-bg-soft text-fg-2 ring-1 ring-inset ring-line px-2.5 py-0.5 text-xs font-medium">
          Bientôt
        </span>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fg">Le recensement des formations privées est en cours</h2>
        <p className="mt-2 max-w-2xl text-fg-2">
          Implantologie, parodontologie, esthétique, gestion de cabinet ou de laboratoire : les organismes de formation continue seront
          présentés ici avec leurs programmes, leurs durées et leurs conditions d’accès, au même titre que les écoles et les facultés. Vous
          représentez un organisme de formation ? Écrivez-nous pour figurer dans le recensement.
        </p>
      </div>
      <div className="flex flex-col gap-2 md:min-w-[16rem]">
        <Link href={chemin('/contact/?objet=autre')} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
          Référencer une formation
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
        <Link href={chemin('/formation/ecoles-de-prothese/')} className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-bg px-5 text-sm font-medium text-fg hover:bg-bg-soft">
          Voir les écoles de prothèse
        </Link>
        <Link href={chemin('/formation/facultes-odontologie/')} className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-bg px-5 text-sm font-medium text-fg hover:bg-bg-soft">
          Voir les facultés d’odontologie
        </Link>
      </div>
    </section>
  )
}
