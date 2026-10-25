import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CircleCheck } from 'lucide-react'
import { Etapes, LignesRegistre, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { candidatLiaison, sirenDe } from '@/lib/espace-pro/parcours'
import { getCompte } from '@/lib/tunnel/compte'
import { adresseDe, nomDe } from '@/app/(compte)/espace-pro/revendiquer/_commun'
import { libelleSiren } from '@/app/(compte)/espace-pro/laboratoire/_commun'
import { CoquilleOnboardingLabo, chargerOnboardingLabo, suivanteLabo } from '../_commun'

export const metadata: Metadata = { title: 'Ce que nous savons du laboratoire', robots: { index: false, follow: false } }
export const instant = false

/** LO0 : ce que Sirene dit déjà du laboratoire. Aucune saisie. Ensuite, la liaison à une fiche praticien si elle a du sens (LK1). */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; demande?: string }> }) {
  const sp = await props.searchParams
  const espace = await chargerOnboardingLabo('recuperation', sp.fiche)
  const { fiche, completee } = espace
  const [siren, compte] = await Promise.all([sirenDe(fiche.id), getCompte()])
  const candidat = !completee?.praticienLieId && compte ? await candidatLiaison(fiche, compte.nom) : null
  const suite = candidat ? `/espace-pro/laboratoire/liaison/?fiche=${encodeURIComponent(fiche.slug)}` : suivanteLabo('recuperation', fiche.slug)
  return (
    <CoquilleOnboardingLabo espace={espace} sansBandeau={!!sp.demande}>
      <Etapes etape={1} total={3} libelle="Avant de commencer · 2 questions" />
      {sp.demande && (
        <p role="status" className="squircle-xl mb-5 flex items-start gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden /> Votre Kbis est parti à l’équipe, qui vous répond sous 48 heures ouvrées. Continuez : votre fiche se prépare dès maintenant.
        </p>
      )}
      <h1 className={titre}>Voici ce que nous savons déjà</h1>
      <p className="mt-2 text-sm text-fg-2">Ces informations viennent de la base Sirene et apparaissent déjà sur la fiche. Vous n’avez rien à saisir.</p>
      <div className="mt-6">
        <LignesRegistre
          lignes={[
            { libelle: 'Raison sociale', valeur: nomDe(fiche) },
            { libelle: 'Activité', valeur: 'Laboratoire de prothèse dentaire' },
            ...(siren ? [{ libelle: 'SIREN', valeur: libelleSiren(siren)! }] : []),
            { libelle: 'Adresse', valeur: adresseDe(fiche.resume) ?? 'Non renseignée' },
          ]}
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1">
        <Link href={chemin(suite)} className={`${principal} sm:w-auto sm:px-8`}>
          C’est juste, continuer
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href={chemin('/contact/?objet=erreur-fiche')} className={`${discret} sm:w-auto`}>
          Signaler une erreur
        </Link>
      </div>
    </CoquilleOnboardingLabo>
  )
}
