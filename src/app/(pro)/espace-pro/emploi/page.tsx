import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarClock, Check, CheckCircle2, Clock, Euro, ExternalLink, FileText, MapPin, Megaphone, Plus, RefreshCw, Users } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { Encart } from '@/components/compte/ui'
import { FormulaireOffre, type ValeursOffre } from '@/components/emploi/formulaire-offre'
import { chemin } from '@/lib/navigation'
import { formaterAdresse } from '@/lib/annuaire/nom'
import { agirSurOffre } from '@/lib/emploi/actions-offres'
import { cheminOffre } from '@/lib/emploi/chemins'
import { contratTexte, dateCourte, dateLongue, remuneration, tempsTexte } from '@/lib/emploi/format'
import { CONSERVATION_CANDIDATURES_MOIS, DUREE_OFFRE_JOURS, etatOffre } from '@/lib/emploi/offre-pro'
import { getOffresRecruteur, type OffreRecruteur } from '@/lib/emploi/offres-pro'
import { chargerTableau } from '../_commun'

export const metadata: Metadata = { title: 'Emploi', robots: { index: false, follow: false } }
export const instant = false

type Vue = 'toutes' | 'en_ligne' | 'archives'

/**
 * D-EMPLOI : les offres de la fiche (en ligne, brouillons, archivées), leurs
 * candidatures, les gestes de chaque offre (confirmer tous les 15 jours,
 * pourvue, retirer, republier), et le tiroir « Publier une offre »
 * (`?offre=nouvelle`, ou l'identifiant d'une offre à modifier).
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; vue?: string; offre?: string; publiee?: string; brouillon?: string; fait?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, q } = await chargerTableau('emploi', sp.fiche)
  const { fiche } = espace
  const offres = await getOffresRecruteur(fiche.id)
  const maintenant = new Date()
  const verifiee = espace.ctx.identiteVerifiee
  const vue: Vue = sp.vue === 'en_ligne' || sp.vue === 'archives' ? sp.vue : 'toutes'
  const etats = new Map(offres.map((o) => [o.id, etatOffre(o, maintenant)]))
  const enLigne = offres.filter((o) => etats.get(o.id)?.etat === 'en_ligne')
  const nouvelles = enLigne.reduce((t, o) => t + o.nouvelles, 0)
  const visibles = offres.filter((o) => {
    const e = etats.get(o.id)!.etat
    return vue === 'toutes' || (vue === 'en_ligne' ? e === 'en_ligne' || e === 'brouillon' : e !== 'en_ligne' && e !== 'brouillon')
  })
  const base = `/espace-pro/emploi/${q}`
  const avec = (p: string) => `${base}${q ? '&' : '?'}${p}`

  // Le tiroir : nouvelle offre, ou une offre existante à modifier.
  const aModifier = sp.offre && sp.offre !== 'nouvelle' ? offres.find((o) => o.id === sp.offre) : undefined
  const tiroir = verifiee && (sp.offre === 'nouvelle' || aModifier)
  const lieux = fiche.lieux.map((l) => ({ id: l.id, libelle: [l.adresseLigne && formaterAdresse(l.adresseLigne), l.codePostal, l.communeNom].filter(Boolean).join(', ') }))
  const valeurs: ValeursOffre = aModifier
    ? { ...aModifier, lieuId: aModifier.lieuId, min: aModifier.min, max: aModifier.max }
    : {
        metier: 'assistant_dentaire',
        titre: 'Assistant(e) dentaire',
        contrat: 'cdi',
        tempsPlein: true,
        heuresHebdo: null,
        debut: null,
        fin: null,
        min: null,
        max: null,
        lieuId: fiche.lieux.find((l) => l.principal)?.id ?? fiche.lieux[0]?.id ?? null,
        description: '',
        profil: null,
        avantages: [],
      }

  const message = sp.publiee
    ? 'Offre publiée : elle est en ligne pour 30 jours, sur votre fiche et dans la recherche d’emploi.'
    : sp.brouillon
      ? 'Brouillon enregistré. Reprenez-le quand vous voulez.'
      : sp.fait === 'confirmer'
        ? 'Offre confirmée : elle reste en ligne. Prochaine confirmation dans 15 jours.'
        : sp.fait === 'pourvue'
          ? 'Offre marquée pourvue : elle est retirée de votre fiche et de la recherche.'
          : sp.fait === 'retirer'
            ? 'Offre retirée.'
            : sp.fait === 'republier'
              ? 'Offre republiée pour 30 jours.'
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
              {verifiee && (
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
              {vue !== 'archives' && (
                <Link href={chemin(avec('offre=nouvelle'))} className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                  <Plus className="size-4" aria-hidden /> Publier une offre
                </Link>
              )}
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {visibles.map((o) => (
                <LigneOffre key={o.id} o={o} etat={etats.get(o.id)!} fiche={fiche.slug} modifier={avec(`offre=${o.id}`)} />
              ))}
            </ul>
          )}
        </Tuile>

        <div className="space-y-4">
          <Tuile>
            <TitreTuile i={FileText}>Règles des offres</TitreTuile>
            <ul className="mt-4 space-y-4 text-sm">
              {[
                [CalendarClock, `Publiée ${DUREE_OFFRE_JOURS} jours`, 'Confirmée d’un clic tous les 15 jours, renouvelable à l’échéance. Sans confirmation, elle est retirée d’elle-même.'],
                [Euro, 'Rémunération affichée', 'Obligatoire : une fourchette brute mensuelle, ou un pourcentage des honoraires. Sans elle, l’offre n’est pas publiée.'],
                [Clock, `Candidatures conservées ${CONSERVATION_CANDIDATURES_MOIS} mois`, `Elles sont supprimées ${CONSERVATION_CANDIDATURES_MOIS} mois après la clôture de l’offre, CV compris.`],
              ].map(([I, t, d]) => {
                const Icone = I as typeof Clock
                return (
                  <li key={t as string} className="flex gap-3">
                    <span className="squircle-lg grid size-9 shrink-0 place-items-center bg-bg-soft text-fg">
                      <Icone className="size-4" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-medium text-fg">{t as string}</span>
                      <span className="block text-xs text-fg-2">{d as string}</span>
                    </span>
                  </li>
                )
              })}
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

      {tiroir && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <Link href={chemin(base)} aria-label="Fermer" className="absolute inset-0 bg-[#0e1317]/50 backdrop-blur-[2px]" />
          <div role="dialog" aria-modal="true" aria-label="Publier une offre" className="relative h-full w-full max-w-xl bg-bg shadow-pop">
            <FormulaireOffre fiche={fiche.slug} fermer={base} lieux={lieux} valeurs={valeurs} />
          </div>
        </div>
      )}
    </CoqueEspace>
  )
}

function Geste({ offre, fiche, geste, children, principal = false }: { offre: string; fiche: string; geste: string; children: React.ReactNode; principal?: boolean }) {
  return (
    <form action={agirSurOffre}>
      <input type="hidden" name="fiche" value={fiche} />
      <input type="hidden" name="offre" value={offre} />
      <input type="hidden" name="geste" value={geste} />
      <button
        type="submit"
        className={
          principal
            ? 'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover'
            : 'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line px-3.5 text-sm font-medium text-fg hover:border-line-strong'
        }
      >
        {children}
      </button>
    </form>
  )
}

function LigneOffre({ o, etat, fiche, modifier }: { o: OffreRecruteur; etat: ReturnType<typeof etatOffre>; fiche: string; modifier: string }) {
  const r = remuneration({ mode: o.mode, min: o.min, max: o.max })
  const pastille =
    etat.etat === 'en_ligne'
      ? { l: 'En ligne', c: 'bg-teal/10 text-teal ring-teal/20' }
      : etat.etat === 'brouillon'
        ? { l: 'Brouillon', c: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30' }
        : { l: etat.etat === 'pourvue' ? 'Pourvue' : etat.etat === 'expiree' ? 'Expirée' : 'Retirée', c: 'bg-bg-soft text-fg-2 ring-line' }
  const purge = (d: Date | null) => (d ? dateLongue(new Date(d.getFullYear(), d.getMonth() + CONSERVATION_CANDIDATURES_MOIS, d.getDate()).toISOString()) : '')
  const meta =
    etat.etat === 'en_ligne'
      ? `En ligne depuis ${etat.depuisJours ? `${etat.depuisJours} jour${etat.depuisJours > 1 ? 's' : ''}` : 'aujourd’hui'} · expire dans ${etat.resteJours} jour${etat.resteJours > 1 ? 's' : ''}`
      : etat.etat === 'brouillon'
        ? `Brouillon enregistré le ${dateLongue(o.creeLe.toISOString())}`
        : `${pastille.l} le ${etat.le ? dateCourte(etat.le.toISOString()) : '?'}${o.candidatures ? ` · candidatures supprimées le ${purge(etat.le)}` : ''}`
  return (
    <li className="flex flex-wrap items-start gap-4 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-xs text-fg-2">
          <span className={`squircle-full px-2 py-0.5 font-semibold ring-1 ring-inset ${pastille.c}`}>{pastille.l}</span>
          {meta}
        </p>
        <p className="mt-1.5 font-semibold text-fg">{o.titre}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-2">
          <span>{contratTexte(o)}</span>
          <span>{tempsTexte(o)}</span>
          {(o.adresse || o.communeNom) && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {[o.adresse && formaterAdresse(o.adresse), o.communeNom].filter(Boolean).join(', ')}
            </span>
          )}
        </p>
        <p className="mt-0.5 text-sm text-fg">
          {r.principal} <span className="text-fg-2">{r.detail}</span>
        </p>
        {etat.etat === 'en_ligne' && etat.aConfirmer && (
          <p className="squircle-xl mt-3 flex flex-wrap items-center gap-2 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
            <RefreshCw className="size-3.5" aria-hidden /> Toujours d’actualité ? Confirmez avant le {dateCourte(etat.confirmerAvant.toISOString())}, sinon l’offre est retirée.
          </p>
        )}
      </div>
      <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:shrink-0 sm:items-end">
        {o.statut !== 'brouillon' && (
          <p className="text-sm text-fg">
            <b>{o.candidatures}</b> candidature{o.candidatures > 1 ? 's' : ''}
            {o.nouvelles > 0 && <span className="squircle-full ml-2 bg-teal/10 px-2 py-0.5 text-xs font-semibold text-teal">{o.nouvelles} nouvelle{o.nouvelles > 1 ? 's' : ''}</span>}
          </p>
        )}
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {etat.etat === 'en_ligne' && (
            <>
              {etat.aConfirmer && (
                <Geste offre={o.id} fiche={fiche} geste="confirmer" principal>
                  <RefreshCw className="size-4" aria-hidden /> Confirmer
                </Geste>
              )}
              <Link href={chemin(modifier)} className="inline-flex h-9 items-center rounded-full border border-line px-3.5 text-sm font-medium text-fg hover:border-line-strong">
                Modifier
              </Link>
              <Geste offre={o.id} fiche={fiche} geste="pourvue">
                <Check className="size-4" aria-hidden /> Pourvue
              </Geste>
              <Geste offre={o.id} fiche={fiche} geste="retirer">
                Retirer
              </Geste>
              <Link href={chemin(cheminOffre(o.slug))} className="inline-flex h-9 items-center gap-1.5 rounded-full px-2 text-sm text-fg-2 hover:text-fg">
                <ExternalLink className="size-4" aria-hidden /> Voir
              </Link>
            </>
          )}
          {etat.etat === 'brouillon' && (
            <>
              <Link href={chemin(modifier)} className="inline-flex h-9 items-center rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                Reprendre le brouillon
              </Link>
              <Geste offre={o.id} fiche={fiche} geste="retirer">
                Supprimer
              </Geste>
            </>
          )}
          {(etat.etat === 'pourvue' || etat.etat === 'expiree' || etat.etat === 'retiree') && (
            <Geste offre={o.id} fiche={fiche} geste="republier">
              <RefreshCw className="size-4" aria-hidden /> Republier
            </Geste>
          )}
        </div>
      </div>
    </li>
  )
}
