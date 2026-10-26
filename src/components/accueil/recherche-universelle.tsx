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
 * Plusieurs cibles, un seul champ. L'utilisateur qui arrive ne sait pas encore
 * qu'il existe deux bases de données derrière, ni que les écoles viennent du
 * CMS et les praticiens de Postgres : lui demander de choisir un onglet avant
 * de savoir ce qu'il cherche reviendrait à lui faire porter notre découpage
 * technique.
 *
 * Même dessin que la recherche d'emploi : une capsule claire, deux champs
 * à libellé en surtitre, la cible puis le lieu, et le bouton « Rechercher ».
 * En ligne à partir de `md`, empilée en dessous, le bouton en pleine largeur.
 * Elle suit le thème du site (`theme-site`), y compris sur le hero, toujours sombre.
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

  // Les écoles ne se cherchent pas sur une carte : le lieu est grisé, la recherche mène à leur liste.
  const sansLieu = cible === 'ecoles'
  const suggestions = useSuggestionsLieu(sansLieu ? '' : texte, '')
  const visibles = ferme || sansLieu ? [] : suggestions

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
      className="theme-site relative w-full max-w-3xl text-left"
      onSubmit={(e) => {
        setFerme(true)
        if (sansLieu) {
          e.preventDefault()
          router.push(chemin('/formation/ecoles-de-prothese/'))
        }
      }}
    >
      <div className="flex flex-col divide-y divide-line rounded-3xl border border-line bg-bg p-1.5 shadow-pill md:flex-row md:items-stretch md:divide-x md:divide-y-0 md:rounded-full">
        <Champ icone={LoupeIcon} label="Que cherchez-vous ?" className="md:flex-1">
          <select
            name="profession"
            value={cible}
            onChange={(e) => {
              setCible(e.target.value as Cible)
              setIndexActif(-1)
            }}
            className={controle}
          >
            {CIBLES.map((c) => (
              <option key={c.cle} value={c.cle}>
                {c.label}
              </option>
            ))}
          </select>
        </Champ>
        <Champ icone={PinIcon} label="Où ?" htmlFor={idChamp} className={`md:flex-[1.3] ${sansLieu ? 'cursor-not-allowed opacity-45' : ''}`}>
          <input
            id={idChamp}
            name="q"
            disabled={sansLieu}
            value={sansLieu ? '' : texte}
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
            placeholder={sansLieu ? 'Toute la France' : 'Ville ou code postal'}
            autoComplete="off"
            role="combobox"
            aria-expanded={visibles.length > 0}
            aria-controls={`${idChamp}-liste`}
            aria-autocomplete="list"
            className={controle}
          />
        </Champ>
        {/* En ligne, le bouton prend toute la hauteur : même retrait en haut, en bas et sur le côté. */}
        <div className="flex p-1.5 md:p-0 md:pl-1.5">
          <button
            type="submit"
            className="inline-flex h-12 w-full md:h-auto cursor-pointer items-center justify-center gap-2 rounded-full bg-action px-7 text-sm font-semibold text-action-foreground hover:bg-action-hover"
          >
            <LoupeIcon className="size-4" /> Rechercher
          </button>
        </div>
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
    </form>
  )
}

const controle = 'w-full min-w-0 truncate bg-transparent text-sm text-fg outline-none placeholder:text-fg-2'

/** Un champ, sur le modèle de la recherche d'emploi : libellé en surtitre, contrôle natif en dessous. */
function Champ({
  icone: I,
  label,
  htmlFor,
  className = '',
  children,
}: {
  icone: typeof PinIcon
  label: string
  htmlFor?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className={`flex min-w-0 items-center gap-3 px-4 py-2.5 ${className}`}>
      <I className="size-4 shrink-0 text-fg-2" />
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-fg-2">{label}</span>
        {children}
      </span>
    </label>
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
