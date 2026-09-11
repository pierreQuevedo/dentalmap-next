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
