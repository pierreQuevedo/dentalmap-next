import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { LISTE_CESSIONS } from '@/lib/cessions/routes'

/** Le cadre des pages de l'alerte cessions (confirmation, désinscription) : une carte centrée sous l'en-tête du site. */
export function CarteAlerteCession({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg items-center px-5 py-16">
      <div className="squircle-2xl w-full border border-line bg-bg p-8 shadow-pop">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{titre}</h1>
        <div className="mt-3 space-y-4 text-sm text-fg-2">{children}</div>
        <Link href={chemin(LISTE_CESSIONS)} className="mt-6 inline-flex text-sm font-medium text-fg underline underline-offset-4">
          Voir les cessions de cabinet
        </Link>
      </div>
    </main>
  )
}
