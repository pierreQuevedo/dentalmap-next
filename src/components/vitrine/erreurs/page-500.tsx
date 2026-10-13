'use client'

/**
 * Page d'erreur serveur, rendue par les limites d'erreur (`error.tsx`,
 * `global-error.tsx`). Composant client : le bouton « Réessayer » appelle le
 * `retry` de la limite, qui recharge et rend à nouveau le segment fautif.
 *
 * La référence de l'incident est le `digest` que Next attache aux erreurs des
 * composants serveur, celui qu'on retrouve dans les journaux. Une erreur née
 * dans le navigateur n'en a pas : la ligne disparaît.
 */
import Link from 'next/link'
import { House, Mail, RotateCw } from 'lucide-react'
import { HeaderTransparent } from '@/components/home/HeaderTransparent'
import { chemin } from '@/lib/navigation'
import { Fond } from './fond'

export function Page500({ retry, reference, sansEnTete = false }: { retry: () => void; reference?: string; sansEnTete?: boolean }) {
  return (
    <main>
      <title>Erreur | DentalMap</title>
      <meta name="robots" content="noindex" />
      {!sansEnTete && <HeaderTransparent />}
      <section className={`dark relative flex min-h-svh flex-col overflow-hidden bg-background text-fg ${sansEnTete ? '' : '-mt-20 pt-20'}`}>
        <Fond chiffre="500" />
        <div className="container relative z-10 flex flex-1 flex-col items-center justify-center py-14 text-center">
          <div aria-hidden className="relative grid size-20 place-items-center">
            <span className="absolute inset-0 rounded-full border border-dashed border-white/25" />
            <RotateCw className="size-8 text-teal" strokeWidth={1.5} />
          </div>
          <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-7xl">
            Un souci de notre côté.
            <span className="block text-white/50">Réessayez dans un instant.</span>
          </h1>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground hover:bg-brand-hover"
            >
              <RotateCw className="size-4" aria-hidden /> Réessayer
            </button>
            <Link href={chemin('/')} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10">
              <House className="size-4" aria-hidden /> Accueil
            </Link>
            <Link href={chemin('/contact/')} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10">
              <Mail className="size-4" aria-hidden /> Contact
            </Link>
          </div>
          {reference && <p className="mt-10 font-mono text-xs text-white/40">Référence de l’incident : {reference.match(/.{1,4}/g)!.join(' ')}</p>}
        </div>
      </section>
    </main>
  )
}
