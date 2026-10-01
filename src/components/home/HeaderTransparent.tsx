'use client'

import { useEffect } from 'react'

const SEUIL = 12

/**
 * Pose `data-hero="transparent"` sur `<html>` tant que la page est en haut,
 * et le retire au premier défilement. Le style de l'en-tête suit, voir
 * `globals.css`. Un script en ligne fait la même chose avant l'hydratation,
 * pour que la barre n'apparaisse pas opaque le temps que React arrive.
 *
 * L'attribut est retiré au démontage : une autre page ne doit pas hériter
 * d'un en-tête transparent.
 */
export function HeaderTransparent() {
  useEffect(() => {
    const appliquer = () => {
      if (window.scrollY < SEUIL) document.documentElement.setAttribute('data-hero', 'transparent')
      else document.documentElement.removeAttribute('data-hero')
    }
    appliquer()
    window.addEventListener('scroll', appliquer, { passive: true })
    return () => {
      window.removeEventListener('scroll', appliquer)
      document.documentElement.removeAttribute('data-hero')
    }
  }, [])

  return (
    <script
      // Exécuté au parsing : l'état transparent est là dès la première peinture.
      dangerouslySetInnerHTML={{
        __html: `if(window.scrollY<${SEUIL})document.documentElement.setAttribute('data-hero','transparent')`,
      }}
    />
  )
}
