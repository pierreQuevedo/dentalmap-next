import type { Metadata } from 'next'
import Link from 'next/link'
import { sql } from 'drizzle-orm'
import { BadgeCheck, Briefcase, CalendarClock, Check, ChevronLeft, FileText, Info, Mail, MapPin, MessageSquare, Phone, Users } from 'lucide-react'
import { db } from '@/db'
import { CoqueEspace, Tuile } from '@/components/espace/coque'
import { OngletsEmploi } from '@/components/emploi/espace-offres'
import { FormulaireEchange } from '@/components/emploi/formulaire-echange'
import { nomVuParRecruteur } from '@/components/emploi/apercu-candidat'
import { mobilite } from '@/lib/emploi/profil-candidat'
import { chemin } from '@/lib/navigation'
import { tailleLisible } from '@/lib/espace-pro/justificatif'
import { dateCourte } from '@/lib/emploi/format'
import { deciderCandidature } from '@/lib/emploi/actions-candidatures'
import { FILTRES_CANDIDATURES, STATUT_RECRUTEUR, dansFiltre, initiales, libelleCreneau, lireFiltre, type StatutCandidature } from '@/lib/emploi/candidature'
import { getCandidaturesRecues } from '@/lib/emploi/candidatures-donnees'
import { CONSERVATION_CANDIDATURES_MOIS } from '@/lib/emploi/offre-pro'
import { chargerTableau } from '../../_commun'

export const metadata: Metadata = { title: 'Candidatures reçues', robots: { index: false, follow: false } }
export const instant = false


const MESSAGES: Record<string, string> = {
  echange: 'Proposition d’échange envoyée. La personne reçoit vos créneaux par email.',
  retenue: 'Candidature retenue.',
  non_retenue: 'Candidature non retenue : la personne en est prévenue par email.',
}

function Pastille({ s }: { s: StatutCandidature }) {
  const p = STATUT_RECRUTEUR[s]
  return <span className={`squircle-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${p.classe}`}>{p.libelle}</span>
}

function quand(d: Date): string {
  const jours = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (jours <= 0 && new Date().getDate() === d.getDate()) return 'Aujourd’hui'
  if (jours <= 1) return 'Hier'
  return dateCourte(d.toISOString())
}

/**
 * D-CAND : les candidatures reçues, toutes offres confondues ou pour une
 * offre (`?offre=`). La liste à gauche, la candidature ouverte à droite
 * (`?c=`) ; l'ouvrir la passe de « Nouvelle » à « Vue ». Coordonnées masquées
 * tant que la personne n'a pas accepté un échange.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; offre?: string; c?: string; filtre?: string; echange?: string; fait?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, q } = await chargerTableau('emploi', sp.fiche, 'candidatures')
  const { fiche } = espace
  const toutes = await getCandidaturesRecues(fiche.id)
  const deLOffre = sp.offre ? toutes.filter((k) => k.offreId === sp.offre) : toutes
  const filtre = lireFiltre(sp.filtre)
  const liste = deLOffre.filter((k) => dansFiltre(k.statut, filtre))
  const ouverte = (sp.c && toutes.find((k) => k.id === sp.c)) || liste[0] || null

  // Ouvrir une candidature la passe à « Vue ».
  if (ouverte && ouverte.statut === 'nouvelle') {
    await db.execute(sql`UPDATE candidatures SET statut = 'vue', vue_le = now(), maj_le = now() WHERE id = ${ouverte.id} AND statut = 'nouvelle'`)
  }

  const params = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    const tout = { fiche: sp.fiche, offre: sp.offre, filtre: filtre === 'toutes' ? undefined : filtre, ...extra }
    for (const [k, v] of Object.entries(tout)) if (v) p.set(k, v)
    const s = p.toString()
    return `/espace-pro/emploi/candidatures/${s ? `?${s}` : ''}`
  }
  const offreTitre = sp.offre ? deLOffre[0]?.offreTitre : null
  const nouvelles = deLOffre.filter((k) => k.statut === 'nouvelle' && k.id !== ouverte?.id).length
  const accepte = ouverte?.echange?.statut === 'acceptee'
  const nom = ouverte ? nomVuParRecruteur(ouverte.nom, ouverte.profil?.visibilite ?? 'visible', accepte) : ''
  const qualif = ouverte?.profil?.qualification ?? 'Profil non renseigné'
  const ici = ouverte ? params({ c: ouverte.id }) : params({})
  const close = ouverte?.statut === 'non_retenue'

  return (
    <CoqueEspace
      c={coque}
      actif="emploi"
      titre={offreTitre ?? 'Candidatures reçues'}
      sousTitre={`${deLOffre.length} candidature${deLOffre.length > 1 ? 's' : ''}${nouvelles ? ` dont ${nouvelles} nouvelle${nouvelles > 1 ? 's' : ''}` : ''}`}
    >
      <OngletsEmploi actif="creer" q={q} />
      <Link href={chemin(sp.offre ? `/espace-pro/emploi/${sp.offre}/${q}` : `/espace-pro/emploi/${q}`)} className="mb-4 flex w-fit items-center gap-1 text-sm text-fg-2 hover:text-fg">
        <ChevronLeft className="size-4" aria-hidden /> {offreTitre ?? 'Mes offres'}
      </Link>
      {sp.fait && MESSAGES[sp.fait] && (
        <p role="status" className="squircle-xl mb-4 flex items-center gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
          <Check className="size-4 shrink-0" aria-hidden /> {MESSAGES[sp.fait]}
        </p>
      )}

      {toutes.length === 0 ? (
        <Tuile>
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-bg-soft text-fg-2">
              <Users className="size-5" aria-hidden />
            </span>
            <p className="mt-3 font-semibold text-fg">Aucune candidature pour l’instant</p>
            <p className="mt-1 max-w-sm text-sm text-fg-2">Vous êtes prévenu par email à chaque nouvelle candidature sur l’une de vos offres.</p>
          </div>
        </Tuile>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[24rem_minmax(0,1fr)]">
          <Tuile className="self-start p-0">
            <nav aria-label="Filtrer les candidatures" className="flex flex-wrap gap-1.5 p-4">
              {FILTRES_CANDIDATURES.map((f) => (
                <Link
                  key={f.cle}
                  href={chemin(params({ filtre: f.cle === 'toutes' ? undefined : f.cle }))}
                  aria-current={filtre === f.cle ? 'page' : undefined}
                  className={`squircle-full px-2.5 py-1 text-xs ${filtre === f.cle ? 'bg-fg text-bg' : 'border border-line text-fg-2 hover:text-fg'}`}
                >
                  {f.libelle}
                </Link>
              ))}
            </nav>
            {liste.length === 0 ? (
              <p className="border-t border-line px-4 py-6 text-sm text-fg-2">Aucune candidature dans ce filtre.</p>
            ) : (
              <ul className="divide-y divide-line border-t border-line">
                {liste.map((k) => {
                  const actif = k.id === ouverte?.id
                  const statut: StatutCandidature = actif && k.statut === 'nouvelle' ? 'vue' : k.statut
                  return (
                    <li key={k.id}>
                      <Link href={chemin(params({ c: k.id }))} aria-current={actif ? 'true' : undefined} className={`flex items-center gap-3 px-4 py-3 hover:bg-bg-soft ${actif ? 'bg-bg-soft' : ''} ${k.statut === 'non_retenue' ? 'opacity-60' : ''}`}>
                        <span className={`squircle-lg grid size-9 shrink-0 place-items-center bg-bg text-xs font-bold text-fg ring-1 ${actif ? 'ring-fg' : 'ring-line'}`}>{initiales(k.nom)}</span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-sm text-fg ${k.statut === 'nouvelle' ? 'font-semibold' : 'font-medium'}`}>{nomVuParRecruteur(k.nom, k.profil?.visibilite ?? 'visible', k.echange?.statut === 'acceptee')}</span>
                          <span className="block truncate text-xs text-fg-2">{sp.offre ? (k.profil?.qualification ?? 'Profil non renseigné') : k.offreTitre}</span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <Pastille s={statut} />
                          <span className="text-[11px] text-fg-2">{quand(k.creeLe)}</span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </Tuile>

          {ouverte && (
            <Tuile className="p-0">
              <div className="flex flex-wrap items-start gap-4 border-b border-line p-5 sm:p-6">
                <span className="squircle-xl grid size-14 shrink-0 place-items-center bg-bg-soft text-base font-bold text-fg ring-1 ring-line">{initiales(ouverte.nom)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-fg-2">
                    {ouverte.origine === 'recruteur' ? 'Profil contacté le' : 'Candidature reçue le'} {ouverte.creeLe.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à{' '}
                    {ouverte.creeLe.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')}
                    {!sp.offre && (
                      <>
                        {' '}
                        ·{' '}
                        <Link href={chemin(`/espace-pro/emploi/${ouverte.offreId}/${q}`)} className="underline underline-offset-2 hover:text-fg">
                          {ouverte.offreTitre}
                        </Link>
                      </>
                    )}
                  </p>
                  <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-fg">{nom}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-fg">
                    {qualif}
                    {ouverte.profil?.titreVerifie && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-teal">
                        <BadgeCheck className="size-3.5" aria-hidden /> Titre vérifié
                      </span>
                    )}
                  </p>
                </div>
                <Pastille s={ouverte.statut === 'nouvelle' ? 'vue' : ouverte.statut} />
              </div>

              <div className="space-y-6 p-5 sm:p-6">
                {accepte && ouverte.coordonnees && ouverte.echange && (
                  <div className="squircle-xl border border-teal/30 bg-teal/[0.06] p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-fg">
                      <CalendarClock className="size-4 text-teal" aria-hidden /> Échange le {libelleCreneau(ouverte.echange.creneauChoisi ?? '')}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      {ouverte.coordonnees.telephone && (
                        <a href={`tel:${ouverte.coordonnees.telephone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 font-medium text-fg hover:underline">
                          <Phone className="size-4 text-fg-2" aria-hidden /> {ouverte.coordonnees.telephone}
                        </a>
                      )}
                      <a href={`mailto:${ouverte.coordonnees.email}`} className="inline-flex items-center gap-1.5 font-medium text-fg hover:underline">
                        <Mail className="size-4 text-fg-2" aria-hidden /> {ouverte.coordonnees.email}
                      </a>
                    </div>
                  </div>
                )}
                {ouverte.echange?.statut === 'en_attente' && (
                  <div className="squircle-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
                    <p className="font-medium">Proposition envoyée le {dateCourte(ouverte.echange.creeLe.toISOString())}, en attente de réponse.</p>
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
                      {ouverte.echange.creneaux.map((c) => (
                        <li key={c}>{libelleCreneau(c)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {ouverte.echange?.statut === 'refusee' && <p className="squircle-xl bg-bg-soft p-4 text-sm text-fg-2">La personne n’a pas donné suite à votre proposition d’échange. Ses coordonnées ne vous sont pas transmises.</p>}

                {ouverte.profil && (
                  <dl className="grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        [Briefcase, 'Expérience', ouverte.profil.experiences[0] ? [ouverte.profil.experiences[0].poste, ouverte.profil.experiences[0].periode].filter(Boolean).join(', ') + (ouverte.profil.experiences.length > 1 ? ` (+${ouverte.profil.experiences.length - 1})` : '') : 'Non renseignée'],
                        [CalendarClock, 'Disponibilité', ouverte.profil.criteres.disponibilite ?? 'Non renseignée'],
                        [MapPin, 'Mobilité', mobilite(ouverte.profil.criteres) ?? 'Non renseignée'],
                      ] as const
                    ).map(([I, l, v]) => (
                      <div key={l} className="squircle-xl bg-bg-soft p-3">
                        <dt className="flex items-center gap-1.5 text-xs text-fg-2">
                          <I className="size-3.5" aria-hidden /> {l}
                        </dt>
                        <dd className="mt-1 text-sm text-fg">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {ouverte.profil && ouverte.profil.experiences.length > 1 && (
                  <ul className="space-y-1 text-sm">
                    {ouverte.profil.experiences.map((x) => (
                      <li key={`${x.poste}-${x.periode}`} className="flex flex-wrap justify-between gap-x-4">
                        <span className="text-fg">
                          {x.poste}
                          {x.structure && <span className="text-fg-2"> · {x.structure}</span>}
                        </span>
                        <span className="text-xs text-fg-2">{x.periode}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {ouverte.profil && ouverte.profil.competences.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {ouverte.profil.competences.map((c) => (
                      <span key={c} className="squircle-full bg-bg-soft px-2.5 py-1 text-xs text-fg">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-fg">Message de motivation</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-fg">{ouverte.message || <span className="text-fg-2">{ouverte.origine === 'recruteur' ? 'Vous avez contacté ce profil depuis les profils disponibles.' : 'Pas de message.'}</span>}</p>
                </div>
                {ouverte.cv && (
                  <a href={`/espace-pro/emploi/candidatures/${ouverte.id}/cv/`} target="_blank" rel="noopener" className="squircle-xl flex items-center gap-3 border border-line p-3 hover:border-line-strong">
                    <span className="squircle-lg grid size-10 shrink-0 place-items-center bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-300">
                      <FileText className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-fg">{ouverte.cv.nom}</span>
                      <span className="block text-xs text-fg-2">PDF{ouverte.cv.taille ? ` · ${tailleLisible(ouverte.cv.taille)}` : ''}</span>
                    </span>
                    <span className="text-sm font-medium text-fg underline underline-offset-2">Ouvrir</span>
                  </a>
                )}
                {!accepte && (
                  <p className="squircle-xl flex items-start gap-2 bg-bg-soft p-3 text-xs leading-relaxed text-fg-2">
                    <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                    Ses coordonnées vous sont transmises si la personne accepte votre proposition d’échange. Les candidatures sont supprimées {CONSERVATION_CANDIDATURES_MOIS} mois après la clôture de l’offre.
                  </p>
                )}
              </div>

              {!close && (
                <div className="flex flex-col-reverse gap-2 border-t border-line p-5 sm:flex-row sm:justify-end">
                  <form action={deciderCandidature}>
                    <input type="hidden" name="fiche" value={fiche.slug} />
                    <input type="hidden" name="candidature" value={ouverte.id} />
                    <input type="hidden" name="decision" value="non_retenue" />
                    <button type="submit" className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong sm:w-auto">
                      Non retenue
                    </button>
                  </form>
                  {ouverte.statut !== 'retenue' && (
                    <form action={deciderCandidature}>
                      <input type="hidden" name="fiche" value={fiche.slug} />
                      <input type="hidden" name="candidature" value={ouverte.id} />
                      <input type="hidden" name="decision" value="retenue" />
                      <button type="submit" className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-line px-4 text-sm font-medium text-fg hover:border-line-strong sm:w-auto">
                        <Check className="size-4" aria-hidden /> Retenir
                      </button>
                    </form>
                  )}
                  {!accepte && ouverte.statut !== 'retenue' && (
                    <Link href={chemin(params({ c: ouverte.id, echange: '1' }))} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                      <MessageSquare className="size-4" aria-hidden /> {ouverte.echange?.statut === 'en_attente' ? 'Modifier la proposition' : 'Proposer un échange'}
                    </Link>
                  )}
                </div>
              )}
            </Tuile>
          )}
        </div>
      )}

      {ouverte && sp.echange && !accepte && !close && (
        <FormulaireEchange fiche={fiche.slug} candidature={ouverte.id} nom={nom} detail={qualif} offre={ouverte.offreTitre} fermer={ici} />
      )}
    </CoqueEspace>
  )
}
