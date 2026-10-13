import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CircleCheck, Sparkles } from 'lucide-react'
import { Encart, discret, principal, titre } from '@/components/compte/ui'
import { Anneau } from '@/components/espace/apercu'
import { chemin } from '@/lib/navigation'
import { publierFiche } from '@/lib/espace-pro/actions-fiche'
import { LIBELLE_PALIER } from '@/lib/espace-pro/force'
import { resumeAccueil, resumeConventionnement, resumeSemaine } from '@/lib/espace-pro/resumes'
import { CoquilleOnboarding, chargerOnboarding, versEtape } from '../_commun'

export const metadata: Metadata = { title: 'Voici ce que verront les patients', robots: { index: false, follow: false } }
export const instant = false

/**
 * B7 : le récapitulatif avant publication. Les trois réponses, chacune
 * modifiable ; photo, présentation et soins annoncés comme missions. La
 * publication est immédiate, sauf si la revendication attend encore la
 * vérification : la fiche est alors prête, et publiée dès l'accord.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const espace = await chargerOnboarding('recapitulatif', (await props.searchParams).fiche)
  const { fiche, completee, force, palier, missions } = espace
  const verifiee = espace.ctx.identiteVerifiee
  const reponses = [
    { titre: 'Horaires', valeur: resumeSemaine(completee), etape: 'horaires' as const },
    { titre: 'Conventionnement', valeur: resumeConventionnement(completee), etape: 'conventionnement' as const },
    { titre: 'Accueil', valeur: resumeAccueil(completee), etape: 'accueil' as const },
  ]
  const plusTard = missions.filter((m) => ['photo', 'presentation', 'soins'].includes(m.cle) && !m.faite)

  return (
    <CoquilleOnboarding espace={espace}>
      <h1 className={titre}>Voici ce que verront les patients</h1>
      <p className="mt-2 text-sm text-fg-2">Vérifiez l’aperçu, puis publiez. Photo, présentation et domaines de soins se complètent ensuite depuis votre espace, à votre rythme.</p>
      <div className="mt-6 flex items-center gap-4">
        <Anneau pct={force.total} taille={72} legende={LIBELLE_PALIER[palier]} />
        <p className="text-sm text-fg-2">
          Fiche {LIBELLE_PALIER[palier].toLowerCase()} : les patients vous trouvent par horaires, secteur et accueil.
          {plusTard.length > 0 && ` ${plusTard.length === 1 ? 'Une mission vous attend' : `${plusTard.length} missions vous attendent`} dans votre espace pour aller plus loin.`}
        </p>
      </div>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {reponses.map((r) => (
          <li key={r.titre} className="flex items-center gap-3 py-3">
            <CircleCheck className={`size-5 shrink-0 ${r.valeur ? 'text-teal' : 'text-fg-2/50'}`} aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-fg">{r.titre}</span>
              <span className="block text-xs text-fg-2">{r.valeur ?? 'Passé : à compléter depuis votre espace'}</span>
            </span>
            <Link href={chemin(versEtape(r.etape, fiche.slug))} className="text-sm font-medium text-fg underline underline-offset-4 hover:no-underline">
              {r.valeur ? 'Modifier' : 'Compléter'}
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
        <Encart titre="Votre identité est en cours de vérification" className="mt-5">
          La fiche est prête : elle sera publiée dès que la vérification aboutit, sans rien refaire.
        </Encart>
      )}
      <form action={publierFiche} className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1">
        <input type="hidden" name="fiche" value={fiche.slug} />
        <input type="hidden" name="suite" value={`/espace-pro/?fiche=${encodeURIComponent(fiche.slug)}&publiee=1`} />
        <button type="submit" className={`${principal} sm:w-auto sm:px-8`}>
          {verifiee ? 'Publier ma fiche' : 'Terminer'}
          <ArrowRight className="size-4" aria-hidden />
        </button>
        <Link href={chemin(versEtape('recuperation', fiche.slug))} className={`${discret} sm:w-auto`}>
          Modifier une réponse
        </Link>
      </form>
    </CoquilleOnboarding>
  )
}
