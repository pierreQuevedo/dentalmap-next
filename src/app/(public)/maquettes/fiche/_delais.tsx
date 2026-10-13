/** MAQUETTE. Section « Délais de fabrication » retenue pour la fiche labo : la frise (B2 · Délais 1). */
import { CircleCheck } from 'lucide-react'
import { LABO as L } from './_donnees'

const JOURS = Array.from({ length: Math.max(...L.delais.map((d) => d.jours)) }, (_, i) => i + 1)
const COLONNES = 'grid-cols-[minmax(12rem,18rem)_repeat(10,minmax(0,1fr))_7rem]'

function AJour() {
  return (
    <span className="squircle-full inline-flex items-center gap-1.5 bg-teal/10 px-2.5 py-0.5 text-xs font-medium text-teal ring-1 ring-inset ring-teal/30">
      <CircleCheck className="size-3.5" aria-hidden /> Délais confirmés le {L.delaisLe}
    </span>
  )
}

/** Frise des délais moyens, en jours ouvrés. Sur mobile, une barre par pièce. */
export function SectionDelais() {
  return (
    <section className="container py-20 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
          Délais de fabrication
          <span className="block text-fg-2">Délais moyens en jours ouvrés, de la réception de l’empreinte à l’expédition.</span>
        </h2>
        <AJour />
      </div>

      {/* Desktop : planning de J1 à J10. */}
      <div className="squircle-2xl mt-10 hidden overflow-hidden border border-line md:block">
        <div className={`grid ${COLONNES} items-center border-b border-line bg-bg-soft text-xs font-medium uppercase tracking-wide text-fg-2`}>
          <span className="px-5 py-3">Pièce</span>
          {JOURS.map((j) => (
            <span key={j} className="py-3 text-center tabular-nums">
              J{j}
            </span>
          ))}
          <span className="py-3 pr-5 text-right">Délai moyen</span>
        </div>
        {L.delais.map((d) => (
          <div key={d.piece} className={`grid ${COLONNES} items-center border-b border-line last:border-0`}>
            <span className="px-5 py-4 text-sm text-fg">{d.piece}</span>
            {JOURS.map((j) => (
              <span key={j} className="px-0.5 py-4">
                <span
                  className={`block h-6 ${j <= d.jours ? (j === d.jours ? 'rounded-r-full bg-teal' : 'bg-teal/25') : ''} ${j === 1 && j <= d.jours ? 'rounded-l-full' : ''}`}
                />
              </span>
            ))}
            <span className="py-4 pr-5 text-right text-sm font-semibold tabular-nums text-fg">{d.jours} j ouvrés</span>
          </div>
        ))}
      </div>

      {/* Mobile : une barre par pièce, à l'échelle du plus long délai. */}
      <ul className="squircle-2xl mt-8 divide-y divide-line border border-line md:hidden">
        {L.delais.map((d) => (
          <li key={d.piece} className="p-4">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-fg">{d.piece}</span>
              <span className="shrink-0 font-semibold tabular-nums text-fg">{d.jours} j ouvrés</span>
            </div>
            <span className="mt-2 block h-2 overflow-hidden rounded-full bg-teal/15">
              <span className="block h-full rounded-full bg-teal" style={{ width: `${(d.jours / JOURS.length) * 100}%` }} />
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-fg-2">Délais moyens déclarés par le laboratoire, à reconfirmer tous les six mois. Au-delà de douze mois sans confirmation, ils ne sont plus affichés.</p>
    </section>
  )
}
