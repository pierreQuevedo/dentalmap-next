'use client'

import { useEffect, useRef } from 'react'

/**
 * Placé dans la zone de menu qui défile : à chaque page, l'entrée active
 * (`aria-current="page"`) est ramenée dans le cadre, sans animation.
 */
export function DefilementActif({ actif }: { actif: string }) {
  const ancre = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    ancre.current?.parentElement?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' })
  }, [actif])
  return <span ref={ancre} hidden />
}
