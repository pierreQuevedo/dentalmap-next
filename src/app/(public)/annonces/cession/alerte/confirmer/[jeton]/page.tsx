import type { Metadata } from 'next'
import { confirmerAlerteCession } from '@/lib/cessions/actions'
import { CarteAlerteCession } from '@/components/cessions/carte-alerte'

export const metadata: Metadata = { title: 'Confirmer votre alerte cessions', robots: { index: false, follow: false } }

/**
 * La confirmation de l'alerte cessions, depuis le lien de l'email. Un bouton
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
      <CarteAlerteCession titre="Votre alerte est active">
        <p>Vous recevrez un email quand une annonce de cession qui vous correspond est publiée, une fois par semaine au plus. Chaque email contient un lien pour vous désinscrire.</p>
      </CarteAlerteCession>
    )
  }
  if (sp.invalide) {
    return (
      <CarteAlerteCession titre="Ce lien n’est plus valable">
        <p>Il a peut-être été remplacé par une inscription plus récente. Inscrivez-vous de nouveau depuis la liste des cessions.</p>
      </CarteAlerteCession>
    )
  }
  return (
    <CarteAlerteCession titre="Confirmer votre alerte cessions">
      <p>Un clic pour activer l’alerte : vous serez prévenu des nouvelles annonces de cession de cabinet qui correspondent à vos critères.</p>
      <form action={confirmerAlerteCession}>
        <input type="hidden" name="jeton" value={jeton} />
        <button type="submit" className="inline-flex h-11 cursor-pointer items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
          Confirmer mon alerte
        </button>
      </form>
    </CarteAlerteCession>
  )
}
