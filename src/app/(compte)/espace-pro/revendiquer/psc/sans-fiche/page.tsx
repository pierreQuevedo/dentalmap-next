import type { Metadata } from 'next'
import Link from 'next/link'
import { Bell, Hourglass } from 'lucide-react'
import { Encart, Pictogramme, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'
import { poserAlerte } from '@/lib/espace-pro/actions-revendication'
import { nettoyerRpps, rppsValide } from '@/lib/espace-pro/rpps'
import { CoquilleParcours, garde } from '../../_commun'

export const metadata: Metadata = { title: 'Votre fiche n’existe pas encore', robots: { index: false, follow: false } }
export const instant = false

/**
 * PSC-0 : un RPPS certifié par Pro Santé Connect, sans fiche chez nous. Le
 * praticien est valide ; sa fiche arrivera avec la synchronisation de
 * l'Annuaire Santé, et l'alerte le prévient.
 */
export default async function Page(props: { searchParams: Promise<{ rpps?: string; alerte?: string }> }) {
  const { rpps: brut = '', alerte } = await props.searchParams
  const rpps = nettoyerRpps(brut)
  const ici = `${REVENDIQUER}/psc/sans-fiche/?rpps=${rpps}`
  await garde(ici)

  return (
    <CoquilleParcours
      recherche={rpps}
      encart={{ icone: 'sablier', ton: 'attention', titre: 'RPPS valide, fiche à venir', texte: 'Créée à la prochaine synchronisation de l’Annuaire Santé.' }}
    >
      <Pictogramme icone={Hourglass} ton="attention" />
      <h1 className={titre}>Votre fiche n’existe pas encore</h1>
      <p className="mt-2 text-sm text-fg-2">
        Votre RPPS <span className="font-medium text-fg">{rpps}</span> est valide, mais l’Annuaire Santé ne l’a pas encore transmis. Nous créerons la fiche à
        la prochaine synchronisation.
      </p>
      <Encart titre="Synchronisation hebdomadaire" className="mt-6">
        {alerte ? 'C’est noté : nous vous écrivons dès que la fiche est en ligne. Vous pourrez alors la revendiquer.' : 'Elle a lieu chaque semaine. Vous recevez un email dès que la fiche est en ligne.'}
      </Encart>
      {!alerte && rppsValide(rpps) && (
        <form action={poserAlerte}>
          <input type="hidden" name="motif" value="fiche_creee" />
          <input type="hidden" name="rpps" value={rpps} />
          <input type="hidden" name="retour" value={ici} />
          <button type="submit" className={`${principal} mt-4`}>
            <Bell className="size-4" aria-hidden />
            M’avertir par email
          </button>
        </form>
      )}
      <Link href={chemin('/')} className={`${alerte ? principal : discret} ${alerte ? 'mt-4' : 'mt-1'}`}>
        Retour à l’accueil
      </Link>
    </CoquilleParcours>
  )
}
