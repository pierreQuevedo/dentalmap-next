import { DEPARTEMENTS, TAILLE, VILLES } from './france'

/**
 * La carte décorative de l'espace compte : la France par départements, en
 * filet clair sur fond sombre, et des trajets qui se tracent d'une ville à
 * l'autre, l'un après l'autre, comme une recherche qui trouve.
 *
 * Tout est en SVG et en CSS : les contours viennent de la géométrie des
 * départements, projetée une fois pour toutes par `scripts/design/france-svg.mjs` ;
 * les trajets sont des courbes dont le trait se dessine par `stroke-dashoffset`,
 * voir `.trajet` dans `globals.css`. Rien ne tourne quand l'animation est
 * réduite : les trajets restent dessinés.
 */
const TRAJETS: [keyof typeof VILLES, keyof typeof VILLES][] = [
  ['paris', 'bordeaux'],
  ['lille', 'marseille'],
  ['nantes', 'strasbourg'],
  ['toulouse', 'rennes'],
  ['lyon', 'brest'],
]
const DUREE = 4.2

function courbe(a: [number, number], b: [number, number]): string {
  // Le point de contrôle est décalé perpendiculairement : l'arc respire.
  const mx = (a[0] + b[0]) / 2
  const my = (a[1] + b[1]) / 2
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const k = 0.22
  return `M${a[0]} ${a[1]} Q${(mx - dy * k).toFixed(1)} ${(my + dx * k).toFixed(1)} ${b[0]} ${b[1]}`
}

export function CarteFrance({ className = '' }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${TAILLE} ${TAILLE}`} className={className} aria-hidden>
      <defs>
        <radialGradient id="carte-france-halo" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#2fd1d1" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2fd1d1" stopOpacity="0" />
        </radialGradient>
        <filter id="carte-france-lueur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <rect width={TAILLE} height={TAILLE} fill="url(#carte-france-halo)" />
      <path d={DEPARTEMENTS} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.28)" strokeWidth="0.7" strokeLinejoin="round" />

      {TRAJETS.map(([de, vers], i) => {
        const d = courbe(VILLES[de]!, VILLES[vers]!)
        const style = { animationDelay: `${i * (DUREE / TRAJETS.length)}s`, animationDuration: `${DUREE * 1.6}s` } as React.CSSProperties
        return (
          <g key={`${de}-${vers}`}>
            <path d={d} pathLength={1} className="trajet trajet-lueur" style={style} filter="url(#carte-france-lueur)" />
            <path d={d} pathLength={1} className="trajet" style={style} />
            <circle cx={VILLES[vers]![0]} cy={VILLES[vers]![1]} r="3.2" className="trajet-arrivee" style={style} />
          </g>
        )
      })}

      {Object.entries(VILLES).map(([nom, [x, y]]) => (
        <g key={nom}>
          <circle cx={x} cy={y} r="5.5" fill="#2fd1d1" fillOpacity="0.16" />
          <circle cx={x} cy={y} r="2.1" fill="#2fd1d1" />
        </g>
      ))}
    </svg>
  )
}
