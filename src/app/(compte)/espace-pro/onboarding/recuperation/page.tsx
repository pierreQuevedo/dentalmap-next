import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CircleCheck } from 'lucide-react'
import { Etapes, LignesRegistre, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { CoquilleOnboarding, chargerOnboarding, etapeSuivante } from '../_commun'
import { adresseDe, libelleProfession, nomDe } from '../../revendiquer/_commun'

export const metadata: Metadata = { title: 'Ce que nous savons déjà', robots: { index: false, follow: false } }
export const instant = false

/** B0 : la valeur déjà acquise, avant de demander quoi que ce soit. Aucune saisie. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; demande?: string }> }) {
  const sp = await props.searchParams
  const espace = await chargerOnboarding('recuperation', sp.fiche)
  const { fiche } = espace
  return (
    <CoquilleOnboarding espace={espace} sansBandeau={!!sp.demande}>
      <Etapes etape={0} libelle="Avant de commencer · 4 questions" />
      {sp.demande && (
        <p role="status" className="squircle-xl mb-5 flex items-start gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden /> Votre demande est partie à l’équipe, qui vous répond sous 48 heures ouvrées. Continuez : votre fiche se prépare dès maintenant.
        </p>
      )}
      <h1 className={titre}>Voici ce que nous savons déjà</h1>
      <p className="mt-2 text-sm text-fg-2">Ces informations viennent des registres et apparaissent déjà sur votre fiche. Vous n’avez rien à saisir.</p>
      <div className="mt-6">
        <LignesRegistre
          lignes={[
            { libelle: 'Nom', valeur: nomDe(fiche) },
            { libelle: 'Profession', valeur: fiche.specialite ?? libelleProfession(fiche) },
            ...(fiche.rpps ? [{ libelle: 'Numéro RPPS', valeur: fiche.rpps }] : []),
            { libelle: 'Adresse', valeur: adresseDe(fiche.resume) ?? 'Non renseignée' },
          ]}
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1">
        <Link href={chemin(etapeSuivante('recuperation', fiche.slug))} className={`${principal} sm:w-auto sm:px-8`}>
          C’est juste, continuer
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href={chemin('/contact/?objet=erreur-fiche')} className={`${discret} sm:w-auto`}>
          Signaler une erreur
        </Link>
      </div>
    </CoquilleOnboarding>
  )
}
