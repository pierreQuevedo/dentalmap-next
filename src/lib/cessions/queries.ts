/**
 * Lectures des annonces de cession (Neon, table `annonces_cession`).
 *
 * Visible publiquement : `statut = 'publiee'` et `expire_le` dans le futur.
 * Tout passe par des fonctions `'use cache'` au profil `listing`, sous le tag
 * `cessions` (et `cession:{slug}` pour une annonce). Chaque écriture de
 * l'espace pro ou de la modération (publication, retrait, renouvellement) et
 * le job d'échéance doivent invalider `cessions` : sans cela, une annonce
 * expirée resterait visible jusqu'à la revalidation du profil (un jour au plus).
 *
 * Confidentialité : seuls le centre et le rayon du secteur flou sont lus,
 * jamais l'adresse du cabinet ; l'auteur n'est lu que pour la page d'annonce,
 * côté serveur, et n'est jamais affiché.
 */
import { cacheLife, cacheTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { classerDisponibilite } from './format'
import type { AnnonceDetail, AnnonceResume, DepartementCession, TypeCession } from './types'

/**
 * URL publique d'une photo déposée. Les photos sont rangées par leur chemin
 * dans Vercel Blob (stockage public, comme la photo du cabinet des fiches).
 * L'hôte du magasin se déduit du jeton `BLOB_READ_WRITE_TOKEN`
 * (`vercel_blob_rw_<magasin>_…`), ou se fixe par `BLOB_URL_PUBLIQUE`. Une
 * URL complète ou un chemin local (`/images/…`) passe tel quel. Sans
 * stockage configuré : `null`, et la page affiche le fond neutre.
 */
function urlPhoto(chemin: string | null | undefined): string | null {
  if (!chemin) return null
  if (/^https?:\/\//.test(chemin) || chemin.startsWith('/')) return chemin
  const base =
    process.env.BLOB_URL_PUBLIQUE?.replace(/\/$/, '') ??
    (() => {
      const magasin = /^vercel_blob_rw_([a-z0-9]+)_/i.exec(process.env.BLOB_READ_WRITE_TOKEN ?? '')?.[1]
      return magasin ? `https://${magasin.toLowerCase()}.public.blob.vercel-storage.com` : null
    })()
  return base ? `${base}/${chemin.replace(/^\/+/, '')}` : null
}

type Ligne = {
  id: string
  slug: string
  type: TypeCession
  titre: string
  secteur: string | null
  commune_nom: string
  departement_code: string
  departement_slug: string
  departement_nom: string
  lon: number
  lat: number
  rayon_m: number
  fauteuils: number | null
  ca_min: number | null
  ca_max: number | null
  prix: number | null
  surface: number | null
  disponibilite: string | null
  photos: string[] | null
  publiee_le: string
  expire_le: string
  km?: number | null
}

/** Colonnes communes ; le centre retombe sur celui de la commune s'il manque. */
const COLONNES = sql`
  a.id, a.slug, a.type, a.titre, a.secteur, c.nom AS commune_nom,
  d.code AS departement_code, d.slug AS departement_slug, d.nom AS departement_nom,
  ST_X(COALESCE(a.centre, c.centre)) AS lon, ST_Y(COALESCE(a.centre, c.centre)) AS lat,
  a.rayon_m, a.fauteuils, a.ca_min, a.ca_max, a.prix, a.surface, a.disponibilite, a.photos,
  a.publiee_le, a.expire_le
`
const SOURCE = sql`
  FROM annonces_cession a
  JOIN communes c ON c.code_insee = a.commune_code
  JOIN departements d ON d.code = a.departement_code
`
const VISIBLE = sql`a.statut = 'publiee' AND a.expire_le > now() AND COALESCE(a.centre, c.centre) IS NOT NULL`

function resume(r: Ligne, maintenant: Date): AnnonceResume {
  return {
    id: r.id,
    slug: r.slug,
    type: r.type,
    titre: r.titre,
    secteur: r.secteur?.trim() || r.commune_nom,
    communeNom: r.commune_nom,
    departementCode: r.departement_code,
    departementSlug: r.departement_slug,
    departementNom: r.departement_nom,
    lon: Number(r.lon),
    lat: Number(r.lat),
    rayonM: r.rayon_m,
    fauteuils: r.fauteuils,
    caMin: r.ca_min,
    caMax: r.ca_max,
    prix: r.prix,
    surface: r.surface,
    disponibilite: r.disponibilite,
    classeDisponibilite: classerDisponibilite(r.disponibilite, maintenant),
    photo: urlPhoto(r.photos?.[0]),
    publieeLe: new Date(r.publiee_le).toISOString(),
    expireLe: new Date(r.expire_le).toISOString(),
    ...(r.km != null ? { km: Number(r.km) } : {}),
  }
}

/** Toutes les annonces visibles en France, les plus récentes d'abord, puis par titre. */
export async function getAnnoncesFrance(): Promise<AnnonceResume[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('cessions')
  const { rows } = await db.execute<Ligne>(sql`
    SELECT ${COLONNES} ${SOURCE}
    WHERE ${VISIBLE}
    ORDER BY a.publiee_le DESC, lower(a.titre), a.id
  `)
  const maintenant = new Date()
  return rows.map((r) => resume(r, maintenant))
}

/**
 * Les annonces d'un département, triées par distance au centre de sa commune
 * la plus peuplée (la ville que la liste nomme : « depuis Bordeaux »), puis
 * par titre.
 */
export async function getAnnoncesDepartement(codeDepartement: string): Promise<{ origine: string | null; annonces: AnnonceResume[] }> {
  'use cache'
  cacheLife('listing')
  cacheTag('cessions')
  const [{ rows: origines }, { rows }] = await Promise.all([
    db.execute<{ nom: string }>(sql`
      SELECT nom FROM communes
      WHERE departement_code = ${codeDepartement} AND type = 'commune' AND centre IS NOT NULL
      ORDER BY population DESC NULLS LAST LIMIT 1
    `),
    db.execute<Ligne>(sql`
      WITH origine AS (
        SELECT centre FROM communes
        WHERE departement_code = ${codeDepartement} AND type = 'commune' AND centre IS NOT NULL
        ORDER BY population DESC NULLS LAST LIMIT 1
      )
      SELECT ${COLONNES},
        ST_Distance(COALESCE(a.centre, c.centre)::geography, (SELECT centre FROM origine)::geography) / 1000 AS km
      ${SOURCE}
      WHERE ${VISIBLE} AND a.departement_code = ${codeDepartement}
      ORDER BY km ASC NULLS LAST, lower(a.titre), a.id
    `),
  ])
  const maintenant = new Date()
  return { origine: origines[0]?.nom ?? null, annonces: rows.map((r) => resume(r, maintenant)) }
}

/** Une annonce visible, par son slug ; `null` si elle n'existe pas, a expiré ou a été retirée. */
export async function getAnnonceCession(slug: string): Promise<AnnonceDetail | null> {
  'use cache'
  cacheLife('listing')
  cacheTag('cessions', `cession:${slug}`)
  const { rows } = await db.execute<
    Ligne & { description: string; equipements: string[] | null; conditions: string | null; locaux: string | null; auteur_user_id: string }
  >(sql`
    SELECT ${COLONNES}, a.description, a.equipements, a.conditions, a.locaux, a.auteur_user_id
    ${SOURCE}
    WHERE ${VISIBLE} AND a.slug = ${slug}
    LIMIT 1
  `)
  const r = rows[0]
  if (!r) return null
  return {
    ...resume(r, new Date()),
    description: r.description,
    equipements: (r.equipements ?? []).map((e) => e.trim()).filter(Boolean),
    conditions: r.conditions,
    locaux: r.locaux,
    photos: (r.photos ?? []).map(urlPhoto).filter((u): u is string => !!u),
    auteurUserId: r.auteur_user_id,
  }
}

/** Annonces proches : même département, par distance au centre du secteur, puis par titre. */
export async function getAnnoncesProches(id: string, codeDepartement: string, lon: number, lat: number, limite = 3): Promise<AnnonceResume[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('cessions')
  const { rows } = await db.execute<Ligne>(sql`
    SELECT ${COLONNES},
      ST_Distance(COALESCE(a.centre, c.centre)::geography, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography) / 1000 AS km
    ${SOURCE}
    WHERE ${VISIBLE} AND a.departement_code = ${codeDepartement} AND a.id <> ${id}
    ORDER BY km ASC, lower(a.titre), a.id
    LIMIT ${limite}
  `)
  const maintenant = new Date()
  return rows.map((r) => resume(r, maintenant))
}

/** Tous les départements, avec le nombre d'annonces visibles, pour le filtre et l'alerte. */
export async function getDepartementsCession(): Promise<DepartementCession[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('cessions', 'annuaire')
  const { rows } = await db.execute<{ code: string; nom: string; slug: string; total: number }>(sql`
    SELECT d.code, d.nom, d.slug,
      (SELECT count(*)::int FROM annonces_cession a WHERE a.departement_code = d.code AND a.statut = 'publiee' AND a.expire_le > now()) AS total
    FROM departements d
    ORDER BY d.code
  `)
  return rows
}
