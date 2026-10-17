import { redirect } from 'next/navigation'
import { chemin } from '@/lib/navigation'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'

/**
 * JD1, retiré le 2026-10-13 : un soignant ne dépose plus de document. Le
 * contenu d'une attestation (nom, RPPS) est public, donc imitable ; seules
 * des preuves d'identité vérifiées à la source sont gardées (S3b). Les
 * anciens liens mènent au choix de la preuve.
 */
export default async function Page(props: { params: Promise<{ slug: string }>; searchParams: Promise<{ objet?: string }> }) {
  const { slug } = await props.params
  const { objet } = await props.searchParams
  redirect(chemin(`${REVENDIQUER}/${encodeURIComponent(slug)}/methode/${objet === 'retrait' ? '?objet=retrait' : ''}`))
}
