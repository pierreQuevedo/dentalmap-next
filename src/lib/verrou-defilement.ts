/**
 * Bloque le défilement de la page sous un tiroir ou une carte plein écran.
 *
 * La barre de défilement disparaît avec `overflow: hidden` : sans la place
 * qu'elle occupait rendue en marge, toute la page, en-tête compris, se
 * décalerait vers la droite à l'ouverture. Rend la fonction qui déverrouille.
 */
export function verrouillerDefilement(): () => void {
  const corps = document.body
  const precedent = { overflow: corps.style.overflow, paddingRight: corps.style.paddingRight }
  const barre = window.innerWidth - document.documentElement.clientWidth
  corps.style.overflow = 'hidden'
  if (barre > 0) corps.style.paddingRight = `${barre}px`
  return () => {
    corps.style.overflow = precedent.overflow
    corps.style.paddingRight = precedent.paddingRight
  }
}
