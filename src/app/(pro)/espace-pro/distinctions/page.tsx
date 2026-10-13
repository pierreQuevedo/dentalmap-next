import type { Metadata } from 'next'
import { Award, Lock } from 'lucide-react'
import { CoqueEspace } from '@/components/espace/coque'
import { chargerTableau } from '../_commun'

export const metadata: Metadata = { title: 'Distinctions', robots: { index: false, follow: false } }
export const instant = false

/** Les distinctions, privées : jamais affichées aux patients, sans effet sur la place dans les résultats. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const { espace, coque } = await chargerTableau('distinctions', (await props.searchParams).fiche)
  const obtenues = espace.distinctions.filter((d) => d.obtenue).length
  return (
    <CoqueEspace c={coque} actif="distinctions" titre="Distinctions" sousTitre={`Privées : elles ne s’affichent jamais aux ${espace.labo ? 'cabinets' : 'patients'} et ne changent pas votre place`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {espace.distinctions.map((d) => (
          <div key={d.code} className={`squircle-2xl flex flex-col items-center border p-6 text-center ${d.obtenue ? 'border-line bg-bg' : 'border-dashed border-line bg-bg-soft'}`}>
            <span className={`grid size-16 place-items-center rounded-full ${d.obtenue ? 'border-2 border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' : 'border border-dashed border-line text-fg-2'}`}>
              {d.obtenue ? <Award className="size-7" aria-hidden /> : <Lock className="size-6" aria-hidden />}
            </span>
            <p className="mt-4 font-semibold text-fg">{d.titre}</p>
            <p className="mt-1 text-sm text-fg-2">{d.condition}</p>
            <p className={`mt-3 text-xs ${d.obtenue ? 'text-teal' : 'text-fg-2'}`}>{d.obtenue ? 'Obtenue' : 'À obtenir'}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-fg-2">
        {obtenues} distinction{obtenues > 1 ? 's' : ''} sur {espace.distinctions.length}. Elles récompensent une fiche juste et à jour, rien d’autre.
      </p>
    </CoqueEspace>
  )
}
