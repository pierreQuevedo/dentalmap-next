import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Globe, Link2, MapPin, Megaphone, QrCode, ShieldCheck, Smartphone, type LucideIcon } from 'lucide-react'
import { CoqueEspace, TitreTuile, Tuile } from '@/components/espace/coque'
import { chemin } from '@/lib/navigation'
import { getStatistiques } from '@/lib/espace-pro/statistiques'
import type { CleSource } from '@/lib/espace-pro/sources'
import { chargerTableau } from '../_commun'

export const metadata: Metadata = { title: 'Statistiques', robots: { index: false, follow: false } }
export const instant = false

const ICONE: Record<CleSource, LucideIcon> = { google: MapPin, story: Smartphone, qr: QrCode, reseaux: Megaphone, badge: Globe, direct: Link2 }

/** L'écart à la période précédente, en pourcentage ; rien à comparer sans visite avant. */
function Evolution({ maintenant, avant }: { maintenant: number; avant: number }) {
  if (!avant) return maintenant ? <span className="text-xs font-medium text-teal">Nouveau</span> : null
  const ecart = Math.round(((maintenant - avant) / avant) * 100)
  const hausse = ecart >= 0
  const I = hausse ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${hausse ? 'text-teal' : 'text-amber-700 dark:text-amber-300'}`}>
      <I className="size-3.5" aria-hidden />
      {hausse ? '+' : ''}
      {ecart} %
    </span>
  )
}

/**
 * Les visites arrivées par les liens de partage, sur trente jours : par jour
 * et par canal (fiche Google, story, code QR, publications, site du cabinet,
 * lien direct). Chaque lien de « Partager » porte sa source dans l'adresse.
 */
export default async function Page(props: { searchParams: Promise<{ fiche?: string }> }) {
  const sp = await props.searchParams
  const { espace, coque, q } = await chargerTableau('statistiques', sp.fiche)
  const stats = await getStatistiques(espace.fiche.id, 30)
  const max = Math.max(1, ...stats.parJour.map((j) => j.nombre))
  const meilleure = stats.parSource[0]
  const actifs = stats.parJour.filter((j) => j.nombre > 0).length
  const date = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  return (
    <CoqueEspace c={coque} actif="statistiques" titre="Statistiques" sousTitre="Les visites arrivées par vos liens de partage, sur les 30 derniers jours">
      <div className="grid gap-4 sm:grid-cols-3">
        <Tuile>
          <p className="text-sm text-fg-2">Visites par vos liens</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-fg">{stats.total}</span>
            <Evolution maintenant={stats.total} avant={stats.precedent} />
          </p>
          <p className="mt-1 text-xs text-fg-2">{stats.precedent ? `${stats.precedent} les 30 jours d’avant` : '30 derniers jours'}</p>
        </Tuile>
        <Tuile>
          <p className="text-sm text-fg-2">Meilleur canal</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-fg">{meilleure?.nombre ? meilleure.libelle : '—'}</p>
          <p className="mt-1 text-xs text-fg-2">{meilleure?.nombre ? `${Math.round((meilleure.nombre / stats.total) * 100)} % des visites` : 'Pas encore de visite'}</p>
        </Tuile>
        <Tuile>
          <p className="text-sm text-fg-2">Jours avec au moins une visite</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-fg">{actifs}</p>
          <p className="mt-1 text-xs text-fg-2">sur 30</p>
        </Tuile>
      </div>

      <Tuile className="mt-4">
        <TitreTuile i={BarChart3}>Visites par jour</TitreTuile>
        {stats.total === 0 ? (
          <div className="squircle-xl mt-4 flex flex-wrap items-center justify-between gap-4 bg-bg-soft p-5">
            <p className="text-sm text-fg-2">Aucune visite pour l’instant. Mettez votre lien dans votre fiche Google et partagez votre visuel : chaque canal apparaîtra ici.</p>
            <Link href={chemin(`/espace-pro/partager/${q}`)} className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
              Partager ma fiche <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 flex h-44 items-end gap-[3px]" role="img" aria-label={`Visites par jour, de ${date(stats.parJour[0].jour)} à aujourd’hui : ${stats.total} au total`}>
              {stats.parJour.map((j) => (
                <div key={j.jour} title={`${date(j.jour)} : ${j.nombre} visite${j.nombre > 1 ? 's' : ''}`} className="group relative flex h-full flex-1 items-end">
                  <div className={`w-full rounded-t-[3px] ${j.nombre ? 'bg-teal group-hover:bg-teal/80' : 'bg-line'}`} style={{ height: j.nombre ? `${Math.max(6, (j.nombre / max) * 100)}%` : '3px' }} />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-fg-2">
              <span>{date(stats.parJour[0].jour)}</span>
              <span>Aujourd’hui</span>
            </div>
          </>
        )}
      </Tuile>

      <Tuile className="mt-4 p-0">
        <div className="px-5 pt-5">
          <TitreTuile i={Link2}>Par canal</TitreTuile>
        </div>
        <ul className="mt-3 divide-y divide-line">
          {stats.parSource.map((s) => {
            const I = ICONE[s.cle]
            const part = stats.total ? s.nombre / stats.total : 0
            return (
              <li key={s.cle} className="flex items-center gap-4 px-5 py-3.5">
                <span className="squircle-lg grid size-10 shrink-0 place-items-center bg-bg-soft text-fg">
                  <I className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-fg">{s.libelle}</p>
                  <p className="truncate text-xs text-fg-2">{s.detail}</p>
                  <span className="mt-2 block h-1 rounded-full bg-line">
                    <span className="block h-full rounded-full bg-teal" style={{ width: `${part * 100}%` }} />
                  </span>
                </div>
                <div className="w-20 shrink-0 text-right">
                  <p className="text-sm font-semibold text-fg">{s.nombre}</p>
                  <Evolution maintenant={s.nombre} avant={s.precedent} />
                </div>
              </li>
            )
          })}
        </ul>
      </Tuile>

      <p className="mt-4 flex items-start gap-2 text-xs text-fg-2">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Un simple compteur par jour et par canal : ni cookie, ni adresse IP, rien qui identifie le visiteur. Les robots et les aperçus de liens des messageries ne comptent pas. Les visites venues de la recherche DentalMap ne sont pas incluses.
      </p>
    </CoqueEspace>
  )
}
