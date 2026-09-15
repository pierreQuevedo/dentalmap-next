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

/** Indique le thème effectivement appliqué, pour lever le doute pendant la revue. */
export function ThemeActif() {
  const sombre = useSyncExternalStore(
    abonnerAuTheme,
    () => document.documentElement.classList.contains('dark'),
    () => false,
  )
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-fg-2">
      <span aria-hidden className={`size-2 rounded-full ${sombre ? 'bg-chart-2' : 'bg-brand'}`} />
      Thème appliqué : {sombre ? 'sombre' : 'clair'}
    </span>
  )
}
