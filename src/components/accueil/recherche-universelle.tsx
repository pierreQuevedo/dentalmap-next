'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { chemin } from '@/lib/navigation'
import { useSuggestionsLieu, type SuggestionLieu } from '@/lib/annuaire/use-suggestions'
import { CIBLES, LIBELLE_TYPE, destination, precision, type Cible } from '@/lib/annuaire/cibles'
import { Deroulant } from '@/components/site/deroulant'

/**
 * Le champ unique de l'accueil.
 *
 * Quatre cibles, un seul champ. L'utilisateur qui arrive ne sait pas encore
 * qu'il existe deux bases de données derrière, ni que les écoles viennent du
 * CMS et les praticiens de Postgres : lui demander de choisir un onglet avant
 * de savoir ce qu'il cherche reviendrait à lui faire porter notre découpage
 * technique.
 *
 * Posé sur le hero sombre de l'accueil : le sélecteur de cible a la forme
 * des onglets de la section « Explorer l'annuaire », capsule compacte de
 * 36 px avec un curseur qui glisse, sur le fond du badge du hero ; le champ reste
 * clair, et son bouton est dans le teal de la marque, sans effet au survol.
 *
 * Le formulaire part toujours vers `/recherche/`, en méthode GET, avec la
 * cible en paramètre. Sans JavaScript la page de recherche redirige elle-même
 * vers la formation quand la cible n'est pas un praticien : le parcours est le
 * même avec et sans script, et les suggestions ne sont qu'un raccourci.
 */
export function RechercheUniverselle() {
  const router = useRouter()
  const [cible, setCible] = useState<Cible>('dentistes')
  const [texte, setTexte] = useState('')
  const [ferme, setFerme] = useState(false)
  const [indexActif, setIndexActif] = useState(-1)
  const idChamp = useId()

  const suggestions = useSuggestionsLieu(texte, '')
  const visibles = ferme ? [] : suggestions
  const index = CIBLES.findIndex((c) => c.cle === cible)

  const choisir = (s: SuggestionLieu) => {
    setTexte(s.nom)
    setFerme(true)
    router.push(chemin(destination(cible, s)))
  }

  return (
    <form
      method="get"
      action="/recherche/"
      role="search"
      className="w-full max-w-xl"
      onSubmit={() => setFerme(true)}
    >
      {/*
        Groupe de boutons radio et non une liste d'onglets : la cible est une
        donnée du formulaire, pas un état d'affichage. Les flèches du clavier
        fonctionnent sans une ligne de script, et la valeur part dans l'URL
        même si l'hydratation n'a pas eu lieu.
      */}
      <fieldset className="relative flex justify-center">
        <legend className="sr-only">Que cherchez-vous ?</legend>
        <div className="relative grid h-9 w-fit grid-cols-4 gap-1 rounded-full border border-white/10 bg-black/30 p-1 backdrop-blur-sm">
          <span
            aria-hidden
            className="absolute inset-y-1 left-1 rounded-full bg-white/15 transition-transform duration-moderate ease-spring motion-reduce:transition-none"
            style={{
              // Largeur d'une colonne : le conteneur moins ses marges internes et
              // les trois écarts, divisé par quatre. Sans les écarts, le curseur
              // débordait un peu plus à chaque colonne.
              width: 'calc((100% - 0.5rem - 0.75rem) / 4)',
              transform: `translateX(calc(${index} * (100% + 0.25rem)))`,
            }}
          />
          {CIBLES.map((c) => (
            <label
              key={c.cle}
              title={c.aide}
              className={`relative z-10 flex cursor-pointer items-center justify-center rounded-full px-4 text-center text-sm font-medium whitespace-nowrap transition-colors duration-fast has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-white ${
                cible === c.cle ? 'text-white' : 'text-white/60 hover:text-white/90'
              }`}
            >
              <input
                type="radio"
                name="profession"
                value={c.cle}
                checked={cible === c.cle}
                onChange={() => {
                  setCible(c.cle)
                  setIndexActif(-1)
                }}
                className="sr-only"
              />
              {c.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="relative mt-3">
        <label htmlFor={idChamp} className="sr-only">
          Votre ville ou votre code postal
        </label>
        <div className="squircle-full flex items-center gap-2 border border-line bg-bg/80 p-1.5 pl-5 shadow-pill backdrop-blur-xl focus-within:border-line-strong">
          <PinIcon className="size-5 shrink-0 text-fg-2" />
          <input
            id={idChamp}
            name="q"
            value={texte}
            onChange={(e) => {
              setTexte(e.target.value)
              setFerme(false)
              setIndexActif(-1)
            }}
            onFocus={() => setFerme(false)}
            onBlur={() => setTimeout(() => setFerme(true), 120)}
            onKeyDown={(e) => {
              if (visibles.length === 0) return
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setIndexActif((i) => Math.min(i + 1, visibles.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setIndexActif((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Enter' && indexActif >= 0) {
                e.preventDefault()
                choisir(visibles[indexActif]!)
              } else if (e.key === 'Escape') {
                setFerme(true)
              }
            }}
            placeholder="Votre ville ou votre code postal"
            autoComplete="off"
            role="combobox"
            aria-expanded={visibles.length > 0}
            aria-controls={`${idChamp}-liste`}
            aria-autocomplete="list"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-fg outline-none placeholder:text-fg-2"
          />
          <button
            type="submit"
            className="squircle-full flex size-11 shrink-0 items-center justify-center bg-teal text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            <span className="sr-only">Rechercher</span>
            <LoupeIcon className="size-5" />
          </button>
        </div>

        <Deroulant ouvert={visibles.length > 0} className="absolute z-20 mt-2 w-full">
          <ul id={`${idChamp}-liste`} role="listbox" className="squircle-xl w-full overflow-hidden border border-line bg-bg shadow-pop">
            {visibles.map((s, i) => (
              <li key={s.type === 'commune' ? s.code_insee : `${s.type}-${s.code}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === indexActif}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choisir(s)}
                  className={`flex w-full items-baseline justify-between gap-3 px-5 py-2.5 text-left text-sm ${
                    i === indexActif ? 'bg-bg-soft' : 'hover:bg-bg-soft'
                  }`}
                >
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="truncate text-fg">{s.nom}</span>
                    {s.type !== 'commune' && (
                      <span className="shrink-0 rounded-full bg-line px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[.06em] text-fg-2">
                        {LIBELLE_TYPE[s.type]}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-fg-2">{precision(s)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Deroulant>
      </div>

      <p className="mt-3 text-center text-sm text-fg-2">{CIBLES[index]!.aide}</p>
    </form>
  )
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10zM12 8.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4z" />
    </svg>
  )
}

function LoupeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  )
}
