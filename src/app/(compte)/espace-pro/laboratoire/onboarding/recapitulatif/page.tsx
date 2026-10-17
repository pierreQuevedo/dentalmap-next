import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CircleCheck, Sparkles } from 'lucide-react'
import { Encart, discret, principal, titre } from '@/components/compte/ui'
import { Anneau } from '@/components/espace/apercu'
import { chemin } from '@/lib/navigation'
import { publierFiche } from '@/lib/espace-pro/actions-fiche'
import { LIBELLE_PALIER } from '@/lib/espace-pro/force'
import { resumesLabo } from '@/lib/espace-pro/resumes'
import { CoquilleOnboardingLabo, chargerOnboardingLabo, versEtapeLabo } from '../_commun'

export const metadata: Metadata = { title: 'Voici ce que verront les cabinets', robots: { index: false, follow: false } }
export const instant = false

/** LO4 : le récapitulatif avant publication ; réalisations, ANSM et présentation annoncées comme missions. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const espace = await chargerOnboardingLabo('recapitulatif', (await props.searchParams).fiche)
  const { fiche, completee, force, palier, missions } = espace
  const r = resumesLabo(completee)
  const verifiee = espace.ctx.identiteVerifiee
  const reponses = [
    { titre: 'Savoir-faire', valeur: r.savoir_faire, etape: 'savoir-faire' as const },
    { titre: 'Matériaux et CFAO', valeur: r.materiaux, etape: 'savoir-faire' as const },
    { titre: 'Délais', valeur: completee?.delais ? `${Object.keys(completee.delais).length} types de pièces` : null, etape: 'delais' as const },
    { titre: 'Zone desservie', valeur: r.zone, etape: 'delais' as const },
  ]
  const plusTard = missions.filter((m) => ['realisations', 'ansm', 'presentation'].includes(m.cle) && !m.faite)
  return (
    <CoquilleOnboardingLabo espace={espace}>
      <h1 className={titre}>Voici ce que verront les cabinets</h1>
      <p className="mt-2 text-sm text-fg-2">Vérifiez l’aperçu, puis publiez. Réalisations, déclaration ANSM et présentation se complètent ensuite depuis votre espace.</p>
      <div className="mt-6 flex items-center gap-4">
        <Anneau pct={force.total} taille={72} legende={LIBELLE_PALIER[palier]} />
        <p className="text-sm text-fg-2">
          Fiche {LIBELLE_PALIER[palier].toLowerCase()} : les cabinets vous trouvent par technique, matériau et zone.
          {plusTard.length > 0 && ` ${plusTard.length === 1 ? 'Une mission vous attend' : `${plusTard.length} missions vous attendent`} dans votre espace.`}
        </p>
      </div>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {reponses.map((x) => (
          <li key={x.titre} className="flex items-center gap-3 py-3">
            <CircleCheck className={`size-5 shrink-0 ${x.valeur ? 'text-teal' : 'text-fg-2/50'}`} aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-fg">{x.titre}</span>
              <span className="block truncate text-xs text-fg-2">{x.valeur ?? 'Passé : à compléter depuis votre espace'}</span>
            </span>
            <Link href={chemin(versEtapeLabo(x.etape, fiche.slug))} className="text-sm font-medium text-fg underline underline-offset-4 hover:no-underline">
              {x.valeur ? 'Modifier' : 'Compléter'}
            </Link>
          </li>
        ))}
        {plusTard.map((m) => (
          <li key={m.cle} className="flex items-center gap-3 py-3">
            <Sparkles className="size-5 shrink-0 text-amber-600" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-fg">{m.titre}</span>
              <span className="block text-xs text-fg-2">Mission dans votre espace · +{m.gain} %</span>
            </span>
            <span className="text-sm text-fg-2">Plus tard</span>
          </li>
        ))}
      </ul>
      {!verifiee && (
        <Encart titre="Votre Kbis est en cours d’examen" className="mt-5">
          La fiche est prête : elle sera publiée dès que l’examen aboutit, sans rien refaire.
        </Encart>
      )}
      <form action={publierFiche} className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1">
        <input type="hidden" name="fiche" value={fiche.slug} />
        {/* Deux sorties pour la même publication : le tableau de bord, ou la présentation tout de suite. */}
        <button type="submit" name="suite" value={`/espace-pro/?fiche=${encodeURIComponent(fiche.slug)}&publiee=1`} className={`${principal} sm:w-auto sm:px-8`}>
          {verifiee ? 'Publier la fiche' : 'Terminer'}
          <ArrowRight className="size-4" aria-hidden />
        </button>
        <button type="submit" name="suite" value={`/espace-pro/missions/presentation/?fiche=${encodeURIComponent(fiche.slug)}`} className={`${discret} cursor-pointer sm:w-auto`}>
          Ajouter une présentation
        </button>
      </form>
    </CoquilleOnboardingLabo>
  )
}
