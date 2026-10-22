import { Star } from 'lucide-react'

/** Une note sur cinq en étoiles, arrondie à la demi-étoile près pour l'affichage. */
export function Etoiles({ note, taille = 'size-4' }: { note: number; taille?: string }) {
  const arrondie = Math.round(note * 2) / 2
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${note.toLocaleString('fr-FR')} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const part = Math.max(0, Math.min(1, arrondie - i + 1))
        return (
          <span key={i} className={`relative ${taille}`}>
            <Star className={`absolute inset-0 ${taille} text-line`} fill="currentColor" strokeWidth={0} aria-hidden />
            {part > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${part * 100}%` }}>
                <Star className={`${taille} text-amber-400`} fill="currentColor" strokeWidth={0} aria-hidden />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}
