import { unlink } from 'node:fs/promises'
import { revalidateTag } from 'next/cache'
import { del } from '@vercel/blob'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { envoyerLienMasque, envoyerRappelFraicheur } from '@/lib/email'
import { nomAffiche, type Profession } from '@/lib/annuaire/types'
import { ECHECS_MASQUE } from './fiche-completee'
import { COLONNES_FICHE, ficheDepuisLigne, type LigneFiche } from './fiche-lecture'
import { fraicheurDe } from './force'
import { fraicheurLabo } from './force-labo'
import { INTERVALLE_RAPPEL_JOURS, INTERVALLE_TEST_LIENS_JOURS, adresseTestable, blocsARappeler, jetonRappels, lienRepond } from './rappels'

/**
 * Les tâches planifiées de l'espace pro, appelées par les routes
 * `/api/cron/*` (protégées par `CRON_SECRET`). Chacune traite un lot borné
 * et peut être relancée sans risque : ce qui est fait est daté avant l'envoi.
 */

type LigneGestionnaire = LigneFiche & { praticien_id: string; slug: string; profession: Profession; nom: string; prenom: string | null; raison_sociale: string | null; email: string }

/** Les fiches publiées et leur gestionnaire : la revendication acceptée la plus récente. */
const GESTIONNAIRE = sql`
  JOIN praticiens p ON p.id = f.praticien_id AND p.deleted_at IS NULL AND p.retire_le IS NULL
  JOIN LATERAL (
    SELECT r.user_id FROM revendications r
    WHERE r.praticien_id = p.id AND r.statut = 'acceptee' AND r.objet = 'revendication'
    ORDER BY r.traite_le DESC NULLS LAST LIMIT 1
  ) g ON true
  JOIN "user" u ON u.id = g.user_id`

/* ------------------------------------------------------------------ */
/* Rappels de fraîcheur, quotidien                                      */
/* ------------------------------------------------------------------ */

export async function envoyerRappelsFraicheur(limite = 200): Promise<{ envoyes: number; echecs: number; examinees: number }> {
  const { rows } = await db.execute<LigneGestionnaire>(sql`
    SELECT ${COLONNES_FICHE}, f.praticien_id, p.slug, p.profession, p.nom, p.prenom, p.raison_sociale, u.email
    FROM fiches_completees f ${GESTIONNAIRE}
    WHERE f.publiee_le IS NOT NULL AND f.rappels_coupes_le IS NULL
      AND (f.rappel_fraicheur_le IS NULL OR f.rappel_fraicheur_le < now() - make_interval(days => ${INTERVALLE_RAPPEL_JOURS}))
    ORDER BY f.rappel_fraicheur_le ASC NULLS FIRST
    LIMIT ${limite}
  `)
  let envoyes = 0
  let echecs = 0
  for (const r of rows) {
    const fiche = ficheDepuisLigne(r)
    const blocs = blocsARappeler(r.profession === 'prothesiste' ? fraicheurLabo(fiche) : fraicheurDe(fiche))
    if (!blocs.length) continue
    // Daté d'abord : deux passages simultanés n'envoient pas deux fois.
    const { rows: pris } = await db.execute<{ precedent: string | null }>(sql`
      UPDATE fiches_completees f SET rappel_fraicheur_le = now()
      FROM (SELECT rappel_fraicheur_le AS precedent FROM fiches_completees WHERE praticien_id = ${r.praticien_id}) avant
      WHERE f.praticien_id = ${r.praticien_id}
        AND (f.rappel_fraicheur_le IS NULL OR f.rappel_fraicheur_le < now() - make_interval(days => ${INTERVALLE_RAPPEL_JOURS}))
      RETURNING avant.precedent
    `)
    if (!pris.length) continue
    try {
      await envoyerRappelFraicheur(
        r.email,
        nomAffiche({ ...r, raisonSociale: r.raison_sociale }),
        r.slug,
        blocs.map((b) => [b.libelle, b.etat === 'rappel' ? `confirmé il y a ${b.jours} jours, à reconfirmer bientôt` : `confirmé il y a ${b.jours} jours, à reconfirmer`]),
        jetonRappels(r.praticien_id),
      )
      envoyes++
    } catch (e) {
      console.error('[rappels-fraicheur] envoi impossible', r.slug, e)
      await db.execute(sql`UPDATE fiches_completees SET rappel_fraicheur_le = ${pris[0].precedent} WHERE praticien_id = ${r.praticien_id}`)
      echecs++
    }
  }
  return { envoyes, echecs, examinees: rows.length }
}

/* ------------------------------------------------------------------ */
/* Test des liens du cabinet, hebdomadaire                              */
/* ------------------------------------------------------------------ */

/** Le code HTTP d'une adresse, ou `null` sans réponse. Redirections suivies à la main, trois au plus, chacune contrôlée. */
async function statutDe(url: string): Promise<number | null> {
  let adresse = url
  for (let saut = 0; saut < 4; saut++) {
    if (!adresseTestable(adresse)) return null
    for (const methode of ['HEAD', 'GET'] as const) {
      let reponse: Response
      try {
        reponse = await fetch(adresse, {
          method: methode,
          redirect: 'manual',
          signal: AbortSignal.timeout(10_000),
          headers: { 'user-agent': 'DentalMap-Verification-Liens/1.0 (+https://dentalmap.fr)' },
        })
      } catch {
        if (methode === 'HEAD') continue
        return null
      }
      await reponse.body?.cancel()
      // Certains serveurs refusent HEAD : on retente en GET.
      if (methode === 'HEAD' && [403, 405, 501].includes(reponse.status)) continue
      const suivante = reponse.status >= 300 && reponse.status < 400 ? reponse.headers.get('location') : null
      if (!suivante) return reponse.status
      adresse = new URL(suivante, adresse).toString()
      break
    }
  }
  return null
}

export async function testerLiens(limite = 100): Promise<{ testees: number; masques: number }> {
  const { rows } = await db.execute<LigneGestionnaire>(sql`
    SELECT ${COLONNES_FICHE}, f.praticien_id, p.slug, p.profession, p.nom, p.prenom, p.raison_sociale, u.email
    FROM fiches_completees f ${GESTIONNAIRE}
    WHERE (f.site_web IS NOT NULL OR f.rdv_en_ligne IS NOT NULL)
      AND (f.liens_testes_le IS NULL OR f.liens_testes_le < now() - make_interval(days => ${INTERVALLE_TEST_LIENS_JOURS}))
    ORDER BY f.liens_testes_le ASC NULLS FIRST
    LIMIT ${limite}
  `)
  let masques = 0
  for (const r of rows) {
    const fiche = ficheDepuisLigne(r)
    const avant = fiche.liensEchecs
    const apres: { site?: number; rdv?: number } = {}
    const nouveauxMasques: string[] = []
    for (const [cle, url] of [['site', fiche.siteWeb], ['rdv', fiche.rdvEnLigne]] as const) {
      if (!url) continue
      const ok = lienRepond(await statutDe(url))
      apres[cle] = ok ? 0 : (avant[cle] ?? 0) + 1
      if (apres[cle] === ECHECS_MASQUE) nouveauxMasques.push(url)
    }
    await db.execute(sql`UPDATE fiches_completees SET liens_testes_le = now(), liens_echecs = ${JSON.stringify(apres)}::jsonb WHERE praticien_id = ${r.praticien_id}`)
    const change = (['site', 'rdv'] as const).some((k) => ((avant[k] ?? 0) >= ECHECS_MASQUE) !== ((apres[k] ?? 0) >= ECHECS_MASQUE))
    if (change) revalidateTag(`praticien:${r.slug}`, 'max')
    if (nouveauxMasques.length) {
      masques++
      if (!fiche.rappelsCoupesLe) {
        try {
          await envoyerLienMasque(r.email, nomAffiche({ ...r, raisonSociale: r.raison_sociale }), r.slug, nouveauxMasques, jetonRappels(r.praticien_id))
        } catch (e) {
          console.error('[liens] email impossible', r.slug, e)
        }
      }
    }
  }
  return { testees: rows.length, masques }
}

/* ------------------------------------------------------------------ */
/* Purge des documents, quotidien                                       */
/* ------------------------------------------------------------------ */

/** Les pièces déposées (Kbis, mandats, attestations) sont supprimées 30 jours après la décision. */
export const DELAI_PURGE_JOURS = 30

async function supprimerFichier(chemin: string): Promise<void> {
  if (chemin.startsWith('blob:')) await del(chemin.slice(5))
  else if (chemin.startsWith('local:')) await unlink(chemin.slice(6)).catch(() => undefined)
}

export async function purgerDocuments(limite = 200): Promise<{ supprimes: number; echecs: number }> {
  const sources = [
    { table: sql`revendications`, chemin: sql`justificatif_chemin`, nul: sql`justificatif_chemin = NULL, justificatif_nom = NULL, justificatif_taille = NULL` },
    { table: sql`revendications`, chemin: sql`mandat_chemin`, nul: sql`mandat_chemin = NULL, mandat_nom = NULL` },
    { table: sql`demandes_creation_fiche`, chemin: sql`justificatif_chemin`, nul: sql`justificatif_chemin = NULL, justificatif_nom = NULL` },
    { table: sql`revendications_etablissement`, chemin: sql`justificatif_chemin`, nul: sql`justificatif_chemin = NULL, justificatif_nom = NULL` },
  ]
  let supprimes = 0
  let echecs = 0
  for (const s of sources) {
    const { rows } = await db.execute<{ id: string; chemin: string }>(sql`
      SELECT id, ${s.chemin} AS chemin FROM ${s.table}
      WHERE ${s.chemin} IS NOT NULL AND statut <> 'en_attente' AND traite_le < now() - make_interval(days => ${DELAI_PURGE_JOURS})
      LIMIT ${limite}
    `)
    for (const r of rows) {
      try {
        await supprimerFichier(r.chemin)
        await db.execute(sql`UPDATE ${s.table} SET ${s.nul} WHERE id = ${r.id}`)
        supprimes++
      } catch (e) {
        console.error('[purge-documents] suppression impossible', r.id, e)
        echecs++
      }
    }
  }
  return { supprimes, echecs }
}
