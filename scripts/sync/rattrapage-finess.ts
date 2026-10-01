/**
 * Rattrapage unique du FINESS des lieux, ajouté par la migration 0006.
 *
 * L'identifiant de lieu est un condensé de la structure et de l'adresse, le
 * même calcul que `sync-ans.ts` : on le recompose ici pour ne mettre à jour que
 * cette colonne.
 */
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { lireAns, PROFESSION_DENTISTE, type LigneAns } from './lib/ans'

const LOT = 2000

/** Copie conforme de `idLieu` dans `sync-ans.ts`. */
function idLieu(l: LigneAns): string {
  const discriminant = createHash('sha1')
    .update(`${l.identifiantStructure}|${l.adresseLigne}|${l.codePostal}|${l.codeCommune}`)
    .digest('hex')
    .slice(0, 12)
  return `${l.identifiantNational}:${discriminant}`
}

async function main() {
  const chemin = process.env.ANS_FICHIER ?? join(tmpdir(), 'ps-libreacces-personne-activite.txt')
  const parLieu = new Map<string, string>()
  for await (const l of lireAns(chemin, PROFESSION_DENTISTE, () => {})) {
    if (!l.finess) continue
    const id = idLieu(l)
    if (!parLieu.has(id)) parLieu.set(id, l.finess)
  }
  console.log(`[finess] ${parLieu.size} lieux avec un numéro FINESS`)

  const entrees = [...parLieu.entries()]
  for (let i = 0; i < entrees.length; i += LOT) {
    const valeurs = sql.join(entrees.slice(i, i + LOT).map(([id, f]) => sql`(${id}, ${f})`), sql`, `)
    await db.execute(sql`
      UPDATE lieux_exercice l SET finess = v.finess
      FROM (VALUES ${valeurs}) AS v(id, finess) WHERE l.id = v.id
    `)
  }

  const { rows } = await db.execute<{ n: number; total: number }>(sql`
    SELECT count(finess)::int AS n, count(*)::int AS total
    FROM lieux_exercice l JOIN praticiens p ON p.id = l.praticien_id WHERE p.profession = 'dentiste'
  `)
  console.log(`[finess] ${rows[0]!.n}/${rows[0]!.total} lieux renseignés`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
