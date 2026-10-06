/**
 * La carte décorative de l'espace compte : l'ouest et le sud-ouest de la
 * France en carte pointillée, une trame de petits points qui remplit les
 * terres, dans les gris ardoise du site. Rien ne bouge.
 *
 * C'est une image SVG statique, générée par `scripts/design/france-svg.mjs` :
 * des milliers de points dans la page pèseraient un méga-octet de HTML, ici
 * c'est un fichier mis en cache. Elle se recadre par `object-cover`, le
 * centre de la fenêtre reste visible.
 */
export function CarteFrance({ className = '' }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- SVG statique, aucune optimisation à attendre de next/image.
  return <img src="/images/compte/carte-ouest.svg" alt="" aria-hidden className={`object-cover ${className}`} />
}
