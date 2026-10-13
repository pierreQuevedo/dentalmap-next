import type { Metadata } from 'next'
import { Coquille } from '@/components/compte/coquille'
import { Connexion } from '@/components/compte/connexion'
import { estRole, retourSur } from '@/lib/tunnel/etapes'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à DentalMap avec votre adresse et votre mot de passe pour accéder aux coordonnées des professionnels et revendiquer votre fiche.',
  robots: { index: false, follow: true },
}

export const instant = false

/**
 * Connexion et inscription.
 *
 * Seuls les chemins internes sont acceptés comme retour (pas de tremplin vers
 * un autre site). `?mode=inscription` ouvre l'inscription, `&profil=` y
 * présélectionne le profil : `prothesiste` pour « Créer un compte laboratoire »,
 * par exemple.
 */
export default async function ConnexionPage(props: { searchParams: Promise<{ retour?: string; mode?: string; profil?: string }> }) {
  const sp = await props.searchParams
  const retour = retourSur(sp.retour)
  // « Retour au site » ne doit pas renvoyer vers une page qui exige une session : elle ramènerait ici.
  const sortie = /^\/(espace-pro|inscription|favoris)/.test(retour) ? '/' : retour

  return (
    <Coquille retour={sortie}>
      <Connexion retour={retour} inscription={sp.mode === 'inscription'} profil={estRole(sp.profil) ? sp.profil : undefined} />
    </Coquille>
  )
}
