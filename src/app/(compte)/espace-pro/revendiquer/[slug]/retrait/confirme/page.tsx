import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CircleCheck } from 'lucide-react'
import { Encart, Pictogramme, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { DELAI_ANNULATION_RETRAIT_JOURS, REVENDIQUER } from '@/lib/espace-pro/chemins'
import { annulerRetrait } from '@/lib/espace-pro/actions-revendication'
import { CoquilleParcours, ficheOu404, garde, versFiche } from '../../../_commun'

export const metadata: Metadata = { title: 'Votre fiche est retirée', robots: { index: false, follow: false } }
export const instant = false

/** R2 : la fiche est retirée. Trente jours pour changer d'avis, par le compte qui l'a retirée. */
export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const compte = await garde(`${REVENDIQUER}/${slug}/retrait/confirme/`)
  const fiche = await ficheOu404(slug, compte, { retirees: true })
  if (!fiche.retireLe || fiche.demande?.objet !== 'retrait' || fiche.demande.statut !== 'acceptee') redirect(chemin(versFiche(fiche)))
  const limite = new Date(new Date(fiche.retireLe).getTime() + DELAI_ANNULATION_RETRAIT_JOURS * 86_400_000)
  const annulable = limite > new Date()

  return (
    <CoquilleParcours fiche={fiche} etiquette="Retirée de DentalMap">
      <Pictogramme icone={CircleCheck} ton="succes" />
      <h1 className={titre}>Votre fiche est retirée</h1>
      <p className="mt-2 text-sm text-fg-2">Elle n’apparaît plus sur DentalMap. Les moteurs de recherche l’oublieront dans les jours qui viennent.</p>
      {annulable && (
        <Encart titre="Changement d’avis ?" className="mt-6">
          Vous pouvez annuler le retrait jusqu’au {limite.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })}. Ensuite,
          il faudra revendiquer la fiche à nouveau.
        </Encart>
      )}
      <Link href={chemin('/')} className={`${principal} mt-4`}>
        Terminer
      </Link>
      {annulable && (
        <form action={annulerRetrait}>
          <input type="hidden" name="fiche" value={fiche.slug} />
          <button type="submit" className={`${discret} mt-1`}>
            Annuler le retrait
          </button>
        </form>
      )}
    </CoquilleParcours>
  )
}
