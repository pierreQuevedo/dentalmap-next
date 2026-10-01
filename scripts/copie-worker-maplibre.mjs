/**
 * Copie le worker de MapLibre dans `public/`.
 *
 * MapLibre 6 déduit l'adresse de son worker de `import.meta.url`. Next réécrit
 * cette valeur au bundling, elle ne commence plus par `http`, et la fonction
 * de repli renvoie une chaîne vide : le navigateur résout alors `''` contre
 * l'URL du document, lance la page HTML comme module worker, et le worker meurt
 * à la première ligne. La carte reste vide, sans qu'aucun événement `error` ne
 * soit émis.
 *
 * On sert donc le worker nous-mêmes et on le déclare avec `setWorkerUrl`.
 * Les fichiers sont copiés depuis node_modules plutôt que versionnés, pour
 * qu'ils ne puissent pas diverger de la version installée de maplibre-gl.
 *
 * Deux fichiers et non un : le worker importe le tronc commun partagé avec le
 * fil principal, par un chemin relatif, et doit le trouver à côté de lui.
 */
import { copyFile, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const racine = join(dirname(fileURLToPath(import.meta.url)), '..')

const FICHIERS = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']
const dossier = join(racine, 'public', 'maplibre')

await mkdir(dossier, { recursive: true })
for (const nom of FICHIERS) {
  await copyFile(require.resolve(`maplibre-gl/dist/${nom}`), join(dossier, nom))
}
console.log(`maplibre : ${FICHIERS.join(', ')} copiés dans public/maplibre/`)
