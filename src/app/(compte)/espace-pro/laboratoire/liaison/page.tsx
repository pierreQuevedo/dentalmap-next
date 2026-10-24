import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Eye, Handshake, Layers, Link2 } from 'lucide-react'
import { FicheResume, Pictogramme, cadre, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { lierPraticien } from '@/lib/espace-pro/actions-fiche'
import { candidatLiaison, sirenDe } from '@/lib/espace-pro/parcours'
import { nomAffiche } from '@/lib/annuaire/types'
import { getCompte } from '@/lib/tunnel/compte'
import { adresseDe, nomDe } from '@/app/(compte)/espace-pro/revendiquer/_commun'
import { libelleSiren } from '@/app/(compte)/espace-pro/laboratoire/_commun'
import { CoquilleOnboardingLabo, chargerOnboardingLabo, versEtapeLabo } from '../onboarding/_commun'

export const metadata: Metadata = { title: 'Laboratoire intégré à un cabinet ?', robots: { index: false, follow: false } }
export const instant = false

/** LK1 : relier le laboratoire à la fiche du praticien qui le dirige. Facultatif ; les deux fiches restent distinctes. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const espace = await chargerOnboardingLabo('liaison', (await props.searchParams).fiche)
  const { fiche } = espace
  const suite = versEtapeLabo('savoir-faire', fiche.slug)
  const compte = await getCompte()
  const candidat = compte ? await candidatLiaison(fiche, compte.nom) : null
  if (!candidat) redirect(chemin(suite))
  const siren = await sirenDe(fiche.id)
  return (
    <CoquilleOnboardingLabo espace={espace}>
      <Pictogramme icone={Handshake} />
      <h1 className={titre}>Laboratoire intégré à un cabinet ?</h1>
      <p className="mt-2 text-sm text-fg-2">
        Le gérant du laboratoire porte le même nom qu’un chirurgien-dentiste de l’annuaire. S’il s’agit de vous, reliez les deux fiches :
      </p>
      <ul className="mt-4 space-y-2.5">
        {[
          { i: Link2, t: 'La fiche du laboratoire renvoie vers votre cabinet, et celle du cabinet vers le laboratoire.' },
          { i: Eye, t: 'Les confrères voient d’un coup d’œil que le laboratoire travaille au sein d’un cabinet.' },
          { i: Layers, t: 'Chaque fiche garde ses informations : rien n’est fusionné.' },
        ].map(({ i: I, t }) => (
          <li key={t} className="flex items-start gap-2.5 text-sm text-fg">
            <I className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden /> {t}
          </li>
        ))}
      </ul>
      <div className={`${cadre} mt-6`}>
        <FicheResume profession="Laboratoire de prothèse" nom={nomDe(fiche)} adresse={adresseDe(fiche.resume)} rpps={libelleSiren(siren)} libelleIdentifiant="SIREN" />
      </div>
      <div className={`${cadre} mt-2.5`}>
        <FicheResume profession="Chirurgien-dentiste" nom={nomAffiche({ ...candidat, profession: 'dentiste' })} adresse={adresseDe(candidat)} rpps={candidat.rpps} />
      </div>
      <form action={lierPraticien} className="mt-4">
        <input type="hidden" name="fiche" value={fiche.slug} />
        <input type="hidden" name="praticien" value={candidat.slug} />
        <input type="hidden" name="suite" value={suite} />
        <input type="hidden" name="ici" value={`/espace-pro/laboratoire/liaison/?fiche=${encodeURIComponent(fiche.slug)}`} />
        <button type="submit" className={principal}>
          Lier les deux fiches
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </form>
      <Link href={chemin(suite)} className={`${discret} mt-1`}>
        Ignorer
      </Link>
    </CoquilleOnboardingLabo>
  )
}
