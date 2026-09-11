/**
 * Téléchargement d'une source et enregistrement de son empreinte.
 *
 * Deux usages : éviter de rejouer un import quand le fichier publié n'a pas
 * changé, et pouvoir rejouer exactement un run passé quand une suppression
 * paraît douteuse.
 */
import { createHash, randomUUID } from 'node:crypto'
import { createReadStream, createWriteStream, existsSync, statSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { sourceSnapshots } from '@/db/schema'

type Registre = 'ans' | 'sirene' | 'geo' | 'ban' | 'import'

export type Ressource = {
  url: string
  tailleOctets: number | null
  publieLe: Date | null
}

/** Interroge l'API data.gouv pour connaître l'état courant d'une ressource. */
export async function ressourceDataGouv(datasetSlug: string, resourceId: string): Promise<Ressource> {
  const res = await fetch(`https://www.data.gouv.fr/api/1/datasets/${datasetSlug}/`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`data.gouv ${res.status} ${res.statusText}`)
  const data = (await res.json()) as {
    resources: { id: string; url: string; filesize?: number; last_modified?: string }[]
  }
  const r = data.resources.find((x) => x.id === resourceId)
  if (!r) throw new Error(`ressource ${resourceId} introuvable dans le jeu de données ${datasetSlug}`)
  return {
    url: r.url,
    tailleOctets: r.filesize ?? null,
    publieLe: r.last_modified ? new Date(r.last_modified) : null,
  }
}

export async function sha256Fichier(chemin: string): Promise<string> {
  const hash = createHash('sha256')
  await pipeline(createReadStream(chemin), hash)
  return hash.digest('hex')
}

/** Télécharge en flux, sans charger le fichier en mémoire. */
export async function telecharger(url: string, destination: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok || !res.body) throw new Error(`téléchargement ${res.status} ${res.statusText} sur ${url}`)
  await pipeline(Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(destination))
}

export type Snapshot = { id: string; sha256: string; inchange: boolean }

/**
 * Assure la présence locale du fichier et enregistre son empreinte.
 *
 * Si un fichier local est déjà présent et que son empreinte correspond au
 * dernier snapshot du registre, rien n'est retéléchargé et `inchange` vaut vrai.
 */
export async function assurerSource(
  registre: Registre,
  ressource: Ressource,
  chemin: string,
): Promise<Snapshot> {
  const dejaLa = existsSync(chemin) && statSync(chemin).size > 0
  if (!dejaLa) {
    console.log(`[${registre}] téléchargement de ${ressource.url}`)
    await telecharger(ressource.url, chemin)
  } else {
    console.log(`[${registre}] fichier local réutilisé : ${chemin}`)
  }

  const sha256 = await sha256Fichier(chemin)
  const [dernier] = await db
    .select({ id: sourceSnapshots.id, sha256: sourceSnapshots.sha256 })
    .from(sourceSnapshots)
    .where(eq(sourceSnapshots.registre, registre))
    .orderBy(desc(sourceSnapshots.telechargeLe))
    .limit(1)

  if (dernier?.sha256 === sha256) {
    return { id: dernier.id, sha256, inchange: true }
  }

  const id = randomUUID()
  await db.insert(sourceSnapshots).values({
    id,
    registre,
    url: ressource.url,
    publieLe: ressource.publieLe,
    tailleOctets: statSync(chemin).size,
    sha256,
  })
  return { id, sha256, inchange: false }
}
