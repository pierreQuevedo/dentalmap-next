import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { envoyerFicheEnLigne } from '@/lib/email'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import { REVENDIQUER } from './chemins'

/**
 * Les alertes « fiche créée » (PSC-0, S1-0) : un compte attend la fiche d'un
 * RPPS absent de l'annuaire. Dès que la synchronisation la crée, un seul
 * email part, avec le lien pour la revendiquer, et l'alerte est close.
 *
 * Appelé après chaque synchronisation (`/api/revalidate`) et par la route
 * cron `/api/cron/alertes`. Sans effet de bord si rien n'est apparu.
 */
export async function envoyerAlertesFicheCreee(limite = 200): Promise<{ envoyees: number; echecs: number }> {
  const { rows } = await db.execute<{ id: string; email: string; slug: string; profession: Profession; nom: string; prenom: string | null; raison_sociale: string | null }>(sql`
    SELECT a.id, u.email, p.slug, p.profession, p.nom, p.prenom, p.raison_sociale
    FROM alertes_espace_pro a
    JOIN "user" u ON u.id = a.user_id
    JOIN praticiens p ON p.rpps = a.rpps AND p.deleted_at IS NULL AND p.retire_le IS NULL
    WHERE a.motif = 'fiche_creee' AND a.envoyee_le IS NULL
    ORDER BY a.cree_le ASC
    LIMIT ${limite}
  `)
  let envoyees = 0
  let echecs = 0
  for (const r of rows) {
    // On clôt d'abord : deux appels simultanés n'envoient pas deux fois.
    const { rows: pris } = await db.execute<{ id: string }>(sql`
      UPDATE alertes_espace_pro SET envoyee_le = now() WHERE id = ${r.id} AND envoyee_le IS NULL RETURNING id
    `)
    if (!pris.length) continue
    try {
      await envoyerFicheEnLigne(r.email, nomAffiche({ ...r, raisonSociale: r.raison_sociale }), `${REVENDIQUER}/${encodeURIComponent(r.slug)}/`)
      envoyees++
    } catch (e) {
      console.error('[alertes] envoi impossible, alerte rouverte', r.id, e)
      await db.execute(sql`UPDATE alertes_espace_pro SET envoyee_le = NULL WHERE id = ${r.id}`)
      echecs++
    }
  }
  return { envoyees, echecs }
}
