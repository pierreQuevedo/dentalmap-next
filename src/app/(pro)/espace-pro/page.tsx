import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BadgeCheck, BarChart3, ChevronRight, Hourglass, ShieldCheck, Sparkles, Trophy, UserPlus } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { ApercuPublic, TuileFraicheur } from '@/components/espace/tuiles'
import { FondCarte } from '@/components/espace/fond-carte'
import { BarreProgression } from '@/components/espace/progression'
import { ICONE_GAIN } from '@/components/espace/icones-gain'
import { getChiffresCles } from '@/lib/annuaire/queries'
import { chemin } from '@/lib/navigation'
import { actionsAFaire, historiqueDe } from '@/lib/espace-pro/a-faire'
import { BONUS_PARRAINAGE, DUREE_BONUS_JOURS, PLAFOND_BONUS } from '@/lib/espace-pro/parrainage'
import { getParrainage } from '@/lib/espace-pro/parrainage-donnees'
import { progressionDe } from '@/lib/espace-pro/progression'
import { getStatistiques } from '@/lib/espace-pro/statistiques'
import { aujourdhui, chargerTableau, quand } from './_commun'

export const metadata: Metadata = { title: 'Espace pro', robots: { index: false, follow: false } }
export const instant = false

/**
 * Vue d'ensemble : la même mesure que Progression, en un coup d'œil. En tête,
 * sur le plan du cabinet, le palier, les points et ce qu'il reste avant le
 * suivant, quatre chiffres et la prochaine action ; à côté, la carte telle que
 * les patients la voient. Dessous : ce qui rapporte encore, les visites par
 * les liens de partage, les mises à jour, le parrainage et l'historique des
 * gains. Les gains et passages de palier s'affichent par la coque.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; publiee?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, compte, q, points } = await chargerTableau('vue', sp.fiche)
  const { fiche, completee, filtres, fraicheur } = espace
  const [chiffres, parrainage, stats, historique] = await Promise.all([getChiffresCles(), getParrainage(compte.id, fiche.id), getStatistiques(fiche.id, 30), historiqueDe(espace, 6)])
  const p = progressionDe(points.total)
  const { aFaire } = actionsAFaire(espace, points, q)
  const prochaine = aFaire[0]
  const enAttente = fiche.demande?.statut === 'en_attente'
  const publics = espace.labo ? 'cabinets' : 'patients'

  const titre = sp.publiee ? `Votre fiche est en ligne, ${coque.nom}` : `Bon retour, ${coque.nom}`
  const texte = enAttente
    ? 'Votre fiche est prête. Elle sera publiée dès que la vérification de votre identité aboutit ; vous pouvez la compléter en attendant.'
    : p.suivant
      ? `Plus que ${p.reste} points avant ${p.suivant.nom}. À la clé : ${p.suivant.gains[0].charAt(0).toLowerCase()}${p.suivant.gains[0].slice(1)}.`
      : 'Tous les paliers sont atteints. Tenez votre fiche à jour et continuez à la partager pour les garder.'
  const evolution = stats.precedent ? Math.round(((stats.total - stats.precedent) / stats.precedent) * 100) : null
  const chiffresCles: { valeur: string; libelle: string; detail?: string }[] = [
    { valeur: `${points.total}`, libelle: 'points de progression' },
    { valeur: `${stats.total}`, libelle: 'visites par vos liens, 30 j', detail: evolution === null ? undefined : `${evolution >= 0 ? '+' : ''}${evolution} %` },
    { valeur: `${parrainage.reussis}`, libelle: parrainage.reussis > 1 ? 'parrainages réussis' : 'parrainage réussi' },
    { valeur: `${filtres.filter((f) => f.actif).length}/${filtres.length}`, libelle: `filtres ${publics} actifs` },
  ]
  const derniers = stats.parJour.slice(-14)
  const max = Math.max(1, ...derniers.map((j) => j.nombre))
  const meilleure = stats.parSource[0]

  return (
    <CoqueEspace c={coque} actif="vue" titre="Vue d’ensemble" sousTitre={`${aujourdhui()}${completee?.publieeLe ? ` · fiche publiée ${quand(completee.publieeLe).toLowerCase()}` : ''}`}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="squircle-2xl relative overflow-hidden text-white">
          <FondCarte lon={fiche.resume.lon} lat={fiche.resume.lat} zoom={14.2} decalage={{ x: 220, y: -40 }} />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-tr from-[#0B1F1D] via-[#0B1F1D]/60 to-transparent" />
          <div className="relative flex h-full flex-col p-6 sm:p-8">
            <span className="squircle-full inline-flex w-fit items-center gap-1.5 bg-white/10 px-2.5 py-1 text-xs font-semibold text-[#BFE3D6] ring-1 ring-inset ring-white/15 backdrop-blur-sm">
              {enAttente ? <Hourglass className="size-3.5" aria-hidden /> : <Trophy className="size-3.5" aria-hidden />}
              {enAttente ? 'Vérification en cours' : p.actuel ? `Palier ${p.actuel.niveau} · ${p.actuel.nom}` : 'En route vers la publication'}
            </span>
            <h2 className="mt-4 max-w-xl text-3xl font-extrabold tracking-tight">{titre}</h2>
            <p className="mt-2 max-w-xl text-white/80">{texte}</p>
            {p.suivant && (
              <div className="mt-5 max-w-md">
                <BarreProgression part={p.part} epaisse claire />
                <div className="mt-1.5 flex justify-between text-xs text-white/65">
                  <span>{points.total} pts</span>
                  <span>
                    {p.suivant.seuil} pts · {p.suivant.nom}
                  </span>
                </div>
              </div>
            )}
            <dl className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
              {chiffresCles.map((c) => (
                <div key={c.libelle} className="border-white/15 md:border-l md:pl-4 md:first:border-0 md:first:pl-0">
                  <dt className="flex items-baseline gap-2 text-2xl font-bold">
                    {c.valeur}
                    {c.detail && <span className="text-xs font-semibold text-[#BFE3D6]">{c.detail}</span>}
                  </dt>
                  <dd className="mt-0.5 text-xs text-white/65">{c.libelle}</dd>
                </div>
              ))}
            </dl>
            {prochaine && (
              <Link href={chemin(prochaine.href)} className="squircle-xl group mt-8 flex flex-wrap items-center gap-4 bg-[#0B1F1D]/55 p-4 ring-1 ring-white/15 backdrop-blur-sm hover:bg-[#0B1F1D]/70">
                <span className="squircle-lg grid size-10 place-items-center bg-[#BFE3D6] text-[#0B1F1D]">
                  {(() => {
                    const I = ICONE_GAIN[prochaine.source]
                    return <I className="size-5" aria-hidden />
                  })()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                    Prochaine action{prochaine.points ? ` · +${prochaine.points} pts` : ''}
                    {prochaine.minutes ? ` · ${prochaine.minutes} min` : ''}
                  </p>
                  <p className="font-semibold">{prochaine.titre}</p>
                </div>
                <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#0B1F1D] group-hover:bg-[#BFE3D6]">
                  Commencer <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>
            )}
          </div>
        </section>
        <ApercuPublic praticien={{ ...fiche.resume, revendiquee: !enAttente }} profession={fiche.profession} photo={completee?.photoUrl} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Tuile>
          <TitreTuile i={Sparkles} droite={<Link href={chemin(`/espace-pro/progression/${q}`)} className="text-sm text-fg underline-offset-4 hover:underline">Progression</Link>}>
            À faire
          </TitreTuile>
          {aFaire.length === 0 ? (
            <p className="mt-4 text-sm text-fg-2">Tout est fait. Il reste l’entretien : reconfirmer quand on vous le demande.</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {aFaire.slice(0, 4).map((a, n) => {
                const I = ICONE_GAIN[a.source]
                return (
                  <li key={a.cle}>
                    <Link href={chemin(a.href)} className={`squircle-xl flex items-center gap-3 p-2.5 hover:bg-bg-soft ${n === 0 ? 'bg-teal/5 ring-1 ring-teal/20' : ''}`}>
                      <span className={`squircle-lg grid size-8 shrink-0 place-items-center ${n === 0 ? 'bg-teal text-white' : 'bg-bg-soft text-fg'}`}>
                        <I className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{a.titre}</span>
                      <span className={`squircle-full px-2 py-0.5 font-mono text-xs font-semibold ${a.points ? 'bg-teal/10 text-teal' : 'bg-bg-soft text-fg-2'}`}>{a.points ? `+${a.points}` : '·'}</span>
                      <ChevronRight className="size-4 text-fg-2" aria-hidden />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Tuile>

        <Tuile>
          <TitreTuile i={BarChart3} droite={<Link href={chemin(`/espace-pro/statistiques/${q}`)} className="text-sm text-fg underline-offset-4 hover:underline">Statistiques</Link>}>
            Visites par vos liens
          </TitreTuile>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-fg">{stats.total}</span>
            <span className="text-sm text-fg-2">sur 30 jours</span>
            {evolution !== null && (
              <span className={`inline-flex items-center text-xs font-semibold ${evolution >= 0 ? 'text-teal' : 'text-amber-700 dark:text-amber-300'}`}>
                <ArrowUpRight className={`size-3.5 ${evolution < 0 ? 'rotate-90' : ''}`} aria-hidden />
                {evolution >= 0 ? '+' : ''}
                {evolution} %
              </span>
            )}
          </p>
          <div className="mt-4 flex h-16 items-end gap-1" role="img" aria-label={`Visites des 14 derniers jours : ${derniers.reduce((t, j) => t + j.nombre, 0)}`}>
            {derniers.map((j) => (
              <span key={j.jour} className={`flex-1 rounded-t-[3px] ${j.nombre ? 'bg-teal' : 'bg-line'}`} style={{ height: j.nombre ? `${Math.max(10, (j.nombre / max) * 100)}%` : '3px' }} />
            ))}
          </div>
          <p className="mt-3 text-xs text-fg-2">{meilleure?.nombre ? `Meilleur canal : ${meilleure.libelle}, ${Math.round((meilleure.nombre / stats.total) * 100)} % des visites.` : `Partagez votre lien : chaque canal apparaîtra ici.`}</p>
        </Tuile>

        <TuileFraicheur fraicheur={fraicheur} href={`/espace-pro/fraicheur/${q}`} note="Reconfirmer prend un clic, sans ressaisie." />
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {espace.ctx.identiteVerifiee && (
          <Link href={chemin(`/espace-pro/partager/${q}#parrainage`)} className="squircle-2xl group relative flex flex-col justify-between gap-5 overflow-hidden bg-gradient-to-br from-[#134E4A] to-[#0B1F1D] p-6 text-white">
            <div className="flex items-start gap-4">
              <span className="squircle-lg grid size-11 shrink-0 place-items-center bg-[#BFE3D6] text-[#0B1F1D]">
                {parrainage.bonus.points ? <BadgeCheck className="size-5" aria-hidden /> : <UserPlus className="size-5" aria-hidden />}
              </span>
              <div>
                <p className="text-lg font-semibold">
                  {parrainage.bonus.points && parrainage.bonus.jusquau
                    ? `Bonus de parrainage actif : +${parrainage.bonus.points} points`
                    : `Parrainez un confrère : +${BONUS_PARRAINAGE} points chacun`}
                </p>
                <p className="mt-1 text-sm text-white/75">
                  {parrainage.bonus.points && parrainage.bonus.jusquau
                    ? `Jusqu’au ${parrainage.bonus.jusquau.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })}. Chaque nouveau parrainage en ajoute, jusqu’à ${PLAFOND_BONUS}.`
                    : `De mise en avant pendant ${DUREE_BONUS_JOURS} jours, dès que son identité est vérifiée, et +25 points de progression pour vous.`}
                </p>
              </div>
            </div>
            <span className="inline-flex h-10 w-fit items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#0B1F1D] group-hover:bg-[#BFE3D6]">
              Inviter un confrère <ArrowRight className="size-4" aria-hidden />
            </span>
          </Link>
        )}

        <Tuile>
          <TitreTuile i={Trophy}>Derniers gains</TitreTuile>
          <ol className="mt-4 space-y-3">
            {historique.map((h) => {
              const I = h.source === 'identite' ? ShieldCheck : h.source === 'publication' ? Trophy : ICONE_GAIN[h.source]
              return (
                <li key={`${h.texte}${h.le}`} className="flex items-center gap-3">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full ${h.points ? 'bg-teal/10 text-teal' : 'bg-[#134E4A] text-[#BFE3D6]'}`}>
                    <I className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-fg">{h.texte}</span>
                  <span className="shrink-0 text-xs text-fg-2">{quand(h.le)}</span>
                  {h.points > 0 && <span className="w-9 shrink-0 text-right font-mono text-xs font-semibold text-teal">+{h.points}</span>}
                </li>
              )
            })}
            {chiffres.synchroniseLe && (
              <li className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-bg-soft text-fg-2">
                  <ShieldCheck className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-fg-2">{espace.labo ? 'Base Sirene synchronisée' : 'Registre de l’Annuaire Santé vérifié'}</span>
                <span className="shrink-0 text-xs text-fg-2">{quand(chiffres.synchroniseLe)}</span>
                <span className="w-9 shrink-0" />
              </li>
            )}
          </ol>
        </Tuile>
      </div>
    </CoqueEspace>
  )
}
