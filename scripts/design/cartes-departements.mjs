/**
 * Génère une vignette par département pour l'onglet Prothésistes de l'accueil :
 * le département en ardoise, le reste du plan en clair, pour que sa forme se
 * lise d'un coup d'œil.
 *
 * Les départements sont ceux qui comptent le plus de laboratoires dans la
 * base, les contours viennent de france-geojson (données OpenStreetMap), le
 * fond de plan est le style « positron » d'OpenFreeMap. Même mécanique que
 * `cartes-villes.mjs` : MapLibre dans un navigateur sans tête, servi depuis
 * node_modules sur une origine factice.
 *
 * Sortie : `public/images/cartes/departements/{slug}.jpg` et le manifeste
 * `src/lib/annuaire/images-cartes-departements.json`.
 *
 *   pnpm exec dotenv -e .env.local -- node scripts/design/cartes-departements.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { neon } from '@neondatabase/serverless'
import { chromium } from 'playwright'

const NOMBRE = 12
const STYLE = 'https://tiles.openfreemap.org/styles/positron'
const CONTOURS = 'https://france-geojson.gregoiredavid.fr/repo/departements.geojson'
const ARDOISE = '#16222b'
const LARGEUR = 800
const HAUTEUR = 600
const DOSSIER = join(process.cwd(), 'public', 'images', 'cartes', 'departements')
const MANIFESTE = join(process.cwd(), 'src', 'lib', 'annuaire', 'images-cartes-departements.json')

const sql = neon(process.env.DATABASE_URL)
const departements = await sql`
  SELECT d.code, d.nom, d.slug, count(DISTINCT p.id)::int AS total
  FROM departements d
  JOIN communes c ON c.departement_code = d.code
  JOIN lieux_exercice l ON l.code_insee = c.code_insee
  JOIN praticiens p ON p.id = l.praticien_id AND p.profession = 'prothesiste' AND p.deleted_at IS NULL
  GROUP BY d.code, d.nom, d.slug
  ORDER BY total DESC, d.nom
  LIMIT ${NOMBRE}
`

const reponse = await fetch(CONTOURS)
if (!reponse.ok) throw new Error(`contours ${reponse.status}`)
const contours = await reponse.json()
const parCode = new Map(contours.features.map((f) => [f.properties.code, f]))

/** Boîte englobante d'une géométrie GeoJSON, polygone ou multipolygone. */
function bbox(geometrie) {
  let ouest = 180, sud = 90, est = -180, nord = -90
  const anneaux = geometrie.type === 'Polygon' ? geometrie.coordinates : geometrie.coordinates.flat()
  for (const anneau of anneaux) for (const [x, y] of anneau) {
    if (x < ouest) ouest = x
    if (x > est) est = x
    if (y < sud) sud = y
    if (y > nord) nord = y
  }
  return [[ouest, sud], [est, nord]]
}

mkdirSync(DOSSIER, { recursive: true })
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: LARGEUR, height: HAUTEUR }, deviceScaleFactor: 1 })

const ORIGINE = 'http://cartes-dentalmap.local'
const DIST = join(process.cwd(), 'node_modules', 'maplibre-gl', 'dist')
await page.route(`${ORIGINE}/**`, (route) => {
  const chemin = new URL(route.request().url()).pathname
  if (chemin === '/') {
    return route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html><head><link rel="stylesheet" href="/maplibre-gl.css"></head><body style="margin:0"><div id="carte" style="width:${LARGEUR}px;height:${HAUTEUR}px"></div>
<script type="module">
  import { Map as MapLibre, setWorkerUrl } from '/maplibre-gl.mjs'
  setWorkerUrl('/maplibre-gl-worker.mjs')
  window.maplibregl = { Map: MapLibre }
</script></body></html>`,
    })
  }
  return route.fulfill({ path: join(DIST, chemin.slice(1)), contentType: chemin.endsWith('.css') ? 'text/css' : 'text/javascript' })
})
await page.goto(`${ORIGINE}/`)
await page.waitForFunction(() => Boolean(window.maplibregl))

const manifeste = {}
for (const d of departements) {
  const contour = parCode.get(d.code)
  if (!contour) {
    console.log(`✗ ${d.nom} : contour introuvable`)
    continue
  }
  await page.evaluate(
    async ({ style, contour, limites, ardoise }) => {
      if (window.__carte) window.__carte.remove()
      const carte = new window.maplibregl.Map({
        container: 'carte',
        style,
        bounds: limites,
        fitBoundsOptions: { padding: 36 },
        interactive: false,
        attributionControl: false,
        preserveDrawingBuffer: true,
      })
      window.__carte = carte
      await new Promise((ok) => carte.once('load', ok))
      carte.addSource('departement', { type: 'geojson', data: contour })
      // Le remplissage laisse deviner le plan dessous ; le trait ferme la forme.
      carte.addLayer({ id: 'departement-fond', type: 'fill', source: 'departement', paint: { 'fill-color': ardoise, 'fill-opacity': 0.86 } })
      carte.addLayer({ id: 'departement-trait', type: 'line', source: 'departement', paint: { 'line-color': ardoise, 'line-width': 2 } })
      await new Promise((ok) => carte.once('idle', ok))
    },
    { style: STYLE, contour, limites: bbox(contour.geometry), ardoise: ARDOISE },
  )
  const fichier = `${d.slug}.jpg`
  await page.locator('#carte').screenshot({ path: join(DOSSIER, fichier), type: 'jpeg', quality: 80 })
  manifeste[d.slug] = `/images/cartes/departements/${fichier}`
  console.log(`✓ ${d.nom}`)
}
await browser.close()

writeFileSync(MANIFESTE, JSON.stringify(manifeste, null, 2) + '\n')
console.log(`${Object.keys(manifeste).length} départements, manifeste écrit`)
