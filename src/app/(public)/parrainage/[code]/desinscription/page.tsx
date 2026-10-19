import type { Metadata } from 'next'
import { seDesinscrire } from '@/lib/espace-pro/actions-parrainage'

export const metadata: Metadata = { title: 'Ne plus recevoir d’invitation', robots: { index: false, follow: false } }
export const instant = false

/**
 * Le lien du bas des invitations de parrainage. Un bouton plutôt qu'un clic
 * direct, pour qu'un antivirus qui ouvre les liens ne désinscrive personne.
 */
export default async function Page(props: { params: Promise<{ code: string }>; searchParams: Promise<{ fait?: string }> }) {
  const { code } = await props.params
  const { fait } = await props.searchParams
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg items-center px-5 py-16">
      <div className="squircle-2xl w-full border border-line bg-bg p-8 shadow-pop">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{fait ? 'C’est noté' : 'Ne plus recevoir d’invitation'}</h1>
        <div className="mt-3 space-y-4 text-sm text-fg-2">
          {fait ? (
            <p>Cette adresse ne recevra plus d’invitation ni de rappel de parrainage DentalMap.</p>
          ) : (
            <>
              <p>Un confrère vous a invité à revendiquer votre fiche DentalMap. Confirmez pour ne plus recevoir de rappel, ni d’autre invitation à cette adresse.</p>
              <form action={seDesinscrire}>
                <input type="hidden" name="code" value={code} />
                <button type="submit" className="inline-flex h-11 cursor-pointer items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                  Ne plus recevoir d’invitation
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
