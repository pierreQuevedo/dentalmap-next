import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Lock, Map as Plan } from 'lucide-react'
import { EnTeteEtab } from '@/components/espace/en-tete-etablissement'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { chemin } from '@/lib/navigation'
import { enregistrerBloc } from '@/lib/espace-pro/actions-etablissement'
import { Retour, chargerEtablissement, gainMissions, versEtab } from '../_commun'
import { CursusClient } from '@/components/espace/saisie-cursus'

export const metadata: Metadata = { title: 'Cursus et internat', robots: { index: false, follow: false } }
export const instant = false

/**
 * FAC-CUR : les cycles et les diplômes après le diplôme d'État, déclarés par
 * la faculté ; les postes d'internat, lus dans l'arrêté annuel. Un diplôme
 * par ligne dans la seconde liste.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; enregistre?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerEtablissement('cursus', sp.fiche)
  if (t.source.type !== 'faculte') redirect(chemin(versEtab(t, 'formations')))
  const { source, fiche, coque } = t
  const d = fiche.donnees
  const internats = source.faculte?.internats ?? []
  const decrits = d.cycles.filter((c) => c.detail.trim()).length
  const gain = gainMissions(t, 'formations')

  return (
    <CoqueEspace c={coque} actif="cursus" titre="Cursus et internat" sousTitre="Le cursus est déclaré par la faculté ; les postes d’internat sont lus dans l’arrêté annuel">
      <div className="mb-4">
        <Retour erreur={sp.erreur} enregistre={sp.enregistre} bloc="cursus" />
      </div>
      <EnTeteEtab
        i={Plan}
        etiquette="Cursus et internat"
        titre={d.cycles.length ? `${d.cycles.length} cycle${d.cycles.length > 1 ? 's' : ''}, ${d.autresDiplomes.length} diplôme${d.autresDiplomes.length > 1 ? 's' : ''} après le diplôme d’État` : 'Décrivez le cursus'}
        texte="Du DFGSO à la thèse : le cursus montre aux futurs étudiants ce qu’on fait chaque année, et l’internat, les postes ouverts. Un cycle décrit en une phrase suffit."
        pct={d.cycles.length ? Math.round((decrits / d.cycles.length) * 100) : 0}
        legende="cycles décrits"
        gain={gain === null ? null : { pct: gain, quand: 'en confirmant le cursus' }}
        progression={coque.progressionEtab!}
        q={t.q}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <form action={enregistrerBloc} className="space-y-4">
          <input type="hidden" name="fiche" value={source.slug} />
          <input type="hidden" name="bloc" value="cursus" />
          <input type="hidden" name="retour" value={versEtab(t, 'cursus')} />
          <CursusClient cycles={d.cycles} autres={d.autresDiplomes} acces={versEtab(t, 'acces')} />
          <div className="flex justify-end">
            <button type="submit" className="inline-flex h-10 cursor-pointer items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
              Enregistrer
            </button>
          </div>
        </form>
        <Tuile>
          <TitreTuile i={Lock} droite={<span className="squircle-full bg-bg-soft px-2 py-0.5 text-xs text-fg-2">Automatique</span>}>
            Internat
          </TitreTuile>
          {internats.length ? (
            <ul className="mt-4 divide-y divide-line">
              {internats.map((i) => (
                <li key={i.texte} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium text-fg">{i.specialite}</p>
                    {i.annee && <p className="text-xs text-fg-2">Postes {i.annee}</p>}
                  </div>
                  <p className="text-3xl font-semibold tabular-nums text-fg">{i.postes ?? '—'}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-fg-2">Les postes apparaîtront à la publication de l’arrêté.</p>
          )}
          <p className="mt-4 text-xs text-fg-2">Source : arrêté annuel du Centre national de gestion. Une erreur se signale, nous la vérifions dans l’arrêté.</p>
        </Tuile>
      </div>
    </CoqueEspace>
  )
}
