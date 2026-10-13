import type { Metadata } from 'next'
import { desinscrireAlerteEmploi } from '@/lib/emploi/actions-alerte'
import { CarteAlerte } from '../../_carte'

export const metadata: Metadata = { title: 'Se désinscrire de l’alerte emploi', robots: { index: false, follow: false } }

/** La désinscription, depuis le lien de chaque email d'alerte. L'alerte est supprimée. */
export default async function Page(props: { params: Promise<{ jeton: string }>; searchParams: Promise<{ fait?: string }> }) {
  const { jeton } = await props.params
  const sp = await props.searchParams
  if (sp.fait) {
    return (
      <CarteAlerte titre="Vous êtes désinscrit">
        <p>Vous ne recevrez plus d’emails pour cette alerte. Vous pouvez en créer une nouvelle à tout moment depuis une page d’offres.</p>
      </CarteAlerte>
    )
  }
  return (
    <CarteAlerte titre="Se désinscrire de l’alerte emploi">
      <p>Vous ne recevrez plus d’emails sur les nouvelles offres de cette alerte.</p>
      <form action={desinscrireAlerteEmploi}>
        <input type="hidden" name="jeton" value={jeton} />
        <button type="submit" className="inline-flex h-11 cursor-pointer items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
          Me désinscrire
        </button>
      </form>
    </CarteAlerte>
  )
}
