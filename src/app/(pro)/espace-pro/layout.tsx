/**
 * L'espace pro d'un soignant, hors de l'en-tête du site : chaque page garde
 * sa session elle-même, pour revenir au bon endroit après la connexion.
 */
/** Chaque page lit la session : le segment entier est bloquant. */
export const instant = false

export default function EspaceProLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-bg">{children}</div>
}
