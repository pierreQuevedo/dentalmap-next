import { HeroScene } from '@/components/accueil/hero-scene'
import { FicheDentisteExemple, FicheEcoleExemple, FicheLaboratoireExemple } from './fiches-exemple'
import { MentionsHero } from './MentionsHero'
import { Carte } from '@/components/map/carte'
import { empriseAutour } from '@/lib/annuaire/emprise'

/**
 * Décor du hero : la première fonction de DentalMap, la carte des praticiens,
 * montrée avant tout texte.
 *
 * C'est la vraie carte de la recherche, même fond de plan et mêmes points,
 * cadrée sur le centre de Bordeaux et rendue inerte : aucun clic, aucune
 * molette, les contrôles de navigation sont masqués. Elle coûte MapLibre et
 * ses tuiles au chargement de l'accueil, c'est le prix du choix. L'attribution
 * est due : la pastille de MapLibre est masquée, parce qu'elle vit dans le
 * décor inerte, et `MentionsHero` la remplace par un « i » cliquable, hors du
 * décor, qui déplie les mêmes sources.
 *
 * Les fiches sont des exemples, avec des noms inventés, retirées de l'arbre
 * d'accessibilité : aucun praticien n'est mis en avant sur l'accueil. Elles
 * ne portent ni étiquette « Exemple » ni pastille de vérification, choix fait
 * lors de la comparaison des variantes du hero ; leur ligne du bas ne garde
 * que la distance. Les seuls points de la carte sont ceux des praticiens,
 * tels que la recherche les dessine.
 *
 * `HeroScene` anime l'entrée et le flottement des fiches, uniquement hors
 * `prefers-reduced-motion`.
 */
const EMPRISE_BORDEAUX = empriseAutour(-0.5792, 44.8378, 2600)

/*
 * Positions et échelle des fiches, à partir de 1280 px : en dessous, le titre
 * sur deux lignes occupe presque toute la largeur et passait dessus. Les
 * fiches sont les cartes de résultats à leur largeur réelle, réduites par une
 * échelle CSS : le laboratoire en haut à droite, le dentiste en bas à gauche,
 * l'école en bas à droite, de part et d'autre du champ de recherche.
 */
const FICHES = [
  // L'origine de l'échelle est du côté où la fiche est ancrée, sinon la
  // réduction la décolle du bord et la ramène sur le titre.
  { cle: 'laboratoire', position: 'right-[2%] top-[11%] origin-top-right', Fiche: FicheLaboratoireExemple },
  { cle: 'dentiste', position: 'left-[5%] top-[54%] origin-top-left', Fiche: FicheDentisteExemple },
  { cle: 'ecole', position: 'right-[2%] top-[58%] origin-top-right', Fiche: FicheEcoleExemple },
] as const

export function HeroCarte() {
  return (
    <HeroScene>
      {/* `inert` : rien du décor n'est atteignable au clavier. */}
      <div data-hero="decor" aria-hidden inert className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 [&_.maplibregl-ctrl-bottom-right]:hidden [&_.maplibregl-ctrl-top-right]:hidden">
          <Carte profession="dentistes" emprise={EMPRISE_BORDEAUX} className="size-full" />
        </div>
        {/*
          Teinte de charte : un aplat d'ardoise fondu en mode « couleur », qui
          garde les clairs et les sombres du plan et remplace ses verts, bleus
          et beiges par la seule teinte de la marque. Le jeton est fixe, le
          `brand` du thème sombre serait presque blanc.
        */}
        <div className="absolute inset-0 bg-ardoise mix-blend-color" />

        {/*
          Trois voiles. Un flou de fond sur les bords, masqué au centre, qui
          laisse la carte nette derrière le titre et l'estompe vers l'extérieur.
          Un radial léger au centre et dense sur les bords, qui fond la carte
          dans le fond de page. Un dégradé vertical sur toute la hauteur, opaque
          en bas pour la bande de logos, léger en haut. Les fiches viennent
          ensuite, nettes par-dessus.
        */}
        <div className="absolute inset-0 backdrop-blur-md [mask-image:radial-gradient(ellipse_52%_58%_at_50%_45%,transparent_32%,black_80%)]" />
        <div className="absolute inset-0 [background:radial-gradient(ellipse_72%_78%_at_50%_45%,color-mix(in_oklch,var(--background)_38%,transparent)_0%,color-mix(in_oklch,var(--background)_52%,transparent)_45%,var(--background)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background from-6% via-background/65 via-50% to-background/20" />
        {FICHES.map((f) => (
          <div
            key={f.cle}
            data-hero="carte"
            className={`absolute hidden w-[22rem] scale-[0.5] xl:block 2xl:scale-[0.58] ${f.position}`}
          >
            <f.Fiche />
          </div>
        ))}

      </div>
      <MentionsHero />
    </HeroScene>
  )
}

