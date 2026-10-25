/**
 * Délais de fabrication d'un laboratoire, en frise : une ligne par pièce, une
 * colonne par jour ouvré. Sur mobile, une barre par pièce.
 *
 * Délais déclarés par le laboratoire, à reconfirmer tous les six mois ; au-delà
 * de douze mois sans confirmation, ils ne sont plus affichés (voir `delaisAffiches`).
 */
import { CircleCheck } from 'lucide-react'
import { PIECES, libellePiece } from '@/lib/espace-pro/labo'
import type { FicheCompletee } from '@/lib/espace-pro/fiche-completee'
import { dateLongue } from './fiche-blocs'

const EXPIRATION_JOURS = 365

/** Les délais à afficher, dans l'ordre de la liste des pièces ; vide s'ils ont expiré. */
export function delaisAffiches(f: FicheCompletee, maintenant: Date): { piece: string; jours: number }[] {
  const delais = f.delais ?? {}
  const confirme = new Date(f.delaisConfirmesLe ?? f.majLe).getTime()
  if (maintenant.getTime() - confirme > EXPIRATION_JOURS * 86_400_000) return []
  const ordre = (code: string) => {
    const i = PIECES.findIndex((p) => p.code === code)
    return i === -1 ? PIECES.length : i
  }
  return Object.entries(delais)
    .filter(([, j]) => Number.isFinite(j) && j > 0)
    .sort(([a], [b]) => ordre(a) - ordre(b))
    .map(([code, jours]) => ({ piece: libellePiece(code), jours }))
}

export function SectionDelais({ delais, confirmeLe }: { delais: { piece: string; jours: number }[]; confirmeLe: string }) {
  const max = Math.max(...delais.map((d) => d.jours))
  const jours = Array.from({ length: max }, (_, i) => i + 1)
  const colonnes = { gridTemplateColumns: `minmax(12rem,18rem) repeat(${max}, minmax(0,1fr)) 7rem` }
  return (
    <section id="delais" className="container scroll-mt-24 py-20 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
          Délais de fabrication
          <span className="block text-fg-2">Délais moyens en jours ouvrés, de la réception de l’empreinte à l’expédition.</span>
        </h2>
        <span className="squircle-full inline-flex items-center gap-1.5 bg-teal/10 px-2.5 py-0.5 text-xs font-medium text-teal ring-1 ring-inset ring-teal/30">
          <CircleCheck className="size-3.5" aria-hidden /> Délais confirmés le {dateLongue(confirmeLe)}
        </span>
      </div>

      {/* Desktop : planning de J1 au plus long délai. */}
      <div className="squircle-2xl mt-10 hidden overflow-hidden border border-line md:block">
        <div style={colonnes} className="grid items-center border-b border-line bg-bg-soft text-xs font-medium uppercase tracking-wide text-fg-2">
          <span className="px-5 py-3">Pièce</span>
          {jours.map((j) => (
            <span key={j} className="py-3 text-center tabular-nums">
              {max <= 15 || j % 5 === 0 || j === 1 ? `J${j}` : ''}
            </span>
          ))}
          <span className="py-3 pr-5 text-right">Délai moyen</span>
        </div>
        {delais.map((d) => (
          <div key={d.piece} style={colonnes} className="grid items-center border-b border-line last:border-0">
            <span className="px-5 py-4 text-sm text-fg">{d.piece}</span>
            {jours.map((j) => (
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
        {delais.map((d) => (
          <li key={d.piece} className="p-4">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-fg">{d.piece}</span>
              <span className="shrink-0 font-semibold tabular-nums text-fg">{d.jours} j ouvrés</span>
            </div>
            <span className="mt-2 block h-2 overflow-hidden rounded-full bg-teal/15">
              <span className="block h-full rounded-full bg-teal" style={{ width: `${(d.jours / max) * 100}%` }} />
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-fg-2">
        Délais moyens renseignés par le laboratoire, à reconfirmer tous les six mois. Au-delà de douze mois sans confirmation, ils ne sont plus affichés. Ce n’est pas un engagement.
      </p>
    </section>
  )
}
