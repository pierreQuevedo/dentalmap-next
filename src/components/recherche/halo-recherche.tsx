/**
 * Le halo de recherche : la lueur d'Apple Intelligence au bord de l'écran
 * pendant qu'on choisit un lieu, dans la palette de DentalMap.
 *
 * Le modèle est un dégradé linéaire qui remplit tout le cadre et dont l'angle
 * tourne en continu, recouvert d'un voile de la couleur du fond, flouté, qui
 * laisse le dégradé déborder sur le pourtour : un bord net de deux pixels et,
 * derrière lui, une lueur douce qui s'éteint vers l'intérieur. Ici le voile
 * cacherait la page, puisque le halo flotte au-dessus d'elle ; le même rendu
 * est obtenu avec un masque qui ne garde du dégradé que le pourtour, net sur
 * le bord, fondu vers l'intérieur.
 *
 * Deux calques portent le même dégradé et tournent ensemble : la lueur,
 * masquée en dégradé depuis chaque bord, et le bord, un anneau de deux
 * pixels. Le tout apparaît et s'efface en fondu avec le focus du champ de
 * lieu, sans jamais gêner le pointeur. Voir `.halo-recherche` dans
 * `globals.css`.
 */
export function HaloRecherche({ actif }: { actif: boolean }) {
  return (
    <div aria-hidden className="halo-recherche" data-actif={actif ? 'true' : 'false'}>
      <div className="halo-lueur" />
      <div className="halo-bord" />
    </div>
  )
}
