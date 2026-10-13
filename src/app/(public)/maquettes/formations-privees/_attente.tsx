/**
 * MAQUETTE. L'état décidé de `/formation/formations-privees` : aucune
 * formation privée recensée (`docs/handoff/00`, « liste d’attente, aucune
 * fiche publiée »). Même en-tête que la page de type réelle, puis deux
 * entrées : la demande d'ajout d'une formation, ouverte à tout
 * professionnel depuis son espace compte, et l'alerte email des praticiens
 * (validée le 13 octobre 2026, à construire).
 */
import Image from 'next/image'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { ArrowUpRight, Bell, GraduationCap, Hourglass } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { ARIANE } from './_blocs'
import { THEMES } from './_donnees'

export function Attente() {
  return (
    <main className="container py-10">
      <FilAriane segments={ARIANE.map((s, i) => (i < ARIANE.length - 1 ? s : { libelle: s.libelle }))} />
      <header className="mt-5 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">Formations privées</h1>
        <p className="mt-3 text-fg-2">Formation continue des praticiens et des prothésistes : implantologie, parodontologie, esthétique, gestion, par organisme.</p>
      </header>
      <nav aria-label="Familles de formation" className="mt-6 flex flex-wrap items-center gap-2">
        {[
          ['Toutes', '/formation/'],
          ['Écoles de prothèse dentaire', '/formation/ecoles-de-prothese/'],
          ['Facultés d’odontologie', '/formation/facultes-odontologie/'],
        ].map(([t, h]) => (
          <a key={h} href={h} className="rounded-full border border-line px-4 py-2 text-sm font-medium text-fg hover:bg-bg-soft">
            {t}
          </a>
        ))}
        <span aria-current="page" className="inline-flex items-center gap-2 rounded-full border border-fg bg-fg px-4 py-2 text-sm font-medium text-bg">
          Formations privées <span className="rounded-full bg-bg/20 px-1.5 py-px text-[11px]">Bientôt</span>
        </span>
      </nav>

      <section className="squircle-3xl dark relative mt-8 overflow-hidden bg-background text-fg">
        <Image src="/images/demo/pexels-6627447.jpg" alt="" fill sizes="100vw" className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        <div className="relative p-6 md:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/15">
            <Hourglass className="size-3.5 text-teal" aria-hidden /> Bientôt
          </span>
          <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
            Le recensement
            <span className="block text-white/55">n’est pas encore ouvert.</span>
          </h2>
          <ul className="mt-8 flex max-w-3xl flex-wrap gap-2">
            {THEMES.map((t) => (
              <li key={t} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/80">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="squircle-3xl flex flex-col border border-line bg-bg-soft p-6 md:p-8">
          <GraduationCap className="size-7 text-teal" strokeWidth={1.5} aria-hidden />
          <h3 className="mt-8 text-2xl font-semibold tracking-tight text-fg">Vous proposez une formation</h3>
          <p className="mt-2 text-fg-2">Tout professionnel peut ajouter une formation : faites la demande depuis votre espace, l’équipe la vérifie avant publication.</p>
          <div className="mt-auto pt-8">
            {/* Demande à faire depuis l'espace compte (décision du 13 octobre 2026) ; l'écran de demande reste à concevoir. */}
            <Link href={chemin('/espace-pro/compte/formation/')} className="inline-flex h-11 items-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground hover:bg-action-hover">
              Faire une demande <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
        <div className="squircle-3xl flex flex-col border border-line bg-bg-soft p-6 md:p-8">
          <Bell className="size-7 text-teal" strokeWidth={1.5} aria-hidden />
          <h3 className="mt-8 text-2xl font-semibold tracking-tight text-fg">
            Vous cherchez une formation
          </h3>
          <p className="mt-2 text-fg-2">Soyez prévenu(e) par email dès les premières formations publiées, sans compte.</p>
          <form className="mt-auto flex flex-col gap-2 pt-8 sm:flex-row">
            <label htmlFor="attente-email" className="sr-only">
              Adresse électronique
            </label>
            <input id="attente-email" type="email" placeholder="prenom.nom@exemple.fr" className="h-11 min-w-0 flex-1 rounded-full border border-line bg-bg px-4 text-sm text-fg outline-none placeholder:text-fg-2" />
            <button type="button" className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground">
              Me prévenir
            </button>
          </form>
        </div>
      </div>

      <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link href={chemin('/formation/ecoles-de-prothese/')} className="font-medium text-fg underline decoration-line underline-offset-4">
          Voir les écoles de prothèse
        </Link>
        <Link href={chemin('/formation/facultes-odontologie/')} className="font-medium text-fg underline decoration-line underline-offset-4">
          Voir les facultés d’odontologie
        </Link>
      </p>
    </main>
  )
}
