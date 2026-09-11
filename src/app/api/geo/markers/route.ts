import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { professionDepuisBase } from '@/lib/annuaire/queries'

/**
 * Marqueurs dans une emprise, au format GeoJSON.
 *
 * Appelé par la carte à chaque déplacement. La réponse est mise en cache une
 * heure côté CDN : les positions ne bougent qu'au rythme des imports.
 *
 * Les positions approximatives, placées au centre d'une commune, sont exclues :
 * afficher un cabinet au milieu d'une ville alors qu'il est à trois kilomètres
 * tromperait le visiteur sur une carte.
 */
const MAX_MARQUEURS = 500

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams
  const profession = professionDepuisBase(p.get('profession') ?? 'dentistes')
  if (!profession) return Response.json({ erreur: 'profession inconnue' }, { status: 400 })

  const bbox = (p.get('bbox') ?? '').split(',').map(Number)
  if (bbox.length !== 4 || bbox.some((n) => !Number.isFinite(n))) {
    return Response.json({ erreur: 'bbox attendue au format ouest,sud,est,nord' }, { status: 400 })
  }
  const [ouest, sud, est, nord] = bbox as [number, number, number, number]

  const { rows } = await db.execute<{
    slug: string
    nom: string
    prenom: string | null
    raison_sociale: string | null
    adresse_ligne: string | null
    commune_slug: string
    departement_slug: string
    lon: number
    lat: number
  }>(sql`
    SELECT DISTINCT ON (p.id)
           p.slug, p.nom, p.prenom, p.raison_sociale,
           l.adresse_ligne, c.slug AS commune_slug, d.slug AS departement_slug,
           ST_X(l.position) AS lon, ST_Y(l.position) AS lat
    FROM lieux_exercice l
    JOIN praticiens p ON p.id = l.praticien_id
    JOIN communes c ON c.code_insee = l.code_insee
    JOIN departements d ON d.code = c.departement_code
    WHERE p.profession = ${profession}
      AND p.deleted_at IS NULL
      AND NOT l.position_approximative
      AND l.position && ST_MakeEnvelope(${ouest}, ${sud}, ${est}, ${nord}, 4326)
    ORDER BY p.id, l.principal DESC
    LIMIT ${MAX_MARQUEURS}
  `)

  return Response.json(
    {
      type: 'FeatureCollection',
      features: rows.map((r) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [r.lon, r.lat] },
        properties: {
          slug: r.slug,
          nom: r.nom,
          prenom: r.prenom,
          raisonSociale: r.raison_sociale,
          adresse: r.adresse_ligne,
          commune: r.commune_slug,
          departement: r.departement_slug,
        },
      })),
      tronque: rows.length >= MAX_MARQUEURS,
    },
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' } },
  )
}
