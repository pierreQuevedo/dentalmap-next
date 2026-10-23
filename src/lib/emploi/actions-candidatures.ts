'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import { getCompte } from '@/lib/tunnel/compte'
import { envoyerCandidatureNonRetenue, envoyerInvitationAPostuler, envoyerNouvelleCandidature } from '@/lib/email'
import { CV_MAX_OCTETS, MESSAGE_MAX, nomCandidat, telephoneValide } from './candidature'
import { cheminOffre } from './chemins'
import { rangerCv } from './cv'
import { recruteur } from './recruteur'
import { offreEnLigne } from './en-ligne'

/**
 * Les candidatures : postuler (un compte connecté suffit, sans palier, le
 * téléphone obligatoire), retenir ou non, et l'invitation à postuler envoyée
 * à un profil disponible. Le recruteur reçoit les coordonnées dès la
 * candidature et contacte la personne directement.
 */

export type EtatCandidature = { erreur?: string; champ?: string } | null

const PAGE_RECRUTEUR = '/espace-pro/emploi/candidatures/'

/* ------------------------------------------------------------------ */
/* Candidat                                                             */
/* ------------------------------------------------------------------ */

export async function postuler(_: EtatCandidature, donnees: FormData): Promise<EtatCandidature> {
  const slug = String(donnees.get('offre') ?? '')
  const compte = await getCompte()
  if (!compte) redirect(chemin(`/connexion/?retour=${encodeURIComponent(`${cheminOffre(slug)}?postuler=1`)}`))
  const { rows } = await db.execute<{ id: string; titre: string; praticien_id: string; auteur_email: string; propre: boolean }>(sql`
    SELECT o.id, o.titre, o.praticien_id, u.email AS auteur_email,
           EXISTS (SELECT 1 FROM revendications v WHERE v.praticien_id = o.praticien_id AND v.user_id = ${compte.id}::uuid AND v.statut = 'acceptee') AS propre
    FROM offres o JOIN "user" u ON u.id = o.auteur_user_id
    WHERE o.slug = ${slug} AND ${offreEnLigne()}
  `)
  const o = rows[0]
  if (!o) return { erreur: 'Cette offre n’est plus en ligne.' }
  if (o.propre) return { erreur: 'C’est une offre de votre fiche : vous ne pouvez pas y postuler.' }
  const telephone = String(donnees.get('telephone') ?? '').trim()
  if (!telephoneValide(telephone)) return { erreur: 'Indiquez un numéro de téléphone où le recruteur peut vous joindre.', champ: 'telephone' }
  const message = String(donnees.get('message') ?? '').trim()
  if (message.length > MESSAGE_MAX) return { erreur: `Votre message dépasse ${MESSAGE_MAX.toLocaleString('fr-FR')} caractères.`, champ: 'message' }
  const cv = donnees.get('cv')
  const avecCv = cv instanceof File && cv.size > 0
  if (avecCv && (cv.type !== 'application/pdf' || cv.size > CV_MAX_OCTETS)) return { erreur: 'Le CV doit être un PDF de 5 Mo au plus.', champ: 'cv' }

  // Sans nouveau fichier, le CV du profil, si la personne le joint.
  const duProfil =
    !avecCv && donnees.get('cvProfil') === 'oui'
      ? ((await db.execute<{ cv_chemin: string | null; cv_nom: string | null; cv_taille: number | null }>(sql`SELECT cv_chemin, cv_nom, cv_taille FROM candidats WHERE user_id = ${compte.id}::uuid`)).rows[0] ?? null)
      : null
  const id = randomUUID()
  const cvChemin = avecCv ? await rangerCv(cv, compte.id) : (duProfil?.cv_chemin ?? null)
  const cvNom = avecCv ? cv.name.slice(0, 120) : cvChemin ? (duProfil?.cv_nom ?? 'CV.pdf') : null
  const cvTaille = avecCv ? cv.size : cvChemin ? (duProfil?.cv_taille ?? null) : null
  const { rows: inseres } = await db.execute<{ id: string }>(sql`
    INSERT INTO candidatures (id, offre_id, candidat_user_id, message, telephone, cv_chemin, cv_nom, cv_taille)
    VALUES (${id}, ${o.id}, ${compte.id}::uuid, ${message || null}, ${telephone}, ${cvChemin}, ${cvNom}, ${cvTaille})
    ON CONFLICT (offre_id, candidat_user_id) DO NOTHING
    RETURNING id
  `)
  if (!inseres[0]) return { erreur: 'Vous avez déjà postulé à cette offre.' }
  // Le téléphone est gardé au profil candidat, prérempli à la prochaine candidature.
  await db.execute(sql`UPDATE candidats SET telephone = ${telephone}, maj_le = now() WHERE user_id = ${compte.id}::uuid`)
  await envoyerNouvelleCandidature(o.auteur_email, { offre: o.titre, candidat: nomCandidat(compte.nom ?? '', true), email: compte.email, telephone, url: `${PAGE_RECRUTEUR}?c=${id}` })
  redirect(chemin(`${cheminOffre(slug)}?postuler=envoyee`))
}

/* ------------------------------------------------------------------ */
/* Recruteur                                                            */
/* ------------------------------------------------------------------ */

type Cible = { id: string; statut: string; candidat_email: string; offre_titre: string; offre_id: string; profession: Profession; nom: string; prenom: string | null; raison_sociale: string | null }

/** La candidature, si elle porte sur une offre de la fiche du recruteur. */
async function candidatureDuRecruteur(id: string, praticienId: string): Promise<Cible | null> {
  const { rows } = await db.execute<Cible>(sql`
    SELECT k.id, k.statut, u.email AS candidat_email, o.titre AS offre_titre, o.id AS offre_id, p.profession, p.nom, p.prenom, p.raison_sociale
    FROM candidatures k
    JOIN offres o ON o.id = k.offre_id
    JOIN praticiens p ON p.id = o.praticien_id
    JOIN "user" u ON u.id = k.candidat_user_id
    WHERE k.id = ${id} AND o.praticien_id = ${praticienId}
  `)
  return rows[0] ?? null
}

const nomRecruteur = (c: Cible) => nomAffiche({ profession: c.profession, nom: c.nom, prenom: c.prenom, raisonSociale: c.raison_sociale })

function retourListe(fiche: string | null, id: string, fait: string) {
  return chemin(`${PAGE_RECRUTEUR}?${fiche ? `fiche=${encodeURIComponent(fiche)}&` : ''}c=${id}&fait=${fait}`)
}

/** Retenir, ou ne pas retenir : le candidat non retenu reçoit un message. */
export async function deciderCandidature(donnees: FormData): Promise<never> {
  const r = await recruteur(String(donnees.get('fiche') ?? ''))
  if (!r) redirect(chemin('/espace-pro/'))
  const id = String(donnees.get('candidature') ?? '')
  const decision = donnees.get('decision') === 'retenue' ? 'retenue' : 'non_retenue'
  const c = await candidatureDuRecruteur(id, r.espace.fiche.id)
  if (c && c.statut !== decision) {
    await db.execute(sql`UPDATE candidatures SET statut = ${decision}, vue_le = coalesce(vue_le, now()), maj_le = now() WHERE id = ${c.id}`)
    if (decision === 'non_retenue') await envoyerCandidatureNonRetenue(c.candidat_email, nomRecruteur(c), c.offre_titre)
  }
  redirect(retourListe(r.espace.autres.length ? r.espace.fiche.slug : null, id, decision))
}

const Invitation = z.object({
  fiche: z.string(),
  profil: z.string().uuid(),
  offre: z.string().min(1, 'Choisissez l’offre concernée.'),
  message: z.string().trim().max(MESSAGE_MAX, `${MESSAGE_MAX.toLocaleString('fr-FR')} caractères au plus.`).optional(),
})

/**
 * Inviter un profil disponible à postuler, depuis `/emploi/profils/` :
 * recruteur vérifié, l'une de ses offres en ligne. La personne reçoit un email
 * avec l'offre ; aucune candidature n'est créée, et ses coordonnées ne sont
 * transmises que si elle postule.
 */
export async function inviterAPostuler(_: EtatCandidature, donnees: FormData): Promise<EtatCandidature> {
  const lu = Invitation.safeParse(Object.fromEntries(donnees))
  if (!lu.success) {
    const p = lu.error.issues[0]
    return { erreur: p.message.startsWith('Invalid') ? 'Un champ est incomplet.' : p.message, champ: String(p.path[0] ?? '') }
  }
  const v = lu.data
  const r = await recruteur(v.fiche)
  if (!r) return { erreur: 'Réservé aux recruteurs à la fiche vérifiée.' }
  if (v.profil === r.compte.id) return { erreur: 'C’est votre propre profil.' }
  const { rows: offres } = await db.execute<{ titre: string; slug: string }>(sql`
    SELECT titre, slug FROM offres WHERE id = ${v.offre} AND praticien_id = ${r.espace.fiche.id} AND ${offreEnLigne('')}
  `)
  if (!offres[0]) return { erreur: 'Choisissez l’une de vos offres en ligne.', champ: 'offre' }
  const { rows: profils } = await db.execute<{ email: string; deja: boolean }>(sql`
    SELECT u.email, EXISTS (SELECT 1 FROM candidatures k WHERE k.offre_id = ${v.offre} AND k.candidat_user_id = u.id) AS deja
    FROM candidats c JOIN "user" u ON u.id = c.user_id
    WHERE c.user_id = ${v.profil}::uuid AND c.termine_le IS NOT NULL AND c.visibilite IN ('visible', 'anonyme')
      AND NOT (${r.espace.fiche.slug} = ANY(c.structures_masquees))
  `)
  if (!profils[0]) return { erreur: 'Ce profil n’est plus disponible.' }
  if (profils[0].deja) return { erreur: 'Cette personne a déjà postulé à cette offre : retrouvez-la dans vos candidatures.' }
  const f = r.espace.fiche
  await envoyerInvitationAPostuler(profils[0].email, {
    recruteur: nomAffiche({ profession: f.profession as Profession, nom: f.nom, prenom: f.prenom, raisonSociale: f.raisonSociale }),
    offre: offres[0].titre,
    message: v.message || null,
    url: cheminOffre(offres[0].slug),
  })
  redirect(chemin('/emploi/profils/?fait=invitation'))
}
