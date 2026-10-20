import type { Metadata } from 'next'
import Link from 'next/link'
import { BellRing, Check, Clock, Mail, Pause, Pencil, Play, Plus, Search, Trash2 } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { OngletsEmploi, SousOngletsCandidat } from '@/components/emploi/espace-offres'
import { FormulaireAlerte, type ValeursAlerte } from '@/components/emploi/formulaire-alerte'
import { chemin } from '@/lib/navigation'
import { agirSurAlerte } from '@/lib/emploi/actions-alertes-compte'
import { ALERTES_MAX, FREQUENCES, pucesAlerte, titreAlerte } from '@/lib/emploi/alertes-compte'
import { getAlertesCompte } from '@/lib/emploi/alertes-compte-donnees'
import { getProfilCandidat } from '@/lib/emploi/candidat-donnees'
import { situationDe } from '@/lib/emploi/profil-candidat'
import { chargerEmploi } from '../../_commun'

export const metadata: Metadata = { title: 'Alertes emploi', robots: { index: false, follow: false } }
export const instant = false

const MESSAGES: Record<string, string> = {
  creee: 'Alerte créée : vous recevez les nouvelles offres par email.',
  modifiee: 'Alerte enregistrée.',
  pause: 'Alerte en pause : plus aucun email jusqu’à sa reprise.',
  reprendre: 'Alerte réactivée.',
  supprimee: 'Alerte supprimée.',
}

function Geste({ id, geste, children, danger }: { id: string; geste: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <form action={agirSurAlerte}>
      <input type="hidden" name="alerte" value={id} />
      <input type="hidden" name="geste" value={geste} />
      <button type="submit" className={`inline-flex cursor-pointer items-center gap-1 text-sm font-medium ${danger ? 'text-fg-2 hover:text-destructive' : 'text-fg hover:underline'}`}>
        {children}
      </button>
    </form>
  )
}

/**
 * CAND-ALERTES, sous « Mes candidatures » : une alerte par jeu de critères
 * (métiers, contrats, ville et rayon), chaque jour ou chaque semaine, par
 * email seulement s'il y a du nouveau. Pause, reprise, modification,
 * suppression. `?alerte=nouvelle` ou `?alerte=<id>` ouvre la fenêtre.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string; alerte?: string; fait?: string }> }) {
  const sp = await props.searchParams
  const { compte, coque, q, espace } = await chargerEmploi('alertes', sp.fiche)
  const [alertes, profil] = await Promise.all([getAlertesCompte(compte.id), getProfilCandidat(compte.id)])
  const actives = alertes.filter((a) => a.active).length
  const base = `/espace-pro/emploi/alertes/${q}`
  const avec = (x: string) => `${base}${q ? '&' : '?'}${x}`
  const ouverte = sp.alerte && sp.alerte !== 'nouvelle' ? alertes.find((a) => a.id === sp.alerte) : undefined
  const metierProfil = situationDe(profil?.situation)?.metier
  const valeurs: ValeursAlerte | null = ouverte
    ? { id: ouverte.id, titre: ouverte.titre ?? '', metiers: ouverte.criteres.metiers, contrats: ouverte.criteres.contrats, commune: ouverte.criteres.commune ?? null, communeNom: ouverte.communeNom ?? '', rayonKm: ouverte.criteres.rayonKm ?? 15, frequence: ouverte.frequence }
    : sp.alerte === 'nouvelle'
      ? // Une nouvelle alerte reprend les critères du profil candidat.
        { titre: '', metiers: metierProfil ? [metierProfil] : [], contrats: profil?.criteres.contrats ?? [], commune: profil?.criteres.commune ?? null, communeNom: profil?.criteres.communeNom ?? '', rayonKm: profil?.criteres.rayonKm ?? 15, frequence: 'quotidienne' }
      : null

  return (
    <CoqueEspace c={coque} actif="emploi" titre="Emploi" sousTitre={alertes.length ? `${actives} alerte${actives > 1 ? 's' : ''} active${actives > 1 ? 's' : ''} · vous êtes prévenu dès qu’une offre correspond` : 'Alertes emploi : les nouvelles offres par email'}>
      <OngletsEmploi actif="mes" q={q} sansFiche={!espace} />
      <SousOngletsCandidat actif="alertes" q={q} />
      {sp.fait && MESSAGES[sp.fait] && (
        <p role="status" className="squircle-xl mb-4 flex items-center gap-2 bg-teal/10 px-4 py-3 text-sm text-teal">
          <Check className="size-4 shrink-0" aria-hidden /> {MESSAGES[sp.fait]}
        </p>
      )}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-3">
          {alertes.length < ALERTES_MAX && (
            <div className="flex justify-end">
              <Link href={chemin(avec('alerte=nouvelle'))} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                <Plus className="size-4" aria-hidden /> Créer une alerte
              </Link>
            </div>
          )}
          {alertes.length === 0 ? (
            <Tuile>
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-bg-soft text-teal">
                  <BellRing className="size-5" aria-hidden />
                </span>
                <p className="mt-3 font-semibold text-fg">Aucune alerte pour l’instant</p>
                <p className="mt-1 max-w-sm text-sm text-fg-2">Une alerte vous envoie les nouvelles offres qui répondent à vos critères, triées par distance, rémunération affichée.</p>
              </div>
            </Tuile>
          ) : (
            <ul className="space-y-3">
              {alertes.map((a) => (
                <li key={a.id} className={`squircle-2xl border border-line bg-bg p-5 ${a.active ? '' : 'opacity-75'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-fg">{a.titre ?? titreAlerte(a.criteres)}</p>
                      <p className={`mt-0.5 text-xs ${a.active ? 'text-teal' : 'text-fg-2'}`}>
                        {a.active ? 'Active' : 'En pause'}
                        {a.dernierEnvoiLe ? ` · dernier envoi le ${a.dernierEnvoiLe.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : ''}
                      </p>
                    </div>
                    <Geste id={a.id} geste={a.active ? 'pause' : 'reprendre'}>
                      {a.active ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />} {a.active ? 'Mettre en pause' : 'Reprendre'}
                    </Geste>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pucesAlerte(a.criteres, a.lieu).map((c) => (
                      <span key={c} className="squircle-full bg-bg-soft px-2.5 py-1 text-xs text-fg">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-sm text-fg-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-4" aria-hidden /> {FREQUENCES.find((f) => f.cle === a.frequence)?.libelle}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-4" aria-hidden /> Email
                    </span>
                    <span className="ml-auto flex items-center gap-4">
                      <Link href={chemin(avec(`alerte=${a.id}`))} className="inline-flex items-center gap-1 font-medium text-fg hover:underline">
                        <Pencil className="size-3.5" aria-hidden /> Modifier
                      </Link>
                      <Geste id={a.id} geste="supprimer" danger>
                        <Trash2 className="size-3.5" aria-hidden /> Supprimer
                      </Geste>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <aside>
          <Tuile>
            <TitreTuile i={Search}>Comment ça marche</TitreTuile>
            <p className="mt-3 text-sm text-fg-2">Une alerte reprend vos critères de recherche. Les offres arrivent triées par distance, avec la rémunération affichée.</p>
            <p className="mt-3 text-sm text-fg-2">Vous pouvez mettre une alerte en pause sans la supprimer, par exemple pendant une période d’essai.</p>
            <p className="mt-3 text-sm text-fg-2">Les offres des structures que vous avez masquées ne vous sont jamais envoyées.</p>
          </Tuile>
        </aside>
      </div>
      {valeurs && <FormulaireAlerte v={valeurs} fermer={base} />}
    </CoqueEspace>
  )
}
