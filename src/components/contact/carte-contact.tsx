import { MentionsHero } from '@/components/home/MentionsHero'
import { Carte } from '@/components/map/carte'
import { empriseAutour } from '@/lib/annuaire/emprise'

/**
 * Le panneau à droite du formulaire : la carte des praticiens, comme sur le
 * hero de l'accueil, teintée en ardoise et rendue inerte. DentalMap n'a pas
 * de boutique à situer ; ce que la page montre, c'est le produit. Les sources
 * de la carte se déplient depuis le « i », le même que sur l'accueil.
 */
const EMPRISE = empriseAutour(-0.5792, 44.8378, 2600)

export function CarteContact() {
  return (
    <div className="relative hidden min-h-[640px] overflow-hidden rounded-3xl bg-ardoise lg:block">
      <div
        aria-hidden
        inert
        className="pointer-events-none absolute inset-0 [&_.maplibregl-ctrl-bottom-right]:hidden [&_.maplibregl-ctrl-top-right]:hidden"
      >
        <Carte profession="dentistes" emprise={EMPRISE} className="size-full" />
        <div className="absolute inset-0 bg-ardoise mix-blend-color" />
        <div className="absolute inset-0 [box-shadow:inset_0_0_120px_20px_color-mix(in_oklch,var(--color-ardoise)_80%,transparent)]" />
      </div>
      <MentionsHero />
    </div>
  )
}
