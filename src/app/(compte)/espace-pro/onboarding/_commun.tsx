import Link from 'next/link'
import { Logo } from '@/components/site/logo'
import { redirect } from 'next/navigation'
import { Eye } from 'lucide-react'
import { Coquille } from '@/components/compte/coquille'
import { ApercuPatient, type BlocApercu } from '@/components/espace/apercu'
import { EnVerification } from '@/components/espace/en-verification'
import { pointsDeLEspace } from '@/lib/espace-pro/progression-donnees'
import { chemin } from '@/lib/navigation'
import { getEspace, type Espace } from '@/lib/espace-pro/espace'
import { adresseDe, garde, libelleProfession, nomDe } from '../revendiquer/_commun'

/**
 * L'onboarding court d'un soignant : B0 (ce que nous savons déjà), quatre
 * questions (spécialité et domaines, horaires, conventionnement, accueil),
 * puis le récapitulatif B7. Photo, présentation et liens restent des missions
 * du tableau de bord ; les domaines de soins y restent aussi, pour y revenir.
 */
export const ETAPES_ONBOARDING = ['recuperation', 'specialite', 'horaires', 'conventionnement', 'accueil', 'recapitulatif'] as const
export type EtapeOnboarding = (typeof ETAPES_ONBOARDING)[number]

/** Le chemin d'une étape, la fiche courante gardée dans l'adresse. */
export function versEtape(etape: EtapeOnboarding, slug: string): string {
  return `/espace-pro/onboarding/${etape}/?fiche=${encodeURIComponent(slug)}`
}

export function etapeSuivante(etape: EtapeOnboarding, slug: string): string {
  const i = ETAPES_ONBOARDING.indexOf(etape)
  return versEtape(ETAPES_ONBOARDING[Math.min(i + 1, ETAPES_ONBOARDING.length - 1)], slug)
}

export async function chargerOnboarding(etape: EtapeOnboarding, slug?: string): Promise<Espace> {
  const ici = `/espace-pro/onboarding/${etape}/${slug ? `?fiche=${encodeURIComponent(slug)}` : ''}`
  const compte = await garde(ici)
  const espace = await getEspace(compte, slug)
  if (!espace) redirect(chemin('/espace-pro/revendiquer/'))
  if (espace.labo) redirect(chemin(`/espace-pro/laboratoire/onboarding/?fiche=${encodeURIComponent(espace.fiche.slug)}`))
  return espace
}

/** La coquille : l'aperçu patient à gauche, la question à droite. */
export async function CoquilleOnboarding({ espace, enCours, sansBandeau = false, children }: { espace: Espace; enCours?: BlocApercu; /** L'écran dit déjà la demande partie (arrivée après l'envoi) : pas de bandeau de vérification en plus. */ sansBandeau?: boolean; children: React.ReactNode }) {
  const { fiche, completee, force } = espace
  const { total: points } = await pointsDeLEspace(espace)
  const apercu = (
    <ApercuPatient
      points={points}
      nom={nomDe(fiche)}
      profession={fiche.profession}
      libelleProfession={libelleProfession(fiche)}
      adresse={adresseDe(fiche.resume)}
      completee={completee}
      enCours={enCours}
      force={force.total}
      verifiee={(force.items.find((i) => i.cle === 'identite')?.points ?? 0) > 0}
    />
  )
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
          <p className="mb-3 mt-4 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Aperçu · ce que voient les patients</p>
          <div className="max-w-md">{apercu}</div>
        </div>
      }
    >
      <details className="group mb-6 lg:hidden">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full bg-bg-soft px-3 py-1.5 text-xs font-medium text-fg">
          <Eye className="size-3.5" aria-hidden /> Voir l’aperçu patient
        </summary>
        <div className="mt-4">{apercu}</div>
      </details>
      {!espace.ctx.identiteVerifiee && !sansBandeau && <EnVerification className="mb-6" />}
      <div className="animate-fiche-entree">{children}</div>
    </Coquille>
  )
}

/** « +20 % · présence dans « Ouvert maintenant » ». */
export function Gain({ points, texte }: { points: number; texte: string }) {
  if (points <= 0) return null
  return <span className="mt-3 inline-block rounded-full bg-teal/15 px-2.5 py-0.5 text-[11px] font-medium text-teal">+{points} % · {texte}</span>
}

/** Ce qu'une étape rapporterait encore : le maximum du barème moins les points déjà acquis. */
export function gainRestant(espace: Espace, cles: string[]): number {
  return espace.force.items.filter((i) => cles.includes(i.cle)).reduce((s, i) => s + (i.max - i.points), 0)
}
