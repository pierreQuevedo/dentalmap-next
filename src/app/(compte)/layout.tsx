/**
 * Les pages du compte, connexion et inscription, sans l'en-tête ni le pied
 * de page du site : un écran partagé entre une carte décorative et le
 * formulaire, comme un seuil. Le retour au site passe par le lien en haut.
 */
/** Pages liées à la session ou à la requête : bloquantes, toutes, sous ce groupe. */
export const instant = false

export default function CompteLayout({ children }: LayoutProps<'/'>) {
  return <div className="min-h-dvh bg-bg">{children}</div>
}
