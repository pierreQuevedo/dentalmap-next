import Link from 'next/link'
import { Check, Sparkles, type LucideIcon } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { progressionEtab } from '@/lib/espace-pro/progression-etablissement'
import { Anneau } from './apercu'
import { BarreProgression } from './progression'
import type { InfosProgressionEtab } from './progression-etablissement'

/**
 * L'en-tête de chaque page de l'espace établissement, en sombre comme la vue
 * d'ensemble : ce que la rubrique montre aux candidats, où elle en est
 * (l'anneau), ce qu'elle rapporte encore, et dessous, la page entière avec
 * son palier, qui mène à Progression.
 */
export function EnTeteEtab({
  i: I,
  etiquette,
  titre,
  texte,
  pct,
  legende,
  gain,
  progression,
  q,
}: {
  i: LucideIcon
  etiquette: string
  titre: string
  texte: string
  pct: number
  legende: string
  /** Ce que la rubrique rapporte encore à la page complète : `null` quand rien n'est en jeu ici. */
  gain: { pct: number; quand: string } | null
  progression: InfosProgressionEtab
  q: string
}) {
  const p = progressionEtab(progression.total, progression.verifiee)
  return (
    <section className="dark squircle-2xl relative mb-4 overflow-hidden bg-background text-fg ring-1 ring-inset ring-white/10">
      <div className="flex flex-col-reverse items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="max-w-2xl">
          <span className="squircle-full inline-flex items-center gap-1.5 bg-teal/15 px-2.5 py-0.5 text-xs font-medium text-teal ring-1 ring-inset ring-teal/30">
            <I className="size-3.5" aria-hidden /> {etiquette}
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">{titre}</h2>
          <p className="mt-2 text-sm text-white/70">{texte}</p>
          {gain &&
            (gain.pct > 0 ? (
              <p className="squircle-full mt-4 inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                <Sparkles className="size-3.5 text-[#BFE3D6]" aria-hidden /> +{gain.pct} % de page complète {gain.quand}
              </p>
            ) : (
              <p className="squircle-full mt-4 inline-flex items-center gap-1.5 bg-teal/15 px-3 py-1 text-xs font-semibold text-[#BFE3D6]">
                <Check className="size-3.5" strokeWidth={3} aria-hidden /> Acquis pour la page complète
              </p>
            ))}
        </div>
        <Anneau pct={pct} taille={120} sombre legende={legende} />
      </div>
      <Link href={chemin(`/espace-pro/etablissement/progression/${q}`)} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 px-6 py-3 hover:bg-white/5 sm:px-8">
        <span className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${p.actuel ? 'bg-[#BFE3D6] text-[#0B1F1D]' : 'text-[#BFE3D6] ring-2 ring-[#BFE3D6]'}`}>{p.actuel?.niveau ?? 0}</span>
        <span className="text-xs text-white/80">
          <b className="text-white">Page complète à {progression.total} %</b>
          {' · '}
          {!p.verifiee ? 'palier 1 dès la vérification' : p.suivant ? `${p.reste} % avant ${p.suivant.nom}` : 'tous les paliers atteints'}
        </span>
        <span className="min-w-32 flex-1">
          <BarreProgression part={p.part} claire />
        </span>
        <span className="text-xs font-medium text-[#BFE3D6]">Ma progression</span>
      </Link>
    </section>
  )
}
