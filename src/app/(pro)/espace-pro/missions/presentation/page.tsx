import type { Metadata } from 'next'
import { lireSaisie } from '@/lib/espace-pro/saisie'
import { Sparkles } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { PanneauMission } from '@/components/espace/mission'
import { SaisiePresentation } from '@/components/espace/saisie-presentation'
import { enregistrerPresentation } from '@/lib/espace-pro/actions-fiche'
import { chargerTableau } from '../../_commun'

export const metadata: Metadata = { title: 'Présentation', robots: { index: false, follow: false } }
export const instant = false

/** MIS-2 : la présentation du cabinet. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, q } = await chargerTableau('missions', sp.fiche, 'presentation')
  const gardee = await lireSaisie('/espace-pro/missions/presentation/', sp.erreur)
  const gain = espace.labo ? 5 : 10
  return (
    <CoqueEspace c={coque} actif={espace.labo ? 'fiche' : 'progression'} titre="Progression" sousTitre={`Présentation · +${gain} pts · ${espace.labo ? 4 : 5} min`}>
      <PanneauMission
        cle="presentation"
        titre="Présentation"
        meta={`Mission · +${gain} pts · ${espace.labo ? 4 : 5} min`}
        intro={
          espace.labo
            ? 'Votre laboratoire, ses spécialités, la façon de travailler avec les cabinets. Pas de promesse de résultat ni de comparaison.'
            : 'Votre approche, l’organisation du cabinet, ce qu’un patient doit savoir avant de venir. Pas de promesse de résultat ni de comparaison.'
        }
        action={enregistrerPresentation}
        fiche={espace.fiche.slug}
        avant={espace.force.total}
        q={q}
        erreur={sp.erreur}
        cote={
          <Tuile>
            <TitreTuile i={Sparkles}>Conseils</TitreTuile>
            <ul className="mt-4 space-y-3 text-sm text-fg-2">
              <li>Commencez par ce qui distingue l’accueil : nombre de fauteuils, urgences, enfants reçus.</li>
              <li>Parlez de vos domaines de soins sans les présenter comme des spécialités.</li>
              <li>Évitez les superlatifs : le Code de déontologie interdit la publicité comparative.</li>
            </ul>
          </Tuile>
        }
      >
        <SaisiePresentation initiale={gardee.texte('presentation') ?? espace.completee?.presentation ?? ''} />
      </PanneauMission>
    </CoqueEspace>
  )
}
