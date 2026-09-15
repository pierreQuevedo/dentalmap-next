'use client'

import { useSyncExternalStore } from 'react'

/**
 * Lecture des valeurs de thème depuis le DOM, et non depuis une liste écrite à
 * la main dans ce fichier.
 *
 * C'est la seule façon qu'un guide de style ne mente pas : ce qui est affiché
 * ici est exactement ce que le navigateur applique au site, et la valeur suit
 * la bascule clair / sombre sans recharger la page.
 */
function abonnerAuTheme(rappel: () => void) {
  const observateur = new MutationObserver(rappel)
  observateur.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observateur.disconnect()
}

export function useValeurCss(nom: string) {
  return useSyncExternalStore(
    abonnerAuTheme,
    () => getComputedStyle(document.documentElement).getPropertyValue(nom).trim(),
    () => '',
  )
}

/**
 * Valeur peinte, en hexadécimal.
 *
 * `getComputedStyle` rend les couleurs `oklch` sous forme `lab(...)` dans les
 * navigateurs Chromium, illisible pour valider une charte, et la sérialisation
 * du canvas les rend telles quelles. Peindre un pixel puis le relire force la
 * conversion en sRGB, seule forme qu'un outil de design saura reprendre.
 *
 * La sentinelle repère une valeur que le navigateur n'a pas su lire : sans
 * elle, une couleur invalide s'afficherait en noir au lieu d'être signalée.
 */
const SENTINELLE = '#010203'

function versHex(valeur: string) {
  if (!valeur) return ''
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const contexte = canvas.getContext('2d', { willReadFrequently: true })
  if (!contexte) return valeur

  contexte.fillStyle = SENTINELLE
  contexte.fillStyle = valeur
  if (String(contexte.fillStyle).toLowerCase() === SENTINELLE) return valeur

  contexte.clearRect(0, 0, 1, 1)
  contexte.fillRect(0, 0, 1, 1)
  const [r, v, b, a] = contexte.getImageData(0, 0, 1, 1).data
  if (a === 255) {
    return `#${[r, v, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
  }
  return `rgb(${r} ${v} ${b} / ${Math.round((a / 255) * 100)}%)`
}

/** Composantes sRGB d'une couleur peinte, pour le calcul de contraste. */
function versRgb(valeur: string): [number, number, number] | null {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const contexte = canvas.getContext('2d', { willReadFrequently: true })
  if (!contexte) return null
  contexte.fillStyle = SENTINELLE
  contexte.fillStyle = valeur
  if (String(contexte.fillStyle).toLowerCase() === SENTINELLE) return null
  contexte.clearRect(0, 0, 1, 1)
  contexte.fillRect(0, 0, 1, 1)
  const [r, v, b] = contexte.getImageData(0, 0, 1, 1).data
  return [r, v, b]
}

const canalLineaire = (v: number) => {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/**
 * Rapport de contraste WCAG entre deux jetons, mesuré sur les couleurs
 * réellement peintes par le navigateur.
 *
 * Calculé ici plutôt que recopié d'un tableur : un rapport noté à la main
 * devient faux au premier ajustement de teinte, et personne ne s'en aperçoit.
 */
export function useContraste(jetonTexte: string, jetonFond: string) {
  const texte = useValeurCss(`--${jetonTexte}`)
  const fond = useValeurCss(`--${jetonFond}`)
  if (!texte || !fond) return null
  const a = versRgb(texte)
  const b = versRgb(fond)
  if (!a || !b) return null
  const [l1, l2] = [a, b]
    .map(([r, v, bl]) => 0.2126 * canalLineaire(r) + 0.7152 * canalLineaire(v) + 0.0722 * canalLineaire(bl))
    .sort((m, n) => n - m)
  return (l1 + 0.05) / (l2 + 0.05)
}

export function Contraste({
  texte,
  fond,
  libelle,
  seuil = 4.5,
}: {
  texte: string
  fond: string
  libelle: string
  /** 4,5 pour du texte courant, 3 pour un élément d'interface. */
  seuil?: number
}) {
  const rapport = useContraste(texte, fond)
  const passe = rapport !== null && rapport >= seuil
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-b-0">
      <span className="min-w-0">
        <span className="block text-sm text-fg">{libelle}</span>
        <span className="block font-mono text-xs text-fg-2">
          --{texte} sur --{fond}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className={`block text-sm font-semibold tabular-nums ${passe ? 'text-verifie' : 'text-partiel'}`}>
          {rapport ? `${rapport.toFixed(2)}:1` : '…'}
        </span>
        <span className="block text-xs text-fg-2">seuil {seuil.toString().replace('.', ',')}</span>
      </span>
    </div>
  )
}

export function Jeton({
  nom,
  classe,
  note,
  bordure,
}: {
  /** Nom de la variable, sans les deux tirets. */
  nom: string
  /** Classe Tailwind correspondante, celle qu'on écrit dans les composants. */
  classe: string
  note?: string
  /** Pour les teintes claires, qui disparaîtraient sur fond blanc. */
  bordure?: boolean
}) {
  const valeur = useValeurCss(`--${nom}`)
  const hex = valeur ? versHex(valeur) : ''
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className={`size-11 shrink-0 rounded-lg ${classe} ${bordure ? 'border border-line-strong' : ''}`}
      />
      <span className="min-w-0">
        <span className="block font-mono text-[13px] text-fg">--{nom}</span>
        <span className="block truncate font-mono text-xs text-fg-2" title={valeur}>
          {hex || '…'}
        </span>
        <span className="block text-xs text-fg-2">{note ?? classe}</span>
      </span>
    </div>
  )
}

export function Mesure({ nom, apercu }: { nom: string; apercu: React.ReactNode }) {
  const valeur = useValeurCss(`--${nom}`)
  return (
    <div className="flex items-center gap-4">
      {apercu}
      <span className="min-w-0">
        <span className="block font-mono text-[13px] text-fg">--{nom}</span>
        <span className="block truncate font-mono text-xs text-fg-2" title={valeur}>
          {valeur || '…'}
        </span>
      </span>
    </div>
  )
}

/** Vrai quand le thème sombre est appliqué. Suit la bascule sans rechargement. */
export function useThemeSombre() {
  return useSyncExternalStore(
    abonnerAuTheme,
    () => document.documentElement.classList.contains('dark'),
    () => false,
  )
}

/** Indique le thème effectivement appliqué, pour lever le doute pendant la revue. */
export function ThemeActif() {
  const sombre = useThemeSombre()
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-fg-2">
      <span aria-hidden className={`size-2 rounded-full ${sombre ? 'bg-chart-2' : 'bg-brand'}`} />
      Thème appliqué : {sombre ? 'sombre' : 'clair'}
    </span>
  )
}
