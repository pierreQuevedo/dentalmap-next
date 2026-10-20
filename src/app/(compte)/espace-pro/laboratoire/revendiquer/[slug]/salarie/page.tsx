import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Users } from 'lucide-react'
import { Pictogramme, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { CoquilleParcours, ficheOu404, garde } from '@/app/(compte)/espace-pro/revendiquer/_commun'
import { LABO, versLabo } from '@/app/(compte)/espace-pro/laboratoire/_commun'

export const metadata: Metadata = { title: 'Créez votre compte de prothésiste', robots: { index: false, follow: false } }
export const instant = false

/**
 * LINFO : le prothésiste salarié ne gère pas la fiche du laboratoire. Aucune
 * revendication, aucun lien avec l'espace du laboratoire : il est invité à
 * créer son profil candidat, dans l'Emploi de l'espace pro.
 */
export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const compte = await garde(`${LABO}/${slug}/salarie/`, 'prothesiste')
  const fiche = await ficheOu404(slug, compte)
  return (
    <CoquilleParcours profession="prothesiste" fiche={fiche} retour={versLabo(fiche.slug)} libelleRetour="Retour">
      <Pictogramme icone={Users} />
      <h1 className={titre}>Créez votre compte de prothésiste</h1>
      <p className="mt-2 text-sm text-fg-2">
        La fiche est celle du laboratoire : c’est le gérant, ou un salarié qu’il mandate, qui la gère. Vous pouvez créer votre propre compte de prothésiste salarié.
      </p>
      <Link href={chemin('/espace-pro/emploi/bienvenue/situation/')} className={`${principal} mt-6`}>
        Créer mon compte
        <ArrowRight className="size-4" aria-hidden />
      </Link>
      <Link href={chemin(versLabo(fiche.slug))} className={`${discret} mt-1`}>
        Retour
      </Link>
    </CoquilleParcours>
  )
}
