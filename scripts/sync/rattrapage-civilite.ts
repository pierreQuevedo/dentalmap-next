/**
 * Rattrapage unique de la colonne `civilite`, ajoutée par la migration 0005.
 *
 * L'import courant l'écrit désormais, mais les 65 000 praticiens déjà en base
 * ont été importés avant qu'elle n'existe. Plutôt qu'un `pnpm sync:ans`
 * complet, qui réécrit aussi les lieux, les slugs et les suppressions, ce
 * script ne lit que deux colonnes de la source et ne met à jour que celle-là.
 *
 * Usage : pnpm dotenv -e .env.local -- tsx scripts/sync/rattrapage-civilite.ts
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

const URL_SOURCE =
  'https://static.data.gouv.fr/resources/annuaire-sante-extractions-des-donnees-en-libre-acces-des-professionnels-intervenant-dans-le-systeme-de-sante-rpps/20260917-113802/ps-libreacces-personne-activite.txt'
const LOT = 2000

async function telecharger(chemin: string): Promise<void> {
  try {
    const info = await stat(chemin)
    if (info.size > 500_000_000) {
      console.log(`[civilite] fichier déjà présent : ${chemin}`)
      return
    }
  } catch {
    // Absent, on télécharge.
  }
  console.log('[civilite] téléchargement de la source…')
  const res = await fetch(URL_SOURCE)
  if (!res.ok || !res.body) throw new Error(`source ${res.status} ${res.statusText}`)
  await pipeline(Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(chemin))
}

async function main() {
  const chemin = process.env.ANS_FICHIER ?? join(tmpdir(), 'ps-libreacces-personne-activite.txt')
  await telecharger(chemin)

  const civilites = new Map<string, 'M' | 'MME'>()
  let lignes = 0
  for await (const l of lireAns(chemin, PROFESSION_DENTISTE, () => { lignes += 1 })) {
    if (l.civilite === 'M' || l.civilite === 'MME') civilites.set(l.identifiantNational, l.civilite)
  }
  console.log(`[civilite] ${lignes} lignes lues, ${civilites.size} praticiens avec une civilité`)

  const entrees = [...civilites.entries()]
  let ecrits = 0
  for (let i = 0; i < entrees.length; i += LOT) {
    const lot = entrees.slice(i, i + LOT)
    const valeurs = sql.join(lot.map(([id, c]) => sql`(${id}, ${c})`), sql`, `)
    await db.execute(sql`
      UPDATE praticiens p SET civilite = v.civilite
      FROM (VALUES ${valeurs}) AS v(id, civilite)
      WHERE p.id = v.id AND p.civilite IS DISTINCT FROM v.civilite
    `)
    ecrits += lot.length
    if (i % (LOT * 10) === 0) console.log(`[civilite] ${ecrits}/${entrees.length}`)
  }

  const { rows } = await db.execute<{ civilite: string | null; n: number }>(sql`
    SELECT civilite, count(*)::int AS n FROM praticiens
    WHERE profession = 'dentiste' AND deleted_at IS NULL
    GROUP BY civilite ORDER BY n DESC
  `)
  console.log('[civilite] répartition finale :')
  for (const r of rows) console.log(`  ${String(r.n).padStart(6)}  ${r.civilite ?? 'non renseignée'}`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
