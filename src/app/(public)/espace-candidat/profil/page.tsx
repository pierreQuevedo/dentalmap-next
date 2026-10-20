import { redirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'

/** Le profil candidat vit dans l'espace pro, onglet Emploi : l'ancienne adresse y mène. */
export default function Page() {
  redirect(chemin('/espace-pro/emploi/profil-candidat/'))
}
