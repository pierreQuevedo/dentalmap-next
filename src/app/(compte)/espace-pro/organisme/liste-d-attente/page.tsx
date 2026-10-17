import type { Metadata } from 'next'
import Link from 'next/link'
import { Bell, CircleCheck, Hourglass, Landmark } from 'lucide-react'
import { Encart, Pictogramme, Puce, discret, pastille, principal, saisie, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { inscrireListeAttente } from '@/lib/espace-pro/actions-etablissement'
import { SPECIALITES } from '@/lib/espace-pro/etablissement'
import { CoquilleOrganisme, ORGANISME, gardeOrganisme } from '../_commun'

export const metadata: Metadata = { title: 'Liste d’attente de la formation continue', robots: { index: false, follow: false } }

/**
 * W1 : la formation continue n'est pas encore recensée. On ne publie que des
 * données vérifiables ; l'organisme s'inscrit pour être prévenu à
 * l'ouverture. Organisme et au moins une spécialité sont requis.
 */
type Params = { organisme?: string; specialites?: string | string[]; erreur?: string; inscrit?: string }

const ACCROCHE = {
  titre: 'Écoles et facultés, au même endroit.',
  texte: 'Les formations initiales en odontologie et en prothèse dentaire sont recensées à partir du référentiel UAI. Complétez la fiche de votre établissement.',
}

export default async function Page(props: { searchParams: Promise<Params> }) {
  const sp = await props.searchParams
  const compte = await gardeOrganisme(`${ORGANISME}/liste-d-attente/`)
  const choisies = new Set([sp.specialites ?? []].flat())

  if (sp.inscrit) {
    return (
      <CoquilleOrganisme accroche={ACCROCHE}>
        <Pictogramme icone={CircleCheck} ton="succes" />
        <h1 className={titre}>Vous êtes sur la liste</h1>
        <p className="mt-2 text-sm text-fg-2">
          Nous vous écrivons à <span className="font-medium text-fg">{compte.email}</span> dès l’ouverture du recensement de la formation continue.
        </p>
        <Link href={chemin('/')} className={`${principal} mt-6`}>
          Retour à l’accueil
        </Link>
      <Encart titre="Vous avez déjà une formation à présenter ?" className="mt-4">
        Proposez-la dès maintenant : l’équipe la vérifie avant de la publier.{' '}
        <Link href={chemin('/espace-pro/compte/formation/')} className="font-medium text-fg underline underline-offset-4">
          Proposer une formation
        </Link>
      </Encart>
      </CoquilleOrganisme>
    )
  }

  return (
    <CoquilleOrganisme accroche={ACCROCHE} retour={`${ORGANISME}/`}>
      <Pictogramme icone={Hourglass} ton="attention" />
      <h1 className={titre}>Le recensement de la formation continue n’est pas encore ouvert</h1>
      <p className="mt-2 text-sm text-fg-2">Nous ne publions que des données vérifiables. Inscrivez-vous : vous serez parmi les premiers prévenus.</p>
      {sp.erreur && (
        <Encart ton="erreur" className="mt-5">
          {sp.erreur}
        </Encart>
      )}
      <form action={inscrireListeAttente} className="mt-6">
        <label htmlFor="attente-organisme" className="mb-1.5 block text-sm font-medium text-fg">
          Nom de l’organisme
        </label>
        <div className={pastille}>
          <Landmark className="size-4 shrink-0 text-fg-2" aria-hidden />
          <input id="attente-organisme" name="organisme" required minLength={2} maxLength={200} defaultValue={sp.organisme} placeholder="Institut Aquitain de Formation Dentaire" autoComplete="organization" className={saisie} />
        </div>
        <fieldset className="mt-5">
          <legend className="text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Spécialités proposées</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SPECIALITES.map((s) => (
              <Puce key={s} name="specialites" value={s} multiple defaultChecked={choisies.has(s)}>
                {s}
              </Puce>
            ))}
          </div>
        </fieldset>
        <button type="submit" className={`${principal} mt-5`}>
          <Bell className="size-4" aria-hidden />
          M’inscrire sur la liste
        </button>
      </form>
      <Link href={chemin(`${ORGANISME}/etablissement/`)} className={`${discret} mt-1`}>
        Voir les écoles et facultés
      </Link>
      <Encart titre="Vous avez déjà une formation à présenter ?" className="mt-4">
        Proposez-la dès maintenant : l’équipe la vérifie avant de la publier.{' '}
        <Link href={chemin('/espace-pro/compte/formation/')} className="font-medium text-fg underline underline-offset-4">
          Proposer une formation
        </Link>
      </Encart>
    </CoquilleOrganisme>
  )
}
