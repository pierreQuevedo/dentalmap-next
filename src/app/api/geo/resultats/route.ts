import { PAR_PAGE_CARTE, type Emprise, type Origine } from '@/lib/annuaire/emprise'
import { lireFiltres } from '@/lib/annuaire/filtres'
import { getPraticiensDansEmprise, professionDepuisBase } from '@/lib/annuaire/queries'

/**
 * Résultats d'une emprise de carte, paginés.
 *
 * Appelée par la colonne de gauche à chaque déplacement de la carte et à
 * chaque changement de page. La page rend déjà la première page côté serveur :
 * cette route ne sert qu'aux déplacements, ce qui laisse la recherche
 * utilisable sans JavaScript.
 *
 * Les coordonnées sont arrondies à quatre décimales, soit une dizaine de
 * mètres, avant d'atteindre la base : deux déplacements voisins produisent
 * alors la même URL et retombent sur la même entrée de CDN. Sans cet arrondi,
 * chaque pixel de déplacement inventerait une clé de cache neuve.
 */
const ARRONDI = 4

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams

  const profession = professionDepuisBase(p.get('profession') ?? 'dentistes')
  if (!profession) return Response.json({ erreur: 'profession inconnue' }, { status: 400 })

  const bbox = (p.get('bbox') ?? '').split(',').map(Number)
  if (bbox.length !== 4 || bbox.some((n) => !Number.isFinite(n))) {
    return Response.json({ erreur: 'bbox attendue au format ouest,sud,est,nord' }, { status: 400 })
  }
  const [ouest, sud, est, nord] = bbox.map((n) => Number(n.toFixed(ARRONDI))) as [number, number, number, number]
  if (est <= ouest || nord <= sud) {
    return Response.json({ erreur: 'emprise vide' }, { status: 400 })
  }

  const page = Math.max(1, Math.trunc(Number(p.get('page') ?? '1')) || 1)
  const emprise: Emprise = { ouest, sud, est, nord }

  // Lieu choisi sur la carte, d'où la distance est mesurée. Absent, c'est le centre.
  let origine: Origine | null = null
  if (p.has('centre')) {
    const [lon, lat] = (p.get('centre') ?? '').split(',').map(Number)
    if (lon === undefined || lat === undefined || !Number.isFinite(lon) || !Number.isFinite(lat)) {
      return Response.json({ erreur: 'centre attendu au format lon,lat' }, { status: 400 })
    }
    origine = { lon: Number(lon.toFixed(ARRONDI)), lat: Number(lat.toFixed(ARRONDI)) }
  }

  const resultat = await getPraticiensDansEmprise(profession, emprise, page, PAR_PAGE_CARTE, lireFiltres(p), origine)

  return Response.json(resultat, {
    headers: { 'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600' },
  })
}
