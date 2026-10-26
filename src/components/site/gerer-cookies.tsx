'use client'

/**
 * Rouvre le bandeau Axeptio (chargé par Google Tag Manager) pour revenir sur
 * ses choix de cookies, comme le promet la politique de confidentialité.
 * Tant que le script d'Axeptio n'est pas là, le bouton ne fait rien.
 */
export function GererCookies({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => (window as Window & { openAxeptioCookies?: () => void }).openAxeptioCookies?.()}
      className={className}
    >
      Gérer mes cookies
    </button>
  )
}
