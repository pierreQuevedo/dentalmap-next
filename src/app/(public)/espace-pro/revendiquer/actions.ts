'use server'

import { randomUUID } from 'node:crypto'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { auth } from '@/lib/auth'
import { chemin } from '@/lib/navigation'
import { envoyerAModerer, envoyerRevendicationRecue } from '@/lib/email'
import { nomAffiche , type Profession } from '@/lib/annuaire/types'

/**
 * Enregistre une demande de revendication.
 *
 * Elle n'accorde rien : elle est déposée en `en_attente` et sera examinée à la
 * main. Un annuaire qui donnerait la main sur une fiche au premier qui la
 * réclame perdrait exactement ce qui fait sa valeur.
 *
 * La contrainte d'unicité sur (praticien, compte) rend l'action idempotente :
 * un double clic ne crée pas deux demandes.
 */
export async function demanderRevendication(donnees: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  const slug = String(donnees.get('slug') ?? '')
  const retour = String(donnees.get('retour') ?? '/espace-pro/revendiquer/')

  if (!session) redirect(chemin(`/connexion/?retour=${encodeURIComponent(retour)}`))
  if (!slug) redirect(chemin(retour))

  const message = String(donnees.get('message') ?? '').trim().slice(0, 2000)

  const { rows } = await db.execute<{ id: string; profession: Profession; nom: string; prenom: string | null; raison_sociale: string | null }>(sql`
    SELECT id, profession, nom, prenom, raison_sociale FROM praticiens WHERE slug = ${slug} AND deleted_at IS NULL LIMIT 1
  `)
  const praticien = rows[0]
  if (!praticien) redirect(chemin(retour))

  const { rowCount } = await db.execute(sql`
    INSERT INTO revendications (id, praticien_id, user_id, statut, message)
    VALUES (${randomUUID()}, ${praticien.id}, ${session.user.id}, 'en_attente', ${message || null})
    ON CONFLICT (praticien_id, user_id) DO NOTHING
  `)
  if (rowCount) {
    const nom = nomAffiche({ profession: praticien.profession, nom: praticien.nom, prenom: praticien.prenom, raisonSociale: praticien.raison_sociale })
    await envoyerRevendicationRecue(session.user.email, nom)
    await envoyerAModerer(`revendication, ${nom}`, `Compte : ${session.user.email}\nFiche : ${slug}\n\n${message || '(sans message)'}\n\nÀ traiter : ${process.env.BETTER_AUTH_URL ?? ''}/espace-pro/moderation/`)
    await auth.api.updateUser({ headers: await headers(), body: { etapeTunnel: 'onboarding' } })
  }

  redirect(chemin(`${retour}${retour.includes('?') ? '&' : '?'}envoyee=1`))
}
