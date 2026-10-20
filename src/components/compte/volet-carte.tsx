'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Logo } from '@/components/site/logo'
import { useTheme } from 'next-themes'
import { CircleX, CreditCard, ExternalLink, FileText, GraduationCap, Hourglass, Mail, Search, ShieldCheck, Users, type LucideIcon } from 'lucide-react'
import { LngLatBounds, Map as MapLibre, Marker, setWorkerUrl, type MapLibreMap } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { CarteFiche } from '@/components/recherche/carte-fiche'
import { styleCarte, styleCarteInitial } from '@/components/map/style'
import type { PraticienProche } from '@/lib/annuaire/queries'
import { BASE_URL, type Profession } from '@/lib/annuaire/types'

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

/**
 * Le volet carte du parcours de revendication.
 *
 * À gauche de l'écran, la carte du site et ce que la recherche a trouvé : la
 * pastille de recherche telle qu'elle a été remplie, la fiche posée sur son
 * repère, et en bas un encart qui dit où l'on en est. Arrivé depuis une fiche,
 * le praticien y est déjà : la recherche est faite, elle pointe sur lui.
 *
 * Une carte MapLibre à part, sans les tuiles de praticiens de la recherche :
 * seuls comptent ici le ou les lieux de la fiche. Le repère et la fiche sont un
 * seul marqueur ancré par le bas, de sorte que la fiche suit le point quoi que
 * fasse le cadrage. Rien n'est interactif : c'est un décor qui informe, la
 * page se joue à droite.
 */
const ICONES = {
  carte: CreditCard,
  sablier: Hourglass,
  erreur: CircleX,
  document: FileText,
  confrere: Users,
  sortie: ExternalLink,
  bouclier: ShieldCheck,
  courrier: Mail,
  diplome: GraduationCap,
  recherche: Search,
} satisfies Record<string, LucideIcon>

export type IconeEncart = keyof typeof ICONES

/** Événement de la colonne de droite (H1) : l'index de la fiche choisie ou survolée. */
export const EVENEMENT_CHOIX = 'dm:fiche-choisie'

type Point = { lon: number | null; lat: number | null }

export type EncartCarte = { icone: IconeEncart; titre: string; texte: string; ton?: 'teal' | 'attention' | 'erreur'; badge?: string }

/** Toute la France métropolitaine, quand aucune fiche n'est encore désignée : son emprise, cadrée quelle que soit la forme du volet. */
const FRANCE = { centre: [2.45, 46.6] as [number, number], zoom: 4.7, emprise: [[-5.2, 41.3], [9.6, 51.1]] as [[number, number], [number, number]] }

export function VoletCarte({
  praticiens = [],
  profession = 'dentiste',
  etiquette,
  recherche,
  encart,
  lieux = [],
  sansMarque = false,
  position,
  contenu,
  invite,
}: {
  /** Les fiches à montrer : la première porte la carte, les autres un simple point. */
  praticiens?: PraticienProche[]
  profession?: Profession
  /** Ce que la carte de la fiche affiche en haut à gauche : « Fiche non revendiquée »… */
  etiquette?: string
  /** Le contenu de la pastille. Absent : pas de pastille. Vide : le texte d'invite. */
  recherche?: string
  encart?: EncartCarte
  /** Autres lieux de la fiche (M1), en points. */
  lieux?: { lon: number | null; lat: number | null }[]
  /** Dans le tableau de bord, la carte est une tuile : ni marque ni voile. */
  sansMarque?: boolean
  /** Hors annuaire des soignants (établissement de formation) : le point et la carte posée dessus. */
  position?: Point | null
  contenu?: React.ReactNode
  /** Texte d'invite de la pastille vide ; par défaut, celui de la profession. */
  invite?: string
}) {
  // H1 : la fiche choisie ou survolée à droite devient la fiche de la carte.
  const [choix, setChoix] = useState(0)
  useEffect(() => {
    const surChoix = (e: Event) => setChoix((e as CustomEvent<number>).detail)
    window.addEventListener(EVENEMENT_CHOIX, surChoix)
    return () => window.removeEventListener(EVENEMENT_CHOIX, surChoix)
  }, [])
  const situes = praticiens.filter((p) => p.lon !== null && p.lat !== null)
  const choisi = praticiens[choix]
  const principal: Point | undefined = (choisi && choisi.lon !== null && choisi.lat !== null ? choisi : situes[0]) ?? position ?? undefined
  const fiche = praticiens.find((p) => p === principal)
  return (
    <div className="relative isolate size-full overflow-hidden bg-muted">
      <Plan principal={principal} autres={[...praticiens.filter((p) => p !== principal), ...lieux]}>
        {principal && contenu && !fiche && (
          <div className="pointer-events-none w-[19.25rem] [&>div>ul>li]:min-h-[24rem]">
            <div className="relative">
              {etiquette && (
                <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-bg/90 px-2 py-0.5 text-xs font-medium text-fg shadow-pill backdrop-blur">
                  <ShieldCheck className="size-3.5 text-teal" aria-hidden />
                  {etiquette}
                </span>
              )}
              <ul>{contenu}</ul>
            </div>
          </div>
        )}
        {fiche && (
          // La carte d'un laboratoire, sans horaires ni conventionnement, est plus courte : pas de hauteur imposée, pas de vide en bas.
          <div className={`pointer-events-none w-[19.25rem] ${profession === 'prothesiste' ? '' : '[&>div>ul>li]:min-h-[24rem]'}`}>
            <div className="relative">
              {etiquette && (
                <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-bg/90 px-2 py-0.5 text-xs font-medium text-fg shadow-pill backdrop-blur">
                  <ShieldCheck className="size-3.5 text-teal" aria-hidden />
                  {etiquette}
                </span>
              )}
              <ul>
                <CarteFiche praticien={{ ...fiche, revendiquee: false }} base={BASE_URL[profession]} profession={profession} actif={false} onSurvol={() => {}} />
              </ul>
            </div>
          </div>
        )}
      </Plan>

      {/* Un voile clair en haut et à gauche : la marque et la pastille se lisent sur le plan. */}
      {!sansMarque && <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/80 via-transparent to-transparent" />}

      <div className={`pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-6 px-5 md:px-10 xl:px-20 ${sansMarque ? 'hidden' : ''}`}>
        <div className="pointer-events-auto flex h-20 items-center">
          <Link href="/" className="inline-flex items-center" aria-label="DentalMap, accueil">
            <Logo />
          </Link>
        </div>
        {recherche !== undefined && <PastilleRecherche valeur={recherche} invite={invite} profession={profession} />}
      </div>

      {encart && <Encart {...encart} />}
    </div>
  )
}

/**
 * La pastille de recherche du volet : un vrai champ, qui relance la recherche
 * de sa fiche (S1) avec ce qu'on y tape. « RPPS : » devant un numéro. Côté
 * laboratoire, elle relance L1 : « SIREN : » ou « SIRET : » devant un numéro.
 */
function PastilleRecherche({ valeur, invite, profession }: { valeur: string; invite?: string; profession: Profession }) {
  const [texte, setTexte] = useState(valeur)
  const labo = profession === 'prothesiste'
  const chiffres = texte.replace(/\s/g, '')
  const numero = labo ? (/^\d{9}$/.test(chiffres) ? 'SIREN' : /^\d{14}$/.test(chiffres) ? 'SIRET' : null) : /^\d{11}$/.test(chiffres) ? 'RPPS' : null
  return (
    <form method="get" action={labo ? '/espace-pro/laboratoire/revendiquer/' : '/espace-pro/revendiquer/recherche/'} role="search" className="squircle-full pointer-events-auto flex h-11 max-w-md items-center gap-2.5 border border-line bg-bg pl-4 pr-1.5 shadow-pill focus-within:border-line-strong">
      {!labo && <input type="hidden" name="profession" value={profession} />}
      {numero ? <span className="shrink-0 text-sm font-medium text-fg-2">{numero} :</span> : <Search className="size-4 shrink-0 text-fg-2" aria-hidden />}
      <label htmlFor="volet-recherche" className="sr-only">{labo ? 'Rechercher un laboratoire par SIREN, SIRET ou raison sociale' : 'Rechercher une fiche par numéro RPPS ou par nom'}</label>
      <input
        id="volet-recherche"
        name="q"
        required
        minLength={2}
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        placeholder={invite ?? (labo ? 'SIREN ou raison sociale' : 'Numéro RPPS ou nom')}
        className={`min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-2 ${numero ? 'font-mono' : ''}`}
      />
      <button type="submit" aria-label="Rechercher" className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full bg-action text-action-foreground hover:bg-action-hover">
        <Search className="size-3.5" aria-hidden />
      </button>
    </form>
  )
}

/** Sur mobile, le volet se réduit à une vignette du plan avec le repère. */
export function VignetteCarte({ praticien }: { praticien: Point }) {
  if (praticien.lon === null || praticien.lat === null) return null
  return (
    <div aria-hidden className="squircle-2xl relative mb-6 h-24 overflow-hidden border border-line bg-muted lg:hidden">
      <Plan principal={praticien} autres={[]} zoom={15} vignette />
    </div>
  )
}

function Encart({ icone, titre, texte, ton = 'teal', badge }: EncartCarte) {
  const Icone = ICONES[icone]
  const fond = ton === 'attention' ? 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300' : ton === 'erreur' ? 'bg-destructive/10 text-destructive' : 'bg-teal/10 text-teal'
  return (
    <div className="absolute inset-x-5 bottom-8 flex items-center gap-3 rounded-2xl border border-line bg-bg/95 p-4 shadow-pop backdrop-blur md:inset-x-10 xl:inset-x-20">
      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${fond}`}>
        <Icone className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
          {titre}
          {badge && <span className="rounded-full bg-bg-soft px-2 py-0.5 text-[11px] font-medium text-fg-2 ring-1 ring-inset ring-line">{badge}</span>}
        </p>
        <p className="mt-0.5 text-xs text-fg-2">{texte}</p>
      </div>
    </div>
  )
}

/**
 * Le plan, ses points, et le marqueur principal (repère et contenu au-dessus).
 *
 * Le contenu du marqueur est rendu par React dans l'élément que MapLibre
 * déplace, via un portail.
 */
function Plan({
  principal,
  autres,
  zoom = 15.5,
  vignette = false,
  children,
}: {
  principal?: Point
  autres: { lon: number | null; lat: number | null }[]
  zoom?: number
  /** La vignette mobile : repère centré sur le point, mention des sources repliée. */
  vignette?: boolean
  children?: React.ReactNode
}) {
  const conteneur = useRef<HTMLDivElement>(null)
  const carte = useRef<MapLibreMap | null>(null)
  /** Le style posé sur le plan : on ne le recharge que si le thème le change vraiment. */
  const style = useRef<string | null>(null)
  const [hote, setHote] = useState<HTMLElement | null>(null)
  const { resolvedTheme } = useTheme()

  // Le plan se crée sur l'ensemble des points, quel que soit celui qui porte la fiche :
  // choisir une autre fiche (H1) déplace le repère au lieu de recréer la carte.
  const cle = [principal, ...autres]
    .filter(Boolean)
    .map((a) => `${a!.lon},${a!.lat}`)
    .sort()
    .join(';')
  const repere = useRef<Marker | null>(null)
  const premier = useRef(true)

  useEffect(() => {
    if (!conteneur.current) return
    // Les autres points ne comptent que s'ils sont près du principal : deux
    // homonymes à Bordeaux et à La Réunion ne se cadrent pas ensemble.
    const proche = (p: { lon: number | null; lat: number | null }) =>
      !principal || principal.lon === null || principal.lat === null || (p.lon !== null && p.lat !== null && Math.abs(p.lon - principal.lon) < 0.6 && Math.abs(p.lat - principal.lat) < 0.4)
    const points = [principal, ...autres.filter(proche)].filter(
      (p): p is { lon: number; lat: number } & NonNullable<typeof p> => !!p && p.lon !== null && p.lat !== null,
    )
    style.current = styleCarteInitial()
    const map = new MapLibre({
      container: conteneur.current,
      style: style.current,
      center: principal?.lon != null && principal.lat != null ? [principal.lon, principal.lat] : FRANCE.centre,
      zoom: principal ? zoom : FRANCE.zoom,
      interactive: false,
      attributionControl: { compact: true },
      fadeDuration: 0,
    })
    carte.current = map
    if (!principal) map.fitBounds(FRANCE.emprise, { padding: 24, duration: 0 })
    // Le cadre change de taille sans que la fenêtre bouge (volet redimensionné, barre d'outils) : le plan suit.
    const suivi = new ResizeObserver(() => map.resize())
    suivi.observe(conteneur.current)
    // Dans la vignette, la mention des sources reste repliée derrière son « i » : déployée, elle couvrirait le repère.
    if (vignette) map.once('load', () => conteneur.current?.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show'))

    // Plusieurs lieux : on les cadre tous, le repère principal restant en bas du cadre.
    if (points.length > 1) {
      const bornes = new LngLatBounds()
      for (const p of points) bornes.extend([p.lon, p.lat])
      map.fitBounds(bornes, { padding: { top: 500, bottom: 90, left: 60, right: 60 }, maxZoom: 14, duration: 0 })
      // La fiche posée sur le repère ne doit pas sortir du cadre : le plan garde ce zoom, mais centré sur le repère.
      if (principal?.lon != null && principal.lat != null && children)
        map.jumpTo({ center: [principal.lon, principal.lat], padding: { top: 440, bottom: 0, left: 0, right: 0 } })
    } else if (principal && children) {
      // La fiche se pose au-dessus du repère : le point descend dans le cadre pour lui laisser la place.
      map.setPadding({ top: 440, bottom: 0, left: 0, right: 0 })
    }

    const marqueurs: Marker[] = []
    let cadre = 0
    for (const p of points.slice(principal && points.length === 1 ? 1 : 0)) {
      const el = document.createElement('span')
      el.className = 'block size-3 rounded-full border-2 border-bg bg-teal shadow-pill'
      marqueurs.push(new Marker({ element: el }).setLngLat([p.lon, p.lat]).addTo(map))
    }
    if (principal?.lon != null && principal.lat != null) {
      const el = document.createElement('div')
      el.className = 'flex flex-col items-center'
      const m = new Marker({ element: el, anchor: vignette ? 'center' : 'bottom' }).setLngLat([principal.lon, principal.lat]).addTo(map)
      marqueurs.push(m)
      repere.current = m
      premier.current = true
      // Le contenu du marqueur est rendu au cadre suivant, une fois l'élément posé sur le plan.
      cadre = requestAnimationFrame(() => setHote(el))
    }
    return () => {
      cancelAnimationFrame(cadre)
      suivi.disconnect()
      for (const m of marqueurs) m.remove()
      map.remove()
      carte.current = null
      repere.current = null
      setHote(null)
    }
    // `cle` résume les positions : les tableaux sont recréés à chaque rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle, zoom, vignette])

  // Une autre fiche choisie : le repère la rejoint, le plan s'éloigne puis revient sur elle.
  useEffect(() => {
    const map = carte.current
    if (premier.current) {
      premier.current = false
      return
    }
    if (!map || !repere.current || principal?.lon == null || principal.lat == null) return
    repere.current.setLngLat([principal.lon, principal.lat])
    map.flyTo({ center: [principal.lon, principal.lat], zoom: 15, padding: children ? { top: 440, bottom: 0, left: 0, right: 0 } : undefined, speed: 1.1, curve: 1.6, essential: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [principal?.lon, principal?.lat])

  useEffect(() => {
    if (!resolvedTheme || !carte.current) return
    const voulu = styleCarte(resolvedTheme)
    if (voulu === style.current) return
    style.current = voulu
    carte.current.setStyle(voulu)
  }, [resolvedTheme])

  return (
    <>
      {/* MapLibre pose `position: relative` sur son conteneur : le cadre absolu est porté par un parent. */}
      {/* La mention des sources en blanc, son « i » aussi : sur le plan sombre, le gris par défaut ne se lit pas. */}
      <div className="absolute inset-0 [&_.maplibregl-ctrl-attrib]:!bg-black/45 [&_.maplibregl-ctrl-attrib]:!text-white [&_.maplibregl-ctrl-attrib]:text-[10px] [&_.maplibregl-ctrl-attrib_a]:!text-white [&_.maplibregl-ctrl-attrib-button]:invert">
        <div ref={conteneur} className="size-full" />
      </div>
      {hote &&
        createPortal(
          <>
            {children && <div className="mb-3">{children}</div>}
            <span className="grid size-14 place-items-center rounded-full bg-teal/20">
              <span className="grid size-9 place-items-center rounded-full border-2 border-bg bg-teal text-white shadow-pop">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
            </span>
          </>,
          hote,
        )}
    </>
  )
}
