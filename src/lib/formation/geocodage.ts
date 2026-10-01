import { cacheLife, cacheTag } from 'next/cache'
import { extraireAdresse } from './faculte'

/**
 * Positions d'une faculté et de ses centres de soins, pour la carte de la
 * fiche.
 *
 * Les adresses viennent du CMS en texte libre ; elles sont géocodées à la
 * demande contre la Base Adresse Nationale, servie par la Géoplateforme, et
 * mises en cache avec la fiche. Un lieu sans adresse assez précise, ou qui ne
 * se résout qu'au centre d'une commune, n'est pas placé : un point posé au
 * hasard d'une ville tromperait plus qu'il n'aiderait.
 */
export type Position = { lon: number; lat: number; libelle: string }

const API = 'https://data.geopf.fr/geocodage/search'
const SCORE_MINIMUM = 0.5

type Reponse = {
  features?: { geometry: { coordinates: [number, number] }; properties: { label: string; score: number; type: string } }[]
}

async function geocoder(adresse: string): Promise<Position | null> {
  try {
    const url = `${API}?q=${encodeURIComponent(adresse)}&limit=1`
    const r = await fetch(url, { signal: AbortSignal.timeout(4000) })
    if (!r.ok) return null
    const d = (await r.json()) as Reponse
    const f = d.features?.[0]
    if (!f || f.properties.score < SCORE_MINIMUM || f.properties.type === 'municipality') return null
    return { lon: f.geometry.coordinates[0], lat: f.geometry.coordinates[1], libelle: f.properties.label }
  } catch {
    return null
  }
}

export async function getPositionsFormation(slug: string, adresses: string[]): Promise<(Position | null)[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('wp', 'wp:formation', `wp:formation:${slug}`)
  return Promise.all(adresses.map((a) => geocoder(extraireAdresse(a))))
}
