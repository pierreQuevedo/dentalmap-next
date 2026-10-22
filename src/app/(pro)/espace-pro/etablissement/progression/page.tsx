import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Clock, Lock, ShieldCheck, Sparkles, Trophy } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { BarreProgression, Medaille } from '@/components/espace/progression'
import { ICONE_SOURCE } from '@/components/espace/icones-etablissement'
import { chemin } from '@/lib/navigation'
import { PALIERS_ETAB, historiqueEtab, progressionEtab } from '@/lib/espace-pro/progression-etablissement'
import { quand } from '../../_commun'
import { chargerEtablissement, versEtab } from '../_commun'

export const metadata: Metadata = { title: 'Progression', robots: { index: false, follow: false } }
export const instant = false

/**
 * Progression d'une page d'établissement : le palier et ce qu'il reste avant
 * le suivant, tout ce qui rapporte encore (du plus rentable au plus rapide),
 * le chemin des trois paliers, et l'historique lu dans les dates
 * d'enregistrement. Le taux se recalcule à chaque lecture
 * (`src/lib/espace-pro/progression-etablissement.ts`).
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const t = await chargerEtablissement('progression', (await props.searchParams).fiche)
  const { coque, force, gestion, fiche, source } = t
  const infos = coque.progressionEtab!
  const p = progressionEtab(force.total, infos.verifiee)
  const aFaire = infos.sources.filter((s) => s.acquis < s.max)
  const acquis = infos.sources.filter((s) => s.acquis >= s.max)
  const historique = historiqueEtab({ confirmeLe: fiche.donnees.confirmeLe, demandeLe: gestion.demandeLe, publieeLe: fiche.publieeLe, type: source.type }, force)

  return (
    <CoqueEspace c={coque} actif="progression" titre="Progression" sousTitre="Votre palier, ce qui complète encore la page, et ce que chaque palier apporte">
      <section className="squircle-2xl relative overflow-hidden bg-gradient-to-br from-[#134E4A] to-[#0B1F1D] text-white">
        <div className="relative flex flex-wrap items-center gap-6 p-6 sm:p-8">
          <Medaille niveau={p.actuel?.niveau ?? 0} etat={p.actuel ? 'atteint' : 'encours'} taille={96} />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs tracking-[0.2em] text-[#BFE3D6]">
              PALIER {p.actuel?.niveau ?? 0} SUR {PALIERS_ETAB.length} · PAGE COMPLÈTE À {force.total} %
            </p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight">{p.actuel?.nom ?? 'En route vers la publication'}</h2>
            <div className="mt-4 max-w-md">
              <div className="flex justify-between text-xs text-white/70">
                <span>{p.actuel?.seuil ?? 0} %</span>
                <span>{p.suivant ? `${p.suivant.seuil} % · ${p.suivant.nom}` : 'Sommet'}</span>
              </div>
              <div className="mt-1.5">
                <BarreProgression part={p.part} epaisse claire />
              </div>
              <p className="mt-2 text-sm text-white/85">
                {!p.verifiee
                  ? 'Votre page sera publiée, et le premier palier atteint, dès que la vérification de votre identité aboutit. Préparez-la en attendant : tout ce que vous remplissez compte déjà.'
                  : p.suivant
                    ? `Plus que ${p.reste} %. À la clé : ${p.suivant.gains[0].charAt(0).toLowerCase()}${p.suivant.gains[0].slice(1)}.`
                    : 'Votre page est exemplaire : gardez portes ouvertes et photos à jour pour le rester.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Tuile className="mt-4 p-0">
        <div className="px-5 pt-5">
          <TitreTuile i={Sparkles} droite={<span className="squircle-full bg-bg-soft px-2 py-0.5 text-xs text-fg-2">{aFaire.length} à faire</span>}>
            {aFaire.length ? 'À faire maintenant' : 'Tout est fait'}
          </TitreTuile>
        </div>
        {aFaire.length === 0 ? (
          <p className="px-5 pb-5 pt-3 text-sm text-fg-2">Il reste l’entretien : annoncer les prochaines portes ouvertes et reconfirmer les formations chaque année.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {aFaire.map((s, n) => {
              const I = ICONE_SOURCE[s.cle] ?? Sparkles
              const contenu = (
                <>
                  <span className={`squircle-lg grid size-10 shrink-0 place-items-center ${n === 0 && s.href ? 'bg-teal text-white' : 'bg-bg-soft text-fg'}`}>
                    <I className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-fg">
                      {s.titre}
                      {n === 0 && s.href && <span className="ml-2 align-middle text-xs font-medium text-teal">Recommandé</span>}
                    </p>
                    <p className="truncate text-xs text-fg-2">{s.href ? `${s.duree ?? ''}` : 'Par la vérification de votre demande, sans rien à faire ici'}</p>
                  </div>
                  <span className="squircle-full shrink-0 bg-teal/10 px-2 py-0.5 font-mono text-xs font-semibold text-teal">+{s.max - s.acquis} %</span>
                  {s.href ? <ArrowRight className="size-4 shrink-0 text-fg-2" aria-hidden /> : <Clock className="size-4 shrink-0 text-fg-2" aria-hidden />}
                </>
              )
              return (
                <li key={s.cle}>
                  {s.href ? (
                    <Link href={chemin(versEtab(t, s.href))} className="flex items-center gap-3 px-5 py-3.5 hover:bg-bg-soft">
                      {contenu}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 px-5 py-3.5">{contenu}</div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        {acquis.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-line px-5 py-3.5">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-fg-2">Acquis</span>
            {acquis.map((s) => (
              <span key={s.cle} className="squircle-full inline-flex items-center gap-1 bg-teal/10 px-2.5 py-1 text-xs font-medium text-teal">
                <Check className="size-3.5" aria-hidden /> {s.libelle} · {s.max} %
              </span>
            ))}
          </div>
        )}
      </Tuile>

      <Tuile className="mt-4">
        <TitreTuile i={Trophy}>Le chemin</TitreTuile>
        <ol className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {PALIERS_ETAB.map((x) => {
            const etat = p.verifiee && force.total >= x.seuil ? 'atteint' : p.suivant?.niveau === x.niveau ? 'encours' : 'verrouille'
            return (
              <li key={x.niveau} className={`squircle-2xl relative flex flex-col border p-4 ${etat === 'atteint' ? 'border-[#0B8484]/40 bg-bg' : etat === 'encours' ? 'border-teal bg-bg shadow-pop' : 'border-dashed border-line bg-bg-soft'}`}>
                {etat === 'encours' && <span className="squircle-full absolute -top-2.5 left-4 bg-teal px-2 py-0.5 text-[10px] font-semibold text-white">Prochain · {Math.max(0, x.seuil - force.total)} %</span>}
                <div className="flex items-center gap-3">
                  <Medaille niveau={x.niveau} etat={etat} taille={44} />
                  <div>
                    <p className="font-semibold leading-tight text-fg">{x.nom}</p>
                    <p className="font-mono text-[11px] text-fg-2">{x.niveau === 1 ? 'Identité vérifiée' : `${x.seuil} % de page complète`}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-xs">
                  {x.gains.map((g) => (
                    <li key={g} className="flex gap-2">
                      {etat === 'atteint' ? <Check className="mt-px size-3.5 shrink-0 text-teal" aria-hidden /> : <Lock className="mt-px size-3.5 shrink-0 text-fg-2" aria-hidden />}
                      <span className={etat === 'atteint' ? 'text-fg' : 'text-fg-2'}>{g}</span>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ol>
      </Tuile>

      <Tuile className="mt-4">
        <TitreTuile i={ShieldCheck}>Historique</TitreTuile>
        {historique.length === 0 ? (
          <p className="mt-4 text-sm text-fg-2">Vos enregistrements s’afficheront ici.</p>
        ) : (
          <ol className="mt-4 space-y-3.5">
            {historique.map((h) => {
              const I = h.cle === 'publication' ? Trophy : h.cle === 'demande' ? ShieldCheck : (ICONE_SOURCE[{ voiesAcces: 'acces', galerie: 'photo', portesOuvertes: 'portes_ouvertes', cursus: 'formations' }[h.cle] ?? h.cle] ?? Sparkles)
              return (
                <li key={`${h.cle}${h.le}`} className="flex gap-3">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full ${h.points ? 'bg-teal/10 text-teal' : 'bg-[#134E4A] text-[#BFE3D6]'}`}>
                    <I className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-fg">{h.texte}</p>
                    <p className="text-xs text-fg-2">{quand(h.le)}</p>
                  </div>
                  {h.points > 0 && <span className="font-mono text-xs font-semibold text-teal">+{h.points} %</span>}
                </li>
              )
            })}
          </ol>
        )}
      </Tuile>
    </CoqueEspace>
  )
}
