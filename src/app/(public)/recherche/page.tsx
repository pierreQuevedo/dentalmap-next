import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { chercherCommune, chercherTerritoire, designeExactement, getCommuneParCode, getPraticiensDansEmprise } from '@/lib/annuaire/queries'
import { EMPRISE_FRANCE, empriseAutour } from '@/lib/annuaire/emprise'
import { estBaseUrl, PROFESSION_PAR_BASE, type BaseUrl } from '@/lib/annuaire/types'
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

const RAYON_METRES = 20_000

type Params = { profession?: string; lieu?: string; q?: string; page?: string }

/**
 * Cibles du champ unique de l'accueil qui ne sont pas des praticiens.
 *
 * Le formulaire de l'accueil part toujours ici, y compris sans JavaScript :
 * c'est cette page qui renvoie vers la formation plutôt que le navigateur, de
 * sorte que le parcours soit identique avec et sans script.
 */
const AILLEURS: Record<string, string> = {
  ecoles: '/formation/ecoles-de-prothese/',
  formations: '/formation/',
}

export default async function Recherche(props: { searchParams: Promise<Params> }) {
  const sp = await props.searchParams

  const ailleurs = sp.profession ? AILLEURS[sp.profession] : undefined
  if (ailleurs) {
    const lieu = sp.lieu ?? sp.q
    redirect(chemin(lieu ? `${ailleurs}?lieu=${encodeURIComponent(lieu)}` : ailleurs))
  }

  const base: BaseUrl = sp.profession && estBaseUrl(sp.profession) ? sp.profession : 'dentistes'
  const profession = PROFESSION_PAR_BASE[base]

  // `lieu` porte un code INSEE choisi dans les suggestions ; `q` la saisie brute
  // quand le formulaire est envoyé sans JavaScript, ou quand la cible change
  // depuis une page de territoire.
  let commune = sp.lieu ? await getCommuneParCode(sp.lieu) : null
  if (!commune && sp.q) {
    /*
     * Une région ou un département ont leur page, qui est une recherche déjà
     * faite dessus : on y va. Une région nommée exactement l'emporte toujours ;
     * un département nommé exactement cède à la commune du même nom, Paris
     * est d'abord une ville ; sinon le territoire ne sert que faute de
     * commune.
     */
    const [territoire, trouvee] = await Promise.all([chercherTerritoire(sp.q), chercherCommune(sp.q)])
    const communeExacte = trouvee !== null && designeExactement(sp.q, trouvee.nom)
    const versTerritoire =
      territoire !== null &&
      (territoire.exact ? territoire.type === 'region' || !communeExacte : trouvee === null)
    if (versTerritoire) redirect(chemin(`/${base}/${territoire.slug}/`))
    commune = trouvee
  }

  // La carte est toujours là, même avant la première recherche : elle montre la
  // couverture nationale au lieu d'un demi-écran vide, et la mise en page ne
  // change pas de forme une fois la commune saisie.
  const emprise =
    commune?.lon != null && commune.lat != null
      ? empriseAutour(commune.lon, commune.lat, RAYON_METRES)
      : EMPRISE_FRANCE

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
      cle={`${base}:${commune?.codeInsee ?? 'france'}`}
      base={base}
      emprise={emprise}
      initial={initial}
      valeurLieu={commune?.nom ?? sp.q ?? ''}
      lieu={commune ? { type: 'commune', code_insee: commune.codeInsee, slug: commune.slug, departement_slug: commune.departementSlug } : undefined}
      enTete={<h1 className="text-2xl font-semibold tracking-tight text-fg">Rechercher un professionnel</h1>}
    />
  )
}
