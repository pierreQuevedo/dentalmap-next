'use client'

/**
 * MAQUETTE, à supprimer après arbitrage. Carte des offres d'emploi.
 *
 * Même librairie et même fond de plan que la carte de l'annuaire (MapLibre,
 * style DentalMap clair ou sombre servi depuis `public/maplibre/`), mais sans
 * les tuiles des praticiens : sur une page d'emploi, les seuls points sont les
 * offres. Chaque offre est un marqueur HTML posé à sa position exacte, en bleu
 * « où ? » comme les points de l'annuaire ; l'offre active (survolée ou ouverte) porte une
 * étiquette. Carte inerte par défaut, comme le décor du hero de l'accueil.
 */
import { useEffect, useRef } from 'react'
import { Map as MapLibre, Marker, setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { styleCarte } from '@/components/map/style'
import type { Emprise } from '@/lib/annuaire/emprise'

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

export type PointOffre = { id: string; lon: number; lat: number; etiquette?: string; nombre?: number }

export function CarteOffres({
  emprise,
  points,
  actif,
  className = 'size-full',
  theme,
  interactive = false,
  rayon,
  mention = true,
}: {
  emprise: Emprise
  points: PointOffre[]
  /** Offre active : marqueur agrandi avec son étiquette. */
  actif?: string
  className?: string
  /** Force le fond clair ou sombre ; par défaut, le thème du document. */
  theme?: 'clair' | 'sombre'
  interactive?: boolean
  /** Cercle de distance autour d'un point, en mètres. */
  rayon?: { lon: number; lat: number; metres: number }
  /** Attribution des fonds de plan, due. Absente seulement quand la page l'affiche ailleurs. */
  mention?: boolean
}) {
  const conteneur = useRef<HTMLDivElement>(null)
  const depart = useRef({ emprise, points, actif, theme, interactive, rayon })

  useEffect(() => {
    if (!conteneur.current) return
    const { emprise: e, points: pts, actif: a, theme: t, interactive: inter, rayon: r } = depart.current
    const sombreDoc = document.documentElement.classList.contains('dark')
    const style = styleCarte(t ? (t === 'sombre' ? 'dark' : 'light') : sombreDoc ? 'dark' : 'light')
    const m = new MapLibre({
      container: conteneur.current,
      style,
      bounds: [
        [e.ouest, e.sud],
        [e.est, e.nord],
      ],
      fitBoundsOptions: { padding: 0, animate: false },
      interactive: inter,
      attributionControl: false,
    })

    if (r) {
      m.on('load', () => {
        const pas = 64
        const coords: [number, number][] = []
        for (let i = 0; i <= pas; i++) {
          const ang = (i / pas) * 2 * Math.PI
          const dLat = (r.metres / 111_320) * Math.sin(ang)
          const dLon = ((r.metres / 111_320) * Math.cos(ang)) / Math.cos((r.lat * Math.PI) / 180)
          coords.push([r.lon + dLon, r.lat + dLat])
        }
        m.addSource('rayon', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } } })
        m.addLayer({ id: 'rayon-fond', type: 'fill', source: 'rayon', paint: { 'fill-color': '#0071e3', 'fill-opacity': 0.06 } })
        m.addLayer({ id: 'rayon-bord', type: 'line', source: 'rayon', paint: { 'line-color': '#0071e3', 'line-width': 1.5, 'line-dasharray': [2, 2] } })
      })
    }

    // Sous 600 px de large, les étiquettes se chevauchent : seules restent celle de l'offre active et les grappes.
    const etroit = conteneur.current.clientWidth < 600
    const marqueurs = pts.map((brut) => {
      const el = document.createElement('div')
      const estActif = brut.id === a
      const p = etroit && !estActif ? { ...brut, etiquette: undefined } : brut
      if (p.nombre && p.nombre > 1) {
        el.className =
          'grid size-8 place-items-center rounded-full border-2 border-white bg-[#16222b] text-xs font-semibold text-white shadow-[0_3px_12px_rgb(0_0_0/0.25)]'
        el.textContent = String(p.nombre)
      } else if (estActif && p.etiquette) {
        el.className = 'flex flex-col items-center'
        el.innerHTML = `<span class="whitespace-nowrap rounded-full bg-[#0071e3] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_6px_20px_rgb(0_113_227/0.35)]">${p.etiquette}</span><span class="-mt-px size-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-[#0071e3]"></span><span class="mt-1 size-3.5 rounded-full border-2 border-white bg-[#0071e3] shadow"></span>`
      } else if (p.etiquette) {
        el.className =
          'whitespace-nowrap rounded-full border border-black/5 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#16222b] shadow-[0_3px_12px_rgb(22_34_43/0.18)]'
        el.textContent = p.etiquette
      } else {
        el.className = `rounded-full border-2 border-white bg-[#0071e3] shadow ${estActif ? 'size-5' : 'size-3.5'}`
      }
      return new Marker({ element: el, anchor: estActif && p.etiquette ? 'bottom' : 'center' }).setLngLat([p.lon, p.lat]).addTo(m)
    })

    return () => {
      marqueurs.forEach((mk) => mk.remove())
      m.remove()
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Position en ligne : la feuille de MapLibre pose `position: relative` sur `.maplibregl-map`, ce qui écraserait une classe. */}
      <div ref={conteneur} style={{ position: 'absolute', inset: 0 }} className="[&_.maplibregl-canvas]:outline-none" />
      {mention && (
        <p className="pointer-events-none absolute bottom-2 right-2 z-10 rounded-full bg-white/85 px-2 py-0.5 text-[10px] text-[#5d666d] backdrop-blur">
          © OpenStreetMap, OpenMapTiles, OpenFreeMap
        </p>
      )}
    </div>
  )
}
