import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Users } from 'lucide-react'
import { Encart, Pictogramme, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { poserAlerte } from '@/lib/espace-pro/actions-revendication'
import { CoquilleParcours, ficheOu404, garde } from '@/app/(compte)/espace-pro/revendiquer/_commun'
import { LABO, versLabo } from '@/app/(compte)/espace-pro/laboratoire/_commun'

export const metadata: Metadata = { title: 'Pas de fiche individuelle pour l’instant', robots: { index: false, follow: false } }
export const instant = false

/** LINFO : le prothésiste salarié n'a pas de fiche à gérer. Aucune revendication : une liste pour être prévenu. */
export default async function Page(props: { params: Promise<{ slug: string }>; searchParams: Promise<{ alerte?: string }> }) {
  const { slug } = await props.params
  const { alerte } = await props.searchParams
  const ici = `${LABO}/${slug}/salarie/`
  const compte = await garde(ici, 'prothesiste')
  const fiche = await ficheOu404(slug, compte)
  return (
    <CoquilleParcours fiche={fiche} retour={versLabo(fiche.slug)} libelleRetour="Retour">
      <Pictogramme icone={Users} />
      <h1 className={titre}>Pas de fiche individuelle pour l’instant</h1>
      <p className="mt-2 text-sm text-fg-2">
        La fiche est celle du laboratoire : c’est le gérant, ou un salarié qu’il mandate, qui la gère. Il peut aussi vous inviter dans son équipe depuis son espace.
      </p>
      {alerte ? (
        <Encart titre="C’est noté" className="mt-6">
          Nous vous écrivons dès que les prothésistes salariés peuvent avoir leur profil.
        </Encart>
      ) : (
        <form action={poserAlerte}>
          <input type="hidden" name="motif" value="prothesiste_salarie" />
          <input type="hidden" name="fiche" value={fiche.slug} />
          <input type="hidden" name="retour" value={ici} />
          <button type="submit" className={`${principal} mt-6`}>
            Me prévenir quand ce sera possible
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </form>
      )}
      <Link href={chemin(alerte ? '/' : versLabo(fiche.slug))} className={`${discret} mt-1`}>
        {alerte ? 'Continuer' : 'Retour'}
      </Link>
    </CoquilleParcours>
  )
}
