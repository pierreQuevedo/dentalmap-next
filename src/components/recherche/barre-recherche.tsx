'use client'

import type { BaseUrl } from '@/lib/annuaire/types'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, MapPin, SlidersHorizontal, X } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { useSuggestionsLieu, type SuggestionLieu } from '@/lib/annuaire/use-suggestions'
import { CIBLES, CIBLES_ANNUAIRE, LIBELLE_TYPE, destination, precision, type Cible } from '@/lib/annuaire/cibles'
import { AUCUN_FILTRE, CASES, EXERCICES, SPECIALITES, filtresEnParams, nombreDeFiltres, type Filtres } from '@/lib/annuaire/filtres'
import { LIBELLE } from '@/lib/annuaire/libelles'
import { PROFESSION_PAR_BASE } from '@/lib/annuaire/types'
import { Deroulant } from '@/components/site/deroulant'
import { useRecherche, useRechercheOptionnelle } from './contexte'
import { HaloRecherche } from './halo-recherche'

/**
 * La barre de recherche, fixée en bas de l'écran et centrée.
 *
 * Trois commandes : le lieu, avec ses suggestions de communes, départements
 * et régions qui s'ouvrent vers le haut ; la cible, dentiste, prothésiste,
 * école ou formation ; et les filtres, dans un panneau posé au-dessus de la
 * barre, dont le bouton du bas dit combien de professionnels répondent à la
 * recherche avant de l'appliquer.
 *
 * La barre est un vrai formulaire GET vers `/recherche/` : sans script, un
 * lieu tapé et validé arrive sur la page de recherche, qui résout la commune
 * et renvoie les écoles et les formations vers la formation. Avec script,
 * une suggestion choisie mène directement à sa page, et les filtres
 * s'appliquent sur place, sans rechargement.
 */
export function BarreRecherche({ base, valeurLieu }: { base: BaseUrl; valeurLieu: string }) {
  // Sans fournisseur de recherche, page par département par exemple, la
  // barre garde le lieu et la cible mais n'a pas de filtres à proposer.
  const recherche = useRechercheOptionnelle()
  const [cible, setCible] = useState<Cible>(base)
  const [texte, setTexte] = useState(valeurLieu)
  const [filtresOuverts, setFiltresOuverts] = useState(false)
  // Le champ de lieu a le focus : la carte s'entoure d'un halo le temps du choix.
  const [lieuActif, setLieuActif] = useState(false)
  const router = useRouter()

  const praticiens = CIBLES_ANNUAIRE.includes(cible)

  /** Changer de cible relance la recherche sur le lieu affiché. */
  const changerCible = (c: Cible) => {
    setCible(c)
    const q = texte.trim()
    if (c === 'ecoles' || c === 'formations') {
      const cheminBase = c === 'ecoles' ? '/formation/ecoles-de-prothese/' : '/formation/'
      router.push(chemin(q ? `${cheminBase}?lieu=${encodeURIComponent(q)}` : cheminBase))
      return
    }
    if (c !== base) router.push(chemin(`/recherche/?profession=${c}${q ? `&q=${encodeURIComponent(q)}` : ''}`))
  }

  return (
    <>
      {/* Hors de la barre : fixée et dotée d'un plan, elle enfermerait le halo sous l'en-tête. La barre, elle, passe au-dessus du halo pour rester lisible. */}
      <HaloRecherche actif={lieuActif} />
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[56] flex justify-center px-4">
        <div className="pointer-events-auto relative">
          <Deroulant ouvert={filtresOuverts && praticiens && !!recherche} origine="bas" className="absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2">
            {recherche && <PanneauFiltres fermer={() => setFiltresOuverts(false)} />}
          </Deroulant>

          <form
            method="get"
            action="/recherche/"
            role="search"
            className="squircle-full flex items-center gap-1 border border-line bg-bg/90 p-1.5 shadow-pop backdrop-blur-xl"
          >
            <ChampLieuBarre texte={texte} setTexte={setTexte} cible={cible} onActif={setLieuActif} />

            <span aria-hidden className="mx-1 h-6 w-px bg-line" />

            <label className="relative flex h-10 items-center">
              <span className="sr-only">Que cherchez-vous ?</span>
              <select
                name="profession"
                value={cible}
                onChange={(e) => changerCible(e.target.value as Cible)}
                className="h-10 appearance-none rounded-full bg-transparent pl-3 pr-8 text-sm font-medium text-fg outline-none hover:bg-bg-soft focus-visible:bg-bg-soft"
              >
                {CIBLES.map((c) => (
                  <option key={c.cle} value={c.cle}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-fg-2" />
            </label>

            {praticiens && recherche && (
              <BoutonFiltres ouvert={filtresOuverts} basculer={() => setFiltresOuverts((o) => !o)} />
            )}

            <button type="submit" className="sr-only">
              Rechercher
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

function BoutonFiltres({ ouvert, basculer }: { ouvert: boolean; basculer: () => void }) {
  const { filtres } = useRecherche()
  const n = nombreDeFiltres(filtres)
  return (
    <button
      type="button"
      onClick={basculer}
      aria-expanded={ouvert}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-fg px-4 text-sm font-semibold text-bg transition-colors hover:bg-fg/85"
    >
      <SlidersHorizontal className="size-4" />
      Filtres
      {n > 0 && (
        <span className="grid size-5 place-items-center rounded-full bg-teal text-[11px] font-semibold text-white">{n}</span>
      )}
    </button>
  )
}

/**
 * Le champ de lieu de la barre : suggestions vers le haut, choix direct.
 */
function ChampLieuBarre({
  texte,
  setTexte,
  cible,
  onActif,
}: {
  texte: string
  setTexte: (t: string) => void
  cible: Cible
  /** Le champ prend ou perd le focus. */
  onActif: (actif: boolean) => void
}) {
  const router = useRouter()
  const [ferme, setFerme] = useState(true)
  const [indexActif, setIndexActif] = useState(-1)
  const id = useId()
  const suggestions = useSuggestionsLieu(texte, ferme ? texte : '')
  const visibles = ferme ? [] : suggestions

  const choisir = (s: SuggestionLieu) => {
    setTexte(s.nom)
    setFerme(true)
    router.push(chemin(destination(cible, s)))
  }

  return (
    <div className="relative flex items-center">
      <MapPin className="pointer-events-none absolute left-3 size-4 text-fg-2" />
      <label htmlFor={id} className="sr-only">
        Où cherchez-vous ?
      </label>
      <input
        id={id}
        name="q"
        value={texte}
        onChange={(e) => {
          setTexte(e.target.value)
          setFerme(false)
          setIndexActif(-1)
        }}
        onFocus={() => {
          setFerme(false)
          onActif(true)
        }}
        onBlur={() => {
          onActif(false)
          setTimeout(() => setFerme(true), 120)
        }}
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
        placeholder="Ville, département ou région"
        autoComplete="off"
        role="combobox"
        aria-expanded={visibles.length > 0}
        aria-controls={`${id}-liste`}
        aria-autocomplete="list"
        className="h-10 w-52 rounded-full bg-transparent pl-9 pr-3 text-sm text-fg outline-none placeholder:text-fg-2 focus-visible:bg-bg-soft sm:w-64"
      />
      <Deroulant ouvert={visibles.length > 0} origine="bas" className="absolute bottom-full left-0 z-20 mb-3">
        <ul id={`${id}-liste`} role="listbox" className="squircle-xl w-80 overflow-hidden border border-line bg-bg shadow-pop">
          {visibles.map((s, i) => (
            <li key={s.type === 'commune' ? s.code_insee : `${s.type}-${s.code}`}>
              <button
                type="button"
                role="option"
                aria-selected={i === indexActif}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choisir(s)}
                className={`flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left text-sm ${
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
  )
}

/**
 * Le panneau des filtres, posé au-dessus de la barre.
 *
 * Les choix restent en brouillon jusqu'au bouton du bas, qui compte les
 * professionnels répondant à la recherche dans l'emprise courante, puis les
 * applique. Le compte vient de la route des résultats, la même que la liste,
 * avec un court délai après chaque changement.
 */
function PanneauFiltres({ fermer }: { fermer: () => void }) {
  const { base, emprise, filtres, setFiltres } = useRecherche()
  const profession = PROFESSION_PAR_BASE[base]
  const l = LIBELLE[profession]
  const [brouillon, setBrouillon] = useState<Filtres>(filtres)
  const [compte, setCompte] = useState<{ total: number; plafonne: boolean } | null>(null)
  const dernierAppel = useRef(0)

  useEffect(() => {
    const appel = ++dernierAppel.current
    const bbox = [emprise.ouest, emprise.sud, emprise.est, emprise.nord].map((n) => n.toFixed(4)).join(',')
    const params = filtresEnParams(brouillon, new URLSearchParams({ profession: base, bbox, page: '1' }))
    const minuteur = setTimeout(() => {
      fetch(`/api/geo/resultats/?${params}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((d: { total: number; plafonne: boolean }) => {
          if (appel === dernierAppel.current) setCompte({ total: d.total, plafonne: d.plafonne })
        })
        .catch(() => {
          if (appel === dernierAppel.current) setCompte(null)
        })
    }, 250)
    return () => clearTimeout(minuteur)
  }, [base, emprise, brouillon])

  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer()
    }
    document.addEventListener('keydown', surTouche)
    return () => document.removeEventListener('keydown', surTouche)
  }, [fermer])

  const basculer = (cle: keyof Filtres) => setBrouillon((b) => ({ ...b, [cle]: b[cle] ? undefined : true }))
  const cases = CASES.filter((c) => c.professions.includes(profession))
  const libelleCompte = compte
    ? `Afficher ${compte.plafonne ? `${compte.total.toLocaleString('fr-FR')}+` : compte.total.toLocaleString('fr-FR')} ${compte.total > 1 ? l.pluriel : l.singulier}`
    : 'Afficher les résultats'

  return (
    <div role="dialog" aria-label="Filtres" className="squircle-2xl w-[26rem] max-w-[calc(100vw-2rem)] border border-line bg-bg shadow-pop">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 className="text-base font-semibold text-fg">Filtres</h2>
        <button type="button" onClick={fermer} aria-label="Fermer les filtres" className="grid size-8 place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg">
          <X className="size-4" />
        </button>
      </div>

      <div className="max-h-[50vh] space-y-5 overflow-y-auto px-5 py-4">
        {profession === 'dentiste' && (
          <Groupe titre="Spécialité">
            <Pastilles
              options={[{ code: undefined, libelle: 'Toutes' }, ...SPECIALITES]}
              valeur={brouillon.specialite}
              choisir={(v) => setBrouillon((b) => ({ ...b, specialite: v as Filtres['specialite'] }))}
            />
          </Groupe>
        )}
        {profession === 'dentiste' && (
          <Groupe titre="Mode d’exercice">
            <Pastilles
              options={[{ code: undefined, libelle: 'Tous' }, ...EXERCICES]}
              valeur={brouillon.exercice}
              choisir={(v) => setBrouillon((b) => ({ ...b, exercice: v as Filtres['exercice'] }))}
            />
          </Groupe>
        )}
        <Groupe titre="Fiche">
          <ul className="space-y-2">
            {cases.map((c) => (
              <li key={c.cle}>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-fg">
                  <input type="checkbox" checked={!!brouillon[c.cle]} onChange={() => basculer(c.cle)} className="size-4 accent-teal" />
                  {c.libelle}
                </label>
              </li>
            ))}
          </ul>
        </Groupe>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
        <button
          type="button"
          onClick={() => setBrouillon(AUCUN_FILTRE)}
          disabled={nombreDeFiltres(brouillon) === 0}
          className="text-sm font-medium text-fg-2 underline-offset-2 hover:text-fg hover:underline disabled:opacity-40 disabled:hover:no-underline"
        >
          Réinitialiser
        </button>
        <button
          type="button"
          onClick={() => {
            setFiltres(brouillon)
            fermer()
          }}
          className="inline-flex h-10 items-center rounded-full bg-teal px-5 text-sm font-semibold text-white"
        >
          {libelleCompte}
        </button>
      </div>
    </div>
  )
}

function Groupe({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-[.06em] text-fg-2">{titre}</legend>
      {children}
    </fieldset>
  )
}

function Pastilles({
  options,
  valeur,
  choisir,
}: {
  options: readonly { code: string | undefined; libelle: string }[]
  valeur: string | undefined
  choisir: (v: string | undefined) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.code ?? 'tous'}
          type="button"
          aria-pressed={valeur === o.code}
          onClick={() => choisir(o.code)}
          className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
            valeur === o.code ? 'border-fg bg-fg text-bg' : 'border-line text-fg hover:bg-bg-soft'
          }`}
        >
          {o.libelle}
        </button>
      ))}
    </div>
  )
}
