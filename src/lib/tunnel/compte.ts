import { headers } from 'next/headers'
import { connection } from 'next/server'
import type { Civilite, Profession } from '@/lib/annuaire/types'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { auth } from '@/lib/auth'
import { chemin } from '@/lib/navigation'
import { estRole, etapeAutorisee, prochaineEtape, PROFESSIONS_DU_ROLE, type EtapeTunnel, type EtatCompte, type Role } from './etapes'

/**
 * Le compte connecté tel que le tunnel le voit : session, rôle, et l'état de
 * ses demandes. Lu à chaque page du tunnel, jamais mis en cache : c'est de
 * l'état par personne, et il change à chaque étape.
 */
export type Compte = {
  id: string
  email: string
  nom: string
  role: Role | null
  etapeTunnel: string | null
  etat: EtatCompte
}

export async function getCompte(): Promise<Compte | null> {
  // Sort du prérendu avant de toucher aux en-têtes : Better Auth enveloppe
  // l'erreur de report de Next dans une erreur « Failed to get session »,
  // qui finirait dans les journaux à chaque page prérendue.
  await connection()
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null
  const u = session.user as typeof session.user & { role?: string | null; etapeTunnel?: string | null }
  const role = estRole(u.role) ? u.role : null

  const [{ rows: revendications }, { rows: creations }] = await Promise.all([
    db.execute<{ statut: 'en_attente' | 'acceptee' | 'refusee'; termine_le: string | null }>(sql`
      SELECT r.statut, f.termine_le
      FROM revendications r
      LEFT JOIN fiches_completees f ON f.praticien_id = r.praticien_id
      WHERE r.user_id = ${u.id}::uuid
    `),
    db.execute<{ n: number }>(sql`
      SELECT count(*)::int AS n FROM demandes_creation_fiche WHERE user_id = ${u.id}::uuid AND statut = 'en_attente'
    `),
  ])

  return {
    id: u.id,
    email: u.email,
    nom: u.name,
    role,
    etapeTunnel: u.etapeTunnel ?? null,
    etat: {
      role,
      revendications: revendications.map((r) => ({ statut: r.statut, onboardingTermine: r.termine_le !== null })),
      demandeCreationEnAttente: (creations[0]?.n ?? 0) > 0,
    },
  }
}

/**
 * Garde d'une page du tunnel.
 *
 * Sans session, on va se connecter et on revient ici. Avec une session mais
 * sans le droit d'être sur cette étape, on est conduit à la bonne. Renvoie le
 * compte sinon, pour que la page n'ait pas à le relire.
 */
export async function exigerEtape(etape: EtapeTunnel, retour: string): Promise<Compte> {
  const compte = await getCompte()
  if (!compte) redirect(chemin(`/connexion/?retour=${encodeURIComponent(retour)}`))
  if (!etapeAutorisee(compte.etat, etape)) redirect(chemin(prochaineEtape(compte.etat)))
  return compte
}

/** Session obligatoire, sans contrainte d'étape : favoris, réglages. */
export async function exigerConnexion(retour: string): Promise<Compte> {
  const compte = await getCompte()
  if (!compte) redirect(chemin(`/connexion/?retour=${encodeURIComponent(retour)}`))
  return compte
}

/**
 * Les modérateurs sont nommés par leur adresse dans `MODERATEURS`, séparées
 * par des virgules. Pas de table de rôles pour trois personnes : le jour où il
 * en faut une, ce sera ici que ça se branche.
 */
export function estModerateur(email: string | null | undefined): boolean {
  if (!email) return false
  const liste = (process.env.MODERATEURS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  return liste.includes(email.toLowerCase())
}

export async function exigerModerateur(retour: string): Promise<Compte> {
  const compte = await exigerConnexion(retour)
  if (!estModerateur(compte.email)) redirect(chemin('/espace-pro/'))
  return compte
}

/* ------------------------------------------------------------------ */
/* Lectures                                                             */
/* ------------------------------------------------------------------ */

export type FicheTrouvee = {
  slug: string
  profession: Profession
  nom: string
  prenom: string | null
  raisonSociale: string | null
  communeNom: string | null
  codePostal: string | null
  /** Déjà gérée par un autre compte : on le dit avant de laisser demander. */
  dejaGeree: boolean
}

/**
 * Recherche d'une fiche par nom, à l'étape « Trouvez votre fiche ».
 *
 * Nom, prénom ou raison sociale, sur les fiches de la profession du compte,
 * dix résultats au plus : c'est une recherche de soi-même, pas un annuaire.
 * Un numéro RPPS ou un SIRET saisi tel quel est reconnu et cherché exactement.
 */
export async function rechercherMaFiche(profession: Role, q: string): Promise<FicheTrouvee[]> {
  const texte = q.trim()
  const professions = PROFESSIONS_DU_ROLE[profession]
  if (texte.length < 2 || professions.length === 0) return []
  const numero = /^\d{9,14}$/.test(texte) ? texte : null
  const motif = `%${texte.replace(/[%_]/g, '')}%`
  const { rows } = await db.execute<{
    slug: string
    profession: Profession
    nom: string
    prenom: string | null
    raison_sociale: string | null
    commune_nom: string | null
    code_postal: string | null
    deja_geree: boolean
  }>(sql`
    SELECT p.slug, p.profession, p.nom, p.prenom, p.raison_sociale,
           c.nom AS commune_nom, l.code_postal,
           EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = p.id AND v.statut = 'acceptee') AS deja_geree
    FROM praticiens p
    LEFT JOIN lieux_exercice l ON l.praticien_id = p.id AND l.principal
    LEFT JOIN communes c ON c.code_insee = l.code_insee
    WHERE p.deleted_at IS NULL AND p.profession = ANY(ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(professions)}::jsonb))::text[])
      AND (
        ${numero}::text IS NOT NULL AND (p.rpps = ${numero} OR p.siret = ${numero} OR p.siren = ${numero})
        OR ${numero}::text IS NULL AND (
          coalesce(p.prenom, '') || ' ' || p.nom ILIKE ${motif}
          OR p.nom || ' ' || coalesce(p.prenom, '') ILIKE ${motif}
          OR coalesce(p.raison_sociale, '') ILIKE ${motif}
        )
      )
    ORDER BY p.nom, p.prenom
    LIMIT 10
  `)
  return rows.map((r) => ({
    slug: r.slug,
    profession: r.profession,
    nom: r.nom,
    prenom: r.prenom,
    raisonSociale: r.raison_sociale,
    communeNom: r.commune_nom,
    codePostal: r.code_postal,
    dejaGeree: r.deja_geree,
  }))
}

export type Favori = {
  slug: string
  profession: Profession
  civilite: Civilite | null
  nom: string
  prenom: string | null
  raisonSociale: string | null
  specialite: string | null
  statutVerification: 'verifie' | 'partiel' | 'non_verifie'
  /** Une revendication acceptée : le professionnel gère sa fiche. */
  revendiquee: boolean
  adresseLigne: string | null
  codePostal: string | null
  communeNom: string | null
  communeSlug: string | null
  departementSlug: string | null
  ajouteLe: string
}

export async function getFavoris(userId: string): Promise<Favori[]> {
  const { rows } = await db.execute<{
    slug: string
    profession: Profession
    civilite: Civilite | null
    nom: string
    prenom: string | null
    raison_sociale: string | null
    specialite: string | null
    statut_verification: Favori['statutVerification']
    revendiquee: boolean
    adresse_ligne: string | null
    code_postal: string | null
    commune_nom: string | null
    commune_slug: string | null
    departement_slug: string | null
    ajoute_le: string
  }>(sql`
    SELECT p.slug, p.profession, p.civilite, p.nom, p.prenom, p.raison_sociale, p.specialite, p.statut_verification,
           EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = p.id AND v.statut = 'acceptee') AS revendiquee,
           l.adresse_ligne, l.code_postal,
           c.nom AS commune_nom, c.slug AS commune_slug, d.slug AS departement_slug, f.ajoute_le
    FROM favoris f
    JOIN praticiens p ON p.id = f.praticien_id AND p.deleted_at IS NULL
    LEFT JOIN lieux_exercice l ON l.praticien_id = p.id AND l.principal
    LEFT JOIN communes c ON c.code_insee = l.code_insee
    LEFT JOIN departements d ON d.code = c.departement_code
    WHERE f.user_id = ${userId}::uuid
    ORDER BY f.ajoute_le DESC
  `)
  return rows.map((r) => ({
    slug: r.slug,
    profession: r.profession,
    civilite: r.civilite,
    nom: r.nom,
    prenom: r.prenom,
    raisonSociale: r.raison_sociale,
    specialite: r.specialite,
    statutVerification: r.statut_verification,
    revendiquee: r.revendiquee,
    adresseLigne: r.adresse_ligne,
    codePostal: r.code_postal,
    communeNom: r.commune_nom,
    communeSlug: r.commune_slug,
    departementSlug: r.departement_slug,
    ajouteLe: r.ajoute_le,
  }))
}

/** Une fiche est-elle dans les favoris de ce compte ? Pour l'état d'un bouton. */
export async function estFavori(userId: string, slug: string): Promise<boolean> {
  const { rows } = await db.execute<{ n: number }>(sql`
    SELECT count(*)::int AS n FROM favoris f JOIN praticiens p ON p.id = f.praticien_id
    WHERE f.user_id = ${userId}::uuid AND p.slug = ${slug}
  `)
  return (rows[0]?.n ?? 0) > 0
}

export type RevendicationAModerer = {
  id: string
  statut: 'en_attente' | 'acceptee' | 'refusee'
  methode: 'manuelle' | 'pro_sante_connect'
  message: string | null
  demandeLe: string
  compteEmail: string
  compteNom: string
  fiche: { slug: string; profession: Profession; nom: string; prenom: string | null; raisonSociale: string | null; communeNom: string | null; rpps: string | null; siret: string | null }
}

/** Les demandes en attente, les plus anciennes d'abord : c'est une file. */
export async function getRevendicationsEnAttente(): Promise<RevendicationAModerer[]> {
  const { rows } = await db.execute<{
    id: string
    statut: RevendicationAModerer['statut']
    methode: RevendicationAModerer['methode']
    message: string | null
    demande_le: string
    email: string
    name: string
    slug: string
    profession: Profession
    nom: string
    prenom: string | null
    raison_sociale: string | null
    commune_nom: string | null
    rpps: string | null
    siret: string | null
  }>(sql`
    SELECT r.id, r.statut, r.methode, r.message, r.demande_le, u.email, u.name,
           p.slug, p.profession, p.nom, p.prenom, p.raison_sociale, p.rpps, p.siret, c.nom AS commune_nom
    FROM revendications r
    JOIN "user" u ON u.id = r.user_id
    JOIN praticiens p ON p.id = r.praticien_id
    LEFT JOIN lieux_exercice l ON l.praticien_id = p.id AND l.principal
    LEFT JOIN communes c ON c.code_insee = l.code_insee
    WHERE r.statut = 'en_attente'
    ORDER BY r.demande_le ASC
    LIMIT 100
  `)
  return rows.map((r) => ({
    id: r.id,
    statut: r.statut,
    methode: r.methode,
    message: r.message,
    demandeLe: r.demande_le,
    compteEmail: r.email,
    compteNom: r.name,
    fiche: { slug: r.slug, profession: r.profession, nom: r.nom, prenom: r.prenom, raisonSociale: r.raison_sociale, communeNom: r.commune_nom, rpps: r.rpps, siret: r.siret },
  }))
}

export type DemandeCreation = {
  id: string
  profession: Profession
  nom: string
  prenom: string | null
  raisonSociale: string | null
  rpps: string | null
  siret: string | null
  adresse: string
  codePostal: string
  ville: string
  telephone: string | null
  email: string | null
  message: string | null
  statut: 'en_attente' | 'acceptee' | 'refusee'
  demandeLe: string
  compteEmail: string
}

export async function getDemandesCreationEnAttente(): Promise<DemandeCreation[]> {
  const { rows } = await db.execute<Omit<DemandeCreation, 'raisonSociale' | 'codePostal' | 'demandeLe' | 'compteEmail'> & { raison_sociale: string | null; code_postal: string; demande_le: string; compte_email: string }>(sql`
    SELECT d.id, d.profession, d.nom, d.prenom, d.raison_sociale, d.rpps, d.siret, d.adresse, d.code_postal, d.ville,
           d.telephone, d.email, d.message, d.statut, d.demande_le, u.email AS compte_email
    FROM demandes_creation_fiche d JOIN "user" u ON u.id = d.user_id
    WHERE d.statut = 'en_attente'
    ORDER BY d.demande_le ASC
    LIMIT 100
  `)
  return rows.map((r) => ({ ...r, raisonSociale: r.raison_sociale, codePostal: r.code_postal, demandeLe: r.demande_le, compteEmail: r.compte_email }))
}
