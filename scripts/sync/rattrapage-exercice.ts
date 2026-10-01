/**
 * Rattrapage unique des colonnes ajoutées par la migration 0006.
 *
 * Spécialité ordinale, mode d'exercice, catégorie professionnelle et FINESS
 * existaient dans l'extraction de l'Annuaire Santé mais l'import les laissait
 * tomber. Comme pour la civilité, on relit la source pour ne mettre à jour que
 * ces colonnes, sans rejouer un import complet qui réécrirait aussi les lieux,
 * les slugs et les suppressions.
 *
 * Usage : pnpm dotenv -e .env.local -- tsx scripts/sync/rattrapage-exercice.ts
 *         ANS_FICHIER=/chemin/vers/le.txt pour réutiliser un fichier déjà là.
 *
 * Idempotent : relancé, il réécrit les mêmes valeurs.
 */
import { createWriteStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { lireAns, PROFESSION_DENTISTE } from './lib/ans'
import { ressourceDataGouv } from './lib/source'

const DATASET = 'annuaire-sante-extractions-des-donnees-en-libre-acces-des-professionnels-intervenant-dans-le-systeme-de-sante-rpps'
const RESOURCE = 'fffda7e9-0ea2-4c35-bba0-4496f3af935d'
const LOT = 2000

async function telecharger(chemin: string): Promise<void> {
  try {
    if ((await stat(chemin)).size > 500_000_000) {
      console.log(`[exercice] fichier déjà présent : ${chemin}`)
      return
    }
  } catch {
    // Absent, on télécharge.
  }
  const ressource = await ressourceDataGouv(DATASET, RESOURCE)
  console.log('[exercice] téléchargement de la source…')
  const res = await fetch(ressource.url)
  if (!res.ok || !res.body) throw new Error(`source ${res.status} ${res.statusText}`)
  await pipeline(Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(chemin))
}

type Exercice = { specialite: string; mode: string; categorie: string }

async function main() {
  const chemin = process.env.ANS_FICHIER ?? join(tmpdir(), 'ps-libreacces-personne-activite.txt')
  await telecharger(chemin)

  const parPraticien = new Map<string, Exercice>()
  // Une ligne par situation d'exercice : on garde la première valeur non vide
  // de chaque colonne, et non les valeurs de la première ligne.
  for await (const l of lireAns(chemin, PROFESSION_DENTISTE, () => {})) {
    const e = parPraticien.get(l.identifiantNational) ?? { specialite: '', mode: '', categorie: '' }
    if (!e.specialite) e.specialite = l.specialite
    if (!e.mode) e.mode = l.libelleModeExercice
    if (!e.categorie) e.categorie = l.categorieProfessionnelle
    parPraticien.set(l.identifiantNational, e)
  }
  console.log(`[exercice] ${parPraticien.size} praticiens lus`)

  const entrees = [...parPraticien.entries()].filter(([, e]) => e.specialite || e.mode || e.categorie)
  for (let i = 0; i < entrees.length; i += LOT) {
    const lot = entrees.slice(i, i + LOT)
    const valeurs = sql.join(
      lot.map(([id, e]) => sql`(${id}, ${e.specialite || null}, ${e.mode || null}, ${e.categorie || null})`),
      sql`, `,
    )
    await db.execute(sql`
      UPDATE praticiens p SET
        specialite = v.specialite,
        mode_exercice = v.mode,
        categorie_professionnelle = v.categorie
      FROM (VALUES ${valeurs}) AS v(id, specialite, mode, categorie)
      WHERE p.id = v.id
    `)
    if (i % (LOT * 10) === 0) console.log(`[exercice] ${i}/${entrees.length}`)
  }

  for (const [colonne, libelle] of [
    ['specialite', 'spécialité ordinale'],
    ['mode_exercice', 'mode d’exercice'],
    ['categorie_professionnelle', 'catégorie professionnelle'],
  ] as const) {
    const { rows } = await db.execute<{ valeur: string | null; n: number }>(sql`
      SELECT ${sql.raw(colonne)} AS valeur, count(*)::int AS n
      FROM praticiens WHERE profession = 'dentiste' AND deleted_at IS NULL
      GROUP BY 1 ORDER BY 2 DESC LIMIT 6
    `)
    console.log(`\n[exercice] ${libelle} :`)
    for (const r of rows) console.log(`  ${String(r.n).padStart(6)}  ${r.valeur ?? 'non renseigné'}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
