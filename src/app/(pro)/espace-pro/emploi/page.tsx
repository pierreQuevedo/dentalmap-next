import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarClock, Check, CheckCircle2, ChevronRight, Clock, Euro, FileText, MapPin, Megaphone, Plus, Users } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { Encart } from '@/components/compte/ui'
import { EmploiVerrouille, PastilleOffre, TiroirOffre, libelleLieu, valeursOffre } from '@/components/emploi/espace-offres'
import { chemin } from '@/lib/navigation'
import { contratTexte, dateCourte, tempsTexte } from '@/lib/emploi/format'
import { CONSERVATION_CANDIDATURES_MOIS, DUREE_OFFRE_JOURS, etatOffre } from '@/lib/emploi/offre-pro'
import { getOffresRecruteur } from '@/lib/emploi/offres-pro'
import { PALIERS, PALIER_EMPLOI, progressionDe } from '@/lib/espace-pro/progression'
import { chargerTableau } from '../_commun'

export const metadata: Metadata = { title: 'Emploi', robots: { index: false, follow: false } }
export const instant = false

type Vue = 'toutes' | 'en_ligne' | 'archives'

/**
 * D-EMPLOI : la liste des offres de la fiche, courte, une ligne par offre
 * menant à sa page (détail, gestes, candidatures), et le tiroir « Publier une
 * offre » (`?offre=nouvelle`). Publier demande une identité vérifiée et le
 * palier Ambassadeur.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; vue?: string; offre?: string; publiee?: string; brouillon?: string; fait?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, q, points } = await chargerTableau('emploi', sp.fiche)
  const { fiche } = espace
  const offres = await getOffresRecruteur(fiche.id)
  const maintenant = new Date()
  const verifiee = espace.ctx.identiteVerifiee
  const p = progressionDe(points.total, points.verifiee)
  const ouvert = verifiee && (p.actuel?.niveau ?? 0) >= PALIER_EMPLOI
  const reste = Math.max(0, PALIERS[PALIER_EMPLOI - 1].seuil - points.total)
  const vue: Vue = sp.vue === 'en_ligne' || sp.vue === 'archives' ? sp.vue : 'toutes'
  const etats = new Map(offres.map((o) => [o.id, etatOffre(o, maintenant)]))
  const enLigne = offres.filter((o) => etats.get(o.id)?.etat === 'en_ligne')
  const nouvelles = enLigne.reduce((t, o) => t + o.nouvelles, 0)
  const visibles = offres.filter((o) => {
    const e = etats.get(o.id)!.etat
    return vue === 'toutes' || (vue === 'en_ligne' ? e === 'en_ligne' || e === 'brouillon' : e !== 'en_ligne' && e !== 'brouillon')
  })
  const base = `/espace-pro/emploi/${q}`
  const avec = (x: string) => `${base}${q ? '&' : '?'}${x}`
  const lieux = fiche.lieux.map((l) => ({ id: l.id, libelle: libelleLieu(l) }))
  const lieuParDefaut = fiche.lieux.find((l) => l.principal)?.id ?? fiche.lieux[0]?.id ?? null

  const message = sp.publiee
    ? 'Offre publiée : elle est en ligne pour 30 jours, sur votre fiche et dans la recherche d’emploi.'
    : sp.brouillon
      ? 'Brouillon enregistré. Reprenez-le quand vous voulez.'
      : sp.fait === 'retirer'
        ? 'Offre retirée.'
        : null

  return (
    <CoqueEspace
      c={coque}
      actif="emploi"
      titre="Emploi"
      sousTitre={`${enLigne.length} offre${enLigne.length > 1 ? 's' : ''} en ligne${nouvelles ? ` · ${nouvelles} nouvelle${nouvelles > 1 ? 's' : ''} candidature${nouvelles > 1 ? 's' : ''}` : ''}`}
    >
      {message && (
        <p role="status" className="squircle-xl mb-4 flex items-center gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
          <Check className="size-4 shrink-0" aria-hidden /> {message}
        </p>
      )}
      {verifiee && !ouvert && (
        <div className="mb-4">
          <EmploiVerrouille reste={reste} q={q} />
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Tuile className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
            <TitreTuile i={Megaphone}>Vos offres</TitreTuile>
            <div className="flex flex-wrap items-center gap-2">
              <nav aria-label="Filtrer les offres" className="squircle-full inline-flex bg-bg-soft p-1 text-xs">
                {(
                  [
                    ['toutes', 'Toutes'],
                    ['en_ligne', 'En ligne'],
                    ['archives', 'Archivées'],
                  ] as const
                ).map(([v, l]) => (
                  <Link key={v} href={chemin(v === 'toutes' ? base : avec(`vue=${v}`))} aria-current={vue === v ? 'page' : undefined} className={`squircle-full px-3 py-1 font-medium ${vue === v ? 'bg-fg text-bg' : 'text-fg-2 hover:text-fg'}`}>
                    {l}
                  </Link>
                ))}
              </nav>
              {ouvert && (
                <Link href={chemin(avec('offre=nouvelle'))} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                  <Plus className="size-4" aria-hidden /> Publier une offre
                </Link>
              )}
            </div>
          </div>

          {!verifiee ? (
            <div className="p-5">
              <Encart>La publication d’offres s’ouvre dès que votre identité est vérifiée.</Encart>
            </div>
          ) : visibles.length === 0 ? (
            <div className="m-5 flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-10 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-bg-soft text-fg-2">
                <Users className="size-5" aria-hidden />
              </span>
              <p className="mt-3 font-semibold text-fg">{vue === 'archives' ? 'Aucune offre archivée' : 'Vous recrutez ?'}</p>
              <p className="mt-1 max-w-sm text-sm text-fg-2">
                {vue === 'archives' ? 'Les offres pourvues, retirées ou expirées apparaîtront ici.' : 'Publiez une offre : elle apparaît sur votre fiche, dans la recherche d’emploi et dans les alertes des candidats de votre zone.'}
              </p>
              {vue !== 'archives' && ouvert && (
                <Link href={chemin(avec('offre=nouvelle'))} className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                  <Plus className="size-4" aria-hidden /> Publier une offre
                </Link>
              )}
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {visibles.map((o) => {
                const e = etats.get(o.id)!
                const quand = e.etat === 'en_ligne' ? `expire dans ${e.resteJours} jour${e.resteJours > 1 ? 's' : ''}` : e.etat === 'brouillon' ? `créé le ${dateCourte(o.creeLe.toISOString())}` : e.le ? `le ${dateCourte(e.le.toISOString())}` : ''
                return (
                  <li key={o.id}>
                    <Link href={chemin(`/espace-pro/emploi/${o.id}/${q}`)} className="flex items-center gap-4 px-5 py-4 hover:bg-bg-soft">
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-xs text-fg-2">
                          <PastilleOffre etat={e} /> {quand}
                        </p>
                        <p className="mt-1.5 truncate font-semibold text-fg">{o.titre}</p>
                        <p className="mt-0.5 truncate text-sm text-fg-2">
                          {contratTexte(o)} · {tempsTexte(o)}
                          {o.communeNom ? ` · ${o.communeNom}` : ''}
                        </p>
                      </div>
                      {o.statut !== 'brouillon' && (
                        <p className="shrink-0 text-right text-sm text-fg">
                          <b>{o.candidatures}</b> candidature{o.candidatures > 1 ? 's' : ''}
                          {o.nouvelles > 0 && <span className="squircle-full ml-2 bg-teal/10 px-2 py-0.5 text-xs font-semibold text-teal">{o.nouvelles} nouvelle{o.nouvelles > 1 ? 's' : ''}</span>}
                        </p>
                      )}
                      <ChevronRight className="size-4 shrink-0 text-fg-2" aria-hidden />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Tuile>

        <div className="space-y-4">
          <Tuile>
            <TitreTuile i={FileText}>Règles des offres</TitreTuile>
            <ul className="mt-4 space-y-4 text-sm">
              {(
                [
                  [CalendarClock, `Publiée ${DUREE_OFFRE_JOURS} jours`, 'Confirmée d’un clic tous les 15 jours, renouvelable à l’échéance. Sans confirmation, elle est retirée d’elle-même.'],
                  [Euro, 'Rémunération affichée', 'Obligatoire : une fourchette brute mensuelle, ou un pourcentage des honoraires. Sans elle, l’offre n’est pas publiée.'],
                  [Clock, `Candidatures conservées ${CONSERVATION_CANDIDATURES_MOIS} mois`, `Elles sont supprimées ${CONSERVATION_CANDIDATURES_MOIS} mois après la clôture de l’offre, CV compris.`],
                ] as const
              ).map(([I, t, d]) => (
                <li key={t} className="flex gap-3">
                  <span className="squircle-lg grid size-9 shrink-0 place-items-center bg-bg-soft text-fg">
                    <I className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-medium text-fg">{t}</span>
                    <span className="block text-xs text-fg-2">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Tuile>
          <Tuile>
            <TitreTuile i={MapPin}>Où votre offre apparaît</TitreTuile>
            <ul className="mt-4 space-y-2.5 text-sm text-fg">
              {['Sur votre fiche, dans un encadré « Le cabinet recrute »', 'Dans la recherche d’emploi DentalMap, triée par distance', 'Dans les alertes des candidats de votre zone'].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </Tuile>
        </div>
      </div>

      {ouvert && sp.offre === 'nouvelle' && <TiroirOffre fiche={fiche.slug} fermer={base} lieux={lieux} valeurs={valeursOffre(undefined, lieuParDefaut)} />}
    </CoqueEspace>
  )
}
