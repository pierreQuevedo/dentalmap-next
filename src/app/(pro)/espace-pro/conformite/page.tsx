import type { Metadata } from 'next'
import { lireSaisie } from '@/lib/espace-pro/saisie'
import { ExternalLink, FileCheck2, Hash } from 'lucide-react'
import { MarqueSombre, PastilleSombre, dateLongue } from '@/components/annuaire/fiche-blocs'
import { Encart, pastille, principal, saisie } from '@/components/compte/ui'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { enregistrerAnsm } from '@/lib/espace-pro/actions-fiche'
import { Caches, chargerLabo } from '../_labo'

export const metadata: Metadata = { title: 'Conformité', robots: { index: false, follow: false } }
export const instant = false

/**
 * Mission ANSM : tout fabricant de dispositifs médicaux sur mesure se déclare
 * auprès de l'ANSM. À droite, la pastille et la ligne de la fiche telles que
 * les cabinets les verront.
 */
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
                <input id="ansm-numero" name="numero" aria-describedby="ansm-aide" defaultValue={gardee.texte('numero') ?? c?.ansmNumero ?? ''} placeholder="Référence de la déclaration" className={`${saisie} font-mono uppercase`} />
              </div>
              <p id="ansm-aide" className="mt-1.5 text-xs text-fg-2">
                Il figure sur l’accusé de réception que l’ANSM vous a envoyé après votre déclaration.{' '}
                <a href="https://ansm.sante.fr/" target="_blank" rel="noopener" className="inline-flex items-center gap-0.5 font-medium text-fg underline underline-offset-4">
                  Pas encore déclaré ? La démarche sur le site de l’ANSM
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              </p>
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
          {/* L'en-tête de la fiche et sa ligne Conformité, en clair une fois la référence enregistrée, en attente sinon. */}
          <div className={`mt-4 ${c?.ansmNumero ? '' : 'opacity-50'}`}>
            <div className="dark squircle-xl flex flex-wrap gap-2 bg-[#0e1317] p-3">
              <PastilleSombre>Laboratoire de prothèse</PastilleSombre>
              <MarqueSombre icone={FileCheck2}>Déclaré ANSM</MarqueSombre>
            </div>
            <div className="mt-3 flex gap-2.5 text-sm">
              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
              <p>
                <span className="block text-xs text-fg-2">Conformité</span>
                <span className="text-fg">
                  Déclaré auprès de l’ANSM comme fabricant de dispositifs médicaux sur mesure, n° {c?.ansmNumero ?? '…'}
                  {c?.ansmDeclareLe ? `, déclaration du ${dateLongue(c.ansmDeclareLe)}` : ''}
                </span>
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-fg-2">{c?.ansmNumero ? 'Votre fiche ouvre le filtre « Déclaré ANSM » des cabinets.' : 'S’affiche une fois la référence enregistrée, et ouvre le filtre « Déclaré ANSM » des cabinets.'}</p>
          <p className="mt-3 text-xs text-fg-2">Déclaration renseignée par le laboratoire. L’équipe peut la vérifier sur demande.</p>
        </Tuile>
      </div>
    </CoqueEspace>
  )
}
