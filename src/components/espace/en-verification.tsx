import { Hourglass } from 'lucide-react'

/**
 * Tant que l'identité n'est pas vérifiée (revendication en attente) : tout ce
 * que le professionnel enregistre reste en brouillon, publié d'un coup à
 * l'accord de l'équipe ou de Pro Santé Connect. Affiché sur chaque écran de
 * l'onboarding et du tableau de bord.
 */
export function EnVerification({ className = '' }: { className?: string }) {
  return (
    <div role="status" className={`squircle-xl flex items-start gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-[18px] text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200 ${className}`}>
      <Hourglass className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        <span className="font-semibold">Identité en cours de vérification.</span> Vous pouvez tout préparer : vos modifications restent en brouillon et seront publiées sur votre fiche dès la validation.
      </p>
    </div>
  )
}
