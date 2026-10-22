import { cacheLife, cacheTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { calculerForceEtablissement, lireDonnees } from '@/lib/espace-pro/etablissement'
import { resumerAvis, type ChiffresEtablissement, type LienAvis, type ResumeAvis } from './avis'

/**
 * Les avis en base : ceux d'une page (publics, en cache), les chiffres de
 * toutes les pages pour le classement, et ceux que l'établissement gère
 * depuis son espace (sans cache, avec les signalements).
 */

export type AvisPublic = {
  id: string
  auteur: string
  lien: LienAvis
  annee: string | null
  note: number
  texte: string
  creeLe: string
  modifieLe: string | null
  reponse: string | null
  reponduLe: string | null
}

/** « Camille R. » : le prénom et l'initiale du nom, jamais le nom entier. */
export function auteurAffiche(nom: string | null): string {
  const mots = (nom ?? '').trim().split(/\s+/).filter(Boolean)
  if (!mots.length) return 'Anonyme'
  const prenom = mots[0]!.charAt(0).toUpperCase() + mots[0]!.slice(1)
  return mots.length > 1 ? `${prenom} ${mots[mots.length - 1]!.charAt(0).toUpperCase()}.` : prenom
}

type Ligne = { id: string; name: string | null; lien: LienAvis; annee: string | null; note: number; texte: string; cree_le: string; modifie_le: string | null; reponse: string | null; repondu_le: string | null }

const versPublic = (r: Ligne): AvisPublic => ({
  id: r.id,
  auteur: auteurAffiche(r.name),
  lien: r.lien,
  annee: r.annee,
  note: r.note,
  texte: r.texte,
  creeLe: r.cree_le,
  modifieLe: r.modifie_le,
  reponse: r.reponse,
  reponduLe: r.repondu_le,
})

/** Les avis publiés d'une page, du plus récent au plus ancien, et leur résumé. */
export async function getAvisPublics(slug: string): Promise<{ avis: AvisPublic[]; resume: ResumeAvis }> {
  'use cache'
  cacheLife('editorial')
  cacheTag('avis', `avis:${slug}`)
  const { rows } = await db.execute<Ligne>(sql`
    SELECT a.id, u.name, a.lien, a.annee, a.note, a.texte, a.cree_le, a.modifie_le, a.reponse, a.repondu_le
    FROM avis_etablissement a JOIN "user" u ON u.id = a.user_id
    WHERE a.slug = ${slug} AND a.statut = 'publie'
    ORDER BY a.cree_le DESC
  `)
  return { avis: rows.map(versPublic), resume: resumerAvis(rows.map((r) => r.note)) }
}

/**
 * Ce qui classe les écoles et les facultés : nombre d'avis, note moyenne, et
 * taux de remplissage des pages publiées par un gestionnaire vérifié.
 */
export async function getChiffresClassement(): Promise<Map<string, ChiffresEtablissement>> {
  'use cache'
  cacheLife('editorial')
  cacheTag('avis', 'wp:formation')
  const [avis, fiches] = await Promise.all([
    db.execute<{ slug: string; nombre: number; moyenne: number }>(sql`
      SELECT slug, count(*)::int AS nombre, avg(note)::float AS moyenne FROM avis_etablissement WHERE statut = 'publie' GROUP BY slug
    `),
    db.execute<{ slug: string; type: 'ecole_prothese' | 'faculte'; donnees: unknown }>(sql`
      SELECT f.slug, f.type, f.donnees FROM fiches_etablissement f
      WHERE f.publiee_le IS NOT NULL AND EXISTS (SELECT 1 FROM revendications_etablissement r WHERE r.slug = f.slug AND r.statut = 'acceptee')
    `),
  ])
  const m = new Map<string, ChiffresEtablissement>()
  for (const f of fiches.rows) m.set(f.slug, { nombre: 0, moyenne: null, remplissage: calculerForceEtablissement(lireDonnees(f.donnees), f.type, true).total })
  for (const a of avis.rows) m.set(a.slug, { ...(m.get(a.slug) ?? { remplissage: 0 }), nombre: a.nombre, moyenne: a.moyenne })
  return m
}

/** L'avis de ce compte sur cette page, s'il en a déposé un. */
export async function getMonAvis(slug: string, userId: string): Promise<{ id: string; lien: LienAvis; annee: string | null; note: number; texte: string; statut: 'publie' | 'retire' } | null> {
  const { rows } = await db.execute<{ id: string; lien: LienAvis; annee: string | null; note: number; texte: string; statut: 'publie' | 'retire' }>(sql`
    SELECT id, lien, annee, note, texte, statut FROM avis_etablissement WHERE slug = ${slug} AND user_id = ${userId}::uuid
  `)
  return rows[0] ?? null
}

export type AvisGere = AvisPublic & { statut: 'publie' | 'retire'; signale: boolean }

/** Les avis d'une page vus par son gestionnaire : publiés et retirés, avec ses signalements en cours. */
export async function getAvisGeres(slug: string): Promise<AvisGere[]> {
  const { rows } = await db.execute<Ligne & { statut: 'publie' | 'retire'; signale: boolean }>(sql`
    SELECT a.id, u.name, a.lien, a.annee, a.note, a.texte, a.cree_le, a.modifie_le, a.reponse, a.repondu_le, a.statut,
           EXISTS (SELECT 1 FROM signalements_avis s WHERE s.avis_id = a.id AND s.par_etablissement AND s.statut = 'ouvert') AS signale
    FROM avis_etablissement a JOIN "user" u ON u.id = a.user_id
    WHERE a.slug = ${slug}
    ORDER BY a.cree_le DESC
  `)
  return rows.map((r) => ({ ...versPublic(r), statut: r.statut, signale: r.signale }))
}

export type AvisSignale = { id: string; slug: string; note: number; texte: string; lien: LienAvis; auteur: string; creeLe: string; signalements: { motif: string; detail: string | null; parEtablissement: boolean; le: string }[] }

/** Les avis signalés à traiter, le plus ancien signalement d'abord. */
export async function getAvisSignales(): Promise<AvisSignale[]> {
  const { rows } = await db.execute<Ligne & { slug: string; signalements: AvisSignale['signalements'] }>(sql`
    SELECT a.id, a.slug, u.name, a.lien, a.annee, a.note, a.texte, a.cree_le, a.modifie_le, a.reponse, a.repondu_le,
           json_agg(json_build_object('motif', s.motif, 'detail', s.detail, 'parEtablissement', s.par_etablissement, 'le', s.cree_le) ORDER BY s.cree_le) AS signalements
    FROM signalements_avis s
    JOIN avis_etablissement a ON a.id = s.avis_id
    JOIN "user" u ON u.id = a.user_id
    WHERE s.statut = 'ouvert'
    GROUP BY a.id, u.name
    ORDER BY min(s.cree_le)
    LIMIT 100
  `)
  return rows.map((r) => ({ id: r.id, slug: r.slug, note: r.note, texte: r.texte, lien: r.lien, auteur: auteurAffiche(r.name), creeLe: r.cree_le, signalements: r.signalements }))
}
