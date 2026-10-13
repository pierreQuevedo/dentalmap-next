import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { envoyerAlerteCession } from '@/lib/email'
import { LIBELLE_TYPE, type TypeCession } from './types'
import { correspondAlerte, fauteuils, peutEnvoyerAlerte, prixCourt } from './format'
import { jetonDesinscription } from './jeton'
import { cheminAnnonceCession } from './routes'

/**
 * L'alerte cessions, sans compte, sur le modèle de l'alerte formations.
 *
 * Après chaque publication d'annonce (à appeler par la modération, dans un
 * `after()`) et par la route cron `/api/cron/alertes-cession/`, chaque alerte
 * confirmée reçoit les annonces publiées depuis son dernier envoi qui
 * répondent à ses critères, en un seul email, une fois par semaine au plus.
 * Les annonces publiées pendant la semaine d'attente partent à l'envoi suivant.
 */
export async function envoyerAlertesCession(maintenant = new Date()): Promise<{ envoyes: number; echecs: number }> {
  const [{ rows: alertes }, { rows: annonces }] = await Promise.all([
    db.execute<{ id: string; email: string; departements: string[]; types: string[]; confirmee_le: string; dernier_envoi_le: string | null }>(sql`
      SELECT id, email, departements, types, confirmee_le, dernier_envoi_le FROM alertes_cession WHERE confirmee_le IS NOT NULL
    `),
    db.execute<{ titre: string; slug: string; type: TypeCession; departement_code: string; departement_slug: string; secteur: string | null; commune_nom: string; fauteuils: number | null; prix: number | null; publiee_le: string }>(sql`
      SELECT a.titre, a.slug, a.type, a.departement_code, d.slug AS departement_slug, a.secteur, c.nom AS commune_nom, a.fauteuils, a.prix, a.publiee_le
      FROM annonces_cession a
      JOIN communes c ON c.code_insee = a.commune_code
      JOIN departements d ON d.code = a.departement_code
      WHERE a.statut = 'publiee' AND a.expire_le > now() AND a.publiee_le > now() - interval '60 days'
      ORDER BY a.publiee_le ASC
    `),
  ])
  const publiees = annonces.map((a) => ({ ...a, departementCode: a.departement_code, le: new Date(a.publiee_le) }))
  let envoyes = 0
  let echecs = 0
  for (const al of alertes) {
    if (!peutEnvoyerAlerte(al.dernier_envoi_le, maintenant)) continue
    const depuis = new Date(al.dernier_envoi_le ?? al.confirmee_le)
    const nouvelles = publiees.filter((a) => a.le > depuis && correspondAlerte(al, a))
    if (!nouvelles.length) continue
    // Prise de l'alerte : si deux envois se croisent, un seul passe.
    const { rows: pris } = await db.execute<{ id: string }>(sql`
      UPDATE alertes_cession SET dernier_envoi_le = now()
      WHERE id = ${al.id} AND dernier_envoi_le IS NOT DISTINCT FROM ${al.dernier_envoi_le}
      RETURNING id
    `)
    if (!pris.length) continue
    try {
      await envoyerAlerteCession(
        al.email,
        jetonDesinscription(al.id),
        nouvelles.map((a) => ({
          titre: a.titre,
          detail: [LIBELLE_TYPE[a.type], `Secteur ${a.secteur?.trim() || a.commune_nom}`, a.fauteuils ? fauteuils(a.fauteuils) : null, prixCourt(a.prix)].filter(Boolean).join(' · '),
          lien: cheminAnnonceCession(a.departement_slug, a.slug),
        })),
      )
      envoyes++
    } catch (e) {
      console.error('[alertes-cession] envoi impossible, alerte rouverte', al.id, e)
      await db.execute(sql`UPDATE alertes_cession SET dernier_envoi_le = ${al.dernier_envoi_le} WHERE id = ${al.id}`)
      echecs++
    }
  }
  return { envoyes, echecs }
}
