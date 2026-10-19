'use server'

import { randomBytes, randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { envoyerInvitationParrainage } from '@/lib/email'
import { nomAffiche } from '@/lib/annuaire/types'
import { exigerConnexion } from '@/lib/tunnel/compte'
import { getFicheRevendication } from './parcours'
import { INVITATIONS_PAR_SEMAINE, lireAdresses } from './parrainage'

/**
 * Inviter des confrères par email. Réservé à une fiche dont l'identité est
 * vérifiée ; dix invitations par semaine glissante ; une adresse déjà invitée,
 * par n'importe quel parrain, ou déjà inscrite, est ignorée.
 */
export async function inviterConfreres(donnees: FormData): Promise<never> {
  const slug = String(donnees.get('fiche') ?? '')
  const ici = `/espace-pro/partager/${donnees.get('q') ?? ''}`
  const suite = (p: string) => chemin(`${ici}${ici.includes('?') ? '&' : '?'}${p}#parrainage`)
  const compte = await exigerConnexion(ici)
  const fiche = await getFicheRevendication(slug, compte.id)
  if (!fiche || fiche.demande?.statut !== 'acceptee') redirect(suite(`erreur=${encodeURIComponent('Le parrainage s’ouvre dès que votre identité est vérifiée.')}`))

  const { valides, invalides } = lireAdresses(String(donnees.get('adresses') ?? ''))
  const adresses = valides.filter((a) => a !== compte.email.toLowerCase())
  if (!adresses.length) redirect(suite(`erreur=${encodeURIComponent(invalides.length ? `Adresse invalide : ${invalides[0]}` : 'Saisissez au moins une adresse.')}`))

  const { rows: semaine } = await db.execute<{ n: number }>(sql`
    SELECT count(*)::int AS n FROM parrainages WHERE parrain_id = ${compte.id}::uuid AND cree_le > now() - interval '7 days'
  `)
  const reste = INVITATIONS_PAR_SEMAINE - (semaine[0]?.n ?? 0)
  if (reste <= 0) redirect(suite(`erreur=${encodeURIComponent(`Vous avez envoyé ${INVITATIONS_PAR_SEMAINE} invitations cette semaine : la prochaine se libère dans quelques jours.`)}`))

  const parrain = nomAffiche(fiche)
  let envoyees = 0
  let ignorees = invalides.length + Math.max(0, adresses.length - reste)
  for (const email of adresses.slice(0, reste)) {
    const code = randomBytes(9).toString('base64url')
    // Une adresse invitée une seule fois, et jamais une adresse qui a déjà un compte.
    const { rows } = await db.execute(sql`
      INSERT INTO parrainages (id, code, parrain_id, parrain_praticien_id, email)
      SELECT ${randomUUID()}, ${code}, ${compte.id}::uuid, ${fiche.id}, ${email}
      WHERE NOT EXISTS (SELECT 1 FROM "user" u WHERE lower(u.email) = ${email})
      ON CONFLICT (email) DO NOTHING
      RETURNING 1
    `)
    if (!rows.length) {
      ignorees++
      continue
    }
    try {
      await envoyerInvitationParrainage(email, parrain, code)
      envoyees++
    } catch (e) {
      console.error('[parrainage] envoi impossible', e)
      await db.execute(sql`DELETE FROM parrainages WHERE code = ${code}`)
      ignorees++
    }
  }
  redirect(suite(`envoyees=${envoyees}&ignorees=${ignorees}`))
}

/** La personne invitée ne veut plus rien recevoir. */
export async function seDesinscrire(donnees: FormData): Promise<never> {
  const code = String(donnees.get('code') ?? '')
  await db.execute(sql`UPDATE parrainages SET desinscrit_le = COALESCE(desinscrit_le, now()) WHERE code = ${code}`)
  redirect(chemin(`/parrainage/${encodeURIComponent(code)}/desinscription/?fait=1`))
}
