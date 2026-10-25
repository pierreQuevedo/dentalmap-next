import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { del } from '@vercel/blob'
import { revalidateTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { envoyerAvertissementInactivite } from '@/lib/email'
import { CONSERVATION_OFFRES_MOIS, INACTIVITE_MOIS, JOUR, PREAVIS_JOURS, moisAvant } from './conservation-regles'

/**
 * Les durées de conservation annoncées dans la politique de confidentialité
 * (`src/components/vitrine/legal/contenu.ts`, « Durées de conservation »),
 * appliquées chaque nuit par `/api/cron/conservation/`. Chaque passage traite
 * un lot borné et peut être relancé sans risque.
 *
 * Les messages de contact n'y sont pas : ils vivent dans l'espace SAV du
 * back-office WordPress et dans la boîte de l'équipe.
 */

/* ------------------------------------------------------------------ */
/* Fichiers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Un fichier rangé par le site : `blob:` ou `local:` (CV, justificatifs),
 * `/photos/<nom>` (photo privée servie par le site), `/uploads/…` (photo sur
 * le disque, hors production) ou une URL publique du stockage Vercel Blob.
 * Le reste (photo d'un registre, adresse externe) n'est pas à nous.
 */
async function supprimerFichier(chemin: string): Promise<void> {
  if (chemin.startsWith('blob:')) await del(chemin.slice(5))
  else if (chemin.startsWith('local:')) await unlink(chemin.slice(6)).catch(() => undefined)
  else if (chemin.startsWith('/photos/')) await del(`photos/${chemin.slice(8)}`)
  else if (chemin.startsWith('/uploads/') && process.env.NODE_ENV !== 'production') await unlink(join(process.cwd(), 'public', chemin)).catch(() => undefined)
  else if (/^https:\/\/[^/]+\.blob\.vercel-storage\.com\//.test(chemin)) await del(chemin)
}

/** Les CV qui ne serviront plus : ni au profil, ni à une candidature qui reste (hors `sauf`). */
async function cvOrphelins(chemins: string[], sauf: { offres?: string[]; compte?: string }): Promise<string[]> {
  const uniques = [...new Set(chemins.filter(Boolean))]
  if (!uniques.length) return []
  const liste = sql.join(uniques.map((c) => sql`${c}`), sql`, `)
  const horsOffres = sauf.offres?.length ? sql`AND offre_id NOT IN (${sql.join(sauf.offres.map((o) => sql`${o}`), sql`, `)})` : sql``
  const horsCompte = sauf.compte ? sql`AND user_id <> ${sauf.compte}::uuid` : sql``
  const horsCompteK = sauf.compte ? sql`AND candidat_user_id <> ${sauf.compte}::uuid` : sql``
  const { rows } = await db.execute<{ chemin: string }>(sql`
    SELECT cv_chemin AS chemin FROM candidats WHERE cv_chemin IN (${liste}) ${horsCompte}
    UNION SELECT cv_chemin FROM candidatures WHERE cv_chemin IN (${liste}) ${horsOffres} ${horsCompteK}
  `)
  const gardes = new Set(rows.map((r) => r.chemin))
  return uniques.filter((c) => !gardes.has(c))
}

async function supprimerFichiers(chemins: string[], journal: string): Promise<number> {
  let echecs = 0
  for (const c of chemins) {
    try {
      await supprimerFichier(c)
    } catch (e) {
      console.error(`[${journal}] fichier non supprimé`, c, e)
      echecs++
    }
  }
  return echecs
}

/* ------------------------------------------------------------------ */
/* Offres et candidatures                                               */
/* ------------------------------------------------------------------ */

/**
 * Les offres closes depuis six mois (retirées, pourvues, ou en ligne passé
 * leur échéance) disparaissent avec leurs candidatures, puis les CV qui
 * n'étaient joints qu'à elles. Les brouillons restent : ils n'ont jamais été
 * publiés.
 */
export async function purgerOffres(limite = 200): Promise<{ offres: number; cv: number; echecs: number }> {
  const { rows } = await db.execute<{ id: string; slug: string; cv: string[] | null }>(sql`
    SELECT o.id, o.slug, (SELECT array_agg(k.cv_chemin) FROM candidatures k WHERE k.offre_id = o.id AND k.cv_chemin IS NOT NULL) AS cv
    FROM offres o
    WHERE (o.statut IN ('retiree', 'pourvue', 'expiree') OR (o.statut = 'en_ligne' AND o.expire_le <= now()))
      AND coalesce(o.cloturee_le, o.expire_le, o.maj_le) < now() - make_interval(months => ${CONSERVATION_OFFRES_MOIS})
    ORDER BY coalesce(o.cloturee_le, o.expire_le, o.maj_le)
    LIMIT ${limite}
  `)
  if (!rows.length) return { offres: 0, cv: 0, echecs: 0 }
  const ids = rows.map((r) => r.id)
  // Les fichiers d'abord : une offre dont un CV n'a pas pu partir reste, pour le passage suivant.
  const orphelins = await cvOrphelins(rows.flatMap((r) => r.cv ?? []), { offres: ids })
  const echecs = await supprimerFichiers(orphelins, 'conservation')
  if (echecs) return { offres: 0, cv: orphelins.length - echecs, echecs }
  // Les candidatures suivent l'offre (cascade).
  await db.execute(sql`DELETE FROM offres WHERE id IN (${sql.join(ids.map((i) => sql`${i}`), sql`, `)})`)
  revalidateTag('emploi', 'max')
  for (const r of rows) revalidateTag(`emploi:offre:${r.slug}`, 'max')
  return { offres: rows.length, cv: orphelins.length, echecs: 0 }
}

/* ------------------------------------------------------------------ */
/* Comptes inactifs                                                     */
/* ------------------------------------------------------------------ */

/** Un mois avant les deux ans sans connexion, l'email qui prévient. Daté avant l'envoi, remis à zéro s'il échoue. */
export async function avertirComptesInactifs(limite = 200, maintenant = new Date()): Promise<{ avertis: number; echecs: number }> {
  const seuil = new Date(moisAvant(maintenant, INACTIVITE_MOIS).getTime() + PREAVIS_JOURS * JOUR)
  const suppression = new Date(maintenant.getTime() + PREAVIS_JOURS * JOUR)
  const { rows } = await db.execute<{ id: string; email: string; name: string }>(sql`
    UPDATE "user" SET inactivite_averti_le = ${maintenant}
    WHERE id IN (
      SELECT id FROM "user"
      WHERE inactivite_averti_le IS NULL AND derniere_activite_le < ${seuil}
      ORDER BY derniere_activite_le LIMIT ${limite}
    )
    RETURNING id, email, name
  `)
  let echecs = 0
  for (const u of rows) {
    try {
      await envoyerAvertissementInactivite(u.email, u.name, suppression)
    } catch (e) {
      console.error('[conservation] avertissement non envoyé', u.id, e)
      await db.execute(sql`UPDATE "user" SET inactivite_averti_le = NULL WHERE id = ${u.id}::uuid`)
      echecs++
    }
  }
  return { avertis: rows.length - echecs, echecs }
}

/**
 * Deux ans sans connexion et l'avertissement parti depuis un mois : le compte
 * est supprimé, et avec lui (cascade) son profil Emploi, ses candidatures, ses
 * alertes, ses favoris et ses demandes. Ses fichiers partent d'abord.
 *
 * Une fiche qu'il est le dernier à avoir modifiée passe à un autre
 * gestionnaire accepté s'il y en a un ; sinon ses ajouts sont supprimés avec
 * le compte et la fiche revient aux seules données des registres.
 */
export async function supprimerComptesInactifs(limite = 50, maintenant = new Date()): Promise<{ supprimes: number; echecs: number }> {
  const limiteActivite = moisAvant(maintenant, INACTIVITE_MOIS)
  const limiteAvertissement = new Date(maintenant.getTime() - PREAVIS_JOURS * JOUR)
  const { rows: comptes } = await db.execute<{ id: string }>(sql`
    SELECT id FROM "user"
    WHERE derniere_activite_le < ${limiteActivite} AND inactivite_averti_le IS NOT NULL AND inactivite_averti_le <= ${limiteAvertissement}
    ORDER BY derniere_activite_le LIMIT ${limite}
  `)
  let supprimes = 0
  let echecs = 0
  for (const { id } of comptes) {
    try {
      // Les fiches passent à un autre gestionnaire quand il y en a un.
      await db.execute(sql`
        UPDATE fiches_completees f SET user_id = coalesce((
          SELECT r.user_id FROM revendications r
          WHERE r.praticien_id = f.praticien_id AND r.statut = 'acceptee' AND r.user_id <> ${id}::uuid
          ORDER BY r.traite_le DESC NULLS LAST LIMIT 1
        ), f.user_id)
        WHERE f.user_id = ${id}::uuid
      `)
      const { rows: [f] } = await db.execute<{ cv: string[] | null; photos: string[] | null; slugs: string[] | null }>(sql`
        SELECT
          (SELECT array_agg(c) FROM (
            SELECT cv_chemin AS c FROM candidats WHERE user_id = ${id}::uuid AND cv_chemin IS NOT NULL
            UNION SELECT cv_chemin FROM candidatures WHERE candidat_user_id = ${id}::uuid AND cv_chemin IS NOT NULL
          ) x) AS cv,
          (SELECT array_agg(p) FROM (
            SELECT photo_url AS p FROM candidats WHERE user_id = ${id}::uuid AND photo_url IS NOT NULL
            UNION SELECT photo_url FROM fiches_completees WHERE user_id = ${id}::uuid AND photo_url IS NOT NULL
            UNION SELECT r->>'url' FROM fiches_completees, jsonb_array_elements(coalesce(realisations, '[]'::jsonb)) r WHERE user_id = ${id}::uuid
          ) y WHERE p IS NOT NULL) AS photos,
          (SELECT array_agg(p.slug) FROM fiches_completees fc JOIN praticiens p ON p.id = fc.praticien_id WHERE fc.user_id = ${id}::uuid) AS slugs
      `)
      const cv = await cvOrphelins(f?.cv ?? [], { compte: id })
      if (await supprimerFichiers([...cv, ...(f?.photos ?? [])], 'conservation')) throw new Error('fichiers restants')
      await db.execute(sql`DELETE FROM "user" WHERE id = ${id}::uuid`)
      if (f?.slugs?.length) {
        revalidateTag('annuaire', 'max')
        for (const slug of f.slugs) revalidateTag(`praticien:${slug}`, 'max')
      }
      supprimes++
    } catch (e) {
      // Le compte reste : le prochain passage reprend là où celui-ci s'est arrêté.
      console.error('[conservation] compte non supprimé', id, e)
      echecs++
    }
  }
  if (supprimes) revalidateTag('emploi', 'max')
  return { supprimes, echecs }
}
