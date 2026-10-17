/**
 * MAQUETTE. Page d'une formation privée, dans le style des fiches
 * d'établissement validées : héros sombre, organisme en monogramme, l'essentiel
 * en bandeau, programme en étapes, sessions, public et prérequis, tarif et
 * prise en charge, intervenants sans noms, inscription externe.
 */
import Image from 'next/image'
import { CalendarDays, Clock, ExternalLink, Euro, Flag, Laptop, MapPin, ShieldCheck, Users } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { ARIANE, CarteFormationPrivee, Etiquette, Monogramme, Prise } from './_blocs'
import { FICHE, FORMATIONS } from './_donnees'

const { f } = FICHE

function Declare({ sombre }: { sombre?: boolean }) {
  return <p className={`text-xs ${sombre ? 'text-white/55' : 'text-fg-2'}`}>Déclaré par l’organisme, confirmé le {FICHE.declareLe}</p>
}

function Heros() {
  return (
    <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image src={f.image!} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
      <div className="container relative z-10 pb-16 pt-10">
        <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/70">
          <FilAriane segments={[...ARIANE, { libelle: f.theme }]} />
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="squircle-full bg-white/10 px-3 py-1 text-sm text-white ring-1 ring-inset ring-white/15">Formation continue</span>
              <Etiquette ton="sombre">{f.theme}</Etiquette>
              <Etiquette ton="sombre">{f.format}</Etiquette>
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-normal tracking-tight text-white md:text-6xl">{f.titre}</h1>
            <div className="mt-5 flex items-center gap-3">
              <Monogramme m={f.monogramme} className="size-12 text-base" />
              <div>
                <p className="font-semibold text-white">{f.organisme}</p>
                <p className="text-sm text-white/60">Organisme de formation, nom inventé</p>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
              <a href="#sessions" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground">
                <CalendarDays className="size-4" aria-hidden /> Voir les sessions
              </a>
              <a className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 text-sm font-medium text-white">
                S’inscrire sur le site de l’organisme <ExternalLink className="size-3.5 opacity-60" aria-hidden />
              </a>
            </div>
          </div>
          <div className="squircle-2xl shadow-pop overflow-hidden border border-white/10 bg-[#161c21] p-5">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
              <CalendarDays className="size-4 text-teal" aria-hidden /> Prochaine session
            </p>
            <p className="mt-1 text-lg font-semibold text-white">{f.sessions[0]!.date}</p>
            <p className="text-sm text-white/60">
              {f.sessions[0]!.lieu} · {f.sessions[0]!.places}
            </p>
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">Prise en charge</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {f.priseEnCharge.map((p) => (
                  <Prise key={p.nom} p={p} sombre />
                ))}
              </div>
            </div>
          </div>
        </div>
        <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
          {[
            [Clock, 'Durée', f.duree],
            [Laptop, 'Format', `${f.format} : 3 jours sur place, 1 à distance`],
            [Users, 'Public', f.public.join(', ')],
            [Euro, 'Tarif', `${f.tarif}, exemple`],
          ].map(([I, l, v]) => {
            const Icone = I as typeof Clock
            return (
              <div key={l as string}>
                <dt className="flex items-center gap-1.5 text-sm text-white/60">
                  <Icone className="size-4 text-teal" aria-hidden /> {l as string}
                </dt>
                <dd className="mt-1.5 text-lg font-semibold leading-snug tracking-tight text-white">{v as string}</dd>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}

function Programme() {
  return (
    <section className="container py-20 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Le programme</h2>
          <p className="mt-5 leading-relaxed text-fg-2">{FICHE.resume}</p>
          <ul className="mt-6 space-y-2">
            {FICHE.objectifs.map((o) => (
              <li key={o} className="flex gap-3 text-fg">
                <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
                {o}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Declare />
          </div>
        </div>
        <ol>
          {FICHE.programme.map((p, k) => (
            <li key={p.titre} className="border-b border-line py-8 first:pt-0">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-5xl font-light tabular-nums tracking-tight text-fg md:text-6xl">0{k + 1}</p>
                <span className="text-sm text-fg-2">{p.duree}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-fg">{p.titre}</h3>
              <p className="mt-1 text-fg-2">{p.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Sessions() {
  return (
    <section id="sessions" className="dark scroll-mt-20 bg-background py-20 text-fg">
      <div className="container">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Sessions à venir
          <span className="block text-white/55">Dates et lieux indiqués par l’organisme.</span>
        </h2>
        <ul className="mt-10 grid gap-3 md:grid-cols-3">
          {f.sessions.map((s) => (
            <li key={s.date} className="squircle-2xl flex items-center gap-4 border border-line bg-bg-soft p-5">
              <div className="squircle-xl grid w-16 shrink-0 place-content-center bg-white/5 py-2 text-center">
                <span className="text-3xl font-semibold tabular-nums leading-none text-white">{s.jour}</span>
                <span className="mt-1 text-xs uppercase tracking-wide text-white/60">{s.mois}</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white">{s.date}</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-white/70">
                  {s.lieu === 'En ligne' ? <Laptop className="size-3.5 text-teal" aria-hidden /> : <MapPin className="size-3.5 text-teal" aria-hidden />} {s.lieu}
                  {s.places && ` · ${s.places}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Infos() {
  return (
    <section className="container py-20">
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="squircle-2xl border border-line bg-bg-soft p-6">
          <h2 className="text-lg font-semibold text-fg">Public et prérequis</h2>
          <ul className="mt-4 space-y-2 text-fg-2">
            {FICHE.prerequis.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="squircle-2xl border border-line bg-bg-soft p-6">
          <h2 className="text-lg font-semibold text-fg">Tarif et prise en charge</h2>
          <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-fg">{f.tarif}</p>
          <p className="text-sm text-fg-2">Indiqué par l’organisme, exemple</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {f.priseEnCharge.map((p) => (
              <Prise key={p.nom} p={p} />
            ))}
          </div>
          <p className="mt-3 flex gap-2 text-xs text-fg-2">
            <ShieldCheck className="size-3.5 shrink-0 text-teal" aria-hidden /> Qualiopi vérifié sur la liste publique des organismes certifiés ; DPC déclaré par l’organisme.
          </p>
        </div>
        <div className="squircle-2xl border border-line bg-bg-soft p-6">
          <h2 className="text-lg font-semibold text-fg">Intervenants</h2>
          <ul className="mt-4 space-y-4">
            {FICHE.intervenants.map((i) => (
              <li key={i.role} className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-bg text-sm font-semibold text-fg-2 ring-1 ring-line">{i.initiales}</span>
                <span className="text-sm text-fg">{i.role}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-fg-2">Intervenants d’exemple, sans noms.</p>
        </div>
      </div>
      <div className="squircle-3xl mt-3 flex flex-col gap-6 border border-line p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-xl font-semibold tracking-tight text-fg">L’inscription se fait chez l’organisme.</p>
          <p className="mt-1 text-sm text-fg-2">DentalMap ne vend pas de formation et ne prend pas d’inscription.</p>
          <a className="mt-3 inline-flex items-center gap-1.5 text-xs text-fg-2 underline-offset-4 hover:underline">
            <Flag className="size-3.5" aria-hidden /> Signaler une erreur sur cette formation
          </a>
        </div>
        <a className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground">
          {FICHE.siteExterne} <ExternalLink className="size-4" aria-hidden />
        </a>
      </div>
    </section>
  )
}

function Autres() {
  return (
    <section className="container pb-20">
      <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Autres formations</h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FORMATIONS.slice(1, 4).map((x) => (
          <CarteFormationPrivee key={x.slug} f={x} />
        ))}
      </ol>
    </section>
  )
}

export function Fiche() {
  return (
    <main>
      <Heros />
      <Programme />
      <Sessions />
      <Infos />
      <Autres />
    </main>
  )
}
