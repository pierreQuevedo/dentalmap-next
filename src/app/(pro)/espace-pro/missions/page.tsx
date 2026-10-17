import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ChevronRight, CircleDashed } from 'lucide-react'
import { CoqueEspace } from '@/components/espace/coque'
import { chemin } from '@/lib/navigation'
import { chargerTableau } from '../_commun'

export const metadata: Metadata = { title: 'Missions', robots: { index: false, follow: false } }
export const instant = false

/** Les missions : ce qui reste à compléter, du plus utile au plus rapide, puis ce qui est fait. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const { espace, coque, q } = await chargerTableau('missions', (await props.searchParams).fiche)
  const restantes = espace.missions.filter((m) => !m.faite).sort((a, b) => b.gain - a.gain || a.minutes - b.minutes)
  const faites = espace.missions.filter((m) => m.faite)
  return (
    <CoqueEspace c={coque} actif="missions" titre="Missions" sousTitre="Ce qui reste à compléter, du plus utile au plus rapide">
      <ul className="max-w-3xl space-y-2">
        {restantes.map((m, i) => (
          <li key={m.cle}>
            <Link href={chemin(`${m.href}${q}`)} className={`squircle-2xl flex items-center gap-4 border bg-bg p-5 hover:border-line-strong ${i === 0 ? 'border-fg shadow-sm' : 'border-line'}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-line text-fg-2">
                <CircleDashed className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-fg">
                  {m.titre}
                  {i === 0 && <span className="ml-2 align-middle text-xs font-medium text-amber-700 dark:text-amber-300">Recommandée</span>}
                </span>
                <span className="block text-sm text-fg-2">
                  {m.detail} · {m.minutes} min
                </span>
              </span>
              <span className={`squircle-full shrink-0 px-2.5 py-0.5 text-xs font-medium ${m.gain ? 'bg-teal/10 text-teal' : 'bg-bg-soft text-fg-2'}`}>{m.gain ? `+${m.gain} %` : 'Hors barème'}</span>
              <ChevronRight className="size-4 shrink-0 text-fg-2" aria-hidden />
            </Link>
          </li>
        ))}
        {restantes.length === 0 && <li className="squircle-2xl border border-line bg-bg p-5 text-sm text-fg-2">Toutes les missions sont faites. Il reste l’entretien, dans « Fraîcheur ».</li>}
        {faites.length > 0 && <li className="px-2 pt-3 text-xs font-semibold uppercase tracking-wider text-fg-2">Faites</li>}
        {faites.map((m) => (
          <li key={m.cle}>
            <Link href={chemin(`${m.href}${m.href.includes('?') ? '&' : '?'}suite=${encodeURIComponent(`/espace-pro/missions/${q}`)}${q ? `&${q.slice(1)}` : ''}`)} className="squircle-2xl flex items-center gap-4 border border-line bg-bg-soft p-4 text-sm hover:border-line-strong">
              <CheckCircle2 className="size-5 text-teal" aria-hidden />
              <span className="flex-1 text-fg">{m.titre}</span>
              <span className="text-fg-2">Modifier</span>
            </Link>
          </li>
        ))}
      </ul>
    </CoqueEspace>
  )
}
