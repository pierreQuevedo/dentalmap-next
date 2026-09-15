/**
 * Contraste WCAG 2.1.
 *
 * Source unique, partagée par le guide de style et les scripts de design :
 * la même formule écrite deux fois finit toujours par diverger, et c'est le
 * genre d'écart que personne ne remarque avant une réclamation.
 *
 * Seuils, pour du texte : 4,5 en AA, 7 en AAA. Pour du gros texte, à partir de
 * 18,66 px gras ou 24 px : 3 en AA, 4,5 en AAA. Un libellé de bouton à 15 px
 * semi-gras reste du texte courant.
 */
export const SEUILS = { aa: 4.5, aaa: 7, aaGrand: 3, aaaGrand: 4.5 } as const

const canal = (v: number) => {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function luminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16)
  return (
    0.2126 * canal((n >> 16) & 255) +
    0.7152 * canal((n >> 8) & 255) +
    0.0722 * canal(n & 255)
  )
}

export function contraste(a: string, b: string): number {
  const [haut, bas] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (haut + 0.05) / (bas + 0.05)
}

/** « AAA », « AA » ou null si la paire ne passe même pas AA. */
export function niveau(rapport: number, grandTexte = false): 'AAA' | 'AA' | null {
  const { aaa, aaaGrand, aa, aaGrand } = SEUILS
  if (rapport >= (grandTexte ? aaaGrand : aaa)) return 'AAA'
  if (rapport >= (grandTexte ? aaGrand : aa)) return 'AA'
  return null
}
