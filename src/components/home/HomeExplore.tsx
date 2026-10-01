import imagesCartes from '@/lib/annuaire/images-cartes.json'
import imagesDepartements from '@/lib/annuaire/images-cartes-departements.json'
import { getAccesRapide } from '@/lib/annuaire/acces-rapide'
import { getDepartementsPrincipaux } from '@/lib/annuaire/queries'
import { FORMATION_TYPES } from '@/lib/navigation'
import { PAGE_PAR_TYPE } from '@/lib/formation/types'
import { getFormationsAccueil } from '@/lib/wp/queries'
import { ExploreTabs, type OngletExplore } from './ExploreTabs'

const nombre = (n: number) => n.toLocaleString('fr-FR')

/** Vignette de carte d'une ville, si le script `cartes-villes` en a rendu une. */
function carteVille(slug: string | null, alt: string) {
  const src = slug ? (imagesCartes as Record<string, string>)[slug] : undefined
  return src ? { src, alt } : undefined
}

/** Vignette d'un département, sa forme en ardoise sur le plan clair, si le script `cartes-departements` l'a rendue. */
function carteDepartement(slug: string, alt: string) {
  const src = (imagesDepartements as Record<string, string>)[slug]
  return src ? { src, alt } : undefined
}

/** Les fonds de plan sont OpenStreetMap et OpenMapTiles : l'attribution est due. */
const ATTRIBUTION_CARTES = "Plans © OpenStreetMap contributors, © OpenMapTiles, via OpenFreeMap"


/**
 * Z4. feature287 avec trois onglets.
 *
 * - Dentistes : les grandes villes, chacune avec le plan de son centre en
 *   gris clair, l'ardoise inversée.
 * - Prothésistes : les départements, où les laboratoires se lisent mieux
 *   qu'à la commune ; chaque département montre sa forme en ardoise sur le
 *   plan clair.
 * - Formations : les formations elles-mêmes, mises en avant une à une, avec
 *   l'image renseignée dans WordPress.
 */
export async function HomeExplore() {
  const [villes, departements, formations] = await Promise.all([
    getAccesRapide(8, 'dentiste'),
    getDepartementsPrincipaux('prothesiste', 8),
    getFormationsAccueil(8),
  ])

  const onglets: OngletExplore[] = [
    {
      valeur: 'dentistes',
      libelle: 'Dentistes',
      sousTitre: 'Les villes où les praticiens sont les plus nombreux.',
      cartes: villes.map((c) => ({
        title: c.label,
        description: `${nombre(c.total)} praticiens`,
        href: c.href,
        image: carteVille(c.slug, `Plan de ${c.label}`),
      })),
      bouton: { text: 'Rechercher un dentiste', url: '/recherche/?profession=dentistes' },
      attribution: ATTRIBUTION_CARTES,
    },
    {
      valeur: 'prothesistes',
      libelle: 'Prothésistes',
      sousTitre: 'Les départements où les laboratoires sont les plus nombreux.',
      cartes: departements.map((d) => ({
        title: d.nom,
        description: `${nombre(d.total)} laboratoires`,
        href: `/prothesistes/${d.slug}/`,
        image: carteDepartement(d.slug, `Contour du département ${d.nom}`),
      })),
      bouton: { text: 'Rechercher un laboratoire', url: '/recherche/?profession=prothesistes' },
      attribution: ATTRIBUTION_CARTES,
    },
    {
      valeur: 'formations',
      libelle: 'Formations',
      sousTitre: 'Les formations mises en avant.',
      cartes: formations.map((f) => {
        const type = f.type && (FORMATION_TYPES as readonly string[]).includes(PAGE_PAR_TYPE[f.type] ?? '') ? PAGE_PAR_TYPE[f.type] : null
        return {
          title: f.titre,
          description: [f.ville, f.diplome, f.duree].filter(Boolean).join(' · '),
          href: type ? `/formation/${type}/` : '/formation/',
          image: f.image ? { src: f.image.url, alt: f.image.alt } : undefined,
        }
      }),
      bouton: { text: 'Rechercher une formation', url: '/formation/' },
    },
  ].filter((o) => o.cartes.length > 0)

  if (onglets.length === 0) return null
  return <ExploreTabs onglets={onglets} />
}
