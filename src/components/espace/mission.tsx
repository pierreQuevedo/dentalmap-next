import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { Encart, principal } from '@/components/compte/ui'

/**
 * Le panneau d'une mission : en-tête (titre, gain, durée), la saisie, puis
 * « Plus tard » et « Enregistrer ». À droite, ce qui aide : l'aperçu, des
 * conseils. Le formulaire porte la fiche, la suite et la force d'avant, pour
 * célébrer le palier s'il est franchi.
 */
export function PanneauMission({
  cle,
  titre,
  meta,
  intro,
  action,
  fiche,
  avant,
  q,
  erreur,
  bouton = 'Enregistrer',
  cote,
  champs,
  children,
}: {
  /** Le segment de l'adresse : `photo`, `presentation`… */
  cle: string
  titre: string
  meta: string
  intro: string
  action: (d: FormData) => Promise<void>
  fiche: string
  avant: number
  q: string
  erreur?: string
  bouton?: string
  cote?: React.ReactNode
  /** Champs cachés en plus. */
  champs?: Record<string, string>
  children: React.ReactNode
}) {
  const ici = `/espace-pro/missions/${cle}/${q}`
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <form action={action} className="squircle-2xl border border-line bg-bg">
        <input type="hidden" name="fiche" value={fiche} />
        <input type="hidden" name="avant" value={avant} />
        <input type="hidden" name="suite" value={`/espace-pro/missions/${q}`} />
        <input type="hidden" name="ici" value={ici} />
        {Object.entries(champs ?? {}).map(([n, v]) => (
          <input key={n} type="hidden" name={n} value={v} />
        ))}
        <div className="border-b border-line p-6">
          <p className="text-xs text-fg-2">{meta}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-fg">{titre}</h2>
          <p className="mt-2 max-w-2xl text-fg-2">{intro}</p>
          {erreur && (
            <Encart ton="erreur" className="mt-4">
              {erreur}
            </Encart>
          )}
        </div>
        <div className="p-6">{children}</div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-6">
          <Link href={chemin(`/espace-pro/missions/${q}`)} className="text-sm text-fg-2 hover:text-fg">
            Plus tard
          </Link>
          <button type="submit" className={`${principal} w-auto px-6`}>
            {bouton}
          </button>
        </div>
      </form>
      {cote && <aside className="space-y-4">{cote}</aside>}
    </div>
  )
}
