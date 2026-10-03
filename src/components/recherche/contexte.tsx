'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { BaseUrl } from '@/lib/annuaire/types'
import type { Emprise, Origine, PageResultats } from '@/lib/annuaire/emprise'
import { AUCUN_FILTRE, filtresEnParams, type Filtres } from '@/lib/annuaire/filtres'

/**
 * État partagé entre la carte et la colonne de résultats.
 *
 * Les deux sont des îlots clients voisins dans une page rendue par le serveur.
 * Un contexte les relie sans obliger le titre, le formulaire et la mise en
 * page à devenir clients eux aussi.
 *
 * Deux liens, mais pas dans le même sens. L'emprise descend de la carte vers
 * la liste : c'est la carte qui décide de ce qui est visible. Le survol
 * circule dans les deux sens, et il est repéré par la position plutôt que par
 * le praticien, parce que plusieurs professionnels partagent souvent la même
 * adresse : c'est le lieu qui s'allume, et il s'allume pour chacun d'eux.
 */
/**
 * D'où vient la liste.
 *
 * `territoire` : la page est celle d'une commune, d'un département, d'une
 * région ou de la France entière, et la liste est celle que le serveur a
 * rendue pour cette URL, paginée par de vrais liens que les moteurs suivent.
 * `carte` : l'utilisateur a bougé la carte, la liste décrit ce qu'elle montre
 * et se pagine sans rechargement. Une page de territoire commence en mode
 * `territoire` et passe en mode `carte` au premier déplacement ; la page de
 * recherche est en mode `carte` d'emblée.
 */
export type Mode = 'territoire' | 'carte'

export type Territoire = {
  /** « à Bordeaux », « en Gironde », « en France » : complète la phrase de comptage. */
  libelle: string
  /** Règle de tri de la liste servie pour ce territoire. */
  classement: 'alphabetique' | 'distance'
}

type Etat = {
  base: BaseUrl
  mode: Mode
  territoire: Territoire | null
  /** Emprise courante de la carte, celle que la liste décrit en mode carte. */
  emprise: Emprise
  filtres: Filtres
  /** Applique des filtres : la liste passe en mode carte, sur l'emprise courante, page 1. */
  setFiltres: (filtres: Filtres) => void
  /** Emprise demandée à la carte par le script, autour de la position de l'utilisateur par exemple. */
  cadrage: Emprise | null
  /** Recadre la carte sur une emprise et fait suivre la liste. */
  recadrer: (emprise: Emprise) => void
  donnees: PageResultats
  /** Incrémenté à chaque liste reçue : la colonne s'en sert pour rejouer l'entrée des cartes. */
  version: number
  chargement: boolean
  erreur: boolean
  /** Position survolée, clé de `clePosition` : c'est ce que la carte allume. */
  survol: string | null
  /**
   * Personne survolée, quand le survol vient de la liste. Plusieurs
   * professionnels partagent souvent une adresse : la carte allume le lieu,
   * mais une seule fiche doit se lever, celle sous le curseur.
   */
  survolSlug: string | null
  setSurvol: (cle: string | null, slug?: string | null) => void
  /**
   * Lieu choisi sur la carte, d'où la liste est classée. Nul quand la liste
   * décrit simplement ce que la carte montre, classée depuis son centre.
   */
  origine: Origine | null
  deplacer: (emprise: Emprise, origine?: Origine | null) => void
  allerPage: (page: number) => void
}

/**
 * Latence avant que la liste ne suive la carte, en millisecondes.
 *
 * Presque une seconde : le temps de finir un geste, d'enchaîner deux clics
 * de zoom ou de survoler un point, sans que la colonne de gauche ne se vide
 * à chaque mouvement. Tant que la latence court, la liste reste celle
 * d'avant ; elle ne passe en squelettes qu'au moment où la requête part.
 */
const DELAI = 900

const Contexte = createContext<Etat | null>(null)

export function useRecherche(): Etat {
  const etat = useContext(Contexte)
  if (!etat) throw new Error('useRecherche doit être utilisé dans <FournisseurRecherche>')
  return etat
}

/** Le même état, ou `null` hors d'un fournisseur : pour la barre posée sur une page sans résultats. */
export function useRechercheOptionnelle(): Etat | null {
  return useContext(Contexte)
}

export function FournisseurRecherche({
  base,
  empriseInitiale,
  initial,
  mode: modeInitial = 'carte',
  territoire = null,
  children,
}: {
  base: BaseUrl
  empriseInitiale: Emprise
  initial: PageResultats
  mode?: Mode
  territoire?: Territoire | null
  children: React.ReactNode
}) {
  const [mode, setMode] = useState<Mode>(modeInitial)
  const [emprise, setEmprise] = useState(empriseInitiale)
  const [origine, setOrigine] = useState<Origine | null>(null)
  const [filtres, setFiltresEtat] = useState<Filtres>(AUCUN_FILTRE)
  const [cadrage, setCadrage] = useState<Emprise | null>(null)
  const [page, setPage] = useState(initial.page)
  const [donnees, setDonnees] = useState(initial)
  const [version, setVersion] = useState(0)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(false)
  const [survolEtat, setSurvolEtat] = useState<{ cle: string | null; slug: string | null }>({ cle: null, slug: null })
  const setSurvol = useCallback((cle: string | null, slug: string | null = null) => setSurvolEtat({ cle, slug }), [])
  const survol = survolEtat.cle
  const survolSlug = survolEtat.slug

  /*
   * Ce que la liste affichée décrit. Le serveur a déjà rendu la première page
   * pour l'emprise de départ : tant que l'emprise et la page n'ont pas bougé,
   * il n'y a rien à redemander. Comparer à ce qui est servi, plutôt que
   * sauter « le premier passage », résiste au double appel des effets en
   * développement et redemande bien la page 1 quand on y revient.
   */
  const servi = useRef({ emprise: empriseInitiale, page: initial.page, filtres: AUCUN_FILTRE, origine: null as Origine | null })
  const dernierAppel = useRef(0)

  useEffect(() => {
    if (emprise === servi.current.emprise && page === servi.current.page && filtres === servi.current.filtres && origine === servi.current.origine) return
    const appel = ++dernierAppel.current
    const controleur = new AbortController()
    const bbox = [emprise.ouest, emprise.sud, emprise.est, emprise.nord].map((n) => n.toFixed(4)).join(',')
    const params = filtresEnParams(filtres, new URLSearchParams({ profession: base, bbox, page: String(page) }))
    if (origine) params.set('centre', `${origine.lon.toFixed(4)},${origine.lat.toFixed(4)}`)

    // Quatre clics sur le bouton de dézoom, c'est quatre emprises en moins
    // d'une seconde. Seule la dernière intéresse l'utilisateur : le délai
    // laisse le geste se terminer avant d'interroger le serveur, et la liste
    // ne bouge pas avant.
    const minuteur = setTimeout(() => {
      setChargement(true)
      fetch(`/api/geo/resultats/?${params}`, { signal: controleur.signal })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((d: PageResultats) => {
          // Une réponse en retard ne doit pas écraser un déplacement plus récent.
          if (appel !== dernierAppel.current) return
          servi.current = { emprise, page, filtres, origine }
          setDonnees(d)
          setVersion((v) => v + 1)
          setErreur(false)
          setChargement(false)
        })
        .catch(() => {
          if (controleur.signal.aborted || appel !== dernierAppel.current) return
          setErreur(true)
          setChargement(false)
        })
    }, DELAI)

    return () => {
      clearTimeout(minuteur)
      controleur.abort()
    }
  }, [base, emprise, page, filtres, origine])

  // Un déplacement remet à la première page : rester en page sept d'une liste
  // qui vient d'être remplacée n'aurait aucun sens.
  const deplacer = useCallback((e: Emprise, o: Origine | null = null) => {
    setMode('carte')
    setEmprise(e)
    setOrigine(o)
    setPage(1)
  }, [])

  const allerPage = useCallback((n: number) => setPage(Math.max(1, n)), [])

  const recadrer = useCallback((e: Emprise) => {
    setCadrage(e)
    setMode('carte')
    setEmprise(e)
    setOrigine(null)
    setPage(1)
  }, [])

  // Filtrer, c'est chercher : la liste devient celle de l'emprise, filtrée,
  // même sur une page de commune dont la liste servie n'était pas filtrée.
  const setFiltres = useCallback((f: Filtres) => {
    setMode('carte')
    setFiltresEtat(f)
    setPage(1)
  }, [])

  return (
    <Contexte.Provider
      value={{
        base,
        mode,
        territoire: mode === 'territoire' ? territoire : null,
        emprise,
        filtres,
        setFiltres,
        cadrage,
        recadrer,
        donnees,
        version,
        chargement,
        erreur,
        survol,
        survolSlug,
        setSurvol,
        origine,
        deplacer,
        allerPage,
      }}
    >
      {children}
    </Contexte.Provider>
  )
}
