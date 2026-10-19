import type { Metadata } from 'next'
import { BadgeCheck, CircleCheck, Globe, Hourglass, Link2, Mail, QrCode, Send, ShieldCheck, Sparkles, TriangleAlert, UserPlus } from 'lucide-react'
import { VALIDITE_LIEN_GOOGLE_JOURS, etatLienGoogle } from '@/lib/espace-pro/lien-google'
import { BONUS_PARRAINAGE, DUREE_BONUS_JOURS, INVITATIONS_PAR_SEMAINE, PLAFOND_BONUS, RELANCE_JOURS } from '@/lib/espace-pro/parrainage'
import { getParrainage, type EtatInvitation } from '@/lib/espace-pro/parrainage-donnees'
import { lienDeSource } from '@/lib/espace-pro/sources'
import { PALIERS, progressionDe } from '@/lib/espace-pro/progression'
import { inviterConfreres } from '@/lib/espace-pro/actions-parrainage'
import { Encart, principal } from '@/components/compte/ui'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { Copier } from '@/components/espace/copier'
import { PartageReseaux } from '@/components/espace/partage-reseaux'
import { SITE_URL } from '@/lib/seo/site'
import { chargerTableau } from '../_commun'

export const metadata: Metadata = { title: 'Partager et parrainer', robots: { index: false, follow: false } }
export const instant = false

/** Les visuels : identité vérifiée, et palier 2 atteint. */
function ouvertVisuels(identiteVerifiee: boolean, points: number): boolean {
  return identiteVerifiee && points >= PALIERS[1].seuil
}

const ETAT: Record<EtatInvitation, { libelle: string; classe: string }> = {
  envoyee: { libelle: 'Envoyée', classe: 'bg-bg-soft text-fg-2' },
  relancee: { libelle: 'Relancée', classe: 'bg-bg-soft text-fg-2' },
  ouverte: { libelle: 'En cours', classe: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' },
  reussie: { libelle: `Réussie · +${BONUS_PARRAINAGE}`, classe: 'bg-teal/10 text-teal' },
  desinscrite: { libelle: 'Refusée', classe: 'bg-bg-soft text-fg-2' },
}

/**
 * Faire connaître la fiche : le parrainage d'abord, mis en avant (invitations
 * par email, bonus de mise en avant pour les deux fiches), puis le lien pour
 * les visuels pour les réseaux sociaux, le lien pour la fiche Google et le
 * badge du site du cabinet.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; envoyees?: string; ignorees?: string; erreur?: string; message?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, compte, q, points } = await chargerTableau('partager', sp.fiche)
  // Les visuels sont le gain du palier 2 ; à partir du 3, ils portent le nom du palier.
  const progression = progressionDe(points.total)
  const palierVisuels = PALIERS[1]
  const visuelsOuverts = ouvertVisuels(espace.ctx.identiteVerifiee, points.total)
  const parrainage = await getParrainage(compte.id, espace.fiche.id)
  const ouvert = espace.ctx.identiteVerifiee
  const reste = Math.max(0, INVITATIONS_PAR_SEMAINE - parrainage.envoyeesSemaine)
  const envoyees = Number(sp.envoyees ?? 0)
  const ignorees = Number(sp.ignorees ?? 0)
  const site = SITE_URL.replace(/\/$/, '')
  const court = `${site}/p/${espace.fiche.slug}/`
  // Le lien réservé à la fiche Google : ses clics venus de Google vérifient qu'il est en place.
  const google = lienDeSource(site, espace.fiche.slug, 'google')
  const marque = (cle: 'story' | 'qr' | 'reseaux' | 'badge') => lienDeSource(site, espace.fiche.slug, cle)
  const legende = espace.labo
    ? `Retrouvez nos délais de fabrication, notre savoir-faire et nos réalisations sur notre fiche DentalMap : ${marque('reseaux')}`
    : `Retrouvez mes horaires, mon conventionnement et l’accueil du cabinet sur ma fiche DentalMap, vérifiée par les registres officiels : ${marque('reseaux')}`
  const lien = etatLienGoogle(espace.completee)
  const date = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
  const badge = `<a href="${marque('badge')}">Vérifié sur DentalMap</a>`
  return (
    <CoqueEspace c={coque} actif="partager" titre="Partager et parrainer" sousTitre="Faire connaître la fiche, et gagner en visibilité en parrainant vos confrères.">
      <section id="parrainage" className="squircle-2xl relative mb-4 scroll-mt-24 overflow-hidden border border-teal/25 bg-gradient-to-br from-teal/10 via-bg to-bg p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <span className="squircle-full inline-flex items-center gap-1.5 bg-teal/15 px-2.5 py-0.5 text-xs font-semibold text-teal ring-1 ring-inset ring-teal/30">
              <Sparkles className="size-3.5" aria-hidden /> +{BONUS_PARRAINAGE} points chacun
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-fg">Parrainez un confrère, gagnez en visibilité tous les deux</h2>
            <p className="mt-2 text-sm text-fg-2">
              Dès que son identité est vérifiée, votre fiche et la sienne gagnent chacune un bonus de mise en avant de {BONUS_PARRAINAGE} points pendant {DUREE_BONUS_JOURS} jours. Les bonus se cumulent jusqu’à {PLAFOND_BONUS} points.
            </p>
            <ol className="mt-5 space-y-3 text-sm">
              {['Invitez-le par email, depuis ce formulaire', 'Il revendique sa fiche et fait vérifier son identité', 'Le bonus s’active pour vous deux, vous êtes prévenus par email'].map((e, i) => (
                <li key={e} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-teal/15 text-xs font-semibold text-teal">{i + 1}</span>
                  <span className="text-fg">{e}</span>
                </li>
              ))}
            </ol>
            {parrainage.bonus.points > 0 && parrainage.bonus.jusquau ? (
              <p role="status" className="squircle-xl mt-6 flex items-start gap-2 bg-teal/10 px-3.5 py-2.5 text-sm text-teal">
                <BadgeCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  Bonus actif : +{parrainage.bonus.points} points jusqu’au {date(parrainage.bonus.jusquau)}
                  {parrainage.bonus.actifs > 1 ? ` (${parrainage.bonus.actifs} parrainages réussis)` : ''}.
                </span>
              </p>
            ) : (
              <p className="mt-6 text-xs text-fg-2">Aucun bonus en cours.{parrainage.reussis ? ` ${parrainage.reussis} parrainage${parrainage.reussis > 1 ? 's' : ''} réussi${parrainage.reussis > 1 ? 's' : ''} au total.` : ''}</p>
            )}
          </div>
          <div className="squircle-xl border border-line bg-bg p-5">
            <p className="flex items-center gap-2 font-semibold text-fg">
              <UserPlus className="size-4" aria-hidden /> Inviter des confrères
            </p>
            {sp.erreur && <Encart ton="erreur" className="mt-4">{sp.erreur}</Encart>}
            {sp.envoyees !== undefined && !sp.erreur && (
              <Encart className="mt-4">
                {envoyees ? `${envoyees} invitation${envoyees > 1 ? 's' : ''} envoyée${envoyees > 1 ? 's' : ''}.` : 'Aucune invitation envoyée.'}
                {ignorees ? ` ${ignorees} adresse${ignorees > 1 ? 's' : ''} ignorée${ignorees > 1 ? 's' : ''} : déjà invitée${ignorees > 1 ? 's' : ''}, déjà inscrite${ignorees > 1 ? 's' : ''} ou au-delà de la limite.` : ''}
              </Encart>
            )}
            {ouvert ? (
              <form action={inviterConfreres} className="mt-4">
                <input type="hidden" name="fiche" value={espace.fiche.slug} />
                <input type="hidden" name="q" value={q} />
                <label htmlFor="adresses" className="text-sm text-fg-2">
                  Leurs adresses email, séparées par une virgule ou un retour à la ligne
                </label>
                <textarea
                  id="adresses"
                  name="adresses"
                  rows={3}
                  required
                  disabled={!reste}
                  placeholder="dr.martin@cabinet.fr, cabinet.durand@orange.fr"
                  className="squircle-xl mt-2 w-full resize-y border border-line bg-bg px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong disabled:opacity-60"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-fg-2">
                    {reste ? `${reste} invitation${reste > 1 ? 's' : ''} disponible${reste > 1 ? 's' : ''} cette semaine` : 'Limite de la semaine atteinte'} · un seul rappel, à {RELANCE_JOURS} jours
                  </p>
                  <button type="submit" disabled={!reste} className={`${principal} w-auto px-5 disabled:opacity-60`}>
                    <Send className="size-4" aria-hidden /> Envoyer les invitations
                  </button>
                </div>
              </form>
            ) : (
              <Encart className="mt-4">Le parrainage s’ouvre dès que votre identité est vérifiée.</Encart>
            )}
            {parrainage.invitations.length > 0 && (
              <ul className="mt-5 max-h-56 divide-y divide-line overflow-y-auto border-t border-line text-sm">
                {parrainage.invitations.map((i) => (
                  <li key={i.email} className="flex items-center gap-3 py-2.5">
                    <Mail className="size-4 shrink-0 text-fg-2" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-fg">{i.email}</span>
                    <span className="hidden text-xs text-fg-2 sm:inline">{date(i.creeLe)}</span>
                    <span className={`squircle-full px-2 py-0.5 text-xs font-medium ${ETAT[i.etat].classe}`}>{ETAT[i.etat].libelle}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
      <Tuile className="mb-4 scroll-mt-24" id="reseaux">
        <TitreTuile i={QrCode}>Réseaux sociaux</TitreTuile>
        <div className="mt-4">
          <PartageReseaux praticien={espace.fiche.resume} profession={espace.fiche.profession} photo={espace.completee?.photoUrl ?? null} liens={{ affiche: court, qr: marque('qr'), story: marque('story') }} labo={espace.labo} ouvert={visuelsOuverts} palier={progression.actuel} message={sp.message === 'palier' ? 'palier' : 'fiche'} ferme={espace.ctx.identiteVerifiee ? `Les visuels se débloquent au palier ${palierVisuels.niveau}, ${palierVisuels.nom} : plus que ${palierVisuels.seuil - points.total} points. Complétez votre fiche depuis les missions.` : undefined} />
        </div>
        <div className="mt-6 border-t border-line pt-5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-fg">Texte pour une publication (LinkedIn, Facebook, Instagram)</p>
            <div className="mt-2">
              <Copier texte={legende} mono={false} />
            </div>
          </div>
        </div>
      </Tuile>
      <div className="grid gap-4 lg:grid-cols-2">
        <Tuile id="google" className="scroll-mt-24">
          <TitreTuile i={Link2} droite={<span className="squircle-full bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal">Le plus efficace</span>}>
            Votre lien pour la fiche Google
          </TitreTuile>
          <div className="mt-4">
            <Copier texte={google} affiche={google.replace(/^https?:\/\//, '')} />
          </div>
          <ol className="mt-5 space-y-3 text-sm">
            {['Ouvrez votre fiche d’établissement Google', 'Collez le lien dans « Site web » ou « Lien de prise de rendez-vous »', `Enregistrez : les ${espace.labo ? 'cabinets' : 'patients'} arrivent directement sur votre fiche`].map((e, i) => (
              <li key={e} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-bg-soft text-xs font-semibold text-fg">{i + 1}</span>
                <span className="text-fg">{e}</span>
              </li>
            ))}
          </ol>
          {lien.etat === 'actif' ? (
            <p role="status" className="squircle-xl mt-5 flex items-start gap-2 bg-teal/10 px-3.5 py-2.5 text-sm text-teal">
              <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Lien vérifié sur Google : dernier patient arrivé par votre fiche Google le {date(lien.dernier)}
                {lien.clics > 1 ? ` (${lien.clics} au total)` : ''}.
              </span>
            </p>
          ) : lien.etat === 'expire' ? (
            <p role="status" className="squircle-xl mt-5 flex items-start gap-2 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>Aucun patient arrivé par votre fiche Google depuis le {date(lien.dernier)} : le lien a peut-être été retiré. Vérifiez qu’il y figure toujours.</span>
            </p>
          ) : (
            <p role="status" className="squircle-xl mt-5 flex items-start gap-2 bg-bg-soft px-3.5 py-2.5 text-sm text-fg-2">
              <Hourglass className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>En attente du premier patient arrivé par votre fiche Google : la vérification se fait toute seule, puis se renouvelle à chaque visite (au moins une tous les {VALIDITE_LIEN_GOOGLE_JOURS} jours).</span>
            </p>
          )}
        </Tuile>
        <Tuile id="badge" className="scroll-mt-24">
          <TitreTuile i={Globe}>Badge pour le site du cabinet</TitreTuile>
          <div className="squircle-xl mt-4 flex items-center justify-center bg-bg-soft p-6">
            <a href={court} className="squircle-full inline-flex items-center gap-2 border border-line bg-bg px-4 py-2 text-sm font-medium text-fg">
              <ShieldCheck className="size-4 text-teal" aria-hidden /> Vérifié sur DentalMap
            </a>
          </div>
          <div className="mt-3">
            <Copier texte={badge} />
          </div>
          <p className="mt-2 text-xs text-fg-2">Un lien HTML simple, sans script : il compte comme un lien vers votre fiche pour les moteurs. Votre lien court, à partager partout ailleurs : {court.replace(/^https?:\/\//, '')}</p>
        </Tuile>
      </div>
    </CoqueEspace>
  )
}
