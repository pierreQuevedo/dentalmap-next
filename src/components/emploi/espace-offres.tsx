import Link from 'next/link'
import { Lock } from 'lucide-react'
import { FormulaireOffre, type ValeursOffre } from './formulaire-offre'
import { chemin } from '@/lib/navigation'
import { formaterAdresse } from '@/lib/annuaire/nom'
import { agirSurOffre } from '@/lib/emploi/actions-offres'
import { decouperDescription } from '@/lib/emploi/format'
import type { etatOffre } from '@/lib/emploi/offre-pro'
import type { OffreRecruteur } from '@/lib/emploi/offres-pro'
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

/** Les valeurs du formulaire : une offre existante, ou une nouvelle offre au lieu principal. */
export function valeursOffre(o: OffreRecruteur | undefined, lieuParDefaut: string | null): ValeursOffre {
  if (!o) {
    return { metier: 'assistant_dentaire', titre: 'Assistant(e) dentaire', contrat: 'cdi', tempsPlein: true, heuresHebdo: null, debut: null, fin: null, min: null, max: null, lieuId: lieuParDefaut, presentation: '', missions: '', profil: null, avantages: [] }
  }
  const { resume, points } = decouperDescription(o.description)
  return { id: o.id, metier: o.metier, titre: o.titre, contrat: o.contrat, tempsPlein: o.tempsPlein, heuresHebdo: o.heuresHebdo, debut: o.debut, fin: o.fin, min: o.min, max: o.max, lieuId: o.lieuId, presentation: resume, missions: points.join('\n'), profil: o.profil, avantages: o.avantages }
}

/** Le tiroir du formulaire, par-dessus la page ; fermer revient à `fermer`. */
export function TiroirOffre({ fiche, fermer, lieux, valeurs }: { fiche: string; fermer: string; lieux: { id: string; libelle: string }[]; valeurs: ValeursOffre }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <Link href={chemin(fermer)} aria-label="Fermer" className="absolute inset-0 bg-[#0e1317]/50 backdrop-blur-[2px]" />
      <div role="dialog" aria-modal="true" aria-label={valeurs.id ? 'Modifier l’offre' : 'Publier une offre'} className="relative h-full w-full max-w-xl bg-bg shadow-pop">
        <FormulaireOffre fiche={fiche} fermer={fermer} lieux={lieux} valeurs={valeurs} />
      </div>
    </div>
  )
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
