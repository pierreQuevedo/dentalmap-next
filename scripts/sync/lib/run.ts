import { randomUUID } from 'node:crypto'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { syncRuns } from '@/db/schema'

type Registre = 'ans' | 'sirene' | 'geo' | 'ban' | 'import'

export type Compteurs = {
  lignesLues: number
  inserees: number
  modifiees: number
  supprimees: number
}

export type Run = {
  id: string
  compteurs: Compteurs
  erreur: (message: string, contexte?: string) => void
  /** Interrompt le run sans rien appliquer, en le marquant `bloque`. */
  bloquer: (raison: string) => never
}

export class RunBloque extends Error {}

/**
 * Encadre un job de synchronisation par une ligne `sync_runs`.
 *
 * Le run est ouvert en `en_cours`, puis fermé en `termine`, `bloque` ou `echec`
 * selon l'issue. Les compteurs et les erreurs sont toujours écrits, y compris
 * quand le job échoue : un run qui plante doit laisser une trace exploitable.
 */
export async function encadrer<T>(
  registre: Registre,
  travail: (run: Run) => Promise<T>,
  options: { sourceSnapshotId?: string } = {},
): Promise<T | undefined> {
  const id = randomUUID()
  const erreurs: { message: string; contexte?: string }[] = []
  const compteurs: Compteurs = { lignesLues: 0, inserees: 0, modifiees: 0, supprimees: 0 }

  await db.insert(syncRuns).values({
    id,
    registre,
    sourceSnapshotId: options.sourceSnapshotId,
    statut: 'en_cours',
  })
  console.log(`[${registre}] run ${id} démarré`)

  const run: Run = {
    id,
    compteurs,
    erreur: (message, contexte) => {
      erreurs.push({ message, contexte })
      console.error(`[${registre}] ${message}${contexte ? ` (${contexte})` : ''}`)
    },
    bloquer: (raison) => {
      throw new RunBloque(raison)
    },
  }

  const fermer = async (statut: 'termine' | 'bloque' | 'echec') => {
    await db
      .update(syncRuns)
      .set({
        statut,
        termineLe: sql`now()`,
        ...compteurs,
        erreurs: erreurs.length ? erreurs : null,
      })
      .where(eq(syncRuns.id, id))
    console.log(
      `[${registre}] run ${id} ${statut} : ${compteurs.lignesLues} lues, ` +
        `${compteurs.inserees} insérées, ${compteurs.modifiees} modifiées, ` +
        `${compteurs.supprimees} supprimées, ${erreurs.length} erreur(s)`,
    )
  }

  try {
    const resultat = await travail(run)
    await fermer('termine')
    return resultat
  } catch (e) {
    if (e instanceof RunBloque) {
      erreurs.push({ message: e.message, contexte: 'garde-fou' })
      await fermer('bloque')
      return undefined
    }
    // Les erreurs Drizzle embarquent la requête entière avec ses milliers de
    // paramètres. On tronque : une trace illisible ne sert personne.
    const brut = e instanceof Error ? (e.cause instanceof Error ? e.cause.message : e.message) : String(e)
    erreurs.push({ message: brut.slice(0, 500), contexte: 'exception' })
    await fermer('echec')
    throw e
  }
}
