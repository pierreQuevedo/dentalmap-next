'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { envoyerInvitation } from '@/lib/email'
import { nomAffiche } from '@/lib/annuaire/types'
import { exigerConnexion } from '@/lib/tunnel/compte'
import { getFicheRevendication } from './parcours'
import { EQUIPE_OUVERTE, getEquipe, hacherJeton, nouveauJeton } from './equipe'

/**
 * L'équipe d'une fiche (U-COL). Seul un titulaire invite, annule ou retire ;
 * l'invité accepte avec le compte de l'adresse invitée.
 */
async function titulaire(donnees: FormData) {
  const slug = String(donnees.get('fiche') ?? '')
  const ici = `/espace-pro/equipe/${donnees.get('q') ?? ''}`
  const compte = await exigerConnexion(ici)
  const fiche = await getFicheRevendication(slug, compte.id)
  const equipe = fiche ? await getEquipe(fiche.id) : null
  const moi = equipe?.membres.find((m) => m.userId === compte.id)
  if (!fiche || !equipe || !moi?.titulaire) redirect(chemin('/espace-pro/'))
  return { compte, fiche, equipe, ici }
}

export async function inviter(donnees: FormData): Promise<never> {
  if (!EQUIPE_OUVERTE) redirect(chemin('/espace-pro/'))
  const { compte, fiche, equipe, ici } = await titulaire(donnees)
  const email = String(donnees.get('email') ?? '').trim().toLowerCase()
  const fonction = String(donnees.get('fonction') ?? '').trim().slice(0, 60) || null
  const avecErreur = (m: string) => chemin(`${ici}${ici.includes('?') ? '&' : '?'}erreur=${encodeURIComponent(m)}`)
  if (!z.string().email().safeParse(email).success) redirect(avecErreur('Adresse électronique invalide.'))
  if (equipe.membres.some((m) => m.email.toLowerCase() === email)) redirect(avecErreur('Cette adresse gère déjà la fiche.'))
  if (equipe.invitations.length >= 10) redirect(avecErreur('Dix invitations en cours au plus.'))
  const { jeton, hash } = nouveauJeton()
  await db.execute(sql`
    INSERT INTO invitations_fiche (id, praticien_id, invite_par, email, fonction, jeton_hash)
    VALUES (${randomUUID()}, ${fiche.id}, ${compte.id}::uuid, ${email}, ${fonction}, ${hash})
  `)
  await envoyerInvitation(email, nomAffiche(fiche), compte.nom || compte.email, jeton)
  redirect(chemin(`${ici}${ici.includes('?') ? '&' : '?'}invitee=1`))
}

export async function annulerInvitation(donnees: FormData): Promise<never> {
  const { fiche, ici } = await titulaire(donnees)
  await db.execute(sql`UPDATE invitations_fiche SET statut = 'annulee' WHERE id = ${String(donnees.get('invitation') ?? '')} AND praticien_id = ${fiche.id}`)
  redirect(chemin(ici))
}

/** Retirer un invité. Les titulaires ne se retirent pas ici : leur fiche leur a été attribuée après vérification. */
export async function retirerMembre(donnees: FormData): Promise<never> {
  const { fiche, ici } = await titulaire(donnees)
  await db.execute(sql`
    DELETE FROM revendications WHERE id = ${String(donnees.get('membre') ?? '')} AND praticien_id = ${fiche.id} AND methode = 'invitation'
  `)
  redirect(chemin(ici))
}

/** Accepter : le compte connecté doit porter l'adresse invitée. */
export async function accepterInvitation(donnees: FormData): Promise<never> {
  const jeton = String(donnees.get('jeton') ?? '')
  if (!EQUIPE_OUVERTE) redirect(chemin(`/espace-pro/invitation/${jeton}/`))
  const compte = await exigerConnexion(`/espace-pro/invitation/${jeton}/`)
  const { rows } = await db.execute<{ id: string; praticien_id: string; email: string; slug: string }>(sql`
    SELECT i.id, i.praticien_id, i.email, p.slug FROM invitations_fiche i JOIN praticiens p ON p.id = i.praticien_id
    WHERE i.jeton_hash = ${hacherJeton(jeton)} AND i.statut = 'envoyee' AND i.cree_le > now() - interval '30 days' LIMIT 1
  `)
  const inv = rows[0]
  if (!inv || inv.email.toLowerCase() !== compte.email.toLowerCase()) redirect(chemin(`/espace-pro/invitation/${jeton}/`))
  await db.execute(sql`
    INSERT INTO revendications (id, praticien_id, user_id, statut, methode, demande_le, traite_le)
    VALUES (${randomUUID()}, ${inv.praticien_id}, ${compte.id}::uuid, 'acceptee', 'invitation', now(), now())
    ON CONFLICT (praticien_id, user_id) DO UPDATE SET statut = 'acceptee', methode = 'invitation', objet = 'revendication', traite_le = now()
  `)
  await db.execute(sql`UPDATE invitations_fiche SET statut = 'acceptee', acceptee_le = now() WHERE id = ${inv.id}`)
  redirect(chemin(`/espace-pro/?fiche=${encodeURIComponent(inv.slug)}`))
}
