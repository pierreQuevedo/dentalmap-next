import Image from 'next/image'

/*
 * La mosaïque de la page publique d'un établissement, dans son propre
 * fichier : la galerie de l'espace pro la reprend telle quelle pour son
 * aperçu. `local` : une photo encore dans le navigateur, pas optimisée.
 */

/**
 * Galerie : une grande photo, quatre petites. Au-delà de cinq, la dernière
 * vignette ouvre la galerie complète, affichée sous la grille par l'ancre
 * (`:target`), sans script.
 */
export function Galerie({ photos, credit, source }: { photos: { url: string; legende: string; local?: boolean }[]; credit: string | null; source: string }) {
  if (!photos.length) return null
  const n = photos.length
  const grille = n >= 5 ? 'grid-cols-2 md:grid-cols-4 md:grid-rows-2' : n === 1 ? 'grid-cols-1' : `grid-cols-2 ${n === 3 ? 'md:grid-cols-3' : n === 4 ? 'md:grid-cols-4' : ''}`
  return (
    <div>
      <ul className={`grid gap-3 ${grille}`}>
        {photos.slice(0, 5).map((p, i) => (
          <li
            key={p.url}
            className={`squircle-2xl relative overflow-hidden border border-line ${
              n >= 5 ? (i === 0 ? 'col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto' : 'aspect-square') : n === 1 ? 'aspect-[16/9]' : n === 3 && i === 0 ? 'col-span-2 aspect-[4/3] md:col-span-1' : 'aspect-[4/3]'
            }`}
          >
            <Image src={p.url} alt={p.legende} fill sizes={i === 0 ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'} className="object-cover" unoptimized={p.local} />
            {i === 4 && n > 5 && (
              <a href="#galerie-complete" className="absolute inset-0 grid place-items-center bg-black/55 text-sm font-semibold text-white">
                Voir les {n} photos
              </a>
            )}
          </li>
        ))}
      </ul>
      {n > 5 && (
        <ul id="galerie-complete" className="mt-3 hidden scroll-mt-24 grid-cols-2 gap-3 target:grid md:grid-cols-4">
          {photos.slice(5).map((p) => (
            <li key={p.url} className="squircle-2xl relative aspect-square overflow-hidden border border-line">
              <Image src={p.url} alt={p.legende} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" unoptimized={p.local} />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-fg-2">{credit ? `Crédit photo : ${credit}` : source}</p>
    </div>
  )
}
