import { randomUUID } from 'node:crypto'
import type { Profession } from '@/lib/annuaire/types'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import type { FicheCompletee } from './fiche-completee'
import { COLONNES_FICHE, ficheDepuisLigne, type LigneFiche } from './fiche-lecture'

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
      SELECT 1 FROM revendications r
      WHERE r.user_id = ${userId}::uuid AND r.praticien_id = ${praticienId} AND r.objet = 'revendication'
        AND (
          r.statut = 'acceptee'
          -- En attente : la main sur un brouillon, sauf si un autre compte gère déjà la fiche (contestation) :
          -- il n'y a qu'une saisie par fiche, celle du titulaire.
          OR (r.statut = 'en_attente' AND NOT EXISTS (
            SELECT 1 FROM revendications a WHERE a.praticien_id = r.praticien_id AND a.user_id <> r.user_id AND a.statut = 'acceptee' AND a.objet = 'revendication'
          ))
        )
    ) AS ok
  `)
  return rows[0]?.ok ?? false
}

/** Vrai si une revendication acceptée existe pour ce praticien, quel que soit le compte. */
export async function ficheAttribuee(praticienId: string): Promise<boolean> {
  const { rows } = await db.execute<{ ok: boolean }>(sql`
    SELECT EXISTS (SELECT 1 FROM revendications WHERE praticien_id = ${praticienId} AND statut = 'acceptee' AND objet = 'revendication') AS ok
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
          objet = 'revendication',
          methode = 'pro_sante_connect',
          identifiant_psc = EXCLUDED.identifiant_psc,
          rpps_verifie = EXCLUDED.rpps_verifie,
          traite_le = now()
  `)
  await reprendreFicheCompletee(args.praticienId, args.userId)
}

/**
 * Une revendication vient d'être acceptée : ce qu'un compte non validé a
 * écrit sur la fiche (horaires, liens, photo, présentation) est effacé, et la
 * fiche repart des registres. Sinon un usurpateur en attente pouvait poser un
 * faux lien de rendez-vous, mis en ligne dès l'acceptation du vrai praticien
 * (audit du 2026-10-26). Ce qu'a écrit le compte accepté, ou un autre
 * titulaire encore validé, est gardé.
 */
export async function reprendreFicheCompletee(praticienId: string, userId: string): Promise<void> {
  await db.execute(sql`
    DELETE FROM fiches_completees f
    WHERE f.praticien_id = ${praticienId} AND f.user_id <> ${userId}::uuid
      AND NOT EXISTS (
        SELECT 1 FROM revendications r
        WHERE r.praticien_id = f.praticien_id AND r.user_id = f.user_id AND r.statut = 'acceptee' AND r.objet = 'revendication'
      )
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
  methode: 'manuelle' | 'pro_sante_connect' | 'justificatif'
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
    WHERE r.user_id = ${userId}::uuid AND r.objet = 'revendication'
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

/** Lecture directe, sans cache : l'espace pro voit sa saisie, publiée ou non. */
export async function getFicheCompleteeParPraticien(praticienId: string): Promise<FicheCompletee | null> {
  const { rows } = await db.execute<LigneFiche>(sql`SELECT ${COLONNES_FICHE} FROM fiches_completees f WHERE f.praticien_id = ${praticienId} LIMIT 1`)
  return rows[0] ? ficheDepuisLigne(rows[0]) : null
}

/**
 * Applique un retrait de fiche, identité vérifiée (Pro Santé Connect, ou
 * justificatif accepté par l'équipe).
 *
 * La fiche est marquée supprimée, comme le fait la synchronisation pour un
 * praticien sorti du registre, et `retire_le` dit pourquoi : la
 * synchronisation ne doit pas la recréer. Les données déclaratives sont
 * effacées. La demande de retrait est gardée, acceptée : c'est elle qui
 * permet au même compte d'annuler pendant trente jours.
 */
export async function appliquerRetrait(args: { praticienId: string; userId: string; methode: 'pro_sante_connect' | 'justificatif'; rpps?: string; identifiantNational?: string }): Promise<void> {
  await db.execute(sql`
    INSERT INTO revendications (id, praticien_id, user_id, statut, methode, objet, identifiant_psc, rpps_verifie, demande_le, traite_le)
    VALUES (${randomUUID()}, ${args.praticienId}, ${args.userId}::uuid, 'acceptee', ${args.methode}, 'retrait',
            ${args.identifiantNational ?? null}, ${args.rpps ?? null}, now(), now())
    ON CONFLICT (praticien_id, user_id) DO UPDATE
      SET statut = 'acceptee', objet = 'retrait', methode = EXCLUDED.methode, traite_le = now()
  `)
  await db.execute(sql`DELETE FROM fiches_completees WHERE praticien_id = ${args.praticienId}`)
  await db.execute(sql`UPDATE praticiens SET deleted_at = now(), retire_le = now(), updated_at = now() WHERE id = ${args.praticienId}`)
}

/** Le RPPS porté par une fiche, pour la retrouver au retour de Pro Santé Connect. */
export async function getFicheParRpps(rpps: string): Promise<FicheRevendicable | null> {
  const { rows } = await db.execute<{ slug: string }>(sql`SELECT slug FROM praticiens WHERE rpps = ${rpps} AND deleted_at IS NULL LIMIT 1`)
  return rows[0] ? getFicheParSlug(rows[0].slug) : null
}
