/**
 * MAQUETTE. Reproduction de la page commune `/dentistes/gironde/bordeaux/`
 * et de la recherche `/recherche/`, avec les composants réels de mise en page
 * (grille, carte, barre de recherche) et des résultats statiques : la colonne
 * de résultats est recopiée de `PanneauResultats` pour y poser la pastille
 * « Recrute » sans toucher aux composants réels. La carte, elle, montre les
 * vrais points de l'annuaire, comme les maquettes de fiche.
 */
import { ArrowUpRight, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { FilAriane } from '@/components/annuaire/primitives'
import { ListeTerritoires } from '@/components/annuaire/commune'
import { BarreRecherche } from '@/components/recherche/barre-recherche'
import { CarteRecherche } from '@/components/recherche/carte-recherche'
import { FournisseurRecherche } from '@/components/recherche/contexte'
import { GrilleRecherche } from '@/components/recherche/mise-en-page'
import type { Emprise } from '@/lib/annuaire/emprise'
import { chemin } from '@/lib/navigation'
import { CarteOffre } from '../emploi/_blocs'
import { CarteFicheMaquette } from './_carte-fiche'
import {
  EMPRISE_COMMUNE,
  EMPRISE_RECHERCHE,
  OFFRES_PROCHES,
  PRATICIENS_COMMUNE,
  PRATICIENS_RECHERCHE,
  VOISINES,
  type PraticienMaquette,
} from './_donnees'

const LIEU_BORDEAUX = { type: 'commune', code_insee: '33063', slug: 'bordeaux', departement_slug: 'gironde' } as const

function Cadre({
  cle,
  emprise,
  resultats,
  total,
  pages,
  plafonne = false,
  territoire,
  enTete,
  apres,
}: {
  cle: string
  emprise: Emprise
  resultats: PraticienMaquette[]
  total: number
  pages: number
  plafonne?: boolean
  territoire?: { libelle: string; classement: 'alphabetique' | 'distance' }
  enTete: React.ReactNode
  apres?: React.ReactNode
}) {
  return (
    <FournisseurRecherche
      key={cle}
      base="dentistes"
      empriseInitiale={emprise}
      initial={{ total, page: 1, pages, plafonne, resultats }}
      mode={territoire ? 'territoire' : 'carte'}
      territoire={territoire}
    >
      <GrilleRecherche
        enTete={enTete}
        carte={<CarteRecherche emprise={emprise} />}
        contenu={
          <>
            <Panneau resultats={resultats} total={total} pages={pages} plafonne={plafonne} territoire={territoire?.libelle} />
            {apres}
          </>
        }
        barre={<BarreRecherche base="dentistes" valeurLieu="Bordeaux" lieu={LIEU_BORDEAUX} />}
      />
    </FournisseurRecherche>
  )
}

/** Recopie statique de `PanneauResultats` : comptage, cartes, pagination, règle de tri. */
function Panneau({
  resultats,
  total,
  pages,
  plafonne,
  territoire,
}: {
  resultats: PraticienMaquette[]
  total: number
  pages: number
  plafonne: boolean
  territoire?: string
}) {
  return (
    <div>
      <div className="flex min-h-10 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-fg-2">
          <span className="font-semibold text-fg">{plafonne ? `${total.toLocaleString('fr-FR')}+` : total.toLocaleString('fr-FR')}</span>{' '}
          {territoire ? `chirurgiens-dentistes ${territoire}` : 'professionnels dans la zone affichée'}, page 1 sur {pages}
        </p>
      </div>
      {plafonne && (
        <p className="mt-2 text-sm text-fg-2">La liste s’arrête aux {total} plus proches du centre de la carte. Resserrez la carte pour voir le reste.</p>
      )}
      <ol className="mt-5 grid gap-4 xl:grid-cols-2">
        {resultats.map((p) => (
          <CarteFicheMaquette key={p.slug} praticien={p} />
        ))}
      </ol>
      <Pagination pages={pages} />
      <p className="mt-8 text-sm text-fg-2">
        {territoire
          ? 'Le classement est alphabétique.'
          : 'Les résultats sont classés par distance au centre de la carte, puis par ordre alphabétique à égalité. Les professionnels dont la position n’est qu’approximative, faute d’adresse exploitable, sont exclus de ce classement mais restent accessibles par leur commune.'}
      </p>
    </div>
  )
}

function Pagination({ pages }: { pages: number }) {
  const numeros: (number | null)[] = [1, 2, 3, null, pages]
  const lien = 'squircle-full border px-3 py-1.5 text-sm tabular-nums'
  return (
    <nav aria-label="Pages de résultats" className="mt-8 flex flex-wrap items-center gap-2">
      <span aria-hidden className="squircle-full border border-line px-3 py-1.5 text-sm text-line-strong">
        Précédent
      </span>
      {numeros.map((n, i) =>
        n === null ? (
          <span key={`saut-${i}`} aria-hidden className="px-1 text-fg-2">
            …
          </span>
        ) : (
          <a
            key={n}
            href={`?page=${n}`}
            aria-current={n === 1 ? 'page' : undefined}
            className={`${lien} ${n === 1 ? 'border-brand bg-brand text-brand-foreground' : 'border-line text-fg hover:border-line-strong hover:bg-bg-soft'}`}
          >
            {n}
          </a>
        ),
      )}
      <a href="?page=2" className={`${lien} border-line text-fg hover:border-line-strong hover:bg-bg-soft`}>
        Suivant
      </a>
    </nav>
  )
}

/**
 * « Ils recrutent près d’ici » : trois offres compactes autour de la commune,
 * par distance. Volontairement secondaire : titre en petites capitales comme
 * « Autour de Bordeaux », cartes sans image, une seule colonne. La page reste
 * celle des patients ; ce bloc sert les professionnels qui la lisent aussi.
 * Il ne s'affiche que s'il existe au moins une offre en ligne dans le rayon.
 */
function IlsRecrutent() {
  if (OFFRES_PROCHES.length === 0) return null
  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-fg-2">
        <Briefcase className="size-4 text-teal" aria-hidden /> Ils recrutent près d’ici
      </h2>
      <p className="mt-2 text-sm text-fg-2">Offres publiées par des cabinets vérifiés, de la plus proche à la plus éloignée du centre de Bordeaux.</p>
      <ul className="mt-4 grid gap-3">
        {OFFRES_PROCHES.map((o) => (
          <CarteOffre key={o.id} o={o} forme="compacte" />
        ))}
      </ul>
      <Link
        href={chemin('/emploi/assistant-dentaire/gironde/bordeaux/')}
        className="group mt-5 inline-flex items-center text-sm font-medium text-fg transition-colors hover:text-teal"
      >
        <span className="border-b-2 border-line pb-0.5">Toutes les offres d’assistant(e) dentaire à Bordeaux</span>
        <ArrowUpRight className="ml-1 size-4 shrink-0" aria-hidden />
      </Link>
    </section>
  )
}

const ARIANE = [
  { libelle: 'Accueil', href: '/' },
  { libelle: 'Chirurgiens-dentistes', href: '/dentistes/' },
  { libelle: 'Gironde', href: '/dentistes/gironde/' },
  { libelle: 'Bordeaux' },
]

export function CommuneRecrute() {
  return (
    <Cadre
      cle="maquette:commune"
      emprise={EMPRISE_COMMUNE}
      resultats={PRATICIENS_COMMUNE}
      total={459}
      pages={10}
      territoire={{ libelle: 'à Bordeaux', classement: 'alphabetique' }}
      enTete={
        <>
          <FilAriane segments={ARIANE} />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-fg md:text-3xl">Chirurgiens-dentistes à Bordeaux</h1>
          <p className="mt-2 text-fg-2">
            459 chirurgiens-dentistes à Bordeaux (Gironde), recensés à partir du répertoire partagé des professionnels de santé, page 1 sur 10. Les
            informations ne sont pas déclaratives : elles proviennent de registres publics et sont rapprochées chaque semaine.
          </p>
        </>
      }
      apres={
        <>
          <IlsRecrutent />
          <ListeTerritoires titre="Autour de Bordeaux" liens={VOISINES} />
        </>
      }
    />
  )
}

export function RechercheRecrute() {
  return (
    <Cadre
      cle="maquette:recherche"
      emprise={EMPRISE_RECHERCHE}
      resultats={PRATICIENS_RECHERCHE}
      total={600}
      pages={30}
      plafonne
      enTete={<h1 className="text-2xl font-semibold tracking-tight text-fg">Rechercher un professionnel</h1>}
    />
  )
}
