import Link from 'next/link'
import { CheckCircle2, LogIn, X } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { getMaCandidature } from '@/lib/emploi/candidatures-donnees'
import { getProfilCandidat } from '@/lib/emploi/candidat-donnees'
import { libelleQualification, mobilite } from '@/lib/emploi/profil-candidat'
import { cheminOffre, cheminPostuler } from '@/lib/emploi/chemins'
import type { OffreDetail } from '@/lib/emploi/types'
import { getCompte } from '@/lib/tunnel/compte'
import { FormulairePostuler } from './formulaire-postuler'

/**
 * Le tiroir « Postuler » (OUV-C-POSTULER), ouvert par `?postuler=1` sur la
 * page de l'offre. Un compte connecté suffit, quel qu'il soit, sans palier.
 * `?postuler=envoyee` : la confirmation (OUV-C-ENVOYEE).
 */
export async function TiroirPostuler({ o, etat }: { o: OffreDetail; etat: string | undefined }) {
  if (etat !== '1' && etat !== 'envoyee') return null
  const compte = await getCompte()
  const [deja, profil] = compte ? await Promise.all([getMaCandidature(compte.id, o.id), getProfilCandidat(compte.id)]) : [null, null]
  const fermer = cheminOffre(o.slug)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <Link href={chemin(fermer)} scroll={false} aria-label="Fermer" className="absolute inset-0 bg-[#0e1317]/50 backdrop-blur-[2px]" />
      <div role="dialog" aria-modal="true" aria-label="Postuler" className="relative flex h-full w-full max-w-lg flex-col bg-bg shadow-pop">
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-2">
              {o.recruteur} · {o.commune}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-fg">Postuler</h2>
            <p className="mt-1 truncate text-sm text-fg-2">{o.titre}</p>
          </div>
          <Link href={chemin(fermer)} scroll={false} aria-label="Fermer" className="grid size-9 shrink-0 place-items-center rounded-full text-fg-2 hover:bg-bg-soft hover:text-fg">
            <X className="size-5" aria-hidden />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!compte ? (
            <div className="space-y-4">
              <p className="text-sm text-fg">Pour postuler, connectez-vous ou créez votre compte DentalMap, en une minute.</p>
              <Link
                href={chemin(`/connexion/?retour=${encodeURIComponent(cheminPostuler(o.slug))}`)}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground hover:bg-action-hover"
              >
                <LogIn className="size-4" aria-hidden /> Se connecter ou créer un compte
              </Link>
              <p className="text-xs text-fg-2">Vous revenez ici ensuite, votre candidature prête à écrire.</p>
            </div>
          ) : deja ? (
            <div className="flex flex-col items-start gap-4">
              <span className="grid size-12 place-items-center rounded-full bg-teal/10 text-teal">
                <CheckCircle2 className="size-6" aria-hidden />
              </span>
              <div>
                <p className="text-lg font-semibold text-fg">{etat === 'envoyee' ? 'Candidature envoyée' : 'Vous avez déjà postulé'}</p>
                <p className="mt-1 text-sm text-fg-2">
                  {etat === 'envoyee' ? 'Le recruteur est prévenu par email.' : `Le ${deja.creeLe.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}.`} Vous suivez sa réponse dans vos candidatures, et
                  recevez un email s’il vous propose un échange.
                </p>
              </div>
              <Link href={chemin('/espace-pro/emploi/mes-candidatures/')} className="inline-flex h-11 items-center rounded-full bg-fg px-5 text-sm font-semibold text-bg">
                Voir mes candidatures
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {!profil && (
                <div className="squircle-xl border border-teal/30 bg-teal/[0.06] p-4 text-sm">
                  <p className="font-semibold text-fg">Ajoutez votre profil candidat</p>
                  <p className="mt-1 text-fg-2">Une minute : il accompagne votre candidature, et vous recevez les offres qui vous correspondent. Facultatif.</p>
                  <Link
                    href={chemin(`/espace-pro/emploi/bienvenue/situation/?retour=${encodeURIComponent(cheminPostuler(o.slug))}`)}
                    className="mt-3 inline-flex h-9 items-center rounded-full bg-fg px-4 text-xs font-semibold text-bg"
                  >
                    Créer mon profil
                  </Link>
                </div>
              )}
              <FormulairePostuler
                slug={o.slug}
                profil={profil ? [libelleQualification(profil), profil.experiences.length ? `${profil.experiences.length} expérience${profil.experiences.length > 1 ? 's' : ''}` : null, profil.criteres.disponibilite, mobilite(profil.criteres)].filter(Boolean).join(' · ') : null}
                cvProfil={profil?.cv?.nom ?? null}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
