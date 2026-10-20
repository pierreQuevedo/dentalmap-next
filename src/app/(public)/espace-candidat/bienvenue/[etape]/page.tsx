import { redirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'

/** Le parcours de bienvenue candidat vit dans l'espace pro, onglet Emploi : l'ancienne adresse y mène, retour compris. */
export default async function Page(props: { params: Promise<{ etape: string }>; searchParams: Promise<{ retour?: string }> }) {
  const { etape } = await props.params
  const { retour } = await props.searchParams
  redirect(chemin(`/espace-pro/emploi/bienvenue/${encodeURIComponent(etape)}/${retour ? `?retour=${encodeURIComponent(retour)}` : ''}`))
}
