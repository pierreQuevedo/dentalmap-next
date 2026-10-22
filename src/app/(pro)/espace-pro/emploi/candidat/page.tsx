import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BellRing, GraduationCap, ListChecks, Plus, Sparkles } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { CarteOffre } from '@/components/emploi/blocs'
import { OngletsEmploi, SousOngletsCandidat } from '@/components/emploi/espace-offres'
import { chemin } from '@/lib/navigation'
import { FREQUENCES, pucesAlerte, titreAlerte } from '@/lib/emploi/alertes-compte'
import { getAlertesCompte } from '@/lib/emploi/alertes-compte-donnees'
import { getProfilCandidat } from '@/lib/emploi/candidat-donnees'
import { getCandidaturesEnvoyees } from '@/lib/emploi/candidatures-donnees'
import { getOffresPourVous } from '@/lib/emploi/pour-vous'
import { VISIBILITES, completudeProfil, libelleQualification } from '@/lib/emploi/profil-candidat'
import { Frise } from '@/components/emploi/frise-candidature'
import { chargerEmploi } from '../../_commun'

export const metadata: Metadata = { title: 'Emploi, vue d’ensemble', robots: { index: false, follow: false } }
export const instant = false

/**
 * CAND-VUE et ETU-VUE : le point d'arrivée de l'Emploi côté candidat. Le
 * profil (complétude, prochaine étape), quelques chiffres, l'alerte active,
 * les offres pour vous et les candidatures en cours.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const sp = await props.searchParams
  const { compte, coque, q, espace } = await chargerEmploi('candidat', sp.fiche)
  const [profil, candidatures, alertes] = await Promise.all([getProfilCandidat(compte.id), getCandidaturesEnvoyees(compte.id), getAlertesCompte(compte.id)])
  const pourVous = profil ? await getOffresPourVous(profil, compte.id) : null
  const enCours = candidatures.filter((k) => k.statut !== 'non_retenue')
  const retenues = candidatures.filter((k) => k.statut === 'retenue').length
  const alerte = alertes.find((a) => a.active)
  const prenom = (compte.nom ?? '').split(' ')[0]
  const c = profil ? completudeProfil(profil) : null
  const etudiant = profil?.situation === 'etudiant'
  const lien = (p: string) => `/espace-pro/emploi/${p}/${q}`
  const aujourdhui = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <CoqueEspace
      c={coque}
      actif="emploi"
      titre="Emploi"
      sousTitre={`${aujourdhui.charAt(0).toUpperCase()}${aujourdhui.slice(1)}${pourVous ? ` · ${pourVous.offres.length} offre${pourVous.offres.length > 1 ? 's' : ''} près de chez vous` : ''}`}
    >
      <OngletsEmploi actif="mes" q={q} sansFiche={!espace} />
      <SousOngletsCandidat actif="vue" q={q} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="squircle-2xl relative overflow-hidden bg-gradient-to-br from-[#134E4A] to-[#0B1F1D] p-5 text-white">
          {profil && c ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#BFE3D6]">Profil {VISIBILITES.find((v) => v.cle === profil.visibilite)?.libelle.toLowerCase()}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Bonjour {prenom || 'à vous'}</h2>
              <p className="mt-1 max-w-xl text-sm text-white/75">
                {libelleQualification(profil)}.{' '}
                {profil.visibilite === 'discret'
                  ? 'Votre profil est discret : seuls les recruteurs auxquels vous postulez le voient.'
                  : `Votre profil est visible des recruteurs vérifiés${profil.visibilite === 'anonyme' ? ', sans votre nom' : ''}.`}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/15">
                  <span className="absolute inset-y-0 left-0 rounded-full bg-[#BFE3D6]" style={{ width: `${c.pct}%` }} />
                </span>
                <span className="text-sm font-semibold tabular-nums">{c.pct} %</span>
                <span className="text-xs text-white/60">profil complet</span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(
                  [
                    [String(pourVous?.offres.length ?? 0), 'offres près de vous'],
                    [String(enCours.length), `candidature${enCours.length > 1 ? 's' : ''} en cours`],
                    [String(retenues), `candidature${retenues > 1 ? 's' : ''} retenue${retenues > 1 ? 's' : ''}`],
                    [`${profil.criteres.rayonKm} km`, 'rayon de recherche'],
                  ] as const
                ).map(([v, l]) => (
                  <div key={l} className="squircle-xl bg-white/[0.07] px-3 py-2.5">
                    <dt className="sr-only">{l}</dt>
                    <dd className="text-xl font-semibold tabular-nums">{v}</dd>
                    <dd className="text-xs text-white/65">{l}</dd>
                  </div>
                ))}
              </dl>
              {c.prochaine && (
                <Link
                  href={chemin(`${lien('profil-candidat')}${c.prochaine.ancre}`)}
                  className="squircle-xl mt-4 flex items-center gap-3 bg-white/10 px-3 py-2.5 text-sm hover:bg-white/15"
                >
                  <span className="squircle-full shrink-0 bg-[#BFE3D6] px-2 py-0.5 text-xs font-semibold text-[#0B1F1D]">+{c.prochaine.gain} %</span>
                  <span className="min-w-0 flex-1 font-medium">{c.prochaine.titre}</span>
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                </Link>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold tracking-tight">Bonjour {prenom || 'à vous'}</h2>
              <p className="mt-2 max-w-xl text-sm text-white/75">Créez votre profil candidat en une minute : il accompagne vos candidatures, et vous recevez les offres qui vous correspondent, triées par distance.</p>
              <Link href={chemin(lien('bienvenue/situation'))} className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0B1F1D] hover:bg-[#BFE3D6]">
                Créer mon profil candidat <ArrowRight className="size-4" aria-hidden />
              </Link>
            </>
          )}
        </section>

        <aside className="space-y-4">
          {etudiant && profil?.formation && (
            <Tuile>
              <TitreTuile i={GraduationCap}>Votre formation</TitreTuile>
              <p className="mt-4 text-sm font-semibold text-fg">{profil.formation.ecoleNom ?? 'École à indiquer'}</p>
              <p className="text-xs text-fg-2">{[profil.formation.cursus, profil.formation.annee].filter(Boolean).join(', ')}</p>

            </Tuile>
          )}
          <Tuile>
            <TitreTuile i={BellRing} droite={<Link href={chemin(lien('alertes'))} className="text-sm text-fg hover:underline">Gérer</Link>}>
              {alerte ? 'Alerte active' : 'Alertes'}
            </TitreTuile>
            {alerte ? (
              <>
                <p className="mt-4 text-sm font-semibold text-fg">{alerte.titre ?? titreAlerte(alerte.criteres)}</p>
                <p className="mt-1 text-sm text-fg-2">{pucesAlerte(alerte.criteres, alerte.lieu).slice(1).join(' · ')}</p>
                <p className="mt-3 text-xs text-fg-2">
                  {FREQUENCES.find((f) => f.cle === alerte.frequence)?.libelle} par email
                  {alerte.dernierEnvoiLe ? ` · dernier envoi le ${alerte.dernierEnvoiLe.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : ''}
                </p>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm text-fg-2">Recevez les nouvelles offres par email, chaque jour ou chaque semaine.</p>
                <Link href={chemin(`${lien('alertes')}${q ? '&' : '?'}alerte=nouvelle`)} className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-fg px-4 text-xs font-semibold text-bg">
                  <Plus className="size-3.5" aria-hidden /> Créer une alerte
                </Link>
              </>
            )}
          </Tuile>
        </aside>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Tuile>
          <TitreTuile i={Sparkles} droite={<Link href={chemin(lien('pour-vous'))} className="text-sm text-fg hover:underline">Tout voir</Link>}>
            {etudiant ? 'Alternances et stages pour vous' : 'Offres pour vous'}
          </TitreTuile>
          {pourVous?.offres.length ? (
            <ul className="mt-4 space-y-2">
              {/* Une offre et une candidature : la vue d'ensemble tient dans l'écran, « Tout voir » mène au reste. */}
              {pourVous.offres.slice(0, 1).map((o) => (
                <CarteOffre key={o.id} o={o} forme="compacte" />
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-fg-2">{profil ? (pourVous ? 'Aucune offre dans votre rayon pour l’instant.' : 'Indiquez votre ville dans votre profil pour voir les offres autour de vous.') : 'Votre profil candidat permet de vous proposer des offres.'}</p>
          )}
        </Tuile>
        <Tuile>
          <TitreTuile i={ListChecks} droite={<Link href={chemin(lien('mes-candidatures'))} className="text-sm text-fg hover:underline">Tout voir</Link>}>
            Candidatures en cours
          </TitreTuile>
          {enCours.length ? (
            <ul className="mt-2 divide-y divide-line">
              {enCours.slice(0, 1).map((k) => (
                <li key={k.id} className="py-4">
                  <Link href={chemin(lien('mes-candidatures'))} className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-fg">{k.offre.titre}</span>
                      <span className="block text-xs text-fg-2">
                        {k.offre.recruteur}
                        {k.offre.commune ? `, ${k.offre.commune}` : ''}
                      </span>
                    </span>
                  </Link>
                  <div className="mt-3">
                    <Frise statut={k.statut} type={k.offre.laboratoire ? 'laboratoire' : 'cabinet'} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-fg-2">Aucune candidature en cours. Le bouton « Postuler » d’une offre envoie votre profil et votre message.</p>
          )}
        </Tuile>
      </div>
    </CoqueEspace>
  )
}
