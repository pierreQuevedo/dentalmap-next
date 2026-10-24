import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { envoyerAModerer, envoyerContestationTitulaire } from '@/lib/email'

/**
 * Contestation d'une fiche déjà gérée : le titulaire est prévenu par email et
 * répond en un clic (il la gère toujours, ou il la cède) ; sans réponse sous
 * sept jours, l'équipe est relancée (`relancerContestations`, tâche
 * quotidienne) et tranche. La décision reste à l'équipe dans tous les cas.
 */

export const DELAI_CONTESTATION_JOURS = 7

/** Prévient le ou les titulaires de la fiche, une fois par demande. */
export async function avertirTitulaire(praticienId: string, demandeurId: string, nomFiche: string): Promise<void> {
  const { rows } = await db.execute<{ id: string; email: string }>(sql`
    SELECT d.id, u.email
    FROM revendications d
    JOIN revendications t ON t.praticien_id = d.praticien_id AND t.user_id <> d.user_id AND t.statut = 'acceptee' AND t.objet = 'revendication'
    JOIN "user" u ON u.id = t.user_id
    WHERE d.praticien_id = ${praticienId} AND d.user_id = ${demandeurId}::uuid AND d.statut = 'en_attente'
  `)
  if (!rows.length) return
  await db.execute(sql`UPDATE revendications SET titulaire_averti_le = now(), titulaire_reponse = NULL, titulaire_repondu_le = NULL, moderation_relancee_le = NULL WHERE id = ${rows[0]!.id}`)
  await Promise.all(rows.map((r) => envoyerContestationTitulaire(r.email, nomFiche, `/espace-pro/contestation/${r.id}/`)))
}

export type Contestation = { id: string; praticienId: string; fiche: string; slug: string; demandeLe: string; reponse: 'maintient' | 'cede' | null; statut: string }

/** La contestation `id`, si le compte est titulaire de la fiche visée. */
export async function contestationPourTitulaire(id: string, userId: string): Promise<Contestation | null> {
  const { rows } = await db.execute<{ id: string; praticien_id: string; fiche: string; slug: string; demande_le: string; titulaire_reponse: 'maintient' | 'cede' | null; statut: string }>(sql`
    SELECT d.id, d.praticien_id, coalesce(p.raison_sociale, trim(coalesce(p.prenom, '') || ' ' || p.nom)) AS fiche, p.slug, d.demande_le, d.titulaire_reponse, d.statut
    FROM revendications d
    JOIN praticiens p ON p.id = d.praticien_id
    WHERE d.id = ${id}
      AND EXISTS (SELECT 1 FROM revendications t WHERE t.praticien_id = d.praticien_id AND t.user_id = ${userId}::uuid AND t.statut = 'acceptee' AND t.objet = 'revendication')
  `)
  const r = rows[0]
  return r ? { id: r.id, praticienId: r.praticien_id, fiche: r.fiche, slug: r.slug, demandeLe: r.demande_le, reponse: r.titulaire_reponse, statut: r.statut } : null
}

/** Les contestations restées sans réponse sept jours : l'équipe est relancée, une fois. */
export async function relancerContestations(): Promise<number> {
  const { rows } = await db.execute<{ id: string; fiche: string; email: string }>(sql`
    UPDATE revendications d SET moderation_relancee_le = now()
    FROM praticiens p, "user" u
    WHERE p.id = d.praticien_id AND u.id = d.user_id
      AND d.statut = 'en_attente' AND d.titulaire_averti_le IS NOT NULL AND d.titulaire_reponse IS NULL
      AND d.moderation_relancee_le IS NULL AND d.titulaire_averti_le < now() - make_interval(days => ${DELAI_CONTESTATION_JOURS})
    RETURNING d.id, coalesce(p.raison_sociale, trim(coalesce(p.prenom, '') || ' ' || p.nom)) AS fiche, u.email
  `)
  for (const r of rows) await envoyerAModerer(`contestation sans réponse pour ${r.fiche}`, `Le titulaire de la fiche « ${r.fiche} » n’a pas répondu en ${DELAI_CONTESTATION_JOURS} jours à la demande de ${r.email}. À trancher dans la modération.`)
  return rows.length
}
