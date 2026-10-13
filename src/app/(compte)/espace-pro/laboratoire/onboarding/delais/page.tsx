import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Encart, Etapes, discret, principal, titre } from '@/components/compte/ui'
import { SaisieDelais, SaisieZone } from '@/components/espace/saisie-delais'
import { chemin } from '@/lib/navigation'
import { enregistrerDelaisEtZone } from '@/lib/espace-pro/actions-fiche'
import { Gain, gainRestant } from '@/app/(compte)/espace-pro/onboarding/_commun'
import { CoquilleOnboardingLabo, chargerOnboardingLabo, suivanteLabo, versEtapeLabo } from '../_commun'

export const metadata: Metadata = { title: 'Délais et zone desservie', robots: { index: false, follow: false } }
export const instant = false

/** LO2 : délais moyens en jours ouvrés (1 à 60) et rayon desservi (5 à 150 km). */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; suite?: string }> }) {
  const sp = await props.searchParams
  const espace = await chargerOnboardingLabo('delais', sp.fiche)
  const { fiche, completee: c } = espace
  const gain = gainRestant(espace, ['delais', 'zone'])
  return (
    <CoquilleOnboardingLabo espace={espace} enCours={['delais', 'zone']}>
      <Etapes etape={3} total={3} libelle="Délais et zone" />
      <h1 className={titre}>Délais et zone desservie</h1>
      <p className="mt-2 text-sm text-fg-2">Délais moyens en jours ouvrés, de la réception de l’empreinte à l’expédition.</p>
      <Gain points={gain} texte="délais affichés et zone de recherche" />
      {sp.erreur && <Encart ton="erreur" className="mt-4">{sp.erreur}</Encart>}
      <form action={enregistrerDelaisEtZone} className="mt-6">
        <input type="hidden" name="fiche" value={fiche.slug} />
        <input type="hidden" name="suite" value={sp.suite?.startsWith('/espace-pro/') ? sp.suite : suivanteLabo('delais', fiche.slug)} />
        <input type="hidden" name="ici" value={versEtapeLabo('delais', fiche.slug)} />
        <SaisieDelais initiaux={c?.delais ?? null} />
        <div className="mt-6">
          <SaisieZone rayon={c?.rayonKm ?? null} ramassage={c?.ramassage ?? null} jours={c?.joursRamassage ?? []} transporteur={c?.transporteur ?? null} />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1">
          <button type="submit" className={`${principal} sm:w-auto sm:px-8`}>
            Valider{gain > 0 ? ` · +${gain} %` : ''}
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <Link href={chemin(suivanteLabo('delais', fiche.slug))} className={`${discret} sm:w-auto`}>
            Passer cette étape
          </Link>
        </div>
      </form>
    </CoquilleOnboardingLabo>
  )
}
