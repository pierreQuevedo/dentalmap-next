import type { Metadata } from 'next'
import { Coquille } from '@/components/compte/coquille'
import { Connexion, type Etat } from '@/components/compte/connexion'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à DentalMap pour accéder aux coordonnées des professionnels et revendiquer votre fiche.',
  robots: { index: false, follow: true },
}

export const instant = false

/**
 * Seuls les chemins internes sont acceptés comme retour.
 *
 * Un paramètre de redirection non filtré est un tremplin classique vers un
 * autre site : on n'accepte qu'un chemin commençant par une seule barre.
 */
function retourSur(valeur: string | undefined): string {
  if (!valeur || !valeur.startsWith('/') || valeur.startsWith('//')) return '/'
  return valeur
}

const ETATS: Etat[] = ['email', 'connu', 'motdepasse', 'nouveau', 'envoye', 'expire']

/**
 * `erreur=lien` est posé par Better Auth quand le lien magique a expiré ou a
 * déjà servi (`errorCallbackURL`) ; `error` est le même signal sous sa forme
 * brute. `apercu=1` montre les onglets d'états, et `etat=` en ouvre un :
 * pour vérifier chaque rendu, hors production seulement.
 */
export default async function ConnexionPage(props: { searchParams: Promise<{ retour?: string; erreur?: string; error?: string; apercu?: string; etat?: string }> }) {
  const sp = await props.searchParams
  const retour = retourSur(sp.retour)
  const apercu = process.env.NODE_ENV !== 'production' && sp.apercu === '1'
  const lienCasse = sp.erreur === 'lien' || Boolean(sp.error)
  const etatInitial: Etat = apercu && ETATS.includes(sp.etat as Etat) ? (sp.etat as Etat) : lienCasse ? 'expire' : 'email'

  return (
    <Coquille retour={retour === '/' ? '/' : retour}>
      <Connexion retour={retour} etatInitial={etatInitial} apercu={apercu} />
    </Coquille>
  )
}
