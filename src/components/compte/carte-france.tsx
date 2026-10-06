import { VERSION_CARTE } from './carte-ouest'

/**
 * La carte décorative de l'espace compte : l'ouest et le sud-ouest de la
 * France en carte pointillée, une trame de petits points qui remplit les
 * terres, dans les gris du site, ceux des cartes « Rien de déclaratif » de
 * l'accueil. Des points s'allument lentement, plus nombreux là où l'annuaire
 * compte plus de professionnels.
 *
 * Deux images SVG statiques, une par thème, générées par
 * `scripts/design/france-svg.mjs` : des milliers de points dans la page
 * pèseraient un méga-octet de HTML, ici ce sont des fichiers mis en cache,
 * dont l'adresse porte une empreinte du contenu. Le thème choisit l'image par
 * la classe `dark` du document, comme le reste du site.
 */
export function CarteFrance({ className = '' }: { className?: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG statique, aucune optimisation à attendre de next/image. */}
      <img src={`/images/compte/carte-ouest-clair.svg?v=${VERSION_CARTE.clair}`} alt="" aria-hidden className={`object-cover dark:hidden ${className}`} />
      {/* eslint-disable-next-line @next/next/no-img-element -- idem. */}
      <img src={`/images/compte/carte-ouest-sombre.svg?v=${VERSION_CARTE.sombre}`} alt="" aria-hidden className={`hidden object-cover dark:block ${className}`} />
    </>
  )
}
