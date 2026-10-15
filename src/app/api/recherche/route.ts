import { rechercheUniverselle } from '@/lib/recherche/universelle'

/**
 * Recherche de l'en-tête : professionnels, formations, offres d'emploi et
 * annonces de cession pour une saisie. Les lieux passent par
 * `/api/geo/autocomplete/`.
 */
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get('q') ?? '').trim().slice(0, 80)
  const resultats = await rechercheUniverselle(q)
  return Response.json(resultats, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=600' } })
}
