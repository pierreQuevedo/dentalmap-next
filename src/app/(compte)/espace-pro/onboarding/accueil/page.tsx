import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Baby } from 'lucide-react'
import { Encart, Etapes, Puce, discret, pastille, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { enregistrerAccueil } from '@/lib/espace-pro/actions-fiche'
import { ACCES_PMR, AGES_MINIMUM, LANGUES, libelleAge } from '@/lib/espace-pro/fiche-completee'
import { CoquilleOnboarding, Gain, chargerOnboarding, etapeSuivante, gainRestant, versEtape } from '../_commun'

export const metadata: Metadata = { title: 'Qui pouvez-vous accueillir ?', robots: { index: false, follow: false } }
export const instant = false

/** Les langues montrées d'emblée ; les autres se déplient sous « Autre ». */
const PRINCIPALES = ['fr', 'en', 'es', 'ar', 'pt', 'de']

/** B3 : langues, accès PMR et âge minimum. Trois réponses, trois filtres ; pour l'accès, c'est la réponse qui compte. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; suite?: string }> }) {
  const sp = await props.searchParams
  const espace = await chargerOnboarding('accueil', sp.fiche)
  const { fiche, completee } = espace
  const gain = gainRestant(espace, ['langues', 'pmr'])
  const langues = new Set(completee?.langues.length ? completee.langues : ['fr'])
  const autres = LANGUES.filter((l) => !PRINCIPALES.includes(l.code))
  return (
    <CoquilleOnboarding espace={espace} enCours="accueil">
      <Etapes etape={4} libelle="Accueil" />
      <h1 className={titre}>Qui pouvez-vous accueillir ?</h1>
      <p className="mt-2 text-sm text-fg-2">Langues, accessibilité et âge : trois réponses, trois filtres.</p>
      <Gain points={gain} texte="filtres langues, PMR et enfants" />
      {sp.erreur && <Encart ton="erreur" className="mt-4">{sp.erreur}</Encart>}
      <form action={enregistrerAccueil} className="mt-6">
        <input type="hidden" name="fiche" value={fiche.slug} />
        <input type="hidden" name="suite" value={sp.suite?.startsWith('/espace-pro/') ? sp.suite : etapeSuivante('accueil', fiche.slug)} />
        <input type="hidden" name="ici" value={versEtape('accueil', fiche.slug)} />
        <fieldset>
          <legend className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Langues parlées au cabinet</legend>
          <div className="flex flex-wrap gap-2">
            {LANGUES.filter((l) => PRINCIPALES.includes(l.code)).map((l) => (
              <Puce key={l.code} name="langue" value={l.code} multiple defaultChecked={langues.has(l.code)}>
                {l.libelle}
              </Puce>
            ))}
          </div>
          <details className="mt-2" open={autres.some((l) => langues.has(l.code))}>
            <summary className="inline-flex cursor-pointer list-none items-center rounded-full border border-line px-3 py-1.5 text-xs font-medium text-fg hover:border-line-strong">+ Autre</summary>
            <div className="mt-2 flex flex-wrap gap-2">
              {autres.map((l) => (
                <Puce key={l.code} name="langue" value={l.code} multiple defaultChecked={langues.has(l.code)}>
                  {l.libelle}
                </Puce>
              ))}
            </div>
          </details>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Accès aux personnes à mobilité réduite</legend>
          <div className="flex flex-wrap gap-2">
            {ACCES_PMR.map((a) => (
              <Puce key={a.code} name="pmr" value={a.code} defaultChecked={completee?.accesPmr === a.code}>
                {a.libelle}
              </Puce>
            ))}
          </div>
        </fieldset>
        <div className="mt-5">
          <label htmlFor="accueil-age" className="mb-1.5 block text-sm font-medium text-fg">
            Âge minimum des patients
          </label>
          <div className={pastille}>
            <Baby className="size-4 shrink-0 text-fg-2" aria-hidden />
            <select id="accueil-age" name="age" required defaultValue={completee?.ageMinimum ?? ''} className="min-w-0 flex-1 cursor-pointer bg-transparent py-2.5 text-sm text-fg outline-none">
              <option value="" disabled>
                Choisir
              </option>
              {AGES_MINIMUM.map((a) => (
                <option key={a} value={a}>
                  {libelleAge(a)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1">
          <button type="submit" className={`${principal} sm:w-auto sm:px-8`}>
            Valider{gain > 0 ? ` · +${gain} %` : ''}
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <Link href={chemin(etapeSuivante('accueil', fiche.slug))} className={`${discret} sm:w-auto`}>
            Passer cette étape
          </Link>
        </div>
      </form>
    </CoquilleOnboarding>
  )
}
