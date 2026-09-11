import { sql } from 'drizzle-orm'
import { db } from '@/db'

/**
 * Autocomplétion de localisation.
 *
 * Cherche dans `communes.nom_recherche`, forme minuscule sans accents portée
 * par un index trigramme. Deux critères combinés : le préfixe, qui répond à la
 * frappe naturelle, et la similarité trigramme, qui rattrape les fautes et les
 * accents manquants.
 *
 * Le classement privilégie les communes peuplées : quelqu'un qui tape « sa »
 * cherche plus souvent Saint-Étienne qu'un hameau homonyme.
 */
type Suggestion = {
  nom: string
  slug: string
  code_insee: string
  departement_nom: string
  departement_slug: string
  code_postal: string | null
  lon: number | null
  lat: number | null
}

/** Même translittération que `formeCherchable` côté import. */
function normaliser(valeur: string): string {
  return valeur
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get('q') ?? '').trim()
  if (q.length < 2) return Response.json({ suggestions: [] })

  const estCodePostal = /^\d{2,5}$/.test(q)
  const cherche = normaliser(q)

  const { rows } = await db.execute<Suggestion>(sql`
    SELECT c.nom, c.slug, c.code_insee,
           d.nom AS departement_nom, d.slug AS departement_slug,
           c.codes_postaux[1] AS code_postal,
           ST_X(c.centre) AS lon, ST_Y(c.centre) AS lat
    FROM communes c
    JOIN departements d ON d.code = c.departement_code
    WHERE ${
      estCodePostal
        ? sql`EXISTS (SELECT 1 FROM unnest(c.codes_postaux) cp WHERE cp LIKE ${q + '%'})`
        : sql`(c.nom_recherche LIKE ${cherche + '%'} OR c.nom_recherche % ${cherche})`
    }
    ORDER BY
      ${
        estCodePostal
          ? sql`c.population DESC NULLS LAST`
          : sql`(c.nom_recherche LIKE ${cherche + '%'}) DESC,
                similarity(c.nom_recherche, ${cherche}) DESC,
                c.population DESC NULLS LAST`
      }
    LIMIT 8
  `)

  return Response.json(
    { suggestions: rows },
    { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=3600' } },
  )
}
