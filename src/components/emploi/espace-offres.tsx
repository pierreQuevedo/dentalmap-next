import Link from 'next/link'
import { Lock, Megaphone, Search } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { formaterAdresse } from '@/lib/annuaire/nom'
import { agirSurOffre } from '@/lib/emploi/actions-offres'
import type { etatOffre } from '@/lib/emploi/offre-pro'
import { PALIERS } from '@/lib/espace-pro/progression'
import type { LieuRevendication } from '@/lib/espace-pro/parcours'

/** Les briques partagées par la liste des offres et la page d'une offre, dans l'espace pro. */

export function pastilleOffre(etat: ReturnType<typeof etatOffre>): { libelle: string; classe: string } {
  if (etat.etat === 'en_ligne') return etat.aConfirmer ? { libelle: 'À confirmer', classe: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30' } : { libelle: 'En ligne', classe: 'bg-teal/10 text-teal ring-teal/20' }
  if (etat.etat === 'brouillon') return { libelle: 'Brouillon', classe: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30' }
  return { libelle: etat.etat === 'pourvue' ? 'Pourvue' : etat.etat === 'expiree' ? 'Expirée' : 'Retirée', classe: 'bg-bg-soft text-fg-2 ring-line' }
}

export function PastilleOffre({ etat }: { etat: ReturnType<typeof etatOffre> }) {
  const p = pastilleOffre(etat)
  return <span className={`squircle-full inline-flex px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${p.classe}`}>{p.libelle}</span>
}

/** Un geste sur une offre (confirmer, pourvue, retirer, republier), sans JavaScript : un formulaire. */
export function GesteOffre({ offre, fiche, geste, retour, children, principal = false }: { offre: string; fiche: string; geste: string; retour?: string; children: React.ReactNode; principal?: boolean }) {
  return (
    <form action={agirSurOffre}>
      <input type="hidden" name="fiche" value={fiche} />
      <input type="hidden" name="offre" value={offre} />
      <input type="hidden" name="geste" value={geste} />
      {retour && <input type="hidden" name="retour" value={retour} />}
      <button
        type="submit"
        className={
          principal
            ? 'inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover'
            : 'inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong'
        }
      >
        {children}
      </button>
    </form>
  )
}

export function libelleLieu(l: Pick<LieuRevendication, 'adresseLigne' | 'codePostal' | 'communeNom'>): string {
  return [l.adresseLigne && formaterAdresse(l.adresseLigne), l.codePostal, l.communeNom].filter(Boolean).join(', ')
}

/** Sous le palier Ambassadeur : la publication est fermée, ce qu'il reste à gagner. */
export function EmploiVerrouille({ reste, q }: { reste: number; q: string }) {
  const palier = PALIERS[3]
  return (
    <div className="squircle-2xl flex flex-wrap items-center gap-4 bg-gradient-to-br from-[#134E4A] to-[#0B1F1D] p-5 text-white">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-[#BFE3D6]">
        <Lock className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Publier des offres d’emploi se débloque au palier {palier.niveau}, {palier.nom}</p>
        <p className="mt-0.5 text-sm text-white/75">{reste > 0 ? `Plus que ${reste} points.` : 'Vous y êtes presque.'} Complétez votre fiche et faites-la connaître pour y arriver.</p>
      </div>
      <Link href={chemin(`/espace-pro/progression/${q}`)} className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-[#0B1F1D] hover:bg-[#BFE3D6]">
        Voir ma progression
      </Link>
    </div>
  )
}

/** Les deux usages de l'onglet Emploi : créer un poste (ses offres) ou en rechercher un. */
export function OngletsEmploi({ actif, q }: { actif: 'creer' | 'rechercher'; q: string }) {
  const onglets = [
    { cle: 'creer', libelle: 'Créer un poste', href: `/espace-pro/emploi/${q}`, I: Megaphone },
    { cle: 'rechercher', libelle: 'Rechercher un poste', href: `/espace-pro/emploi/recherche/${q}`, I: Search },
  ] as const
  return (
    <nav aria-label="Emploi" className="squircle-full mb-4 flex w-full bg-bg-soft p-1 sm:inline-flex sm:w-auto">
      {onglets.map(({ cle, libelle, href, I }) => (
        <Link
          key={cle}
          href={chemin(href)}
          aria-current={actif === cle ? 'page' : undefined}
          className={`squircle-full inline-flex h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap px-3 text-sm font-semibold sm:flex-none sm:px-5 ${actif === cle ? 'bg-fg text-bg shadow-sm' : 'text-fg-2 hover:text-fg'}`}
        >
          <I className="size-4" aria-hidden /> {libelle}
        </Link>
      ))}
    </nav>
  )
}
