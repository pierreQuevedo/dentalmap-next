/** Les résultats de la recherche de l'en-tête, partagés entre la route et le panneau. */
export type ResultatUniversel = { titre: string; detail: string; href: string }
export type ResultatsUniversels = {
  professionnels: ResultatUniversel[]
  formations: ResultatUniversel[]
  emploi: ResultatUniversel[]
  annonces: ResultatUniversel[]
}

export const AUCUN_RESULTAT: ResultatsUniversels = { professionnels: [], formations: [], emploi: [], annonces: [] }
