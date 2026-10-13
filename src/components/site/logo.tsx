import Image from 'next/image'

/**
 * Le logo DentalMap : pictogramme et marque. Version encre en thème clair,
 * version blanche en thème sombre et sur un hero sombre à en-tête transparent
 * (voir `data-logo` dans globals.css) ; le texte de remplacement porte le nom.
 * Images dans public/images/marque (442 × 96), pictogramme à fond topographique.
 */
const RATIO = 442 / 96

export function Logo({ hauteur = 30, className = '', priorite = false }: { hauteur?: number; className?: string; priorite?: boolean }) {
  const largeur = Math.round(hauteur * RATIO)
  return (
    <span className={`inline-flex shrink-0 ${className}`} style={{ height: hauteur, width: largeur }}>
      <Image src="/images/marque/logo-dentalmap.png" alt="DentalMap" width={largeur} height={hauteur} priority={priorite} data-logo="encre" className="size-full dark:hidden" />
      <Image src="/images/marque/logo-dentalmap-blanc.png" alt="DentalMap" width={largeur} height={hauteur} priority={priorite} data-logo="blanc" className="hidden size-full dark:block" />
    </span>
  )
}
