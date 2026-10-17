/**
 * Génère `public/images/compte/carte-ouest-clair.svg` et `-sombre.svg`, la
 * carte décorative de l'espace compte : l'ouest et le sud-ouest de la France
 * en carte pointillée, une trame régulière de petits points qui remplit les
 * terres, dans les gris du site, ceux des cartes « Rien de déclaratif » de
 * l'accueil, en clair comme en sombre. Des points, tirés au sort une fois pour toutes, blanchissent
 * lentement puis s'éteignent, chacun à son rythme : plus nombreux et plus
 * blancs là où l'annuaire compte plus de professionnels, d'après les lieux
 * d'exercice de la base. Rien ne bouge quand l'animation est réduite.
 *
 * Un fichier statique plutôt que du SVG dans la page : des milliers de points
 * pèseraient un méga-octet de HTML.
 *
 * Sources : `public/geo/departements.geojson` pour les terres, la base de
 * développement (DATABASE_URL de .env.local, via psql) pour la densité.
 *
 *   node scripts/design/france-svg.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execSync } from 'node:child_process'

const geo = JSON.parse(readFileSync(new URL('../../public/geo/departements.geojson', import.meta.url), 'utf8'))
// Emprise métropolitaine et Corse ; les points hors de là (outre-mer) sont ignorés.
const OUEST = -5.3, EST = 9.8, SUD = 41.2, NORD = 51.2
const TAILLE = 600
const COS = Math.cos(((SUD + NORD) / 2) * (Math.PI / 180))
const largeur = (EST - OUEST) * COS
const hauteur = NORD - SUD
const echelle = TAILLE / Math.max(largeur, hauteur)
const dx = (TAILLE - largeur * echelle) / 2
const dy = (TAILLE - hauteur * echelle) / 2
const projeter = ([lon, lat]) => [((lon - OUEST) * COS) * echelle + dx, (NORD - lat) * echelle + dy]

/** La fenêtre montrée : la moitié ouest de la France, de la Manche aux Pyrénées. */
const FENETRE = { x: 0, y: 70, largeur: 440, hauteur: 540 }
const MARGE = 24
const dedans = ([x, y]) =>
  x >= FENETRE.x - MARGE && x <= FENETRE.x + FENETRE.largeur + MARGE && y >= FENETRE.y - MARGE && y <= FENETRE.y + FENETRE.hauteur + MARGE

// Douglas-Peucker, tolérance en unités du carré.
function simplifier(points, tol) {
  if (points.length < 3) return points
  const d2 = (p, a, b) => {
    const [x, y] = p, [x1, y1] = a, [x2, y2] = b
    const L2 = (x2 - x1) ** 2 + (y2 - y1) ** 2
    if (L2 === 0) return (x - x1) ** 2 + (y - y1) ** 2
    let t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / L2
    t = Math.max(0, Math.min(1, t))
    return (x - (x1 + t * (x2 - x1))) ** 2 + (y - (y1 + t * (y2 - y1))) ** 2
  }
  let max = 0, idx = 0
  for (let i = 1; i < points.length - 1; i++) {
    const d = d2(points[i], points[0], points[points.length - 1])
    if (d > max) { max = d; idx = i }
  }
  if (max > tol * tol) {
    const a = simplifier(points.slice(0, idx + 1), tol)
    const b = simplifier(points.slice(idx), tol)
    return [...a.slice(0, -1), ...b]
  }
  return [points[0], points[points.length - 1]]
}

// Contours : seuls les anneaux qui touchent la fenêtre sont gardés.
const anneaux = []
for (const f of geo.features) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  for (const poly of polys) {
    const ext = poly[0]
    if (ext.some(([lon, lat]) => lon < OUEST || lon > EST || lat < SUD || lat > NORD)) continue
    const pts = ext.map(projeter)
    if (!pts.some(dedans)) continue
    anneaux.push(simplifier(pts, 1.1))
  }
}

/*
 * La trame : un point tous les PAS, là où il y a de la terre. Le test
 * d'appartenance se fait contre chaque anneau de département, en coordonnées
 * projetées, par la règle du nombre de croisements.
 */
const PAS = 2.9
const RAYON = 0.7
function dansAnneau([x, y], anneau) {
  let dedans = false
  for (let i = 0, j = anneau.length - 1; i < anneau.length; j = i++) {
    const [xi, yi] = anneau[i], [xj, yj] = anneau[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dedans = !dedans
  }
  return dedans
}
const boites = anneaux.map((a) => ({
  a,
  minx: Math.min(...a.map((p) => p[0])), maxx: Math.max(...a.map((p) => p[0])),
  miny: Math.min(...a.map((p) => p[1])), maxy: Math.max(...a.map((p) => p[1])),
}))
const surTerre = (p) => boites.some((b) => p[0] >= b.minx && p[0] <= b.maxx && p[1] >= b.miny && p[1] <= b.maxy && dansAnneau(p, b.a))
const trame = []
for (let y = FENETRE.y - MARGE; y <= FENETRE.y + FENETRE.hauteur + MARGE; y += PAS) {
  // Une ligne sur deux est décalée d'un demi-pas : la trame respire au lieu de quadriller.
  const decale = Math.round((y - FENETRE.y) / PAS) % 2 ? PAS / 2 : 0
  for (let x = FENETRE.x - MARGE + decale; x <= FENETRE.x + FENETRE.largeur + MARGE; x += PAS) {
    if (surTerre([x, y])) trame.push([x, y])
  }
}

/*
 * La densité : les lieux d'exercice par commune, lus dans la base, puis pour
 * chaque point de la trame la somme des effectifs à moins de RAYON_DENSITE,
 * rangée dans des cases pour ne pas tout comparer à tout.
 */
const requete = `SELECT ST_X(c.centre), ST_Y(c.centre), count(l.id) FROM communes c JOIN lieux_exercice l ON l.code_insee = c.code_insee WHERE c.centre IS NOT NULL GROUP BY c.code_insee`
const csv = execSync(`set -a; . ./.env.local; set +a; psql "$DATABASE_URL" -Atc "${requete}"`, { encoding: 'utf8', shell: '/bin/zsh' })
const RAYON_DENSITE = 7
const cases = new Map()
const cle = (x, y) => `${Math.floor(x / RAYON_DENSITE)}:${Math.floor(y / RAYON_DENSITE)}`
for (const ligne of csv.trim().split('\n')) {
  const [lon, lat, n] = ligne.split('|').map(Number)
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue
  const [x, y] = projeter([lon, lat])
  const k = cle(x, y)
  cases.set(k, [...(cases.get(k) ?? []), [x, y, n]])
}
const densite = ([x, y]) => {
  let total = 0
  const cx = Math.floor(x / RAYON_DENSITE), cy = Math.floor(y / RAYON_DENSITE)
  for (let i = cx - 1; i <= cx + 1; i++)
    for (let j = cy - 1; j <= cy + 1; j++)
      for (const [px, py, n] of cases.get(`${i}:${j}`) ?? []) if ((px - x) ** 2 + (py - y) ** 2 <= RAYON_DENSITE ** 2) total += n
  return total
}
const densites = trame.map(densite)
const maximum = Math.max(1, ...densites)

// Tirage reproductible, pondéré : la chance de blanchir, et la blancheur, suivent la densité.
let graine = 20261006
const alea = () => ((graine = (graine * 1664525 + 1013904223) % 4294967296) / 4294967296)
const fixes = []
const vifs = []
trame.forEach((p, i) => {
  // Racine de la part du maximum : les zones vides gardent quelques points, les villes en ont beaucoup.
  const part = Math.sqrt(densites[i] / maximum)
  const chance = 0.08 + 0.55 * part
  if (alea() < chance) vifs.push([...p, 0.55 + 0.45 * part])
  else fixes.push(p)
})
/*
 * Les couleurs des deux thèmes, celles des jetons du site : le fond est
 * `--muted`, les points `--muted-foreground`, et un point qui s'allume va
 * vers `--foreground`, blanc cassé en sombre, ardoise en clair.
 */
const THEMES = {
  clair: { fond: '#f5f6f7', point: '#5d666d', vif: '#16222b', repos: 0.4 },
  sombre: { fond: '#161c21', point: '#93a0a8', vif: '#f2f5f7', repos: 0.45 },
}
const DUREE = 11
// Les retards et durées sont tirés une fois, pour que les deux thèmes battent pareil.
const rythmes = vifs.map(() => [alea() * DUREE, DUREE * (0.7 + alea() * 0.6)])
const trameFixe = (t) => `<path stroke="${t.point}" stroke-opacity="${t.repos}" stroke-width="${(RAYON * 2).toFixed(2)}" stroke-linecap="round" fill="none" d="${fixes.map(([x, y]) => `M${x.toFixed(1)} ${y.toFixed(1)}h0`).join('')}"/>`
const cerclesVifs = vifs
  .map(([x, y, pic], i) => `<circle class="b" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${RAYON}" style="--p:${pic.toFixed(2)};animation-delay:-${rythmes[i][0].toFixed(1)}s;animation-duration:${rythmes[i][1].toFixed(1)}s"/>`)
  .join('')

mkdirSync(new URL('../../public/images/compte/', import.meta.url), { recursive: true })
const empreintes = {}
for (const [nom, t] of Object.entries(THEMES)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${FENETRE.x} ${FENETRE.y} ${FENETRE.largeur} ${FENETRE.hauteur}" preserveAspectRatio="xMidYMid slice">
<style>
.b{fill:${t.point};fill-opacity:${t.repos};animation:allumer ${DUREE}s ease-in-out infinite}
@keyframes allumer{0%,100%{fill:${t.point};fill-opacity:${t.repos}}50%{fill:${t.vif};fill-opacity:var(--p,.8)}}
@media (prefers-reduced-motion:reduce){.b{animation:none}}
</style>
<rect x="${FENETRE.x - 200}" y="${FENETRE.y - 200}" width="${FENETRE.largeur + 400}" height="${FENETRE.hauteur + 400}" fill="${t.fond}"/>
${trameFixe(t)}
${cerclesVifs}
</svg>
`
  writeFileSync(new URL(`../../public/images/compte/carte-ouest-${nom}.svg`, import.meta.url), svg)
  // Une empreinte par fichier, ajoutée à son adresse : une nouvelle image n'est jamais servie depuis le cache de l'ancienne.
  empreintes[nom] = createHash('sha256').update(svg).digest('hex').slice(0, 10)
}
writeFileSync(
  new URL('../../src/components/compte/carte-ouest.ts', import.meta.url),
  `/* Généré par scripts/design/france-svg.mjs, ne pas modifier à la main. */\nexport const VERSION_CARTE = ${JSON.stringify(empreintes)} as const\n`,
)
console.log('anneaux', anneaux.length, 'points', trame.length, 'vifs', vifs.length, 'empreintes', empreintes)
