import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarClock, Check, ExternalLink, FileText, Phone, Send } from 'lucide-react'
import { CoqueEspace } from '@/components/espace/coque'
import { OngletsEmploi, SousOngletsCandidat } from '@/components/emploi/espace-offres'
import { ReponseEchange } from '@/components/emploi/reponse-echange'
import { chemin } from '@/lib/navigation'
import { STATUT_CANDIDAT, STATUT_RECRUTEUR, libelleCreneau } from '@/lib/emploi/candidature'
import { getCandidaturesEnvoyees } from '@/lib/emploi/candidatures-donnees'
import { getProfilCandidat } from '@/lib/emploi/candidat-donnees'
import { cheminOffre } from '@/lib/emploi/chemins'
import { chargerEmploi } from '../../_commun'

export const metadata: Metadata = { title: 'Mes candidatures', robots: { index: false, follow: false } }
export const instant = false

const MESSAGES: Record<string, string> = {
  accepte: 'Échange accepté : le recruteur a reçu vos coordonnées, et vous trouvez les siennes ci-dessous.',
  refuse: 'Proposition déclinée. Rien n’a été transmis au recruteur.',
}

/**
 * CAND-CANDID, dans l'espace pro : les candidatures envoyées par le compte,
 * quel que soit son profil (dentiste, laboratoire…), troisième onglet de
 * l'Emploi. Une proposition d'échange en attente passe en tête : choisir un
 * créneau et accepter partage les coordonnées des deux côtés ; décliner ne
 * transmet rien.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; fait?: string }> }) {
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
            <span className="block font-semibold">Complétez votre profil candidat</span>
            <span className="text-fg-2">Une minute : situation, recherche, qualification. Il accompagne chacune de vos candidatures.</span>
          </p>
          <Link href={chemin(`/espace-pro/emploi/bienvenue/situation/${q}`)} className="inline-flex h-10 items-center rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
            Compléter mon profil
          </Link>
        </div>
      )}
      {sp.fait && MESSAGES[sp.fait] && (
        <p role="status" className="squircle-xl mb-4 flex items-center gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
          <Check className="size-4 shrink-0" aria-hidden /> {MESSAGES[sp.fait]}
        </p>
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
            const e = k.echange
            return (
              <li key={k.id} className={`squircle-2xl border bg-bg p-5 sm:p-6 ${e?.statut === 'en_attente' ? 'border-amber-300 dark:border-amber-400/40' : 'border-line'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-fg-2">
                      {k.offre.recruteur}
                      {k.offre.commune ? ` · ${k.offre.commune}` : ''} · envoyée le {k.creeLe.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </p>
                    <p className="mt-1 font-semibold text-fg">{k.offre.titre}</p>
                  </div>
                  <span className={`squircle-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUT_RECRUTEUR[k.statut].classe}`}>{STATUT_CANDIDAT[k.statut]}</span>
                </div>

                {e?.statut === 'en_attente' && (
                  <div className="mt-4 border-t border-line pt-4">
                    <p className="text-sm font-semibold text-fg">{k.offre.recruteur} vous propose un échange</p>
                    <p className="squircle-xl mt-2 whitespace-pre-line bg-bg-soft p-3 text-sm text-fg">{e.message}</p>
                    <ReponseEchange candidature={k.id} creneaux={e.creneaux} email={compte.email} />
                  </div>
                )}
                {e?.statut === 'acceptee' && (
                  <div className="squircle-xl mt-4 border border-teal/30 bg-teal/[0.06] p-4 text-sm">
                    <p className="flex items-center gap-2 font-semibold text-fg">
                      <CalendarClock className="size-4 text-teal" aria-hidden /> Échange le {libelleCreneau(e.creneauChoisi ?? '')}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 text-fg">
                      <Phone className="size-4 text-fg-2" aria-hidden />
                      <a href={`tel:${e.telephoneRecruteur.replace(/\s/g, '')}`} className="font-medium hover:underline">
                        {e.telephoneRecruteur}
                      </a>
                      {e.contactRecruteur && <span className="text-fg-2">· {e.contactRecruteur} vous appellera</span>}
                    </p>
                  </div>
                )}

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
