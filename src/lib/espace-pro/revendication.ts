import { randomUUID } from 'node:crypto'
import type { Profession } from '@/lib/annuaire/types'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import type { FicheCompletee } from './fiche-completee'

/**
 * Accès aux revendications, côté espace pro.
 *
 * Jamais mis en cache : tout ici dépend du compte connecté.
 */

export type FicheRevendicable = {
  id: string
  slug: string
  profession: Profession
  rpps: string | null
  nom: string
  prenom: string | null
  raisonSociale: string | null
  communeSlug: string | null
  departementSlug: string | null
  communeNom: string | null
}

export async function getFicheParSlug(slug: string): Promise<FicheRevendicable | null> {
  const { rows } = await db.execute<{
    id: string
    slug: string
    profession: Profession
    rpps: string | null
    nom: string
    prenom: string | null
    raison_sociale: string | null
    commune_slug: string | null
    departement_slug: string | null
    commune_nom: string | null
  }>(sql`
    SELECT DISTINCT ON (p.id) p.id, p.slug, p.profession, p.rpps, p.nom, p.prenom, p.raison_sociale,
           c.slug AS commune_slug, d.slug AS departement_slug, c.nom AS commune_nom
    FROM praticiens p
    LEFT JOIN lieux_exercice l ON l.praticien_id = p.id
    LEFT JOIN communes c ON c.code_insee = l.code_insee
    LEFT JOIN departements d ON d.code = c.departement_code
    WHERE p.slug = ${slug} AND p.deleted_at IS NULL
    ORDER BY p.id, l.principal DESC
    LIMIT 1
  `)
  const r = rows[0]
  if (!r) return null
  return {
    id: r.id,
    slug: r.slug,
    profession: r.profession,
    rpps: r.rpps,
    nom: r.nom,
    prenom: r.prenom,
    raisonSociale: r.raison_sociale,
    communeSlug: r.commune_slug,
    departementSlug: r.departement_slug,
    communeNom: r.commune_nom,
  }
}

/**
 * Vrai si ce compte peut travailler sur cette fiche : revendication acceptée,
 * ou encore en attente. Le tunnel ouvre le parcours d'accueil dès la demande
 * pour ne pas faire attendre le praticien ; ce qu'il saisit n'est publié que
 * lorsque la demande est acceptée, ce que les lectures publiques vérifient.
 */
export async function detientLaFiche(userId: string, praticienId: string): Promise<boolean> {
  const { rows } = await db.execute<{ ok: boolean }>(sql`
    SELECT EXISTS (
      SELECT 1 FROM revendications
      WHERE user_id = ${userId}::uuid AND praticien_id = ${praticienId} AND statut IN ('acceptee', 'en_attente')
    ) AS ok
  `)
  return rows[0]?.ok ?? false
}

/** Vrai si une revendication acceptée existe pour ce praticien, quel que soit le compte. */
export async function ficheAttribuee(praticienId: string): Promise<boolean> {
  const { rows } = await db.execute<{ ok: boolean }>(sql`
    SELECT EXISTS (SELECT 1 FROM revendications WHERE praticien_id = ${praticienId} AND statut = 'acceptee') AS ok
  `)
  return rows[0]?.ok ?? false
}

/**
 * Accorde la fiche à un compte sur la foi de Pro Santé Connect.
 *
 * L'appelant a déjà comparé le RPPS certifié à celui de la fiche. Ici, on
 * enregistre : une demande manuelle en attente du même compte devient
 * acceptée, sinon une ligne est créée directement acceptée.
 */
export async function accorderParPsc(args: {
  praticienId: string
  userId: string
  identifiantNational: string
  rpps: string
}): Promise<void> {
  await db.execute(sql`
    INSERT INTO revendications (id, praticien_id, user_id, statut, methode, identifiant_psc, rpps_verifie, demande_le, traite_le)
    VALUES (${randomUUID()}, ${args.praticienId}, ${args.userId}::uuid, 'acceptee', 'pro_sante_connect',
            ${args.identifiantNational}, ${args.rpps}, now(), now())
    ON CONFLICT (praticien_id, user_id) DO UPDATE
      SET statut = 'acceptee',
          methode = 'pro_sante_connect',
          identifiant_psc = EXCLUDED.identifiant_psc,
          rpps_verifie = EXCLUDED.rpps_verifie,
          traite_le = now()
  `)
}

export type FicheDuCompte = {
  slug: string
  profession: Profession
  nom: string
  prenom: string | null
  raisonSociale: string | null
  communeNom: string | null
  communeSlug: string | null
  departementSlug: string | null
  statut: 'en_attente' | 'acceptee' | 'refusee'
  methode: 'manuelle' | 'pro_sante_connect'
  demandeLe: string
  etape: number
  termineLe: string | null
}

/** Les fiches revendiquées par un compte, acceptées ou non. */
export async function getFichesDuCompte(userId: string): Promise<FicheDuCompte[]> {
  const { rows } = await db.execute<{
    slug: string
    profession: Profession
    nom: string
    prenom: string | null
    raison_sociale: string | null
    commune_nom: string | null
    commune_slug: string | null
    departement_slug: string | null
    statut: FicheDuCompte['statut']
    methode: FicheDuCompte['methode']
    demande_le: string
    etape: number | null
    termine_le: string | null
  }>(sql`
    SELECT DISTINCT ON (r.id) p.slug, p.profession, p.nom, p.prenom, p.raison_sociale,
           c.nom AS commune_nom, c.slug AS commune_slug, d.slug AS departement_slug,
           r.statut, r.methode, r.demande_le, f.etape, f.termine_le
    FROM revendications r
    JOIN praticiens p ON p.id = r.praticien_id AND p.deleted_at IS NULL
    LEFT JOIN fiches_completees f ON f.praticien_id = p.id
    LEFT JOIN lieux_exercice l ON l.praticien_id = p.id
    LEFT JOIN communes c ON c.code_insee = l.code_insee
    LEFT JOIN departements d ON d.code = c.departement_code
    WHERE r.user_id = ${userId}::uuid
    ORDER BY r.id, l.principal DESC
  `)
  return rows.map((r) => ({
    slug: r.slug,
    profession: r.profession,
    nom: r.nom,
    prenom: r.prenom,
    raisonSociale: r.raison_sociale,
    communeNom: r.commune_nom,
    communeSlug: r.commune_slug,
    departementSlug: r.departement_slug,
    statut: r.statut,
    methode: r.methode,
    demandeLe: r.demande_le,
    etape: r.etape ?? 0,
    termineLe: r.termine_le,
  }))
}

/** Lecture directe, sans cache, pour préremplir le parcours d'accueil. */
export async function getFicheCompleteeParPraticien(praticienId: string): Promise<FicheCompletee | null> {
  const { rows } = await db.execute<{
    horaires: FicheCompletee['horaires']
    langues: string[]
    accessibilite: string[]
    accessibilite_commentaire: string | null
    paiements: string[]
    tiers_payant: FicheCompletee['tiersPayant']
    orientations: string[]
    etape: number
    termine_le: string | null
    updated_at: string
  }>(sql`
    SELECT horaires, langues, accessibilite, accessibilite_commentaire, paiements, tiers_payant, orientations, etape, termine_le, updated_at
    FROM fiches_completees WHERE praticien_id = ${praticienId} LIMIT 1
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
    orientations: r.orientations ?? [],
    etape: r.etape,
    termineLe: r.termine_le,
    majLe: r.updated_at,
  }
}
