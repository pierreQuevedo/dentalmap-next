import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Coquille } from '@/components/compte/coquille'
import { CreerCle } from '@/components/compte/cle-acces'
import { chemin } from '@/lib/navigation'
import { getCompte } from '@/lib/tunnel/compte'
import { moment, proposerCle } from '@/lib/tunnel/cle-acces'
import { etatCle, noterProposition } from '@/lib/tunnel/cle-acces-donnees'
import { retourSur } from '@/lib/tunnel/etapes'

export const metadata: Metadata = { title: 'La prochaine fois, d’un geste', robots: { index: false, follow: false } }
export const instant = false

/**
 * CX4 : proposer une clé d'accès, juste après une connexion par mot de passe.
 * La page décide seule : hors des conditions (voir `proposerCle`), elle
 * renvoie aussitôt là où l'on allait. Le mot de passe reste valable.
 */
export default async function Page(props: { searchParams: Promise<{ retour?: string }> }) {
  const retour = retourSur((await props.searchParams).retour)
  // Au milieu d'un parcours, on y retourne directement.
  if (!moment(retour)) redirect(chemin(retour))
  const compte = await getCompte()
  if (!compte) redirect(chemin(`/connexion/?retour=${encodeURIComponent(retour)}`))
  if (!proposerCle(await etatCle(compte.id))) redirect(chemin(retour))
  await noterProposition(compte.id)
  return (
    <Coquille retour={/^\/(espace-pro|inscription|favoris)/.test(retour) ? '/' : retour}>
      <CreerCle retour={retour} />
    </Coquille>
  )
}
