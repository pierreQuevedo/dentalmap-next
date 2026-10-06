/**
 * Génère `public/images/compte/carte-ouest.svg`, la carte décorative de
 * l'espace compte : l'ouest et le sud-ouest de la France par départements,
 * en filet clair sur ardoise, semés de tous les lieux d'exercice de
 * l'annuaire, et des trajets qui se tracent d'une ville à l'autre.
 *
 * Un fichier statique plutôt que du SVG dans la page : trois mille points
 * pèseraient un méga-octet de HTML. Les styles et les animations sont dans le
 * fichier, un navigateur les joue dans une image ; rien ne bouge quand
 * l'animation est réduite.
 *
 * Sources : `public/geo/departements.geojson` pour les contours, la base de
 * développement (DATABASE_URL de .env.local, via psql) pour les points.
 *
 *   node scripts/design/france-svg.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
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
const contours = anneaux.map((pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z').join('')

// Points : un par commune où l'annuaire a au moins un lieu d'exercice.
const requete = `SELECT ST_X(c.centre), ST_Y(c.centre), count(l.id) FROM communes c JOIN lieux_exercice l ON l.code_insee = c.code_insee WHERE c.centre IS NOT NULL GROUP BY c.code_insee`
const csv = execSync(`set -a; . ./.env.local; set +a; psql "$DATABASE_URL" -Atc "${requete}"`, { encoding: 'utf8', shell: '/bin/zsh' })
const points = []
for (const ligne of csv.trim().split('\n')) {
  const [lon, lat, n] = ligne.split('|').map(Number)
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue
  const p = projeter([lon, lat])
  if (dedans(p)) points.push([p[0], p[1], n])
}
points.sort((a, b) => b[2] - a[2])

/** Rayon selon l'effectif : les grandes villes se voient, les villages restent des grains. */
const rayon = (n) => Math.min(2.6, 0.5 + Math.sqrt(n) * 0.22)
/*
 * Les points sont des traits de longueur nulle à bouts ronds : un chemin par
 * rayon, « M x y h0 » par point, douze octets au lieu de cinquante pour un
 * arc. L'opacité suit l'effectif, comme la taille.
 */
const opacite = (n) => (n > 20 ? 0.95 : n > 4 ? 0.7 : 0.42)
const groupes = new Map()
for (const [x, y, n] of points) {
  const cle = `${rayon(n).toFixed(1)}|${opacite(n)}`
  groupes.set(cle, (groupes.get(cle) ?? '') + `M${x.toFixed(1)} ${y.toFixed(1)}h0`)
}
const cheminsPoints = [...groupes.entries()].map(([cle, d]) => {
  const [r, o] = cle.split('|')
  return `<path stroke="#2fd1d1" stroke-opacity="${o}" stroke-width="${(Number(r) * 2).toFixed(1)}" stroke-linecap="round" fill="none" d="${d}"/>`
})
// Un point sur vingt-trois bat, pris parmi les plus gros : une activité, pas un sapin.
const battements = points
  .filter((_, i) => i % 23 === 0)
  .slice(0, 60)
  .map(([x, y, n], i) => `<circle class="bat" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rayon(n).toFixed(2)}" style="animation-delay:${(i * 0.37).toFixed(2)}s"/>`)
  .join('')

// Trajets entre grandes villes de la fenêtre.
const VILLES = {
  bordeaux: [-0.5792, 44.8378], nantes: [-1.5536, 47.2184], toulouse: [1.4442, 43.6047], rennes: [-1.6778, 48.1173],
  brest: [-4.4861, 48.3904], larochelle: [-1.1511, 46.1603], limoges: [1.2611, 45.8336],
}
const villes = Object.fromEntries(Object.entries(VILLES).map(([k, v]) => [k, projeter(v)]))
const TRAJETS = [['rennes', 'bordeaux'], ['toulouse', 'nantes'], ['brest', 'larochelle'], ['nantes', 'toulouse'], ['bordeaux', 'limoges'], ['larochelle', 'rennes']]
const DUREE = 6.7
const courbe = (a, b) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ddx = b[0] - a[0], ddy = b[1] - a[1], k = 0.22
  return `M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${(mx - ddy * k).toFixed(1)} ${(my + ddx * k).toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`
}
const trajets = TRAJETS.map(([de, vers], i) => {
  const d = courbe(villes[de], villes[vers])
  const delai = `animation-delay:${((i * DUREE) / TRAJETS.length).toFixed(2)}s`
  const [x, y] = villes[vers]
  return `<path class="trajet lueur" d="${d}" pathLength="1" style="${delai}" filter="url(#lueur)"/><path class="trajet" d="${d}" pathLength="1" style="${delai}"/><circle class="arrivee" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" style="${delai}"/>`
}).join('')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${FENETRE.x} ${FENETRE.y} ${FENETRE.largeur} ${FENETRE.hauteur}" preserveAspectRatio="xMidYMid slice">
<style>
.trajet{fill:none;stroke:#2fd1d1;stroke-width:1.5;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;opacity:0;animation:trace ${DUREE}s ease-in-out infinite}
.lueur{stroke-width:4}
.arrivee{fill:#2fd1d1;opacity:0;transform-box:fill-box;transform-origin:center;animation:arrivee ${DUREE}s ease-out infinite}
.bat{fill:#2fd1d1;opacity:.8;transform-box:fill-box;transform-origin:center;animation:bat 5.4s ease-in-out infinite}
@keyframes trace{0%{stroke-dashoffset:1;opacity:0}8%{opacity:1}42%{stroke-dashoffset:0;opacity:1}58%{stroke-dashoffset:0;opacity:1}72%,100%{stroke-dashoffset:0;opacity:0}}
@keyframes arrivee{0%,38%{opacity:0;transform:scale(.4)}46%{opacity:1;transform:scale(1.6)}58%{opacity:.9;transform:scale(1)}72%,100%{opacity:0;transform:scale(1)}}
@keyframes bat{0%,70%,100%{transform:scale(1);opacity:.8}80%{transform:scale(2.6);opacity:1}90%{transform:scale(1.2);opacity:.85}}
@media (prefers-reduced-motion:reduce){.trajet,.lueur{animation:none;stroke-dashoffset:0;opacity:.7}.arrivee{animation:none;opacity:.8}.bat{animation:none}}
</style>
<defs>
<radialGradient id="halo" cx="45%" cy="50%" r="55%"><stop offset="0" stop-color="#2fd1d1" stop-opacity=".16"/><stop offset="1" stop-color="#2fd1d1" stop-opacity="0"/></radialGradient>
<filter id="lueur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>
</defs>
<rect x="${FENETRE.x - 200}" y="${FENETRE.y - 200}" width="${FENETRE.largeur + 400}" height="${FENETRE.hauteur + 400}" fill="#16222b"/>
<rect x="${FENETRE.x}" y="${FENETRE.y}" width="${FENETRE.largeur}" height="${FENETRE.hauteur}" fill="url(#halo)"/>
<path d="${contours}" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.22)" stroke-width=".5" stroke-linejoin="round"/>
${cheminsPoints.join('\n')}
${battements}
${trajets}
</svg>
`
mkdirSync(new URL('../../public/images/compte/', import.meta.url), { recursive: true })
writeFileSync(new URL('../../public/images/compte/carte-ouest.svg', import.meta.url), svg)
console.log('anneaux', anneaux.length, 'points', points.length, 'octets', svg.length)
