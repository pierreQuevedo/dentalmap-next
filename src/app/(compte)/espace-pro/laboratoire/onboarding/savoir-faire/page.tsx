import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Encart, Etapes, Puce, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { enregistrerSavoirFaire } from '@/lib/espace-pro/actions-fiche'
import { MATERIAUX, TECHNIQUES } from '@/lib/espace-pro/labo'
import { Gain, gainRestant } from '@/app/(compte)/espace-pro/onboarding/_commun'
import { CoquilleOnboardingLabo, chargerOnboardingLabo, suivanteLabo, versEtapeLabo } from '../_commun'

export const metadata: Metadata = { title: 'Ce que votre laboratoire fabrique', robots: { index: false, follow: false } }
export const instant = false

/** LO1 : techniques et matériaux, listes fermées ; trois techniques au moins pour les quinze points. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; suite?: string }> }) {
  const sp = await props.searchParams
  const espace = await chargerOnboardingLabo('savoir-faire', sp.fiche)
  const { fiche, completee: c } = espace
  const gain = gainRestant(espace, ['savoir_faire', 'materiaux'])
  const t = new Set(c?.techniques ?? [])
  const m = new Set(c?.materiaux ?? [])
  return (
    <CoquilleOnboardingLabo espace={espace} enCours={['savoir_faire', 'materiaux']}>
      <Etapes etape={2} total={3} libelle="Savoir-faire" />
      <h1 className={titre}>Ce que votre laboratoire fabrique</h1>
      <p className="mt-2 text-sm text-fg-2">Les cabinets cherchent d’abord une technique et un matériau.</p>
      <Gain points={gain} texte="présence dans les filtres des cabinets" />
      {sp.erreur && <Encart ton="erreur" className="mt-4">{sp.erreur}</Encart>}
      <form action={enregistrerSavoirFaire} className="mt-6">
        <input type="hidden" name="fiche" value={fiche.slug} />
        <input type="hidden" name="suite" value={sp.suite?.startsWith('/espace-pro/') ? sp.suite : suivanteLabo('savoir-faire', fiche.slug)} />
        <input type="hidden" name="ici" value={versEtapeLabo('savoir-faire', fiche.slug)} />
        <fieldset>
          <legend className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Techniques</legend>
          <div className="flex flex-wrap gap-2">
            {TECHNIQUES.map((x) => (
              <Puce key={x.code} name="technique" value={x.code} multiple defaultChecked={t.has(x.code)}>
                {x.libelle}
              </Puce>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-fg-2">Trois au moins pour compter.</p>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Matériaux</legend>
          <div className="flex flex-wrap gap-2">
            {MATERIAUX.map((x) => (
              <Puce key={x.code} name="materiau" value={x.code} multiple defaultChecked={m.has(x.code)}>
                {x.libelle}
              </Puce>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 space-y-2.5">
          {[
            ['usinage', 'Usinage CFAO au laboratoire', c?.usinage],
            ['stl', 'Empreintes numériques (STL) acceptées', c?.empreintesStl],
            ['impression3d', 'Impression 3D', c?.impression3d],
          ].map(([n, l, v]) => (
            <label key={n as string} className="flex cursor-pointer items-center gap-2.5 text-sm text-fg">
              <input type="checkbox" name={n as string} defaultChecked={!!v} className="peer sr-only" />
              <span aria-hidden className="relative h-5 w-9 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-teal peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-action after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
              {l as string}
            </label>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1">
          <button type="submit" className={`${principal} sm:w-auto sm:px-8`}>
            Valider{gain > 0 ? ` · +${gain} %` : ''}
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <Link href={chemin(suivanteLabo('savoir-faire', fiche.slug))} className={`${discret} sm:w-auto`}>
            Passer cette étape
          </Link>
        </div>
      </form>
    </CoquilleOnboardingLabo>
  )
}
