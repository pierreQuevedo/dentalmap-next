import { sql, type SQL } from 'drizzle-orm'
import { db } from '@/db'
import { CELLULES_PAR_TUILE, PIXELS_PAR_TUILE, SEUIL_POINTS } from '@/lib/annuaire/emprise'
import { lireFiltres } from '@/lib/annuaire/filtres'
import { clauseFiltres, professionDepuisBase } from '@/lib/annuaire/queries'
import type { Profession } from '@/lib/annuaire/types'

/**
 * Tuiles vectorielles des praticiens, produites par PostGIS.
 *
 * Remplace le chargement par emprise, qui redemandait la totalité des points
 * visibles à chaque déplacement et coupait silencieusement au-delà de cinq
 * cents résultats. Ici le zoom est dans l'URL : la requête en dépend, chaque
 * tuile se met en cache séparément sur la CDN, et MapLibre ne redemande que
 * les tuiles qui lui manquent.
 *
 * Deux régimes selon le zoom. En dessous de 14 la base agrège sur une grille ;
 * à partir de 14 elle agrège par adresse exacte.
 *
 * Une entité de tuile est donc de l'une des deux formes suivantes, et le style
 * de la carte les distingue sur la présence de `point_count` :
 *
 * - une grappe de grille, qui porte `point_count` et se défait en zoomant ;
 * - un lieu, qui porte `groupe`, la liste JSON des praticiens qui y exercent.
 *   Elle compte un élément la plupart du temps, quatorze dans un centre de
 *   santé. Aucun zoom ne séparera jamais ces quatorze-là puisqu'ils partagent
 *   la même position : c'est le popup qui doit tous les montrer.
 */
const ETENDUE = 4096

/*
 * Le nombre de cellules par tuile est entier : les bords de tuile tombent
 * alors toujours sur un bord de cellule, et une même grappe ne peut pas être
 * calculée deux fois, une moitié dans chaque tuile voisine. C'est ce qui
 * permet de se passer de marge sur la requête des grappes, et donc de
 * doublons à l'écran. La valeur vit dans `emprise.ts`, avec le rayon des
 * cercles, parce que le placement des grappes en dépend des deux côtés.
 */

/** Circonférence de la Terre en projection Web Mercator, largeur du monde au zoom 0. */
const CIRCONFERENCE = 40075016.6855785

/** Marge des tuiles de points, en fraction de tuile : un cercle à cheval sur un bord reste entier. */
const MARGE = 0.0625

const CACHE = {
  // Les positions ne bougent qu'au rythme des imports. Une heure de fraîcheur
  // côté CDN, et une journée de service en arrière-plan pendant le renouvellement.
  'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ profession: string; z: string; x: string; y: string }> },
) {
  const params = await ctx.params
  const profession = professionDepuisBase(params.profession)
  if (!profession) return new Response('profession inconnue', { status: 404 })

  const z = Number(params.z)
  const x = Number(params.x)
  const y = Number(params.y)
  if (!estTuileValide(z, x, y)) return new Response('tuile hors limites', { status: 400 })

  // Les mêmes filtres que la liste, lus dans l'URL de la tuile : points et
  // grappes ne comptent que ce que la colonne de gauche montre.
  const clause = clauseFiltres(lireFiltres(new URL(request.url).searchParams))
  const tuile = z >= SEUIL_POINTS ? await tuilePoints(profession, z, x, y, clause) : await tuileGrappes(profession, z, x, y, clause)

  // Une tuile vide est une réponse légitime, pas une erreur : MapLibre
  // l'interprète comme « rien à cet endroit » et ne la redemande pas.
  if (!tuile || tuile.length === 0) return new Response(null, { status: 204, headers: CACHE })

  return new Response(new Uint8Array(tuile), {
    headers: { 'Content-Type': 'application/vnd.mapbox-vector-tile', ...CACHE },
  })
}

function estTuileValide(z: number, x: number, y: number): boolean {
  if (![z, x, y].every((n) => Number.isInteger(n))) return false
  if (z < 0 || z > 22) return false
  const cote = 2 ** z
  return x >= 0 && x < cote && y >= 0 && y < cote
}

/**
 * Régime grappes, en dessous du seuil.
 *
 * L'agrégation se fait en Web Mercator et non en degrés : une grille en
 * degrés donnerait des cellules deux fois plus hautes que larges à Dunkerque
 * et des grappes visiblement étirées.
 *
 * Une cellule qui ne contient qu'un praticien ne sort pas en grappe mais en
 * point, avec tous ses attributs. Sans quoi un cabinet isolé s'afficherait en
 * pastille noire portant le chiffre 1, et surtout resterait inconsultable : le
 * clic sur une grappe zoome, il n'ouvre pas de fiche.
 */
async function tuileGrappes(profession: Profession, z: number, x: number, y: number, clause: SQL) {
  const { rows } = await db.execute<{ tuile: Buffer | null }>(sql`
    WITH bornes AS MATERIALIZED (
      SELECT ST_TileEnvelope(${z}, ${x}, ${y}) AS tuile,
             ST_Transform(ST_TileEnvelope(${z}, ${x}, ${y}), 4326) AS emprise,
             ${CIRCONFERENCE} / power(2, ${z}) / ${CELLULES_PAR_TUILE} AS cote,
             -- Mètres par pixel d'écran, pour convertir le rayon des cercles.
             ${CIRCONFERENCE} / power(2, ${z}) / ${PIXELS_PAR_TUILE} AS metres_par_pixel
    ),
    retenus AS (
      SELECT DISTINCT ON (p.id)
             ST_Transform(l.position, 3857) AS position,
             p.slug, p.civilite, p.nom, p.prenom, p.raison_sociale, p.statut_verification,
             l.id AS lieu_id, l.adresse_ligne, l.code_postal, l.precision_position,
             (l.telephone_officiel IS NOT NULL) AS a_telephone,
             EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = p.id AND v.statut = 'acceptee') AS revendiquee,
             c.nom AS commune_nom, c.slug AS commune_slug, d.slug AS departement_slug
      FROM lieux_exercice l
      JOIN praticiens p ON p.id = l.praticien_id
      JOIN communes c ON c.code_insee = l.code_insee
      JOIN departements d ON d.code = c.departement_code
      WHERE p.profession = ${profession}
        AND p.deleted_at IS NULL
        AND NOT l.position_approximative
        AND l.position && (SELECT emprise FROM bornes)${clause}
      ORDER BY p.id, l.principal DESC
    ),
    cellules AS (
      SELECT count(*)::int AS n,
             ST_Centroid(ST_Collect(r.position)) AS centre,
             json_agg(
               json_build_object(
                 'slug', r.slug, 'civilite', r.civilite, 'nom', r.nom, 'prenom', r.prenom,
                 'raisonSociale', r.raison_sociale, 'statutVerification', r.statut_verification,
                 'adresseLigne', r.adresse_ligne, 'codePostal', r.code_postal,
                 'lieuId', r.lieu_id, 'aTelephone', r.a_telephone, 'revendiquee', r.revendiquee, 'communeNom', r.commune_nom,
                 'communeSlug', r.commune_slug, 'departementSlug', r.departement_slug,
                 'precisionPosition', r.precision_position
               ) ORDER BY r.nom, r.prenom
             )::text AS membres
      FROM retenus r
      -- Cellule par partie entière, et non par ST_SnapToGrid : celle-ci
      -- arrondit au nœud le plus proche, ce qui centre les cellules sur les
      -- multiples du côté et fait tomber les bords de tuile au milieu d'une
      -- cellule, calculée alors deux fois, une moitié par tuile. Avec la
      -- partie entière, les bords de cellule et de tuile coïncident.
      GROUP BY floor(ST_X(r.position) / (SELECT cote FROM bornes)), floor(ST_Y(r.position) / (SELECT cote FROM bornes))
    ),
    /*
     * Placement : le centre des membres, ramené dans sa cellule d'au moins
     * un rayon de cercle. Deux grappes voisines gardent ainsi un cercle chacune
     * dans sa cellule, sans jamais se chevaucher ni couvrir leurs chiffres. Le
     * rayon suit l'effectif comme dans le style de la carte, plus deux pixels
     * de trait ; un lieu seul est un point de sept pixels.
     *
     * MapLibre affiche une tuile de zoom z dès le zoom z − 0,5, réduite d'un
     * facteur racine de deux, alors que les cercles gardent leur taille à
     * l'écran : le rayon de placement est donc majoré d'autant, pour que la
     * garantie tienne au zoom le plus défavorable.
     */
    placees AS (
      SELECT c.n, c.membres,
             ST_SetSRID(ST_MakePoint(
               LEAST(GREATEST(ST_X(c.centre), x0 + r), x0 + cote - r),
               LEAST(GREATEST(ST_Y(c.centre), y0 + r), y0 + cote - r)
             ), 3857) AS centre
      FROM cellules c,
           LATERAL (SELECT cote, metres_par_pixel FROM bornes) b,
           LATERAL (SELECT floor(ST_X(c.centre) / b.cote) * b.cote AS x0, floor(ST_Y(c.centre) / b.cote) * b.cote AS y0) o,
           LATERAL (SELECT (CASE WHEN c.n >= 50 THEN 22 WHEN c.n >= 10 THEN 18 WHEN c.n > 1 THEN 14 ELSE 7 END + 2) * 1.4143 * b.metres_par_pixel AS r) rr
    )
    SELECT ST_AsMVT(q, 'praticiens', ${ETENDUE}, 'geom') AS tuile
    FROM (
      SELECT ST_AsMVTGeom(c.centre, (SELECT tuile FROM bornes), ${ETENDUE}, 64, true) AS geom,
             CASE WHEN c.n > 1 THEN c.n END AS point_count,
             CASE
               WHEN c.n > 1000
                 THEN replace(round(c.n / 1000.0, 1)::text, '.', ',') || ' k'
               WHEN c.n > 1 THEN c.n::text
             END AS point_count_abrege,
             CASE WHEN c.n = 1 THEN c.membres END AS groupe,
             CASE WHEN c.n = 1 THEN 1 END AS groupe_n
      FROM placees c
    ) q
    WHERE q.geom IS NOT NULL
  `)
  return rows[0]?.tuile ?? null
}

/**
 * Régime points, au-delà du seuil : un objet par adresse, pas par praticien.
 *
 * Deux praticiens qui exercent au même cabinet ont la même position au mètre
 * près. Émis séparément, leurs cercles se superposent exactement : le clic
 * n'en atteint jamais qu'un, et les autres sont inaccessibles quel que soit le
 * zoom. Ils sortent donc en un seul objet, qui porte la liste de ses membres.
 *
 * La liste reprend exactement la forme d'un `PraticienResume`, de sorte que le
 * popup rende les mêmes fiches que les listes, sans conversion ni requête
 * supplémentaire au clic.
 *
 * Les positions approximatives restent exclues : placer un cabinet au centre
 * d'une commune alors qu'il est à trois kilomètres tromperait le visiteur.
 */
async function tuilePoints(profession: Profession, z: number, x: number, y: number, clause: SQL) {
  const { rows } = await db.execute<{ tuile: Buffer | null }>(sql`
    WITH bornes AS MATERIALIZED (
      SELECT ST_TileEnvelope(${z}, ${x}, ${y}) AS tuile,
             ST_Transform(ST_TileEnvelope(${z}, ${x}, ${y}, margin => ${MARGE}), 4326) AS emprise
    ),
    retenus AS (
      SELECT DISTINCT ON (p.id)
             l.position,
             p.slug, p.civilite, p.nom, p.prenom, p.raison_sociale, p.statut_verification,
             l.id AS lieu_id, l.adresse_ligne, l.code_postal, l.precision_position,
             (l.telephone_officiel IS NOT NULL) AS a_telephone,
             EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = p.id AND v.statut = 'acceptee') AS revendiquee,
             c.nom AS commune_nom, c.slug AS commune_slug, d.slug AS departement_slug
      FROM lieux_exercice l
      JOIN praticiens p ON p.id = l.praticien_id
      JOIN communes c ON c.code_insee = l.code_insee
      JOIN departements d ON d.code = c.departement_code
      WHERE p.profession = ${profession}
        AND p.deleted_at IS NULL
        AND NOT l.position_approximative
        AND l.position && (SELECT emprise FROM bornes)${clause}
      ORDER BY p.id, l.principal DESC
    ),
    lieux AS (
      SELECT ST_Transform(r.position, 3857) AS position,
             count(*)::int AS n,
             json_agg(
               json_build_object(
                 'slug', r.slug, 'civilite', r.civilite, 'nom', r.nom, 'prenom', r.prenom,
                 'raisonSociale', r.raison_sociale, 'statutVerification', r.statut_verification,
                 'adresseLigne', r.adresse_ligne, 'codePostal', r.code_postal,
                 'lieuId', r.lieu_id, 'aTelephone', r.a_telephone, 'revendiquee', r.revendiquee, 'communeNom', r.commune_nom,
                 'communeSlug', r.commune_slug, 'departementSlug', r.departement_slug,
                 'precisionPosition', r.precision_position
               ) ORDER BY r.nom, r.prenom
             )::text AS membres
      FROM retenus r
      GROUP BY r.position
    )
    SELECT ST_AsMVT(q, 'praticiens', ${ETENDUE}, 'geom') AS tuile
    FROM (
      SELECT ST_AsMVTGeom(li.position, (SELECT tuile FROM bornes), ${ETENDUE}, 256, true) AS geom,
             li.n AS groupe_n,
             li.membres AS groupe
      FROM lieux li
    ) q
    WHERE q.geom IS NOT NULL
  `)
  return rows[0]?.tuile ?? null
}
