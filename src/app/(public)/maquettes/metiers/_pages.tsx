/**
 * MAQUETTE. Rubrique « Métiers » des Ressources : le hub, puis la fiche de
 * l'assistant(e) dentaire, héros sombre plein cadre comme les fiches
 * formation et établissement (variante A retenue le 13 octobre 2026).
 */
import Image from 'next/image'
import { Armchair, ArrowRight, CalendarDays, ClipboardList, GraduationCap, Hammer, MessageCircle, ScanSearch, ShieldCheck, Sparkles, TrendingUp, FileCheck } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { AppelOffres, ARIANE, AutresMetiers, AValider, CarteMetier, Rubrique, SalairesBarres, Sources } from './_blocs'
import { AUTRES_ARTICLES, FICHES, METIERS, type Fiche } from './_donnees'

const ICONES = { fauteuil: Armchair, hygiene: ShieldCheck, accueil: MessageCircle, gestion: ClipboardList, diagnostic: ScanSearch, atelier: Hammer, controle: FileCheck, planning: CalendarDays }

/* ---------- Hub ---------- */

export function Hub() {
  return (
    <main>
      <section className="container pb-12 pt-8">
        <FilAriane segments={[...ARIANE.slice(0, 2), { libelle: 'Métiers' }]} />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight text-fg md:text-7xl">
            Les métiers
            <span className="block text-fg-2">du dentaire.</span>
          </h1>
          <p className="max-w-sm text-lg text-fg-2">Missions, formation et salaire moyen, métier par métier.</p>
        </div>
      </section>

      <section className="container pb-16">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 lg:row-span-2 [&>a]:h-full [&>a]:min-h-[28rem]">
            <CarteMetier m={METIERS[0]!} grande />
          </div>
          {METIERS.slice(1).map((m) => (
            <CarteMetier key={m.slug} m={m} />
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-bg-soft">
        <div className="container grid gap-10 py-16 md:py-20 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
              Comparer les salaires
              <span className="block text-fg-2">d’un métier à l’autre.</span>
            </h2>
            <a className="mt-6 inline-flex items-center gap-2 font-medium text-fg">
              Repères de salaire sur les pages emploi <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
          <ul className="space-y-4">
            {METIERS.filter((m) => m.salaire !== null).map((m) => (
              <li key={m.slug} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 gap-y-2">
                <span className="truncate text-sm text-fg-2">{m.nom}</span>
                <span className="font-semibold tabular-nums text-fg">{m.salaire!.toLocaleString('fr-FR')} €</span>
                <span className="col-span-2 h-2.5 rounded-full bg-bg">
                  <span className="block h-full rounded-full bg-teal" style={{ width: `${(m.salaire! / 2400) * 100}%` }} />
                </span>
              </li>
            ))}
            <li className="pt-2 text-xs text-fg-2">Brut mensuel moyen en cabinet ou en laboratoire, issu d’études salariales. Source à citer.</li>
          </ul>
        </div>
      </section>

      <section className="container py-16 md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">À lire aussi</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {AUTRES_ARTICLES.map((a) => (
            <li key={a.titre} className="squircle-2xl border border-line p-6">
              <Rubrique />
              <p className="mt-3 text-lg font-semibold leading-snug text-fg">{a.titre}</p>
              <p className="mt-4 text-xs text-fg-2">{a.lecture} min de lecture</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

/* ---------- Sections communes aux deux fiches ---------- */

function Missions({ f }: { f: Fiche }) {
  return (
    <section className="container py-20 md:py-24">
      <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">
        Au quotidien
        <span className="block text-fg-2">quatre missions.</span>
      </h2>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {f.missions.map((m) => {
          const I = ICONES[m.icone as keyof typeof ICONES]
          return (
            <li key={m.titre} className="squircle-3xl border border-line bg-bg p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-teal/10 text-teal">
                <I className="size-6" aria-hidden />
              </span>
              <h3 className="mt-8 text-xl font-semibold tracking-tight text-fg">{m.titre}</h3>
              <p className="mt-1 text-fg-2">{m.detail}</p>
            </li>
          )
        })}
      </ul>
      <div className="mt-10 flex flex-wrap items-center gap-2">
        <span className="mr-2 flex items-center gap-1.5 text-sm text-fg-2">
          <Sparkles className="size-4 text-teal" aria-hidden /> Qualités attendues
        </span>
        {f.qualites.map((q) => (
          <span key={q} className="rounded-full border border-line px-3 py-1 text-sm text-fg">
            {q}
          </span>
        ))}
      </div>
    </section>
  )
}

function Formation({ f, sombre }: { f: Fiche; sombre?: boolean }) {
  return (
    <section className={sombre ? 'dark bg-background py-20 text-fg md:py-24' : 'border-y border-line bg-bg-soft py-20 md:py-24'}>
      <div className="container grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <h2 className={`text-4xl font-semibold tracking-tight md:text-5xl ${sombre ? 'text-white' : 'text-fg'}`}>Se former</h2>
          <p className={`mt-4 flex flex-wrap items-center gap-2 ${sombre ? 'text-white/70' : 'text-fg-2'}`}>
            {f.formation} <AValider sombre={sombre} />
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <a className={`inline-flex items-center gap-2 font-medium ${sombre ? 'text-white' : 'text-fg'}`}>
              <GraduationCap className="size-4 text-teal" aria-hidden /> Les écoles près de chez vous <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
        <ol>
          {f.etapes.map((e, k) => (
            <li key={e.titre} className={`grid grid-cols-[4rem_minmax(0,1fr)] gap-4 border-b py-7 first:pt-0 ${sombre ? 'border-white/10' : 'border-line'}`}>
              <p className={`text-5xl font-light tabular-nums tracking-tight ${sombre ? 'text-white' : 'text-fg'}`}>0{k + 1}</p>
              <div>
                <h3 className={`text-xl font-semibold tracking-tight ${sombre ? 'text-white' : 'text-fg'}`}>{e.titre}</h3>
                <p className={`mt-1 ${sombre ? 'text-white/65' : 'text-fg-2'}`}>{e.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function SalaireEtEvolution({ f }: { f: Fiche }) {
  return (
    <section className="container grid gap-14 py-20 md:py-24 lg:grid-cols-2 lg:gap-20">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">Salaire moyen par secteur</h2>
        <div className="mt-8">
          <SalairesBarres valeurs={f.salaires} />
        </div>
      </div>
      <div>
        <h2 className="flex flex-wrap items-center gap-3 text-3xl font-semibold tracking-tight text-fg md:text-4xl">
          Évoluer <AValider />
        </h2>
        <ul className="mt-8 space-y-3">
          {f.evolutions.map((e) => (
            <li key={e.titre} className="squircle-2xl flex items-center gap-4 border border-line p-5">
              <TrendingUp className="size-5 shrink-0 text-teal" aria-hidden />
              <div>
                <p className="font-semibold text-fg">{e.titre}</p>
                <p className="text-sm text-fg-2">{e.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Pied({ f }: { f: Fiche }) {
  return (
    <>
      <AppelOffres f={f} />
      <div className="container pb-16">
        <Sources f={f} />
      </div>
      <AutresMetiers slug={f.metier.slug} />
    </>
  )
}

/* ---------- Fiche A : héros sombre ---------- */

export function FicheMetier({ slug = 'assistant-dentaire' }: { slug?: string }) {
  const f = FICHES[slug]!
  const m = f.metier
  return (
    <main>
      <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image src={f.photo} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="container relative z-10 pb-14 pt-10">
          <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/70">
            <FilAriane segments={[...ARIANE, { libelle: m.nom }]} />
          </div>
          <div className="mt-16 max-w-3xl">
            <Rubrique sombre />
            <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-7xl">{m.nom}</h1>
            <p className="mt-6 text-xl text-white/75">{f.resume}</p>
            <p className="mt-4 text-sm text-white/55">
              Mis à jour le {f.majLe} · {f.lecture} min de lecture
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
            {f.chiffres.map((c) => (
              <div key={c.libelle}>
                <dt className="sr-only">{c.libelle}</dt>
                <dd className="text-3xl font-semibold tabular-nums tracking-tight text-white md:text-4xl">{c.valeur}</dd>
                <dd className="mt-1 text-sm text-white/60">{c.libelle}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <Missions f={f} />
      <Formation f={f} sombre />
      <SalaireEtEvolution f={f} />
      <Pied f={f} />
    </main>
  )
}
