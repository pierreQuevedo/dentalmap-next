import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import type { StatutCandidature } from './candidature'
import { libelleQualification, lireCriteres, lireExperiences, lireFormation, lireVisibilite, situationDe, type Criteres, type Experience, type Situation, type Visibilite } from './profil-candidat'

/**
 * Les candidatures en base, côté recruteur et côté candidat. Lecture
 * directe : l'espace pro et l'espace candidat ne sont jamais mis en cache.
 * Les coordonnées du candidat (nom complet, adresse, téléphone) ne sortent
 * d'ici pour le recruteur qu'une fois l'échange accepté.
 */

export type Echange = {
  message: string
  creneaux: string[]
  telephoneRecruteur: string
  contactRecruteur: string | null
  statut: 'en_attente' | 'acceptee' | 'refusee'
  creneauChoisi: string | null
  telephoneCandidat: string | null
  creeLe: Date
  reponduLe: Date | null
}

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
  /** Nom tel que le compte le porte ; à masquer avant l'échange (`nomCandidat`). */
  nom: string
  /** Remplis seulement après l'échange accepté. */
  coordonnees: { email: string; telephone: string | null } | null
  /** Le profil candidat, s'il existe : ce que le recruteur en lit. */
  profil: { qualification: string; titreVerifie: boolean; experiences: Experience[]; competences: string[]; criteres: Criteres; visibilite: Visibilite } | null
  echange: Echange | null
}

type LigneEchange = {
  e_message: string | null
  e_creneaux: string[] | null
  e_telephone_recruteur: string | null
  e_contact_recruteur: string | null
  e_statut: Echange['statut'] | null
  e_creneau_choisi: string | null
  e_telephone_candidat: string | null
  e_cree_le: string | null
  e_repondu_le: string | null
}

const COLONNES_ECHANGE = sql`
  e.message AS e_message, e.creneaux AS e_creneaux, e.telephone_recruteur AS e_telephone_recruteur,
  e.contact_recruteur AS e_contact_recruteur, e.statut AS e_statut, e.creneau_choisi AS e_creneau_choisi,
  e.telephone_candidat AS e_telephone_candidat, e.cree_le AS e_cree_le, e.repondu_le AS e_repondu_le`

function echangeDe(r: LigneEchange): Echange | null {
  if (!r.e_statut) return null
  return {
    message: r.e_message ?? '',
    creneaux: r.e_creneaux ?? [],
    telephoneRecruteur: r.e_telephone_recruteur ?? '',
    contactRecruteur: r.e_contact_recruteur,
    statut: r.e_statut,
    creneauChoisi: r.e_creneau_choisi,
    telephoneCandidat: r.e_telephone_candidat,
    creeLe: new Date(r.e_cree_le!),
    reponduLe: r.e_repondu_le ? new Date(r.e_repondu_le) : null,
  }
}

/** Les candidatures reçues sur les offres d'une fiche, les plus récentes d'abord. */
export async function getCandidaturesRecues(praticienId: string): Promise<CandidatureRecue[]> {
  const { rows } = await db.execute<
    LigneEchange & {
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
      situation: string | null
      qualification: string | null
      titre_verifie: boolean | null
      criteres: unknown
      formation: unknown
      experiences: unknown
      competences: string[] | null
      visibilite: string | null
    }
  >(sql`
    SELECT k.id, k.offre_id, o.titre AS offre_titre, o.slug AS offre_slug, k.statut, k.origine, k.message,
           k.cv_nom, k.cv_taille, k.cv_chemin, k.cree_le, u.name AS nom, u.email,
           c.situation, c.qualification, c.titre_verifie, c.criteres, c.formation, c.experiences, c.competences, c.visibilite,
           ${COLONNES_ECHANGE}
    FROM candidatures k
    JOIN offres o ON o.id = k.offre_id
    JOIN "user" u ON u.id = k.candidat_user_id
    LEFT JOIN candidats c ON c.user_id = k.candidat_user_id
    LEFT JOIN echanges_candidature e ON e.candidature_id = k.id
    WHERE o.praticien_id = ${praticienId}
    ORDER BY k.cree_le DESC, k.id
  `)
  return rows.map((r) => {
    const echange = echangeDe(r)
    const accepte = echange?.statut === 'acceptee'
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
      coordonnees: accepte ? { email: r.email, telephone: echange.telephoneCandidat } : null,
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
      echange,
    }
  })
}

export type CandidatureEnvoyee = {
  id: string
  statut: StatutCandidature
  /** `recruteur` : une proposition reçue depuis les profils disponibles, sans candidature de la personne. */
  origine: 'candidat' | 'recruteur'
  message: string | null
  cvNom: string | null
  creeLe: Date
  offre: { id: string; slug: string; titre: string; enLigne: boolean; commune: string | null; recruteur: string; laboratoire: boolean }
  echange: Echange | null
}

/** Les candidatures d'un compte, les plus récentes d'abord. */
export async function getCandidaturesEnvoyees(userId: string): Promise<CandidatureEnvoyee[]> {
  const { rows } = await db.execute<
    LigneEchange & {
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
    }
  >(sql`
    SELECT k.id, k.statut, k.origine, k.message, k.cv_nom, k.cree_le,
           o.id AS offre_id, o.slug AS offre_slug, o.titre AS offre_titre,
           (o.statut = 'en_ligne' AND (o.expire_le IS NULL OR o.expire_le > now())) AS en_ligne,
           cm.nom AS commune_nom, p.profession, p.nom, p.prenom, p.raison_sociale,
           ${COLONNES_ECHANGE}
    FROM candidatures k
    JOIN offres o ON o.id = k.offre_id
    JOIN praticiens p ON p.id = o.praticien_id
    LEFT JOIN communes cm ON cm.code_insee = o.commune_code
    LEFT JOIN echanges_candidature e ON e.candidature_id = k.id
    WHERE k.candidat_user_id = ${userId}::uuid
    ORDER BY (e.statut = 'en_attente') DESC NULLS LAST, k.cree_le DESC
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
    echange: echangeDe(r),
  }))
}

/** La candidature d'un compte à une offre, pour le tiroir « Postuler » : déjà envoyée ou non. */
export async function getMaCandidature(userId: string, offreId: string): Promise<{ id: string; creeLe: Date } | null> {
  const { rows } = await db.execute<{ id: string; cree_le: string }>(sql`
    SELECT id, cree_le FROM candidatures WHERE candidat_user_id = ${userId}::uuid AND offre_id = ${offreId}
  `)
  return rows[0] ? { id: rows[0].id, creeLe: new Date(rows[0].cree_le) } : null
}
