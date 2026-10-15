'use client'

import type { BaseUrl } from '@/lib/annuaire/types'

import { useEffect, useState } from 'react'
import { LocateFixed } from 'lucide-react'
import { empriseAutour } from '@/lib/annuaire/emprise'
import { useRecherche } from './contexte'

/**
 * « Près de chez vous » : la position de l'utilisateur, puis un cadrage qui
 * montre au moins dix praticiens.
 *
 * La position est demandée d'emblée, sans fenêtre du site : le navigateur
 * affiche sa propre demande, qu'on ne peut pas habiller, et c'est elle qui
 * fait foi. Quand l'autorisation a déjà été donnée, la carte se cadre sans
 * rien demander. En cas de refus ou d'échec, une ligne sous le bouton dit
 * quoi faire : réactiver la localisation, réessayer ou chercher une ville.
 *
 * Le rayon vient de la route `/api/geo/autour/`, qui rend la distance du
 * dixième praticien le plus proche : c'est ce qui garantit que le cadre n'est
 * jamais vide, à la campagne comme en ville. La liste suit, par le contexte.
 */
type Etat = 'attente' | 'localisation' | 'cadre' | 'refus' | 'indisponible' | 'erreur'

const RAYON_MINIMUM = 800

export function AutourDeMoi({ base }: { base: BaseUrl }) {
  const { recadrer } = useRecherche()
  const [etat, setEtat] = useState<Etat>('attente')

  const localiser = () => {
    if (!('geolocation' in navigator)) {
      setEtat('indisponible')
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
        } catch {
          setEtat('erreur')
        }
      },
      (e) => {
        setEtat(e.code === e.PERMISSION_DENIED ? 'refus' : 'erreur')
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 300_000 },
    )
  }

  // Demandée au chargement : c'est l'objet de la page. Si l'autorisation a
  // déjà été refusée, inutile de redemander, le navigateur ne le proposera
  // plus : la ligne d'état explique directement comment faire.
  useEffect(() => {
    let annule = false
    const demarrer = async () => {
      try {
        const statut = await navigator.permissions?.query({ name: 'geolocation' })
        if (annule) return
        if (statut?.state === 'denied') {
          setEtat('refus')
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

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={localiser}
        disabled={etat === 'localisation' || etat === 'indisponible'}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-teal px-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        <LocateFixed className="size-4" />
        {etat === 'cadre' ? 'Me relocaliser' : etat === 'refus' || etat === 'erreur' ? 'Réessayer' : 'Autour de moi'}
      </button>
      <p role="status" className="text-sm text-fg-2">
        {MESSAGES[etat]}
      </p>
    </div>
  )
}

const MESSAGES: Record<Etat, string> = {
  attente: '',
  localisation: 'Le navigateur demande l’autorisation…',
  cadre: 'La carte est cadrée autour de vous, avec au moins dix professionnels.',
  refus: 'La localisation est refusée pour ce site. Réactivez-la dans les réglages du navigateur, ou cherchez une ville dans la barre en bas.',
  indisponible: 'Votre navigateur ne propose pas la localisation. Cherchez une ville dans la barre en bas.',
  erreur: 'La localisation n’a pas abouti. Réessayez, ou cherchez une ville dans la barre en bas.',
}
