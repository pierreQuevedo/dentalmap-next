import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Award, Check, Eye, Lock, Share2, ShieldCheck, Sparkles, Trophy } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { FondCarte } from '@/components/espace/fond-carte'
import { CarteFixe } from '@/components/espace/carte-fixe'
import { ICONE_GAIN } from '@/components/espace/icones-gain'
import { BarreProgression, CheminPaliers, Medaille } from '@/components/espace/progression'
import { chemin } from '@/lib/navigation'
import { PALIERS, progressionDe } from '@/lib/espace-pro/progression'
import { actionsAFaire, historiqueDe } from '@/lib/espace-pro/a-faire'
import { chargerTableau, quand } from '../_commun'

export const metadata: Metadata = { title: 'Progression', robots: { index: false, follow: false } }
export const instant = false

/**
 * Progression : où en est la fiche et comment avancer. Le palier et ce qu'il
 * reste avant le suivant ; tout ce qui rapporte encore des points, missions de
 * la fiche et actions de diffusion mêlées, du plus rentable au plus rapide ;
 * la carte de résultat aujourd'hui et au palier suivant ; le chemin des
 * paliers ; les distinctions et l'historique. Remplace « Missions » et
 * « Distinctions ». Les points se recalculent à chaque lecture
 * (`src/lib/espace-pro/progression.ts`).
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const { espace, coque, points, q } = await chargerTableau('progression', (await props.searchParams).fiche)
  const { fiche, completee } = espace
  const p = progressionDe(points.total)
  const historique = (await historiqueDe(espace)).map((h) => ({ ...h, i: h.source === 'identite' ? ShieldCheck : h.source === 'publication' ? Trophy : ICONE_GAIN[h.source] }))

  const distinctions = [
    ...espace.distinctions,
    { code: 'parrain', titre: 'Parrain', condition: 'Un confrère vérifié grâce à vous', obtenue: points.detail.parrainage > 0 },
    { code: 'ambassadeur', titre: 'Ambassadeur', condition: `Palier 4, ${PALIERS[3].seuil} points`, obtenue: points.total >= PALIERS[3].seuil },
    { code: 'reference_locale', titre: 'Référence locale', condition: `Palier 5, ${PALIERS[4].seuil} points`, obtenue: points.total >= PALIERS[4].seuil },
  ]
  const obtenues = distinctions.filter((d) => d.obtenue).length

  const { aFaire: actions, acquis } = actionsAFaire(espace, points, q)
  const aFaire = actions.map((a) => ({ ...a, i: ICONE_GAIN[a.source] }))

  return (
    <CoqueEspace c={coque} actif="progression" titre="Progression" sousTitre="Votre palier, ce qui rapporte des points, et ce que chaque palier débloque">
      <section className="squircle-2xl relative overflow-hidden text-white">
        <FondCarte lon={fiche.resume.lon} lat={fiche.resume.lat} zoom={14.4} decalage={{ x: 160, y: 0 }} />
        {/* Une ombre de bas en haut, de gauche à droite : le texte se lit, le plan reste visible en haut à droite. */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-tr from-[#0B1F1D] via-[#0B1F1D]/55 to-transparent" />
        <div className="relative flex flex-wrap items-center gap-6 p-6 sm:p-8">
          <Medaille niveau={p.actuel?.niveau ?? 0} etat={p.actuel ? 'atteint' : 'encours'} taille={96} />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs tracking-[0.2em] text-[#BFE3D6]">
              PALIER {p.actuel?.niveau ?? 0} SUR {PALIERS.length} · {points.total} PTS
            </p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight">{p.actuel?.nom ?? 'En route vers la publication'}</h2>
            <div className="mt-4 max-w-md">
              <div className="flex justify-between text-xs text-white/70">
                <span>{p.actuel?.seuil ?? 0} pts</span>
                <span>{p.suivant ? `${p.suivant.seuil} pts · ${p.suivant.nom}` : 'Sommet'}</span>
              </div>
              <div className="mt-1.5">
                <BarreProgression part={p.part} epaisse claire />
              </div>
              <p className="mt-2 text-sm text-white/85">
                {p.suivant ? `Plus que ${p.reste} points. À la clé : ${p.suivant.gains[0].charAt(0).toLowerCase()}${p.suivant.gains[0].slice(1)}.` : 'Vous avez tout débloqué : tenez vos paliers à jour pour garder leurs gains.'}
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
          <p className="px-5 pb-5 pt-3 text-sm text-fg-2">Il reste l’entretien : reconfirmer vos informations quand on vous le demande, dans « Mises à jour ».</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {aFaire.map((a, n) => (
              <li key={a.cle}>
                <Link href={chemin(a.href)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-bg-soft">
                  <span className={`squircle-lg grid size-10 shrink-0 place-items-center ${n === 0 ? 'bg-teal text-white' : 'bg-bg-soft text-fg'}`}>
                    <a.i className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-fg">
                      {a.titre}
                      {n === 0 && <span className="ml-2 align-middle text-xs font-medium text-teal">Recommandé</span>}
                    </p>
                    <p className="truncate text-xs text-fg-2">
                      {a.detail}
                      {a.minutes ? ` · ${a.minutes} min` : ''}
                    </p>
                  </div>
                  <span className={`squircle-full shrink-0 px-2 py-0.5 font-mono text-xs font-semibold ${a.points ? 'bg-teal/10 text-teal' : 'bg-bg-soft text-fg-2'}`}>{a.points ? `+${a.points} pts` : 'Hors barème'}</span>
                  <ArrowRight className="size-4 shrink-0 text-fg-2" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {acquis.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-line px-5 py-3.5">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-fg-2">Acquis</span>
            {acquis.map((a) => (
              <Link key={a.cle} href={chemin(a.href)} className="squircle-full inline-flex items-center gap-1 bg-teal/10 px-2.5 py-1 text-xs font-medium text-teal hover:bg-teal/15">
                <Check className="size-3.5" aria-hidden /> {a.titre}
              </Link>
            ))}
          </div>
        )}
      </Tuile>

      <Tuile className="mt-4">
        <TitreTuile i={Eye}>Votre carte dans les résultats</TitreTuile>
        <div className="mt-5 grid grid-cols-1 items-start gap-6 md:grid-cols-[auto_auto_minmax(0,1fr)]">
          <figure className="space-y-2">
            <ul className="w-[17rem] [&_li]:min-h-[21rem]">
              <CarteFixe praticien={fiche.resume} profession={fiche.profession} photo={completee?.photoUrl} />
            </ul>
            <figcaption className="text-center text-xs font-medium text-fg">Aujourd’hui · {p.actuel?.nom ?? 'avant publication'}</figcaption>
          </figure>
          {p.suivant && (
            <figure className="relative space-y-2">
              <ul className="w-[17rem] opacity-70 [&_li]:min-h-[21rem]">
                <CarteFixe praticien={fiche.resume} profession={fiche.profession} photo={completee?.photoUrl} palier={p.suivant.niveau} />
              </ul>
              <span className="squircle-full absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 bg-[#0B1F1D]/85 px-3 py-1.5 text-xs font-semibold text-[#BFE3D6] shadow-pop backdrop-blur">
                <Lock className="size-3.5" aria-hidden /> Plus que {p.reste} pts
              </span>
              <figcaption className="text-center text-xs text-fg-2">Au palier {p.suivant.niveau} · {p.suivant.nom}</figcaption>
            </figure>
          )}
          <div className="min-w-0 space-y-3 text-sm text-fg-2">
            <p>C’est la carte que les patients voient dans les résultats de recherche. À chaque palier, elle s’habille davantage : une pastille au deuxième, un liseré au troisième, un halo ensuite.</p>
            <p>Plus vous avez de points, plus votre fiche remonte dans les résultats de votre secteur.</p>
            {(p.actuel?.niveau ?? 0) >= 2 && (
              <Link href={chemin(`/espace-pro/partager/${q}${q ? '&' : '?'}message=palier#reseaux`)} className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                <Share2 className="size-4" aria-hidden /> Partager mon avancement
              </Link>
            )}
          </div>
        </div>
      </Tuile>

      <Tuile className="mt-4">
        <TitreTuile i={Trophy}>Le chemin</TitreTuile>
        <div className="mt-5">
          <CheminPaliers points={points.total} />
        </div>
        <p className="mt-4 text-xs text-fg-2">Vos points ordonnent les résultats de recherche ; Ambassadeur et Référence locale y ajoutent un bonus tant qu’ils sont tenus. Les points se recalculent en continu.</p>
      </Tuile>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Tuile>
            <TitreTuile i={Award} droite={<span className="squircle-full bg-bg-soft px-2 py-0.5 text-xs text-fg-2">{obtenues} sur {distinctions.length}</span>}>
              Distinctions
            </TitreTuile>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {distinctions.map((d) => (
                <div key={d.code} className={`squircle-xl flex flex-col items-center p-4 text-center ${d.obtenue ? 'bg-bg ring-1 ring-line' : 'border border-dashed border-line bg-bg-soft'}`}>
                  <span className={`grid size-12 place-items-center rounded-full ${d.obtenue ? 'bg-gradient-to-br from-[#1F6B64] to-[#134E4A] text-[#BFE3D6]' : 'border border-dashed border-line text-fg-2'}`}>
                    {d.obtenue ? <Award className="size-5" aria-hidden /> : <Lock className="size-4" aria-hidden />}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-fg">{d.titre}</p>
                  <p className="mt-0.5 text-xs text-fg-2">{d.condition}</p>
                </div>
              ))}
            </div>
          </Tuile>
        </div>

        <Tuile>
          <TitreTuile i={Trophy}>Historique</TitreTuile>
          {historique.length === 0 ? (
            <p className="mt-4 text-sm text-fg-2">Vos gains s’afficheront ici.</p>
          ) : (
            <ol className="mt-4 space-y-3.5">
              {historique.map((h) => (
                <li key={`${h.texte}${h.le}`} className="flex gap-3">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full ${h.points ? 'bg-teal/10 text-teal' : 'bg-[#134E4A] text-[#BFE3D6]'}`}>
                    <h.i className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-fg">{h.texte}</p>
                    <p className="text-xs text-fg-2">{quand(h.le)}</p>
                  </div>
                  {h.points > 0 && <span className="font-mono text-xs font-semibold text-teal">+{h.points}</span>}
                </li>
              ))}
            </ol>
          )}
        </Tuile>
      </div>
    </CoqueEspace>
  )
}
