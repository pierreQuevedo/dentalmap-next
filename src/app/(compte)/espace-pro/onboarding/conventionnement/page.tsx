import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CarteOption, Encart, Etapes, Puce, discret, principal, titre } from '@/components/compte/ui'
import { chemin } from '@/lib/navigation'
import { SaisieEnDirect } from '@/components/espace/bandeau-force'
import { AnnonceChoix } from '@/components/espace/valeur-en-direct'
import { enregistrerConventionnement } from '@/lib/espace-pro/actions-fiche'
import { SECTEURS, TIERS_PAYANT_COURT } from '@/lib/espace-pro/fiche-completee'
import { Euro } from 'lucide-react'
import { CoquilleOnboarding, Gain, chargerOnboarding, etapeSuivante, gainRestant, versEtape } from '../_commun'

export const metadata: Metadata = { title: 'Conventionnement et paiement', robots: { index: false, follow: false } }
export const instant = false

/** B2 : secteur et tiers payant, deux choix uniques, tous deux requis pour les dix points. */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; erreur?: string; suite?: string }> }) {
  const sp = await props.searchParams
  const espace = await chargerOnboarding('conventionnement', sp.fiche)
  const { fiche, completee } = espace
  const gain = gainRestant(espace, ['conventionnement'])
  return (
    <CoquilleOnboarding espace={espace} enCours="conventionnement">
      <Etapes etape={3} libelle="Conventionnement" />
      <h1 className={titre}>Conventionnement et paiement</h1>
      <p className="mt-2 text-sm text-fg-2">Deux filtres très utilisés par les patients.</p>
      <Gain points={gain} texte="filtres « Secteur 1 » et « Tiers payant »" />
      {sp.erreur && <Encart ton="erreur" className="mt-4">{sp.erreur}</Encart>}
      <form action={enregistrerConventionnement} className="mt-6">
        <input type="hidden" name="fiche" value={fiche.slug} />
        <input type="hidden" name="suite" value={sp.suite?.startsWith('/espace-pro/') ? sp.suite : etapeSuivante('conventionnement', fiche.slug)} />
        <input type="hidden" name="ici" value={versEtape('conventionnement', fiche.slug)} />
        {/* Secteur et tiers payant valent 5 points chacun ; l'aperçu les résume comme la carte publique. */}
        <SaisieEnDirect
          regles={[
            { champ: 'secteur', min: 1, points: completee?.secteur ? 0 : 5 },
            { champ: 'tiersPayant', min: 1, points: completee?.tiersPayant ? 0 : 5 },
          ]}
        />
        <AnnonceChoix
          cle="conventionnement"
          groupes={[
            { champ: 'secteur', libelles: Object.fromEntries(SECTEURS.map((s) => [s.code, s.libelle])) },
            { champ: 'tiersPayant', libelles: { securite_sociale_et_mutuelle: 'tiers payant', securite_sociale: 'tiers payant partiel', aucun: 'sans tiers payant' } },
          ]}
        />
        <fieldset>
          <legend className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Secteur</legend>
          <div className="grid gap-2.5">
            {SECTEURS.map((s, i) => (
              <CarteOption key={s.code} name="secteur" value={s.code} titre={s.libelle} detail={s.detail} icone={Euro} required={i === 0} defaultChecked={(completee?.secteur ?? 'secteur_1') === s.code} />
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-2">Tiers payant</legend>
          <div className="flex flex-wrap gap-2">
            {TIERS_PAYANT_COURT.map((t) => (
              <Puce key={t.code} name="tiersPayant" value={t.code} defaultChecked={(completee?.tiersPayant ?? 'securite_sociale_et_mutuelle') === t.code}>
                {t.libelle}
              </Puce>
            ))}
          </div>
        </fieldset>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1">
          <button type="submit" className={`${principal} sm:w-auto sm:px-8`}>
            Valider{gain > 0 ? ` · +${gain} %` : ''}
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <Link href={chemin(etapeSuivante('conventionnement', fiche.slug))} className={`${discret} sm:w-auto`}>
            Passer cette étape
          </Link>
        </div>
      </form>
    </CoquilleOnboarding>
  )
}
