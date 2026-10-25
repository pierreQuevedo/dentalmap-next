import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { PROPOSITIONS_MAX, type EtatCle } from './cle-acces'

/** Lecture et écriture de l'état CX4 d'un compte ; la règle est dans `cle-acces.ts`. */
export async function etatCle(userId: string): Promise<EtatCle> {
  const { rows } = await db.execute<{ cles: number; fois: number; derniere: string | null }>(sql`
    SELECT (SELECT count(*)::int FROM passkey WHERE user_id = ${userId}::uuid) AS cles,
           u.cle_proposee_fois AS fois, u.cle_proposee_le AS derniere
    FROM "user" u WHERE u.id = ${userId}::uuid
  `)
  const r = rows[0]
  return { cles: r?.cles ?? 0, fois: r?.fois ?? PROPOSITIONS_MAX, derniere: r?.derniere ? new Date(r.derniere) : null }
}

export async function noterProposition(userId: string): Promise<void> {
  await db.execute(sql`UPDATE "user" SET cle_proposee_fois = cle_proposee_fois + 1, cle_proposee_le = now() WHERE id = ${userId}::uuid`)
}
