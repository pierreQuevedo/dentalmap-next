'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SearchIcon } from './nav-icon'
import { useHeaderCompact } from './use-header-compact'

/**
 * La page de recherche lit `profession` sous sa forme d'URL, au pluriel
 * (`dentistes`, `prothesistes`), la même que les préfixes de l'annuaire.
 */
type BaseProfession = 'dentistes' | 'prothesistes'

const LIBELLE: Record<BaseProfession, string> = {
  dentistes: 'Dentiste',
  prothesistes: 'Prothésiste',
}

export function SearchPill() {
  const compact = useHeaderCompact()
  const router = useRouter()
  const [profession, setProfession] = useState<BaseProfession>('dentistes')
  const [ou, setOu] = useState('')

  const envoyer = (e: React.FormEvent) => {
    e.preventDefault()
    const q = new URLSearchParams({ profession })
    if (ou.trim()) q.set('q', ou.trim())
    router.push(`/recherche?${q.toString()}`)
  }

  // En mode compact, la pill se replie en une pastille au centre de la barre.
  // Le clic remonte en haut de page plutôt que de déplier sur place : un
  // dépliage in-place demanderait de figer la hauteur du header pendant la
  // transition, complication sans gain à ce stade.
  if (compact) {
    return (
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-line py-1.5 pl-4 pr-1.5 text-sm font-semibold shadow-pill md:inline-flex"
        aria-label="Ouvrir la recherche"
      >
        <span className="px-4 py-1.5">{LIBELLE[profession]}</span>
        <span className="border-l border-line px-4 py-1.5 font-normal text-fg-2">{ou || 'Où ?'}</span>
        <span className="ml-1 grid size-[34px] place-items-center rounded-full bg-brand text-primary-foreground">
          <SearchIcon className="size-3.5" />
        </span>
      </button>
    )
  }

  return (
    <div className="flex justify-center px-6 pb-4 md:px-10 md:pb-5 xl:px-20">
      <form
        role="search"
        onSubmit={envoyer}
        className="grid w-full max-w-[850px] grid-cols-[1fr_auto] items-center rounded-full border border-line bg-bg shadow-pill md:grid-cols-[1.2fr_1.6fr_1fr_auto]"
      >
        <label htmlFor="pill-profession" className="hidden rounded-full px-6 py-3.5 hover:bg-bg-soft md:block">
          <span className="block text-xs font-semibold text-fg">Profession</span>
          <select
            id="pill-profession"
            value={profession}
            onChange={(e) => setProfession(e.target.value as BaseProfession)}
            className="w-full appearance-none bg-transparent text-sm text-fg-2 outline-none"
          >
            <option value="dentistes">Chirurgien-dentiste</option>
            <option value="prothesistes">Prothésiste dentaire</option>
          </select>
        </label>

        <label
          htmlFor="pill-ou"
          className="relative rounded-full px-6 py-3.5 hover:bg-bg-soft md:before:absolute md:before:inset-y-3.5 md:before:left-0 md:before:w-px md:before:bg-line md:hover:before:bg-transparent"
        >
          <span className="block text-xs font-semibold text-fg">Où ?</span>
          <input
            id="pill-ou"
            value={ou}
            onChange={(e) => setOu(e.target.value)}
            placeholder="Ville, code postal ou adresse"
            autoComplete="off"
            className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-2"
          />
        </label>

        {/* Emplacement réservé : la sélection d'un besoin (spécialité, accès
            PMR, langue) se branchera sur les fiches complétées en phase 4. */}
        <div className="relative hidden rounded-full px-6 py-3.5 before:absolute before:inset-y-3.5 before:left-0 before:w-px before:bg-line md:block">
          <span className="block text-xs font-semibold text-fg">Besoin</span>
          <span className="text-sm text-fg-2">Tous les praticiens</span>
        </div>

        <button
          type="submit"
          aria-label="Rechercher"
          className="m-[7px] grid size-12 place-items-center rounded-full bg-brand text-primary-foreground transition-colors hover:bg-brand-hover"
        >
          <SearchIcon className="size-[18px]" />
        </button>
      </form>
    </div>
  )
}
