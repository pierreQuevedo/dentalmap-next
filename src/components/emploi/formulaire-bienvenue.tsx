'use client'

import { useActionState, useTransition, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { enregistrerBienvenue, type EtatProfil } from '@/lib/emploi/actions-candidat'
import {
  QUALIFICATIONS,
  SITUATIONS,
  VISIBILITES,
  libelleChoixQualification,
  type Criteres,
  type Formation,
  type Situation,
  type Visibilite,
} from '@/lib/emploi/profil-candidat'
import { ChampsFormation, ChampsRecherche } from './champs-candidat'
import { EncartChoix, ICONES_QUALIFICATION, ICONES_SITUATION, ICONES_VISIBILITE } from './encart-choix'

type Props = {
  etape: 'situation' | 'recherche' | 'qualification' | 'formation' | 'visibilite' | 'pret'
  retour: string | null
  /** L'étape d'avant, pour revenir sans perdre sa place ; absente à la première. */
  precedente?: string | null
  situation: Situation | null
  qualification: string | null
  criteres: Criteres
  formation: Formation | null
  visibilite: Visibilite
  ecoles: { slug: string; nom: string }[]
  /** SE5 : le récapitulatif, rendu côté serveur. */
  children?: ReactNode
}


/** Une étape du parcours de bienvenue candidat (SE1 à SE5). */
export function FormulaireBienvenue(p: Props) {
  const [etat, action, enCours] = useActionState<EtatProfil, FormData>(enregistrerBienvenue, null)
  const [, demarrer] = useTransition()
  const invalide = (k: string) => etat?.champ === k
  return (
    <form
      // Envoi à la main : sur une erreur, la saisie reste en place au lieu de revenir aux valeurs de départ.
      onSubmit={(e) => {
        e.preventDefault()
        const donnees = new FormData(e.currentTarget)
        const bouton = (e.nativeEvent as SubmitEvent).submitter
        if (bouton instanceof HTMLButtonElement && bouton.name) donnees.set(bouton.name, bouton.value)
        demarrer(() => action(donnees))
      }}
      className="space-y-5"
    >
      <input type="hidden" name="etape" value={p.etape} />
      {p.retour && <input type="hidden" name="retour" value={p.retour} />}

      {p.etape === 'situation' && (
        <fieldset className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <legend className="sr-only">Votre situation</legend>
          {SITUATIONS.map((s) => (
            <EncartChoix key={s.cle} nom="situation" valeur={s.cle} coche={p.situation === s.cle} icone={ICONES_SITUATION[s.cle]} libelle={s.libelle} detail={s.detail} />
          ))}
        </fieldset>
      )}

      {p.etape === 'recherche' && <ChampsRecherche c={p.criteres} invalide={invalide} etudiant={p.situation === 'etudiant'} />}

      {p.etape === 'qualification' && p.situation && (
        <>
          <fieldset className="grid gap-3 sm:grid-cols-3">
            <legend className="sr-only">Votre qualification</legend>
            {QUALIFICATIONS.map((q) => (
              <EncartChoix key={q} nom="qualification" valeur={q} coche={(p.qualification ?? 'titre') === q} icone={ICONES_QUALIFICATION[q]} libelle={libelleChoixQualification(p.situation!, q)} />
            ))}
          </fieldset>
          <p className="squircle-xl flex items-start justify-between gap-3 bg-bg-soft px-4 py-3 text-xs text-fg-2">
            <span>Vérification automatique du titre et badge « Titre vérifié » : le document sera vérifié puis supprimé, jamais conservé.</span>
            <span className="squircle-full shrink-0 bg-bg px-2 py-0.5 font-semibold text-fg-2 ring-1 ring-line">Bientôt</span>
          </p>
        </>
      )}

      {p.etape === 'formation' && (
        <>
          <ChampsFormation f={p.formation} ecoles={p.ecoles} />
          <p className="squircle-xl flex items-start justify-between gap-3 bg-bg-soft px-4 py-3 text-xs text-fg-2">
            <span>Certificat de scolarité vérifié automatiquement, puis supprimé.</span>
            <span className="squircle-full shrink-0 bg-bg px-2 py-0.5 font-semibold text-fg-2 ring-1 ring-line">Bientôt</span>
          </p>
        </>
      )}

      {p.etape === 'visibilite' && (
        <>
          <fieldset className="grid gap-3 sm:grid-cols-3">
            <legend className="sr-only">Visibilité du profil</legend>
            {VISIBILITES.map((v) => (
              <EncartChoix key={v.cle} nom="visibilite" valeur={v.cle} coche={p.visibilite === v.cle} icone={ICONES_VISIBILITE[v.cle]} libelle={v.libelle} detail={v.detail} />
            ))}
          </fieldset>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-fg">
            <input type="checkbox" name="alertes" value="oui" defaultChecked className="mt-0.5 size-4 accent-teal" />
            <span>
              Recevoir par email les nouvelles offres qui correspondent à ma recherche
              <span className="block text-xs text-fg-2">Un email par semaine au plus, seulement s’il y a du nouveau. Vous pouvez l’arrêter à tout moment.</span>
            </span>
          </label>
          <p className="text-xs text-fg-2">Vos coordonnées ne sont transmises qu’au recruteur de l’offre à laquelle vous postulez. Vous pourrez aussi masquer une structure, votre employeur actuel par exemple.</p>
        </>
      )}

      {p.children}

      {etat?.erreur && <p className="squircle-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">{etat.erreur}</p>}
      {/* Sur téléphone, l'action principale d'abord et en pleine largeur, « Retour » en dernier. */}
      <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end [&>*]:justify-center">
        {p.precedente && (
          <Link href={chemin(p.precedente)} className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-fg-2 hover:text-fg sm:mr-auto">
            <ArrowLeft className="size-4" aria-hidden /> Retour
          </Link>
        )}
        {p.etape === 'pret' ? (
          <>
            <button type="submit" name="suite" value="profil" disabled={enCours} className="inline-flex h-11 cursor-pointer items-center rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong disabled:opacity-60">
              Compléter mon profil
            </button>
            <button type="submit" name="suite" value="offres" disabled={enCours} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
              {enCours && <Loader2 className="size-4 animate-spin" aria-hidden />} {p.retour ? 'Revenir à l’offre' : 'Voir les offres'} <ArrowRight className="size-4" aria-hidden />
            </button>
          </>
        ) : (
          <button type="submit" disabled={enCours} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover disabled:opacity-60">
            {enCours && <Loader2 className="size-4 animate-spin" aria-hidden />} Continuer <ArrowRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </form>
  )
}
