import type { Metadata } from 'next'
import { Camera, Copyright } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { SaisieRealisations } from '@/components/espace/saisie-realisations'
import { enregistrerBloc } from '@/lib/espace-pro/actions-etablissement'
import { televersementDirect } from '@/lib/espace-pro/justificatif'
import { Retour, chargerEtablissement, versEtab } from '../_commun'

export const metadata: Metadata = { title: 'Galerie', robots: { index: false, follow: false } }
export const instant = false

const champ = 'squircle-lg h-10 w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-line-strong'

/**
 * ETAB-GAL : jusqu'à vingt-quatre photos des locaux, des ateliers et des
 * événements, chacune avec sa légende ; les cinq premières forment la
 * mosaïque de la page. Le crédit photo et l'attestation des droits
 * accompagnent la galerie.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; enregistre?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerEtablissement('galerie', sp.fiche)
  const { source, fiche, coque } = t
  const d = fiche.donnees

  return (
    <CoqueEspace c={coque} actif="galerie" titre="Galerie" sousTitre={`${d.galerie.length} photo${d.galerie.length > 1 ? 's' : ''} sur 24 · les 5 premières s’affichent sur la page`}>
      <div className="mb-4">
        <Retour erreur={sp.erreur} enregistre={sp.enregistre} bloc="galerie" />
      </div>
      <form action={enregistrerBloc} className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <input type="hidden" name="fiche" value={source.slug} />
        <input type="hidden" name="bloc" value="galerie" />
        <input type="hidden" name="retour" value={versEtab(t, 'galerie')} />
        <div>
          <SaisieRealisations
            initiales={d.galerie}
            direct={televersementDirect()}
            max={24}
            nom="photos"
            mot="photo"
            mention="La première est la grande photo de la page et de la carte de formation. Chaque photo reste deux ans, puis vous êtes invité à la confirmer."
          />
        </div>
        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={Copyright}>Crédit photo</TitreTuile>
            <label htmlFor="gal-credit" className="mt-4 block text-sm font-medium text-fg">
              Auteur ou détenteur des droits
            </label>
            <input id="gal-credit" name="credit" maxLength={120} defaultValue={d.credit ?? ''} placeholder="Studio Lumière, Bordeaux" className={`${champ} mt-1.5`} />
            <div className="squircle-xl mt-5 bg-bg-soft p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-2">Sur la page</p>
              <p className="mt-1 text-xs text-fg-2">{d.credit ? `Crédit photo : ${d.credit}` : 'Photos publiées par l’établissement'}</p>
            </div>
          </Tuile>
          <Tuile>
            <TitreTuile i={Camera}>Droits</TitreTuile>
            <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm text-fg-2">
              <input type="checkbox" name="droits" defaultChecked={d.droitsAttestes} className="mt-0.5 size-4 shrink-0 accent-[var(--teal)]" />
              L’établissement détient les droits de ces photos, et les personnes reconnaissables ont donné leur accord.
            </label>
            <button type="submit" className="mt-5 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
              Enregistrer la galerie
            </button>
          </Tuile>
        </aside>
      </form>
    </CoqueEspace>
  )
}
