/**
 * La carte décorative de l'espace compte : l'ouest et le sud-ouest de la
 * France par départements, en filet clair sur ardoise, semés de tous les
 * lieux d'exercice de l'annuaire, et des trajets qui se tracent d'une ville
 * à l'autre. Chaque point est une commune où l'annuaire a au moins un
 * cabinet ou un laboratoire, gros comme son effectif : la densité dit l'usage.
 *
 * C'est une image SVG statique, générée par `scripts/design/france-svg.mjs`
 * avec ses animations dedans : trois mille points dans la page pèseraient un
 * méga-octet de HTML, ici c'est un fichier mis en cache. Elle se recadre par
 * `object-cover`, le centre de la fenêtre reste visible.
 */
export function CarteFrance({ className = '' }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- SVG statique, aucune optimisation à attendre de next/image.
  return <img src="/images/compte/carte-ouest.svg" alt="" aria-hidden className={`object-cover ${className}`} />
}
