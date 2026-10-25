'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { ArrowRight, LoaderCircle } from 'lucide-react'

type Reponse = { total: number; exact: boolean; resultats: { slug: string; nom: string; detail: string; rpps: string | null }[] }

/**
 * S1 : les fiches qui correspondent s'affichent pendant la frappe, sous le
 * champ `champ`, pour la profession cochée (`profession`). Une fiche mène
 * droit à « C'est bien vous ? » ; le bouton du formulaire reste la recherche
 * complète.
 */
export function RechercheDirecte({ champ, profession, vers }: { champ: string; profession: string; vers: string }) {
  const ancre = useRef<HTMLDivElement>(null)
  const [reponse, setReponse] = useState<Reponse | null>(null)
  const [charge, setCharge] = useState(false)
  useEffect(() => {
    const formulaire = ancre.current?.closest('form')
    const entree = document.getElementById(champ) as HTMLInputElement | null
    if (!formulaire || !entree) return
    let minuteur = 0
    let controle: AbortController | null = null
    const chercher = () => {
      window.clearTimeout(minuteur)
      const q = entree.value.trim()
      const prof = formulaire.querySelector<HTMLInputElement>(`input[name="${profession}"]:checked`)?.value ?? 'dentiste'
      if (q.length < 3) {
        setReponse(null)
        return
      }
      // Une frappe toutes les 300 ms au plus, la requête précédente abandonnée.
      minuteur = window.setTimeout(async () => {
        controle?.abort()
        controle = new AbortController()
        setCharge(true)
        try {
          const r = await fetch(`/api/espace-pro/recherche-fiche/?profession=${prof}&q=${encodeURIComponent(q)}`, { signal: controle.signal })
          if (r.ok) setReponse((await r.json()) as Reponse)
        } catch {
          // Abandonnée par une frappe plus récente.
        } finally {
          setCharge(false)
        }
      }, 300)
    }
    if (entree.value.trim().length >= 3) chercher()
    formulaire.addEventListener('input', chercher)
    formulaire.addEventListener('change', chercher)
    return () => {
      window.clearTimeout(minuteur)
      controle?.abort()
      formulaire.removeEventListener('input', chercher)
      formulaire.removeEventListener('change', chercher)
    }
  }, [champ, profession])

  const liste = reponse?.resultats ?? []
  return (
    <div ref={ancre} aria-live="polite">
      {charge && !reponse && (
        <p className="mt-3 flex items-center gap-2 text-xs text-fg-2">
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> Recherche…
        </p>
      )}
      {reponse && (
        <div className="squircle-xl mt-3 overflow-hidden border border-line">
          {liste.length === 0 ? (
            <p className="px-4 py-3 text-sm text-fg-2">Aucune fiche pour l’instant. Continuez la saisie, ou lancez la recherche.</p>
          ) : (
            <ul className="divide-y divide-line">
              {liste.map((r, i) => (
                <li key={r.slug}>
                  <Link href={chemin(`${vers}${encodeURIComponent(r.slug)}/`)} className={`group flex items-center gap-3 px-4 py-3 hover:bg-bg-soft ${i === 0 && reponse.exact ? 'bg-teal/5' : ''}`}>
                    <span className="min-w-0 flex-1">
                      {i === 0 && reponse.exact && <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wider text-teal">C’est sans doute vous</span>}
                      <span className="block truncate text-sm font-semibold text-fg">{r.nom}</span>
                      <span className="block truncate text-xs text-fg-2">
                        {r.detail}
                        {r.rpps && <span className="font-mono"> · RPPS {r.rpps}</span>}
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-fg-2 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {reponse.total > liste.length && <p className="border-t border-line bg-bg-soft px-4 py-2 text-xs text-fg-2">{reponse.total} fiches correspondent : lancez la recherche pour toutes les voir.</p>}
        </div>
      )}
    </div>
  )
}
