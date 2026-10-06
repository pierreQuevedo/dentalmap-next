/**
 * Génère `src/components/compte/france.ts` : les contours des départements en
 * chemin SVG, projetés dans un carré de 600 unités, pour la carte décorative
 * de l'espace compte. Source : `public/geo/departements.geojson`.
 *
 *   node scripts/design/france-svg.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

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
export const projeter = ([lon, lat]) => [((lon - OUEST) * COS) * echelle + dx, (NORD - lat) * echelle + dy]

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

const anneaux = []
for (const f of geo.features) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  for (const poly of polys) {
    const ext = poly[0]
    if (ext.some(([lon, lat]) => lon < OUEST || lon > EST || lat < SUD || lat > NORD)) continue
    anneaux.push(simplifier(ext.map(projeter), 1.4))
  }
}
const chemin = anneaux
  .map((pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z')
  .join('')

const VILLES = {
  paris: [2.3522, 48.8566], lyon: [4.8357, 45.764], marseille: [5.3698, 43.2965], bordeaux: [-0.5792, 44.8378],
  lille: [3.0573, 50.6292], nantes: [-1.5536, 47.2184], strasbourg: [7.7521, 48.5734], toulouse: [1.4442, 43.6047],
  rennes: [-1.6778, 48.1173], montpellier: [3.8767, 43.6108], nice: [7.262, 43.7102], brest: [-4.4861, 48.3904],
}
const villes = Object.fromEntries(Object.entries(VILLES).map(([k, v]) => [k, projeter(v).map((n) => Number(n.toFixed(1)))]))

writeFileSync(
  new URL('../../src/components/compte/france.ts', import.meta.url),
  `/* Généré par scripts/design/france-svg.mjs, ne pas modifier à la main. */\n` +
    `export const TAILLE = ${TAILLE}\n` +
    `/** Contours des départements métropolitains, projetés dans le carré. */\n` +
    `export const DEPARTEMENTS = ${JSON.stringify(chemin)}\n` +
    `/** Quelques grandes villes, aux mêmes coordonnées. */\n` +
    `export const VILLES: Record<string, [number, number]> = ${JSON.stringify(villes)}\n`,
)
console.log('anneaux', anneaux.length, 'longueur', chemin.length)
