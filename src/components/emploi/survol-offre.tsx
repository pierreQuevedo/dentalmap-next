'use client'

import { useEffect, useRef, useState } from 'react'
import { OFFRE_CHOISIE, OFFRE_SURVOLEE } from './carte-offres'

/**
 * Une offre de la liste, liée à la carte : la survoler ou la cibler au clavier
 * la montre sur la carte ; choisie sur la carte, elle défile dans la vue et
 * reste soulignée.
 */
export function SurvolOffre({ id, actifDepart = false, children }: { id: string; actifDepart?: boolean; children: React.ReactNode }) {
  const ici = useRef<HTMLLIElement>(null)
  const [choisie, setChoisie] = useState(actifDepart)
  useEffect(() => {
    const surChoix = (ev: Event) => {
      const cible = (ev as CustomEvent<string>).detail
      setChoisie(cible === id)
      if (cible === id) ici.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    const surSurvol = (ev: Event) => setChoisie((ev as CustomEvent<string>).detail === id)
    window.addEventListener(OFFRE_CHOISIE, surChoix)
    window.addEventListener(OFFRE_SURVOLEE, surSurvol)
    return () => {
      window.removeEventListener(OFFRE_CHOISIE, surChoix)
      window.removeEventListener(OFFRE_SURVOLEE, surSurvol)
    }
  }, [id])
  const montrer = () => window.dispatchEvent(new CustomEvent(OFFRE_SURVOLEE, { detail: id }))
  return (
    <li ref={ici} onMouseEnter={montrer} onFocus={montrer} data-choisie={choisie || undefined} className="scroll-mt-28 rounded-2xl data-[choisie]:[&>div]:border-line-strong data-[choisie]:[&>div]:shadow-pop">
      {children}
    </li>
  )
}
