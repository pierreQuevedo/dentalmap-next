'use client'

import { PROFESSION_PAR_BASE, type BaseUrl } from '@/lib/annuaire/types'
import { LIBELLE } from '@/lib/annuaire/libelles'

import { useEffect, useState } from 'react'
import { LocateFixed, X } from 'lucide-react'
import { empriseAutour } from '@/lib/annuaire/emprise'
import { usePhase } from '@/lib/use-phase'
import { useRecherche } from './contexte'

/**
 * « Près de chez vous » : la position de l'utilisateur, puis un cadrage qui
 * montre au moins dix praticiens.
 *
 * La position est demandée d'emblée, sans fenêtre préalable : le navigateur
 * affiche sa propre demande, qu'on ne peut pas habiller, et une seconde
 * fenêtre avant elle ferait deux demandes pour une. Quand l'autorisation a
 * déjà été donnée, rien ne s'affiche du tout, la carte se cadre. La fenêtre
 * du site, centrée sur un voile flou, n'apparaît qu'en cas de refus ou
 * d'échec : elle explique ce que la position sert à faire, ce qu'elle ne fait
 * pas, et propose de réessayer ou de chercher une ville.
 *
 * Le rayon vient de la route `/api/geo/autour/`, qui rend la distance du
 * dixième praticien le plus proche : c'est ce qui garantit que le cadre n'est
 * jamais vide, à la campagne comme en ville. La liste suit, par le contexte.
 */
type Etat = 'attente' | 'localisation' | 'cadre' | 'refus' | 'indisponible' | 'erreur'

const RAYON_MINIMUM = 800
const DUREE_SORTIE = 380

export function AutourDeMoi({ base }: { base: BaseUrl }) {
  const { recadrer } = useRecherche()
  const [etat, setEtat] = useState<Etat>('attente')
  const [fenetre, setFenetre] = useState<'ouverte' | 'sortie' | 'fermee'>('fermee')

  const ouvrir = () => setFenetre('ouverte')
  const fermer = () => {
    setFenetre((f) => (f === 'ouverte' ? 'sortie' : f))
    setTimeout(() => setFenetre('fermee'), DUREE_SORTIE)
  }

  const localiser = () => {
    if (!('geolocation' in navigator)) {
      setEtat('indisponible')
      ouvrir()
      return
    }
    setEtat('localisation')
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const r = await fetch(`/api/geo/autour/?profession=${base}&lon=${coords.longitude}&lat=${coords.latitude}&n=10`)
          if (!r.ok) throw new Error(String(r.status))
          const { rayon } = (await r.json()) as { rayon: number | null }
          // Dix pour cent de marge : le dixième praticien ne doit pas être
          // exactement sur le bord du cadre.
          recadrer(empriseAutour(coords.longitude, coords.latitude, Math.max(RAYON_MINIMUM, (rayon ?? 20_000) * 1.1)))
          setEtat('cadre')
          fermer()
        } catch {
          setEtat('erreur')
          ouvrir()
        }
      },
      (e) => {
        setEtat(e.code === e.PERMISSION_DENIED ? 'refus' : 'erreur')
        ouvrir()
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 300_000 },
    )
  }

  // Demandée au chargement : c'est l'objet de la page. Si l'autorisation a
  // déjà été refusée, inutile de redemander, le navigateur ne le proposera
  // plus : la fenêtre explique directement comment faire.
  useEffect(() => {
    let annule = false
    const demarrer = async () => {
      try {
        const statut = await navigator.permissions?.query({ name: 'geolocation' })
        if (annule) return
        if (statut?.state === 'denied') {
          setEtat('refus')
          ouvrir()
          return
        }
      } catch {
        // Pas d'API de permissions : on demande, le navigateur tranchera.
      }
      if (!annule) localiser()
    }
    void demarrer()
    return () => {
      annule = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const choisirUneVille = () => {
    fermer()
    // Le champ de lieu de la barre, en bas : c'est l'autre façon de se situer.
    // Le dernier des champs `q` de la page : le premier est celui du panneau
    // de recherche de l'en-tête, inerte tant qu'il est fermé.
    setTimeout(() => {
      const champs = document.querySelectorAll<HTMLInputElement>('form[role="search"] input[name="q"]')
      champs[champs.length - 1]?.focus()
    }, DUREE_SORTIE)
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={localiser}
          disabled={etat === 'localisation'}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-teal px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          <LocateFixed className="size-4" />
          {etat === 'cadre' ? 'Me relocaliser' : 'Autour de moi'}
        </button>
        <p role="status" className="text-sm text-fg-2">
          {etat === 'localisation' && 'Le navigateur demande l’autorisation…'}
          {etat === 'cadre' && 'La carte est cadrée autour de vous, avec au moins dix professionnels.'}
        </p>
      </div>

      {fenetre !== 'fermee' && (
        <FenetreLocalisation
          base={base}
          etat={etat}
          sortie={fenetre === 'sortie'}
          localiser={localiser}
          choisirUneVille={choisirUneVille}
        />
      )}
    </>
  )
}

/**
 * La fenêtre qui précède la demande du navigateur : centrée sur un voile
 * flou, dans le dessin du site, avec les mêmes entrée et sortie que la pile
 * de fiches sur la carte.
 */
function FenetreLocalisation({
  base,
  etat,
  sortie,
  localiser,
  choisirUneVille,
}: {
  base: BaseUrl
  etat: Etat
  sortie: boolean
  localiser: () => void
  choisirUneVille: () => void
}) {
  const phase = usePhase(sortie)
  const quoi = `les ${LIBELLE[PROFESSION_PAR_BASE[base]].pluriel}`

  const texte: Record<Etat, string> = {
    attente: `Autorisez la localisation pour cadrer la carte sur ${quoi} autour de vous.`,
    localisation: 'Le navigateur vous demande l’autorisation, puis la carte se cadre autour de vous.',
    cadre: 'La carte est cadrée autour de vous.',
    refus: `La localisation est refusée pour ce site. Votre position n’est ni enregistrée ni transmise, elle ne servirait qu’à cadrer la carte sur ${quoi} autour de vous. Réactivez-la dans les réglages du navigateur, ou cherchez une ville.`,
    indisponible: 'Votre navigateur ne propose pas la localisation. Cherchez une ville à la place.',
    erreur: 'La localisation n’a pas abouti. Réessayez, ou cherchez une ville.',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="localisation-titre"
      data-phase={phase}
      onClick={choisirUneVille}
      className="group/voile fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Le voile : flou et teinte montent ensemble, puis redescendent. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-bg/40 backdrop-blur-md transition-[opacity,backdrop-filter] duration-[560ms] ease-lift group-data-[phase=entree]/voile:opacity-0 group-data-[phase=entree]/voile:backdrop-blur-none group-data-[phase=sortie]/voile:opacity-0 group-data-[phase=sortie]/voile:backdrop-blur-none group-data-[phase=sortie]/voile:duration-[380ms] motion-reduce:transition-none"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="squircle-2xl relative w-[26rem] max-w-full border border-line bg-bg p-6 shadow-pop transition-[opacity,translate,scale] duration-[560ms] ease-lift group-data-[phase=entree]/voile:translate-y-4 group-data-[phase=entree]/voile:scale-[0.96] group-data-[phase=entree]/voile:opacity-0 group-data-[phase=sortie]/voile:translate-y-3 group-data-[phase=sortie]/voile:scale-[0.96] group-data-[phase=sortie]/voile:opacity-0 group-data-[phase=sortie]/voile:duration-[340ms] motion-reduce:transition-none"
      >
        <button
          type="button"
          onClick={choisirUneVille}
          aria-label="Fermer"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg"
        >
          <X className="size-4" />
        </button>

        <span className="flex size-12 items-center justify-center rounded-xl bg-teal text-white">
          <LocateFixed className="size-6" />
        </span>
        <h2 id="localisation-titre" className="mt-4 text-xl font-semibold tracking-tight text-fg">
          {`Les ${LIBELLE[PROFESSION_PAR_BASE[base]].pluriel} autour de vous`}
        </h2>
        <p className="mt-2 text-sm text-fg-2">{texte[etat]}</p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={localiser}
            disabled={etat === 'localisation' || etat === 'indisponible'}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-teal px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <LocateFixed className="size-4" />
            {etat === 'localisation' ? 'Localisation…' : etat === 'refus' || etat === 'erreur' ? 'Réessayer' : 'Autoriser la localisation'}
          </button>
          <button
            type="button"
            onClick={choisirUneVille}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-line bg-bg px-5 text-sm font-semibold text-fg hover:bg-bg-soft"
          >
            Chercher une ville
          </button>
        </div>
      </div>
    </div>
  )
}
