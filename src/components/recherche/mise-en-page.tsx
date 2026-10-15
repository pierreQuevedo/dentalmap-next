import type { Emprise, PageResultats } from '@/lib/annuaire/emprise'
import type { LieuChoisi } from '@/lib/annuaire/cibles'
import type { BaseUrl } from '@/lib/annuaire/types'
import { BarreRecherche } from './barre-recherche'
import { CarteRecherche } from './carte-recherche'
import { ColonneCarte } from './colonne-carte'
import { FournisseurRecherche, type Mode, type Territoire } from './contexte'
import { PanneauResultats } from './panneau-resultats'

/**
 * La mise en page de la recherche, partagée avec les pages de l'annuaire.
 *
 * Deux colonnes pleine largeur, quarante-cinq pour cent à gauche et
 * cinquante-cinq à droite. À gauche, l'en-tête de la page et les résultats, qui défilent
 * avec la page ; à droite la carte, collée
 * sous l'en-tête, qui s'arrête d'elle-même au bas de la liste sans jamais
 * recouvrir le pied de page. C'est le `position: sticky` qui produit cet
 * arrêt : la carte se fige à l'intérieur de sa cellule de grille, qui
 * s'achève exactement où s'achèvent les résultats. Aucun script.
 *
 * La recherche elle-même, lieu, cible et filtres, vit dans une barre fixée
 * en bas de l'écran, centrée, la même sur toutes ces pages.
 *
 * Une page de commune, de département ou de région est une recherche déjà
 * faite : même carte, même liste, mais cadrées sur le territoire, avec le
 * titre et les liens que les moteurs attendent d'une page de lieu. Ce que la
 * page a de propre passe par `enTete` et `apres` ; le reste est commun.
 *
 * La liste décrit ce que la carte montre. Le serveur rend la première page,
 * ce qui laisse la page utilisable sans JavaScript ; ensuite c'est la carte
 * qui mène, et chaque déplacement redemande la page à `/api/geo/resultats/`.
 */
/**
 * La grille seule, sans le contexte de recherche : la page par département
 * s'en sert avec une autre carte et une autre colonne.
 */
export function GrilleRecherche({
  enTete,
  carte,
  contenu,
  barre,
  carteMobile = true,
}: {
  enTete: React.ReactNode
  carte: React.ReactNode
  contenu: React.ReactNode
  barre: React.ReactNode
  /** Faux : aucune carte sous `lg`, ni bouton pour l'ouvrir. */
  carteMobile?: boolean
}) {
  return (
    <>
      <main className="grid grid-cols-1 pb-24 lg:grid-cols-[9fr_11fr]">
        {/* Sous `lg`, l'en-tête se fait court, la liste vient vite : la présentation tient en trois lignes. */}
        <section className="px-5 pt-6 md:px-10 lg:col-start-1 lg:row-start-1 lg:pt-8 xl:px-12 max-lg:[&>p]:line-clamp-3 max-lg:[&>p]:text-sm">{enTete}</section>

        {/*
          La carte occupe une cellule qui couvre les deux rangées de la colonne
          de gauche : sa hauteur est donc celle de toute la colonne, et le bloc
          collant a de quoi voyager. Sous `lg`, elle quitte la grille et
          s'ouvre en plein écran depuis le bouton « Carte » : voir
          `ColonneCarte`. Jamais dupliquée : une seconde instance de MapLibre
          coûterait un contexte WebGL et un worker pour rien.
        */}
        <ColonneCarte mobile={carteMobile}>{carte}</ColonneCarte>

        <section className="px-5 pb-16 pt-6 md:px-10 lg:col-start-1 lg:row-start-2 xl:px-12">{contenu}</section>
      </main>
      {barre}
    </>
  )
}

export function MiseEnPageRecherche({
  cle,
  base,
  emprise,
  initial,
  mode = 'carte',
  territoire,
  valeurLieu,
  lieu,
  enTete,
  apres,
}: {
  /** Remonte tout le bloc client quand elle change : carte et liste repartent de l'emprise. */
  cle: string
  base: BaseUrl
  emprise: Emprise
  initial: PageResultats
  mode?: Mode
  territoire?: Territoire
  /** Valeur du champ de lieu de la barre, le nom du territoire sur une page d'annuaire. */
  valeurLieu: string
  /** Le territoire de la page, pour qu'un changement de cible y mène directement. */
  lieu?: LieuChoisi
  /** Fil d'Ariane, titre et présentation, au-dessus du formulaire. */
  enTete: React.ReactNode
  /** Sous les résultats : communes voisines, liste des communes ou des départements. */
  apres?: React.ReactNode
}) {
  return (
    <FournisseurRecherche key={cle} base={base} empriseInitiale={emprise} initial={initial} mode={mode} territoire={territoire}>
      <GrilleRecherche
        enTete={enTete}
        carte={<CarteRecherche />}
        contenu={
          <>
            <PanneauResultats />
            {apres}
          </>
        }
        barre={<BarreRecherche base={base} valeurLieu={valeurLieu} lieu={lieu} />}
      />
    </FournisseurRecherche>
  )
}
