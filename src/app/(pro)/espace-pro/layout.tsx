/**
 * L'espace pro d'un soignant, hors de l'en-tête du site : chaque page garde
 * sa session elle-même, pour revenir au bon endroit après la connexion.
 */
export default function EspaceProLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-bg">{children}</div>
}
