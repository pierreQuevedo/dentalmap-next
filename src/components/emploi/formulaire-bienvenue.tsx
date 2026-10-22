'use client'

import { useActionState, useTransition, type ReactNode } from 'react'
import { ArrowRight, CalendarDays, FlaskConical, GraduationCap, HeartHandshake, Loader2, Microscope, SprayCan, Stethoscope, type LucideIcon } from 'lucide-react'
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

type Props = {
  etape: 'situation' | 'recherche' | 'qualification' | 'formation' | 'visibilite' | 'pret'
  retour: string | null
  situation: Situation | null
  qualification: string | null
  criteres: Criteres
  formation: Formation | null
  visibilite: Visibilite
  ecoles: { slug: string; nom: string }[]
  /** SE5 : le récapitulatif, rendu côté serveur. */
  children?: ReactNode
}

const carte = 'squircle-xl flex cursor-pointer items-start gap-3 border border-line p-4 has-[:checked]:border-teal has-[:checked]:bg-teal/[0.06]'

/** Un encart par situation, en grille sur toute la largeur : l'icône, le libellé, le détail. */
const ICONES_SITUATION: Record<string, LucideIcon> = { assistant: HeartHandshake, assistant_specialise: Microscope, secretaire: CalendarDays, prothesiste: FlaskConical, aide: SprayCan, dentiste: Stethoscope, etudiant: GraduationCap }
const encart =
  'squircle-2xl relative flex cursor-pointer flex-col gap-3 border border-line bg-bg p-5 transition-colors hover:border-line-strong has-[:checked]:border-teal has-[:checked]:bg-teal/[0.06] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-action'

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
          {SITUATIONS.map((s) => {
            const Icone = ICONES_SITUATION[s.cle]
            return (
              <label key={s.cle} className={`group ${encart}`}>
                <input type="radio" name="situation" value={s.cle} defaultChecked={p.situation === s.cle} className="peer sr-only" />
                <span className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-bg-soft text-fg-2 group-has-[:checked]:bg-teal/15 group-has-[:checked]:text-teal">
                    <Icone className="size-5" aria-hidden />
                  </span>
                  <span aria-hidden className="size-5 rounded-full border border-line-strong bg-bg transition-[border-width,border-color] group-has-[:checked]:border-[6px] group-has-[:checked]:border-teal" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-fg">{s.libelle}</span>
                  <span className="mt-0.5 block text-xs text-fg-2">{s.detail}</span>
                </span>
              </label>
            )
          })}
        </fieldset>
      )}

      {p.etape === 'recherche' && <ChampsRecherche c={p.criteres} invalide={invalide} etudiant={p.situation === 'etudiant'} />}

      {p.etape === 'qualification' && p.situation && (
        <>
          <fieldset className="grid gap-2">
            {QUALIFICATIONS.map((q) => (
              <label key={q} className={carte}>
                <input type="radio" name="qualification" value={q} defaultChecked={(p.qualification ?? 'titre') === q} className="mt-1 size-4 accent-teal" />
                <span className="text-sm font-semibold text-fg">{libelleChoixQualification(p.situation!, q)}</span>
              </label>
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
          <fieldset className="grid gap-2">
            {VISIBILITES.map((v) => (
              <label key={v.cle} className={carte}>
                <input type="radio" name="visibilite" value={v.cle} defaultChecked={p.visibilite === v.cle} className="mt-1 size-4 accent-teal" />
                <span>
                  <span className="block text-sm font-semibold text-fg">{v.libelle}</span>
                  <span className="block text-xs text-fg-2">{v.detail}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-fg">
            <input type="checkbox" name="alertes" value="oui" defaultChecked className="mt-0.5 size-4 accent-teal" />
            <span>
              Recevoir par email les nouvelles offres qui correspondent à ma recherche
              <span className="block text-xs text-fg-2">Un email par semaine au plus, seulement s’il y a du nouveau. Vous pouvez l’arrêter à tout moment.</span>
            </span>
          </label>
          <p className="text-xs text-fg-2">Vos coordonnées ne sont jamais transmises sans votre accord. Vous pourrez aussi masquer une structure, votre employeur actuel par exemple.</p>
        </>
      )}

      {p.children}

      {etat?.erreur && <p className="squircle-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">{etat.erreur}</p>}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-5">
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
