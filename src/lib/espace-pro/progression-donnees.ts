import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { etatLienGoogle } from './lien-google'
import { REUSSITES } from './parrainage-donnees'
import { pointsDe, type Points } from './progression'

type Diffusion = { badge: boolean; partage: boolean; parrainages: number }

/** Ce que la fiche fait pour se faire connaître : visites du badge (90 jours), des partages (30 jours), parrainages réussis. */
export async function diffusionDesFiches(ids: string[]): Promise<Map<string, Diffusion>> {
  const resultat = new Map<string, Diffusion>(ids.map((id) => [id, { badge: false, partage: false, parrainages: 0 }]))
  if (!ids.length) return resultat
  const liste = sql.join(
    ids.map((id) => sql`${id}`),
    sql`, `,
  )
  const [{ rows: visites }, { rows: parrains }] = await Promise.all([
    db.execute<{ praticien_id: string; badge: boolean; partage: boolean }>(sql`
      SELECT praticien_id,
             bool_or(source = 'badge' AND jour > current_date - 90) AS badge,
             bool_or(source IN ('story', 'qr', 'reseaux') AND jour > current_date - 30) AS partage
      FROM visites_partage WHERE praticien_id IN (${liste}) AND jour > current_date - 90
      GROUP BY praticien_id
    `),
    db.execute<{ parrain_praticien_id: string; n: number }>(sql`
      WITH reussites AS (${REUSSITES})
      SELECT parrain_praticien_id, count(*)::int AS n FROM reussites WHERE parrain_praticien_id IN (${liste}) GROUP BY parrain_praticien_id
    `),
  ])
  for (const v of visites) Object.assign(resultat.get(v.praticien_id)!, { badge: v.badge, partage: v.partage })
  for (const p of parrains) resultat.get(p.parrain_praticien_id)!.parrainages = p.n
  return resultat
}

/** Les points de la fiche ouverte dans l'espace pro. */
export async function pointsDeLEspace(espace: {
  fiche: { id: string }
  force: { total: number }
  completee: { lienGoogleDernierLe: string | null; lienGoogleClics: number } | null
  fraicheur: { etat: string }[]
  ctx: { identiteVerifiee: boolean }
}): Promise<Points> {
  const d = (await diffusionDesFiches([espace.fiche.id])).get(espace.fiche.id)!
  return pointsDe({
    force: espace.force.total,
    google: etatLienGoogle(espace.completee).etat === 'actif',
    aJour: espace.fraicheur.every((f) => f.etat !== 'expire'),
    verifiee: espace.ctx.identiteVerifiee,
    ...d,
  })
}
