import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CircleX } from 'lucide-react'
import { Etapes, FicheResume, Pictogramme, cadre, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { DELAI_ANNULATION_RETRAIT_JOURS, REVENDIQUER } from '@/lib/espace-pro/chemins'
import { CoquilleParcours, adresseDe, etatFiche, ficheOu404, garde, libelleProfession, nomDe, versFiche } from '../../_commun'

export const metadata: Metadata = { title: 'Retirer votre fiche de DentalMap', robots: { index: false, follow: false } }
export const instant = false

/**
 * R1 : le droit de retrait. Les conséquences sont dites avant de confirmer, et
 * le retrait n'est appliqué qu'une fois l'identité vérifiée, par la même voie
 * qu'une revendication.
 */
export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const compte = await garde(`${REVENDIQUER}/${slug}/retrait/`)
  const fiche = await ficheOu404(slug, compte)

  return (
    <CoquilleParcours fiche={fiche} etiquette={etatFiche(fiche)} retour={versFiche(fiche)} libelleRetour="Retour à la fiche">
      <Etapes etape={2} libelle="Retrait" />
      <Pictogramme icone={CircleX} ton="erreur" />
      <h1 className={titre}>Retirer votre fiche de DentalMap</h1>
      <p className="mt-2 text-sm text-fg-2">C’est votre droit. La fiche disparaît des résultats et des moteurs de recherche, et n’est pas recréée par les synchronisations.</p>
      <div className={`${cadre} mt-6`}>
        <FicheResume profession={libelleProfession(fiche)} nom={nomDe(fiche)} adresse={adresseDe(fiche.resume)} rpps={fiche.rpps} />
      </div>
      <div className="squircle-xl mt-2.5 border border-line bg-bg-soft px-4 py-3.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Ce qui se passe</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-[13px] leading-[18px] text-fg">
          <li>La page de la fiche disparaît du site et de son plan.</li>
          <li>Les informations que vous avez ajoutées sont effacées.</li>
          <li>Vous pouvez annuler pendant {DELAI_ANNULATION_RETRAIT_JOURS} jours.</li>
        </ul>
      </div>
      <Link href={chemin(`${versFiche(fiche, 'methode')}?objet=retrait`)} className={`${principal} mt-4`}>
        Vérifier mon identité
        <ArrowRight className="size-4" aria-hidden />
      </Link>
      <Link href={chemin(versFiche(fiche))} className={`${discret} mt-1`}>
        Finalement, la garder
      </Link>
    </CoquilleParcours>
  )
}
