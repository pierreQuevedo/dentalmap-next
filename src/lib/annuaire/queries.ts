/**
 * Accès aux données de l'annuaire.
 *
 * Toute fonction publique de ce module est mise en cache avec un profil et des
 * tags, conformément à la stratégie de l'architecture. Les tags permettent au
 * job de synchronisation et aux Server Actions de l'espace pro d'invalider
 * précisément ce qui a changé, sans purger l'ensemble.
 */
import { cacheLife, cacheTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import type { BaseUrl, Praticien, PraticienResume, Profession } from './types'
import { PROFESSION_PAR_BASE } from './types'

/**
 * Clé de tri alphabétique.
 *
 * Pour un praticien, on trie sur le nom de famille puis le prénom, convention
 * d'annuaire. Surtout pas sur la raison sociale : les fiches de l'Annuaire
 * Santé portent le nom du cabinet, qui est souvent celui d'un autre praticien,
 * par exemple « Cabinet du Dr Bibette » pour Madame Janelle.
 *
 * Pour un laboratoire, la raison sociale est le nom affiché, donc la clé.
 */
function cleDeTri(
  profession: Profession,
  p: { nom: string; prenom: string | null; raisonSociale: string | null },
): string {
  if (profession === 'prothesiste') return (p.raisonSociale || p.nom).toLocaleLowerCase('fr')
  return `${p.nom} ${p.prenom ?? ''}`.toLocaleLowerCase('fr')
}

/**
 * Taille d'une page de liste.
 *
 * Sans pagination, la page du 16e arrondissement de Paris pesait 879 Ko pour
 * 493 praticiens et mettait 1,6 seconde à s'afficher. 80 communes dépassent
 * 100 praticiens, jusqu'à 691 à Toulouse, et ce sont les pages qui comptent le
 * plus pour le référencement.
 */
export const PAR_PAGE = 50

export function professionDepuisBase(base: string): Profession | null {
  return base in PROFESSION_PAR_BASE ? PROFESSION_PAR_BASE[base as BaseUrl] : null
}

type LigneLieu = {
  id: string
  adresse_ligne: string | null
  code_postal: string | null
  telephone_officiel: string | null
  principal: boolean
  position_approximative: boolean
  lon: number | null
  lat: number | null
  commune_nom: string | null
  commune_slug: string | null
  departement_slug: string | null
}

/**
 * Fiche complète d'un praticien, résolue sur le couple département et commune.
 *
 * La résolution ne se fait jamais sur le seul slug : « Saint-Denis » existe dans
 * plusieurs départements, et une fiche ne doit être accessible que par son URL
 * canonique.
 *
 * Rend aussi les praticiens supprimés : c'est l'appelant qui décide d'un 410,
 * il a besoin de savoir que la fiche a existé.
 */
export async function getPraticien(
  profession: Profession,
  departementSlug: string,
  communeSlug: string,
  slug: string,
): Promise<Praticien | null> {
  'use cache'
  cacheLife('praticien')
  cacheTag('annuaire', `praticien:${slug}`)

  const { rows } = await db.execute<{
    id: string
    slug: string
    profession: Profession
    nom: string
    prenom: string | null
    raison_sociale: string | null
    rpps: string | null
    siren: string | null
    statut_verification: Praticien['statutVerification']
    indexable: boolean
    deleted_at: string | null
    updated_at: string
    lieux: LigneLieu[]
  }>(sql`
    SELECT p.id, p.slug, p.profession, p.nom, p.prenom, p.raison_sociale, p.rpps, p.siren,
           p.statut_verification, p.indexable, p.deleted_at, p.updated_at,
           COALESCE(
             (SELECT json_agg(x ORDER BY x.principal DESC, x.id)
              FROM (
                SELECT l.id, l.adresse_ligne, l.code_postal, l.telephone_officiel, l.principal,
                       l.position_approximative,
                       ST_X(l.position) AS lon, ST_Y(l.position) AS lat,
                       c.nom AS commune_nom, c.slug AS commune_slug, d.slug AS departement_slug
                FROM lieux_exercice l
                LEFT JOIN communes c ON c.code_insee = l.code_insee
                LEFT JOIN departements d ON d.code = c.departement_code
                WHERE l.praticien_id = p.id
              ) x),
             '[]'::json
           ) AS lieux
    FROM praticiens p
    WHERE p.slug = ${slug}
      AND p.profession = ${profession}
      AND EXISTS (
        SELECT 1 FROM lieux_exercice l
        JOIN communes c ON c.code_insee = l.code_insee
        JOIN departements d ON d.code = c.departement_code
        WHERE l.praticien_id = p.id AND c.slug = ${communeSlug} AND d.slug = ${departementSlug}
      )
    LIMIT 1
  `)

  const r = rows[0]
  if (!r) return null
  return {
    id: r.id,
    slug: r.slug,
    profession: r.profession,
    nom: r.nom,
    prenom: r.prenom,
    raisonSociale: r.raison_sociale,
    rpps: r.rpps,
    siren: r.siren,
    statutVerification: r.statut_verification,
    indexable: r.indexable,
    supprimeLe: r.deleted_at,
    majLe: r.updated_at,
    lieux: (r.lieux ?? []).map((l) => ({
      id: l.id,
      adresseLigne: l.adresse_ligne,
      codePostal: l.code_postal,
      telephone: l.telephone_officiel,
      principal: l.principal,
      approximative: l.position_approximative,
      lon: l.lon,
      lat: l.lat,
      communeNom: l.commune_nom,
      communeSlug: l.commune_slug,
      departementSlug: l.departement_slug,
    })),
  }
}

export type Commune = {
  codeInsee: string
  nom: string
  slug: string
  departementNom: string
  departementSlug: string
  population: number | null
  lon: number | null
  lat: number | null
}

export async function getCommune(departementSlug: string, communeSlug: string): Promise<Commune | null> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{
    code_insee: string
    nom: string
    slug: string
    departement_nom: string
    departement_slug: string
    population: number | null
    lon: number | null
    lat: number | null
  }>(sql`
    SELECT c.code_insee, c.nom, c.slug, d.nom AS departement_nom, d.slug AS departement_slug,
           c.population, ST_X(c.centre) AS lon, ST_Y(c.centre) AS lat
    FROM communes c JOIN departements d ON d.code = c.departement_code
    WHERE c.slug = ${communeSlug} AND d.slug = ${departementSlug}
    LIMIT 1
  `)
  const r = rows[0]
  if (!r) return null
  return {
    codeInsee: r.code_insee,
    nom: r.nom,
    slug: r.slug,
    departementNom: r.departement_nom,
    departementSlug: r.departement_slug,
    population: r.population,
    lon: r.lon,
    lat: r.lat,
  }
}

/**
 * Praticiens d'une commune, classés par ordre alphabétique.
 *
 * L'ordre est alphabétique et rien d'autre. Aucune notion de mise en avant
 * n'existe dans ce schéma et n'y sera ajoutée : c'est une règle de neutralité,
 * pas un choix d'implémentation.
 */
export async function getPraticiensDeCommune(
  profession: Profession,
  codeInsee: string,
  page = 1,
  parPage = PAR_PAGE,
): Promise<{ liste: PraticienResume[]; total: number }> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire', `commune:${codeInsee}`)
  const { rows } = await db.execute<{
    slug: string
    nom: string
    prenom: string | null
    raison_sociale: string | null
    statut_verification: PraticienResume['statutVerification']
    adresse_ligne: string | null
    code_postal: string | null
    telephone_officiel: string | null
    commune_nom: string | null
    commune_slug: string | null
    departement_slug: string | null
    lon: number | null
    lat: number | null
  }>(sql`
    SELECT DISTINCT ON (p.id)
           p.slug, p.nom, p.prenom, p.raison_sociale, p.statut_verification,
           l.adresse_ligne, l.code_postal, l.telephone_officiel,
           c.nom AS commune_nom, c.slug AS commune_slug, d.slug AS departement_slug,
           ST_X(l.position) AS lon, ST_Y(l.position) AS lat
    FROM praticiens p
    JOIN lieux_exercice l ON l.praticien_id = p.id
    JOIN communes c ON c.code_insee = l.code_insee
    JOIN departements d ON d.code = c.departement_code
    WHERE p.profession = ${profession} AND p.deleted_at IS NULL AND c.code_insee = ${codeInsee}
    ORDER BY p.id, l.principal DESC
  `)
  // Le tri se fait en mémoire : `DISTINCT ON` impose d'ordonner par l'identifiant
  // en premier, et l'effectif d'une commune reste modeste, 691 au maximum.
  const tous = rows
    .map((r) => ({
      slug: r.slug,
      nom: r.nom,
      prenom: r.prenom,
      raisonSociale: r.raison_sociale,
      statutVerification: r.statut_verification,
      adresseLigne: r.adresse_ligne,
      codePostal: r.code_postal,
      telephone: r.telephone_officiel,
      communeNom: r.commune_nom,
      communeSlug: r.commune_slug,
      departementSlug: r.departement_slug,
      lon: r.lon,
      lat: r.lat,
    }))
    .sort((a, b) => cleDeTri(profession, a).localeCompare(cleDeTri(profession, b), 'fr'))

  const debut = (page - 1) * parPage
  return { liste: tous.slice(debut, debut + parPage), total: tous.length }
}

/**
 * Communes les plus proches ayant au moins un praticien de la profession.
 *
 * Sert les archives vides : une commune sans praticien renvoie une page 200 en
 * noindex qui oriente vers les communes voisines, comportement de l'ancien site
 * que l'architecture demande de conserver.
 *
 * Le tri se fait sur `geography`, en mètres. Trier sur l'opérateur de plus
 * proche voisin en degrés donnerait un ordre faux : sur un essai autour de
 * Bordeaux, il plaçait Talence à 6,3 km avant Cenon à 5,0 km.
 */
export async function getCommunesVoisinesAvecPraticiens(
  profession: Profession,
  codeInsee: string,
  limite = 5,
): Promise<{ nom: string; slug: string; departementSlug: string; km: number; total: number }[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{
    nom: string
    slug: string
    departement_slug: string
    km: number
    total: number
  }>(sql`
    WITH origine AS (SELECT centre FROM communes WHERE code_insee = ${codeInsee}),
    candidates AS (
      SELECT c.code_insee, c.nom, c.slug, d.slug AS departement_slug, c.centre
      FROM communes c JOIN departements d ON d.code = c.departement_code
      WHERE c.code_insee <> ${codeInsee} AND c.centre IS NOT NULL
      ORDER BY c.centre <-> (SELECT centre FROM origine)
      LIMIT 200
    )
    SELECT k.nom, k.slug, k.departement_slug,
           round((ST_Distance(k.centre::geography, (SELECT centre FROM origine)::geography) / 1000)::numeric, 1)::float8 AS km,
           n.total
    FROM candidates k
    JOIN LATERAL (
      SELECT count(DISTINCT p.id)::int AS total
      FROM praticiens p JOIN lieux_exercice l ON l.praticien_id = p.id
      WHERE l.code_insee = k.code_insee AND p.profession = ${profession} AND p.deleted_at IS NULL
    ) n ON n.total > 0
    ORDER BY ST_Distance(k.centre::geography, (SELECT centre FROM origine)::geography)
    LIMIT ${limite}
  `)
  return rows.map((r) => ({
    nom: r.nom,
    slug: r.slug,
    departementSlug: r.departement_slug,
    km: r.km,
    total: r.total,
  }))
}

export type Departement = {
  code: string
  nom: string
  slug: string
  regionNom: string
}

export type CommuneComptee = {
  nom: string
  slug: string
  total: number
  population: number | null
}

export async function getDepartement(slug: string): Promise<Departement | null> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ code: string; nom: string; slug: string; region_nom: string }>(sql`
    SELECT d.code, d.nom, d.slug, r.nom AS region_nom
    FROM departements d JOIN regions r ON r.code = d.region_code
    WHERE d.slug = ${slug} LIMIT 1
  `)
  const r = rows[0]
  return r ? { code: r.code, nom: r.nom, slug: r.slug, regionNom: r.region_nom } : null
}

/** Communes d'un département ayant au moins un praticien, les plus peuplées d'abord. */
export async function getCommunesDuDepartement(
  profession: Profession,
  codeDepartement: string,
): Promise<CommuneComptee[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ nom: string; slug: string; total: number; population: number | null }>(sql`
    SELECT c.nom, c.slug, c.population, count(DISTINCT p.id)::int AS total
    FROM communes c
    JOIN lieux_exercice l ON l.code_insee = c.code_insee
    JOIN praticiens p ON p.id = l.praticien_id AND p.profession = ${profession} AND p.deleted_at IS NULL
    WHERE c.departement_code = ${codeDepartement}
    GROUP BY c.code_insee, c.nom, c.slug, c.population
    ORDER BY count(DISTINCT p.id) DESC, c.nom
  `)
  return rows
}

export type DepartementCompte = {
  nom: string
  slug: string
  regionNom: string
  total: number
}

/** Tous les départements ayant au moins un praticien, pour la page d'index. */
export async function getDepartementsAvecPraticiens(profession: Profession): Promise<DepartementCompte[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ nom: string; slug: string; region_nom: string; total: number }>(sql`
    SELECT d.nom, d.slug, r.nom AS region_nom, count(DISTINCT p.id)::int AS total
    FROM departements d
    JOIN regions r ON r.code = d.region_code
    JOIN communes c ON c.departement_code = d.code
    JOIN lieux_exercice l ON l.code_insee = c.code_insee
    JOIN praticiens p ON p.id = l.praticien_id AND p.profession = ${profession} AND p.deleted_at IS NULL
    GROUP BY d.code, d.nom, d.slug, r.nom
    ORDER BY r.nom, d.nom
  `)
  return rows.map((r) => ({ nom: r.nom, slug: r.slug, regionNom: r.region_nom, total: r.total }))
}

/** Compte global d'une profession, pour l'accueil et les pages d'index. */
export async function getTotalProfession(profession: Profession): Promise<{ total: number; communes: number }> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ total: number; communes: number }>(sql`
    SELECT count(DISTINCT p.id)::int AS total, count(DISTINCT l.code_insee)::int AS communes
    FROM praticiens p
    LEFT JOIN lieux_exercice l ON l.praticien_id = p.id
    WHERE p.profession = ${profession} AND p.deleted_at IS NULL
  `)
  return rows[0] ?? { total: 0, communes: 0 }
}

export type EntreeSitemap = { chemin: string; majLe: string }

/**
 * URL de fiches indexables, par tranche.
 *
 * Seules les fiches `indexable` sortent : une fiche sans position ou dont
 * l'identité n'est pas confirmée n'a rien à faire dans un sitemap. La règle
 * vit dans la colonne, pas ici.
 *
 * La pagination se fait par identifiant croissant et non par OFFSET : sur
 * 50 000 lignes, un OFFSET élevé fait relire toute la table à chaque tranche.
 */
export async function getFichesIndexables(
  profession: Profession,
  tranche: number,
  taille = 10_000,
): Promise<EntreeSitemap[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ chemin: string; maj: string }>(sql`
    SELECT '/' || ${profession === 'dentiste' ? 'dentistes' : 'prothesistes'} || '/' ||
           d.slug || '/' || c.slug || '/' || p.slug || '/' AS chemin,
           to_char(p.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS maj
    FROM praticiens p
    JOIN LATERAL (
      SELECT l.code_insee FROM lieux_exercice l
      WHERE l.praticien_id = p.id AND l.code_insee IS NOT NULL
      ORDER BY l.principal DESC, l.id LIMIT 1
    ) lp ON TRUE
    JOIN communes c ON c.code_insee = lp.code_insee
    JOIN departements d ON d.code = c.departement_code
    WHERE p.profession = ${profession} AND p.deleted_at IS NULL AND p.indexable
    ORDER BY p.id
    LIMIT ${taille} OFFSET ${tranche * taille}
  `)
  return rows.map((r) => ({ chemin: r.chemin, majLe: r.maj }))
}

export async function compterFichesIndexables(profession: Profession): Promise<number> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ n: number }>(sql`
    SELECT count(*)::int AS n FROM praticiens
    WHERE profession = ${profession} AND deleted_at IS NULL AND indexable
  `)
  return rows[0]?.n ?? 0
}

/** Communes ayant au moins un praticien indexable, toutes professions confondues. */
export async function getCommunesIndexables(): Promise<EntreeSitemap[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ chemin: string; maj: string }>(sql`
    SELECT DISTINCT
      '/' || CASE p.profession WHEN 'dentiste' THEN 'dentistes' ELSE 'prothesistes' END
        || '/' || d.slug || '/' || c.slug || '/' AS chemin,
      to_char(max(p.updated_at) OVER (PARTITION BY p.profession, c.code_insee) AT TIME ZONE 'UTC',
              'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS maj
    FROM praticiens p
    JOIN lieux_exercice l ON l.praticien_id = p.id
    JOIN communes c ON c.code_insee = l.code_insee
    JOIN departements d ON d.code = c.departement_code
    WHERE p.deleted_at IS NULL AND p.indexable
  `)
  return rows.map((r) => ({ chemin: r.chemin, majLe: r.maj }))
}

/** Départements ayant au moins un praticien indexable. */
export async function getDepartementsIndexables(): Promise<EntreeSitemap[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ chemin: string; maj: string }>(sql`
    SELECT DISTINCT
      '/' || CASE p.profession WHEN 'dentiste' THEN 'dentistes' ELSE 'prothesistes' END
        || '/' || d.slug || '/' AS chemin,
      to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS maj
    FROM praticiens p
    JOIN lieux_exercice l ON l.praticien_id = p.id
    JOIN communes c ON c.code_insee = l.code_insee
    JOIN departements d ON d.code = c.departement_code
    WHERE p.deleted_at IS NULL AND p.indexable
  `)
  return rows.map((r) => ({ chemin: r.chemin, majLe: r.maj }))
}

/**
 * Redirection permanente depuis une ancienne URL.
 *
 * L'architecture prévoyait de lire la table dans un middleware. On la consulte
 * plutôt au moment où une page ne trouve rien : la requête ne coûte alors rien
 * sur le chemin nominal, alors qu'un middleware s'exécute à chaque requête, y
 * compris sur les 45 000 fiches qui existent.
 */
export async function getRedirection(chemin: string): Promise<string | null> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire', 'redirections')
  const { rows } = await db.execute<{ nouveau_chemin: string }>(sql`
    SELECT nouveau_chemin FROM redirections WHERE ancien_chemin = ${chemin} LIMIT 1
  `)
  return rows[0]?.nouveau_chemin ?? null
}

export type PraticienProche = PraticienResume & { metres: number }

/**
 * Praticiens les plus proches d'un point.
 *
 * Le classement est la distance, puis l'ordre alphabétique à égalité. C'est la
 * seule règle de tri de DentalMap, et elle est annoncée sur la page.
 *
 * La distance est calculée sur `geography`, en mètres. L'opérateur de plus
 * proche voisin de PostGIS trie en degrés : sur un essai autour de Bordeaux il
 * plaçait Talence à 6,3 km avant Cenon à 5,0 km. Il sert ici uniquement à
 * présélectionner un ensemble via l'index GIST, le tri final étant métrique.
 *
 * Les positions approximatives, au centre d'une commune, sont exclues : les
 * classer par distance donnerait un ordre faux.
 */
export async function getPraticiensProches(
  profession: Profession,
  lon: number,
  lat: number,
  rayonMetres = 20_000,
  limite = 50,
): Promise<PraticienProche[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{
    slug: string
    nom: string
    prenom: string | null
    raison_sociale: string | null
    statut_verification: PraticienResume['statutVerification']
    adresse_ligne: string | null
    code_postal: string | null
    telephone_officiel: string | null
    commune_nom: string | null
    commune_slug: string | null
    departement_slug: string | null
    lon: number | null
    lat: number | null
    metres: number
  }>(sql`
    WITH origine AS (SELECT ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326) AS point)
    SELECT DISTINCT ON (p.id)
           p.slug, p.nom, p.prenom, p.raison_sociale, p.statut_verification,
           l.adresse_ligne, l.code_postal, l.telephone_officiel,
           c.nom AS commune_nom, c.slug AS commune_slug, d.slug AS departement_slug,
           ST_X(l.position) AS lon, ST_Y(l.position) AS lat,
           ST_Distance(l.position::geography, (SELECT point FROM origine)::geography)::int AS metres
    FROM lieux_exercice l
    JOIN praticiens p ON p.id = l.praticien_id
    JOIN communes c ON c.code_insee = l.code_insee
    JOIN departements d ON d.code = c.departement_code
    WHERE p.profession = ${profession}
      AND p.deleted_at IS NULL
      AND NOT l.position_approximative
      AND ST_DWithin(l.position::geography, (SELECT point FROM origine)::geography, ${rayonMetres})
    ORDER BY p.id, metres
    LIMIT ${limite * 4}
  `)

  return rows
    .map((r) => ({
      slug: r.slug,
      nom: r.nom,
      prenom: r.prenom,
      raisonSociale: r.raison_sociale,
      statutVerification: r.statut_verification,
      adresseLigne: r.adresse_ligne,
      codePostal: r.code_postal,
      telephone: r.telephone_officiel,
      communeNom: r.commune_nom,
      communeSlug: r.commune_slug,
      departementSlug: r.departement_slug,
      lon: r.lon,
      lat: r.lat,
      metres: r.metres,
    }))
    .sort((a, b) => a.metres - b.metres || `${a.nom} ${a.prenom ?? ''}`.localeCompare(`${b.nom} ${b.prenom ?? ''}`, 'fr'))
    .slice(0, limite)
}

/** Commune par son code INSEE, pour résoudre le point de départ d'une recherche. */
export async function getCommuneParCode(codeInsee: string): Promise<Commune | null> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{
    code_insee: string
    nom: string
    slug: string
    departement_nom: string
    departement_slug: string
    population: number | null
    lon: number | null
    lat: number | null
  }>(sql`
    SELECT c.code_insee, c.nom, c.slug, d.nom AS departement_nom, d.slug AS departement_slug,
           c.population, ST_X(c.centre) AS lon, ST_Y(c.centre) AS lat
    FROM communes c JOIN departements d ON d.code = c.departement_code
    WHERE c.code_insee = ${codeInsee} LIMIT 1
  `)
  const r = rows[0]
  if (!r) return null
  return {
    codeInsee: r.code_insee,
    nom: r.nom,
    slug: r.slug,
    departementNom: r.departement_nom,
    departementSlug: r.departement_slug,
    population: r.population,
    lon: r.lon,
    lat: r.lat,
  }
}

/** Première commune correspondant à une saisie libre, pour le formulaire sans JavaScript. */
export async function chercherCommune(texte: string): Promise<Commune | null> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const cherche = texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
  if (cherche.length < 2) return null
  const estCodePostal = /^\d{5}$/.test(texte.trim())
  const { rows } = await db.execute<{ code_insee: string }>(sql`
    SELECT c.code_insee FROM communes c
    WHERE ${
      estCodePostal
        ? sql`${texte.trim()} = ANY(c.codes_postaux)`
        : sql`(c.nom_recherche = ${cherche} OR c.nom_recherche LIKE ${cherche + '%'} OR c.nom_recherche % ${cherche})`
    }
    ORDER BY (c.nom_recherche = ${cherche}) DESC, c.population DESC NULLS LAST
    LIMIT 1
  `)
  return rows[0] ? getCommuneParCode(rows[0].code_insee) : null
}
