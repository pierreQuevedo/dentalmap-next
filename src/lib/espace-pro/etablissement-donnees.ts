import { cacheLife, cacheTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { extraireAdresse, lireEcole, lireFaculte, nomCourt, type Faculte } from '@/lib/formation/faculte'
import { getPositionsFormation, type Position } from '@/lib/formation/geocodage'
import { lienFormation } from '@/lib/formation/types'
import { getFormation, getFormations, type FormationResume } from '@/lib/wp/queries'
import {
  domainesDe,
  donneesFaculte,
  formationsDepuisDiplomes,
  formationsFaculte,
  lireDonnees,
  DONNEES_VIDES,
  type Domaines,
  type Donnees,
  type TypeEtablissement,
} from './etablissement'

/**
 * Les lectures du couloir « École ou organisme » : l'établissement tel que
 * WordPress le publie, et ce que ses gestionnaires déclarent dans Neon.
 */

export const ORGANISME = '/espace-pro/organisme'
export const ESPACE_ETAB = '/espace-pro/etablissement'

export const estTypeEtablissement = (t: string | null): t is TypeEtablissement => t === 'ecole_prothese' || t === 'faculte'

export type SourceEtablissement = {
  slug: string
  titre: string
  type: TypeEtablissement
  extrait: string | null
  ville: string | null
  adresse: string | null
  uai: string | null
  /** Le statut tel que la fiche le porte : « École privée », « Public ». */
  statut: string | null
  universite: string | null
  image: { url: string; alt: string } | null
  /** Page publique de la formation. */
  lien: string
  domaines: Domaines
  /** Formations proposées au premier passage d'O3a. */
  formationsInitiales: Donnees['formations']
  /** Le document de départ : formations, et pour une faculté cursus, voies et centres. */
  donneesInitiales: Partial<Donnees>
  faculte: Faculte | null
  /** Le contenu éditorial porte des résultats ou un internat lus aux sources publiques. */
  auto: { registres: boolean; resultats: boolean }
}

/** L'établissement désigné par son slug WordPress, s'il est une école de prothèse ou une faculté. */
export async function getSourceEtablissement(slug: string): Promise<SourceEtablissement | null> {
  const f = await getFormation(slug)
  if (!f || !estTypeEtablissement(f.type)) return null
  const ecole = f.type === 'ecole_prothese' ? lireEcole(f.contenu) : null
  const fac = f.type === 'faculte' ? lireFaculte(f.contenu) : null
  const emails = [ecole?.email, fac?.email].filter((e): e is string => !!e)
  return {
    slug: f.slug,
    titre: f.titre,
    type: f.type,
    extrait: f.extrait,
    ville: f.ville,
    adresse: ecole?.adresse ?? fac?.adresse ?? null,
    uai: f.uai,
    statut: fac ? 'Public, rattachée à l’université' : (ecole?.type ?? (ecole?.statut === 'prive' ? 'Privé' : ecole?.statut === 'public' ? 'Public' : null)),
    universite: fac?.universite ?? null,
    image: f.image,
    lien: lienFormation(f),
    domaines: domainesDe({ emails, siteWeb: f.siteWeb ?? ecole?.siteWeb ?? fac?.siteWeb ?? null }),
    formationsInitiales: f.type === 'faculte' ? formationsFaculte(fac?.diplome ?? null, fac?.duree ?? null, fac?.capacite.nombre ?? null) : formationsDepuisDiplomes(f.diplomes),
    donneesInitiales: fac ? donneesFaculte(fac, nomCourt, extraireAdresse) : { formations: f.type === 'faculte' ? formationsFaculte(null, null) : formationsDepuisDiplomes(f.diplomes) },
    faculte: fac,
    auto: { registres: true, resultats: f.type === 'faculte' ? (fac?.internats.length ?? 0) > 0 : false },
  }
}

/** Le point de l'établissement sur la carte, géocodé une fois et gardé en cache. */
export async function positionDe(s: SourceEtablissement): Promise<Position | null> {
  if (!s.adresse) return null
  const [p] = await getPositionsFormation(s.slug, [s.adresse])
  return p ?? null
}

const normaliser = (v: string) =>
  v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

export type ResultatEtablissement = Pick<FormationResume, 'slug' | 'titre' | 'ville' | 'uai'> & { type: TypeEtablissement; gere: boolean }

/**
 * O2a : recherche sur le nom, la ville ou le numéro UAI, parmi les écoles de
 * prothèse et les facultés publiées. Tous les mots doivent se retrouver.
 */
export async function chercherEtablissements(q: string, type?: TypeEtablissement): Promise<ResultatEtablissement[]> {
  const termes = normaliser(q).split(' ').filter((t) => t.length > 1)
  if (!termes.length) return []
  const [formations, geres] = await Promise.all([getFormations(), slugsGeres()])
  return formations
    .filter((f): f is FormationResume & { type: TypeEtablissement } => estTypeEtablissement(f.type) && (!type || f.type === type))
    .filter((f) => {
      const botte = normaliser(`${f.titre} ${f.ville ?? ''} ${f.uai ?? ''} ${f.departement ?? ''}`)
      return termes.every((t) => botte.includes(t))
    })
    .slice(0, 8)
    .map((f) => ({ slug: f.slug, titre: f.titre, ville: f.ville, uai: f.uai, type: f.type, gere: geres.has(f.slug) }))
}

async function slugsGeres(): Promise<Set<string>> {
  const { rows } = await db.execute<{ slug: string }>(sql`SELECT DISTINCT slug FROM revendications_etablissement WHERE statut = 'acceptee'`)
  return new Set(rows.map((r) => r.slug))
}

/* ------------------------------------------------------------------ */
/* Ce que le compte gère                                                */
/* ------------------------------------------------------------------ */

export type Gestion = {
  id: string
  slug: string
  titre: string
  type: TypeEtablissement
  methode: 'domaine' | 'attestation'
  statut: 'en_attente' | 'acceptee' | 'refusee'
  motifRefus: string | null
  justificatifNom: string | null
  demandeLe: string
}

/** Les établissements de ce compte, le plus récent d'abord. */
export async function getGestions(userId: string): Promise<Gestion[]> {
  const { rows } = await db.execute<{
    id: string
    slug: string
    titre: string
    type: TypeEtablissement
    methode: Gestion['methode']
    statut: Gestion['statut']
    motif_refus: string | null
    justificatif_nom: string | null
    demande_le: string
  }>(sql`
    SELECT id, slug, titre, type, methode, statut, motif_refus, justificatif_nom, demande_le
    FROM revendications_etablissement WHERE user_id = ${userId}::uuid
    ORDER BY (statut = 'refusee'), demande_le DESC
  `)
  return rows.map((r) => ({ id: r.id, slug: r.slug, titre: r.titre, type: r.type, methode: r.methode, statut: r.statut, motifRefus: r.motif_refus, justificatifNom: r.justificatif_nom, demandeLe: r.demande_le }))
}

export type FicheEtablissement = { type: TypeEtablissement; donnees: Donnees; publieeLe: string | null; misAJourLe: string | null }

export async function getFicheEtablissement(slug: string): Promise<FicheEtablissement | null> {
  const { rows } = await db.execute<{ type: TypeEtablissement; donnees: unknown; publiee_le: string | null; mis_a_jour_le: string | null }>(sql`
    SELECT type, donnees, publiee_le, mis_a_jour_le FROM fiches_etablissement WHERE slug = ${slug}
  `)
  const r = rows[0]
  return r ? { type: r.type, donnees: lireDonnees(r.donnees), publieeLe: r.publiee_le, misAJourLe: r.mis_a_jour_le } : null
}

/** Crée le document de l'établissement, prérempli, s'il n'existe pas encore. */
export async function initialiserFiche(s: SourceEtablissement, userId: string): Promise<void> {
  const donnees: Donnees = { ...DONNEES_VIDES, ...s.donneesInitiales }
  await db.execute(sql`
    INSERT INTO fiches_etablissement (slug, type, donnees, mis_a_jour_par)
    VALUES (${s.slug}, ${s.type}, ${JSON.stringify(donnees)}::jsonb, ${userId}::uuid)
    ON CONFLICT (slug) DO NOTHING
  `)
}

/**
 * Un gestionnaire vient d'être validé : ce qu'un autre compte a pu préparer
 * avant lui, sur une page jamais publiée, est effacé, et la page repart du
 * contenu de WordPress. Sinon une demande d'usurpateur, refusée plus tard,
 * laisserait ses textes en ligne à la première publication. Un document écrit
 * par la personne validée, ou par un autre gestionnaire validé, est gardé.
 */
export async function reprendreFiche(s: SourceEtablissement, userId: string): Promise<void> {
  const donnees: Donnees = { ...DONNEES_VIDES, ...s.donneesInitiales }
  await db.execute(sql`
    UPDATE fiches_etablissement f SET donnees = ${JSON.stringify(donnees)}::jsonb, mis_a_jour_le = now(), mis_a_jour_par = ${userId}::uuid
    WHERE f.slug = ${s.slug} AND f.publiee_le IS NULL AND f.mis_a_jour_par IS DISTINCT FROM ${userId}::uuid
      AND NOT EXISTS (
        SELECT 1 FROM revendications_etablissement r
        WHERE r.slug = f.slug AND r.statut = 'acceptee' AND r.user_id = f.mis_a_jour_par
      )
  `)
}

/* ------------------------------------------------------------------ */
/* Page publique                                                        */
/* ------------------------------------------------------------------ */

export type DeclarationPublique = { donnees: Donnees; misAJourLe: string; verifie: boolean }

/**
 * Ce que la page publique montre de l'établissement : seulement une fiche
 * publiée, et dont un gestionnaire a été vérifié. Mis en cache, invalidé à
 * chaque écriture par l'étiquette `etablissement:<slug>`.
 */
export async function getDeclarationPublique(slug: string): Promise<DeclarationPublique | null> {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp:formation', `etablissement:${slug}`)
  const { rows } = await db.execute<{ donnees: unknown; mis_a_jour_le: string; verifie: boolean }>(sql`
    SELECT f.donnees, f.mis_a_jour_le,
           EXISTS (SELECT 1 FROM revendications_etablissement r WHERE r.slug = f.slug AND r.statut = 'acceptee') AS verifie
    FROM fiches_etablissement f WHERE f.slug = ${slug} AND f.publiee_le IS NOT NULL
  `)
  const r = rows[0]
  if (!r?.verifie) return null
  return { donnees: lireDonnees(r.donnees), misAJourLe: r.mis_a_jour_le, verifie: true }
}

/* ------------------------------------------------------------------ */
/* Modération                                                           */
/* ------------------------------------------------------------------ */

export type AttestationAModerer = { id: string; slug: string; titre: string; justificatifNom: string | null; demandeLe: string; compteEmail: string; compteNom: string; compteTelephone: string | null; domaine: string | null }
export type AjoutAModerer = { id: string; nom: string; uai: string; ville: string; demandeLe: string; compteEmail: string }

export async function getModerationEtablissements(): Promise<{ attestations: AttestationAModerer[]; ajouts: AjoutAModerer[]; listeAttente: number }> {
  const [a, b, c] = await Promise.all([
    db.execute<{ id: string; slug: string; titre: string; justificatif_nom: string | null; demande_le: string; email: string; name: string; telephone: string | null }>(sql`
      SELECT r.id, r.slug, r.titre, r.justificatif_nom, r.demande_le, u.email, u.name, u.telephone
      FROM revendications_etablissement r JOIN "user" u ON u.id = r.user_id
      WHERE r.statut = 'en_attente' ORDER BY r.demande_le ASC LIMIT 100
    `),
    db.execute<{ id: string; nom: string; uai: string; ville: string; demande_le: string; email: string }>(sql`
      SELECT d.id, d.nom, d.uai, d.ville, d.demande_le, u.email
      FROM demandes_ajout_etablissement d JOIN "user" u ON u.id = d.user_id
      WHERE d.statut = 'en_attente' ORDER BY d.demande_le ASC LIMIT 100
    `),
    db.execute<{ n: number }>(sql`SELECT count(*)::int AS n FROM liste_attente_formation`),
  ])
  const attestations = await Promise.all(
    a.rows.map(async (r) => {
      const s = await getSourceEtablissement(r.slug)
      return { id: r.id, slug: r.slug, titre: r.titre, justificatifNom: r.justificatif_nom, demandeLe: r.demande_le, compteEmail: r.email, compteNom: r.name, compteTelephone: r.telephone, domaine: s?.domaines.domaines[0] ?? null }
    }),
  )
  return {
    attestations,
    ajouts: b.rows.map((r) => ({ id: r.id, nom: r.nom, uai: r.uai, ville: r.ville, demandeLe: r.demande_le, compteEmail: r.email })),
    listeAttente: c.rows[0]?.n ?? 0,
  }
}
