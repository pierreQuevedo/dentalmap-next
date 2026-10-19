import type { Metadata } from 'next'
import { RefreshCw } from 'lucide-react'
import { CoqueEspace } from '@/components/espace/coque'
import { etatFraicheur } from '@/components/espace/tuiles'
import { reconfirmer, retablirRappels } from '@/lib/espace-pro/actions-fiche'
import { chargerTableau } from '../_commun'

export const metadata: Metadata = { title: 'Mises à jour', robots: { index: false, follow: false } }
export const instant = false

const date = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })

/** Chaque bloc a sa date et son rappel ; « C'est toujours juste » remet le compteur à zéro, sans ressaisie. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const { espace, coque, q } = await chargerTableau('fraicheur', (await props.searchParams).fiche)
  return (
    <CoqueEspace c={coque} actif="fraicheur" titre="Mises à jour" sousTitre="Une information ancienne trompe le patient : chaque bloc a sa date et son rappel">
      {espace.fraicheur.length === 0 ? (
        <p className="text-sm text-fg-2">Aucun bloc renseigné pour l’instant : la fraîcheur se suit dès qu’une information est sur la fiche.</p>
      ) : (
        <ul className="space-y-3">
          {espace.fraicheur.map((f) => {
            const alerte = f.etat !== 'a_jour'
            return (
              <li key={f.cle} className={`squircle-2xl grid gap-4 border bg-bg p-5 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto] md:items-center ${alerte ? 'border-amber-300 dark:border-amber-400/40' : 'border-line'}`}>
                <div>
                  <p className="font-semibold text-fg">{f.libelle}</p>
                  <p className="text-sm text-fg-2">{f.confirmeLe ? `Confirmé le ${date(f.confirmeLe)}` : 'Jamais confirmé'}</p>
                </div>
                <div>
                  <p className={`text-sm ${alerte ? 'text-amber-700 dark:text-amber-300' : 'text-fg'}`}>{etatFraicheur(f)}</p>
                  <span className="mt-2 block h-1.5 rounded-full bg-line">
                    <span className={`block h-full rounded-full ${alerte ? 'bg-amber-400' : 'bg-teal'}`} style={{ width: `${Math.max(f.part * 100, 3)}%` }} />
                  </span>
                  <p className="mt-2 text-xs text-fg-2">{f.regle}</p>
                </div>
                <form action={reconfirmer}>
                  <input type="hidden" name="fiche" value={espace.fiche.slug} />
                  <input type="hidden" name="bloc" value={f.cle} />
                  <input type="hidden" name="avant" value={espace.force.total} />
                  <input type="hidden" name="suite" value={`/espace-pro/fraicheur/${q}`} />
                  <input type="hidden" name="ici" value={`/espace-pro/fraicheur/${q}`} />
                  <button type="submit" className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium ${alerte ? 'bg-action text-action-foreground hover:bg-action-hover' : 'border border-line text-fg hover:border-line-strong'}`}>
                    <RefreshCw className="size-4" aria-hidden /> C’est toujours juste
                  </button>
                </form>
              </li>
            )
          })}
        </ul>
      )}
      <p className="mt-4 text-xs text-fg-2">Reconfirmer ne demande aucune ressaisie. Pour changer une information, passez par « Ma fiche ».</p>
      {espace.completee?.rappelsCoupesLe ? (
        <form action={retablirRappels} className="mt-2 flex flex-wrap items-center gap-x-3 text-xs text-fg-2">
          <input type="hidden" name="fiche" value={espace.fiche.slug} />
          <input type="hidden" name="suite" value={`/espace-pro/fraicheur/${q}`} />
          <input type="hidden" name="ici" value={`/espace-pro/fraicheur/${q}`} />
          Rappels par email coupés le {date(espace.completee.rappelsCoupesLe)}.
          <button type="submit" className="cursor-pointer font-medium text-fg underline underline-offset-4">Les rétablir</button>
        </form>
      ) : (
        <p className="mt-2 text-xs text-fg-2">Un email vous prévient quand un bloc approche de son échéance, un par mois au plus.</p>
      )}
    </CoqueEspace>
  )
}
