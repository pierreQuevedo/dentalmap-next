import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import { envoyerAlerteEmploi } from '@/lib/email'
import { jetonDesinscription } from '@/lib/formation/jeton'
import { CriteresAlerte } from './alerte'
import { lireFrequence, peutEnvoyer, titreAlerte } from './alertes-compte'
import { cheminOffre } from './chemins'
import { remuneration } from './format'
import { LIBELLE_CONTRAT, type CodeContrat, type ModeRemuneration } from './metiers'
import { offreEnLigne } from './en-ligne'

/**
 * Le job `alertes-emploi` (`/api/cron/alertes-emploi/`, chaque matin) : pour
 * chaque alerte confirmée et active, les offres publiées depuis son dernier
 * envoi qui répondent à ses critères, par distance, dix au plus. Une alerte
 * de compte part chaque jour ou chaque semaine selon son réglage ; une alerte
 * sans compte, chaque semaine au plus. Rien n'est envoyé sans nouveauté.
 * Les offres des structures masquées par la personne n'y figurent jamais.
 */
export async function envoyerAlertesEmploi(maintenant = new Date()): Promise<{ envoyes: number; echecs: number }> {
  const { rows: alertes } = await db.execute<{
    id: string
    user_id: string | null
    email: string | null
    titre: string | null
    criteres: unknown
    frequence: string
    depuis: string
    dernier_envoi_le: string | null
    masquees: string[] | null
  }>(sql`
    SELECT a.id, a.user_id, coalesce(u.email, a.email) AS email, a.titre, a.criteres, a.frequence, a.dernier_envoi_le,
           coalesce(a.dernier_envoi_le, a.confirmee_le) AS depuis, k.structures_masquees AS masquees
    FROM alertes_emploi a
    LEFT JOIN "user" u ON u.id = a.user_id
    LEFT JOIN candidats k ON k.user_id = a.user_id
    WHERE a.active AND a.confirmee_le IS NOT NULL
  `)
  let envoyes = 0
  let echecs = 0
  for (const a of alertes) {
    const c = CriteresAlerte.safeParse(a.criteres)
    if (!c.success || !a.email) continue
    const frequence = a.user_id ? lireFrequence(a.frequence) : 'hebdomadaire'
    if (!peutEnvoyer(frequence, a.dernier_envoi_le, maintenant)) continue
    const cr = c.data
    const centre = cr.commune ? sql`(SELECT centre FROM communes WHERE code_insee = ${cr.commune})` : null
    const { rows: offres } = await db.execute<{
      slug: string
      titre: string
      contrat: CodeContrat
      mode_remuneration: ModeRemuneration
      remuneration_min: number
      remuneration_max: number
      commune: string
      profession: Profession
      nom: string
      prenom: string | null
      raison_sociale: string | null
    }>(sql`
      SELECT o.slug, o.titre, o.contrat, o.mode_remuneration, o.remuneration_min, o.remuneration_max, cm.nom AS commune,
             p.profession, p.nom, p.prenom, p.raison_sociale
      FROM offres o
      JOIN praticiens p ON p.id = o.praticien_id
      JOIN communes cm ON cm.code_insee = o.commune_code
      WHERE ${offreEnLigne()} AND p.deleted_at IS NULL
        AND o.publiee_le > ${a.depuis}
        ${cr.metiers.length ? sql`AND o.metier IN (${sql.join(cr.metiers.map((m) => sql`${m}`), sql`, `)})` : sql``}
        ${cr.contrats.length ? sql`AND o.contrat IN (${sql.join(cr.contrats.map((x) => sql`${x}`), sql`, `)})` : sql``}
        ${centre ? sql`AND ST_DWithin(o.position::geography, ${centre}::geography, ${(cr.rayonKm ?? 15) * 1000})` : cr.departement ? sql`AND o.departement_code = ${cr.departement}` : sql``}
        ${a.masquees?.length ? sql`AND p.slug NOT IN (${sql.join(a.masquees.map((s) => sql`${s}`), sql`, `)})` : sql``}
      ORDER BY ${centre ? sql`ST_Distance(o.position::geography, ${centre}::geography)` : sql`o.publiee_le DESC`}
      LIMIT 10
    `)
    if (!offres.length) continue
    // Prise de l'alerte : si deux envois se croisent, un seul passe.
    const { rows: pris } = await db.execute<{ id: string }>(sql`
      UPDATE alertes_emploi SET dernier_envoi_le = now() WHERE id = ${a.id} AND dernier_envoi_le IS NOT DISTINCT FROM ${a.dernier_envoi_le} RETURNING id
    `)
    if (!pris.length) continue
    try {
      await envoyerAlerteEmploi(a.email, {
        titre: a.titre ?? titreAlerte(cr),
        offres: offres.map((o) => {
          const r = remuneration({ mode: o.mode_remuneration, min: o.remuneration_min, max: o.remuneration_max })
          return {
            titre: o.titre,
            detail: [nomAffiche({ profession: o.profession, nom: o.nom, prenom: o.prenom, raisonSociale: o.raison_sociale }), o.commune, LIBELLE_CONTRAT[o.contrat], `${r.principal} ${r.detail}`].join(' · '),
            lien: cheminOffre(o.slug),
          }
        }),
        gerer: a.user_id ? { libelle: 'Gérer mes alertes', url: '/espace-pro/emploi/alertes/' } : { libelle: 'Me désinscrire de l’alerte', url: `/emploi/alerte/desinscrire/${jetonDesinscription(a.id, 'alerte-emploi')}/` },
      })
      envoyes++
    } catch (e) {
      console.error('[alertes-emploi] envoi impossible, alerte rouverte', a.id, e)
      await db.execute(sql`UPDATE alertes_emploi SET dernier_envoi_le = ${a.dernier_envoi_le} WHERE id = ${a.id}`)
      echecs++
    }
  }
  return { envoyes, echecs }
}
