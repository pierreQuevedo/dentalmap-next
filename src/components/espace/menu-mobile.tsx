'use client'

import { useRef } from 'react'

/**
 * Le menu de l'espace pro sur mobile, replié par défaut. Il se referme dès
 * qu'on touche un lien : la page suivante garde sinon le menu ouvert, React
 * conservant l'élément d'une page à l'autre.
 */
export function MenuMobile({ className, children }: { className: string; children: React.ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null)
  return (
    <details
      ref={menu}
      className={className}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('a')) menu.current?.removeAttribute('open')
      }}
    >
      {children}
    </details>
  )
}
