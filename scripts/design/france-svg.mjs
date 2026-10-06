/**
 * Génère `public/images/compte/carte-ouest.svg`, la carte décorative de
 * l'espace compte : l'ouest et le sud-ouest de la France en carte pointillée,
 * une trame régulière de petits points qui remplit les terres, dans les gris
 * ardoise du site. Rien ne bouge.
 *
 * Un fichier statique plutôt que du SVG dans la page : des milliers de points
 * pèseraient un méga-octet de HTML.
 *
 * Source : `public/geo/departements.geojson` pour les terres.
 *
 *   node scripts/design/france-svg.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

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

/** La fenêtre montrée : l'ouest et le sud-ouest, de la Bretagne aux Pyrénées. */
const FENETRE = { x: 0, y: 130, largeur: 330, hauteur: 450 }
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
const PAS = 3.2
const RAYON = 0.85
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

// Les gris du thème sombre du site : l'ardoise des grappes en fond, le gris des textes secondaires pour les points.
const ARDOISE = '#16222b'
const POINT = '#93a0a8'
const cheminTrame = `<path stroke="${POINT}" stroke-opacity="0.5" stroke-width="${(RAYON * 2).toFixed(2)}" stroke-linecap="round" fill="none" d="${trame.map(([x, y]) => `M${x.toFixed(1)} ${y.toFixed(1)}h0`).join('')}"/>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${FENETRE.x} ${FENETRE.y} ${FENETRE.largeur} ${FENETRE.hauteur}" preserveAspectRatio="xMidYMid slice">
<rect x="${FENETRE.x - 200}" y="${FENETRE.y - 200}" width="${FENETRE.largeur + 400}" height="${FENETRE.hauteur + 400}" fill="${ARDOISE}"/>
${cheminTrame}
</svg>
`
mkdirSync(new URL('../../public/images/compte/', import.meta.url), { recursive: true })
writeFileSync(new URL('../../public/images/compte/carte-ouest.svg', import.meta.url), svg)
console.log('anneaux', anneaux.length, 'points', trame.length, 'octets', svg.length)
