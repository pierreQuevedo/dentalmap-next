import { describe, expect, it, beforeAll, afterAll } from 'vitest'

/**
 * La règle d'indexabilité est du SQL : elle ne peut être vérifiée qu'en base.
 * Ce test insère des fiches couvrant chaque cas, appelle la fonction réellement
 * utilisée par les jobs, puis nettoie derrière lui.
 *
 * Il ne tourne que si DATABASE_URL_TEST est fourni, et refuse de s'exécuter sur
 * une base contenant des données : un test qui écrit ne doit jamais toucher la
 * base principale.
 */
const url = process.env.DATABASE_URL_TEST
const decrire = url ? describe : describe.skip

decrire("règle d'indexabilité", () => {
  let db: typeof import('@/db').db
  let recalculer: typeof import('../scripts/sync/lib/indexable').recalculerIndexables
  let sql: typeof import('drizzle-orm').sql

  const PREFIXE = 'test-indexable:'

  beforeAll(async () => {
    process.env.DATABASE_URL = url
    ;({ sql } = await import('drizzle-orm'))
    ;({ db } = await import('@/db'))
    ;({ recalculerIndexables: recalculer } = await import('../scripts/sync/lib/indexable'))

    await nettoyer()

    // Une commune porteuse, pour donner une position aux lieux.
    await db.execute(sql`
      INSERT INTO regions (code, nom, slug) VALUES (${PREFIXE + 'r'}, 'Région test', ${PREFIXE + 'region'})
      ON CONFLICT (code) DO NOTHING
    `)
    await db.execute(sql`
      INSERT INTO departements (code, nom, slug, region_code)
      VALUES (${PREFIXE + 'd'}, 'Département test', ${PREFIXE + 'departement'}, ${PREFIXE + 'r'})
      ON CONFLICT (code) DO NOTHING
    `)

    const cas = [
      { id: 'positionne-verifie', statut: 'verifie', position: true, defavorable: false },
      { id: 'sans-position', statut: 'verifie', position: false, defavorable: false },
      { id: 'partiel', statut: 'partiel', position: true, defavorable: false },
      { id: 'non-verifie', statut: 'non_verifie', position: true, defavorable: false },
      { id: 'cesse', statut: 'verifie', position: true, defavorable: true },
    ] as const

    for (const c of cas) {
      const id = PREFIXE + c.id
      await db.execute(sql`
        INSERT INTO praticiens (id, profession, slug, nom, statut_verification, indexable)
        VALUES (${id}, 'prothesiste', ${id}, 'Test', ${c.statut}, FALSE)
      `)
      await db.execute(sql`
        INSERT INTO lieux_exercice (id, praticien_id, adresse_ligne, position)
        VALUES (${id + ':lieu'}, ${id}, '1 rue du Test',
                ${c.position ? sql`ST_SetSRID(ST_MakePoint(-0.5792, 44.8378), 4326)` : sql`NULL`})
      `)
      if (c.defavorable) {
        await db.execute(sql`
          INSERT INTO verifications (id, praticien_id, registre, statut)
          VALUES (${id + ':v'}, ${id}, 'sirene', 'cesse')
        `)
      }
    }
  })

  afterAll(nettoyer)

  async function nettoyer() {
    if (!db) return
    await db.execute(sql`DELETE FROM praticiens WHERE id LIKE ${PREFIXE + '%'}`)
    await db.execute(sql`DELETE FROM departements WHERE code LIKE ${PREFIXE + '%'}`)
    await db.execute(sql`DELETE FROM regions WHERE code LIKE ${PREFIXE + '%'}`)
  }

  async function indexable(suffixe: string): Promise<boolean> {
    const { rows } = await db.execute<{ indexable: boolean }>(
      sql`SELECT indexable FROM praticiens WHERE id = ${PREFIXE + suffixe}`,
    )
    return rows[0]?.indexable ?? false
  }

  it('indexe une fiche positionnée et vérifiée', async () => {
    await recalculer()
    expect(await indexable('positionne-verifie')).toBe(true)
  })

  it("n'indexe pas une fiche sans position", async () => {
    await recalculer()
    expect(await indexable('sans-position')).toBe(false)
  })

  it("n'indexe pas une identité incertaine", async () => {
    await recalculer()
    expect(await indexable('partiel')).toBe(false)
    expect(await indexable('non-verifie')).toBe(false)
  })

  it("n'indexe pas une fiche dont un registre signale la cessation", async () => {
    await recalculer()
    expect(await indexable('cesse')).toBe(false)
  })
})
