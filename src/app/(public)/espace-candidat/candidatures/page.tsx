import { redirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'

/** Les candidatures envoyées vivent dans l'espace pro, onglet Emploi : l'ancienne adresse y mène. */
export default function Page() {
  redirect(chemin('/espace-pro/emploi/mes-candidatures/'))
}
