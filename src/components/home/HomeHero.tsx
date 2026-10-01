import { Hero140 } from '@/components/hero140'
import { RechercheUniverselle } from '@/components/accueil/recherche-universelle'
import { HeaderTransparent } from './HeaderTransparent'
import { HeroCarte } from './HeroCarte'

/**
 * Logos affichés dans la bande du hero, lus depuis `public/images/logos/`.
 *
 * Ils arrivent en couleur, parfois en rouge ou en bleu, et la bande est
 * toujours posée sur le voile sombre du hero : ils sont passés en blanc par
 * filtre CSS, sans retoucher les fichiers. `brightness-0 invert` rend blanc
 * tout pixel non transparent, ce qui suppose un fond transparent. Le logo de
 * Strasbourg était livré sur fond blanc opaque : il a été détouré en PNG
 * transparent, le fichier d'origine ne pouvait pas passer par ce filtre.
 */
const BLANC = 'brightness-0 invert'

const LOGOS = [
  // Logo vertical : à la hauteur commune il ne ferait que dix pixels de large.
  { src: '/images/logos/universite-paris-7.webp', alt: 'Université Paris Diderot', className: `${BLANC} h-11 md:h-12` },
  { src: '/images/logos/universite-paris-descartes.png', alt: 'Université Paris Descartes' },
  { src: '/images/logos/universite-de-lille.webp', alt: 'Université de Lille' },
  { src: '/images/logos/universite-de-toulouse.webp', alt: 'Université de Toulouse' },
  { src: '/images/logos/universite-de-bordeaux.webp', alt: 'Université de Bordeaux' },
  { src: '/images/logos/universite-de-strasbourg.png', alt: 'Université de Strasbourg' },
  // Beaucoup de marge transparente dans le fichier : compensée par la hauteur.
  { src: '/images/logos/universite-rennes-1.webp', alt: 'Université de Rennes 1', className: `${BLANC} h-10 md:h-11` },
  { src: '/images/logos/universite-bretagne-occidentale.webp', alt: 'Université de Bretagne Occidentale' },
  { src: '/images/logos/cma.png', alt: 'Chambre de métiers et de l’artisanat' },
  { src: '/images/logos/lycee-touchard-washington.png', alt: 'Lycée Touchard Washington' },
  { src: '/images/logos/lycee-hector-guimard.png', alt: 'Lycée Hector Guimard' },
  { src: '/images/logos/progress-sante.png', alt: 'Progress Santé' },
  { src: '/images/logos/aurlom.png', alt: 'Aurlom' },
  { src: '/images/logos/edgo.png', alt: 'Edgo' },
  { src: '/images/logos/ipso.png', alt: 'IPSO' },
  { src: '/images/logos/sepr-groupe.png', alt: 'SEPR Groupe' },
].map((l) => ({ ...l, className: l.className ?? BLANC }))

/**
 * Z1. Le hero retenu, après comparaison de trois variantes : badge et titre
 * sur la carte des praticiens, le champ de recherche universel à la place du
 * bouton, et trois fiches d'exemple sans étiquette. La barre du site est
 * transparente au-dessus, tant que la page n'a pas défilé.
 *
 * `-mt-20 pt-20` : la section remonte sous la barre de 80 px et rend la
 * même hauteur en marge intérieure, pour que la carte passe derrière la barre
 * sans que le contenu s'y cache.
 */
export function HomeHero() {
  return (
    <>
      <HeaderTransparent />
      <Hero140
        className="-mt-20 min-h-[85vh] pt-20 md:min-h-[88vh]"
        background={<HeroCarte />}
        badge="Annuaire vérifié par les registres"
        heading="Trouvez un dentiste, un spécialiste, un laboratoire ou une école près de chez vous"
        // Explicitement absent : le bloc a un bouton par défaut, et seule une
        // clé présente dans les props le remplace.
        buttons={undefined}
        action={
          <div className="flex w-full max-w-xl justify-center pt-2">
            <RechercheUniverselle />
          </div>
        }
        logos={LOGOS}
        logosLabel={undefined}
      />
    </>
  )
}
