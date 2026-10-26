import { chercherCommune, chercherTerritoire, designeExactement, getCommuneParCode } from './queries'
import { baseRecherche, destinationImmediate, type ParamsRecherche } from './destination-recherche'

/**
 * Destination complète d'une recherche, lieu compris : servie au proxy par
 * `/api/annuaire/destination/`, et appelée par la page en secours.
 */
export async function destinationRecherche(p: ParamsRecherche): Promise<string | null> {
  const immediate = destinationImmediate(p)
  if (immediate !== undefined) return immediate
  const base = baseRecherche(p.profession)

  // `lieu` porte un code INSEE choisi dans les suggestions ; `q` la saisie brute.
  let commune = p.lieu ? await getCommuneParCode(p.lieu) : null
  const q = p.q?.trim()
  if (!commune && q) {
    /*
     * Une région ou un département ont leur page, qui est une recherche déjà
     * faite dessus. Une région nommée exactement l'emporte toujours ; un
     * département nommé exactement cède à la commune du même nom, Paris est
     * d'abord une ville ; sinon le territoire ne sert que faute de commune.
     */
    const [territoire, trouvee] = await Promise.all([chercherTerritoire(q), chercherCommune(q)])
    const communeExacte = trouvee !== null && designeExactement(q, trouvee.nom)
    const versTerritoire = territoire !== null && (territoire.exact ? territoire.type === 'region' || !communeExacte : trouvee === null)
    if (versTerritoire) return `/${base}/${territoire.slug}/`
    commune = trouvee
  }
  // Une commune a sa page, même mise en page.
  return commune ? `/${base}/${commune.departementSlug}/${commune.slug}/` : null
}
