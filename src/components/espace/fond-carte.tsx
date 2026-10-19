'use client'

import { useEffect, useRef } from 'react'
import { Map as MapLibre, setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { styleCarte } from '@/components/map/style'

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

/** Bordeaux, faute de position : le fond reste un plan, jamais un aplat. */
const PAR_DEFAUT: [number, number] = [-0.5792, 44.8378]

/** Le voile de la marque posé sur le plan : forêt en haut et en bas, plus léger au milieu. */
export const VOILE_MARQUE = 'linear-gradient(165deg, rgba(19,78,74,0.78) 0%, rgba(19,78,74,0.30) 50%, rgba(11,31,29,0.82) 100%)'

/**
 * Le fond des visuels de la marque : le plan sombre autour du cabinet, sous
 * le voile vert forêt. Celui des stories, repris pour les paliers et la page
 * Distinctions. Rendu une fois, sans interaction.
 *
 * `largeur` et `hauteur` : taille fixe du plan (MapLibre pose `position:
 * relative` sur son conteneur, la taille doit donc être explicite). Sans
 * elles, le plan suit son cadre. `decalage` : où tombe le lieu dans le cadre,
 * en pixels depuis le centre. `exporter` : garde le dessin pour une capture.
 */
export function FondCarte({
  lon,
  lat,
  zoom = 13.8,
  largeur,
  hauteur,
  decalage,
  exporter = false,
  onPret,
  voile = true,
}: {
  lon: number | null
  lat: number | null
  zoom?: number
  largeur?: number
  hauteur?: number
  decalage?: { x: number; y: number }
  exporter?: boolean
  onPret?: () => void
  voile?: boolean
}) {
  const plan = useRef<HTMLDivElement>(null)
  const pret = useRef(onPret)
  useEffect(() => {
    pret.current = onPret
  })

  useEffect(() => {
    if (!plan.current) return
    const map = new MapLibre({
      container: plan.current,
      style: styleCarte('dark'),
      center: lon !== null && lat !== null ? [lon, lat] : PAR_DEFAUT,
      zoom,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
      pixelRatio: exporter ? 1 : undefined,
      canvasContextAttributes: exporter ? { preserveDrawingBuffer: true } : undefined,
    })
    if (decalage) {
      const dx = decalage.x * 2
      const dy = decalage.y * 2
      map.setPadding({ top: Math.max(0, dy), bottom: Math.max(0, -dy), left: Math.max(0, dx), right: Math.max(0, -dx) })
    }
    const suivi = largeur ? null : new ResizeObserver(() => map.resize())
    suivi?.observe(plan.current)
    map.once('idle', () => pret.current?.())
    return () => {
      suivi?.disconnect()
      map.remove()
    }
  }, [lon, lat, zoom, largeur, hauteur, decalage?.x, decalage?.y, exporter]) // eslint-disable-line react-hooks/exhaustive-deps -- `decalage` par valeur

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0B1F1D]">
      <div ref={plan} style={largeur ? { width: largeur, height: hauteur } : { width: '100%', height: '100%' }} />
      {voile && <div className="absolute inset-0" style={{ background: VOILE_MARQUE }} />}
    </div>
  )
}
