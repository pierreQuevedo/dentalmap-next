'use server'

import { headers } from 'next/headers'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { auth } from '@/lib/auth'
import { telephoneValide } from '@/lib/emploi/candidature'

/**
 * Le numéro de contact du compte connecté. Jamais publié : l'équipe s'en sert
 * pour une vérification complémentaire. Obligatoire avec un justificatif
 * (`DepotJustificatif`), facultatif dans « Compte et sécurité », où une
 * saisie vide l'efface.
 */
export async function enregistrerTelephone(saisie: string, { obligatoire = false } = {}): Promise<{ erreur: string | null }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { erreur: 'Votre session a expiré. Reconnectez-vous.' }
  const telephone = saisie.trim()
  if (!telephone && obligatoire) return { erreur: 'Indiquez un numéro de téléphone.' }
  if (telephone && !telephoneValide(telephone)) return { erreur: 'Ce numéro de téléphone ne semble pas valide.' }
  await db.execute(sql`UPDATE "user" SET telephone = ${telephone || null} WHERE id = ${session.user.id}::uuid`)
  return { erreur: null }
}
