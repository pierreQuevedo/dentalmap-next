import type { Metadata } from 'next'
import { Camera, Copyright } from 'lucide-react'
import { EnTeteEtab } from '@/components/espace/en-tete-etablissement'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { SaisieRealisations } from '@/components/espace/saisie-realisations'
import { enregistrerBloc } from '@/lib/espace-pro/actions-etablissement'
import { televersementDirect } from '@/lib/espace-pro/justificatif'
import { LIBELLE_TYPE } from '@/lib/espace-pro/etablissement'
import { Retour, chargerEtablissement, gainMissions, versEtab } from '../_commun'

export const metadata: Metadata = { title: 'Galerie', robots: { index: false, follow: false } }
export const instant = false

const champ = 'squircle-lg h-10 w-full border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-line-strong'

/**
 * ETAB-GAL : jusqu'à vingt-quatre photos des locaux, des ateliers (des
 * amphithéâtres et centres de soins pour une faculté) et des événements, chacune avec sa légende ; les cinq premières forment la
 * mosaïque de la page. Le crédit photo et l'attestation des droits
 * accompagnent la galerie.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; enregistre?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerEtablissement('galerie', sp.fiche)
  const { source, fiche, coque } = t
  const d = fiche.donnees
  const n = d.galerie.length
  const gain = gainMissions(t, 'photo')
  const fac = source.type === 'faculte'

  return (
    <CoqueEspace c={coque} actif="galerie" titre="Galerie" sousTitre={`${d.galerie.length} photo${d.galerie.length > 1 ? 's' : ''} sur 24 · les 5 premières s’affichent sur la page`}>
      <div className="mb-4">
        <Retour erreur={sp.erreur} enregistre={sp.enregistre} bloc="galerie" />
      </div>
      <EnTeteEtab
        i={Camera}
        etiquette="Galerie"
        titre={!n ? 'Ajoutez une première photo' : n >= 5 ? 'Votre galerie est complète sur la page' : `${n} photo${n > 1 ? 's' : ''} sur la page, encore ${5 - n} place${5 - n > 1 ? 's' : ''}`}
        texte={
          fac
            ? 'La première photo fait la grande image de la page et de la carte de la faculté. Les cinq premières forment la galerie que voient les futurs étudiants et les patients : amphithéâtres, salles de travaux pratiques, centres de soins.'
            : 'La première photo fait la grande image de la page et de la carte de formation. Les cinq premières forment la galerie que voient les candidats : ateliers, salles, travaux d’étudiants.'
        }
        pct={Math.round((Math.min(n, 5) / 5) * 100)}
        legende="photos affichées"
        gain={gain === null ? null : { pct: gain, quand: 'avec une première photo' }}
        progression={coque.progressionEtab!}
        q={t.q}
      />
      <form action={enregistrerBloc}>
        <input type="hidden" name="fiche" value={source.slug} />
        <input type="hidden" name="bloc" value="galerie" />
        <input type="hidden" name="retour" value={versEtab(t, 'galerie')} />
        <SaisieRealisations
          initiales={d.galerie}
          direct={televersementDirect()}
          max={24}
          nom="photos"
          mot="photo"
          mention={`La première est la grande photo de la page et de la carte ${fac ? 'de la faculté' : 'de formation'}. Chaque photo reste deux ans, puis vous êtes invité à la confirmer.`}
          apercu={{ titre: source.titre, type: LIBELLE_TYPE[source.type], credit: d.credit }}
          apres={
            // Crédit et droits n'ont de sens qu'avec au moins une photo.
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
            </div>
          }
        />
      </form>
    </CoqueEspace>
  )
}
