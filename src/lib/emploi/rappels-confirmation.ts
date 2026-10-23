import { revalidateTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { envoyerOffreNonConfirmee, envoyerRappelConfirmationOffre } from '@/lib/email'
import { CONFIRMATION_JOURS } from './offre-pro'

/**
 * La confirmation des offres, chaque jour (job `confirmations-offres`) :
 * un rappel au recruteur dans les 3 derniers jours de la quinzaine, puis,
 * l'échéance passée, l'avis que l'offre est sortie de la recherche. Un email
 * de chaque par quinzaine : les dates d'envoi sont comparées à la dernière
 * confirmation. Les caches publics des offres sorties sont vidés, pour
 * qu'elles quittent la recherche sans attendre leur renouvellement.
 */

type Ligne = { id: string; slug: string; titre: string; email: string; fiche: string; echeance: Date }

const ECHEANCE = sql.raw(`coalesce(o.confirmee_le, o.publiee_le) + make_interval(days => ${CONFIRMATION_JOURS})`)
const DEPUIS = sql.raw('coalesce(o.confirmee_le, o.publiee_le)')

const lien = (l: Ligne) => `/espace-pro/emploi/${l.id}/?fiche=${encodeURIComponent(l.fiche)}`

async function offres(condition: ReturnType<typeof sql>, envoi: 'rappel_confirmation_le' | 'sortie_signalee_le') {
  const { rows } = await db.execute<Ligne>(sql`
    SELECT o.id, o.slug, o.titre, u.email, p.slug AS fiche, ${ECHEANCE} AS echeance
    FROM offres o JOIN "user" u ON u.id = o.auteur_user_id JOIN praticiens p ON p.id = o.praticien_id
    WHERE o.statut = 'en_ligne' AND (o.expire_le IS NULL OR o.expire_le > now()) AND p.deleted_at IS NULL
      AND ${condition}
      AND (${sql.raw(`o.${envoi}`)} IS NULL OR ${sql.raw(`o.${envoi}`)} < ${DEPUIS})
    LIMIT 500
  `)
  return rows.map((r) => ({ ...r, echeance: new Date(r.echeance) }))
}

export async function rappelerConfirmations() {
  const aRappeler = await offres(sql`${ECHEANCE} > now() AND ${ECHEANCE} <= now() + interval '3 days'`, 'rappel_confirmation_le')
  const sorties = await offres(sql`${ECHEANCE} <= now()`, 'sortie_signalee_le')
  let rappels = 0
  let avis = 0
  let echecs = 0

  for (const l of aRappeler) {
    try {
      await envoyerRappelConfirmationOffre(l.email, { offre: l.titre, avant: l.echeance, url: lien(l) })
      await db.execute(sql`UPDATE offres SET rappel_confirmation_le = now() WHERE id = ${l.id}`)
      rappels++
    } catch (e) {
      echecs++
      console.error('[confirmations-offres] rappel', l.id, e)
    }
  }

  for (const l of sorties) {
    revalidateTag(`emploi:offre:${l.slug}`, { expire: 0 })
    revalidateTag(`praticien:${l.fiche}`, { expire: 0 })
    try {
      await envoyerOffreNonConfirmee(l.email, { offre: l.titre, url: lien(l) })
      await db.execute(sql`UPDATE offres SET sortie_signalee_le = now() WHERE id = ${l.id}`)
      avis++
    } catch (e) {
      echecs++
      console.error('[confirmations-offres] sortie', l.id, e)
    }
  }
  if (sorties.length) revalidateTag('emploi', { expire: 0 })

  return { rappels, sorties: avis, echecs }
}
