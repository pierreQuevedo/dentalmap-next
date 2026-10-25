import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, FileText, Lock, PanelsTopLeft, Pencil, Plus } from 'lucide-react'
import { CoqueEspace, Statut, TitreTuile, Tuile } from '@/components/espace/coque'
import { EnTeteEtab } from '@/components/espace/en-tete-etablissement'
import { chemin } from '@/lib/navigation'
import { enregistrerBloc } from '@/lib/espace-pro/actions-etablissement'
import { libelleSection, portesOuvertesAJour } from '@/lib/espace-pro/etablissement'
import { Retour, chargerEtablissement, gainMissions, versEtab } from '../_commun'

export const metadata: Metadata = { title: 'Ma page', robots: { index: false, follow: false } }
export const instant = false

const champ = 'squircle-lg w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-line-strong'

/**
 * ETAB-PAGE : les sections de la page publique, dans l'ordre où les
 * candidats les lisent, avec leur état. Les portes ouvertes et la
 * présentation se remplissent ici ; les autres sections ont leur écran.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; enregistre?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerEtablissement('ma-page', sp.fiche)
  const { source, fiche, sections, coque, force } = t
  const d = fiche.donnees
  const declarees = sections.filter((s) => s.statut !== 'auto' && !s.bientot && !s.automatique)
  const compte = (s: string) => sections.filter((x) => x.statut === s && !x.bientot && !(s === 'vide' && x.automatique)).length
  // La même complétude que la vue d'ensemble : celle de la page entière, pas seulement des sections.
  const pct = force.total
  const passee = !!d.portesOuvertes && !portesOuvertesAJour(d)
  const publiees = compte('publiee')
  const gain = gainMissions(t, ...t.missions.map((m) => m.cle))

  return (
    <CoqueEspace c={coque} actif="ma-page" titre="Ma page" sousTitre="Les sections de la page publique, dans l’ordre où les futurs étudiants les lisent">
      <EnTeteEtab
        i={PanelsTopLeft}
        etiquette="Ma page"
        titre={publiees === declarees.length ? 'Toutes vos sections sont publiées' : `${publiees} section${publiees > 1 ? 's' : ''} publiée${publiees > 1 ? 's' : ''} sur ${declarees.length}`}
        texte="Une section vide reste masquée : la page ne montre que ce qui est rempli. Chaque section complétée fait monter la page complète."
        pct={pct}
        legende="page complète"
        gain={gain === null ? null : { pct: gain, quand: 'en complétant les sections' }}
        progression={coque.progressionEtab!}
        q={t.q}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          {sp.erreur && <Retour erreur={sp.erreur} bloc="" />}
          <ol className="space-y-2">
            {sections.map((s, k) => (
              <li key={s.cle} className={`squircle-2xl flex flex-wrap items-center gap-4 border bg-bg p-4 ${s.statut === 'vide' ? 'border-dashed border-line' : 'border-line'}`}>
                <span className="w-8 text-center text-2xl font-light tabular-nums text-fg-2">{String(k + 1).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1 basis-[calc(100%-3rem)] sm:basis-0">
                  <p className="font-semibold text-fg">{s.titre}</p>
                  <p className="text-sm text-fg-2">
                    {s.detail}
                    {s.manque && s.manque !== libelleSection(s) && <span className="text-amber-700 dark:text-amber-300"> · {s.manque}</span>}
                  </p>
                </div>
                <div className="ml-12 flex flex-wrap items-center gap-3 sm:ml-0">
                  <span className="hidden text-xs text-fg-2 md:block">{s.source}</span>
                  {s.bientot ? <span className="squircle-full bg-bg-soft px-2 py-0.5 text-xs text-fg-2 ring-1 ring-inset ring-line">Bientôt</span> : <Statut s={s.statut} libelle={libelleSection(s)} />}
                  {s.statut === 'auto' ? (
                    <span className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-fg-2">
                      <Lock className="size-3.5" aria-hidden /> Lecture seule
                    </span>
                  ) : s.href ? (
                    <Link
                      href={chemin(versEtab(t, s.href))}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium ${s.statut === 'vide' ? 'bg-action text-action-foreground hover:bg-action-hover' : 'border border-line text-fg hover:border-line-strong'}`}
                    >
                      {s.statut === 'vide' ? <Plus className="size-4" aria-hidden /> : <Pencil className="size-3.5" aria-hidden />} {s.statut === 'vide' ? 'Remplir' : 'Modifier'}
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>

          <Tuile>
            <span id="portes-ouvertes" className="block scroll-mt-6" />
            <TitreTuile i={CalendarDays}>Portes ouvertes</TitreTuile>
            <p className="mt-1 text-sm text-fg-2">
              La date s’affiche en tête de la page, puis expire d’elle-même une fois passée.{passee ? ' La date enregistrée est passée : annoncez la suivante.' : ''}
            </p>
            <form action={enregistrerBloc} className="mt-4 flex flex-wrap items-end gap-3">
              <input type="hidden" name="fiche" value={source.slug} />
              <input type="hidden" name="bloc" value="portesOuvertes" />
              <input type="hidden" name="retour" value={`${versEtab(t, 'ma-page')}`} />
              <div>
                <label htmlFor="po-date" className="mb-1 block text-xs font-medium text-fg">
                  Prochaine date
                </label>
                <input id="po-date" name="date" type="date" defaultValue={d.portesOuvertes ?? ''} className={`${champ} h-10`} />
              </div>
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 text-sm text-fg">
                <input type="checkbox" name="aucune" defaultChecked={d.aucunePorteOuverte} className="size-4 accent-[var(--teal)]" />
                Aucune cette année
              </label>
              <button type="submit" className="ml-auto inline-flex h-10 cursor-pointer items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                Enregistrer
              </button>
            </form>
            <div className="mt-3">
              <Retour enregistre={sp.enregistre} bloc="portesOuvertes" />
            </div>
          </Tuile>

          <Tuile>
            <span id="presentation" className="block scroll-mt-6" />
            <TitreTuile i={FileText}>Présentation</TitreTuile>
            <form action={enregistrerBloc} className="mt-4 space-y-3">
              <input type="hidden" name="fiche" value={source.slug} />
              <input type="hidden" name="bloc" value="presentation" />
              <input type="hidden" name="retour" value={`${versEtab(t, 'ma-page')}`} />
              <div>
                <label htmlFor="pres-accroche" className="mb-1 block text-xs font-medium text-fg">
                  Phrase d’accroche
                </label>
                <input id="pres-accroche" name="accroche" maxLength={160} defaultValue={d.accroche ?? ''} placeholder="Former les prothésistes de demain, de la cire au numérique." className={`${champ} h-10`} />
              </div>
              <div>
                <label htmlFor="pres-texte" className="mb-1 block text-xs font-medium text-fg">
                  Présentation, de 200 à 800 caractères
                </label>
                <textarea id="pres-texte" name="presentation" rows={5} maxLength={800} defaultValue={d.presentation ?? ''} className={`${champ} py-2.5`} />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="inline-flex h-10 cursor-pointer items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                  Enregistrer
                </button>
              </div>
            </form>
            <div className="mt-3">
              <Retour enregistre={sp.enregistre} bloc="presentation" />
            </div>
          </Tuile>
        </div>

        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={PanelsTopLeft}>Sections</TitreTuile>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between"><span className="text-fg-2">Publiées</span><span className="font-medium text-fg">{compte('publiee')}</span></li>
              <li className="flex justify-between"><span className="text-fg-2">À compléter</span><span className="font-medium text-amber-700 dark:text-amber-300">{compte('incomplete')}</span></li>
              <li className="flex justify-between"><span className="text-fg-2">Vides, masquées</span><span className="font-medium text-fg">{compte('vide')}</span></li>
              <li className="flex justify-between"><span className="text-fg-2">Automatiques</span><span className="font-medium text-fg">{compte('auto')}</span></li>
            </ul>
          </Tuile>
          <Tuile>
            <TitreTuile i={Lock}>Sections automatiques</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">
              {source.type === 'faculte' ? 'Internat et registres' : 'Résultats et registres'} viennent des sources publiques. Ils ne se modifient pas ici : une erreur se signale, et nous la
              vérifions auprès de la source.
            </p>
            <Link href={chemin('/contact/')} className="mt-4 inline-flex text-sm font-medium text-fg underline underline-offset-4">
              Signaler une erreur
            </Link>
          </Tuile>
        </aside>
      </div>
    </CoqueEspace>
  )
}
