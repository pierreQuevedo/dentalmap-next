import { estBaseUrl, type BaseUrl } from './types'

/**
 * Où mène une recherche `/recherche/?profession=…&q=…` : l'adresse habituelle
 * de ce qui est cherché, ou `null` pour rester sur la page de recherche.
 *
 * Appelée par le proxy pour une vraie redirection HTTP, et par la page
 * elle-même en secours : la page est envoyée en flux, sa redirection
 * n'arriverait qu'au navigateur. Ce fichier ne lit pas la base, le proxy
 * l'importe ; la résolution d'un lieu est dans `destination-lieu.ts`.
 */

export type ParamsRecherche = { profession?: string | null; lieu?: string | null; q?: string | null; bbox?: string | null }

/**
 * Cibles du champ unique de l'accueil qui ne sont pas des praticiens : la
 * page de la formation, y compris sans JavaScript.
 */
const AILLEURS: Record<string, string> = {
  ecoles: '/formation/ecoles-de-prothese/',
  formations: '/formation/',
}

export function baseRecherche(profession: string | null | undefined): BaseUrl {
  return profession && estBaseUrl(profession) ? profession : 'dentistes'
}

/** Ce qui se décide sans la base : formation, ou recherche vide. `undefined` : il faut résoudre le lieu. */
export function destinationImmediate(p: ParamsRecherche): string | null | undefined {
  const ailleurs = p.profession ? AILLEURS[p.profession] : undefined
  if (ailleurs) {
    const lieu = p.lieu ?? p.q
    return lieu ? `${ailleurs}?lieu=${encodeURIComponent(lieu)}` : ailleurs
  }
  // Changement de cible depuis la barre : la carte reste où elle était, sur la page de recherche.
  if (p.bbox) return null
  // Rien à chercher : la page de la profession (/dentistes/).
  if (!p.lieu && !p.q?.trim()) return `/${baseRecherche(p.profession)}/`
  return undefined
}
