/** L'anneau de force, en SVG. */
export function Anneau({ pct, taille = 64, sombre = false, legende }: { pct: number; taille?: number; sombre?: boolean; legende?: string }) {
  const c = 2 * Math.PI * 44
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: taille, height: taille }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" className={sombre ? 'text-white/10' : 'text-line'} />
        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} className="text-teal" />
      </svg>
      <span className="text-center leading-none">
        <span className={`block font-semibold tracking-tight ${sombre ? 'text-white' : 'text-fg'}`} style={{ fontSize: taille * 0.24 }}>
          {pct} %
        </span>
        {legende && <span className={`mt-1 block text-[10px] ${sombre ? 'text-white/60' : 'text-fg-2'}`}>{legende}</span>}
      </span>
    </span>
  )
}
