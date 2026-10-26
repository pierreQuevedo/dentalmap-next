'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { envoyerConfirmationAlerteEmploi } from '@/lib/email'
import { alerteDesinscription, condensat, nouveauJeton } from '@/lib/formation/jeton'
import { chemin } from '@/lib/navigation'
import { InscriptionAlerte, lireCriteres } from './alerte'

/**
 * L'alerte emploi sans compte, sur le modèle exact de l'alerte formations :
 * une adresse et des critères, une confirmation par lien (jeton aléatoire
 * gardé en condensat), une désinscription en un clic (identifiant signé).
 * L'envoi des offres est le job `alertes-emploi`, un email par semaine au
 * plus, seulement s'il y a du nouveau.
 */

export type EtatAlerteEmploi = { ok: boolean; message: string } | null

export async function inscrireAlerteEmploi(_e: EtatAlerteEmploi, donnees: FormData): Promise<EtatAlerteEmploi> {
  const r = InscriptionAlerte.safeParse({ email: String(donnees.get('email') ?? ''), criteres: lireCriteres(donnees) })
  if (!r.success) return { ok: false, message: r.error.issues[0]?.message ?? 'Formulaire incomplet.' }
  const { email, criteres } = r.data
  const jeton = nouveauJeton()
  const json = JSON.stringify(criteres)
  // Même adresse, mêmes critères et déjà active : rien ne change. Sinon n'importe qui coupait l'alerte d'un autre en réinscrivant son adresse (audit du 2026-10-26).
  const { rows: active } = await db.execute<{ id: string }>(sql`
    SELECT id FROM alertes_emploi WHERE user_id IS NULL AND email = ${email} AND criteres = ${json}::jsonb AND confirmee_le IS NOT NULL AND active
  `)
  if (active.length) return { ok: true, message: `Un email de confirmation vient de partir à ${email}. Une alerte déjà active à cette adresse reste inchangée.` }
  // Même adresse, mêmes critères, pas encore confirmée ou coupée : elle reprend un jeton neuf et redemande la confirmation.
  const { rows } = await db.execute<{ id: string }>(sql`
    UPDATE alertes_emploi SET jeton_hash = ${condensat(jeton)}, confirmee_le = NULL, active = true
    WHERE user_id IS NULL AND email = ${email} AND criteres = ${json}::jsonb
    RETURNING id
  `)
  if (!rows.length) {
    await db.execute(sql`
      INSERT INTO alertes_emploi (id, email, criteres, jeton_hash) VALUES (${randomUUID()}, ${email}, ${json}::jsonb, ${condensat(jeton)})
    `)
  }
  try {
    await envoyerConfirmationAlerteEmploi(email, jeton)
  } catch (e) {
    console.error('[alertes-emploi] confirmation impossible', e)
    return { ok: false, message: 'L’email de confirmation n’a pas pu partir. Réessayez dans quelques minutes.' }
  }
  return { ok: true, message: `Un email de confirmation vient de partir à ${email}. L’alerte s’active dès que vous cliquez sur son lien.` }
}

export async function confirmerAlerteEmploi(donnees: FormData): Promise<never> {
  const jeton = String(donnees.get('jeton') ?? '')
  const { rows } = await db.execute<{ id: string }>(sql`
    UPDATE alertes_emploi SET confirmee_le = COALESCE(confirmee_le, now()) WHERE jeton_hash = ${condensat(jeton)} RETURNING id
  `)
  redirect(chemin(`/emploi/alerte/confirmer/${encodeURIComponent(jeton)}/?${rows.length ? 'fait=1' : 'invalide=1'}`))
}

export async function desinscrireAlerteEmploi(donnees: FormData): Promise<never> {
  const jeton = String(donnees.get('jeton') ?? '')
  const id = alerteDesinscription(jeton, 'alerte-emploi')
  if (id) await db.execute(sql`DELETE FROM alertes_emploi WHERE id = ${id} AND user_id IS NULL`)
  redirect(chemin(`/emploi/alerte/desinscrire/${encodeURIComponent(jeton)}/?fait=1`))
}
