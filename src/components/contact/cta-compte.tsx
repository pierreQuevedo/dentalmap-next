import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { chemin } from '@/lib/navigation'

/**
 * L'appel aux professionnels, en bandeau sombre comme celui des fiches
 * métier : leur fiche existe déjà, et la compléter vaut mieux qu'un message.
 * Deux boutons pour deux métiers : le parcours d'inscription sait ensuite
 * quelle fiche chercher.
 */
export function CtaCompte() {
  return (
    <section className="container pb-20 md:pb-24">
      <div className="squircle-3xl dark relative overflow-hidden bg-background p-8 text-fg md:p-12">
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Vous êtes professionnel ?
            <span className="block text-white/55">Votre fiche existe déjà.</span>
          </h2>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <Link
              href={chemin('/connexion?mode=inscription&profil=dentiste')}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground"
            >
              Je suis dentiste <ArrowUpRight className="size-4" aria-hidden />
            </Link>
            <Link
              href={chemin('/connexion?mode=inscription&profil=prothesiste')}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-medium text-white"
            >
              Je suis prothésiste <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
