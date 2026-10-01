/**
 * Génère une vignette de carte par grande ville pour les cartes de l'accueil.
 *
 * La carte est rendue avec MapLibre dans un navigateur sans tête, sur le
 * fond de plan « positron » d'OpenFreeMap, un plan clair en gris, sans
 * couleur : c'est l'ardoise du site, inversée. Le centre de chaque commune
 * vient de la base, jamais d'une coordonnée écrite ici.
 *
 * Sortie : `public/images/cartes/{slug}.jpg` et le manifeste
 * `src/lib/annuaire/images-cartes.json`. Les données sont OpenStreetMap et
 * OpenMapTiles, dont l'attribution est due partout où ces images s'affichent.
 *
 *   pnpm exec dotenv -e .env.local -- node scripts/design/cartes-villes.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { neon } from '@neondatabase/serverless'
import { chromium } from 'playwright'

const SLUGS = ['paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes', 'montpellier', 'strasbourg', 'bordeaux', 'lille', 'rennes', 'toulon', 'meaux']
const STYLE = 'https://tiles.openfreemap.org/styles/positron'
const LARGEUR = 800
const HAUTEUR = 600
const ZOOM = 12.6
const DOSSIER = join(process.cwd(), 'public', 'images', 'cartes')
const MANIFESTE = join(process.cwd(), 'src', 'lib', 'annuaire', 'images-cartes.json')

const sql = neon(process.env.DATABASE_URL)
const communes = await sql`
  SELECT slug, nom, population, ST_X(centre) AS lon, ST_Y(centre) AS lat
  FROM communes WHERE type = 'commune' AND slug = ANY(${SLUGS}) AND centre IS NOT NULL
  ORDER BY population DESC NULLS LAST
`
// Plusieurs communes portent le même slug dans des départements différents ;
// on garde la plus peuplée, qui est la grande ville attendue.
const parSlug = new Map()
for (const c of communes) if (!parSlug.has(c.slug)) parSlug.set(c.slug, c)

mkdirSync(DOSSIER, { recursive: true })
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: LARGEUR, height: HAUTEUR }, deviceScaleFactor: 1 })

/*
 * MapLibre 6 n'existe qu'en modules ES, avec un module partagé importé par le
 * bundle et par le worker : un fichier local ne suffit pas, il faut une
 * origine HTTP. Une fausse origine est servie ici depuis node_modules, sans
 * serveur.
 */
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
for (const slug of SLUGS) {
  const c = parSlug.get(slug)
  if (!c) {
    console.log(`✗ ${slug} : commune introuvable`)
    continue
  }
  await page.evaluate(
    async ({ style, lon, lat, zoom }) => {
      // `window.carte` désignerait le <div id="carte"> lui-même : un autre nom.
      if (window.__carte) window.__carte.remove()
      const carte = new window.maplibregl.Map({
        container: 'carte',
        style,
        center: [lon, lat],
        zoom,
        interactive: false,
        attributionControl: false,
        preserveDrawingBuffer: true,
      })
      window.__carte = carte
      await new Promise((ok) => carte.once('idle', ok))
    },
    { style: STYLE, lon: Number(c.lon), lat: Number(c.lat), zoom: ZOOM },
  )
  // JPEG : trois fois plus léger que le PNG pour un plan sans transparence.
  const fichier = `${slug}.jpg`
  await page.locator('#carte').screenshot({ path: join(DOSSIER, fichier), type: 'jpeg', quality: 80 })
  manifeste[slug] = `/images/cartes/${fichier}`
  console.log(`✓ ${c.nom}`)
}
await browser.close()

writeFileSync(MANIFESTE, JSON.stringify(manifeste, null, 2) + '\n')
writeFileSync(
  join(DOSSIER, 'CREDITS.md'),
  '# Vignettes de cartes\n\nRendues par `scripts/design/cartes-villes.mjs` avec MapLibre sur le style « positron » d’OpenFreeMap.\nDonnées © OpenStreetMap contributors, © OpenMapTiles. L’attribution doit rester visible là où ces images sont affichées.\n',
)
console.log(`${Object.keys(manifeste).length} cartes, manifeste écrit`)
