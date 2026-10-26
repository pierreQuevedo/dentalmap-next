'use server'

import { randomUUID } from 'node:crypto'
import { after } from 'next/server'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { envoyerConfirmationAlerteCession, envoyerNouveauMessageCession } from '@/lib/email'
import { getCompte } from '@/lib/tunnel/compte'
import { validerMessage } from './format'
import { alerteDesinscription, condensat, nouveauJeton } from './jeton'
import { ROUTE_MESSAGERIE_CESSION } from './routes'
import { TYPES_CESSION } from './types'
import { MESSAGE_LIMITE, permis } from '@/lib/limite'

/**
 * Les actions publiques des annonces de cession : écrire au cédant (avec un
 * compte) et l'alerte sans compte. Le dépôt, la relecture et le
 * renouvellement relèvent de l'espace pro.
 */

/* ------------------------------------------------------------------ */
/* Message au cédant                                                    */
/* ------------------------------------------------------------------ */

export type ResultatMessage = { ok: true; message: string } | { ok: false; erreur: string; connexion?: true }

/** Au-delà, l'envoi est refusé pour l'heure : de quoi écrire à beaucoup de cédants, pas de quoi arroser le site. */
const MESSAGES_PAR_HEURE = 20

/**
 * Écrit au cédant d'une annonce publiée : reprend la conversation de ce
 * compte pour cette annonce (une par annonce et par repreneur) ou la crée,
 * ajoute le message, et prévient le cédant par email après la réponse.
 * Refuse d'écrire à sa propre annonce.
 */
export async function envoyerMessageCession(annonceId: string, corps: string): Promise<ResultatMessage> {
  const compte = await getCompte()
  if (!compte) return { ok: false, erreur: 'Connectez-vous pour écrire au cédant.', connexion: true }

  const v = validerMessage(corps)
  if (!v.ok) return { ok: false, erreur: v.erreur }
  if (typeof annonceId !== 'string' || !annonceId) return { ok: false, erreur: 'Annonce introuvable.' }

  const { rows: annonces } = await db.execute<{ id: string; titre: string; auteur_user_id: string; auteur_email: string }>(sql`
    SELECT a.id, a.titre, a.auteur_user_id, u.email AS auteur_email
    FROM annonces_cession a JOIN "user" u ON u.id = a.auteur_user_id
    WHERE a.id = ${annonceId} AND a.statut = 'publiee' AND a.expire_le > now()
    LIMIT 1
  `)
  const annonce = annonces[0]
  if (!annonce) return { ok: false, erreur: 'Cette annonce n’est plus en ligne.' }
  if (annonce.auteur_user_id === compte.id) return { ok: false, erreur: 'Vous ne pouvez pas écrire à votre propre annonce.' }

  const { rows: recents } = await db.execute<{ n: number }>(sql`
    SELECT count(*)::int AS n FROM messages WHERE auteur_user_id = ${compte.id}::uuid AND cree_le > now() - interval '1 hour'
  `)
  if ((recents[0]?.n ?? 0) >= MESSAGES_PAR_HEURE) return { ok: false, erreur: 'Vous avez envoyé beaucoup de messages en peu de temps. Réessayez dans une heure.' }

  const { rows: conv } = await db.execute<{ id: string }>(sql`
    INSERT INTO conversations (id, objet, annonce_cession_id, interlocuteur_user_id, destinataire_user_id)
    VALUES (${randomUUID()}, 'cession', ${annonce.id}, ${compte.id}::uuid, ${annonce.auteur_user_id}::uuid)
    ON CONFLICT (annonce_cession_id, interlocuteur_user_id) DO UPDATE SET dernier_message_le = now()
    RETURNING id
  `)
  const conversationId = conv[0]?.id
  if (!conversationId) return { ok: false, erreur: 'Le message n’a pas pu être enregistré. Réessayez dans quelques minutes.' }
  await db.execute(sql`
    INSERT INTO messages (id, conversation_id, auteur_user_id, corps) VALUES (${randomUUID()}, ${conversationId}, ${compte.id}::uuid, ${v.corps})
  `)

  const extrait = v.corps.length > 400 ? `${v.corps.slice(0, 400).trimEnd()}…` : v.corps
  after(async () => {
    try {
      await envoyerNouveauMessageCession(annonce.auteur_email, annonce.titre, extrait, ROUTE_MESSAGERIE_CESSION)
    } catch (e) {
      console.error('[cessions] email au cédant impossible', annonce.id, e)
    }
  })

  return { ok: true, message: 'Votre message est transmis au cédant. Vous serez prévenu par email de sa réponse.' }
}

/* ------------------------------------------------------------------ */
/* Alerte cessions, sans compte                                         */
/* ------------------------------------------------------------------ */

export type EtatAlerteCession = { ok: boolean; message: string } | null

const AlerteCession = z.object({
  email: z.string().trim().toLowerCase().email('Adresse électronique invalide.'),
  departements: z.array(z.string().regex(/^(?:\d{2,3}|2A|2B)$/)).max(101),
  types: z.array(z.enum(TYPES_CESSION)),
})

/**
 * Inscription à l'alerte. Une adresse, une alerte : une nouvelle inscription
 * remplace les critères et redemande la confirmation par lien.
 */
export async function inscrireAlerteCession(_e: EtatAlerteCession, donnees: FormData): Promise<EtatAlerteCession> {
  const r = AlerteCession.safeParse({
    email: String(donnees.get('email') ?? ''),
    departements: donnees.getAll('departements').map(String).filter(Boolean),
    types: donnees.getAll('types').map(String).filter(Boolean),
  })
  if (!r.success) return { ok: false, message: r.error.issues[0]?.message ?? 'Formulaire incomplet.' }
  if (!(await permis('alerte', r.data.email))) return { ok: false, message: MESSAGE_LIMITE }
  const jeton = nouveauJeton()
  // Une alerte déjà confirmée n'est pas touchée : sinon n'importe qui coupait l'alerte d'un autre en réinscrivant son adresse (audit du 2026-10-26).
  const { rows: inscrite } = await db.execute<{ id: string }>(sql`
    INSERT INTO alertes_cession (id, email, departements, types, jeton_hash)
    VALUES (${randomUUID()}, ${r.data.email},
            ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(r.data.departements)}::jsonb))::text[],
            ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(r.data.types)}::jsonb))::text[],
            ${condensat(jeton)})
    ON CONFLICT (email) DO UPDATE SET departements = EXCLUDED.departements, types = EXCLUDED.types,
      jeton_hash = EXCLUDED.jeton_hash, confirmee_le = NULL
      WHERE alertes_cession.confirmee_le IS NULL
    RETURNING id
  `)
  try {
    if (inscrite.length) await envoyerConfirmationAlerteCession(r.data.email, jeton)
  } catch (e) {
    console.error('[alertes-cession] confirmation impossible', e)
    return { ok: false, message: 'L’email de confirmation n’a pas pu partir. Réessayez dans quelques minutes.' }
  }
  return { ok: true, message: `Un email de confirmation vient de partir à ${r.data.email}. L’alerte s’active dès que vous cliquez sur son lien. Une alerte déjà active à cette adresse reste inchangée.` }
}

/** Confirmation par un bouton (pas à l'ouverture du lien : les antivirus des messageries ouvrent les liens). */
export async function confirmerAlerteCession(donnees: FormData): Promise<never> {
  const jeton = String(donnees.get('jeton') ?? '')
  const { rows } = await db.execute<{ id: string }>(sql`
    UPDATE alertes_cession SET confirmee_le = COALESCE(confirmee_le, now()) WHERE jeton_hash = ${condensat(jeton)} RETURNING id
  `)
  redirect(chemin(`/annonces/cession/alerte/confirmer/${encodeURIComponent(jeton)}/?${rows.length ? 'fait=1' : 'invalide=1'}`))
}

export async function desinscrireAlerteCession(donnees: FormData): Promise<never> {
  const jeton = String(donnees.get('jeton') ?? '')
  const id = alerteDesinscription(jeton)
  if (id) await db.execute(sql`DELETE FROM alertes_cession WHERE id = ${id}`)
  redirect(chemin(`/annonces/cession/alerte/desinscrire/${encodeURIComponent(jeton)}/?fait=1`))
}
