import type { Metadata } from 'next'
import { desinscrireAlerteFormation } from '@/lib/formation/actions-privee'
import { CarteAlerte } from '../../_carte'

export const metadata: Metadata = { title: 'Se désinscrire de l’alerte formations', robots: { index: false, follow: false } }

/** C : la désinscription, depuis le lien de chaque email d'alerte. L'alerte est supprimée. */
/** Le jeton vient de l’adresse : page bloquante, jamais pré-rendue. */
export const instant = false

export default async function Page(props: { params: Promise<{ jeton: string }>; searchParams: Promise<{ fait?: string }> }) {
  const { jeton } = await props.params
  const sp = await props.searchParams
  if (sp.fait) {
    return (
      <CarteAlerte titre="Vous êtes désinscrit">
        <p>Vous ne recevrez plus d’emails sur les nouvelles formations. Vous pouvez vous réinscrire à tout moment depuis la page des formations privées.</p>
      </CarteAlerte>
    )
  }
  return (
    <CarteAlerte titre="Se désinscrire de l’alerte formations">
      <p>Vous ne recevrez plus d’emails sur les nouvelles formations publiées.</p>
      <form action={desinscrireAlerteFormation}>
        <input type="hidden" name="jeton" value={jeton} />
        <button type="submit" className="inline-flex h-11 cursor-pointer items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
          Me désinscrire
        </button>
      </form>
    </CarteAlerte>
  )
}
