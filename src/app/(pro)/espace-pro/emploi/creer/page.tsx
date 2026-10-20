import { redirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'
import { getCabinetRecrutement } from '@/lib/emploi/recruteur'
import { chargerTableau } from '../../_commun'

export const instant = false

/** « Créer un poste » : la page du cabinet la première fois, celle du poste ensuite. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const sp = await props.searchParams
  const { espace, q } = await chargerTableau('emploi', sp.fiche, 'creer')
  const cabinet = await getCabinetRecrutement(espace.fiche.id)
  const deja = cabinet.presentation || cabinet.avantages.length || cabinet.lieuId
  redirect(chemin(`/espace-pro/emploi/creer/${deja ? 'poste' : 'cabinet'}/${q}`))
}
