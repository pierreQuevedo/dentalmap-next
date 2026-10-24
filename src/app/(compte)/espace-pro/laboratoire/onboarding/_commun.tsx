import Link from 'next/link'
import { Logo } from '@/components/site/logo'
import { redirect } from 'next/navigation'
import { Eye } from 'lucide-react'
import { Coquille } from '@/components/compte/coquille'
import { ApercuCabinet, type BlocCabinet } from '@/components/espace/apercu'
import { EnVerification } from '@/components/espace/en-verification'
import { chemin } from '@/lib/navigation'
import { getEspace, type Espace } from '@/lib/espace-pro/espace'
import { resumesLabo } from '@/lib/espace-pro/resumes'
import { adresseDe, garde, nomDe } from '@/app/(compte)/espace-pro/revendiquer/_commun'

/**
 * L'onboarding court d'un laboratoire : LO0 (ce que nous savons), deux
 * questions (savoir-faire, délais et zone), puis le récapitulatif LO4. La
 * fiche passe de 30 à 75 % ; réalisations, ANSM et présentation deviennent
 * des missions.
 */
export const ETAPES_LABO = ['recuperation', 'savoir-faire', 'delais', 'recapitulatif'] as const
export type EtapeLabo = (typeof ETAPES_LABO)[number]

export function versEtapeLabo(etape: EtapeLabo, slug: string): string {
  return `/espace-pro/laboratoire/onboarding/${etape}/?fiche=${encodeURIComponent(slug)}`
}

export function suivanteLabo(etape: EtapeLabo, slug: string): string {
  const i = ETAPES_LABO.indexOf(etape)
  return versEtapeLabo(ETAPES_LABO[Math.min(i + 1, ETAPES_LABO.length - 1)], slug)
}

export async function chargerOnboardingLabo(etape: EtapeLabo | 'liaison', slug?: string): Promise<Espace> {
  const ici = etape === 'liaison' ? `/espace-pro/laboratoire/liaison/${slug ? `?fiche=${encodeURIComponent(slug)}` : ''}` : `/espace-pro/laboratoire/onboarding/${etape}/${slug ? `?fiche=${encodeURIComponent(slug)}` : ''}`
  const compte = await garde(ici, 'prothesiste')
  const espace = await getEspace(compte, slug)
  if (!espace) redirect(chemin('/espace-pro/laboratoire/revendiquer/'))
  if (!espace.labo) redirect(chemin(`/espace-pro/onboarding/?fiche=${encodeURIComponent(espace.fiche.slug)}`))
  return espace
}

export function CoquilleOnboardingLabo({ espace, enCours, children }: { espace: Espace; enCours?: BlocCabinet[]; children: React.ReactNode }) {
  const apercu = <ApercuCabinet nom={nomDe(espace.fiche)} adresse={adresseDe(espace.fiche.resume)} lignes={resumesLabo(espace.completee)} enCours={enCours} force={espace.force.total} verifiee={(espace.force.items.find((i) => i.cle === 'identite')?.points ?? 0) > 0} />
  return (
    <Coquille
      retour="/espace-pro/"
      libelleRetour="Enregistrer et quitter"
      fermer
      volet={
        <div className="flex h-full flex-col overflow-y-auto bg-muted px-5 pb-8 md:px-10 xl:px-20">
          <div className="flex h-20 shrink-0 items-center">
            <Link href="/" className="inline-flex items-center" aria-label="DentalMap, accueil">
              <Logo />
            </Link>
          </div>
          {/* L'aperçu centré dans le volet, sous le logo. */}
          <div className="my-auto w-full max-w-md self-center py-8">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Aperçu · ce que voient les cabinets</p>
            {apercu}
          </div>
        </div>
      }
    >
      <details className="group mb-6 lg:hidden">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full bg-bg-soft px-3 py-1.5 text-xs font-medium text-fg">
          <Eye className="size-3.5" aria-hidden /> Voir l’aperçu cabinet
        </summary>
        <div className="mt-4">{apercu}</div>
      </details>
      {!espace.ctx.identiteVerifiee && <EnVerification labo className="mb-6" />}
      <div className="animate-fiche-entree">{children}</div>
    </Coquille>
  )
}
