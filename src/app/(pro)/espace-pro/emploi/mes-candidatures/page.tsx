import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink, FileText, Send } from 'lucide-react'
import { CoqueEspace } from '@/components/espace/coque'
import { OngletsEmploi, SousOngletsCandidat } from '@/components/emploi/espace-offres'
import { Frise, PHRASE_ETAT } from '@/components/emploi/frise-candidature'
import { chemin } from '@/lib/navigation'
import { getCandidaturesEnvoyees } from '@/lib/emploi/candidatures-donnees'
import { getProfilCandidat } from '@/lib/emploi/candidat-donnees'
import { cheminOffre } from '@/lib/emploi/chemins'
import { chargerEmploi } from '../../_commun'

export const metadata: Metadata = { title: 'Mes candidatures', robots: { index: false, follow: false } }
export const instant = false

/**
 * CAND-CANDID, dans l'espace pro : les candidatures envoyées par le compte,
 * quel que soit son profil (dentiste, laboratoire…), troisième onglet de
 * l'Emploi. Le recruteur a reçu les coordonnées avec la candidature et
 * contacte la personne directement ; ici, l'état de chacune.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const sp = await props.searchParams
  const { compte, coque, q, espace } = await chargerEmploi('mes-candidatures', sp.fiche)
  const [candidatures, profil] = await Promise.all([getCandidaturesEnvoyees(compte.id), getProfilCandidat(compte.id)])

  return (
    <CoqueEspace
      c={coque}
      actif="emploi"
      titre="Emploi"
      sousTitre={candidatures.length === 0 ? 'Les offres auxquelles vous postulez, avec la réponse des recruteurs' : `${candidatures.length} candidature${candidatures.length > 1 ? 's' : ''} envoyée${candidatures.length > 1 ? 's' : ''}`}
    >
      <OngletsEmploi actif="mes" q={q} sansFiche={!espace} />
      <SousOngletsCandidat actif="candidatures" q={q} />
      {!profil?.termine && (
        <div className="squircle-2xl mb-4 flex flex-wrap items-center justify-between gap-4 border border-teal/30 bg-teal/[0.06] p-5">
          <p className="text-sm text-fg">
            <span className="block font-semibold">Complétez votre profil</span>
            <span className="text-fg-2">Une minute : situation, recherche, qualification. Il accompagne chacune de vos candidatures.</span>
          </p>
          <Link href={chemin(`/espace-pro/emploi/bienvenue/situation/${q}`)} className="inline-flex h-10 items-center rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
            Compléter mon profil
          </Link>
        </div>
      )}

      {candidatures.length === 0 ? (
        <div className="squircle-2xl flex flex-col items-start gap-4 border border-dashed border-line bg-bg p-8">
          <span className="grid size-12 place-items-center rounded-full bg-bg-soft text-teal">
            <Send className="size-5" aria-hidden />
          </span>
          <p className="max-w-xl text-sm text-fg-2">Sur la page d’une offre, le bouton « Postuler » envoie votre message et, si vous le souhaitez, votre CV.</p>
          <Link href={chemin(`/espace-pro/emploi/recherche/${q}`)} className="inline-flex h-11 items-center rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
            Rechercher un poste
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {candidatures.map((k) => {
            return (
              <li key={k.id} className="squircle-2xl border border-line bg-bg p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-fg-2">
                      {k.offre.recruteur}
                      {k.offre.commune ? ` · ${k.offre.commune}` : ''} · envoyée le {k.creeLe.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </p>
                    <p className="mt-1 font-semibold text-fg">{k.offre.titre}</p>
                  </div>
                </div>

                {/* Où en est la candidature : la frise, puis ce que l'état veut dire. */}
                <div className="mt-4 max-w-xl">
                  <Frise statut={k.statut} type={k.offre.laboratoire ? 'laboratoire' : 'cabinet'} />
                </div>
                <p className="mt-3 text-sm text-fg-2">{PHRASE_ETAT[k.statut]}</p>

                {(k.offre.enLigne || k.cvNom) && (
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {k.offre.enLigne && (
                      <Link href={chemin(cheminOffre(k.offre.slug))} className="inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg">
                        <ExternalLink className="size-4" aria-hidden /> Revoir l’offre
                      </Link>
                    )}
                    {k.cvNom && (
                      <a href={`/espace-pro/emploi/candidatures/${k.id}/cv/`} target="_blank" rel="noopener" className="inline-flex min-w-0 items-center gap-1 text-sm text-fg-2 hover:text-fg">
                        <FileText className="size-4 shrink-0" aria-hidden /> <span className="truncate">Mon CV · {k.cvNom}</span>
                      </a>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </CoqueEspace>
  )
}
