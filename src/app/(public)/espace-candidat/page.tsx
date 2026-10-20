import { redirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'
import { getProfilCandidat } from '@/lib/emploi/candidat-donnees'
import { exigerConnexion } from '@/lib/tunnel/compte'

export const instant = false

/** L'entrée de l'espace candidat : le parcours de bienvenue la première fois, les candidatures ensuite. */
export default async function Page() {
  const compte = await exigerConnexion('/espace-candidat/')
  const profil = await getProfilCandidat(compte.id)
  redirect(chemin(profil?.termine ? '/espace-candidat/candidatures/' : '/espace-candidat/bienvenue/situation/'))
}
