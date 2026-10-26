import type { Metadata } from 'next'
import { Camera, Copyright } from 'lucide-react'
import { pastille, saisie } from '@/components/compte/ui'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { PanneauMission } from '@/components/espace/mission'
import { SaisieRealisations } from '@/components/espace/saisie-realisations'
import { enregistrerGalerie } from '@/lib/espace-pro/actions-fiche'
import { GALERIE_MIN } from '@/lib/espace-pro/marques'
import { lireSaisie } from '@/lib/espace-pro/saisie'
import { chargerTableau } from '../../_commun'

export const metadata: Metadata = { title: 'Galerie du cabinet', robots: { index: false, follow: false } }
export const instant = false

/** Les photos gardées après une erreur : déjà téléversées, on ne les fait pas renvoyer. */
function lirePhotos(json: string | undefined): { url: string; legende: string }[] | null {
  if (!json) return null
  try {
    const p = JSON.parse(json) as { url?: unknown; legende?: unknown }[]
    return Array.isArray(p) ? p.filter((x) => typeof x?.url === 'string').map((x) => ({ url: String(x.url), legende: String(x.legende ?? '') })) : null
  } catch {
    return null
  }
}

/** Mission « Galerie du cabinet » : une à huit photos (salle d'attente, fauteuil, équipement), trois pour compter, avec crédit et droits. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, q } = await chargerTableau('missions', sp.fiche, 'galerie')
  const c = espace.completee
  const gardee = await lireSaisie('/espace-pro/missions/galerie/', sp.erreur)
  const gardees = lirePhotos(gardee.texte('realisations'))
  const n = c?.realisations.length ?? 0
  return (
    <CoqueEspace c={coque} actif="progression" titre="Galerie du cabinet" sousTitre="+6 pts · 3 min" parent={{ libelle: 'Progression', href: `/espace-pro/progression/${q}` }}>
      <PanneauMission
        cle="galerie"
        titre="Galerie du cabinet"
        meta="Mission · +6 pts · 3 min"
        intro={`L’accueil, la salle de soins, l’équipement : ce que les patients découvrent en arrivant. ${GALERIE_MIN} photos au moins pour compter, huit au plus.`}
        action={enregistrerGalerie}
        fiche={espace.fiche.slug}
        avant={espace.force.total}
        q={q}
        erreur={sp.erreur}
        cote={
          <>
            <Tuile>
              <TitreTuile i={Copyright}>Crédit photo</TitreTuile>
              <label htmlFor="credit" className="mt-4 block text-sm font-medium text-fg">
                Auteur ou détenteur des droits
              </label>
              <div className={`${pastille} mt-1.5`}>
                <input id="credit" name="credit" defaultValue={gardee.texte('credit') ?? c?.creditPhotos ?? coque.nom} className={saisie} />
              </div>
              <p className="mt-2 text-xs text-fg-2">Affiché sous les photos : « Crédit photo : … ».</p>
            </Tuile>
            <Tuile>
              <TitreTuile i={Camera}>Droits</TitreTuile>
              <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm text-fg-2">
                <input type="checkbox" name="droits" defaultChecked={gardees ? gardee.texte('droits') === 'on' : n > 0} className="mt-0.5 size-4 accent-teal" />
                Le cabinet détient les droits de ces photos, et aucun patient n’y est reconnaissable.
              </label>
            </Tuile>
          </>
        }
      >
        <SaisieRealisations initiales={gardees ?? c?.realisations ?? []} direct={!!process.env.BLOB_READ_WRITE_TOKEN} mot="photo" mention="La première est la grande photo de la galerie. Aucun patient reconnaissable." />
      </PanneauMission>
    </CoqueEspace>
  )
}
