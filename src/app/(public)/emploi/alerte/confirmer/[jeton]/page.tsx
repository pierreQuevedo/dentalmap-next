import type { Metadata } from 'next'
import { confirmerAlerteEmploi } from '@/lib/emploi/actions-alerte'
import { CarteAlerte } from '../../_carte'

export const metadata: Metadata = { title: 'Confirmer votre alerte emploi', robots: { index: false, follow: false } }

/**
 * La confirmation de l'alerte emploi, depuis le lien de l'email. Un bouton
 * plutôt qu'une confirmation à l'ouverture : les antivirus des messageries
 * ouvrent les liens, ils ne doivent pas confirmer à la place de la personne.
 */
/** Le jeton vient de l’adresse : page bloquante, jamais pré-rendue. */
export const instant = false

export default async function Page(props: { params: Promise<{ jeton: string }>; searchParams: Promise<{ fait?: string; invalide?: string }> }) {
  const { jeton } = await props.params
  const sp = await props.searchParams
  if (sp.fait) {
    return (
      <CarteAlerte titre="Votre alerte est active">
        <p>Vous recevrez un email quand une offre qui vous correspond est publiée, une fois par semaine au plus. Chaque email contient un lien pour vous désinscrire.</p>
      </CarteAlerte>
    )
  }
  if (sp.invalide) {
    return (
      <CarteAlerte titre="Ce lien n’est plus valable">
        <p>Il a peut-être été remplacé par une inscription plus récente. Créez de nouveau l’alerte depuis une page d’offres.</p>
      </CarteAlerte>
    )
  }
  return (
    <CarteAlerte titre="Confirmer votre alerte emploi">
      <p>Un clic pour activer l’alerte : vous serez prévenu des nouvelles offres qui correspondent au métier et au lieu choisis.</p>
      <form action={confirmerAlerteEmploi}>
        <input type="hidden" name="jeton" value={jeton} />
        <button type="submit" className="inline-flex h-11 cursor-pointer items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
          Confirmer mon alerte
        </button>
      </form>
    </CarteAlerte>
  )
}
