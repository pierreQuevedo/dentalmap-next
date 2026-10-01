import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { chemin } from '@/lib/navigation'

/**
 * L'appel à créer son compte, à la place de l'essai gratuit du modèle. Deux
 * boutons pour deux métiers : le parcours d'inscription sait ensuite quelle
 * fiche chercher.
 */
export function CtaCompte() {
  const bouton = 'inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-6 text-sm font-semibold'
  return (
    <section className="pb-20 md:pb-24">
      <div className="container">
        <div className="flex flex-col gap-6 rounded-3xl bg-muted p-8 md:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Créez votre compte professionnel</h2>
            <p className="mt-2 text-muted-foreground md:text-lg">
              Revendiquez votre fiche, ajoutez vos horaires, vos langues et l’accessibilité de votre cabinet.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link href={chemin('/connexion?mode=inscription&profil=dentiste')} className={`${bouton} bg-teal text-white`}>
              Je suis dentiste
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href={chemin('/connexion?mode=inscription&profil=prothesiste')}
              className={`${bouton} border border-border bg-background text-foreground hover:bg-background/80`}
            >
              Je suis prothésiste
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
