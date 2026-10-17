import Link from 'next/link'
import { chemin } from '@/lib/navigation'

/** Le cadre des pages d'alerte (confirmation, désinscription) : une carte centrée sous l'en-tête du site. */
export function CarteAlerte({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg items-center px-5 py-16">
      <div className="squircle-2xl w-full border border-line bg-bg p-8 shadow-pop">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{titre}</h1>
        <div className="mt-3 space-y-4 text-sm text-fg-2">{children}</div>
        <Link href={chemin('/formation/formations-privees/')} className="mt-6 inline-flex text-sm font-medium text-fg underline underline-offset-4">
          Voir les formations privées
        </Link>
      </div>
    </main>
  )
}
