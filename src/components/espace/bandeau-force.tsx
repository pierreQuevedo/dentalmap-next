'use client'

import { useEffect, useRef, useState } from 'react'
import { progressionDe } from '@/lib/espace-pro/progression'
import { Anneau } from './anneau'

/**
 * Le taux de la fiche sous l'aperçu de l'onboarding, et le palier qu'il
 * vaut. Il monte pendant la saisie, avant même l'enregistrement : le
 * formulaire annonce par `dm-force-saisie` les points que ses champs
 * rapporteraient (`SaisieEnDirect`).
 */
export const EVENEMENT_FORCE = 'dm-force-saisie'

export function BandeauForce({ force, points, verifiee = true, className = '' }: { force: number; /** Les points de progression, quand l'appelant les a : le palier se lit sur eux. */ points?: number; verifiee?: boolean; className?: string }) {
  const [gain, setGain] = useState(0)
  useEffect(() => {
    const ecouter = (e: Event) => setGain((e as CustomEvent<number>).detail)
    window.addEventListener(EVENEMENT_FORCE, ecouter)
    return () => window.removeEventListener(EVENEMENT_FORCE, ecouter)
  }, [])
  const total = Math.min(100, force + gain)
  // Un point par pour cent : la saisie en cours fait monter les deux d'autant.
  const pts = points === undefined ? null : points + gain
  const p = progressionDe(pts ?? total, verifiee)
  const palier = !verifiee
    ? 'palier 1 dès la vérification'
    : p.actuel
      ? `palier ${p.actuel.niveau} · ${p.actuel.nom}`
      : `encore ${p.reste} % pour le palier 1`
  return (
    <div className={`squircle-2xl flex items-center gap-3 border border-line bg-bg p-3 ${className}`}>
      <Anneau pct={total} taille={44} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-fg">
          Fiche à {total} %{pts !== null && <span className="font-normal text-fg-2"> · {pts} pts</span>}
          {gain > 0 && <span className="ml-1.5 text-xs font-semibold text-teal">+{gain}</span>}
        </p>
        <p className="text-xs text-fg-2">{palier.charAt(0).toUpperCase() + palier.slice(1)}</p>
      </div>
    </div>
  )
}

/**
 * Les règles d'un formulaire : tant de champs cochés ou remplis pour un nom
 * (ou un préfixe suivi de `*`) rapportent tant de points (ceux qui restent à gagner). Placé dans le
 * formulaire, il recalcule à chaque changement et l'annonce au bandeau.
 */
export function SaisieEnDirect({ regles }: { regles: { champ: string; min: number; points: number }[] }) {
  const ancre = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const formulaire = ancre.current?.closest('form')
    if (!formulaire) return
    const calculer = () => {
      const gain = regles.reduce((s, r) => {
        // « delai_* » : tous les champs qui commencent ainsi.
        const selecteur = r.champ.endsWith('*') ? `input[name^="${r.champ.slice(0, -1)}"]` : `input[name="${r.champ}"]`
        const n = [...formulaire.querySelectorAll<HTMLInputElement>(selecteur)].filter((i) => (i.type === 'checkbox' || i.type === 'radio' ? i.checked : !!i.value.trim())).length
        return s + (n >= r.min ? r.points : 0)
      }, 0)
      window.dispatchEvent(new CustomEvent(EVENEMENT_FORCE, { detail: gain }))
    }
    // Un formulaire prérempli (délais types, rayon) compte dès l'arrivée.
    calculer()
    formulaire.addEventListener('input', calculer)
    formulaire.addEventListener('change', calculer)
    // Les délais réglés au bouton ajoutent leur champ caché sans événement de saisie : on suit aussi le formulaire lui-même.
    const observateur = new MutationObserver(calculer)
    observateur.observe(formulaire, { subtree: true, childList: true, attributes: true, attributeFilter: ['value'] })
    return () => {
      observateur.disconnect()
      formulaire.removeEventListener('input', calculer)
      formulaire.removeEventListener('change', calculer)
      window.dispatchEvent(new CustomEvent(EVENEMENT_FORCE, { detail: 0 }))
    }
  }, [regles])
  return <span ref={ancre} hidden />
}
