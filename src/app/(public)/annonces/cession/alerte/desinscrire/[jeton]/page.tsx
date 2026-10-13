import type { Metadata } from 'next'
import { desinscrireAlerteCession } from '@/lib/cessions/actions'
import { CarteAlerteCession } from '@/components/cessions/carte-alerte'

export const metadata: Metadata = { title: 'Se désinscrire de l’alerte cessions', robots: { index: false, follow: false } }

/** La désinscription, depuis le lien de chaque email d'alerte. L'alerte est supprimée. */
export default async function Page(props: { params: Promise<{ jeton: string }>; searchParams: Promise<{ fait?: string }> }) {
  const { jeton } = await props.params
  const sp = await props.searchParams
  if (sp.fait) {
    return (
      <CarteAlerteCession titre="Vous êtes désinscrit">
        <p>Vous ne recevrez plus d’emails sur les nouvelles annonces de cession. Vous pouvez vous réinscrire à tout moment depuis la liste des cessions.</p>
      </CarteAlerteCession>
    )
  }
  return (
    <CarteAlerteCession titre="Se désinscrire de l’alerte cessions">
      <p>Vous ne recevrez plus d’emails sur les nouvelles annonces de cession publiées.</p>
      <form action={desinscrireAlerteCession}>
        <input type="hidden" name="jeton" value={jeton} />
        <button type="submit" className="inline-flex h-11 cursor-pointer items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
          Me désinscrire
        </button>
      </form>
    </CarteAlerteCession>
  )
}
