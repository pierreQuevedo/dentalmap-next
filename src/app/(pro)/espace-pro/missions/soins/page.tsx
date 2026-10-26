import type { Metadata } from 'next'
import { Info } from 'lucide-react'
import { Puce } from '@/components/compte/ui'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { PanneauMission } from '@/components/espace/mission'
import { enregistrerSoins } from '@/lib/espace-pro/actions-fiche'
import { orientationsDe } from '@/lib/espace-pro/fiche-completee'
import { chargerTableau } from '../../_commun'

export const metadata: Metadata = { title: 'Domaines de soins', robots: { index: false, follow: false } }
export const instant = false

/** Mission « Domaines de soins » : au moins deux, dans une liste fermée, pour ouvrir le filtre par domaine. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, q } = await chargerTableau('missions', sp.fiche, 'soins')
  const choisis = new Set(espace.completee?.orientations ?? [])
  return (
    <CoqueEspace c={coque} actif="progression" titre="Domaines de soins" sousTitre="+4 pts · 1 min" parent={{ libelle: 'Progression', href: `/espace-pro/progression/${q}` }}>
      <PanneauMission
        cle="soins"
        titre="Domaines de soins"
        meta="Mission · +4 pts · 1 min"
        intro="Ce que vous pratiquez le plus, au-delà de votre spécialité. Au moins deux pour compter ; chacun ouvre un filtre de la recherche."
        action={enregistrerSoins}
        fiche={espace.fiche.slug}
        avant={espace.force.total}
        q={q}
        erreur={sp.erreur}
        champs={{ profession: espace.fiche.profession }}
        cote={
          <Tuile>
            <TitreTuile i={Info}>Ce ne sont pas des spécialités</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">Implantologie ou endodontie n’ont pas de code au registre : la fiche les présente comme des domaines déclarés par le praticien, à part des données officielles.</p>
          </Tuile>
        }
      >
        <fieldset>
          <legend className="sr-only">Vos domaines de soins</legend>
          <div className="flex flex-wrap gap-2">
            {orientationsDe(espace.fiche.profession).map((o) => (
              <Puce key={o.code} name="orientation" value={o.code} multiple defaultChecked={choisis.has(o.code)}>
                {o.court}
              </Puce>
            ))}
          </div>
        </fieldset>
      </PanneauMission>
    </CoqueEspace>
  )
}
