import type { Metadata } from 'next'
import { Check, Cpu, Eye, Wrench } from 'lucide-react'
import { Encart, Puce, principal } from '@/components/compte/ui'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { ChoixLibres } from '@/components/espace/choix-libres'
import { enregistrerSavoirFaire } from '@/lib/espace-pro/actions-fiche'
import { MATERIAUX, TECHNIQUES, libelleDe } from '@/lib/espace-pro/labo'
import { Caches, chargerLabo } from '../_labo'

export const metadata: Metadata = { title: 'Savoir-faire', robots: { index: false, follow: false } }
export const instant = false

/**
 * Techniques, matériaux et numérique : ce que les cabinets filtrent pour
 * choisir un laboratoire. Ce que la liste ne propose pas se nomme à la main ;
 * à droite, la fiche telle que les cabinets la lisent et les filtres remplis.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string }> }) {
  const sp = await props.searchParams
  const t = await chargerLabo('savoir-faire', sp.fiche)
  const c = t.espace.completee
  const tech = new Set(c?.techniques ?? [])
  const mat = new Set(c?.materiaux ?? [])
  const numerique = [c?.empreintesStl && 'Empreintes STL', c?.usinage && 'Usinage sur place', c?.impression3d && 'Impression 3D'].filter(Boolean) as string[]
  const lignes: [string, string | null][] = [
    ['Techniques', c?.techniques.length ? c.techniques.map((x) => libelleDe(TECHNIQUES, x)).join(', ') : null],
    ['Matériaux', c?.materiaux.length ? c.materiaux.map((x) => libelleDe(MATERIAUX, x)).join(', ') : null],
    ['Numérique', numerique.length ? numerique.join(', ') : null],
  ]
  return (
    <CoqueEspace c={t.coque} actif="savoir-faire" titre="Savoir-faire" sousTitre="Ce que les cabinets filtrent pour choisir un laboratoire">
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <form action={enregistrerSavoirFaire}>
        <Caches t={t} page="savoir-faire" />
        {sp.erreur && <Encart ton="erreur" className="mb-4">{sp.erreur}</Encart>}
        <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
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
              <ChoixLibres name="technique" initiaux={c?.techniques ?? []} ajout="Technique non listée" exemple="Stratification céramique" />
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
              <ChoixLibres name="materiau" initiaux={c?.materiaux ?? []} ajout="Matériau non listé" exemple="Céramique feldspathique" />
            </div>
          </Tuile>
          <Tuile className="2xl:col-span-2">
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
      <Tuile>
        <TitreTuile i={Eye}>Sur la fiche</TitreTuile>
        <dl className="mt-4 divide-y divide-line">
          {lignes.map(([k, v]) => (
            <div key={k} className="py-2.5 text-sm">
              <dt className="text-xs text-fg-2">{k}</dt>
              <dd className={`mt-0.5 ${v ? 'text-fg' : 'text-fg-2'}`}>{v ?? 'À compléter'}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs font-medium text-fg">Filtres des cabinets</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {t.espace.filtres.map((f) => (
            <li key={f.libelle} className={`squircle-full inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium ${f.actif ? 'bg-teal/10 text-teal' : 'bg-bg-soft text-fg-2'}`}>
              {f.actif && <Check className="size-3" aria-hidden />}
              {f.libelle}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-fg-2">Une technique ou un matériau nommé à la main s’affiche sur la fiche, sans servir de filtre.</p>
      </Tuile>
      </div>
    </CoqueEspace>
  )
}
