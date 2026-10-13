import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { Check, Hourglass, Mail } from 'lucide-react'
import { Pictogramme, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { COOKIE_PARTENARIAT } from '@/lib/espace-pro/etablissement'
import { ACCROCHE_PARTENARIAT, CoquilleOrganisme, ORGANISME, gardeOrganisme } from '../../_commun'

export const metadata: Metadata = { title: 'Demande reçue', robots: { index: false, follow: false } }

/**
 * O3b : la demande est partie, l'accusé de réception aussi. La frise fixe
 * les attentes : lecture sous sept jours, puis échange et convention si le
 * projet convient.
 */
export default async function Page() {
  const compte = await gardeOrganisme(`${ORGANISME}/partenariat/recu/`)
  const email = (await cookies()).get(COOKIE_PARTENARIAT)?.value ?? compte.email
  const etapes = [
    { t: 'Demande envoyée', d: 'Aujourd’hui', etat: 'fait' },
    { t: 'Lecture par l’équipe', d: 'Sous 7 jours', etat: 'encours' },
    { t: 'Échange et convention', d: 'Si le projet convient', etat: 'avenir' },
  ] as const
  return (
    <CoquilleOrganisme accroche={ACCROCHE_PARTENARIAT}>
      <Pictogramme icone={Mail} ton="succes" />
      <h1 className={titre}>Demande reçue</h1>
      <p className="mt-2 text-sm text-fg-2">
        Un accusé de réception vient de partir à <span className="font-medium text-fg">{email}</span>.
      </p>
      <ol className="mt-6">
        {etapes.map((e, i) => (
          <li key={e.t} className="relative flex gap-3 pb-5 last:pb-0">
            {i < etapes.length - 1 && <span aria-hidden className="absolute left-[9px] top-6 h-[calc(100%-1.25rem)] w-px bg-line" />}
            <span
              aria-hidden
              className={`relative grid size-5 shrink-0 place-items-center rounded-full ${e.etat === 'fait' ? 'bg-teal text-white' : e.etat === 'encours' ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300' : 'border border-line-strong bg-bg'}`}
            >
              {e.etat === 'fait' ? <Check className="size-3" /> : e.etat === 'encours' ? <Hourglass className="size-3" /> : null}
            </span>
            <div>
              <p className="text-sm font-medium text-fg">{e.t}</p>
              <p className="text-xs text-fg-2">{e.d}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link href={chemin('/')} className={`${principal} mt-6`}>
        Retour à l’accueil
      </Link>
    </CoquilleOrganisme>
  )
}
