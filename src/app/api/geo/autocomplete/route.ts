import { sql } from 'drizzle-orm'
import { db } from '@/db'

/**
 * Autocomplétion de localisation : communes, départements et régions.
 *
 * Les communes sont cherchées dans `communes.nom_recherche`, forme minuscule
 * sans accents portée par un index trigramme. Deux critères combinés : le
 * préfixe, qui répond à la frappe naturelle, et la similarité trigramme, qui
 * rattrape les fautes et les accents manquants. Le classement privilégie les
 * communes peuplées : quelqu'un qui tape « sa » cherche plus souvent
 * Saint-Étienne qu'un hameau homonyme.
 *
 * Les départements et les régions sont peu nombreux : ils sont cherchés sur
 * leur nom translittéré à la volée, sans index, et passent en tête de liste
 * quand ils correspondent. Un département se trouve aussi par son code,
 * « 33 » ou « 2A ». Les régions sont celles en vigueur depuis 2016, telles
 * que la table `regions` les porte.
 */
type SuggestionCommune = {
  type: 'commune'
  nom: string
  slug: string
  code_insee: string
  departement_nom: string
  departement_slug: string
  code_postal: string | null
  lon: number | null
  lat: number | null
}
type SuggestionDepartement = { type: 'departement'; nom: string; slug: string; code: string; region_nom: string }
type SuggestionRegion = { type: 'region'; nom: string; slug: string; code: string }

/** Même translittération que `formeCherchable` côté import. */
function normaliser(valeur: string): string {
  return valeur
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Translittération SQL d'un nom, alignée sur `normaliser`, pour les tables sans colonne cherchable. */
const nomCherchable = (colonne: ReturnType<typeof sql.raw>) =>
  sql`lower(translate(${colonne}, 'ÀÂÄÉÈÊËÎÏÔÖÙÛÜÇàâäéèêëîïôöùûüç''-', 'AAAEEEEIIOOUUUCaaaeeeeiioouuuc  '))`

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get('q') ?? '').trim()
  if (q.length < 2) return Response.json({ suggestions: [] })

  const estCodePostal = /^\d{2,5}$/.test(q)
  const estCodeDepartement = /^(\d{2}|2a|2b|97\d)$/i.test(q)
  const cherche = normaliser(q)

  const [departements, regions, communes] = await Promise.all([
    db.execute<SuggestionDepartement>(sql`
      SELECT 'departement' AS type, d.nom, d.slug, d.code, r.nom AS region_nom
      FROM departements d JOIN regions r ON r.code = d.region_code
      -- Seuls les départements où l'annuaire a au moins un lieu d'exercice.
      WHERE EXISTS (SELECT 1 FROM communes c JOIN lieux_exercice l ON l.code_insee = c.code_insee WHERE c.departement_code = d.code)
        AND ${
        estCodeDepartement
          ? sql`d.code = ${q.toUpperCase()}`
          : sql`(${nomCherchable(sql.raw('d.nom'))} LIKE ${cherche + '%'} OR similarity(${nomCherchable(sql.raw('d.nom'))}, ${cherche}) > 0.4)`
      }
      ORDER BY (${nomCherchable(sql.raw('d.nom'))} LIKE ${cherche + '%'}) DESC, d.nom
      LIMIT 3
    `),
    estCodePostal
      ? Promise.resolve({ rows: [] as SuggestionRegion[] })
      : db.execute<SuggestionRegion>(sql`
          SELECT 'region' AS type, r.nom, r.slug, r.code
          FROM regions r
          WHERE EXISTS (SELECT 1 FROM departements d JOIN communes c ON c.departement_code = d.code JOIN lieux_exercice l ON l.code_insee = c.code_insee WHERE d.region_code = r.code)
            AND (${nomCherchable(sql.raw('r.nom'))} LIKE ${cherche + '%'} OR similarity(${nomCherchable(sql.raw('r.nom'))}, ${cherche}) > 0.4)
          ORDER BY (${nomCherchable(sql.raw('r.nom'))} LIKE ${cherche + '%'}) DESC, r.nom
          LIMIT 2
        `),
    db.execute<SuggestionCommune>(sql`
      SELECT 'commune' AS type, c.nom, c.slug, c.code_insee,
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
    `),
  ])

  const tetes = [...regions.rows, ...departements.rows]
  const suggestions = [...tetes, ...communes.rows].slice(0, 8)

  return Response.json({ suggestions }, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=3600' } })
}
