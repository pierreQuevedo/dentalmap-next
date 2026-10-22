import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import type { StatutCandidature } from './candidature'
import { libelleQualification, lireCriteres, lireExperiences, lireFormation, lireVisibilite, situationDe, type Criteres, type Experience, type Situation, type Visibilite } from './profil-candidat'

/**
 * Les candidatures en base, côté recruteur et côté candidat. Lecture
 * directe : l'espace pro et l'espace candidat ne sont jamais mis en cache.
 * Le recruteur reçoit le nom complet, l'email et le téléphone dès la
 * candidature : il contacte la personne directement.
 */

export type CandidatureRecue = {
  id: string
  origine: 'candidat' | 'recruteur'
  offreId: string
  offreTitre: string
  offreSlug: string
  statut: StatutCandidature
  message: string | null
  cv: { nom: string; taille: number | null } | null
  creeLe: Date
  /** Nom tel que le compte le porte, affiché en entier au recruteur. */
  nom: string
  coordonnees: { email: string; telephone: string | null }
  /** Photo du profil candidat, sinon celle de la fiche du compte ; à défaut, les initiales. */
  photo: string | null
  /** Le profil candidat, s'il existe : ce que le recruteur en lit. */
  profil: { qualification: string; titreVerifie: boolean; experiences: Experience[]; competences: string[]; criteres: Criteres; visibilite: Visibilite } | null
}

/** Les candidatures reçues sur les offres d'une fiche, les plus récentes d'abord. */
export async function getCandidaturesRecues(praticienId: string): Promise<CandidatureRecue[]> {
  const { rows } = await db.execute<{
      id: string
      offre_id: string
      offre_titre: string
      offre_slug: string
      statut: StatutCandidature
      origine: 'candidat' | 'recruteur'
      message: string | null
      cv_nom: string | null
      cv_taille: number | null
      cv_chemin: string | null
      cree_le: string
      nom: string
      email: string
      telephone: string | null
      photo: string | null
      situation: string | null
      qualification: string | null
      titre_verifie: boolean | null
      criteres: unknown
      formation: unknown
      experiences: unknown
      competences: string[] | null
      visibilite: string | null
    }>(sql`
    SELECT k.id, k.offre_id, o.titre AS offre_titre, o.slug AS offre_slug, k.statut, k.origine, k.message,
           k.cv_nom, k.cv_taille, k.cv_chemin, k.cree_le, u.name AS nom, u.email, coalesce(k.telephone, c.telephone) AS telephone,
           coalesce(c.photo_url, (
             SELECT fc.photo_url FROM revendications r JOIN fiches_completees fc ON fc.praticien_id = r.praticien_id
             WHERE r.user_id = k.candidat_user_id AND r.statut = 'acceptee' AND r.objet = 'revendication' AND fc.photo_url IS NOT NULL LIMIT 1
           )) AS photo,
           c.situation, c.qualification, c.titre_verifie, c.criteres, c.formation, c.experiences, c.competences, c.visibilite
    FROM candidatures k
    JOIN offres o ON o.id = k.offre_id
    JOIN "user" u ON u.id = k.candidat_user_id
    LEFT JOIN candidats c ON c.user_id = k.candidat_user_id
    WHERE o.praticien_id = ${praticienId}
    ORDER BY k.cree_le DESC, k.id
  `)
  return rows.map((r) => {
    return {
      id: r.id,
      origine: r.origine,
      offreId: r.offre_id,
      offreTitre: r.offre_titre,
      offreSlug: r.offre_slug,
      statut: r.statut,
      message: r.message,
      cv: r.cv_chemin ? { nom: r.cv_nom ?? 'CV.pdf', taille: r.cv_taille } : null,
      creeLe: new Date(r.cree_le),
      nom: r.nom,
      coordonnees: { email: r.email, telephone: r.telephone },
      photo: r.photo,
      profil:
        r.situation && situationDe(r.situation)
          ? {
              qualification: libelleQualification({ situation: r.situation as Situation, qualification: r.qualification, formation: lireFormation(r.formation) }),
              titreVerifie: Boolean(r.titre_verifie),
              experiences: lireExperiences(r.experiences),
              competences: r.competences ?? [],
              criteres: lireCriteres(r.criteres),
              visibilite: lireVisibilite(r.visibilite),
            }
          : null,
    }
  })
}

export type CandidatureEnvoyee = {
  id: string
  statut: StatutCandidature
  origine: 'candidat' | 'recruteur'
  message: string | null
  cvNom: string | null
  creeLe: Date
  offre: { id: string; slug: string; titre: string; enLigne: boolean; commune: string | null; recruteur: string; laboratoire: boolean }
}

/** Les candidatures d'un compte, les plus récentes d'abord. */
export async function getCandidaturesEnvoyees(userId: string): Promise<CandidatureEnvoyee[]> {
  const { rows } = await db.execute<{
      id: string
      statut: StatutCandidature
      origine: 'candidat' | 'recruteur'
      message: string | null
      cv_nom: string | null
      cree_le: string
      offre_id: string
      offre_slug: string
      offre_titre: string
      en_ligne: boolean
      commune_nom: string | null
      profession: Profession
      nom: string
      prenom: string | null
      raison_sociale: string | null
    }>(sql`
    SELECT k.id, k.statut, k.origine, k.message, k.cv_nom, k.cree_le,
           o.id AS offre_id, o.slug AS offre_slug, o.titre AS offre_titre,
           (o.statut = 'en_ligne' AND (o.expire_le IS NULL OR o.expire_le > now())) AS en_ligne,
           cm.nom AS commune_nom, p.profession, p.nom, p.prenom, p.raison_sociale
    FROM candidatures k
    JOIN offres o ON o.id = k.offre_id
    JOIN praticiens p ON p.id = o.praticien_id
    LEFT JOIN communes cm ON cm.code_insee = o.commune_code
    WHERE k.candidat_user_id = ${userId}::uuid
    ORDER BY k.cree_le DESC
  `)
  return rows.map((r) => ({
    id: r.id,
    statut: r.statut,
    origine: r.origine,
    message: r.message,
    cvNom: r.cv_nom,
    creeLe: new Date(r.cree_le),
    offre: {
      id: r.offre_id,
      slug: r.offre_slug,
      titre: r.offre_titre,
      enLigne: r.en_ligne,
      commune: r.commune_nom,
      recruteur: nomAffiche({ profession: r.profession, nom: r.nom, prenom: r.prenom, raisonSociale: r.raison_sociale }),
      laboratoire: r.profession === 'prothesiste',
    },
  }))
}

/** La candidature d'un compte à une offre, pour le tiroir « Postuler » : déjà envoyée ou non. */
export async function getMaCandidature(userId: string, offreId: string): Promise<{ id: string; creeLe: Date } | null> {
  const { rows } = await db.execute<{ id: string; cree_le: string }>(sql`
    SELECT id, cree_le FROM candidatures WHERE candidat_user_id = ${userId}::uuid AND offre_id = ${offreId}
  `)
  return rows[0] ? { id: rows[0].id, creeLe: new Date(rows[0].cree_le) } : null
}

/** Les offres auxquelles un compte a déjà postulé : « Déjà postulé » sur leur carte. */
export async function getOffresPostulees(userId: string): Promise<Set<string>> {
  const { rows } = await db.execute<{ offre_id: string }>(sql`SELECT offre_id FROM candidatures WHERE candidat_user_id = ${userId}::uuid`)
  return new Set(rows.map((r) => r.offre_id))
}
