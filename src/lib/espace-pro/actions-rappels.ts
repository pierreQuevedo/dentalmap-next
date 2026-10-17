'use server'

import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { chemin } from '@/lib/navigation'
import { ficheDuJetonRappels } from './rappels'

/** Couper les rappels d'une fiche, depuis le lien signé de chaque email, sans connexion. */
export async function couperRappels(donnees: FormData): Promise<never> {
  const jeton = String(donnees.get('jeton') ?? '')
  const id = ficheDuJetonRappels(jeton)
  if (id) await db.execute(sql`UPDATE fiches_completees SET rappels_coupes_le = COALESCE(rappels_coupes_le, now()) WHERE praticien_id = ${id}`)
  redirect(chemin(`/rappels/couper/${encodeURIComponent(jeton)}/?${id ? 'fait=1' : 'invalide=1'}`))
}
