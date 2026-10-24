import type { Metadata } from 'next'
import { lireSaisie } from '@/lib/espace-pro/saisie'
import { Route, Truck } from 'lucide-react'
import { Encart, principal } from '@/components/compte/ui'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { SaisieZone } from '@/components/espace/saisie-delais'
import { VoletCarte } from '@/components/compte/volet-carte'
import { enregistrerZone } from '@/lib/espace-pro/actions-fiche'
import { Caches, chargerLabo } from '../_labo'

export const metadata: Metadata = { title: 'Zone et logistique', robots: { index: false, follow: false } }
export const instant = false

/** Le rayon desservi, le ramassage et ses jours, l'envoi au-delà. Les cabinets de la zone vous voient dans leurs recherches. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerLabo('zone', sp.fiche)
  const c = t.espace.completee
  const gardee = await lireSaisie('/espace-pro/zone/', sp.erreur)
  const garde = gardee.texte('rayon') !== undefined
  return (
    <CoqueEspace c={t.coque} actif="zone" titre="Zone et logistique" sousTitre="Les cabinets de la zone vous voient dans leurs recherches">
      <form action={enregistrerZone} className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Caches t={t} page="zone" />
        <div className="squircle-2xl relative h-[30rem] overflow-hidden border border-line">
          <VoletCarte praticiens={[t.espace.fiche.resume]} profession="prothesiste" sansMarque />
        </div>
        <aside className="space-y-4">
          {sp.erreur && <Encart ton="erreur">{sp.erreur}</Encart>}
          <Tuile>
            <TitreTuile i={Truck}>Ramassage et rayon</TitreTuile>
            <div className="mt-4">
              <SaisieZone
                rayon={garde ? Number(gardee.texte('rayon')) : (c?.rayonKm ?? null)}
                ramassage={garde ? gardee.texte('ramassage') === 'on' : (c?.ramassage ?? null)}
                jours={garde ? (gardee.liste('jour') ?? []) : (c?.joursRamassage ?? [])}
                transporteur={garde ? gardee.texte('transporteur') === 'on' : (c?.transporteur ?? null)}
                etendue={c?.zoneEtendue ?? null}
                complete
              />
            </div>
          </Tuile>
          <Tuile>
            <TitreTuile i={Route}>Sur la fiche</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">
              {c?.rayonKm
                ? c.zoneEtendue
                  ? `Dessert ${c.zoneEtendue === 'france' ? 'toute la France' : 'la France et l’étranger'} par transporteur${c.ramassage ? `, ramassage des empreintes au cabinet à ${c.rayonKm} km` : ''}.`
                  : `Dessert ${c.rayonKm} km autour du laboratoire${c.ramassage ? ', ramassage des empreintes au cabinet' : ''}${c.transporteur ? ', envoi par transporteur au-delà' : ''}.`
                : 'Zone non renseignée.'}
            </p>
          </Tuile>
          <button type="submit" className={`${principal} w-auto px-6`}>
            Enregistrer
          </button>
        </aside>
      </form>
    </CoqueEspace>
  )
}
