'use client'

/**
 * Le lien du pied de page qui rouvre le bandeau Axeptio, pour revenir sur son
 * choix à tout moment.
 */
export function GererCookies({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => (window as Window & { openAxeptioCookies?: () => void }).openAxeptioCookies?.()}
      className={className}
    >
      Gérer les cookies
    </button>
  )
}
