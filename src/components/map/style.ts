/**
 * Le style de la carte, clair ou sombre.
 *
 * Deux fichiers dans `public/maplibre/`, générés par
 * `scripts/design/style-carte.mjs` à partir du style positron d'OpenFreeMap
 * avec la palette du site. Les tuiles, les glyphes et le sprite restent ceux
 * d'OpenFreeMap ; seules les couleurs changent.
 */
export function styleCarte(theme: string | undefined): string {
  return theme === 'dark' ? '/maplibre/dentalmap-sombre.json' : '/maplibre/dentalmap-clair.json'
}

/** Style du premier rendu, d'après la classe posée sur le document par next-themes. */
export function styleCarteInitial(): string {
  if (typeof document === 'undefined') return styleCarte(undefined)
  return styleCarte(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
}
