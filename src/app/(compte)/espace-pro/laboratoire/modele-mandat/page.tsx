import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Modèle de mandat', robots: { index: false, follow: false } }

/**
 * Le modèle de mandat (MAN), à imprimer ou enregistrer en PDF depuis le
 * navigateur, puis à faire signer par le gérant.
 */
export default function Page() {
  const ligne = <span className="inline-block w-64 border-b border-fg/40 align-bottom" />
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-[15px] leading-relaxed text-fg print:py-0">
      <p className="text-xs uppercase tracking-wider text-fg-2 print:hidden">Imprimez cette page, ou enregistrez-la en PDF depuis votre navigateur.</p>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Mandat de gestion de la fiche DentalMap d’un laboratoire</h1>
      <p className="mt-6">
        Je soussigné(e) {ligne}, gérant(e) ou dirigeant(e) du laboratoire de prothèse dentaire {ligne}, SIREN {ligne},
      </p>
      <p className="mt-4">
        donne mandat à {ligne}, salarié(e) du laboratoire, adresse électronique {ligne},
      </p>
      <p className="mt-4">
        pour revendiquer et gérer en mon nom la fiche du laboratoire sur DentalMap : savoir-faire, délais, zone desservie, réalisations, déclaration ANSM et présentation.
      </p>
      <p className="mt-4">Ce mandat peut être révoqué à tout moment par un message à contact@dentalmap.fr.</p>
      <p className="mt-10">Fait à {ligne}, le {ligne}</p>
      <p className="mt-10">Signature du gérant ou de la gérante :</p>
      <div className="mt-2 h-28 w-72 border border-fg/30" />
    </main>
  )
}
