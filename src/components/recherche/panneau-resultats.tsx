'use client'

import { clePosition, PAR_PAGE_CARTE } from '@/lib/annuaire/emprise'
import { LIBELLE } from '@/lib/annuaire/libelles'
import { PROFESSION_PAR_BASE } from '@/lib/annuaire/types'
import { CarteFiche, SqueletteFiche } from './carte-fiche'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecherche } from './contexte'
import { useEffect, useRef } from 'react'

/**
 * Colonne de résultats.
 *
 * La liste décrit ce que la carte montre : elle se renouvelle à chaque
 * déplacement, et se pagine plutôt que de s'allonger. Vingt fiches par page.
 * Une seule colonne tant que la colonne de gauche, quarante-cinq pour cent
 * de la page, n'offre pas six cents pixels utiles, soit un écran de 1600 pixels :
 * en dessous, deux cartes côte à côte n'ont plus la place de montrer leur image.
 *
 * Le rendu initial vient du serveur, donc la première page s'affiche sans
 * JavaScript et les liens de pagination sont de vrais liens. Le script se
 * contente d'intercepter le clic pour éviter un aller-retour complet.
 */
export function PanneauResultats() {
  const { base, territoire, donnees, version, chargement, erreur, survol, survolSlug, setSurvol, origine } = useRecherche()
  const haut = useRef<HTMLDivElement>(null)

  /*
   * Une liste classée depuis un lieu choisi sur la carte met la personne
   * choisie en tête : la colonne remonte pour la montrer, sinon le clic sur
   * la carte n'aurait d'effet visible que loin au-dessus de l'écran. Un
   * simple déplacement de la carte, lui, laisse la colonne où elle est.
   */
  useEffect(() => {
    if (!origine || chargement) return
    haut.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [version, origine, chargement])
  const profession = PROFESSION_PAR_BASE[base]
  const l = LIBELLE[profession]
  const { resultats, total, page, pages, plafonne } = donnees

  /*
   * Autant de squelettes que de cartes attendues. La page précédente est le
   * meilleur indice dont on dispose avant la réponse : une page pleine en
   * annonce une autre pleine, une page de cinq en annonce cinq.
   */
  const nombreDeSquelettes = Math.min(PAR_PAGE_CARTE, Math.max(1, resultats.length))

  return (
    /* La marge de défilement laisse passer l'en-tête collant, et la carte collée sous lui sur petit écran. */
    <div ref={haut} className="scroll-mt-[27.5rem] lg:scroll-mt-24">
      <div className="flex min-h-10 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        {chargement ? (
          <Skeleton className="h-5 w-72 max-w-full" />
        ) : (
        <p aria-live="polite" className="text-fg-2">
          {erreur ? (
            <span className="text-destructive">Les résultats n’ont pas pu être chargés.</span>
          ) : total === 0 ? (
            territoire ? `Aucun ${l.singulier} recensé ${territoire.libelle}.` : 'Aucun professionnel géolocalisé dans cette zone.'
          ) : (
            <>
              <span className="font-semibold text-fg">
                {plafonne ? `${total.toLocaleString('fr-FR')}+` : total.toLocaleString('fr-FR')}
              </span>{' '}
              {territoire
                ? `${total > 1 ? l.pluriel : l.singulier} ${territoire.libelle}`
                : `${total > 1 ? 'professionnels' : 'professionnel'} dans la zone affichée`}
              {pages > 1 && <>, page {page} sur {pages}</>}
            </>
          )}
        </p>
        )}
        <span className="sr-only" aria-live="polite">
          {chargement ? 'Mise à jour des résultats' : ''}
        </span>
      </div>

      {plafonne && !chargement && (
        <p className="mt-2 text-sm text-fg-2">
          La liste s’arrête aux {total} plus proches du centre de la carte. Resserrez la carte pour voir le reste.
        </p>
      )}

      {/*
        Pendant un chargement, la liste est remplacée par autant de squelettes
        qu'il y a de cartes attendues. Garder les anciennes cartes en les
        estompant laissait croire qu'elles décrivaient encore ce que la carte
        montre, alors qu'elles décrivaient l'emprise précédente.
      */}
      {chargement ? (
        <ol className="mt-5 grid gap-4 min-[1600px]:grid-cols-2">
          {Array.from({ length: nombreDeSquelettes }, (_, i) => (
            <SqueletteFiche key={i} profession={profession} />
          ))}
        </ol>
      ) : (
        resultats.length > 0 && (
          /*
           * La clé change à chaque liste reçue : les cartes sont remontées et
           * rejouent leur entrée, décalées par leur rang, au lieu de remplacer
           * les squelettes d'un coup.
           */
          <ol key={version} className="mt-5 grid gap-4 min-[1600px]:grid-cols-2">
            {resultats.map((p, i) => (
              <CarteFiche
                key={p.slug}
                praticien={p}
                base={base}
                profession={profession}
                rang={i}
                reference={origine ? 'du lieu choisi sur la carte' : undefined}
                /*
                 * Depuis la liste, la fiche survolée et elle seule. Depuis la
                 * carte, le lieu est connu mais pas la personne : la première
                 * fiche de l'adresse se lève, pas tout le groupe.
                 */
                actif={
                  survolSlug != null
                    ? survolSlug === p.slug
                    : survol != null && survol === clePosition(p.lon, p.lat) && premiereDuLieu(resultats, i)
                }
                onSurvol={setSurvol}
              />
            ))}
          </ol>
        )
      )}

      {pages > 1 && <Pagination />}

      <NoteClassement />
    </div>
  )
}

/** Vrai si aucune fiche avant la i-ième ne partage sa position. */
function premiereDuLieu(resultats: { lon: number | null; lat: number | null }[], i: number): boolean {
  const cle = clePosition(resultats[i]!.lon, resultats[i]!.lat)
  for (let j = 0; j < i; j++) if (clePosition(resultats[j]!.lon, resultats[j]!.lat) === cle) return false
  return true
}

/**
 * La règle de tri, dite sous la liste.
 *
 * Elle change avec le mode : alphabétique sur la page d'une commune,
 * distance au centre de la carte partout ailleurs. La
 * phrase suit la liste plutôt que la page, sans quoi elle mentirait dès le
 * premier déplacement de la carte.
 */
function NoteClassement() {
  const { territoire } = useRecherche()
  const alphabetique = territoire?.classement === 'alphabetique'
  return (
    <p className="mt-8 text-sm text-fg-2">
      {alphabetique
        ? 'Le classement est alphabétique.'
        : 'Les résultats sont classés par distance au centre de la carte, puis par ordre alphabétique à égalité. Les professionnels dont la position n’est qu’approximative, faute d’adresse exploitable, sont exclus de ce classement mais restent accessibles par leur commune.'}
    </p>
  )
}

/**
 * Pagination.
 *
 * Fenêtre glissante autour de la page courante, plus les deux extrémités :
 * au-delà de sept pages, aligner tous les numéros ne sert qu'à remplir la ligne.
 *
 * Chaque numéro reste un lien porteur de `?page=`, pour que la navigation
 * fonctionne sans script et que le clic droit « ouvrir dans un nouvel onglet »
 * garde un sens. En mode carte, le clic gauche est intercepté : la carte a pu
 * être déplacée depuis, et seul l'état du navigateur connaît l'emprise
 * courante. En mode territoire, il navigue.
 */
function Pagination() {
  const { donnees, allerPage, chargement, mode } = useRecherche()
  const { page, pages } = donnees

  const numeros = fenetre(page, pages)

  return (
    <nav aria-label="Pages de résultats" className="mt-8 flex flex-wrap items-center gap-2">
      <Lien page={page - 1} desactive={page <= 1} libelle="Page précédente">
        Précédent
      </Lien>

      {numeros.map((n, i) =>
        n === null ? (
          <span key={`saut-${i}`} aria-hidden className="px-1 text-fg-2">
            …
          </span>
        ) : (
          <Lien key={n} page={n} courante={n === page} libelle={`Page ${n}`}>
            {n}
          </Lien>
        ),
      )}

      <Lien page={page + 1} desactive={page >= pages} libelle="Page suivante">
        Suivant
      </Lien>

      <span className="sr-only" aria-live="polite">
        {chargement ? 'Chargement des résultats' : `Page ${page} sur ${pages}`}
      </span>
    </nav>
  )

  function Lien({
    page: n,
    courante = false,
    desactive = false,
    libelle,
    children,
  }: {
    page: number
    courante?: boolean
    desactive?: boolean
    libelle: string
    children: React.ReactNode
  }) {
    if (desactive) {
      return (
        <span aria-hidden className="squircle-full border border-line px-3 py-1.5 text-sm text-line-strong">
          {children}
        </span>
      )
    }
    return (
      <a
        href={`?page=${n}`}
        aria-label={libelle}
        aria-current={courante ? 'page' : undefined}
        onClick={(e) => {
          // Sur une page de territoire, le lien navigue vraiment : le serveur
          // rend la page demandée, la même que celle qu'un moteur lit.
          if (mode === 'territoire') return
          e.preventDefault()
          allerPage(n)
        }}
        className={`squircle-full border px-3 py-1.5 text-sm tabular-nums transition-colors ${
          courante
            ? 'border-brand bg-brand text-brand-foreground'
            : 'border-line text-fg hover:border-line-strong hover:bg-bg-soft'
        }`}
      >
        {children}
      </a>
    )
  }
}

/** Numéros à afficher : les deux extrémités, et deux voisins de part et d'autre. */
function fenetre(page: number, pages: number): (number | null)[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  const proches = new Set([1, pages, page, page - 1, page + 1, page - 2, page + 2])
  const gardes = [...proches].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b)
  const sortie: (number | null)[] = []
  gardes.forEach((n, i) => {
    if (i > 0 && n - gardes[i - 1]! > 1) sortie.push(null)
    sortie.push(n)
  })
  return sortie
}
