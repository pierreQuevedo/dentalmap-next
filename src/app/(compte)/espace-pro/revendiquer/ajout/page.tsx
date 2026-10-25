import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, UserPlus } from 'lucide-react'
import { Encart, Etapes, Pictogramme, discret, pastille, principal, saisie, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { REVENDIQUER } from '@/lib/espace-pro/chemins'
import { demanderAjoutPraticien } from '@/lib/espace-pro/actions-revendication'
import { CoquilleParcours, garde } from '../_commun'

export const metadata: Metadata = { title: 'Votre fiche n’existe pas encore', robots: { index: false, follow: false } }
export const instant = false

type Params = { profession?: string; rpps?: string; prenom?: string; nom?: string; adresse?: string; code_postal?: string; ville?: string; erreur?: string; envoyee?: string }

/**
 * S1-0, suite : un praticien installé depuis la dernière synchronisation de
 * l'Annuaire Santé demande sa fiche, comme un laboratoire absent (LA1). Pas
 * de justificatif ici : l'équipe retrouve le RPPS dans l'Annuaire Santé ;
 * l'identité se prouve ensuite, à la revendication.
 */
export default async function Page(props: { searchParams: Promise<Params> }) {
  const sp = await props.searchParams
  await garde(`${REVENDIQUER}/ajout/`)
  const champ = (nom: keyof Params, libelle: string, o: { placeholder?: string; mono?: boolean; autoComplete?: string; inputMode?: 'numeric' } = {}) => (
    <div>
      <label htmlFor={`ajout-${nom}`} className="mb-1.5 block text-sm font-medium text-fg">
        {libelle}
      </label>
      <div className={pastille}>
        <input id={`ajout-${nom}`} name={nom} required={nom !== 'prenom'} defaultValue={sp[nom] ?? ''} placeholder={o.placeholder} autoComplete={o.autoComplete} inputMode={o.inputMode} className={`${saisie} ${o.mono ? 'font-mono' : ''}`} />
      </div>
    </div>
  )
  return (
    <CoquilleParcours recherche={sp.rpps ?? ''} encart={{ icone: 'sablier', ton: 'attention', titre: 'Absent de l’annuaire', texte: 'L’Annuaire Santé est synchronisé chaque semaine.' }} retour={`${REVENDIQUER}/recherche/?profession=${sp.profession ?? 'dentiste'}&q=${encodeURIComponent(sp.rpps ?? '')}`} libelleRetour="Retour">
      <Etapes etape={2} libelle="Identification" />
      <Pictogramme icone={UserPlus} />
      <h1 className={titre}>Votre fiche n’existe pas encore</h1>
      {sp.envoyee ? (
        <>
          <p className="mt-2 text-sm text-fg-2">Votre demande est enregistrée.</p>
          <Encart titre="Ce qui se passe maintenant" className="mt-6">
            L’équipe retrouve votre numéro RPPS dans l’Annuaire Santé, puis crée la fiche. Vous recevez un email : vous pourrez alors la revendiquer et la compléter.
          </Encart>
          <Link href={chemin('/')} className={`${discret} mt-1`}>
            Retour à l’accueil
          </Link>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-fg-2">Vous venez de vous installer ? Décrivez votre cabinet : l’équipe vérifie votre RPPS dans l’Annuaire Santé avant de créer la fiche.</p>
          {sp.erreur && (
            <Encart ton="erreur" className="mt-4">
              {sp.erreur}
            </Encart>
          )}
          <form action={demanderAjoutPraticien} className="mt-6 space-y-4">
            <input type="hidden" name="profession" value={sp.profession ?? 'dentiste'} />
            {champ('rpps', 'Numéro RPPS', { placeholder: '10003456789', mono: true, inputMode: 'numeric' })}
            <div className="grid gap-4 sm:grid-cols-2">
              {champ('prenom', 'Prénom', { autoComplete: 'given-name' })}
              {champ('nom', 'Nom', { autoComplete: 'family-name' })}
            </div>
            {champ('adresse', 'Adresse du cabinet', { placeholder: '12 rue de la République', autoComplete: 'address-line1' })}
            <div className="grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
              {champ('code_postal', 'Code postal', { placeholder: '33000', mono: true, inputMode: 'numeric', autoComplete: 'postal-code' })}
              {champ('ville', 'Ville', { autoComplete: 'address-level2' })}
            </div>
            <button type="submit" className={principal}>
              Envoyer la demande
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </form>
        </>
      )}
    </CoquilleParcours>
  )
}
