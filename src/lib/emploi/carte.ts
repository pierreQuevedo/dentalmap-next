import { EMPRISE_FRANCE, empriseAutour, reunir, type Emprise } from '@/lib/annuaire/emprise'

/**
 * Cadrage de la carte d'une liste d'offres : le rectangle des offres situées,
 * réuni avec un carré autour du point d'origine de la page, pour que la
 * commune reste visible même quand ses offres sont groupées dans un quartier.
 */
export function empriseOffres(points: { lon: number | null; lat: number | null }[], centre: { lon: number | null; lat: number | null } | null, rayonMetres = 2500): Emprise {
  const situes = points.filter((p): p is { lon: number; lat: number } => p.lon != null && p.lat != null)
  const autour = centre?.lon != null && centre.lat != null ? empriseAutour(centre.lon, centre.lat, rayonMetres) : null
  if (!situes.length) return autour ?? EMPRISE_FRANCE
  const lons = situes.map((p) => p.lon)
  const lats = situes.map((p) => p.lat)
  const marge = 0.01
  const e: Emprise = { ouest: Math.min(...lons) - marge, sud: Math.min(...lats) - marge, est: Math.max(...lons) + marge, nord: Math.max(...lats) + marge }
  return autour ? reunir(e, autour) : e
}
