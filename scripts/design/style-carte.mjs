/**
 * Génère le style de carte DentalMap, clair et sombre, à partir du style
 * « positron » d'OpenFreeMap : mêmes sources, mêmes glyphes, même sprite,
 * mais les couleurs du site. Le résultat est écrit dans `public/maplibre/`
 * et servi tel quel ; relancer ce script quand la palette change.
 *
 * Usage : node scripts/design/style-carte.mjs
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SOURCE = 'https://tiles.openfreemap.org/styles/positron'
const DOSSIER = join(process.cwd(), 'public', 'maplibre')

const PALETTES = {
  clair: {
    fond: '#f3f5f6',
    terre: '#f3f5f6',
    residentiel: '#eceff1',
    parc: '#dfe9e3',
    bois: '#d7e3dc',
    eau: '#c9dfdf',
    batiment: '#e2e7ea',
    routeInterieur: '#ffffff',
    routeBordure: '#d5dcdf',
    routeMineure: '#f9fafb',
    chemin: '#e6ebee',
    rail: '#cfd6da',
    frontiere: '#b8c3c9',
    texte: '#16222b',
    texteSecondaire: '#5b6770',
    texteEau: '#0b8484',
    halo: '#f3f5f6',
    aeroport: '#e6ebee',
  },
  sombre: {
    fond: '#16222b',
    terre: '#16222b',
    residentiel: '#1a2730',
    parc: '#1b2d2f',
    bois: '#182a2b',
    eau: '#0f2b2f',
    batiment: '#1e2c34',
    routeInterieur: '#2b3b43',
    routeBordure: '#16222b',
    routeMineure: '#243239',
    chemin: '#223037',
    rail: '#33434b',
    frontiere: '#3d4f58',
    texte: '#e6ecef',
    texteSecondaire: '#9aa8b0',
    texteEau: '#5fb8b8',
    halo: '#16222b',
    aeroport: '#223037',
  },
}

/** Couleur d'une couche selon son identifiant et la propriété, ou `undefined` pour laisser positron. */
function couleur(id, propriete, p) {
  const est = (...prefixes) => prefixes.some((x) => id === x || id.startsWith(x))
  if (id === 'background') return p.fond
  if (est('park')) return p.parc
  if (est('landcover_wood')) return p.bois
  if (est('landcover_')) return p.terre
  if (est('landuse_residential')) return p.residentiel
  if (est('water', 'waterway') && !id.includes('label')) return p.eau
  if (est('building')) return propriete === 'fill-outline-color' ? p.batiment : p.batiment
  if (est('aeroway-area')) return p.aeroport
  if (est('aeroway')) return p.routeInterieur
  if (est('road_area_pier', 'road_pier')) return p.terre
  if (est('highway_path')) return p.chemin
  if (est('highway_minor')) return p.routeMineure
  if (id.includes('casing')) return p.routeBordure
  if (id.includes('subtle')) return p.routeBordure
  if (est('highway_', 'tunnel_')) return p.routeInterieur
  if (est('railway')) return p.rail
  if (est('boundary')) return p.frontiere
  return undefined
}

const positron = await (await fetch(SOURCE)).json()

for (const [nom, p] of Object.entries(PALETTES)) {
  const style = structuredClone(positron)
  style.name = `DentalMap ${nom}`
  // Le relief ombré n'est utilisé par aucune couche de positron : on ne le garde pas.
  delete style.sources.ne2_shaded
  style.layers = style.layers.filter((l) => l.source !== 'ne2_shaded')

  for (const l of style.layers) {
    l.paint = l.paint ?? {}
    if (l.type === 'symbol') {
      const eau = l.id.startsWith('water') || l.id.startsWith('waterway')
      const route = l.id.startsWith('highway-name')
      l.paint['text-color'] = eau ? p.texteEau : route ? p.texteSecondaire : p.texte
      l.paint['text-halo-color'] = p.halo
      l.paint['text-halo-width'] = l.id.startsWith('label_') ? 1.4 : 1
      if (l.paint['icon-color']) l.paint['icon-color'] = p.texteSecondaire
      continue
    }
    for (const propriete of Object.keys(l.paint)) {
      if (!propriete.endsWith('-color')) continue
      const c = couleur(l.id, propriete, p)
      if (c) l.paint[propriete] = c
    }
    // Les couches de fond sans couleur explicite prennent la leur.
    if (l.type === 'fill' && !l.paint['fill-color']) l.paint['fill-color'] = couleur(l.id, 'fill-color', p) ?? p.terre
    if (l.type === 'line' && !l.paint['line-color']) l.paint['line-color'] = couleur(l.id, 'line-color', p) ?? p.routeBordure
  }

  const chemin = join(DOSSIER, `dentalmap-${nom}.json`)
  writeFileSync(chemin, JSON.stringify(style))
  console.log(`${chemin} : ${style.layers.length} couches`)
}
