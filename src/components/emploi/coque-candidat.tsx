import type { ReactNode } from 'react'
import Link from 'next/link'
import { Eye, GraduationCap, UserRound } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { chemin } from '@/lib/navigation'
import { EMPLOI } from '@/lib/emploi/chemins'

export type CleCandidat = 'profil' | 'formation' | 'visibilite'

const ONGLETS: { cle: CleCandidat; libelle: string; href: string; I: typeof Eye; etudiant?: true }[] = [
  { cle: 'profil', libelle: 'Mon profil', href: '/espace-candidat/profil/', I: UserRound },
  { cle: 'formation', libelle: 'Ma formation', href: '/espace-candidat/profil/#formation', I: GraduationCap, etudiant: true },
  { cle: 'visibilite', libelle: 'Visibilité', href: '/espace-candidat/visibilite/', I: Eye },
]

/** L'espace candidat, dans le gabarit du site : fil d'Ariane, titre, onglets. */
export function CoqueCandidat({ actif, titre, sousTitre, etudiant = false, children }: { actif: CleCandidat; titre: string; sousTitre?: string; etudiant?: boolean; children: ReactNode }) {
  return (
    <main className="container max-w-6xl pb-20 pt-8">
      <FilAriane segments={[{ libelle: 'Accueil', href: '/' }, { libelle: 'Emploi', href: EMPLOI }, { libelle: titre }]} />
      <header className="mt-8">
        <h1 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">{titre}</h1>
        {sousTitre && <p className="mt-3 max-w-2xl text-fg-2">{sousTitre}</p>}
      </header>
      <nav aria-label="Espace candidat" className="squircle-full mt-6 flex w-full overflow-x-auto bg-bg-soft p-1 sm:inline-flex sm:w-auto">
        {ONGLETS.filter((o) => !o.etudiant || etudiant).map(({ cle, libelle, href, I }) => (
          <Link
            key={cle}
            href={chemin(href)}
            aria-current={actif === cle ? 'page' : undefined}
            className={`squircle-full inline-flex h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap px-2 text-[13px] font-semibold sm:flex-none sm:px-5 sm:text-sm ${actif === cle ? 'bg-fg text-bg shadow-sm' : 'text-fg-2 hover:text-fg'}`}
          >
            <I className="hidden size-4 sm:block" aria-hidden /> {libelle}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </main>
  )
}
