'use client'

import { useEffect, useRef, useState } from 'react'

/** La saisie annonce par cet événement la nouvelle valeur d'un bloc de l'aperçu : `{ cle, valeur }`. */
export const EVENEMENT_APERCU = 'dm-apercu'

/**
 * Une valeur de l'aperçu de l'onboarding qui suit la saisie : la ligne
 * « Délais » se met à jour dès qu'un délai est réglé, sans attendre
 * l'enregistrement.
 */
export function ValeurEnDirect({ cle, initiale }: { cle: string; initiale: string | null }) {
  const [valeur, setValeur] = useState(initiale)
  useEffect(() => {
    const ecouter = (e: Event) => {
      const d = (e as CustomEvent<{ cle: string; valeur: string | null }>).detail
      if (d.cle === cle) setValeur(d.valeur)
    }
    window.addEventListener(EVENEMENT_APERCU, ecouter)
    return () => window.removeEventListener(EVENEMENT_APERCU, ecouter)
  }, [cle])
  return <span className={`block truncate text-xs ${valeur ? 'text-fg' : 'text-fg-2'}`}>{valeur ?? 'À compléter'}</span>
}

/**
 * Placé dans un formulaire de l'onboarding : à chaque changement, la valeur
 * d'un bloc de l'aperçu, faite des choix cochés (ou sélectionnés) de chaque
 * groupe, dans l'ordre. Un groupe peut porter un préfixe ou un suffixe ; un
 * choix libre (`perso:<nom>`) s'affiche sous son nom.
 */
export function AnnonceChoix({ cle, groupes }: { cle: string; groupes: { champ: string; libelles: Record<string, string>; avant?: string; apres?: string }[] }) {
  const ancre = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const formulaire = ancre.current?.closest('form')
    if (!formulaire) return
    const annoncer = () => {
      const parties = groupes
        .map((g) => {
          const valeurs = [...formulaire.querySelectorAll<HTMLInputElement | HTMLSelectElement>(`[name="${g.champ}"]`)]
            .filter((e) => (e instanceof HTMLInputElement && (e.type === 'checkbox' || e.type === 'radio') ? e.checked : e.value !== ''))
            .map((e) => (e.value.startsWith('perso:') ? e.value.slice(6) : g.libelles[e.value]))
            .filter(Boolean)
          return valeurs.length ? `${g.avant ?? ''}${valeurs.join(', ')}${g.apres ?? ''}` : null
        })
        .filter(Boolean)
      const texte = parties.join(' · ')
      window.dispatchEvent(new CustomEvent(EVENEMENT_APERCU, { detail: { cle, valeur: texte ? texte.charAt(0).toUpperCase() + texte.slice(1) : null } }))
    }
    annoncer()
    formulaire.addEventListener('change', annoncer)
    // Un choix libre ajouté par un composant du formulaire arrive sans événement de saisie.
    const observateur = new MutationObserver(annoncer)
    observateur.observe(formulaire, { subtree: true, childList: true })
    return () => {
      observateur.disconnect()
      formulaire.removeEventListener('change', annoncer)
    }
  }, [cle, groupes])
  return <span ref={ancre} hidden />
}
