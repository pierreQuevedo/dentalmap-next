import type { Metadata } from 'next'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { couperRappels } from '@/lib/espace-pro/actions-rappels'

export const metadata: Metadata = { title: 'Ne plus recevoir les rappels', robots: { index: false, follow: false } }
export const instant = false

/**
 * Le lien du bas des rappels de fraîcheur et des alertes de liens : il coupe
 * ces emails pour une fiche. Un bouton plutôt qu'un clic direct, pour qu'un
 * antivirus qui ouvre les liens ne coupe rien à la place du professionnel.
 */
export default async function Page(props: { params: Promise<{ jeton: string }>; searchParams: Promise<{ fait?: string; invalide?: string }> }) {
  const { jeton } = await props.params
  const sp = await props.searchParams
  const titre = sp.fait ? 'Rappels coupés' : sp.invalide ? 'Lien invalide' : 'Ne plus recevoir les rappels'
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg items-center px-5 py-16">
      <div className="squircle-2xl w-full border border-line bg-bg p-8 shadow-pop">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{titre}</h1>
        <div className="mt-3 space-y-4 text-sm text-fg-2">
          {sp.fait ? (
            <p>Vous ne recevrez plus de rappels de fraîcheur ni d’alertes sur les liens pour cette fiche. Vous pouvez les rétablir depuis « Mises à jour », dans votre espace.</p>
          ) : sp.invalide ? (
            <p>Ce lien n’est pas reconnu. Ouvrez « Mises à jour » dans votre espace pour gérer les rappels.</p>
          ) : (
            <>
              <p>Plus de rappels pour reconfirmer vos informations, ni d’alertes quand un lien du cabinet ne répond plus. Les emails liés à votre compte continuent.</p>
              <form action={couperRappels}>
                <input type="hidden" name="jeton" value={jeton} />
                <button type="submit" className="inline-flex h-11 cursor-pointer items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                  Couper les rappels
                </button>
              </form>
            </>
          )}
        </div>
        <Link href={chemin('/espace-pro/fraicheur/')} className="mt-6 inline-flex text-sm font-medium text-fg underline underline-offset-4">
          Ouvrir mon espace
        </Link>
      </div>
    </main>
  )
}
