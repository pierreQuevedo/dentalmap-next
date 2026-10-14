import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { chemin } from '@/lib/navigation'

/**
 * À droite du formulaire : ce qui se passe une fois le message envoyé, en
 * étapes numérotées comme « Se former » des fiches métier, sur fond uni, puis
 * un renvoi vers la FAQ, qui répond souvent avant qu'on ait à écrire.
 */
const ETAPES = [
  { titre: 'Accusé à l’écran', texte: 'Dès l’envoi, sans compte à créer.' },
  { titre: 'Une personne vous lit', texte: 'Chaque message est lu par une personne de l’équipe.' },
  { titre: 'Une réponse par email', texte: 'Pour vos données personnelles, sous un mois au plus.' },
] as const

export function CarteContact() {
  return (
    <div className="flex flex-col gap-4">
      <div className="squircle-3xl flex-1 border border-line bg-bg p-6 md:p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">
          Et ensuite&nbsp;?
          <span className="block text-fg-2">Trois étapes, pas plus.</span>
        </h2>
        <ol className="mt-8">
          {ETAPES.map((e, k) => (
            <li key={e.titre} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 border-t border-line py-5 last:pb-0">
              <span className="text-4xl font-light tabular-nums tracking-tight text-fg" aria-hidden>
                {String(k + 1).padStart(2, '0')}
              </span>
              <span>
                <span className="block font-semibold text-fg">{e.titre}</span>
                <span className="mt-0.5 block text-sm text-fg-2">{e.texte}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <Link href={chemin('/faq')} className="squircle-3xl group flex items-center justify-between gap-4 border border-line bg-bg p-6 transition-colors hover:bg-bg-soft">
        <span>
          <span className="block font-semibold text-fg">Une question courante&nbsp;?</span>
          <span className="block text-sm text-fg-2">La réponse est peut-être déjà dans la FAQ.</span>
        </span>
        <ArrowUpRight className="size-5 shrink-0 text-fg transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </div>
  )
}
