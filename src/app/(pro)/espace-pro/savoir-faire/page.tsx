import type { Metadata } from 'next'
import { Cpu, Wrench } from 'lucide-react'
import { Encart, Puce, principal } from '@/components/compte/ui'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { enregistrerSavoirFaire } from '@/lib/espace-pro/actions-fiche'
import { MATERIAUX, TECHNIQUES } from '@/lib/espace-pro/labo'
import { Caches, chargerLabo } from '../_labo'

export const metadata: Metadata = { title: 'Savoir-faire', robots: { index: false, follow: false } }
export const instant = false

/** Techniques, matériaux et numérique : ce que les cabinets filtrent pour choisir un laboratoire. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerLabo('savoir-faire', sp.fiche)
  const c = t.espace.completee
  const tech = new Set(c?.techniques ?? [])
  const mat = new Set(c?.materiaux ?? [])
  return (
    <CoqueEspace c={t.coque} actif="savoir-faire" titre="Savoir-faire" sousTitre="Ce que les cabinets filtrent pour choisir un laboratoire">
      <form action={enregistrerSavoirFaire}>
        <Caches t={t} page="savoir-faire" />
        {sp.erreur && <Encart ton="erreur" className="mb-4">{sp.erreur}</Encart>}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Tuile>
            <TitreTuile i={Wrench} droite={<span className="text-xs text-fg-2">{tech.size} choisies · trois au moins</span>}>
              Techniques
            </TitreTuile>
            <div className="mt-4 flex flex-wrap gap-2">
              {TECHNIQUES.map((x) => (
                <Puce key={x.code} name="technique" value={x.code} multiple defaultChecked={tech.has(x.code)}>
                  {x.libelle}
                </Puce>
              ))}
            </div>
          </Tuile>
          <Tuile>
            <TitreTuile i={Wrench} droite={<span className="text-xs text-fg-2">{mat.size} choisis</span>}>
              Matériaux
            </TitreTuile>
            <div className="mt-4 flex flex-wrap gap-2">
              {MATERIAUX.map((x) => (
                <Puce key={x.code} name="materiau" value={x.code} multiple defaultChecked={mat.has(x.code)}>
                  {x.libelle}
                </Puce>
              ))}
            </div>
          </Tuile>
          <Tuile className="lg:col-span-2">
            <TitreTuile i={Cpu}>Numérique</TitreTuile>
            <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                ['stl', 'Empreintes numériques', 'Fichiers STL des scanners intra-oraux', c?.empreintesStl],
                ['usinage', 'Usinage sur place', 'Fraiseuse au laboratoire, zircone et titane', c?.usinage],
                ['impression3d', 'Impression 3D', 'Modèles, guides chirurgicaux, gouttières', c?.impression3d],
              ].map(([n, titre, d, v]) => (
                <li key={n as string}>
                  <label className="squircle-xl flex cursor-pointer items-start justify-between gap-3 border border-line p-4">
                    <span>
                      <span className="block text-sm font-semibold text-fg">{titre as string}</span>
                      <span className="mt-1 block text-sm text-fg-2">{d as string}</span>
                    </span>
                    <input type="checkbox" name={n as string} defaultChecked={!!v} className="peer sr-only" />
                    <span aria-hidden className="relative h-6 w-10 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-teal peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-action after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
                  </label>
                </li>
              ))}
            </ul>
          </Tuile>
        </div>
        <button type="submit" className={`${principal} mt-4 w-auto px-6`}>
          Enregistrer
        </button>
      </form>
    </CoqueEspace>
  )
}
