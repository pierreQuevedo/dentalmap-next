import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, Check, ChevronLeft, Clock, Euro, ExternalLink, MapPin, Pencil, RefreshCw, Sparkles, Users } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { EmploiVerrouille, GesteOffre, PastilleOffre } from '@/components/emploi/espace-offres'
import { chemin } from '@/lib/navigation'
import { formaterAdresse } from '@/lib/annuaire/nom'
import { cheminOffre } from '@/lib/emploi/chemins'
import { contratTexte, dateCourte, dateLongue, periodeTexte, remuneration, tempsTexte } from '@/lib/emploi/format'
import { CONSERVATION_CANDIDATURES_MOIS, etatOffre } from '@/lib/emploi/offre-pro'
import { getOffresRecruteur } from '@/lib/emploi/offres-pro'
import { STATUT_RECRUTEUR, initiales, nomCandidat } from '@/lib/emploi/candidature'
import { getCandidaturesRecues } from '@/lib/emploi/candidatures-donnees'
import { PALIERS, PALIER_EMPLOI, progressionDe } from '@/lib/espace-pro/progression'
import { chargerTableau } from '../../_commun'

export const metadata: Metadata = { title: 'Offre d’emploi', robots: { index: false, follow: false } }
export const instant = false

/**
 * La page d'une offre dans l'espace pro : son état et ses échéances, ce
 * qu'elle annonce, les gestes (confirmer, modifier, pourvue, retirer,
 * republier), puis ses candidatures. « Modifier » mène aux pages de « Créer un poste ».
 */
export default async function Page(props: { params: Promise<{ offre: string }>; searchParams: Promise<{ fiche?: string; publiee?: string; modifiee?: string; brouillon?: string; fait?: string }> }) {
  const { offre: id } = await props.params
  const sp = await props.searchParams
  const { espace, coque, q, points } = await chargerTableau('emploi', sp.fiche, id)
  const { fiche } = espace
  const [offres, toutesRecues] = await Promise.all([getOffresRecruteur(fiche.id), getCandidaturesRecues(fiche.id)])
  const o = offres.find((x) => x.id === id)
  if (!o) notFound()
  const recues = toutesRecues.filter((k) => k.offreId === o.id)
  const e = etatOffre(o)
  const p = progressionDe(points.total, points.verifiee)
  const ouvert = espace.ctx.identiteVerifiee && (p.actuel?.niveau ?? 0) >= PALIER_EMPLOI
  const ici = `/espace-pro/emploi/${o.id}/`
  const r = remuneration({ mode: o.mode, min: o.min, max: o.max })

  const echeance =
    e.etat === 'en_ligne'
      ? `En ligne depuis ${e.depuisJours ? `${e.depuisJours} jour${e.depuisJours > 1 ? 's' : ''}` : 'aujourd’hui'}, jusqu’au ${o.expireLe ? dateLongue(o.expireLe.toISOString()) : '?'}. À confirmer avant le ${dateCourte(e.confirmerAvant.toISOString())}.`
      : e.etat === 'brouillon'
        ? `Brouillon créé le ${dateLongue(o.creeLe.toISOString())}, pas encore publié.`
        : `${e.etat === 'pourvue' ? 'Pourvue' : e.etat === 'expiree' ? 'Expirée' : 'Retirée'} le ${e.le ? dateLongue(e.le.toISOString()) : '?'}.${
            o.candidatures && e.le ? ` Candidatures supprimées le ${dateLongue(new Date(e.le.getFullYear(), e.le.getMonth() + CONSERVATION_CANDIDATURES_MOIS, e.le.getDate()).toISOString())}.` : ''
          }`
  const message =
    sp.publiee
      ? 'Offre publiée : elle est en ligne pour 30 jours, sur votre fiche et dans la recherche d’emploi.'
      : sp.modifiee
        ? 'Modifications enregistrées.'
      : sp.brouillon
        ? 'Brouillon enregistré.'
        : sp.fait === 'confirmer'
          ? 'Offre confirmée : prochaine confirmation dans 15 jours.'
          : sp.fait === 'pourvue'
            ? 'Offre pourvue : elle est retirée de votre fiche et de la recherche.'
            : sp.fait === 'republier'
              ? 'Offre republiée pour 30 jours.'
              : null

  return (
    <CoqueEspace
      c={coque}
      actif="emploi"
      titre={o.titre}
      sousTitre={`${contratTexte(o)} · ${tempsTexte(o)} · ${o.candidatures} candidature${o.candidatures > 1 ? 's' : ''}${o.nouvelles ? ` dont ${o.nouvelles} nouvelle${o.nouvelles > 1 ? 's' : ''}` : ''}`}
    >
      <Link href={chemin(`/espace-pro/emploi/${q}`)} className="mb-4 inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg">
        <ChevronLeft className="size-4" aria-hidden /> Emploi
      </Link>
      {message && (
        <p role="status" className="squircle-xl mb-4 flex items-center gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
          <Check className="size-4 shrink-0" aria-hidden /> {message}
        </p>
      )}
      {!ouvert && (e.etat === 'brouillon' || e.etat !== 'en_ligne') && espace.ctx.identiteVerifiee && (
        <div className="mb-4">
          <EmploiVerrouille reste={Math.max(0, PALIERS[PALIER_EMPLOI - 1].seuil - points.total)} q={q} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <Tuile>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <PastilleOffre etat={e} />
                <p className="mt-2 text-sm text-fg-2">{echeance}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {e.etat === 'en_ligne' && (
                  <>
                    <GesteOffre offre={o.id} fiche={fiche.slug} geste="confirmer" retour={ici} principal={e.aConfirmer}>
                      <RefreshCw className="size-4" aria-hidden /> Confirmer
                    </GesteOffre>
                    <GesteOffre offre={o.id} fiche={fiche.slug} geste="pourvue" retour={ici}>
                      <Check className="size-4" aria-hidden /> Pourvue
                    </GesteOffre>
                    <GesteOffre offre={o.id} fiche={fiche.slug} geste="retirer">
                      Retirer
                    </GesteOffre>
                  </>
                )}
                {e.etat === 'brouillon' && (
                  <GesteOffre offre={o.id} fiche={fiche.slug} geste="retirer">
                    Supprimer le brouillon
                  </GesteOffre>
                )}
                {(e.etat === 'pourvue' || e.etat === 'expiree' || e.etat === 'retiree') && ouvert && (
                  <GesteOffre offre={o.id} fiche={fiche.slug} geste="republier" retour={ici} principal>
                    <RefreshCw className="size-4" aria-hidden /> Republier 30 jours
                  </GesteOffre>
                )}
              </div>
            </div>
            {e.etat === 'en_ligne' && e.aConfirmer && (
              <p className="squircle-xl mt-4 flex items-center gap-2 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
                <RefreshCw className="size-4 shrink-0" aria-hidden /> Toujours d’actualité ? Confirmez d’un clic, sinon l’offre est retirée.
              </p>
            )}
          </Tuile>

          <Tuile>
            <TitreTuile
              i={Sparkles}
              droite={
                <div className="flex items-center gap-3">
                  {e.etat === 'en_ligne' && (
                    <Link href={chemin(cheminOffre(o.slug))} className="inline-flex items-center gap-1 text-sm text-fg-2 hover:text-fg">
                      <ExternalLink className="size-4" aria-hidden /> Page publique
                    </Link>
                  )}
                  {(e.etat === 'en_ligne' || e.etat === 'brouillon') && (
                    <Link href={chemin(`/espace-pro/emploi/creer/${e.etat === 'brouillon' ? 'poste' : 'publication'}/${q}${q ? '&' : '?'}offre=${o.id}`)} className="inline-flex items-center gap-1 text-sm font-medium text-fg hover:underline">
                      <Pencil className="size-4" aria-hidden /> {e.etat === 'brouillon' ? 'Reprendre le brouillon' : 'Modifier'}
                    </Link>
                  )}
                </div>
              }
            >
              L’offre
            </TitreTuile>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  [Euro, 'Rémunération', `${r.principal} ${r.detail}`],
                  [CalendarDays, o.fin ? 'Dates' : 'Début', periodeTexte(o.debut, o.fin)],
                  [Clock, 'Temps de travail', tempsTexte(o)],
                  [MapPin, 'Lieu', [o.adresse && formaterAdresse(o.adresse), o.communeNom].filter(Boolean).join(', ') || '?'],
                ] as const
              ).map(([I, l, v]) => (
                <div key={l}>
                  <dt className="flex items-center gap-1.5 text-xs text-fg-2">
                    <I className="size-3.5" aria-hidden /> {l}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-fg">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 whitespace-pre-line text-sm text-fg">{o.description}</p>
            {o.profil && (
              <>
                <p className="mt-4 text-sm font-semibold text-fg">Profil recherché</p>
                <p className="mt-1 whitespace-pre-line text-sm text-fg-2">{o.profil}</p>
              </>
            )}
            {o.avantages.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {o.avantages.map((a) => (
                  <span key={a} className="squircle-full bg-bg-soft px-2.5 py-1 text-xs text-fg">
                    {a}
                  </span>
                ))}
              </div>
            )}
          </Tuile>
        </div>

        <Tuile>
          <TitreTuile i={Users}>Candidatures</TitreTuile>
          {o.candidatures === 0 ? (
            <p className="mt-4 text-sm text-fg-2">{e.etat === 'en_ligne' ? 'Aucune candidature pour l’instant. Vous êtes prévenu par email à chaque nouvelle.' : 'Aucune candidature.'}</p>
          ) : (
            <>
              <ul className="mt-4 divide-y divide-line">
                {recues.slice(0, 5).map((k) => (
                  <li key={k.id}>
                    <Link href={chemin(`/espace-pro/emploi/candidatures/?${q ? `${q.slice(1)}&` : ''}offre=${o.id}&c=${k.id}`)} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                      <span className="squircle-lg grid size-8 shrink-0 place-items-center bg-bg-soft text-[11px] font-bold text-fg ring-1 ring-line">{initiales(k.nom)}</span>
                      <span className={`min-w-0 flex-1 truncate text-sm text-fg ${k.statut === 'nouvelle' ? 'font-semibold' : ''}`}>{nomCandidat(k.nom, true)}</span>
                      <span className={`squircle-full shrink-0 px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUT_RECRUTEUR[k.statut].classe}`}>{STATUT_RECRUTEUR[k.statut].libelle}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={chemin(`/espace-pro/emploi/candidatures/?${q ? `${q.slice(1)}&` : ''}offre=${o.id}`)}
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-fg px-4 text-sm font-semibold text-bg"
              >
                {o.candidatures > 1 ? `Voir les ${o.candidatures} candidatures` : 'Voir la candidature'}
              </Link>
            </>
          )}
        </Tuile>
      </div>

    </CoqueEspace>
  )
}
