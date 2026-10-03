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
import {
  EMPRISE_FRANCE,
  PAR_PAGE_CARTE,
  PLAFOND,
  elargir,
  empriseAutour,
  reunir,
  type Emprise,
  type Origine,
  type PageResultats,
} from './emprise'
import { EXERCICES, SPECIALITES, type Filtres } from './filtres'
import type { BaseUrl, Praticien, PraticienResume, Profession } from './types'
import { PROFESSION_PAR_BASE } from './types'
import type { FicheCompletee } from '@/lib/espace-pro/fiche-completee'

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
  precision_position: PraticienResume['precisionPosition']
  code_postal: string | null
  a_telephone: boolean
  finess: string | null
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
    civilite: PraticienResume['civilite']
    profession: Profession
    nom: string
    prenom: string | null
    raison_sociale: string | null
    rpps: string | null
    siren: string | null
    siret: string | null
    specialite: string | null
    mode_exercice: string | null
    categorie_professionnelle: string | null
    statut_verification: Praticien['statutVerification']
    indexable: boolean
    deleted_at: string | null
    updated_at: string
    lieux: LigneLieu[]
  }>(sql`
    SELECT p.id, p.slug, p.profession, p.civilite, p.nom, p.prenom, p.raison_sociale, p.rpps, p.siren, p.siret,
           p.specialite, p.mode_exercice, p.categorie_professionnelle,
           p.statut_verification, p.indexable, p.deleted_at, p.updated_at,
           COALESCE(
             (SELECT json_agg(x ORDER BY x.principal DESC, x.id)
              FROM (
                SELECT l.id, l.adresse_ligne, l.code_postal, (l.telephone_officiel IS NOT NULL) AS a_telephone,
           EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = p.id AND v.statut = 'acceptee') AS revendiquee, l.finess, l.precision_position, l.principal,
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
    civilite: r.civilite,
    nom: r.nom,
    prenom: r.prenom,
    raisonSociale: r.raison_sociale,
    rpps: r.rpps,
    siret: r.siret,
    specialite: r.specialite,
    modeExercice: r.mode_exercice,
    categorieProfessionnelle: r.categorie_professionnelle,
    siren: r.siren,
    statutVerification: r.statut_verification,
    indexable: r.indexable,
    supprimeLe: r.deleted_at,
    majLe: r.updated_at,
    lieux: (r.lieux ?? []).map((l) => ({
      id: l.id,
      adresseLigne: l.adresse_ligne,
      finess: l.finess,
      precisionPosition: l.precision_position,
      codePostal: l.code_postal,
      aTelephone: l.a_telephone,
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
  departementCode: string
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
    departement_code: string
    departement_nom: string
    departement_slug: string
    population: number | null
    lon: number | null
    lat: number | null
  }>(sql`
    SELECT c.code_insee, c.nom, c.slug, d.code AS departement_code, d.nom AS departement_nom, d.slug AS departement_slug,
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
    departementCode: r.departement_code,
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
 * L'ordre est alphabétique : c'est celui qu'un lecteur attend d'une liste de
 * commune, et il ne dépend d'aucune donnée de la fiche.
 */
export async function getPraticiensDeCommune(
  profession: Profession,
  codeInsee: string,
  page = 1,
  parPage = PAR_PAGE,
): Promise<{ liste: PraticienProche[]; total: number }> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire', `commune:${codeInsee}`)
  const { rows } = await db.execute<{
    slug: string
    civilite: PraticienResume['civilite']
    nom: string
    prenom: string | null
    raison_sociale: string | null
    statut_verification: PraticienResume['statutVerification']
    adresse_ligne: string | null
  precision_position: PraticienResume['precisionPosition']
    code_postal: string | null
    a_telephone: boolean
    revendiquee: boolean
    lieu_id: string
    commune_nom: string | null
    commune_slug: string | null
    departement_slug: string | null
    lon: number | null
    lat: number | null
    metres: number
  }>(sql`
    WITH origine AS (SELECT centre FROM communes WHERE code_insee = ${codeInsee})
    SELECT DISTINCT ON (p.id)
           p.slug, p.civilite, p.nom, p.prenom, p.raison_sociale, p.statut_verification,
           l.id AS lieu_id, l.adresse_ligne, l.code_postal, (l.telephone_officiel IS NOT NULL) AS a_telephone,
           EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = p.id AND v.statut = 'acceptee') AS revendiquee, l.precision_position,
           c.nom AS commune_nom, c.slug AS commune_slug, d.slug AS departement_slug,
           ST_X(l.position) AS lon, ST_Y(l.position) AS lat,
           coalesce(ST_Distance(l.position::geography, (SELECT centre FROM origine)::geography), 0)::int AS metres
    FROM praticiens p
    JOIN lieux_exercice l ON l.praticien_id = p.id
    JOIN communes c ON c.code_insee = l.code_insee
    JOIN departements d ON d.code = c.departement_code
    -- La commune elle-même, ou l'un de ses arrondissements : la page de Paris
    -- liste les praticiens que l'Annuaire Santé rattache aux vingt
    -- arrondissements, sans quoi elle serait vide.
    WHERE p.profession = ${profession} AND p.deleted_at IS NULL
      AND (c.code_insee = ${codeInsee} OR c.commune_parente_code = ${codeInsee})
    ORDER BY p.id, l.principal DESC
  `)
  // Le tri se fait en mémoire : `DISTINCT ON` impose d'ordonner par l'identifiant
  // en premier, et l'effectif d'une commune reste modeste, quelques milliers
  // pour Paris avec ses arrondissements.
  const tous = rows
    .map((r) => ({
      slug: r.slug,
      civilite: r.civilite,
      nom: r.nom,
      prenom: r.prenom,
      raisonSociale: r.raison_sociale,
      statutVerification: r.statut_verification,
      adresseLigne: r.adresse_ligne,
      precisionPosition: r.precision_position,
      codePostal: r.code_postal,
      lieuId: r.lieu_id,
      aTelephone: r.a_telephone,
      revendiquee: r.revendiquee,
      communeNom: r.commune_nom,
      communeSlug: r.commune_slug,
      departementSlug: r.departement_slug,
      lon: r.lon,
      lat: r.lat,
      metres: r.metres,
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
  /** Les arrondissements sont listés à côté de leur commune mère, qui les totalise. */
  type: 'commune' | 'arrondissement'
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

export type DepartementSitue = Departement & { regionCode: string; regionSlug: string }

/** Un département par son code, avec sa région : sert aux fiches qui ne connaissent que le code. */
export async function getDepartementParCode(code: string): Promise<DepartementSitue | null> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ code: string; nom: string; slug: string; region_nom: string; region_code: string; region_slug: string }>(sql`
    SELECT d.code, d.nom, d.slug, r.nom AS region_nom, r.code AS region_code, r.slug AS region_slug
    FROM departements d JOIN regions r ON r.code = d.region_code
    WHERE d.code = ${code} LIMIT 1
  `)
  const r = rows[0]
  return r ? { code: r.code, nom: r.nom, slug: r.slug, regionNom: r.region_nom, regionCode: r.region_code, regionSlug: r.region_slug } : null
}

/** Communes d'un département ayant au moins un praticien, les plus peuplées d'abord. */
export async function getCommunesDuDepartement(
  profession: Profession,
  codeDepartement: string,
): Promise<CommuneComptee[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{
    nom: string
    slug: string
    total: number
    population: number | null
    type: 'commune' | 'arrondissement'
  }>(sql`
    -- Chaque lieu compte pour sa commune, et une seconde fois pour la commune
    -- mère quand la commune est un arrondissement : Paris totalise ses vingt
    -- arrondissements, qui restent listés chacun avec leur effectif.
    WITH rattachements AS (
      SELECT c.code_insee, l.praticien_id
      FROM communes c JOIN lieux_exercice l ON l.code_insee = c.code_insee
      WHERE c.departement_code = ${codeDepartement}
      UNION ALL
      SELECT c.commune_parente_code AS code_insee, l.praticien_id
      FROM communes c JOIN lieux_exercice l ON l.code_insee = c.code_insee
      WHERE c.departement_code = ${codeDepartement} AND c.commune_parente_code IS NOT NULL
    )
    SELECT c.nom, c.slug, c.population, c.type, count(DISTINCT p.id)::int AS total
    FROM rattachements x
    JOIN communes c ON c.code_insee = x.code_insee
    JOIN praticiens p ON p.id = x.praticien_id AND p.profession = ${profession} AND p.deleted_at IS NULL
    GROUP BY c.code_insee, c.nom, c.slug, c.population, c.type
    ORDER BY count(DISTINCT p.id) DESC, c.nom
  `)
  return rows
}

/** Arrondissements d'une commune mère ayant au moins un praticien, dans l'ordre des codes. */
export async function getArrondissements(profession: Profession, codeParent: string): Promise<CommuneComptee[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{
    nom: string
    slug: string
    total: number
    population: number | null
    type: 'commune' | 'arrondissement'
  }>(sql`
    SELECT c.nom, c.slug, c.population, c.type, count(DISTINCT p.id)::int AS total
    FROM communes c
    JOIN lieux_exercice l ON l.code_insee = c.code_insee
    JOIN praticiens p ON p.id = l.praticien_id AND p.profession = ${profession} AND p.deleted_at IS NULL
    WHERE c.commune_parente_code = ${codeParent}
    GROUP BY c.code_insee, c.nom, c.slug, c.population, c.type
    ORDER BY c.code_insee
  `)
  return rows
}

/** Codes des départements d'une région, pour filtrer ce qui n'est pas dans la base des praticiens. */
export async function getCodesDepartementsDeRegion(codeRegion: string): Promise<string[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ code: string }>(sql`SELECT code FROM departements WHERE region_code = ${codeRegion}`)
  return rows.map((r) => r.code)
}

export type Region = { code: string; nom: string; slug: string }

export async function getRegion(slug: string): Promise<Region | null> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<Region>(sql`SELECT code, nom, slug FROM regions WHERE slug = ${slug} LIMIT 1`)
  return rows[0] ?? null
}

/** Départements d'une région ayant au moins un praticien, par ordre alphabétique. */
export async function getDepartementsDeRegion(profession: Profession, codeRegion: string): Promise<DepartementCompte[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{
    code: string
    nom: string
    slug: string
    region_nom: string
    region_slug: string
    total: number
  }>(sql`
    SELECT d.code, d.nom, d.slug, r.nom AS region_nom, r.slug AS region_slug, count(DISTINCT p.id)::int AS total
    FROM departements d
    JOIN regions r ON r.code = d.region_code
    JOIN communes c ON c.departement_code = d.code
    JOIN lieux_exercice l ON l.code_insee = c.code_insee
    JOIN praticiens p ON p.id = l.praticien_id AND p.profession = ${profession} AND p.deleted_at IS NULL
    WHERE r.code = ${codeRegion}
    GROUP BY d.code, d.nom, d.slug, r.nom, r.slug
    ORDER BY d.nom
  `)
  return rows.map((r) => ({ code: r.code, nom: r.nom, slug: r.slug, regionNom: r.region_nom, regionSlug: r.region_slug, total: r.total }))
}

type Etendue = { ouest: number | null; sud: number | null; est: number | null; nord: number | null }

function empriseDepuisEtendue(e: Etendue | undefined, marge: number): Emprise | null {
  if (!e || e.ouest == null || e.sud == null || e.est == null || e.nord == null) return null
  return elargir({ ouest: e.ouest, sud: e.sud, est: e.est, nord: e.nord }, marge)
}

/**
 * Cadrage de la carte d'une commune : le rectangle de ses lieux d'exercice
 * géolocalisés, arrondissements compris, avec une marge, et jamais moins de
 * trois kilomètres de côté, pour qu'un village d'un seul cabinet ne soit pas
 * cadré sur sa façade. Sans aucun lieu, un carré de cinq kilomètres autour
 * du centre de la commune.
 */
export async function getEmpriseCommune(codeInsee: string): Promise<Emprise> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<Etendue & { lon: number | null; lat: number | null }>(sql`
    WITH lieux AS (
      SELECT l.position
      FROM lieux_exercice l JOIN communes a ON a.code_insee = l.code_insee
      WHERE (a.code_insee = ${codeInsee} OR a.commune_parente_code = ${codeInsee})
        AND NOT l.position_approximative AND l.position IS NOT NULL
    ),
    etendue AS (SELECT ST_Extent(position) AS e FROM lieux)
    SELECT ST_XMin(e)::float8 AS ouest, ST_YMin(e)::float8 AS sud, ST_XMax(e)::float8 AS est, ST_YMax(e)::float8 AS nord,
           ST_X(c.centre) AS lon, ST_Y(c.centre) AS lat
    FROM etendue, communes c WHERE c.code_insee = ${codeInsee}
  `)
  const r = rows[0]
  const centre = r?.lon != null && r.lat != null ? { lon: r.lon, lat: r.lat } : null
  const etendue = empriseDepuisEtendue(r, 0.15)
  if (etendue && centre) return reunir(etendue, empriseAutour(centre.lon, centre.lat, 1500))
  if (etendue) return etendue
  if (centre) return empriseAutour(centre.lon, centre.lat, 2500)
  return EMPRISE_FRANCE
}

/** Cadrage d'un département : le rectangle des centres de ses communes. */
export async function getEmpriseDepartement(codeDepartement: string): Promise<Emprise> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<Etendue>(sql`
    SELECT ST_XMin(e)::float8 AS ouest, ST_YMin(e)::float8 AS sud, ST_XMax(e)::float8 AS est, ST_YMax(e)::float8 AS nord
    FROM (SELECT ST_Extent(centre) AS e FROM communes WHERE departement_code = ${codeDepartement}) s
  `)
  return empriseDepuisEtendue(rows[0], 0.05) ?? EMPRISE_FRANCE
}

/** Cadrage d'une région : le rectangle des centres des communes de ses départements. */
export async function getEmpriseRegion(codeRegion: string): Promise<Emprise> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<Etendue>(sql`
    SELECT ST_XMin(e)::float8 AS ouest, ST_YMin(e)::float8 AS sud, ST_XMax(e)::float8 AS est, ST_YMax(e)::float8 AS nord
    FROM (
      SELECT ST_Extent(c.centre) AS e
      FROM communes c JOIN departements d ON d.code = c.departement_code
      WHERE d.region_code = ${codeRegion}
    ) s
  `)
  return empriseDepuisEtendue(rows[0], 0.05) ?? EMPRISE_FRANCE
}

export type DepartementCompte = {
  code: string
  nom: string
  slug: string
  regionNom: string
  regionSlug: string
  total: number
}

/** Tous les départements ayant au moins un praticien, pour la page d'index. */
export async function getDepartementsAvecPraticiens(profession: Profession): Promise<DepartementCompte[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{
    code: string
    nom: string
    slug: string
    region_nom: string
    region_slug: string
    total: number
  }>(sql`
    SELECT d.code, d.nom, d.slug, r.nom AS region_nom, r.slug AS region_slug, count(DISTINCT p.id)::int AS total
    FROM departements d
    JOIN regions r ON r.code = d.region_code
    JOIN communes c ON c.departement_code = d.code
    JOIN lieux_exercice l ON l.code_insee = c.code_insee
    JOIN praticiens p ON p.id = l.praticien_id AND p.profession = ${profession} AND p.deleted_at IS NULL
    GROUP BY d.code, d.nom, d.slug, r.nom, r.slug
    ORDER BY r.nom, d.nom
  `)
  return rows.map((r) => ({
    code: r.code,
    nom: r.nom,
    slug: r.slug,
    regionNom: r.region_nom,
    regionSlug: r.region_slug,
    total: r.total,
  }))
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
 * Régions ayant au moins un praticien indexable.
 *
 * Les régions d'outre-mer portent le même slug que leur unique département,
 * et c'est la page de département qui répond à cette URL : elles sont déjà
 * dans le sitemap des départements, et sont donc écartées ici.
 */
export async function getRegionsIndexables(): Promise<EntreeSitemap[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ chemin: string; maj: string }>(sql`
    SELECT DISTINCT
      '/' || CASE p.profession WHEN 'dentiste' THEN 'dentistes' ELSE 'prothesistes' END
        || '/' || r.slug || '/' AS chemin,
      to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS maj
    FROM praticiens p
    JOIN lieux_exercice l ON l.praticien_id = p.id
    JOIN communes c ON c.code_insee = l.code_insee
    JOIN departements d ON d.code = c.departement_code
    JOIN regions r ON r.code = d.region_code
    WHERE p.deleted_at IS NULL AND p.indexable
      AND NOT EXISTS (SELECT 1 FROM departements x WHERE x.slug = r.slug)
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
    civilite: PraticienResume['civilite']
    nom: string
    prenom: string | null
    raison_sociale: string | null
    statut_verification: PraticienResume['statutVerification']
    adresse_ligne: string | null
  precision_position: PraticienResume['precisionPosition']
    code_postal: string | null
    a_telephone: boolean
    revendiquee: boolean
    lieu_id: string
    commune_nom: string | null
    commune_slug: string | null
    departement_slug: string | null
    lon: number | null
    lat: number | null
    metres: number
  }>(sql`
    WITH origine AS (SELECT ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326) AS point)
    SELECT DISTINCT ON (p.id)
           p.slug, p.civilite, p.nom, p.prenom, p.raison_sociale, p.statut_verification,
           l.id AS lieu_id, l.adresse_ligne, l.code_postal, (l.telephone_officiel IS NOT NULL) AS a_telephone,
           EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = p.id AND v.statut = 'acceptee') AS revendiquee, l.precision_position,
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
      civilite: r.civilite,
      nom: r.nom,
      prenom: r.prenom,
      raisonSociale: r.raison_sociale,
      statutVerification: r.statut_verification,
      adresseLigne: r.adresse_ligne,
      precisionPosition: r.precision_position,
      codePostal: r.code_postal,
      lieuId: r.lieu_id,
      aTelephone: r.a_telephone,
      revendiquee: r.revendiquee,
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
    departement_code: string
    departement_nom: string
    departement_slug: string
    population: number | null
    lon: number | null
    lat: number | null
  }>(sql`
    SELECT c.code_insee, c.nom, c.slug, d.code AS departement_code, d.nom AS departement_nom, d.slug AS departement_slug,
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
    departementCode: r.departement_code,
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

/**
 * Distance du n-ième praticien le plus proche d'un point, en mètres.
 *
 * L'opérateur `<->` sur la géométrie utilise l'index spatial pour ne lire
 * que les voisins ; la distance est ensuite calculée en mètres sur la
 * géographie. Pas de cache : la position vient de l'utilisateur, chaque
 * appel a sa clé.
 */
export async function getRayonPourN(profession: Profession, lon: number, lat: number, n: number): Promise<number | null> {
  const { rows } = await db.execute<{ metres: number }>(sql`
    WITH origine AS (SELECT ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326) AS point),
    voisins AS (
      SELECT DISTINCT ON (p.id) l.position
      FROM lieux_exercice l
      JOIN praticiens p ON p.id = l.praticien_id
      WHERE p.profession = ${profession} AND p.deleted_at IS NULL AND NOT l.position_approximative
      ORDER BY p.id, l.position <-> (SELECT point FROM origine)
    )
    SELECT ST_Distance(position::geography, (SELECT point FROM origine)::geography)::int AS metres
    FROM voisins
    ORDER BY position <-> (SELECT point FROM origine)
    LIMIT ${n}
  `)
  const dernier = rows[rows.length - 1]
  return dernier ? dernier.metres : null
}

/**
 * Conditions SQL des filtres, à ajouter au `WHERE` d'une requête qui lit le
 * praticien en `p` et son lieu en `l`. Partagée par la liste et les tuiles :
 * les points de la carte et les cartes de la colonne répondent au même
 * filtre. Sans filtre, une chaîne vide.
 */
export function clauseFiltres(filtres: Filtres) {
  const conditions = []
  const specialite = SPECIALITES.find((x) => x.code === filtres.specialite)
  if (specialite) conditions.push(sql`p.specialite = ${specialite.valeur}`)
  const exercice = EXERCICES.find((x) => x.code === filtres.exercice)
  if (exercice) conditions.push(sql`p.mode_exercice = ${exercice.valeur}`)
  if (filtres.verifie) conditions.push(sql`p.statut_verification = 'verifie'`)
  if (filtres.geree) conditions.push(sql`EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = p.id AND v.statut = 'acceptee')`)
  if (filtres.telephone) conditions.push(sql`l.telephone_officiel IS NOT NULL`)
  if (filtres.exacte) conditions.push(sql`l.precision_position = 'numero'`)
  if (filtres.pmr) conditions.push(sql`EXISTS (SELECT 1 FROM fiches_completees f WHERE f.praticien_id = p.id AND 'pmr' = ANY(f.accessibilite) AND EXISTS (SELECT 1 FROM revendications r WHERE r.praticien_id = p.id AND r.statut = 'acceptee'))`)
  return conditions.length ? sql` AND ${sql.join(conditions, sql` AND `)}` : sql``
}

/**
 * Résultats contenus dans une emprise de carte, paginés.
 *
 * C'est la requête qui alimente la colonne de gauche de la recherche : la
 * liste ne décrit plus un rayon autour d'une commune mais exactement ce que la
 * carte montre, et suit donc les déplacements de l'utilisateur.
 *
 * Sans `'use cache'`, à la différence du reste de l'annuaire. Une emprise est
 * un quadruplet de flottants issu du geste de l'utilisateur : la clé de cache
 * serait unique à chaque déplacement, le cache ne servirait jamais et ne
 * ferait que grossir. La fraîcheur est tenue par l'en-tête `Cache-Control` de
 * la route qui l'appelle, où les coordonnées sont arrondies pour que deux
 * gestes voisins retombent sur la même entrée de CDN.
 */
export async function getPraticiensDansEmprise(
  profession: Profession,
  emprise: Emprise,
  page = 1,
  parPage = PAR_PAGE_CARTE,
  filtres: Filtres = {},
  origine: Origine | null = null,
): Promise<PageResultats> {
  const { ouest, sud, est, nord } = emprise
  // La distance part du lieu choisi sur la carte quand il y en a un, sinon du centre.
  const centreLon = origine?.lon ?? (ouest + est) / 2
  const centreLat = origine?.lat ?? (sud + nord) / 2

  const clause = clauseFiltres(filtres)

  const { rows } = await db.execute<{
    slug: string
    civilite: PraticienResume['civilite']
    nom: string
    prenom: string | null
    raison_sociale: string | null
    statut_verification: PraticienResume['statutVerification']
    adresse_ligne: string | null
  precision_position: PraticienResume['precisionPosition']
    code_postal: string | null
    a_telephone: boolean
    revendiquee: boolean
    lieu_id: string
    commune_nom: string | null
    commune_slug: string | null
    departement_slug: string | null
    lon: number
    lat: number
    metres: number
    total: number
  }>(sql`
    WITH centre AS (SELECT ST_SetSRID(ST_MakePoint(${centreLon}, ${centreLat}), 4326) AS point),
    retenus AS (
      SELECT DISTINCT ON (p.id)
             p.slug, p.civilite, p.nom, p.prenom, p.raison_sociale, p.statut_verification,
             l.id AS lieu_id, l.adresse_ligne, l.code_postal, (l.telephone_officiel IS NOT NULL) AS a_telephone,
           EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = p.id AND v.statut = 'acceptee') AS revendiquee, l.precision_position,
             c.nom AS commune_nom, c.slug AS commune_slug, d.slug AS departement_slug,
             ST_X(l.position) AS lon, ST_Y(l.position) AS lat,
             ST_Distance(l.position::geography, (SELECT point FROM centre)::geography)::int AS metres
      FROM lieux_exercice l
      JOIN praticiens p ON p.id = l.praticien_id
      JOIN communes c ON c.code_insee = l.code_insee
      JOIN departements d ON d.code = c.departement_code
      WHERE p.profession = ${profession}
        AND p.deleted_at IS NULL
        AND NOT l.position_approximative
        AND l.position && ST_MakeEnvelope(${ouest}, ${sud}, ${est}, ${nord}, 4326)${clause}
      ORDER BY p.id, l.principal DESC
    ),
    plafonnes AS (
      SELECT * FROM retenus ORDER BY metres, nom, prenom LIMIT ${PLAFOND}
    )
    SELECT *, count(*) OVER ()::int AS total
    FROM plafonnes
    ORDER BY metres, nom, prenom
    OFFSET ${(Math.max(1, page) - 1) * parPage}
    LIMIT ${parPage}
  `)

  const total = rows[0]?.total ?? 0
  return {
    total,
    page: Math.max(1, page),
    pages: Math.max(1, Math.ceil(total / parPage)),
    plafonne: total >= PLAFOND,
    resultats: rows.map((r) => ({
      slug: r.slug,
      civilite: r.civilite,
      nom: r.nom,
      prenom: r.prenom,
      raisonSociale: r.raison_sociale,
      statutVerification: r.statut_verification,
      adresseLigne: r.adresse_ligne,
      precisionPosition: r.precision_position,
      codePostal: r.code_postal,
      lieuId: r.lieu_id,
      aTelephone: r.a_telephone,
      revendiquee: r.revendiquee,
      communeNom: r.commune_nom,
      communeSlug: r.commune_slug,
      departementSlug: r.departement_slug,
      lon: r.lon,
      lat: r.lat,
      metres: r.metres,
    })),
  }
}

/**
 * Ce que le praticien a lui-même complété sur sa fiche, ou `null`.
 *
 * Même tag que la fiche : la Server Action de l'espace pro invalide
 * `praticien:{slug}` à chaque enregistrement, et la page publique reflète la
 * saisie sans attendre la fin de la semaine.
 */
export async function getFicheCompletee(slug: string): Promise<FicheCompletee | null> {
  'use cache'
  cacheLife('praticien')
  cacheTag('annuaire', `praticien:${slug}`)

  const { rows } = await db.execute<{
    horaires: FicheCompletee['horaires']
    langues: string[]
    accessibilite: string[]
    accessibilite_commentaire: string | null
    paiements: string[]
    tiers_payant: FicheCompletee['tiersPayant']
    etape: number
    termine_le: string | null
    updated_at: string
  }>(sql`
    SELECT f.horaires, f.langues, f.accessibilite, f.accessibilite_commentaire, f.paiements, f.tiers_payant,
           f.etape, f.termine_le, f.updated_at
    FROM fiches_completees f
    JOIN praticiens p ON p.id = f.praticien_id
    WHERE p.slug = ${slug} AND p.deleted_at IS NULL
      -- Saisie possible dès la demande, publication seulement une fois la fiche attribuée.
      AND EXISTS (SELECT 1 FROM revendications r WHERE r.praticien_id = p.id AND r.statut = 'acceptee')
    LIMIT 1
  `)
  const r = rows[0]
  if (!r) return null
  return {
    horaires: r.horaires,
    langues: r.langues ?? [],
    accessibilite: r.accessibilite ?? [],
    accessibiliteCommentaire: r.accessibilite_commentaire,
    paiements: r.paiements ?? [],
    tiersPayant: r.tiers_payant,
    etape: r.etape,
    termineLe: r.termine_le,
    majLe: r.updated_at,
  }
}

export type ChiffresCles = {
  dentistes: number
  prothesistes: number
  /** Communes ayant au moins un praticien vivant, arrondissements comptés à part. */
  communes: number
  /** Départements ayant au moins un praticien vivant. */
  departements: number
  /** Fin du dernier run de synchronisation terminé, ou nulle si aucun. */
  synchroniseLe: string | null
}

/**
 * Les chiffres de l'accueil, tous calculés, jamais saisis.
 *
 * Même cache que les listes : ils bougent avec la synchronisation et pas
 * autrement. La date de synchronisation vient de `sync_runs`, et un run
 * bloqué ou en échec ne compte pas : la date affichée est celle d'un passage
 * qui a réellement écrit.
 */
export async function getChiffresCles(): Promise<ChiffresCles> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')

  const { rows } = await db.execute<{
    dentistes: number
    prothesistes: number
    communes: number
    departements: number
    synchronise_le: string | null
  }>(sql`
    SELECT
      (SELECT count(*)::int FROM praticiens WHERE profession = 'dentiste' AND deleted_at IS NULL) AS dentistes,
      (SELECT count(*)::int FROM praticiens WHERE profession = 'prothesiste' AND deleted_at IS NULL) AS prothesistes,
      (SELECT count(DISTINCT l.code_insee)::int
         FROM lieux_exercice l JOIN praticiens p ON p.id = l.praticien_id AND p.deleted_at IS NULL
        WHERE l.code_insee IS NOT NULL) AS communes,
      (SELECT count(DISTINCT c.departement_code)::int
         FROM lieux_exercice l
         JOIN praticiens p ON p.id = l.praticien_id AND p.deleted_at IS NULL
         JOIN communes c ON c.code_insee = l.code_insee) AS departements,
      (SELECT max(termine_le) FROM sync_runs WHERE statut = 'termine') AS synchronise_le
  `)
  const r = rows[0]
  return {
    dentistes: r?.dentistes ?? 0,
    prothesistes: r?.prothesistes ?? 0,
    communes: r?.communes ?? 0,
    departements: r?.departements ?? 0,
    synchroniseLe: r?.synchronise_le ?? null,
  }
}

/** Nom de chaque département par code, pour libeller ce qui n'arrive qu'en code. */
export async function getNomsDepartements(): Promise<Record<string, string>> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ code: string; nom: string }>(sql`SELECT code, nom FROM departements`)
  return Object.fromEntries(rows.map((r) => [r.code, r.nom]))
}

export type DepartementPrincipal = {
  nom: string
  slug: string
  total: number
  /** Slug de la commune la plus peuplée, qui prête son image au département. */
  villeSlug: string | null
}

/**
 * Départements comptant le plus de praticiens d'une profession.
 *
 * Sert à l'accueil pour les laboratoires de prothèse, dont l'implantation se
 * lit mieux par département que par ville : ils sont peu nombreux par commune.
 */
export async function getDepartementsPrincipaux(profession: Profession, limite: number): Promise<DepartementPrincipal[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const { rows } = await db.execute<{ nom: string; slug: string; total: number; ville_slug: string | null }>(sql`
    SELECT d.nom, d.slug, count(DISTINCT p.id)::int AS total,
           (SELECT c2.slug FROM communes c2
             WHERE c2.departement_code = d.code AND c2.type = 'commune'
             ORDER BY c2.population DESC NULLS LAST LIMIT 1) AS ville_slug
    FROM departements d
    JOIN communes c ON c.departement_code = d.code
    JOIN lieux_exercice l ON l.code_insee = c.code_insee
    JOIN praticiens p ON p.id = l.praticien_id AND p.profession = ${profession} AND p.deleted_at IS NULL
    GROUP BY d.code, d.nom, d.slug
    ORDER BY total DESC, d.nom
    LIMIT ${limite}
  `)
  return rows.map((r) => ({ nom: r.nom, slug: r.slug, total: r.total, villeSlug: r.ville_slug }))
}
