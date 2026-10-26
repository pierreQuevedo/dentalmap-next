import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getPraticiensDansEmprise } from '@/lib/annuaire/queries'
import { EMPRISE_FRANCE, type Emprise } from '@/lib/annuaire/emprise'
import { PROFESSION_PAR_BASE } from '@/lib/annuaire/types'
import { baseRecherche } from '@/lib/annuaire/destination-recherche'
import { destinationRecherche } from '@/lib/annuaire/destination-lieu'
import { chemin } from '@/components/annuaire/primitives'
import { MiseEnPageRecherche } from '@/components/recherche/mise-en-page'

/**
 * Recherche par localisation.
 *
 * Volontairement hors index : les combinaisons de paramètres sont infinies et
 * les pages canoniques sont les pages de commune, de département et de
 * région, qui ont la même mise en page. Le robots.txt l'exclut également.
 *
 * Le classement est la distance au centre de la carte, puis l'ordre
 * alphabétique à égalité. C'est la seule règle de tri du site, et elle est
 * affichée sous la liste.
 */
export const metadata: Metadata = {
  title: 'Rechercher un professionnel',
  robots: { index: false, follow: true },
}

export const instant = false

type Params = { profession?: string; lieu?: string; q?: string; page?: string; bbox?: string }

/** `ouest,sud,est,nord`, l'emprise de la carte quittée quand la cible change depuis la barre. */
function lireEmprise(bbox: string | undefined): Emprise | null {
  const n = (bbox ?? '').split(',').map(Number)
  if (n.length !== 4 || n.some((x) => !Number.isFinite(x))) return null
  const [ouest, sud, est, nord] = n as [number, number, number, number]
  if (ouest >= est || sud >= nord || sud < -90 || nord > 90) return null
  return { ouest, sud, est, nord }
}

export default async function Recherche(props: { searchParams: Promise<Params> }) {
  const sp = await props.searchParams

  /*
   * Formation, recherche vide, lieu trouvé : l'adresse habituelle. Le proxy
   * l'a normalement déjà fait par une vraie redirection HTTP ; ceci est le
   * secours, que la page envoyée en flux ne peut faire qu'au navigateur.
   */
  const destination = await destinationRecherche(sp)
  if (destination) redirect(chemin(destination))

  const base = baseRecherche(sp.profession)
  const profession = PROFESSION_PAR_BASE[base]

  /*
   * Changement de cible depuis la barre : la carte reste exactement où elle
   * était. Le lieu tapé n'est alors qu'affiché dans la barre, il n'est ni
   * résolu ni suivi d'une redirection vers sa page. Sans emprise ni lieu
   * trouvé, la carte de France.
   */
  const empriseGardee = lireEmprise(sp.bbox)

  // La carte est toujours là, même avant la première recherche : elle montre la
  // couverture nationale au lieu d'un demi-écran vide, et la mise en page ne
  // change pas de forme une fois la commune saisie.
  const emprise = empriseGardee ?? EMPRISE_FRANCE

  const page = Math.max(1, Math.trunc(Number(sp.page)) || 1)
  const initial = await getPraticiensDansEmprise(profession, emprise, page)

  /*
   * Une nouvelle recherche remonte tout le bloc client. L'état de la carte et
   * celui de la liste ne sont pas dérivés des propriétés mais initialisés avec
   * elles : sans cette clé, arriver sur `/recherche/?q=lyon` depuis Bordeaux
   * laisserait la carte et les résultats sur Bordeaux.
   */
  return (
    <MiseEnPageRecherche
      cle={`${base}:${empriseGardee ? sp.bbox : 'france'}`}
      base={base}
      emprise={emprise}
      initial={initial}
      valeurLieu={sp.q ?? ''}
      enTete={<h1 className="text-2xl font-semibold tracking-tight text-fg">Rechercher un professionnel</h1>}
    />
  )
}
