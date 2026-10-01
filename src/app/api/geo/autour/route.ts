import { getRayonPourN, professionDepuisBase } from '@/lib/annuaire/queries'

/**
 * Rayon, en mètres, qui contient les n praticiens les plus proches d'un
 * point. Sert au cadrage « près de chez vous » : la carte se resserre autour
 * de l'utilisateur sans jamais montrer moins de dix professionnels.
 *
 * `null` quand la profession n'a aucun praticien géolocalisé, ce qui n'arrive
 * pas en pratique mais ne doit pas casser le cadrage.
 */
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams
  const profession = professionDepuisBase(p.get('profession') ?? 'dentistes')
  if (!profession) return Response.json({ erreur: 'profession inconnue' }, { status: 400 })
  const lon = Number(p.get('lon'))
  const lat = Number(p.get('lat'))
  if (!Number.isFinite(lon) || !Number.isFinite(lat) || Math.abs(lon) > 180 || Math.abs(lat) > 90) {
    return Response.json({ erreur: 'position attendue en lon et lat' }, { status: 400 })
  }
  const n = Math.min(50, Math.max(1, Math.trunc(Number(p.get('n') ?? '10')) || 10))
  const rayon = await getRayonPourN(profession, lon, lat, n)
  return Response.json({ rayon }, { headers: { 'Cache-Control': 'private, max-age=60' } })
}
