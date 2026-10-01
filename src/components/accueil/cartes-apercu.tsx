/**
 * Aperçu illustratif des quatre types de résultats.
 *
 * Ces cartes ne portent aucune donnée : elles montrent la forme d'un résultat
 * avant que l'utilisateur ait cherché quoi que ce soit, ce qu'aucune phrase ne
 * fait aussi vite. Elles sont donc explicitement marquées « Exemple » et
 * retirées de l'arbre d'accessibilité, remplacées par une seule phrase lue par
 * les lecteurs d'écran.
 *
 * Deux règles pèsent ici. La première interdit de mettre en avant un
 * professionnel sur l'accueil : les noms affichés sont inventés et le disent.
 * La seconde interdit de présenter du déclaratif comme officiel : la mention
 * de vérification est reproduite telle qu'elle apparaît sur une vraie fiche,
 * sans l'embellir.
 */
type Exemple = {
  cle: string
  icone: 'dent' | 'labo' | 'ecole' | 'formation'
  nom: string
  role: string
  lieu: string
  mention: string
  verifie: boolean
  detail: string
}

const EXEMPLES: Exemple[] = [
  {
    cle: 'dentiste',
    icone: 'dent',
    nom: 'Dr Camille Rivière',
    role: 'Chirurgien-dentiste',
    lieu: 'Bordeaux · 33000',
    mention: 'Vérifié auprès des registres officiels',
    verifie: true,
    detail: '1,2 km',
  },
  {
    cle: 'prothesiste',
    icone: 'labo',
    nom: 'Laboratoire Artemis Dentaire',
    role: 'Prothèse dentaire',
    lieu: 'Mérignac · 33700',
    mention: 'Vérifié auprès des registres officiels',
    verifie: true,
    detail: '4,8 km',
  },
  {
    cle: 'ecole',
    icone: 'ecole',
    nom: 'École de prothèse dentaire',
    role: 'BTS prothésiste dentaire',
    lieu: 'Talence · 33400',
    mention: 'Établissement référencé',
    verifie: false,
    detail: '6,1 km',
  },
  {
    cle: 'formation',
    icone: 'formation',
    nom: 'Implantologie, module initial',
    role: 'Formation continue',
    lieu: 'Bordeaux · 3 jours',
    mention: 'Formation déclarée par l’organisme',
    verifie: false,
    detail: 'Mars 2027',
  },
]

export function CartesApercu() {
  return (
    <>
      <p className="sr-only">
        Aperçu illustratif des résultats de recherche : une fiche de chirurgien-dentiste, une de laboratoire de
        prothèse, une d’école et une de formation. Les noms sont fictifs.
      </p>

      <div
        aria-hidden
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:-mx-10 sm:px-10 lg:mx-0 lg:w-[23rem] lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {EXEMPLES.map((e, i) => (
          <article
            key={e.cle}
            data-hero="carte"
            className={`squircle-2xl relative w-[17rem] shrink-0 snap-start border border-line bg-bg/80 p-4 shadow-pop backdrop-blur-xl lg:w-full ${
              i % 2 === 1 ? 'lg:ml-10' : 'lg:ml-0'
            }`}
          >
            {/*
              La mention sort du flux : dans la colonne, elle mangeait le tiers
              de la largeur du nom, et « Laboratoire Artemis Dentaire » se
              terminait en points de suspension.
            */}
            <span className="squircle-full absolute -top-2 right-4 border border-line bg-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[.08em] text-fg-2">
              Exemple
            </span>

            <div className="flex items-start gap-3">
              <span className="squircle-md flex size-11 shrink-0 items-center justify-center bg-bg-soft text-fg">
                <Pictogramme nom={e.icone} className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-fg">{e.nom}</p>
                <p className="truncate text-sm text-fg-2">{e.role}</p>
                <p className="truncate text-sm text-fg-2">{e.lieu}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
              <span
                className={`squircle-full inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                  e.verifie ? 'bg-bg-soft text-fg ring-line' : 'bg-bg-soft text-fg-2 ring-line'
                }`}
              >
                {e.verifie && (
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3 shrink-0"
                    aria-hidden
                  >
                    <path d="M3 8.5l3.5 3.5L13 5" />
                  </svg>
                )}
                {e.mention}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-fg-2">{e.detail}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

const CHEMINS: Record<Exemple['icone'], string> = {
  dent: 'M8.2 3.4c1.2 0 1.8.7 3.8.7s2.6-.7 3.8-.7c2.1 0 3.5 1.6 3.5 4.1 0 2.9-1 4-1.5 6.9-.5 2.5-.7 5.1-2.2 5.1-1.4 0-1.5-2.3-1.9-4.1-.3-1.4-.6-2.3-1.7-2.3s-1.4.9-1.7 2.3c-.4 1.8-.5 4.1-1.9 4.1-1.5 0-1.7-2.6-2.2-5.1-.5-2.9-1.5-4-1.5-6.9 0-2.5 1.4-4.1 3.5-4.1z',
  labo: 'M9.5 3h5M10.5 3v6L5.4 18.1A2 2 0 0 0 7.1 21h9.8a2 2 0 0 0 1.7-2.9L13.5 9V3M7.6 14.5h8.8',
  ecole: 'M3 9l9-4 9 4-9 4-9-4zM7 11v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5M21 9v6',
  formation: 'M4 5h16v10H4zM8 19h8M12 15v4M8.5 9.5h7',
}

function Pictogramme({ nom, className }: { nom: Exemple['icone']; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={CHEMINS[nom]} />
    </svg>
  )
}
