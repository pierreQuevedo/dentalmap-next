import type { Metadata } from 'next'
import { lireSaisie } from '@/lib/espace-pro/saisie'
import { Camera, Copyright } from 'lucide-react'
import { Encart, pastille, principal, saisie } from '@/components/compte/ui'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { SaisieRealisations } from '@/components/espace/saisie-realisations'
import { enregistrerRealisations } from '@/lib/espace-pro/actions-fiche'
import { Caches, chargerLabo } from '../_labo'

export const metadata: Metadata = { title: 'Réalisations', robots: { index: false, follow: false } }
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

/** Mission réalisations (+10 %) : une à huit photos de pièces, avec légende et crédit photo. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerLabo('realisations', sp.fiche)
  const c = t.espace.completee
  const gardee = await lireSaisie('/espace-pro/realisations/', sp.erreur)
  const gardees = lirePhotos(gardee.texte('realisations'))
  const n = c?.realisations.length ?? 0
  return (
    <CoqueEspace c={t.coque} actif="realisations" titre="Réalisations" sousTitre={n ? `${n} photo${n > 1 ? 's' : ''} sur 8 · elles s’affichent sur la fiche` : 'Mission · +10 % · 3 min'}>
      <form action={enregistrerRealisations} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Caches t={t} page="realisations" />
        <div>
          {sp.erreur && <Encart ton="erreur" className="mb-4">{sp.erreur}</Encart>}
          <SaisieRealisations initiales={gardees ?? c?.realisations ?? []} direct={!!process.env.BLOB_READ_WRITE_TOKEN} />
        </div>
        <aside className="space-y-4">
          <Tuile>
            <TitreTuile i={Copyright}>Crédit photo</TitreTuile>
            <label htmlFor="credit" className="mt-4 block text-sm font-medium text-fg">
              Auteur ou détenteur des droits
            </label>
            <div className={`${pastille} mt-1.5`}>
              <input id="credit" name="credit" defaultValue={gardee.texte('credit') ?? c?.creditPhotos ?? t.coque.nom} className={saisie} />
            </div>
            <p className="mt-2 text-xs text-fg-2">Affiché sous les photos : « Crédit photo : … ».</p>
          </Tuile>
          <Tuile>
            <TitreTuile i={Camera}>Droits</TitreTuile>
            <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm text-fg-2">
              <input type="checkbox" name="droits" defaultChecked={gardees ? gardee.texte('droits') === 'on' : n > 0} className="mt-0.5 size-4 accent-teal" />
              Le laboratoire détient les droits de ces photos, et aucun patient n’y est reconnaissable.
            </label>
          </Tuile>
          <button type="submit" className={`${principal} w-auto px-6`}>
            Enregistrer
          </button>
        </aside>
      </form>
    </CoqueEspace>
  )
}
