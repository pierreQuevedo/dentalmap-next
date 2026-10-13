/**
 * MAQUETTE. Blocs partagés des fiches métier : carte de métier, marque
 * « À valider », salaires par secteur en barres, appel vers les offres.
 */
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, Bell, Briefcase, GraduationCap } from 'lucide-react'
import { euros } from '../emploi/_blocs'
import { METIERS, SECTEURS, type Fiche, type MetierCarte } from './_donnees'

export const ARIANE = [
  { libelle: 'Accueil', href: '/' },
  { libelle: 'Ressources', href: '/conseils/' },
  { libelle: 'Métiers', href: '/conseils/metiers/' },
]

export function AValider({ sombre }: { sombre?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${sombre ? 'bg-amber-300/15 text-amber-200' : 'bg-amber-100 text-amber-900'}`}
    >
      À valider
    </span>
  )
}

export function Rubrique({ sombre }: { sombre?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-medium ${sombre ? 'text-white/70' : 'text-fg-2'}`}>
      <span aria-hidden className="size-2 rounded-full bg-teal" />
      Métiers
    </span>
  )
}

export function CarteMetier({ m, grande }: { m: MetierCarte; grande?: boolean }) {
  return (
    <a className="group squircle-3xl relative flex min-h-80 flex-col justify-end overflow-hidden bg-neutral-900 p-6 text-white">
      <Image src={m.photo} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-[1.03]" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="relative">
        <h3 className={`font-semibold tracking-tight ${grande ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>{m.nom}</h3>
        <p className="mt-1 text-white/75">{m.accroche}</p>
        <div className="mt-5 flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
            <GraduationCap className="mr-1 inline size-3.5" aria-hidden />
            {m.formation}
          </span>
          {m.salaire !== null && <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">{euros(m.salaire)} € brut moyen</span>}
          <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">{euros(m.offres)} offres</span>
        </div>
      </div>
      <ArrowUpRight className="absolute right-5 top-5 size-5 text-white/80" aria-hidden />
    </a>
  )
}

/** Salaire moyen par secteur, en barres horizontales. */
export function SalairesBarres({ valeurs, sombre }: { valeurs: (number | null)[]; sombre?: boolean }) {
  const max = Math.max(...valeurs.filter((v): v is number => v !== null))
  return (
    <div>
      <ul className="space-y-4">
        {SECTEURS.map((s, i) => {
          const v = valeurs[i]
          return (
            <li key={s} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 gap-y-2">
              <span className={`text-sm ${sombre ? 'text-white/70' : 'text-fg-2'}`}>{s}</span>
              <span className={`text-right font-semibold tabular-nums ${sombre ? 'text-white' : 'text-fg'}`}>{v === null ? 'Peu de postes' : `${euros(v)} €`}</span>
              <span className={`col-span-2 h-2.5 rounded-full ${sombre ? 'bg-white/10' : 'bg-bg-soft'}`}>
                {v !== null && <span className="block h-full rounded-full bg-teal" style={{ width: `${(v / max) * 100}%` }} />}
              </span>
            </li>
          )
        })}
      </ul>
      <p className={`mt-4 text-xs ${sombre ? 'text-white/55' : 'text-fg-2'}`}>Brut mensuel moyen, temps plein, issu d’études salariales. Source : étude à citer, année.</p>
    </div>
  )
}

/** Bandeau final : passer de la fiche aux offres. */
export function AppelOffres({ f }: { f: Fiche }) {
  const m = f.metier
  return (
    <section className="container pb-20">
      <div className="squircle-3xl dark relative overflow-hidden bg-background p-8 text-fg md:p-12">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-teal/30 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-6xl font-semibold tabular-nums tracking-tight text-white md:text-7xl">{euros(m.offres)}</p>
            <p className="mt-2 text-xl text-white/70">{/^[aeiouéè]/i.test(m.nom) ? 'offres d’' : 'offres de '}{m.nom.toLowerCase()} publiées par des recruteurs vérifiés.</p>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <a className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground">
              <Briefcase className="size-4" aria-hidden /> Voir les offres
            </a>
            <a className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-medium text-white">
              {m.slug === 'chirurgien-dentiste' ? 'Remplacements et collaborations' : 'Offres en alternance'} <ArrowRight className="size-4" aria-hidden />
            </a>
            <a className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-medium text-white">
              <Bell className="size-4" aria-hidden /> Créer une alerte
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function AutresMetiers({ slug }: { slug: string }) {
  return (
    <section className="border-t border-line bg-bg-soft">
      <div className="container py-16 md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
          Les autres métiers
          <span className="block text-fg-2">du cabinet et du laboratoire.</span>
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {METIERS.filter((m) => m.slug !== slug).slice(0, 3).map((m) => (
            <CarteMetier key={m.slug} m={m} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function Sources({ f }: { f: Fiche }) {
  return (
    <div className="border-t border-line pt-6 text-xs text-fg-2">
      <p className="flex flex-wrap items-center gap-2 font-medium text-fg">
        Sources <AValider />
      </p>
      <ul className="mt-2 space-y-1">
        {f.sources.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p className="mt-2">Mise à jour le {f.majLe}.</p>
    </div>
  )
}
