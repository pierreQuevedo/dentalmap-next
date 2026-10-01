'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { chemin, type NavLink } from '@/lib/navigation'
import { useSuggestionsLieu, type SuggestionLieu } from '@/lib/annuaire/use-suggestions'
import { CIBLES, LIBELLE_TYPE, destination, precision, type Cible } from '@/lib/annuaire/cibles'
import { SearchIcon } from './nav-icon'

/**
 * La recherche de l'en-tête, sur le modèle de la navigation d'Apple.
 *
 * La loupe n'emmène plus vers la page de recherche : elle déplie un panneau
 * sous la barre, et le reste de la page passe derrière un rideau flou. Le
 * champ y est grand, sans bordure, et la liste qui l'accompagne change de
 * nature selon la saisie : des liens rapides tant que le champ est vide, les
 * lieux suggérés dès deux caractères.
 *
 * Trois façons de refermer : la touche Échap, un clic sur le rideau, et un
 * changement de route. La troisième est dérivée de l'état plutôt que posée
 * dans un effet, comme pour le méga-menu : le panneau retient la route sur
 * laquelle il a été ouvert.
 *
 * La chorégraphie est celle d'Apple, ralentie d'un tiers : le panneau ne
 * glisse pas, il se déploie en hauteur ; le rideau se floute progressivement,
 * un peu après ; le champ, les cibles, le titre puis chaque ligne arrivent en
 * fondu, décalés de quelques dizaines de millisecondes. À la fermeture, les
 * lignes disparaissent en premier, la dernière la plus vite, puis le panneau
 * se replie et le rideau s'efface. Les phases `ouverture`, `ouvert`,
 * `fermeture` et `ferme` pilotent tout cela depuis `globals.css` ; la
 * différence entre `ouverture` et `ouvert` ne tient qu'au décalage des lignes,
 * pour qu'une suggestion qui arrive en cours de frappe ne mette pas un
 * quart de seconde à paraître.
 *
 * Le panneau et le rideau restent montés, fermés, pour que leur sortie soit
 * animée comme leur entrée ; `inert` les retire alors de l'ordre de tabulation
 * et des lecteurs d'écran. Le formulaire part en GET vers `/recherche/`, comme
 * celui de l'accueil : sans script, la page de recherche fait le reste.
 */
type Phase = 'ferme' | 'ouverture' | 'ouvert' | 'fermeture'

/** Durée de la phase d'ouverture : la dernière ligne a fini d'entrer. */
const DUREE_OUVERTURE = 720
/** Durée de la phase de fermeture : le panneau est replié et le rideau effacé. */
const DUREE_FERMETURE = 520

/** Rang d'un élément dans la chorégraphie, lu par `calc()` dans la feuille de style. */
const rang = (i: number) => ({ '--i': i }) as CSSProperties
export function RechercheHeader({ accesRapide = [] }: { accesRapide?: NavLink[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const [etat, setEtat] = useState<{ phase: Phase; chemin: string }>({ phase: 'ferme', chemin: pathname })
  const phase: Phase = etat.chemin === pathname ? etat.phase : 'ferme'
  const ouvert = phase === 'ouverture' || phase === 'ouvert'
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Chaque phase transitoire passe à sa phase stable une fois l'animation
  // finie, sauf si l'état a bougé entre-temps : rouvrir pendant la fermeture
  // ne doit pas finir fermé.
  const planifier = useCallback((de: Phase, vers: Phase, delai: number) => {
    if (minuterie.current) clearTimeout(minuterie.current)
    minuterie.current = setTimeout(() => {
      setEtat((etat) => (etat.phase === de ? { ...etat, phase: vers } : etat))
    }, delai)
  }, [])
  const ouvrir = () => {
    setEtat({ phase: 'ouverture', chemin: pathname })
    planifier('ouverture', 'ouvert', DUREE_OUVERTURE)
  }
  const fermer = useCallback(() => {
    setEtat((etat) => (etat.phase === 'ferme' ? etat : { ...etat, phase: 'fermeture' }))
    planifier('fermeture', 'ferme', DUREE_FERMETURE)
  }, [planifier])
  useEffect(() => () => { if (minuterie.current) clearTimeout(minuterie.current) }, [])

  const [cible, setCible] = useState<Cible>('dentistes')
  const [texte, setTexte] = useState('')
  const [indexActif, setIndexActif] = useState(-1)
  const idPanneau = useId()
  const idChamp = useId()
  const champ = useRef<HTMLInputElement>(null)
  const bouton = useRef<HTMLButtonElement>(null)

  const suggestions = useSuggestionsLieu(texte, '')

  // Tant que le panneau est visible, fermeture comprise : le corps ne défile
  // plus, et la barre reste opaque même au-dessus du hero transparent. Lever
  // l'attribut dès le début de la fermeture ferait redevenir la barre
  // transparente au-dessus d'un panneau encore blanc.
  const visible = phase !== 'ferme'
  useEffect(() => {
    if (!visible) return
    const html = document.documentElement
    const precedent = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    html.dataset.recherche = 'ouverte'
    return () => {
      document.body.style.overflow = precedent
      delete html.dataset.recherche
    }
  }, [visible])

  // Échap referme. Le focus va au champ à l'ouverture et revient à la loupe
  // dès que la fermeture commence.
  useEffect(() => {
    if (!ouvert) return
    const loupe = bouton.current
    champ.current?.focus()
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer()
    }
    document.addEventListener('keydown', surTouche)
    return () => {
      document.removeEventListener('keydown', surTouche)
      loupe?.focus({ preventScroll: true })
    }
  }, [ouvert, fermer])

  const choisir = (s: SuggestionLieu) => {
    setTexte(s.nom)
    fermer()
    router.push(chemin(destination(cible, s)))
  }

  const liste = suggestions.length > 0

  return (
    <>
      <button
        ref={bouton}
        type="button"
        aria-expanded={ouvert}
        aria-controls={idPanneau}
        aria-label={ouvert ? 'Fermer la recherche' : 'Rechercher un professionnel'}
        onClick={(e) => {
          // Le méga-menu se referme sur tout clic dans le document : le sien,
          // pas celui-ci.
          e.stopPropagation()
          if (ouvert) fermer()
          else ouvrir()
        }}
        className="grid size-9 place-items-center rounded-full text-fg hover:bg-bg-soft"
      >
        <SearchIcon className="size-[18px]" />
      </button>

      {/*
        Le rideau : la page entière, sous la barre, floutée et voilée. Sa
        teinte suit le thème via le jeton de fond, ce qui le rend sombre en mode
        sombre plutôt que laiteux.
      */}
      <div
        aria-hidden
        data-etat={phase}
        onClick={fermer}
        className={`recherche-rideau fixed inset-x-0 top-20 bottom-0 z-40 bg-bg/40 ${ouvert ? '' : 'pointer-events-none'}`}
      />

      {/*
        Deux niveaux : le premier est une grille dont l'unique rangée passe de
        0fr à 1fr, ce qui déploie le panneau en hauteur quel que soit son
        contenu ; le second porte le fond, le filet et le défilement quand
        l'écran est bas.
      */}
      <div
        id={idPanneau}
        inert={!ouvert}
        data-etat={phase}
        onClick={(e) => e.stopPropagation()}
        className={`recherche-panneau fixed inset-x-0 top-20 z-40 ${ouvert ? '' : 'pointer-events-none'}`}
      >
        {/*
          Le filet bas est un pseudo-élément absolu et non une bordure : une
          bordure compte dans la hauteur minimale de la rangée, et le panneau
          replié laissait un pixel de filet dépasser sous la barre.
        */}
        <div className="relative max-h-[calc(100dvh-5rem)] overflow-y-auto bg-bg after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-line">
        <div className="mx-auto max-w-[1288px] px-5 pt-6 pb-10 md:px-10 md:pt-8 md:pb-14 xl:px-20">
          <form
            method="get"
            action="/recherche/"
            role="search"
            onSubmit={fermer}
          >
            <div className="recherche-intro flex items-center gap-3 md:gap-4" style={rang(0)}>
              <SearchIcon className="size-6 shrink-0 text-fg-2" />
              <label htmlFor={idChamp} className="sr-only">
                Rechercher une ville, un département ou une région
              </label>
              <input
                ref={champ}
                id={idChamp}
                name="q"
                value={texte}
                onChange={(e) => {
                  setTexte(e.target.value)
                  setIndexActif(-1)
                }}
                onKeyDown={(e) => {
                  if (!liste) return
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setIndexActif((i) => Math.min(i + 1, suggestions.length - 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setIndexActif((i) => Math.max(i - 1, 0))
                  } else if (e.key === 'Enter' && indexActif >= 0) {
                    e.preventDefault()
                    choisir(suggestions[indexActif]!)
                  }
                }}
                placeholder="Rechercher sur DentalMap"
                autoComplete="off"
                role="combobox"
                aria-expanded={liste}
                aria-controls={`${idChamp}-liste`}
                aria-autocomplete="list"
                aria-activedescendant={indexActif >= 0 ? `${idChamp}-option-${indexActif}` : undefined}
                className="min-w-0 flex-1 bg-transparent py-2 text-xl font-semibold tracking-tight text-fg outline-none placeholder:font-medium placeholder:text-fg-2 md:text-[28px]"
              />
              <button type="submit" className="sr-only">
                Rechercher
              </button>
              <button
                type="button"
                onClick={fermer}
                aria-label="Fermer la recherche"
                className="grid size-9 shrink-0 place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg"
              >
                <CroixIcon className="size-5" />
              </button>
            </div>

            {/*
              La cible est une donnée du formulaire, d'où le groupe de boutons
              radio : elle part dans l'URL avec ou sans script.
            */}
            <fieldset className="recherche-intro mt-4 flex flex-wrap items-center gap-2 pl-9 md:pl-10" style={rang(1)}>
              <legend className="sr-only">Que cherchez-vous ?</legend>
              {CIBLES.map((c) => (
                <label
                  key={c.cle}
                  title={c.aide}
                  className={[
                    'cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-fast has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-fg',
                    cible === c.cle
                      ? 'border-fg bg-fg text-bg'
                      : 'border-line text-fg-2 hover:border-line-strong hover:text-fg',
                  ].join(' ')}
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
            </fieldset>
          </form>

          <div className="mt-8 pl-9 md:mt-10 md:pl-10">
            <h3 className="recherche-intro text-xs font-medium text-fg-2" style={rang(2)}>{liste ? 'Suggestions' : 'Liens rapides'}</h3>
            {liste ? (
              <ul id={`${idChamp}-liste`} role="listbox" aria-label="Lieux suggérés" className="mt-2 -ml-2">
                {suggestions.map((s, i) => (
                  <li key={s.type === 'commune' ? s.code_insee : `${s.type}-${s.code}`} className="recherche-intro" style={rang(3 + i)}>
                    <button
                      type="button"
                      id={`${idChamp}-option-${i}`}
                      role="option"
                      aria-selected={i === indexActif}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choisir(s)}
                      className={[
                        'group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-semibold text-fg',
                        i === indexActif ? 'bg-bg-soft text-teal' : 'hover:text-teal',
                      ].join(' ')}
                    >
                      <FlecheIcon className="size-4 shrink-0 text-fg-2 transition-colors group-hover:text-teal" />
                      <span className="truncate">{s.nom}</span>
                      {s.type !== 'commune' && (
                        <span className="shrink-0 rounded-full bg-line px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[.06em] text-fg-2">
                          {LIBELLE_TYPE[s.type]}
                        </span>
                      )}
                      <span className="shrink-0 text-xs font-normal text-fg-2">{precision(s)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-2 -ml-2">
                {liensRapides(accesRapide).map((l, i) => (
                  <li key={l.href} className="recherche-intro" style={rang(3 + i)}>
                    <Link
                      href={chemin(l.href)}
                      onClick={fermer}
                      className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-semibold text-fg hover:text-teal"
                    >
                      <FlecheIcon className="size-4 shrink-0 text-fg-2 transition-colors group-hover:text-teal" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  )
}

/**
 * Cinq liens, comme chez Apple : les quatre plus grandes villes qui comptent
 * des dentistes, et l'entrée des praticiens. Les villes viennent de la même
 * requête cachée que le méga-menu, le panneau ne charge rien à l'ouverture.
 */
function liensRapides(accesRapide: NavLink[]): NavLink[] {
  return [
    ...accesRapide.slice(0, 4).map((c) => ({ label: `Dentistes à ${c.label}`, href: c.href })),
    { label: 'Revendiquer ma fiche', href: '/espace-pro/revendiquer' },
  ]
}

function FlecheIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function CroixIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
