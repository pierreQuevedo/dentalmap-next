import type { Metadata } from 'next'
import Link from 'next/link'
import { Bell, Users } from 'lucide-react'
import { Encart, Pictogramme, Puce, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'
import { poserAlerte } from '@/lib/espace-pro/actions-revendication'
import { CoquilleParcours, ficheOu404, garde, versFiche } from '../../_commun'

export const metadata: Metadata = { title: 'Vous exercez dans le cabinet d’un confrère ?', robots: { index: false, follow: false } }
export const instant = false

/**
 * REMP : remplaçants, collaborateurs et salariés n'ont pas de fiche à leur nom
 * dans le cabinet d'un confrère. Aucune revendication n'est créée : une
 * inscription à une liste, pour être prévenu.
 */
export default async function Page(props: { params: Promise<{ slug: string }>; searchParams: Promise<{ alerte?: string }> }) {
  const { slug } = await props.params
  const { alerte } = await props.searchParams
  const ici = `${REVENDIQUER}/${slug}/remplacant/`
  const compte = await garde(ici)
  const fiche = await ficheOu404(slug, compte)

  return (
    <CoquilleParcours
      fiche={fiche}
      encart={{ icone: 'confrere', ton: 'attention', titre: 'Cabinet d’un confrère', texte: 'Pas encore de fiche au nom du remplaçant.' }}
      retour={versFiche(fiche)}
      libelleRetour="Retour"
    >
      <Pictogramme icone={Users} />
      <h1 className={titre}>Vous exercez dans le cabinet d’un confrère ?</h1>
      <p className="mt-2 text-sm text-fg-2">Les remplaçants et collaborateurs n’ont pas encore de fiche à leur nom. Nous vous prévenons dès que c’est possible.</p>
      {alerte ? (
        <Encart titre="C’est noté" className="mt-6">
          Nous vous écrivons dès que les remplaçants et collaborateurs peuvent avoir leur fiche.
        </Encart>
      ) : (
        <form action={poserAlerte} className="mt-6">
          <input type="hidden" name="motif" value="remplacant" />
          <input type="hidden" name="fiche" value={fiche.slug} />
          <input type="hidden" name="retour" value={ici} />
          <fieldset>
            <legend className="sr-only">Votre exercice</legend>
            <div className="flex flex-wrap gap-2">
              <Puce name="exercice" value="remplacant" defaultChecked>
                Remplaçant
              </Puce>
              <Puce name="exercice" value="collaborateur">
                Collaborateur libéral
              </Puce>
              <Puce name="exercice" value="salarie">
                Salarié d’un centre
              </Puce>
            </div>
          </fieldset>
          <button type="submit" className={`${principal} mt-5`}>
            <Bell className="size-4" aria-hidden />
            Me prévenir
          </button>
        </form>
      )}
      <Link href={chemin(versFiche(fiche))} className={`${discret} mt-1`}>
        Retour
      </Link>
    </CoquilleParcours>
  )
}
