import type { Metadata } from 'next'
import { Info } from 'lucide-react'
import { CARTE_CHOIX, ChoixLibres, ContenuCarte } from '@/components/espace/choix-libres'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { PanneauMission } from '@/components/espace/mission'
import { enregistrerMarques } from '@/lib/espace-pro/actions-fiche'
import { FAMILLES_MARQUES, prefixeLibre } from '@/lib/espace-pro/marques'
import { chargerTableau } from '../../_commun'

/** Une marque absente de la liste, en exemple dans le champ libre de chaque famille. */
const EXEMPLES = { implants: 'Dentium', aligneurs: 'Clarity', numerique: 'Shining 3D', materiaux: 'Dentsply Sirona' } as const

export const metadata: Metadata = { title: 'Marques utilisées', robots: { index: false, follow: false } }
export const instant = false

/** Mission « Marques utilisées » : implants, aligneurs, numérique et matériaux, en cartes à cocher par famille ; une marque absente se nomme à la main. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, q } = await chargerTableau('missions', sp.fiche, 'marques')
  const choisies = new Set(espace.completee?.marques ?? [])
  return (
    <CoqueEspace c={coque} actif="progression" titre="Marques utilisées" sousTitre="+4 pts · 1 min" parent={{ libelle: 'Progression', href: `/espace-pro/progression/${q}` }}>
      <PanneauMission
        cle="marques"
        titre="Marques utilisées"
        meta="Mission · +4 pts · 1 min"
        intro="Les patients demandent souvent quel implant ou quelles gouttières vous posez. Cochez ce que vous utilisez au cabinet ; une marque suffit pour compter."
        action={enregistrerMarques}
        fiche={espace.fiche.slug}
        avant={espace.force.total}
        q={q}
        erreur={sp.erreur}
        cote={
          <Tuile>
            <TitreTuile i={Info}>Déclaré par vous</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">La fiche les présente comme des marques utilisées au cabinet, déclarées par le praticien : ni partenariat, ni recommandation de DentalMap.</p>
          </Tuile>
        }
      >
        <div className="space-y-6">
          {FAMILLES_MARQUES.map((f) => (
            <fieldset key={f.cle}>
              <legend className="font-semibold text-fg">{f.libelle}</legend>
              <p className="mt-0.5 text-sm text-fg-2">{f.detail}</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
                {f.marques.map((m) => (
                  <label key={m.code} className={CARTE_CHOIX}>
                    <input type="checkbox" name="marque" value={m.code} defaultChecked={choisies.has(m.code)} className="sr-only" />
                    <ContenuCarte nom={m.nom} />
                  </label>
                ))}
                <ChoixLibres name="marque" carte prefixe={prefixeLibre(f.cle)} initiaux={[...choisies]} ajout="Marque non listée" exemple={EXEMPLES[f.cle]} />
              </div>
            </fieldset>
          ))}
        </div>
      </PanneauMission>
    </CoqueEspace>
  )
}
