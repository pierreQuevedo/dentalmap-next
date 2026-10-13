/**
 * Pièces communes aux pages d'erreur : héros sombre sous l'en-tête
 * transparent, dans la direction d'À propos.
 */
import Image from 'next/image'
import { MapPin } from 'lucide-react'

/** Fond commun : le plan de Bordeaux, teinté et voilé, sur le fond sombre, avec le code d'erreur en filigrane. */
export function Fond({ chiffre }: { chiffre?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image src="/images/cartes/bordeaux.jpg" alt="" fill priority sizes="100vw" className="scale-110 object-cover opacity-[0.10] blur-[2px] grayscale" />
      <div className="absolute inset-0 [background:radial-gradient(ellipse_60%_55%_at_50%_42%,transparent_0%,var(--background)_85%)]" />
      {chiffre && (
        <p className="absolute inset-x-0 top-[12%] select-none text-center text-[38vw] font-semibold leading-none tracking-tighter text-white/[0.045] md:top-[6%] md:text-[30vw]">
          {chiffre}
        </p>
      )}
    </div>
  )
}

/** Le repère vide : un point de la carte sans fiche dessous. */
export function RepereVide() {
  return (
    <div aria-hidden className="relative mx-auto grid size-20 place-items-center">
      <span className="absolute inset-0 rounded-full border border-dashed border-white/25" />
      <span className="absolute inset-3 rounded-full border border-white/10" />
      <MapPin className="size-8 text-teal" strokeWidth={1.5} />
    </div>
  )
}
