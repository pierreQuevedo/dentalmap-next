import { cookies } from 'next/headers'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { envoyerInvitationParrainage, envoyerParrainageReussi } from '@/lib/email'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import { COOKIE_PARRAINAGE } from './chemins'
import { DUREE_BONUS_JOURS, RELANCE_JOURS, bonusParrainage, type Bonus } from './parrainage'

/**
 * Le parrainage, partie données. La réussite n'est jamais stockée : elle se
 * lit dans les revendications. Un parrainage réussit quand le filleul (le
 * compte qui a ouvert le lien, à défaut celui qui porte l'adresse invitée)
 * obtient une revendication acceptée après l'invitation, ni par invitation
 * d'équipe, ni sur la fiche du parrain.
 */
export const REUSSITES = sql`
  SELECT pa.id, pa.parrain_praticien_id, r.praticien_id AS filleul_praticien_id, r.traite_le AS reussi_le
  FROM parrainages pa
  LEFT JOIN "user" u ON pa.filleul_user_id IS NULL AND lower(u.email) = pa.email
  JOIN LATERAL (
    SELECT r.praticien_id, r.traite_le FROM revendications r
    WHERE r.user_id = COALESCE(pa.filleul_user_id, u.id) AND r.user_id <> pa.parrain_id
      AND r.statut = 'acceptee' AND r.objet = 'revendication' AND r.methode <> 'invitation'
      AND r.praticien_id <> pa.parrain_praticien_id AND r.traite_le > pa.cree_le
    ORDER BY r.traite_le LIMIT 1
  ) r ON true
`

/** Le bonus en cours de chaque fiche, en points ; une fiche sans bonus est absente. */
export async function bonusDesFiches(ids: string[]): Promise<Map<string, number>> {
  const bonus = new Map<string, number>()
  if (!ids.length) return bonus
  const liste = sql.join(
    ids.map((id) => sql`${id}`),
    sql`, `,
  )
  const { rows } = await db.execute<{ parrain_praticien_id: string; filleul_praticien_id: string; reussi_le: string }>(sql`
    WITH reussites AS (${REUSSITES})
    SELECT parrain_praticien_id, filleul_praticien_id, reussi_le FROM reussites
    WHERE reussi_le > now() - make_interval(days => ${DUREE_BONUS_JOURS})
      AND (parrain_praticien_id IN (${liste}) OR filleul_praticien_id IN (${liste}))
  `)
  const dates = new Map<string, Date[]>()
  for (const r of rows) {
    for (const id of [r.parrain_praticien_id, r.filleul_praticien_id]) dates.set(id, [...(dates.get(id) ?? []), new Date(r.reussi_le)])
  }
  for (const [id, d] of dates) {
    const { points } = bonusParrainage(d)
    if (points) bonus.set(id, points)
  }
  return bonus
}

export type EtatInvitation = 'envoyee' | 'relancee' | 'ouverte' | 'reussie' | 'desinscrite'
export type Invitation = { email: string; creeLe: Date; etat: EtatInvitation }

/** Ce que voit le parrain : ses invitations, ce qu'il lui reste à envoyer cette semaine, le bonus de sa fiche. */
export async function getParrainage(userId: string, praticienId: string): Promise<{ invitations: Invitation[]; envoyeesSemaine: number; bonus: Bonus; reussis: number }> {
  const [{ rows }, { rows: dates }] = await Promise.all([
    db.execute<{ email: string; cree_le: string; ouverte_le: string | null; relance_le: string | null; desinscrit_le: string | null; reussi: boolean; compte: boolean }>(sql`
      WITH reussites AS (${REUSSITES})
      SELECT pa.email, pa.cree_le, pa.ouverte_le, pa.relance_le, pa.desinscrit_le,
             EXISTS (SELECT 1 FROM reussites x WHERE x.id = pa.id) AS reussi,
             (pa.filleul_user_id IS NOT NULL OR EXISTS (SELECT 1 FROM "user" u WHERE lower(u.email) = pa.email)) AS compte
      FROM parrainages pa WHERE pa.parrain_id = ${userId}::uuid
      ORDER BY pa.cree_le DESC LIMIT 50
    `),
    db.execute<{ reussi_le: string }>(sql`
      WITH reussites AS (${REUSSITES})
      SELECT reussi_le FROM reussites WHERE parrain_praticien_id = ${praticienId} OR filleul_praticien_id = ${praticienId}
    `),
  ])
  const semaine = Date.now() - 7 * 86_400_000
  return {
    invitations: rows.map((r) => ({
      email: r.email,
      creeLe: new Date(r.cree_le),
      etat: r.reussi ? 'reussie' : r.desinscrit_le ? 'desinscrite' : r.ouverte_le || r.compte ? 'ouverte' : r.relance_le ? 'relancee' : 'envoyee',
    })),
    envoyeesSemaine: rows.filter((r) => new Date(r.cree_le).getTime() > semaine).length,
    bonus: bonusParrainage(dates.map((d) => new Date(d.reussi_le))),
    reussis: rows.filter((r) => r.reussi).length,
  }
}

/** Le compte connecté a ouvert un lien de parrainage : il devient le filleul, sauf s'il en est le parrain. */
export async function rattacherFilleul(userId: string): Promise<void> {
  const code = (await cookies()).get(COOKIE_PARRAINAGE)?.value
  if (!code) return
  await db.execute(sql`
    UPDATE parrainages SET filleul_user_id = ${userId}::uuid, ouverte_le = COALESCE(ouverte_le, now())
    WHERE code = ${code} AND filleul_user_id IS NULL AND parrain_id <> ${userId}::uuid
  `)
}

type LigneParrain = { code: string; email: string; nom: string; prenom: string | null; raison_sociale: string | null; profession: Profession }

/** Une relance, sept jours après l'invitation, si l'adresse n'a ni ouvert le lien ni de compte. */
export async function relancerParrainages(limite = 100): Promise<{ parrainagesRelances: number }> {
  const { rows } = await db.execute<LigneParrain & { id: string }>(sql`
    SELECT pa.id, pa.code, pa.email, p.nom, p.prenom, p.raison_sociale, p.profession
    FROM parrainages pa JOIN praticiens p ON p.id = pa.parrain_praticien_id
    WHERE pa.relance_le IS NULL AND pa.desinscrit_le IS NULL AND pa.ouverte_le IS NULL AND pa.filleul_user_id IS NULL
      AND pa.cree_le < now() - make_interval(days => ${RELANCE_JOURS})
      AND NOT EXISTS (SELECT 1 FROM "user" u WHERE lower(u.email) = pa.email)
    LIMIT ${limite}
  `)
  let n = 0
  for (const r of rows) {
    const { rows: pris } = await db.execute(sql`UPDATE parrainages SET relance_le = now() WHERE id = ${r.id} AND relance_le IS NULL RETURNING 1`)
    if (!pris.length) continue
    try {
      await envoyerInvitationParrainage(r.email, nomAffiche({ ...r, raisonSociale: r.raison_sociale }), r.code, true)
      n++
    } catch (e) {
      console.error('[parrainage] relance impossible', r.id, e)
    }
  }
  return { parrainagesRelances: n }
}

/** Prévient les deux côtés d'un parrainage qui vient de réussir, une fois. */
export async function feliciterParrainages(limite = 100): Promise<{ parrainagesReussis: number }> {
  const { rows } = await db.execute<{
    id: string
    parrain_email: string
    filleul_email: string
    parrain_nom: string
    parrain_prenom: string | null
    parrain_rs: string | null
    parrain_profession: Profession
    filleul_nom: string
    filleul_prenom: string | null
    filleul_rs: string | null
    filleul_profession: Profession
    reussi_le: string
  }>(sql`
    WITH reussites AS (${REUSSITES})
    SELECT pa.id, up.email AS parrain_email, COALESCE(uf.email, pa.email) AS filleul_email, x.reussi_le,
           pp.nom AS parrain_nom, pp.prenom AS parrain_prenom, pp.raison_sociale AS parrain_rs, pp.profession AS parrain_profession,
           pf.nom AS filleul_nom, pf.prenom AS filleul_prenom, pf.raison_sociale AS filleul_rs, pf.profession AS filleul_profession
    FROM reussites x
    JOIN parrainages pa ON pa.id = x.id AND pa.felicite_le IS NULL
    JOIN "user" up ON up.id = pa.parrain_id
    LEFT JOIN "user" uf ON uf.id = pa.filleul_user_id
    JOIN praticiens pp ON pp.id = x.parrain_praticien_id
    JOIN praticiens pf ON pf.id = x.filleul_praticien_id
    WHERE x.reussi_le > now() - make_interval(days => ${DUREE_BONUS_JOURS})
    LIMIT ${limite}
  `)
  let n = 0
  for (const r of rows) {
    const { rows: pris } = await db.execute(sql`UPDATE parrainages SET felicite_le = now() WHERE id = ${r.id} AND felicite_le IS NULL RETURNING 1`)
    if (!pris.length) continue
    const fin = new Date(new Date(r.reussi_le).getTime() + DUREE_BONUS_JOURS * 86_400_000)
    const parrain = nomAffiche({ nom: r.parrain_nom, prenom: r.parrain_prenom, raisonSociale: r.parrain_rs, profession: r.parrain_profession })
    const filleul = nomAffiche({ nom: r.filleul_nom, prenom: r.filleul_prenom, raisonSociale: r.filleul_rs, profession: r.filleul_profession })
    try {
      await Promise.all([envoyerParrainageReussi(r.parrain_email, filleul, 'parrain', fin), envoyerParrainageReussi(r.filleul_email, parrain, 'filleul', fin)])
      n++
    } catch (e) {
      console.error('[parrainage] félicitations impossibles', r.id, e)
    }
  }
  return { parrainagesReussis: n }
}

/** Les parrainages réussis d'une fiche comme parrain : date et confrère, du plus récent au plus ancien. */
export async function reussitesDuParrain(praticienId: string): Promise<{ le: string; nom: string; prenom: string | null }[]> {
  const { rows } = await db.execute<{ le: string; nom: string; prenom: string | null }>(sql`
    WITH reussites AS (${REUSSITES})
    SELECT x.reussi_le AS le, p.nom, p.prenom FROM reussites x JOIN praticiens p ON p.id = x.filleul_praticien_id
    WHERE x.parrain_praticien_id = ${praticienId} ORDER BY x.reussi_le DESC
  `)
  return rows
}
