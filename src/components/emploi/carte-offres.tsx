'use client'

/**
 * Carte des offres d'emploi.
 *
 * Même librairie et même fond de plan que la carte de l'annuaire (MapLibre,
 * style DentalMap clair ou sombre servi depuis `public/maplibre/`), mais sans
 * les tuiles des praticiens : sur une page d'emploi, les seuls points sont les
 * offres. Chaque offre est un marqueur HTML posé à sa position exacte, en bleu
 * « où ? » comme les points de l'annuaire ; l'offre active (survolée ou ouverte) porte une
 * étiquette. Carte inerte par défaut, comme le décor du hero de l'accueil.
 *
 * `liee` : la carte d'une liste de résultats. Elle se déplace et se zoome, et
 * suit la liste dans les deux sens : survoler une offre de la liste la montre
 * sur la carte, cliquer un marqueur fait défiler la liste jusqu'à l'offre. Les
 * offres posées au même endroit forment un seul marqueur, avec leur nombre.
 *
 * Les étiquettes sont posées en `textContent` : elles viennent des offres
 * (rémunération, nom du recruteur) et ne doivent jamais être lues comme du
 * HTML.
 */
import { useEffect, useRef, useState } from 'react'
import { Map as MapLibre, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { styleCarte } from '@/components/map/style'
import type { Emprise } from '@/lib/annuaire/emprise'

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

export type PointOffre = { id: string; lon: number; lat: number; etiquette?: string; nombre?: number }

/** Événements entre la liste et la carte : l'offre survolée dans la liste, l'offre choisie sur la carte. */
export const OFFRE_SURVOLEE = 'dm:offre-survolee'
export const OFFRE_CHOISIE = 'dm:offre-choisie'

/** Les offres au même endroit, regroupées : un marqueur par lieu. */
function grouper(points: PointOffre[]): PointOffre[][] {
  const lieux = new Map<string, PointOffre[]>()
  for (const p of points) {
    const cle = `${p.lon.toFixed(5)},${p.lat.toFixed(5)}`
    lieux.set(cle, [...(lieux.get(cle) ?? []), p])
  }
  return [...lieux.values()]
}

export function CarteOffres({
  emprise,
  points,
  actif,
  className = 'size-full',
  theme,
  interactive = false,
  rayon,
  mention = true,
  liee = false,
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
  /** Carte d'une liste de résultats : déplaçable, et liée à la liste dans les deux sens. */
  liee?: boolean
}) {
  const conteneur = useRef<HTMLDivElement>(null)
  const carte = useRef<MapLibre | null>(null)
  const [prete, setPrete] = useState(false)
  const [courant, setCourant] = useState(actif)
  const depart = useRef({ emprise, theme, interactive: interactive || liee, rayon })

  // La liste annonce l'offre survolée : elle devient l'offre active de la carte.
  useEffect(() => {
    if (!liee) return
    const surSurvol = (ev: Event) => setCourant((ev as CustomEvent<string>).detail)
    window.addEventListener(OFFRE_SURVOLEE, surSurvol)
    return () => window.removeEventListener(OFFRE_SURVOLEE, surSurvol)
  }, [liee])

  useEffect(() => {
    if (!conteneur.current) return
    const { emprise: e, theme: t, interactive: inter, rayon: r } = depart.current
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

    if (inter) m.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    // Le cadre change de taille (carte collée au défilement, fenêtre redimensionnée) : le plan suit.
    const suivi = new ResizeObserver(() => m.resize())
    suivi.observe(conteneur.current)
    carte.current = m
    setPrete(true)
    return () => {
      suivi.disconnect()
      m.remove()
      carte.current = null
      setPrete(false)
    }
  }, [])

  // Les marqueurs, refaits quand l'offre active change : la survolée dans la liste, ou la cliquée sur la carte.
  useEffect(() => {
    const m = carte.current
    if (!m || !prete || !conteneur.current) return
    // Sous 600 px de large, les étiquettes se chevauchent : seules restent celle de l'offre active et les grappes.
    const etroit = conteneur.current.clientWidth < 600
    const marqueurs = (liee ? grouper(points) : points.map((p) => [p])).map((groupe) => {
      const actifIci = groupe.find((p) => p.id === courant)
      const brut = actifIci ?? groupe[0]
      const nombre = groupe.length > 1 && !actifIci ? groupe.length : brut.nombre
      const el = document.createElement('div')
      const estActif = Boolean(actifIci)
      const p = etroit && !estActif ? { ...brut, etiquette: undefined } : brut
      if (nombre && nombre > 1) {
        el.className =
          'grid size-8 place-items-center rounded-full border-2 border-white bg-[#16222b] text-xs font-semibold text-white shadow-[0_3px_12px_rgb(0_0_0/0.25)]'
        el.textContent = String(nombre)
      } else if (estActif && p.etiquette) {
        el.className = 'flex flex-col items-center'
        el.innerHTML = `<span class="whitespace-nowrap rounded-full bg-[#0071e3] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_6px_20px_rgb(0_113_227/0.35)]"></span><span class="-mt-px size-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-[#0071e3]"></span><span class="mt-1 size-3.5 rounded-full border-2 border-white bg-[#0071e3] shadow"></span>`
        el.firstElementChild!.textContent = groupe.length > 1 ? `${p.etiquette} · ${groupe.length} offres` : p.etiquette!
      } else if (p.etiquette) {
        el.className =
          'whitespace-nowrap rounded-full border border-black/5 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#16222b] shadow-[0_3px_12px_rgb(22_34_43/0.18)]'
        el.textContent = p.etiquette
      } else {
        el.className = `rounded-full border-2 border-white bg-[#0071e3] shadow ${estActif ? 'size-5' : 'size-3.5'}`
      }
      if (liee) {
        // Cliquer un marqueur : l'offre devient active et la liste défile jusqu'à elle. Sur un lieu à plusieurs offres, on passe à la suivante.
        el.style.cursor = 'pointer'
        el.addEventListener('click', (ev) => {
          ev.stopPropagation()
          const i = groupe.findIndex((x) => x.id === courant)
          const suivante = groupe[(i + 1) % groupe.length]
          setCourant(suivante.id)
          window.dispatchEvent(new CustomEvent(OFFRE_CHOISIE, { detail: suivante.id }))
        })
      }
      return new Marker({ element: el, anchor: estActif && p.etiquette ? 'bottom' : 'center' }).setLngLat([p.lon, p.lat]).addTo(m)
    })
    return () => marqueurs.forEach((mk) => mk.remove())
    // `points` est recréé à chaque rendu : la clé du composant change quand les offres changent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prete, courant, liee])

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
