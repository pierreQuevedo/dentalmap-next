'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Map as MapLibre, NavigationControl, setWorkerUrl, type MapLayerMouseEvent, type MapLibreMap } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTheme } from 'next-themes'
import { chemin } from '@/lib/navigation'
import { EMPRISE_FRANCE } from '@/lib/annuaire/emprise'
import type { BaseUrl } from '@/lib/annuaire/types'
import { styleCarte, styleCarteInitial } from './style'

/**
 * Carte de France par département.
 *
 * Même fond de plan que la carte des praticiens, mais sans leurs points : les
 * départements sont dessinés en zones, teintées selon leur effectif. Le
 * survol détache le département, l'entoure et affiche son nom et son nombre
 * de praticiens ; le clic mène à sa page. Les contours viennent de
 * `public/geo/departements.geojson`, l'effectif de la base, rapproché par
 * le code du département.
 *
 * Les départements d'outre-mer n'ont pas de contour dans ce fichier : ils
 * restent atteignables par la liste à gauche.
 */
const SOURCE = 'departements'
const TEAL = '#0b8484'
const ARDOISE = '#16222b'

// Même worker que la carte des praticiens, servi depuis `public/` : voir `carte.tsx`.
setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

export type CompteDepartement = { code: string; nom: string; slug: string; total: number }

export function CarteDepartements({ base, comptes }: { base: BaseUrl; comptes: CompteDepartement[] }) {
  const conteneur = useRef<HTMLDivElement>(null)
  const carte = useRef<MapLibreMap | null>(null)
  const router = useRouter()
  const [survol, setSurvol] = useState<{ nom: string; total: number; x: number; y: number } | null>(null)
  const parCode = useRef(new Map(comptes.map((c) => [c.code, c])))
  const routeur = useRef(router)
  const { resolvedTheme } = useTheme()
  useEffect(() => {
    parCode.current = new Map(comptes.map((c) => [c.code, c]))
    routeur.current = router
  }, [comptes, router])

  useEffect(() => {
    if (!conteneur.current || carte.current) return
    const m = new MapLibre({
      container: conteneur.current,
      style: styleCarteInitial(),
      bounds: [
        [EMPRISE_FRANCE.ouest, EMPRISE_FRANCE.sud],
        [EMPRISE_FRANCE.est, EMPRISE_FRANCE.nord],
      ],
      fitBoundsOptions: { padding: 12, animate: false },
      attributionControl: { compact: true },
    })
    carte.current = m
    m.addControl(new NavigationControl({ showCompass: false }), 'top-right')

    let survole: string | number | undefined

    // Les contours ne sont lus qu'une fois ; les couches sont rajoutées à
    // chaque chargement de style, donc à chaque changement de thème.
    const contoursPromis = fetch('/geo/departements.geojson')
      .then((r) => r.json() as Promise<GeoJSON.FeatureCollection<GeoJSON.Geometry, { code: string; nom: string; total?: number; part?: number }>>)
      .then((contours) => {
        // L'effectif entre dans les propriétés : c'est lui qui teinte la zone.
        const maximum = Math.max(1, ...[...parCode.current.values()].map((c) => c.total))
        for (const f of contours.features) {
          const compte = parCode.current.get(f.properties.code)
          f.properties = { ...f.properties, total: compte?.total ?? 0, part: (compte?.total ?? 0) / maximum }
        }
        return contours
      })

    m.on('style.load', async () => {
      const contours = await contoursPromis
      if (m.getSource(SOURCE)) return
      m.addSource(SOURCE, { type: 'geojson', data: contours, promoteId: 'code' })
      m.addLayer({
        id: 'zones',
        type: 'fill',
        source: SOURCE,
        paint: {
          'fill-color': TEAL,
          // Du presque transparent au tiers d'opacité selon l'effectif, et
          // plus soutenu au survol.
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'survol'], false],
            0.55,
            ['interpolate', ['linear'], ['get', 'part'], 0, 0.06, 1, 0.38],
          ],
        },
      })
      m.addLayer({
        id: 'contours',
        type: 'line',
        source: SOURCE,
        paint: {
          'line-color': ['case', ['boolean', ['feature-state', 'survol'], false], ARDOISE, TEAL],
          'line-width': ['case', ['boolean', ['feature-state', 'survol'], false], 2.5, 0.8],
          'line-opacity': 0.9,
        },
      })
    })

    m.on('load', () => {
      m.on('mousemove', 'zones', (ev: MapLayerMouseEvent) => {
        const f = ev.features?.[0]
        if (!f) return
        const code = f.properties?.code as string
        if (survole !== undefined && survole !== code) m.setFeatureState({ source: SOURCE, id: survole }, { survol: false })
        survole = code
        m.setFeatureState({ source: SOURCE, id: code }, { survol: true })
        m.getCanvas().style.cursor = 'pointer'
        const compte = parCode.current.get(code)
        setSurvol({ nom: compte?.nom ?? (f.properties?.nom as string), total: compte?.total ?? 0, x: ev.point.x, y: ev.point.y })
      })
      m.on('mouseleave', 'zones', () => {
        if (survole !== undefined) m.setFeatureState({ source: SOURCE, id: survole }, { survol: false })
        survole = undefined
        m.getCanvas().style.cursor = ''
        setSurvol(null)
      })
      m.on('click', 'zones', (ev: MapLayerMouseEvent) => {
        const code = ev.features?.[0]?.properties?.code as string | undefined
        const compte = code ? parCode.current.get(code) : undefined
        if (compte) routeur.current.push(chemin(`/${base}/${compte.slug}/`))
      })
    })

    return () => {
      m.remove()
      carte.current = null
    }
  }, [base])

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

  return (
    <div className="relative h-full">
      <div ref={conteneur} className="size-full" />
      {survol && (
        <div
          role="status"
          className="squircle-lg pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)] whitespace-nowrap border border-line bg-bg px-3 py-2 shadow-pop"
          style={{ left: survol.x, top: survol.y }}
        >
          <p className="text-sm font-semibold text-fg">{survol.nom}</p>
          <p className="text-xs text-fg-2">
            {survol.total > 0 ? `${survol.total.toLocaleString('fr-FR')} ${survol.total > 1 ? 'professionnels' : 'professionnel'}` : 'Aucun professionnel recensé'}
          </p>
        </div>
      )}
    </div>
  )
}
