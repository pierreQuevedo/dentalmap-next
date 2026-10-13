import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { envoyerAlerteFormation } from '@/lib/email'
import { Proposition, correspond, nomRegion, peutEnvoyer, sessionsAVenir } from './privee'
import { jetonDesinscription } from './jeton'

export { alerteDesinscription, condensat, jetonDesinscription, nouveauJeton } from './jeton'

/**
 * L'alerte des praticiens sur les nouvelles formations privées (C).
 *
 * Après chaque publication (et par la route cron), chaque alerte confirmée
 * reçoit les formations publiées depuis son dernier envoi qui répondent à
 * ses critères, en un seul email, une fois par semaine au plus. Les
 * formations publiées pendant la semaine d'attente partent à l'envoi suivant.
 */

export async function envoyerAlertesFormation(maintenant = new Date()): Promise<{ envoyes: number; echecs: number }> {
  const [{ rows: alertes }, { rows: formations }] = await Promise.all([
    db.execute<{ id: string; email: string; themes: string[]; regions: string[]; publics: string[]; confirmee_le: string; dernier_envoi_le: string | null }>(sql`
      SELECT id, email, themes, regions, publics, confirmee_le, dernier_envoi_le FROM alertes_formation WHERE confirmee_le IS NOT NULL
    `),
    db.execute<{ wp_slug: string; donnees: unknown; publiee_le: string }>(sql`
      SELECT wp_slug, donnees, publiee_le FROM demandes_formation
      WHERE statut = 'publiee' AND wp_slug IS NOT NULL AND publiee_le > now() - interval '60 days'
      ORDER BY publiee_le ASC
    `),
  ])
  const publiees = formations.flatMap((f) => {
    const d = Proposition.safeParse(f.donnees)
    return d.success ? [{ slug: f.wp_slug, d: d.data, le: new Date(f.publiee_le) }] : []
  })
  let envoyes = 0
  let echecs = 0
  for (const a of alertes) {
    if (!peutEnvoyer(a.dernier_envoi_le, maintenant)) continue
    const depuis = new Date(a.dernier_envoi_le ?? a.confirmee_le)
    const nouvelles = publiees.filter((f) => f.le > depuis && correspond(a, f.d))
    if (!nouvelles.length) continue
    const { rows: pris } = await db.execute<{ id: string }>(sql`
      UPDATE alertes_formation SET dernier_envoi_le = now()
      WHERE id = ${a.id} AND dernier_envoi_le IS NOT DISTINCT FROM ${a.dernier_envoi_le}
      RETURNING id
    `)
    if (!pris.length) continue
    try {
      await envoyerAlerteFormation(
        a.email,
        jetonDesinscription(a.id),
        nouvelles.map((f) => {
          const prochaine = sessionsAVenir(f.d.sessions, maintenant)[0] ?? f.d.sessions[0]!
          return {
            intitule: f.d.intitule,
            organisme: f.d.organisme,
            detail: [f.d.format, f.d.duree, `${prochaine.dates}, ${prochaine.ville ?? nomRegion(prochaine.region)}`].join(' · '),
            lien: `/formation/formations-privees/${f.slug}/`,
          }
        }),
      )
      envoyes++
    } catch (e) {
      console.error('[alertes-formation] envoi impossible, alerte rouverte', a.id, e)
      await db.execute(sql`UPDATE alertes_formation SET dernier_envoi_le = ${a.dernier_envoi_le} WHERE id = ${a.id}`)
      echecs++
    }
  }
  return { envoyes, echecs }
}
