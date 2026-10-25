import type { Metadata } from 'next'
import { lireSaisie } from '@/lib/espace-pro/saisie'
import { schemaHoraires } from '@/lib/espace-pro/fiche-completee'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Encart, Etapes, discret, principal, titre } from '@/components/compte/ui'
import { SaisieHoraires } from '@/components/espace/saisie-horaires'
import { SaisieEnDirect } from '@/components/espace/bandeau-force'
import { chemin } from '@/lib/navigation'
import { enregistrerHoraires } from '@/lib/espace-pro/actions-fiche'
import { CoquilleOnboarding, Gain, chargerOnboarding, etapeSuivante, gainRestant, versEtape } from '../_commun'

export const metadata: Metadata = { title: 'Quand êtes-vous ouvert ?', robots: { index: false, follow: false } }
export const instant = false

/** B1 : les horaires de la semaine. Au moins un jour ouvert, créneaux sans chevauchement, pause facultative. */
/** Les horaires tapés avant l'erreur, s'ils se relisent ; la dernière version enregistrée sinon. */
function lireHoraires(json: string | undefined) {
  if (!json) return null
  try {
    const r = schemaHoraires.safeParse(JSON.parse(json))
    return r.success ? r.data : null
  } catch {
    return null
  }
}

export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; suite?: string }> }) {
  const sp = await props.searchParams
  const espace = await chargerOnboarding('horaires', sp.fiche)
  const { fiche, completee } = espace
  const gardee = await lireSaisie('/espace-pro/onboarding/horaires/', sp.erreur)
  const horairesGardes = lireHoraires(gardee.texte('horaires'))
  const gain = gainRestant(espace, ['horaires'])
  // Depuis le tableau de bord, on y revient après validation ; sinon, étape suivante.
  const suite = sp.suite?.startsWith('/espace-pro/') ? sp.suite : etapeSuivante('horaires', fiche.slug)
  return (
    <CoquilleOnboarding espace={espace} enCours="horaires">
      <Etapes etape={2} libelle="Horaires" />
      <h1 className={titre}>Quand êtes-vous ouvert ?</h1>
      <p className="mt-2 text-sm text-fg-2">Les patients filtrent par « Ouvert maintenant » : sans horaires, votre fiche n’y apparaît pas.</p>
      <Gain points={gain} texte="présence dans « Ouvert maintenant »" />
      {sp.erreur && <Encart ton="erreur" className="mt-4">{sp.erreur}</Encart>}
      <form action={enregistrerHoraires} className="mt-6">
        <input type="hidden" name="fiche" value={fiche.slug} />
        <input type="hidden" name="suite" value={suite} />
        <input type="hidden" name="ici" value={versEtape('horaires', fiche.slug)} />
        <SaisieEnDirect regles={[{ champ: 'horaires_ouverts', min: 1, points: gain }]} />
        <SaisieHoraires initiales={horairesGardes ?? completee?.horaires ?? null} />
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1">
          <button type="submit" className={`${principal} sm:w-auto sm:px-8`}>
            Valider{gain > 0 ? ` · +${gain} %` : ''}
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <Link href={chemin(etapeSuivante('horaires', fiche.slug))} className={`${discret} sm:w-auto`}>
            Passer cette étape
          </Link>
        </div>
      </form>
    </CoquilleOnboarding>
  )
}
