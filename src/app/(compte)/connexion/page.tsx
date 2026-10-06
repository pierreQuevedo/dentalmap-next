import type { Metadata } from 'next'
import { Coquille } from '@/components/compte/coquille'
import { Connexion } from '@/components/compte/connexion'
import { ETATS, type Etat } from '@/components/compte/etats'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à DentalMap avec votre adresse et votre mot de passe pour accéder aux coordonnées des professionnels et revendiquer votre fiche.',
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

/**
 * Hors production, des onglets passent d'un état à l'autre pour vérifier
 * chaque rendu, `etat=` en ouvre un et `apercu=0` les cache.
 */
export default async function ConnexionPage(props: { searchParams: Promise<{ retour?: string; apercu?: string; etat?: string }> }) {
  const sp = await props.searchParams
  const retour = retourSur(sp.retour)
  const apercu = process.env.NODE_ENV !== 'production' && sp.apercu !== '0'
  const etatInitial: Etat = apercu && ETATS.some((e) => e.cle === sp.etat) ? (sp.etat as Etat) : 'connexion'

  return (
    <Coquille retour={retour === '/' ? '/' : retour}>
      <Connexion retour={retour} etatInitial={etatInitial} apercu={apercu} />
    </Coquille>
  )
}
