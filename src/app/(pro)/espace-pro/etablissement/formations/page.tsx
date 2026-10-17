import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CalendarDays, Images } from 'lucide-react'
import { CoqueEspace, Tuile } from '@/components/espace/coque'
import { SaisieFormations } from '@/components/espace/saisie-formations'
import { chemin } from '@/lib/navigation'
import { enregistrerBloc } from '@/lib/espace-pro/actions-etablissement'
import { Retour, chargerEtablissement, versEtab } from '../_commun'

export const metadata: Metadata = { title: 'Formations', robots: { index: false, follow: false } }
export const instant = false

/**
 * ETAB-FORM : les diplômes préparés. Chaque formation se complète sur place
 * (niveau, durée, voies, conditions d'accès, places) et s'active ou se
 * désactive sans être supprimée. Une faculté passe par son cursus.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; enregistre?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerEtablissement('formations', sp.fiche)
  if (t.source.type === 'faculte') redirect(chemin(versEtab(t, 'cursus')))
  const { source, fiche, coque } = t
  const confirme = fiche.donnees.confirmeLe.formations
  const rentree = new Date().getMonth() >= 8 ? new Date().getFullYear() + 1 : new Date().getFullYear()

  return (
    <CoqueEspace c={coque} actif="formations" titre="Formations" sousTitre={`Les diplômes préparés, rentrée ${rentree}`}>
      <div className="mb-4 space-y-2">
        <Retour erreur={sp.erreur} enregistre={sp.enregistre} bloc="formations" />
      </div>
      <Tuile className="max-w-3xl">
        <form action={enregistrerBloc}>
          <input type="hidden" name="fiche" value={source.slug} />
          <input type="hidden" name="bloc" value="formations" />
          <input type="hidden" name="retour" value={versEtab(t, 'formations')} />
          <SaisieFormations initiales={fiche.donnees.formations} enveloppe />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <p className="flex items-center gap-1.5 text-xs text-fg-2">
              <CalendarDays className="size-3.5" aria-hidden />
              {confirme ? `Confirmées le ${new Date(confirme).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })}` : 'Jamais confirmées'}
            </p>
            <button type="submit" className="inline-flex h-10 cursor-pointer items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
              Enregistrer
            </button>
          </div>
        </form>
      </Tuile>
      <p className="mt-4 flex items-center gap-2 text-xs text-fg-2">
        <Images className="size-3.5" aria-hidden /> Chaque formation alimente sa carte sur la page, les filtres de l’annuaire des formations et la recherche par diplôme.
      </p>
    </CoqueEspace>
  )
}
