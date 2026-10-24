'use client'

import { useEffect, useRef } from 'react'
import { LngLatBounds, Map as MapLibre, Marker, setWorkerUrl, type GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { styleCarteInitial } from '@/components/map/style'

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

/** Un cercle de `km` autour d'un point, en 64 sommets : la zone desservie. */
function cercle(lon: number, lat: number, km: number): [number, number][] {
  const pas = 64
  const dLat = km / 110.574
  const dLon = km / (111.32 * Math.cos((lat * Math.PI) / 180))
  return Array.from({ length: pas + 1 }, (_, i) => {
    const a = (i / pas) * 2 * Math.PI
    return [lon + dLon * Math.cos(a), lat + dLat * Math.sin(a)]
  })
}

const geojson = (lon: number, lat: number, km: number) => ({
  type: 'Feature' as const,
  properties: {},
  geometry: { type: 'Polygon' as const, coordinates: [cercle(lon, lat, km)] },
})

/**
 * La zone desservie sur le plan : le laboratoire au centre, le cercle du
 * rayon qui suit le curseur, le cadrage qui s'ajuste. Sans position connue,
 * rien n'est affiché.
 */
export function CarteRayon({ lon, lat, km }: { lon: number; lat: number; km: number }) {
  const conteneur = useRef<HTMLDivElement>(null)
  const carte = useRef<MapLibre | null>(null)
  const kmCourant = useRef(km)

  const cadrer = (m: MapLibre, rayon: number) => {
    const b = new LngLatBounds()
    for (const p of cercle(lon, lat, rayon)) b.extend(p)
    m.fitBounds(b, { padding: 24, duration: 300 })
  }

  useEffect(() => {
    if (!conteneur.current) return
    const m = new MapLibre({ container: conteneur.current, style: styleCarteInitial(), center: [lon, lat], zoom: 8, interactive: false, attributionControl: { compact: true } })
    carte.current = m
    new Marker({ color: '#0B8484' }).setLngLat([lon, lat]).addTo(m)
    m.on('load', () => {
      m.addSource('rayon', { type: 'geojson', data: geojson(lon, lat, kmCourant.current) })
      m.addLayer({ id: 'rayon-fond', type: 'fill', source: 'rayon', paint: { 'fill-color': '#0B8484', 'fill-opacity': 0.12 } })
      m.addLayer({ id: 'rayon-bord', type: 'line', source: 'rayon', paint: { 'line-color': '#0B8484', 'line-width': 2 } })
      cadrer(m, kmCourant.current)
    })
    return () => {
      m.remove()
      carte.current = null
    }
    // La carte se crée une fois par lieu ; le rayon se met à jour à part.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lon, lat])

  useEffect(() => {
    kmCourant.current = km
    const m = carte.current
    const source = m?.getSource('rayon') as GeoJSONSource | undefined
    if (!m || !source) return
    source.setData(geojson(lon, lat, km))
    cadrer(m, km)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [km])

  return <div ref={conteneur} className="squircle-xl mt-3 h-44 w-full overflow-hidden ring-1 ring-line" aria-label={`Zone desservie : ${km} km autour du laboratoire`} role="img" />
}
