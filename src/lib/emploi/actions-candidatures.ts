'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import { getCompte } from '@/lib/tunnel/compte'
import { envoyerCandidatureNonRetenue, envoyerEchangeAccepte, envoyerEchangeDecline, envoyerEchangePropose, envoyerNouvelleCandidature } from '@/lib/email'
import { CV_MAX_OCTETS, MESSAGE_MAX, creneauxValides, libelleCreneau, nomCandidat, telephoneValide } from './candidature'
import { cheminOffre } from './chemins'
import { rangerCv } from './cv'
import { recruteur } from './recruteur'

/**
 * Les candidatures : postuler (un compte connecté suffit, sans palier),
 * proposer un échange avec des créneaux, retenir ou non, et la réponse du
 * candidat. Les coordonnées ne passent au recruteur qu'à l'échange accepté.
 */

export type EtatCandidature = { erreur?: string; champ?: string } | null

const PAGE_RECRUTEUR = '/espace-pro/emploi/candidatures/'
const PAGE_CANDIDAT = '/espace-candidat/candidatures/'

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
    WHERE o.slug = ${slug} AND o.statut = 'en_ligne' AND (o.expire_le IS NULL OR o.expire_le > now())
  `)
  const o = rows[0]
  if (!o) return { erreur: 'Cette offre n’est plus en ligne.' }
  if (o.propre) return { erreur: 'C’est une offre de votre fiche : vous ne pouvez pas y postuler.' }
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
    INSERT INTO candidatures (id, offre_id, candidat_user_id, message, cv_chemin, cv_nom, cv_taille)
    VALUES (${id}, ${o.id}, ${compte.id}::uuid, ${message || null}, ${cvChemin}, ${cvNom}, ${cvTaille})
    ON CONFLICT (offre_id, candidat_user_id) DO NOTHING
    RETURNING id
  `)
  if (!inseres[0]) return { erreur: 'Vous avez déjà postulé à cette offre.' }
  await envoyerNouvelleCandidature(o.auteur_email, o.titre, nomCandidat(compte.nom ?? '', false), `${PAGE_RECRUTEUR}?c=${id}`)
  redirect(chemin(`${cheminOffre(slug)}?postuler=envoyee`))
}

const Reponse = z.object({ candidature: z.string().min(1), reponse: z.enum(['accepter', 'refuser']), creneau: z.string().optional(), telephone: z.string().trim().optional() })

/** La réponse du candidat à une proposition d'échange. Accepter partage les coordonnées des deux côtés. */
export async function repondreEchange(_: EtatCandidature, donnees: FormData): Promise<EtatCandidature> {
  const compte = await getCompte()
  if (!compte) redirect(chemin(`/connexion/?retour=${encodeURIComponent(PAGE_CANDIDAT)}`))
  const lu = Reponse.safeParse(Object.fromEntries(donnees))
  if (!lu.success) return { erreur: 'Réponse incomplète.' }
  const v = lu.data
  const { rows } = await db.execute<{ creneaux: string[]; offre_titre: string; auteur_email: string }>(sql`
    SELECT e.creneaux, o.titre AS offre_titre, u.email AS auteur_email
    FROM echanges_candidature e
    JOIN candidatures k ON k.id = e.candidature_id
    JOIN offres o ON o.id = k.offre_id
    JOIN "user" u ON u.id = o.auteur_user_id
    WHERE e.candidature_id = ${v.candidature} AND k.candidat_user_id = ${compte.id}::uuid AND e.statut = 'en_attente'
  `)
  const e = rows[0]
  if (!e) return { erreur: 'Cette proposition n’attend plus de réponse.' }
  const retourRecruteur = `${PAGE_RECRUTEUR}?c=${v.candidature}`

  if (v.reponse === 'refuser') {
    await db.execute(sql`UPDATE echanges_candidature SET statut = 'refusee', repondu_le = now() WHERE candidature_id = ${v.candidature}`)
    await db.execute(sql`UPDATE candidatures SET statut = 'vue', maj_le = now() WHERE id = ${v.candidature}`)
    await envoyerEchangeDecline(e.auteur_email, nomCandidat(compte.nom ?? '', false), e.offre_titre, retourRecruteur)
    redirect(chemin(`${PAGE_CANDIDAT}?fait=refuse`))
  }
  if (!v.creneau || !e.creneaux.includes(v.creneau)) return { erreur: 'Choisissez l’un des créneaux proposés.', champ: 'creneau' }
  if (!v.telephone || !telephoneValide(v.telephone)) return { erreur: 'Indiquez un numéro de téléphone pour être joint(e).', champ: 'telephone' }
  await db.execute(sql`
    UPDATE echanges_candidature SET statut = 'acceptee', creneau_choisi = ${v.creneau}, telephone_candidat = ${v.telephone}, repondu_le = now()
    WHERE candidature_id = ${v.candidature}
  `)
  await db.execute(sql`UPDATE candidatures SET statut = 'echange_accepte', maj_le = now() WHERE id = ${v.candidature}`)
  await envoyerEchangeAccepte(e.auteur_email, {
    candidat: nomCandidat(compte.nom ?? '', true),
    offre: e.offre_titre,
    creneau: libelleCreneau(v.creneau),
    telephone: v.telephone,
    email: compte.email,
    url: retourRecruteur,
  })
  redirect(chemin(`${PAGE_CANDIDAT}?fait=accepte`))
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

const Echange = z.object({
  fiche: z.string(),
  candidature: z.string().min(1),
  message: z.string().trim().min(10, 'Un message de quelques mots au moins.').max(MESSAGE_MAX, `${MESSAGE_MAX.toLocaleString('fr-FR')} caractères au plus.`),
  telephone: z.string().trim(),
  contact: z.string().trim().max(80).optional(),
})

export async function proposerEchange(_: EtatCandidature, donnees: FormData): Promise<EtatCandidature> {
  const lu = Echange.safeParse(Object.fromEntries(donnees))
  if (!lu.success) {
    const p = lu.error.issues[0]
    return { erreur: p.message.startsWith('Invalid') ? 'Un champ est incomplet.' : p.message, champ: String(p.path[0] ?? '') }
  }
  const v = lu.data
  const r = await recruteur(v.fiche)
  if (!r) return { erreur: 'Réservé au titulaire vérifié de la fiche.' }
  const c = await candidatureDuRecruteur(v.candidature, r.espace.fiche.id)
  if (!c) return { erreur: 'Candidature introuvable.' }
  if (c.statut === 'echange_accepte' || c.statut === 'non_retenue') return { erreur: 'Cette candidature n’attend plus de proposition.' }
  const creneaux = creneauxValides(donnees.getAll('creneaux').map(String))
  if (!creneaux.ok) return { erreur: creneaux.erreur, champ: 'creneaux' }
  if (!telephoneValide(v.telephone)) return { erreur: 'Indiquez le téléphone du cabinet.', champ: 'telephone' }
  await db.execute(sql`
    INSERT INTO echanges_candidature (candidature_id, message, creneaux, telephone_recruteur, contact_recruteur, statut)
    VALUES (${c.id}, ${v.message}, ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(creneaux.creneaux)}::jsonb))::text[], ${v.telephone}, ${v.contact || null}, 'en_attente')
    ON CONFLICT (candidature_id) DO UPDATE SET message = excluded.message, creneaux = excluded.creneaux, telephone_recruteur = excluded.telephone_recruteur,
      contact_recruteur = excluded.contact_recruteur, statut = 'en_attente', creneau_choisi = NULL, telephone_candidat = NULL, cree_le = now(), repondu_le = NULL
  `)
  await db.execute(sql`UPDATE candidatures SET statut = 'echange_propose', vue_le = coalesce(vue_le, now()), maj_le = now() WHERE id = ${c.id}`)
  await envoyerEchangePropose(c.candidat_email, nomRecruteur(c), c.offre_titre, v.message, creneaux.creneaux.map(libelleCreneau))
  redirect(retourListe(r.espace.autres.length ? r.espace.fiche.slug : null, c.id, 'echange'))
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
