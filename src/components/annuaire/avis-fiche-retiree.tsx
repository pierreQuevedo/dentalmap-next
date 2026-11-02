'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { UserX, X } from 'lucide-react'
import { COOKIE_AVIS_RETRAIT } from '@/lib/espace-pro/chemins'

type Avis = { titre: string; texte: string }

/**
 * L'avis posé par le proxy, lu une fois par chargement puis effacé : un
 * retour arrière ou une navigation ne le rouvre pas.
 */
let lu: Avis | null | undefined
function lireAvis(): Avis | null {
  if (lu !== undefined) return lu
  lu = null
  const brut = document.cookie.split('; ').find((c) => c.startsWith(`${COOKIE_AVIS_RETRAIT}=`))
  if (!brut) return lu
  document.cookie = `${COOKIE_AVIS_RETRAIT}=; path=/; max-age=0`
  try {
    const v = JSON.parse(decodeURIComponent(brut.slice(COOKIE_AVIS_RETRAIT.length + 1)))
    if (typeof v?.titre === 'string' && typeof v?.texte === 'string') lu = { titre: v.titre, texte: v.texte }
  } catch {
    // Un cookie illisible ne mérite pas d'avis.
  }
  return lu
}
const sAbonner = () => () => {}

/**
 * L'avis « n'est plus présent sur DentalMap », à l'arrivée sur la liste d'une
 * commune ou d'un département depuis l'adresse d'une fiche retirée.
 *
 * Le proxy pose l'avis dans un cookie de deux minutes en redirigeant : lu ici,
 * côté navigateur, il ne rend pas la liste dynamique et ne se mélange pas à
 * son cache.
 */
export function AvisFicheRetiree() {
  const ref = useRef<HTMLDialogElement>(null)
  const avis = useSyncExternalStore(sAbonner, lireAvis, () => null)
  const [ferme, setFerme] = useState(false)

  useEffect(() => {
    if (avis) ref.current?.showModal()
  }, [avis])

  if (!avis || ferme) return null
  return (
    <dialog
      ref={ref}
      aria-labelledby="avis-retrait-titre"
      onClose={() => setFerme(true)}
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      className="squircle-xl m-auto w-[calc(100%-2rem)] max-w-md border border-line bg-bg p-0 text-fg backdrop:bg-black/50"
    >
      <div className="relative p-6 md:p-8">
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Fermer"
          className="absolute right-4 top-4 grid size-9 cursor-pointer place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg"
        >
          <X className="size-4" aria-hidden />
        </button>
        <span className="grid size-11 place-items-center rounded-full bg-bg-soft text-fg-2">
          <UserX className="size-5" aria-hidden />
        </span>
        <h2 id="avis-retrait-titre" className="mt-4 pr-8 text-xl font-semibold tracking-tight">
          {avis.titre}
        </h2>
        <p className="mt-2 text-sm text-fg-2">{avis.texte}</p>
        <button
          type="button"
          autoFocus
          onClick={() => ref.current?.close()}
          className="mt-6 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full bg-fg px-5 text-sm font-medium text-bg hover:opacity-90"
        >
          Voir la liste
        </button>
      </div>
    </dialog>
  )
}
