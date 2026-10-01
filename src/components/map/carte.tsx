'use client'

import { useEffect, useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { createPortal } from 'react-dom'
import { useTheme } from 'next-themes'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  Map as MapLibre,
  Marker,
  NavigationControl,
  setWorkerUrl,
  type GeoJSONSource,
  type MapLayerMouseEvent,
  type MapLibreMap,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { CarteFiche } from '@/components/recherche/carte-fiche'
import { Carousel_002 } from '@/components/ui/skiper-ui/skiper48'
import { clePosition, rayonGrappe, SEUIL_POINTS, type Emprise, type Origine } from '@/lib/annuaire/emprise'
import { filtresEnParams, type Filtres } from '@/lib/annuaire/filtres'
import { styleCarte, styleCarteInitial } from './style'
import { usePhase } from '@/lib/use-phase'
import type { PraticienProche } from '@/lib/annuaire/queries'
import { PROFESSION_PAR_BASE, type BaseUrl, type PraticienResume } from '@/lib/annuaire/types'

/**
 * Carte des praticiens.
 *
 * Fond de plan OpenFreeMap : tuiles vectorielles issues d'OpenStreetMap,
 * gratuites et sans clé, cohérentes avec le positionnement d'un annuaire qui
 * ne dépend d'aucun fournisseur payant. Le style, lui, est celui du site,
 * clair ou sombre selon le thème : voir `style.ts`. Au changement de thème,
 * MapLibre recharge le style, ce qui retire nos sources et nos couches ; elles
 * sont donc ajoutées sur `style.load`, qui suit chaque chargement de style, et
 * non une seule fois sur `load`.
 *
 * Les praticiens viennent de `/api/geo/tuiles/`, où PostGIS produit le MVT.
 * C'est MapLibre qui décide des tuiles à demander et qui garde les autres en
 * mémoire : rien à recharger à la main au déplacement, aucun plafond de
 * résultats, aucune requête pour un décalage de dix pixels.
 *
 * Une tuile contient deux formes d'objets, distinguées par `point_count` :
 * des grappes de grille, qui se défont en zoomant, et des lieux, qui portent
 * la liste des praticiens qui y exercent. Un lieu compte souvent un praticien
 * et parfois quatorze ; le zoom ne les séparera jamais puisqu'ils partagent la
 * même adresse, donc le clic les montre tous.
 *
 * Au clic sur un lieu qui ne compte qu'un praticien, la carte se resserre et
 * se recentre pour que le point et sa fiche, posée juste au-dessus de lui,
 * occupent le milieu du cadre, le reste du plan s'estompant dans un flou
 * progressif vers les bords. Sur un lieu à plusieurs praticiens, leurs fiches
 * se posent sur la carte en pile de cartes à faire glisser, la pile de Skiper
 * UI. Dans les deux cas, la fiche est la carte de résultat de la liste : une
 * seule fiche, un seul rendu, une seule règle d'affichage du nom.
 */
const SOURCE = 'praticiens'
const SURVOL = 'survol'

const VIDE = { type: 'FeatureCollection' as const, features: [] }

/*
 * MapLibre 6 déduit l'adresse de son worker de `import.meta.url`. Next réécrit
 * cette valeur au bundling, elle ne commence plus par `http`, et la fonction de
 * repli renvoie une chaîne vide. Le navigateur résout alors `''` contre l'URL du
 * document et lance la page HTML elle-même comme module worker : il meurt à la
 * première ligne, aucune tuile n'est jamais analysée, et la carte reste vide
 * sans qu'un seul événement `error` soit émis.
 *
 * Le worker est donc servi depuis `public/`, où `scripts/copie-worker-maplibre.mjs`
 * le dépose avant chaque `dev` et chaque `build`.
 */
setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

/** Un membre d'un lieu, tel que la route MVT le sérialise. */
type Membre = Omit<PraticienResume, 'lon' | 'lat'>

type Selection = {
  membres: PraticienProche[]
  /** Élément du marqueur qui porte la fiche au-dessus du point, pour un lieu à un seul praticien. */
  hote: HTMLElement
  /** En cours de fermeture : la sortie s'anime avant que tout soit retiré. */
  sortie: boolean
}

/** Durée de la sortie, à garder au-dessus de la transition la plus longue de la fiche et du voile. */
const DUREE_SORTIE = 420

/** Hauteur d'une carte de résultat, en pixels : 28 rem. */
const HAUTEUR_FICHE = 448
/** Espace entre le point et le bas de la fiche. */
const ECART_FICHE = 14
/** Zoom minimal quand on se resserre sur un point. */
const ZOOM_FICHE = 15.5

/** Distance en mètres entre deux points, formule de haversine, pour la ligne « à x km du centre ». */
function metresEntre(a: [number, number], b: [number, number]): number {
  const r = 6_371_000
  const dLat = ((b[1] - a[1]) * Math.PI) / 180
  const dLon = ((b[0] - a[0]) * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[1] * Math.PI) / 180) * Math.cos((b[1] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return Math.round(2 * r * Math.asin(Math.sqrt(h)))
}

function urlTuiles(base: BaseUrl, filtres: Filtres = {}): string {
  // `trailingSlash: true` dans la configuration Next : sans la barre finale,
  // chaque tuile part en redirection 308 et double le trajet. Les filtres
  // voyagent en paramètres : MapLibre les garde tels quels dans l'URL de
  // chaque tuile.
  const params = filtresEnParams(filtres).toString()
  return `${window.location.origin}/api/geo/tuiles/${base}/{z}/{x}/{y}/${params ? `?${params}` : ''}`
}

/** Membres d'un lieu, complétés par la position de l'objet de tuile. */
function lireGroupe(brut: unknown, [lon, lat]: [number, number]): PraticienResume[] {
  if (typeof brut !== 'string') return []
  try {
    const membres = JSON.parse(brut) as Membre[]
    return Array.isArray(membres) ? membres.map((m) => ({ ...m, lon, lat })) : []
  } catch {
    return []
  }
}

export function Carte({
  profession,
  emprise,
  className = 'h-[420px] w-full rounded-lg border border-line lg:h-[600px]',
  onEmprise,
  survol = null,
  onSurvol,
  filtres,
  cadrage = null,
}: {
  profession: BaseUrl
  /**
   * Vue de départ. Les changements ultérieurs sont ignorés : c'est la carte
   * qui mène le cadrage. Une nouvelle recherche remonte tout le bloc par sa
   * clé, ce qui reconstruit la carte sur la bonne emprise.
   */
  emprise: Emprise
  /** Géométrie du cadre. Le défaut convient à une carte posée dans une page ; une carte pleine hauteur passe `size-full`. */
  className?: string
  /** Appelé après chaque déplacement de l'utilisateur, jamais pour le cadrage initial. */
  /** Emprise après un geste, et le lieu de la fiche ouverte quand le recadrage vient d'elle. */
  onEmprise?: (emprise: Emprise, origine?: Origine | null) => void
  /** Clé de position à mettre en évidence, venue de la liste. */
  survol?: string | null
  /** Remonte le lieu survolé sur la carte, pour que la liste s'allume en retour. */
  onSurvol?: (cle: string | null, slug?: string | null) => void
  /** Filtres de la recherche : les tuiles sont redemandées quand ils changent. */
  filtres?: Filtres
  /** Emprise à cadrer, animée, quand le script le demande : la position de l'utilisateur par exemple. */
  cadrage?: Emprise | null
}) {
  const conteneur = useRef<HTMLDivElement>(null)
  const carte = useRef<MapLibreMap | null>(null)
  const marqueur = useRef<Marker | null>(null)
  const minuterieSortie = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [stylePret, setStylePret] = useState(0)
  /** Rappels du parent, lus au moment de l'événement (voir plus bas). */
  const rappels = useRef({ onEmprise, onSurvol })

  /*
   * Fermeture en deux temps : la fiche et le voile s'estompent, puis le
   * marqueur est retiré et l'état vidé. Retirer d'abord ferait disparaître la
   * fiche d'un coup, sans sortie. Une ouverture pendant la sortie annule la
   * minuterie et retire l'ancien marqueur sur-le-champ.
   */
  const retirer = () => {
    if (minuterieSortie.current) clearTimeout(minuterieSortie.current)
    minuterieSortie.current = null
    marqueur.current?.remove()
    marqueur.current = null
    setSelection(null)
  }
  const fermer = () => {
    if (marqueur.current) rappels.current.onSurvol?.(null)
    setSelection((s) => (s && !s.sortie ? { ...s, sortie: true } : s))
    if (minuterieSortie.current) clearTimeout(minuterieSortie.current)
    minuterieSortie.current = setTimeout(retirer, DUREE_SORTIE)
  }
  const rappelsFermeture = useRef({ fermer, retirer })
  useEffect(() => {
    rappelsFermeture.current = { fermer, retirer }
  })

  /*
   * Les valeurs de départ et les rappels vivent dans des références, hors des
   * dépendances de l'effet de création : `emprise` est un objet littéral et un
   * rappel une fonction recréée à chaque rendu du parent. Les mettre en
   * dépendance détruirait et reconstruirait la carte à chaque rendu.
   */
  const initial = useRef({ emprise, profession })
  const { resolvedTheme } = useTheme()
  /** Filtres en vigueur, lus quand les couches sont ajoutées ou rajoutées. */
  const filtresCourants = useRef(filtres)

  // Mis à jour dans un effet et non pendant le rendu : les gestionnaires
  // d'événements de MapLibre ne se déclenchent qu'après, la fraîcheur est donc
  // garantie sans écrire dans une référence au milieu d'un rendu.
  useEffect(() => {
    rappels.current = { onEmprise, onSurvol }
  }, [onEmprise, onSurvol])

  useEffect(() => {
    if (!conteneur.current || carte.current) return

    const { emprise: depart, profession: base } = initial.current
    const m = new MapLibre({
      container: conteneur.current,
      style: styleCarteInitial(),
      bounds: [
        [depart.ouest, depart.sud],
        [depart.est, depart.nord],
      ],
      fitBoundsOptions: { padding: 0, animate: false },
      attributionControl: { compact: true },
    })
    carte.current = m
    // Hors production, la carte est exposée aux scripts de vérification.
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __carte?: MapLibreMap }).__carte = m
    m.addControl(new NavigationControl({ showCompass: false }), 'top-right')

    const fermerPopup = () => rappelsFermeture.current.fermer()

    // Le cadrage initial ne doit pas être signalé comme un déplacement : la
    // page vient de rendre la liste pour cette emprise exacte.
    let pret = false

    /*
     * Sources et couches des praticiens. Sur `style.load` : le premier
     * chargement comme chaque changement de style, où MapLibre repart du
     * style nu. Les écouteurs d'événements, eux, restent posés sur la carte et
     * retrouvent les couches par leur identifiant.
     */
    const ajouterCouches = () => {
      if (m.getSource(SOURCE)) return
      m.addSource(SOURCE, {
        type: 'vector',
        tiles: [urlTuiles(base, filtresCourants.current)],
        minzoom: 3,
        // Au-delà, MapLibre réutilise la tuile 16 en la sur-zoomant : les
        // lieux y sont déjà distincts, il n'y a rien de plus à demander.
        maxzoom: 16,
        attribution: 'Praticiens : ANS (RPPS, ADELI), INSEE (Sirene)',
      })

      m.addLayer({
        id: 'grappes',
        type: 'circle',
        source: SOURCE,
        'source-layer': SOURCE,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#16222b',
          // Les mêmes paliers que `rayonGrappe` et que le placement côté base.
          'circle-radius': ['step', ['get', 'point_count'], rayonGrappe(1), 10, rayonGrappe(10), 50, rayonGrappe(50)],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })
      m.addLayer({
        id: 'grappes-nombre',
        type: 'symbol',
        source: SOURCE,
        'source-layer': SOURCE,
        filter: ['has', 'point_count'],
        // L'abrégé est calculé en SQL : MapLibre ne produit
        // `point_count_abbreviated` que pour ses propres grappes.
        layout: { 'text-field': ['get', 'point_count_abrege'], 'text-size': 12 },
        paint: { 'text-color': '#ffffff' },
      })
      m.addLayer({
        id: 'points',
        type: 'circle',
        source: SOURCE,
        'source-layer': SOURCE,
        filter: ['!', ['has', 'point_count']],
        paint: {
          // Bleu : un marqueur dit où, pas quoi faire. Le teal reste aux actions.
          'circle-color': '#0071e3',
          // Un lieu partagé est plus gros, pour que son chiffre tienne dedans.
          'circle-radius': ['step', ['get', 'groupe_n'], 7, 2, 11, 10, 14],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })
      m.addLayer({
        id: 'points-nombre',
        type: 'symbol',
        source: SOURCE,
        'source-layer': SOURCE,
        filter: ['all', ['!', ['has', 'point_count']], ['>', ['get', 'groupe_n'], 1]],
        layout: { 'text-field': ['to-string', ['get', 'groupe_n']], 'text-size': 11 },
        paint: { 'text-color': '#ffffff' },
      })

      // Halo de correspondance avec la liste, posé sous les points pour ne
      // jamais masquer le marqueur qu'il désigne.
      m.addSource(SURVOL, { type: 'geojson', data: VIDE })
      m.addLayer(
        {
          id: SURVOL,
          type: 'circle',
          source: SURVOL,
          paint: {
            'circle-radius': ['coalesce', ['get', 'rayon'], 18],
            'circle-color': '#0071e3',
            'circle-opacity': 0.18,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#0071e3',
          },
        },
        'points',
      )
    }
    // Le compteur de style rejoue le halo de survol une fois les sources en place :
    // sur une fiche, le lieu à marquer est connu avant que la carte ait fini de charger.
    m.on('style.load', () => {
      ajouterCouches()
      setStylePret((n) => n + 1)
    })

    m.on('load', () => {
      m.on('click', 'points', (ev: MapLayerMouseEvent) => {
        const f = ev.features?.[0]
        if (!f || f.geometry.type !== 'Point') return
        const coords = f.geometry.coordinates as [number, number]
        const membres = lireGroupe(f.properties?.groupe, coords)
        if (membres.length === 0) return

        const centre = m.getCenter()
        const metres = metresEntre([centre.lng, centre.lat], coords)
        const fiches = membres.map((membre) => ({ ...membre, metres }))
        rappelsFermeture.current.retirer()

        /*
         * Un praticien seul ou plusieurs à la même adresse : même geste. La
         * fiche, ou la pile de fiches, est un marqueur ancré par son bas
         * juste au-dessus du point, et la carte se recentre de sorte que le
         * point et la fiche, pris ensemble, soient au milieu du cadre. Le
         * décalage vaut la moitié de la hauteur du groupe, appliqué au point.
         * Le recadrage est marqué `depuisFiche` : le `moveend` qui suit fait
         * suivre la liste, qui se réordonne autour du lieu choisi, mais ne
         * referme pas la fiche comme le ferait un déplacement à la main.
         */
        const hote = document.createElement('div')
        hote.className = 'z-10'
        /*
         * Ce qui se passe dans la fiche reste dans la fiche : un clic sur une
         * flèche ou un glissement de la pile ne doit ni refermer la fiche
         * (le clic sur le fond de plan la referme) ni déplacer la carte.
         */
        for (const type of ['click', 'mousedown', 'touchstart', 'wheel'] as const) hote.addEventListener(type, (e) => e.stopPropagation())
        marqueur.current = new Marker({ element: hote, anchor: 'bottom', offset: [0, -ECART_FICHE] }).setLngLat(coords).addTo(m)
        m.easeTo(
          {
            center: coords,
            zoom: Math.max(m.getZoom(), ZOOM_FICHE),
            offset: [0, (HAUTEUR_FICHE + ECART_FICHE) / 2],
            duration: 650,
          },
          { depuisFiche: true },
        )
        // La colonne de gauche s'allume sur le lieu choisi, et sur la personne quand elle est seule.
        rappels.current.onSurvol?.(clePosition(coords[0], coords[1]), fiches.length === 1 ? fiches[0]!.slug : null)
        setSelection({ membres: fiches, hote, sortie: false })
      })

      // Un clic sur le fond de plan referme la pile.
      m.on('click', (ev) => {
        if (m.queryRenderedFeatures(ev.point, { layers: ['points', 'grappes'] }).length === 0) fermerPopup()
      })

      m.on('mouseenter', 'points', (ev: MapLayerMouseEvent) => {
        m.getCanvas().style.cursor = 'pointer'
        const f = ev.features?.[0]
        if (f?.geometry.type === 'Point') {
          const [lon, lat] = f.geometry.coordinates as [number, number]
          rappels.current.onSurvol?.(clePosition(lon, lat))
        }
      })
      m.on('mouseleave', 'points', () => {
        m.getCanvas().style.cursor = ''
        // Fiche ouverte : le point sort de sous le curseur quand la carte se
        // recentre. Le choix reste allumé dans la liste jusqu'à la fermeture.
        if (!marqueur.current) rappels.current.onSurvol?.(null)
      })

      m.on('click', 'grappes', (ev: MapLayerMouseEvent) => {
        const f = m.queryRenderedFeatures(ev.point, { layers: ['grappes'] })[0]
        if (f?.geometry.type === 'Point') {
          // L'événement d'origine est transmis : le `moveend` qui suit compte
          // comme un geste de l'utilisateur, pas comme un recadrage du script.
          m.easeTo({ center: f.geometry.coordinates as [number, number], zoom: m.getZoom() + 2 }, { originalEvent: ev.originalEvent })
        }
      })

      m.once('idle', () => {
        pret = true
      })
    })

    /*
     * Seuls les déplacements de l'utilisateur remontent : MapLibre attache
     * l'événement d'origine aux gestes (glisser, molette, boutons de zoom,
     * clavier), jamais aux recadrages du script, cadrage initial, ajustement
     * à la taille du conteneur, redimensionnement de la fenêtre. Sans ce
     * filtre, une page de commune voyait sa liste remplacée par celle de
     * l'emprise dès le chargement, avant tout geste.
     */
    m.on('moveend', (e) => {
      const depuisFiche = Boolean((e as { depuisFiche?: boolean }).depuisFiche)
      if (!pret || (!e.originalEvent && !depuisFiche)) return
      if (!depuisFiche) fermerPopup()
      const b = m.getBounds()
      const lieu = depuisFiche ? marqueur.current?.getLngLat() : null
      rappels.current.onEmprise?.(
        { ouest: b.getWest(), sud: b.getSouth(), est: b.getEast(), nord: b.getNorth() },
        lieu ? { lon: lieu.lng, lat: lieu.lat } : null,
      )
    })

    m.on('error', (e) => {
      const source = (e as { sourceId?: string }).sourceId
      if (source && source !== SOURCE) return
      setErreur(e.error?.message ?? 'chargement impossible')
    })

    return () => {
      rappelsFermeture.current.retirer()
      m.remove()
      carte.current = null
    }
  }, [])

  /*
   * Les filtres changent l'URL des tuiles : MapLibre vide son cache pour la
   * source et redemande les tuiles visibles, points et grappes compris. Le
   * premier passage ne fait rien, la source vient d'être créée avec eux.
   */
  const filtresInitiaux = useRef(filtres)
  useEffect(() => {
    filtresCourants.current = filtres
    if (filtres === filtresInitiaux.current) return
    const m = carte.current
    if (!m) return
    const appliquer = () => {
      const source = m.getSource(SOURCE) as { setTiles?: (tiles: string[]) => void } | undefined
      source?.setTiles?.([urlTuiles(profession, filtres)])
    }
    if (m.isStyleLoaded()) appliquer()
    else m.once('load', appliquer)
  }, [filtres, profession])

  // Le style suit le thème du site. Le premier rendu n'a pas de thème résolu
  // et la carte est créée avec le bon style d'après la classe du document :
  // on ne recharge que sur un vrai changement.
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

  // Recadrage demandé par le script : animé, sans événement d'origine, donc
  // sans passer par `moveend` ; c'est l'appelant qui fait suivre la liste.
  useEffect(() => {
    const m = carte.current
    if (!m || !cadrage) return
    m.fitBounds(
      [
        [cadrage.ouest, cadrage.sud],
        [cadrage.est, cadrage.nord],
      ],
      { padding: 32, duration: 1100 },
    )
  }, [cadrage])

  /*
   * Correspondance avec la liste : un point unique dans une source dédiée,
   * plutôt qu'un état de fonctionnalité, dont l'identifiant n'est pas stable
   * d'une tuile à l'autre.
   */
  useEffect(() => {
    const m = carte.current
    const source = m?.getSource(SURVOL) as GeoJSONSource | undefined
    if (!m || !source) return
    const [lon, lat] = (survol ?? '').split(',').map(Number)
    if (!survol || !Number.isFinite(lon) || !Number.isFinite(lat)) {
      source.setData(VIDE)
      return
    }

    /*
     * Aux zooms de grappes, le lieu n'est pas dessiné : c'est la grappe qui le
     * contient qui doit s'allumer, sinon le halo tombe à côté d'un cercle sans
     * le désigner. La grappe est celle dont le cercle est le plus proche du
     * lieu à l'écran, à moins d'une cellule ; son rayon dimensionne le halo.
     * Aux zooms de points, ou sans grappe à portée, le lieu lui-même.
     */
    let coordonnees: [number, number] = [lon!, lat!]
    let rayon = 18
    if (m.getZoom() < SEUIL_POINTS && m.isStyleLoaded() && m.getLayer('grappes')) {
      const cible = m.project(coordonnees)
      let distanceMin = 90
      for (const f of m.queryRenderedFeatures(undefined, { layers: ['grappes'] })) {
        if (f.geometry.type !== 'Point') continue
        const position = f.geometry.coordinates as [number, number]
        const q = m.project(position)
        const d = Math.hypot(q.x - cible.x, q.y - cible.y)
        if (d < distanceMin) {
          distanceMin = d
          coordonnees = position
          rayon = rayonGrappe(Number(f.properties?.point_count ?? 1)) + 6
        }
      }
    }
    source.setData({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: coordonnees }, properties: { rayon } }],
    })
  }, [survol, stylePret])

  return (
    <div className="relative h-full">
      <div ref={conteneur} className={className} />
      {erreur && (
        <p className="absolute left-3 top-3 rounded bg-bg px-3 py-1.5 text-sm text-destructive ring-1 ring-destructive/30">
          Carte indisponible : {erreur}
        </p>
      )}
      {selection && (
        <>
          <VoileRadial sortie={selection.sortie} />
          {createPortal(
            <FicheAncree membres={selection.membres} profession={profession} sortie={selection.sortie} fermer={fermer} />,
            selection.hote,
          )}
        </>
      )}
    </div>
  )
}

/**
 * La fiche posée sur le point, ou la pile de fiches quand plusieurs
 * professionnels partagent l'adresse. Entrée depuis le point : elle monte,
 * s'ouvre et apparaît en 560 ms ; sortie inverse en 360 ms.
 *
 * Le titre d'une pile compte les professionnels plutôt que de les présenter
 * comme un cabinet : rien dans les registres ne dit qu'ils exercent
 * ensemble, seulement qu'ils sont à la même adresse.
 */
function FicheAncree({
  membres,
  profession,
  sortie,
  fermer,
}: {
  membres: PraticienProche[]
  profession: BaseUrl
  sortie: boolean
  fermer: () => void
}) {
  const phase = usePhase(sortie)
  const metier = PROFESSION_PAR_BASE[profession]
  useEchap(fermer)
  const pile = membres.length > 1
  const swiper = useRef<SwiperInstance | null>(null)
  // Les flèches entrent et sortent avec la fiche, un peu après elle, comme la croix.
  const commande =
    'absolute top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-bg text-fg shadow-pop transition-[opacity,scale,background-color,color] duration-[420ms] delay-150 ease-lift group-data-[phase=entree]/fiche:scale-50 group-data-[phase=entree]/fiche:opacity-0 group-data-[phase=sortie]/fiche:scale-50 group-data-[phase=sortie]/fiche:opacity-0 group-data-[phase=sortie]/fiche:delay-0 hover:bg-fg hover:text-bg motion-reduce:transition-none'
  return (
    <div
      data-phase={phase}
      role={pile ? 'dialog' : undefined}
      aria-label={pile ? `${membres.length} professionnels à cette adresse` : undefined}
      className="group/fiche relative w-[22rem] max-w-[calc(100vw-2rem)] origin-bottom transition-[opacity,translate,scale] duration-[560ms] ease-lift data-[phase=entree]:translate-y-4 data-[phase=entree]:scale-[0.94] data-[phase=entree]:opacity-0 data-[phase=sortie]:translate-y-4 data-[phase=sortie]:scale-[0.94] data-[phase=sortie]:opacity-0 data-[phase=sortie]:duration-[360ms] motion-reduce:transition-none"
    >
      {pile ? (
        /*
          Même hauteur qu'une carte de résultat, pour que la pile se pose sur
          le point comme une fiche seule : la place que la pile réserve sous
          elle aux points de pagination est reprise, et l'on passe d'une
          fiche à l'autre par les flèches posées de part et d'autre, ou en
          faisant glisser. Pas de boucle Swiper, qui exige plus de
          diapositives que n'en a une adresse et se bloque sinon : après la
          dernière fiche, on revient à la première.
        */
        <Carousel_002
          tailleClassName="h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)]"
          className="[&_.swiper]:pb-0!"
          animer={false}
          onSwiper={(s) => (swiper.current = s)}
          loop={false}
          rewind
          showPagination={false}
          slides={membres.map((m) => (
            <ol key={m.slug} className="h-full [&>li]:h-full [&>li]:shadow-pop">
              <CarteFiche praticien={m} base={profession} profession={metier} actif={false} onSurvol={() => {}} />
            </ol>
          ))}
        />
      ) : (
        <ol className="[&>li]:shadow-pop">
          <CarteFiche praticien={membres[0]!} base={profession} profession={metier} actif={false} onSurvol={() => {}} />
        </ol>
      )}
      {/*
        La croix et le compte appartiennent à la fiche : posés à cheval sur
        ses coins, ils entrent et sortent avec elle, un peu après elle.
      */}
      {pile && (
        <>
          <button type="button" onClick={() => swiper.current?.slidePrev()} aria-label="Fiche précédente" className={`${commande} -left-14`}>
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => swiper.current?.slideNext()} aria-label="Fiche suivante" className={`${commande} -right-14`}>
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
      {pile && (
        <p className="absolute -top-3 left-3 z-20 rounded-full border border-line bg-bg px-2.5 py-1 text-xs font-medium text-fg shadow-pop transition-[opacity,scale] duration-[420ms] delay-150 ease-lift group-data-[phase=entree]/fiche:scale-75 group-data-[phase=entree]/fiche:opacity-0 group-data-[phase=sortie]/fiche:scale-75 group-data-[phase=sortie]/fiche:opacity-0 group-data-[phase=sortie]/fiche:delay-0 motion-reduce:transition-none">
          {membres.length} professionnels à cette adresse
        </p>
      )}
      <button
        type="button"
        onClick={fermer}
        aria-label="Fermer la fiche"
        className="absolute -right-3 -top-3 z-20 grid size-9 place-items-center rounded-full border border-line bg-bg text-fg shadow-pop transition-[opacity,scale,background-color,color] duration-[420ms] delay-150 ease-lift group-data-[phase=entree]/fiche:scale-50 group-data-[phase=entree]/fiche:opacity-0 group-data-[phase=sortie]/fiche:scale-50 group-data-[phase=sortie]/fiche:opacity-0 group-data-[phase=sortie]/fiche:delay-0 hover:bg-fg hover:text-bg motion-reduce:transition-none"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

/** Échap referme, tant que l'élément est monté. */
function useEchap(fermer: () => void) {
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer()
    }
    document.addEventListener('keydown', surTouche)
    return () => document.removeEventListener('keydown', surTouche)
  }, [fermer])
}

/**
 * Flou progressif du plan autour du point sélectionné.
 *
 * Trois couches de flou de fond, chacune masquée par un dégradé radial plus
 * serré que la précédente : net au centre, où sont le point et sa fiche, de
 * plus en plus flou vers les bords. Il laisse passer les gestes, pour que la
 * carte reste manipulable, ce qui referme la fiche.
 */
function VoileRadial({ sortie }: { sortie: boolean }) {
  const phase = usePhase(sortie)
  /*
   * C'est le flou lui-même qui monte de zéro à sa valeur, couche par couche,
   * et non l'opacité d'un parent : un `backdrop-filter` sous un parent en
   * transition d'opacité n'est pas fondu par tous les navigateurs, et le
   * voile apparaissait d'un coup.
   */
  const couche = 'absolute inset-0 transition-[backdrop-filter,opacity] duration-[640ms] ease-lift group-data-[phase=entree]/voile:backdrop-blur-none group-data-[phase=sortie]/voile:backdrop-blur-none group-data-[phase=sortie]/voile:duration-[420ms] motion-reduce:transition-none'
  return (
    <div aria-hidden data-phase={phase} className="group/voile pointer-events-none absolute inset-0 z-[5]">
      <div className={`${couche} backdrop-blur-[2px] [mask-image:radial-gradient(ellipse_60%_65%_at_50%_50%,transparent_30%,black_70%)]`} />
      <div className={`${couche} backdrop-blur-[5px] [mask-image:radial-gradient(ellipse_60%_65%_at_50%_50%,transparent_50%,black_85%)]`} />
      <div className={`${couche} backdrop-blur-[10px] [mask-image:radial-gradient(ellipse_60%_65%_at_50%_50%,transparent_68%,black_100%)]`} />
      <div className={`${couche} bg-bg/25 [mask-image:radial-gradient(ellipse_60%_65%_at_50%_50%,transparent_40%,black_100%)] group-data-[phase=entree]/voile:opacity-0 group-data-[phase=sortie]/voile:opacity-0`} />
    </div>
  )
}
