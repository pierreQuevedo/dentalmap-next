import { MentionsHero } from '@/components/home/MentionsHero'
import { Carte } from '@/components/map/carte'
import { empriseAutour } from '@/lib/annuaire/emprise'

/**
 * Le panneau à droite du formulaire : la carte des praticiens, comme sur le
 * hero de l'accueil, teintée en ardoise et rendue inerte, et par-dessus ce
 * qui se passe une fois le message envoyé. En mobile, la carte s'efface :
 * le panneau, plus petit, garde son fond sombre et ses trois étapes. Les sources de la carte se
 * déplient depuis le « i », le même que sur l'accueil.
 */
const EMPRISE = empriseAutour(-0.5792, 44.8378, 2600)

const ETAPES = [
  { titre: 'Accusé à l’écran', texte: 'Dès l’envoi, sans compte à créer.' },
  { titre: 'Une personne vous lit', texte: 'Chaque message est lu par une personne de l’équipe.' },
  { titre: 'Une réponse par email', texte: 'Pour vos données personnelles, sous un mois au plus.' },
] as const

export function CarteContact() {
  return (
    <div className="squircle-3xl dark relative flex flex-col lg:min-h-[420px] justify-end overflow-hidden bg-background p-6 text-fg md:p-8 lg:min-h-full">
      <div
        aria-hidden
        inert
        className="pointer-events-none absolute inset-0 hidden lg:block [&_.maplibregl-ctrl-bottom-right]:hidden [&_.maplibregl-ctrl-top-right]:hidden"
      >
        <Carte profession="dentistes" emprise={EMPRISE} className="size-full" />
        <div className="absolute inset-0 z-10 bg-ardoise mix-blend-color" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background from-45% via-background/80 to-background/10" />
      </div>
      <div className="relative z-20">
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Et ensuite ?
          <span className="block text-white/55">Trois étapes, pas plus.</span>
        </h2>
        <ol className="mt-6">
          {ETAPES.map((e, k) => (
            <li key={e.titre} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 border-t border-white/10 py-4">
              <span className="text-3xl font-light tabular-nums tracking-tight text-white" aria-hidden>
                {String(k + 1).padStart(2, '0')}
              </span>
              <span>
                <span className="block font-semibold text-white">{e.titre}</span>
                <span className="block text-sm text-white/65">{e.texte}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="hidden lg:block">
        <MentionsHero />
      </div>
    </div>
  )
}
