'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Map as MapLibre,
  NavigationControl,
  Popup,
  type GeoJSONSource,
  type MapLayerMouseEvent,
  type MapLibreMap,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

/**
 * Carte des praticiens.
 *
 * Fond de plan OpenFreeMap : tuiles vectorielles issues d'OpenStreetMap,
 * gratuites et sans clé, cohérentes avec le positionnement d'un annuaire qui
 * ne dépend d'aucun fournisseur payant.
 *
 * Les marqueurs sont chargés par emprise à chaque déplacement, regroupés côté
 * client par MapLibre. Charger 62 000 points d'un coup serait inutilisable.
 */
type Marqueur = {
  slug: string
  nom: string
  prenom: string | null
  raisonSociale: string | null
  adresse: string | null
  commune: string
  departement: string
}

const STYLE = 'https://tiles.openfreemap.org/styles/liberty'

export function Carte({
  profession,
  centre,
  zoom = 12,
}: {
  profession: 'dentistes' | 'prothesistes'
  centre: [number, number]
  zoom?: number
}) {
  const conteneur = useRef<HTMLDivElement>(null)
  const carte = useRef<MapLibreMap | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [nombre, setNombre] = useState<number | null>(null)

  useEffect(() => {
    if (!conteneur.current || carte.current) return

    const m = new MapLibre({
      container: conteneur.current,
      style: STYLE,
      center: centre,
      zoom,
      attributionControl: { compact: true },
    })
    carte.current = m
    m.addControl(new NavigationControl({ showCompass: false }), 'top-right')

    let annule = false

    const charger = async () => {
      const b = m.getBounds()
      const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((n) => n.toFixed(5)).join(',')
      try {
        const res = await fetch(`/api/geo/markers/?profession=${profession}&bbox=${bbox}`)
        if (!res.ok) throw new Error(`marqueurs ${res.status}`)
        const geojson = await res.json()
        if (annule) return
        setNombre(geojson.features.length)
        const source = m.getSource('praticiens') as GeoJSONSource | undefined
        if (source) source.setData(geojson)
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'chargement impossible')
      }
    }

    m.on('load', () => {
      m.addSource('praticiens', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 45,
      })

      m.addLayer({
        id: 'grappes',
        type: 'circle',
        source: 'praticiens',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#1e293b',
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 30],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })
      m.addLayer({
        id: 'grappes-nombre',
        type: 'symbol',
        source: 'praticiens',
        filter: ['has', 'point_count'],
        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 },
        paint: { 'text-color': '#ffffff' },
      })
      m.addLayer({
        id: 'points',
        type: 'circle',
        source: 'praticiens',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#0f766e',
          'circle-radius': 7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

      m.on('click', 'points', (e: MapLayerMouseEvent) => {
        const f = e.features?.[0]
        if (!f) return
        const p = f.properties as unknown as Marqueur
        const nom = p.raisonSociale || [p.prenom, p.nom].filter(Boolean).join(' ')
        const href = `/${profession}/${p.departement}/${p.commune}/${p.slug}/`
        new Popup({ offset: 12, closeButton: false })
          .setLngLat((f.geometry as GeoJSON.Point).coordinates as [number, number])
          .setHTML(
            `<div style="font:14px system-ui"><strong>${escapeHtml(nom)}</strong>` +
              (p.adresse ? `<br><span style="color:#475569">${escapeHtml(p.adresse)}</span>` : '') +
              `<br><a href="${href}" style="color:#0f766e">Voir la fiche</a></div>`,
          )
          .addTo(m)
      })
      m.on('mouseenter', 'points', () => (m.getCanvas().style.cursor = 'pointer'))
      m.on('mouseleave', 'points', () => (m.getCanvas().style.cursor = ''))
      m.on('click', 'grappes', (e: MapLayerMouseEvent) => {
        const f = m.queryRenderedFeatures(e.point, { layers: ['grappes'] })[0]
        if (f) m.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom: m.getZoom() + 2 })
      })

      void charger()
      m.on('moveend', () => void charger())
    })

    return () => {
      annule = true
      m.remove()
      carte.current = null
    }
  }, [profession, centre, zoom])

  return (
    <div className="relative">
      <div ref={conteneur} className="h-[420px] w-full rounded-lg border border-slate-200 lg:h-[600px]" />
      {erreur && (
        <p className="absolute left-3 top-3 rounded bg-red-50 px-3 py-1.5 text-sm text-red-800 ring-1 ring-red-200">
          Carte indisponible : {erreur}
        </p>
      )}
      {nombre !== null && !erreur && (
        <p className="absolute left-3 top-3 rounded bg-white/90 px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200">
          {nombre} sur la carte
        </p>
      )}
    </div>
  )
}

function escapeHtml(v: string): string {
  return v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}
