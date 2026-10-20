import type { Metadata } from 'next'
import { lireSaisie } from '@/lib/espace-pro/saisie'
import { FileCheck2, Hash } from 'lucide-react'
import { Encart, pastille, principal, saisie } from '@/components/compte/ui'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { enregistrerAnsm } from '@/lib/espace-pro/actions-fiche'
import { Caches, chargerLabo } from '../_labo'

export const metadata: Metadata = { title: 'Conformité', robots: { index: false, follow: false } }
export const instant = false

/** Mission ANSM : tout fabricant de dispositifs médicaux sur mesure se déclare auprès de l'ANSM. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerLabo('conformite', sp.fiche)
  const c = t.espace.completee
  const gardee = await lireSaisie('/espace-pro/conformite/', sp.erreur)
  return (
    <CoqueEspace c={t.coque} actif="conformite" titre="Conformité" sousTitre={`Déclaration ANSM · +10 % · 2 min${c?.ansmNumero ? ' · faite' : ''}`}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form action={enregistrerAnsm} className="squircle-2xl border border-line bg-bg p-6">
          <Caches t={t} page="conformite" />
          <p className="text-xs text-fg-2">Mission · +10 % · 2 min</p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-fg">
            <FileCheck2 className="size-5 text-teal" aria-hidden /> Déclaration ANSM
          </h2>
          <p className="mt-2 text-sm text-fg-2">Tout fabricant de dispositifs médicaux sur mesure se déclare auprès de l’ANSM. Indiquez la référence de votre déclaration.</p>
          {sp.erreur && <Encart ton="erreur" className="mt-4">{sp.erreur}</Encart>}
          <div className="mt-5 space-y-4 text-sm">
            <div>
              <label htmlFor="ansm-numero" className="mb-1.5 block font-medium text-fg">
                Numéro d’enregistrement
              </label>
              <div className={pastille}>
                <Hash className="size-4 shrink-0 text-fg-2" aria-hidden />
                <input id="ansm-numero" name="numero" defaultValue={gardee.texte('numero') ?? c?.ansmNumero ?? ''} placeholder="Référence de la déclaration" className={`${saisie} font-mono uppercase`} />
              </div>
            </div>
            <div>
              <label htmlFor="ansm-date" className="mb-1.5 block font-medium text-fg">
                Date de la déclaration
              </label>
              <div className={pastille}>
                <input id="ansm-date" name="date" type="date" defaultValue={gardee.texte('date') ?? c?.ansmDeclareLe?.slice(0, 10) ?? ''} className={saisie} />
              </div>
            </div>
          </div>
          <button type="submit" className={`${principal} mt-6 w-auto px-6`}>
            Enregistrer
          </button>
        </form>
        <Tuile>
          <TitreTuile i={FileCheck2}>Sur la fiche</TitreTuile>
          <p className="mt-3 text-sm text-fg-2">
            {c?.ansmNumero ? 'La fiche indique « Fabricant déclaré à l’ANSM ». Le numéro n’est pas affiché aux cabinets.' : 'La mention « Fabricant déclaré à l’ANSM » s’affiche une fois la référence renseignée. Elle ouvre le filtre « Déclaré ANSM ».'}
          </p>
          <p className="mt-3 text-xs text-fg-2">Déclaration renseignée par le laboratoire. L’équipe peut la vérifier sur demande.</p>
        </Tuile>
      </div>
    </CoqueEspace>
  )
}
