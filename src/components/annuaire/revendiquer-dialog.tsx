'use client'

import Link from 'next/link'
import { Dialog } from 'radix-ui'
import { chemin } from '@/lib/navigation'

/**
 * Fenêtre de revendication d'une fiche de chirurgien-dentiste.
 *
 * Elle s'ouvre depuis la fiche elle-même et propose d'abord la voie la plus
 * courte : s'identifier avec sa carte CPS ou son e-CPS auprès de Pro Santé
 * Connect, ce qui accorde la fiche sur-le-champ si le numéro RPPS renvoyé est
 * celui de la fiche. La vérification manuelle reste proposée en second, pour
 * qui n'a pas sa carte sous la main.
 *
 * Le bouton de départ est un lien ordinaire et non un `Link` : il mène à une
 * route d'API qui redirige hors du site, et la navigation côté client n'y a
 * pas sa place.
 */
export function RevendiquerDialog({ slug, pscDisponible }: { slug: string; pscDisponible: boolean }) {
  const fiche = encodeURIComponent(slug)

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="squircle-full mt-4 inline-block bg-action px-5 py-2.5 font-medium text-action-foreground hover:bg-action-hover"
        >
          Revendiquer cette fiche
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-[oklch(0.15_0.02_220/0.45)] backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          aria-describedby="revendiquer-description"
          className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 squircle-2xl border border-line bg-bg p-6 shadow-pop outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-semibold tracking-tight text-fg">Revendiquer cette fiche</Dialog.Title>
              <Dialog.Description id="revendiquer-description" className="mt-2 text-sm text-fg-2">
                Pour vous confier cette fiche, nous devons être certains que vous êtes bien ce praticien. La façon la
                plus rapide passe par votre carte professionnelle.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Fermer"
              className="squircle-full -mr-2 -mt-2 grid size-9 shrink-0 place-items-center text-fg-2 hover:bg-bg-soft hover:text-fg"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </Dialog.Close>
          </div>

          <div className="mt-6 squircle-xl border border-line bg-bg-soft p-5">
            <div className="flex items-center gap-3">
              <span className="squircle-md grid size-10 shrink-0 place-items-center bg-bg ring-1 ring-inset ring-line">
                <CarteIcone className="size-5 text-action" />
              </span>
              <div>
                <h3 className="font-semibold text-fg">Avec Pro Santé Connect</h3>
                <p className="text-xs text-fg-2">Carte CPS ou application e-CPS</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-fg-2">
              L’Agence du Numérique en Santé nous transmet votre numéro RPPS. S’il est celui de cette fiche, elle vous
              est attribuée immédiatement, sans aucun document à envoyer.
            </p>
            {pscDisponible ? (
              <a
                href={`/api/psc/connexion/?fiche=${fiche}`}
                className="squircle-full mt-4 inline-flex w-full items-center justify-center gap-2 bg-action px-5 py-2.5 font-medium text-action-foreground hover:bg-action-hover"
              >
                Vérifier avec Pro Santé Connect
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            ) : (
              <p className="mt-4 squircle-md border border-partiel-line bg-partiel-bg px-3 py-2 text-sm text-partiel">
                La vérification par Pro Santé Connect ouvrira prochainement. En attendant, la vérification manuelle
                ci-dessous reste disponible.
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-1 text-sm">
            <p className="text-fg-2">Vous n’avez pas votre carte sous la main ?</p>
            <Link
              href={chemin(`/espace-pro/revendiquer/?fiche=${fiche}`)}
              className="font-medium text-fg underline hover:no-underline"
            >
              Demander une vérification manuelle
            </Link>
          </div>

          <p className="mt-6 border-t border-line pt-4 text-xs text-fg-2">
            Revendiquer ne change ni votre identité, ni votre numéro RPPS, ni votre adresse d’exercice, qui viennent du
            registre.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function CarteIcone({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <rect x="6" y="9" width="5" height="4" rx="0.8" />
      <path d="M14 10h4M14 13h3" />
    </svg>
  )
}
