import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import { Encart, Etapes, Puce, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { SaisieEnDirect } from '@/components/espace/bandeau-force'
import { AnnonceChoix } from '@/components/espace/valeur-en-direct'
import { ChoixLibres } from '@/components/espace/choix-libres'
import { enregistrerSoins } from '@/lib/espace-pro/actions-fiche'
import { orientationsDe } from '@/lib/espace-pro/fiche-completee'
import { lireSaisie } from '@/lib/espace-pro/saisie'
import { CoquilleOnboarding, chargerOnboarding, etapeSuivante, gainRestant, versEtape } from '../_commun'

export const metadata: Metadata = { title: 'Quelle est votre spécialité ?', robots: { index: false, follow: false } }
export const instant = false

/**
 * B0S : la qualification lue au registre, verrouillée, puis les domaines
 * d'exercice déclarés, sans limite, affichés « renseigné par le
 * praticien ». Remplace, dans l'onboarding, la mission « Domaines de soins »,
 * qui reste au tableau de bord pour y revenir. Aucun gain affiché : le poids
 * de l'étape n'est pas arbitré, le barème reste celui de la mission.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; suite?: string }> }) {
  const sp = await props.searchParams
  const espace = await chargerOnboarding('specialite', sp.fiche)
  const { fiche, completee } = espace
  const gardee = await lireSaisie('/espace-pro/onboarding/specialite/', sp.erreur)
  const choisis = new Set(gardee.liste('orientation') ?? completee?.orientations ?? [])
  const suite = sp.suite?.startsWith('/espace-pro/') ? sp.suite : etapeSuivante('specialite', fiche.slug)
  const qualification = fiche.specialite ?? (fiche.profession === 'dentiste' ? 'Chirurgien-dentiste, omnipratique' : null)
  return (
    <CoquilleOnboarding espace={espace} enCours="soins">
      <Etapes etape={1} libelle="Spécialité" />
      <h1 className={titre}>Quelle est votre spécialité ?</h1>
      <p className="mt-2 text-sm text-fg-2">La qualification vient du registre. Ajoutez les domaines dans lesquels vous exercez : les patients filtrent par domaine de soins.</p>
      <span className="mt-3 inline-block rounded-full bg-teal/15 px-2.5 py-0.5 text-[11px] font-medium text-teal">Ouvre le filtre « Domaine de soins »</span>
      {sp.erreur && <Encart ton="erreur" className="mt-4">{sp.erreur}</Encart>}
      {qualification && (
        <>
          <div className="squircle-xl mt-6 flex items-center gap-3 bg-bg-soft px-4 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-fg-2">Qualification au registre</p>
              <p className="text-sm font-medium text-fg">{qualification}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-bg px-2.5 py-1 text-[11px] text-fg-2">
              <Lock className="size-3" aria-hidden /> Annuaire Santé
            </span>
          </div>
          <p className="mt-2 text-xs text-fg-2">Spécialistes qualifiés (orthopédie dento-faciale, chirurgie orale, médecine bucco-dentaire) : repris automatiquement du registre.</p>
        </>
      )}
      <form action={enregistrerSoins} className="mt-6">
        <input type="hidden" name="fiche" value={fiche.slug} />
        <input type="hidden" name="profession" value={fiche.profession} />
        <input type="hidden" name="suite" value={suite} />
        <input type="hidden" name="ici" value={versEtape('specialite', fiche.slug)} />
        {/* L'aperçu et le taux suivent la saisie : deux domaines rapportent les points. */}
        <SaisieEnDirect regles={[{ champ: 'orientation', min: 2, points: gainRestant(espace, ['soins']) }]} />
        <AnnonceChoix cle="soins" groupes={[{ champ: 'orientation', libelles: Object.fromEntries(orientationsDe(fiche.profession).map((o) => [o.code, o.court])) }]} />
        <fieldset>
          <legend className="text-sm font-medium text-fg">Vos domaines d’exercice</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {orientationsDe(fiche.profession).map((o) => (
              <Puce key={o.code} name="orientation" value={o.code} multiple defaultChecked={choisis.has(o.code)}>
                {o.court}
              </Puce>
            ))}
            <ChoixLibres name="orientation" initiaux={[...choisis]} ajout="Domaine non listé" exemple="Dentisterie du sport" />
          </div>
        </fieldset>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1">
          <button type="submit" className={`${principal} sm:w-auto sm:px-8`}>
            Continuer
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <Link href={chemin(etapeSuivante('specialite', fiche.slug))} className={`${discret} sm:w-auto`}>
            Passer cette étape
          </Link>
        </div>
      </form>
    </CoquilleOnboarding>
  )
}
