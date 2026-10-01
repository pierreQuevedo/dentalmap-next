'use client'

import { useEffect, useRef } from 'react'
import { LngLatBounds, Map as MapLibre, Marker, NavigationControl, setWorkerUrl, type MapLibreMap } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTheme } from 'next-themes'
import { styleCarte, styleCarteInitial } from '@/components/map/style'

/**
 * Carte des lieux d'un établissement de formation : ses sites et, pour une
 * faculté, les centres de soins où les étudiants exercent.
 *
 * Même fond de plan que l'annuaire, sans les praticiens. Les lieux sont des
 * marqueurs HTML avec leur nom, puisqu'ils se comptent sur les doigts d'une
 * main : pas de couche vectorielle ni de grappes. La molette ne zoome pas,
 * pour que la carte ne capture pas le défilement de la page.
 */
export type PointFaculte = { cle: string; nom: string; lon: number; lat: number; role: 'etablissement' | 'soins' }

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

function marqueur(p: PointFaculte): HTMLElement {
  const hote = document.createElement('div')
  hote.className = 'flex flex-col items-center'
  const etiquette = document.createElement('span')
  etiquette.className = `squircle-full mb-1.5 max-w-[14rem] truncate border px-2.5 py-1 text-xs font-medium shadow-pop ${
    p.role === 'etablissement' ? 'border-teal bg-teal text-white' : 'border-line bg-bg text-fg'
  }`
  etiquette.textContent = p.nom
  const point = document.createElement('span')
  point.className = `block rounded-full border-2 border-bg shadow ${p.role === 'etablissement' ? 'size-4 bg-teal' : 'size-3 bg-fg'}`
  hote.append(etiquette, point)
  return hote
}

export function CarteFaculte({ points }: { points: PointFaculte[] }) {
  const conteneur = useRef<HTMLDivElement>(null)
  const carte = useRef<MapLibreMap | null>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!conteneur.current || carte.current || points.length === 0) return
    const limites = points.reduce((b, p) => b.extend([p.lon, p.lat]), new LngLatBounds([points[0]!.lon, points[0]!.lat], [points[0]!.lon, points[0]!.lat]))
    const m = new MapLibre({
      container: conteneur.current,
      style: styleCarteInitial(),
      bounds: limites,
      fitBoundsOptions: { padding: { top: 64, right: 56, bottom: 40, left: 56 }, maxZoom: 14.5, animate: false },
      attributionControl: { compact: true },
      scrollZoom: false,
      dragRotate: false,
    })
    carte.current = m
    m.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    // La faculté est ajoutée en dernier pour passer au-dessus des centres.
    for (const p of [...points].sort((a) => (a.role === 'etablissement' ? 1 : -1))) {
      new Marker({ element: marqueur(p), anchor: 'bottom' }).setLngLat([p.lon, p.lat]).addTo(m)
    }
    return () => {
      m.remove()
      carte.current = null
    }
  }, [points])

  const styleCourant = useRef<string | null>(null)
  useEffect(() => {
    const m = carte.current
    if (!m || !resolvedTheme) return
    const url = styleCarte(resolvedTheme)
    if (styleCourant.current === null) {
      styleCourant.current = url
      return
    }
    if (styleCourant.current === url) return
    styleCourant.current = url
    m.setStyle(url)
  }, [resolvedTheme])

  return <div ref={conteneur} className="size-full" />
}
