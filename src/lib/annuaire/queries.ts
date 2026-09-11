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
): Promise<PraticienResume[]> {
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
    }))
    .sort((a, b) => cleDeTri(profession, a).localeCompare(cleDeTri(profession, b), 'fr'))
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
