import Link from 'next/link'
import { ArrowRight, Award, Check, CheckCircle2, ChevronRight, CircleDashed, Clock, Eye, Lock, RefreshCw, Search, Share2, Sparkles, Star, type LucideIcon } from 'lucide-react'
import { CarteFixe } from './carte-fixe'
import { chemin } from '@/lib/navigation'
import type { Profession } from '@/lib/annuaire/types'
import type { PraticienProche } from '@/lib/annuaire/queries'
import type { Filtre, Fraicheur, Mission } from '@/lib/espace-pro/force'
import { Anneau } from './apercu'
import { TitreTuile, Tuile } from './coque'

/** La tuile sombre de la vue d'ensemble : l'état de la fiche, l'anneau, quatre chiffres, la prochaine action. */
export function TuileSombre({
  etiquette,
  titre,
  sousTitre,
  texte,
  pct,
  legende,
  chiffres,
  action,
}: {
  etiquette: string
  titre: string
  /** Sous le titre, sur une ligne : le nom de l'établissement quand le titre salue la personne. */
  sousTitre?: string
  texte: string
  pct: number
  legende: string
  chiffres: [string, string][]
  action: { meta: string; titre: string; href: string; i: LucideIcon } | null
}) {
  return (
    <section className="dark squircle-2xl relative overflow-hidden bg-background p-6 text-fg sm:p-8">
      <div className="flex flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:gap-8">
        <div className="max-w-md">
          <span className="squircle-full inline-flex items-center gap-1.5 bg-teal/15 px-2.5 py-0.5 text-xs font-medium text-teal ring-1 ring-inset ring-teal/30">
            <CheckCircle2 className="size-3.5" aria-hidden /> {etiquette}
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">{titre}</h2>
          {sousTitre && <p className="mt-1 truncate text-sm font-medium text-white/85">{sousTitre}</p>}
          <p className="mt-3 text-white/70">{texte}</p>
        </div>
        <Anneau pct={pct} taille={148} sombre legende={legende} />
      </div>
      <dl className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {chiffres.map(([v, l]) => (
          <div key={l} className="border-white/10 md:border-l md:pl-4 md:first:border-0 md:first:pl-0">
            <dt className="text-2xl font-semibold text-white">{v}</dt>
            <dd className="mt-1 text-xs text-white/60">{l}</dd>
          </div>
        ))}
      </dl>
      {action && (
        <div className="squircle-xl mt-10 flex flex-wrap items-center gap-4 bg-white/5 p-4 ring-1 ring-white/10">
          <span className="squircle-lg grid size-10 place-items-center bg-amber-100 text-amber-700">
            <action.i className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">Prochaine action · {action.meta}</p>
            <p className="font-semibold text-white">{action.titre}</p>
          </div>
          <Link href={chemin(action.href)} className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action-hover">
            Commencer <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      )}
    </section>
  )
}

/** L'aperçu public : la carte de résultat telle que la recherche du site la montre. */
export function ApercuPublic({ praticien, profession, photo, enDirect = false }: { praticien: PraticienProche; profession: Profession; photo?: string | null; /** La carte suit la photo choisie dans la page (mission Photo). */ enDirect?: boolean }) {
  return (
    <Tuile>
      <TitreTuile i={Eye}>Aperçu public</TitreTuile>
      <ul className="mt-4 [&_li]:min-h-[24rem]">
        <CarteFixe praticien={praticien} profession={profession} photo={photo} enDirect={enDirect} />
      </ul>
      <p className="mt-3 text-center text-xs text-fg-2">Mis à jour en direct à chaque modification.</p>
    </Tuile>
  )
}

export function TuileMissions({ missions, q }: { missions: Mission[]; q: string }) {
  const restantes = missions.filter((m) => !m.faite)
  const reco = [...restantes].sort((a, b) => b.gain - a.gain || a.minutes - b.minutes)[0]
  return (
    <Tuile>
      <TitreTuile i={Sparkles} droite={<Link href={chemin(`/espace-pro/progression/${q}`)} className="text-sm text-fg underline-offset-4 hover:underline">Progression</Link>}>
        À faire
      </TitreTuile>
      {restantes.length === 0 ? (
        <p className="mt-4 text-sm text-fg-2">Tout est fait. Il reste l’entretien : reconfirmer quand on vous le demande.</p>
      ) : (
        <ul className="mt-4 space-y-1">
          {restantes.map((m) => (
            <li key={m.cle}>
              <Link href={chemin(`${m.href}${q}`)} className={`squircle-xl flex items-center gap-3 p-3 hover:bg-bg-soft ${m === reco ? 'bg-amber-50 ring-1 ring-amber-200 hover:bg-amber-50 dark:bg-amber-400/10 dark:ring-amber-400/30' : ''}`}>
                <CircleDashed className="size-5 text-fg-2" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-fg">{m.titre}</span>
                  <span className={`block text-xs ${m === reco ? 'text-amber-700 dark:text-amber-300' : 'text-fg-2'}`}>
                    {m === reco ? 'Recommandée · ' : ''}
                    {m.minutes} min
                  </span>
                </span>
                <span className={`squircle-full px-2 py-0.5 text-xs font-medium ${m.gain ? 'bg-teal/10 text-teal' : 'bg-bg-soft text-fg-2'}`}>{m.gain ? `+${m.gain} pts` : 'Hors barème'}</span>
                <ChevronRight className="size-4 text-fg-2" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Tuile>
  )
}

/** `cabinets` pour un laboratoire : ce sont eux qui le cherchent, pas des patients. */
export function TuileFiltres({ filtres, public: lecteurs = 'patients' }: { filtres: Filtre[]; public?: 'patients' | 'cabinets' }) {
  const actifs = filtres.filter((f) => f.actif).length
  return (
    <Tuile>
      <TitreTuile i={Search}>Où les {lecteurs} vous trouvent</TitreTuile>
      <div className="mt-4 flex flex-wrap gap-2">
        {filtres.map((f) => (
          <span key={f.libelle} className={`squircle-full inline-flex items-center gap-1.5 px-3 py-1.5 text-sm ${f.actif ? 'bg-teal/10 text-teal' : 'border border-dashed border-line text-fg-2'}`}>
            {f.actif ? <Check className="size-3.5" aria-hidden /> : <Lock className="size-3.5" aria-hidden />} {f.libelle}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs text-fg-2">
        {actifs} filtre{actifs > 1 ? 's' : ''} actif{actifs > 1 ? 's' : ''} sur {filtres.length}.{actifs < filtres.length ? ' Les autres s’ouvrent avec les missions.' : ''}
      </p>
    </Tuile>
  )
}

/** « Rappel dans 73 jours », « Valable 12 mois », « À reconfirmer ». */
export function etatFraicheur(f: Fraicheur): string {
  const reste = f.validite - f.jours
  if (f.etat === 'expire') return 'Expirés : hors « Ouvert maintenant »'
  if (f.etat === 'a_reconfirmer') return 'À reconfirmer'
  if (f.cle === 'horaires') return `Rappel dans ${Math.max(0, 75 - f.jours)} jours`
  if (reste > 60) return `Valable ${Math.round(reste / 30)} mois`
  return `Valable ${reste} jours`
}

export function TuileFraicheur({ fraicheur, note, href }: { fraicheur: Fraicheur[]; note?: string; href: string }) {
  return (
    <Tuile>
      <TitreTuile i={RefreshCw} droite={<Link href={chemin(href)} className="text-sm text-fg underline-offset-4 hover:underline">Gérer</Link>}>
        Fraîcheur des informations
      </TitreTuile>
      {fraicheur.length === 0 ? (
        <p className="mt-4 text-sm text-fg-2">Rien à reconfirmer pour l’instant.</p>
      ) : (
        <ul className="mt-4 space-y-4 text-sm">
          {fraicheur.slice(0, 4).map((f) => {
            const alerte = f.etat !== 'a_jour'
            return (
              <li key={f.cle}>
                <div className="flex justify-between gap-3">
                  <span className="text-fg">{f.libelle}</span>
                  <span className={alerte ? 'text-amber-700 dark:text-amber-300' : 'text-fg-2'}>{etatFraicheur(f)}</span>
                </div>
                <span className="mt-2 block h-1 rounded-full bg-line">
                  <span className={`block h-full rounded-full ${alerte ? 'bg-amber-400' : 'bg-teal'}`} style={{ width: `${Math.max(f.part * 100, 3)}%` }} />
                </span>
              </li>
            )
          })}
        </ul>
      )}
      {note && <p className="mt-4 text-xs text-fg-2">{note}</p>}
    </Tuile>
  )
}

export function TuileActivite({ items }: { items: { texte: string; quand: string }[] }) {
  return (
    <Tuile>
      <TitreTuile i={Clock}>Activité récente</TitreTuile>
      <ul className="mt-2 divide-y divide-line text-sm">
        {items.map((a) => (
          <li key={a.texte} className="flex justify-between gap-4 py-3">
            <span className="text-fg">{a.texte}</span>
            <span className="shrink-0 text-fg-2">{a.quand}</span>
          </li>
        ))}
      </ul>
    </Tuile>
  )
}

/**
 * J : la célébration du palier Exemplaire, par-dessus la vue d'ensemble.
 * Sans animation : les étoiles sont posées, rien ne bouge.
 */
export function Celebration({ pct, partager, fermer, labo = false }: { pct: number; partager: string; fermer: string; labo?: boolean }) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="celebration-titre" className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-[#0e1317]/55 px-4 pt-24">
      <div className="squircle-2xl mx-auto w-full max-w-md bg-bg p-8 text-center shadow-pop">
        <div className="mx-auto flex w-fit gap-2 text-amber-500">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="size-3 fill-current" aria-hidden />
          ))}
        </div>
        <span className="mx-auto mt-6 grid size-24 place-items-center rounded-full border-4 border-teal text-3xl font-semibold text-fg">{pct} %</span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-teal">Palier atteint</p>
        <h2 id="celebration-titre" className="mt-2 text-2xl font-semibold tracking-tight text-fg">
          Votre fiche est exemplaire
        </h2>
        <p className="mt-2 text-fg-2">
          {labo ? 'Les cabinets ont tout ce qu’il leur faut pour vous confier leurs travaux.' : 'Les patients ont tout ce qu’il leur faut pour vous choisir et venir.'}
        </p>
        <div className="squircle-xl mt-6 flex items-center gap-3 bg-amber-50 p-4 text-left ring-1 ring-amber-200 dark:bg-amber-400/10 dark:ring-amber-400/30">
          <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-amber-500 text-amber-700 dark:text-amber-300">
            <Award className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-fg">Distinction « Fiche exemplaire »</p>
            <p className="text-xs text-fg-2">Privée : visible dans votre espace seulement.</p>
          </div>
        </div>
        <Link href={chemin(partager)} className="mt-6 flex h-11 items-center justify-center gap-2 rounded-full bg-action text-sm font-semibold text-action-foreground hover:bg-action-hover">
          <Share2 className="size-4" aria-hidden /> Partager ma fiche
        </Link>
        <Link href={chemin(fermer)} autoFocus className="mt-3 block text-sm font-medium text-fg hover:underline">
          Revenir au tableau de bord
        </Link>
      </div>
    </div>
  )
}
