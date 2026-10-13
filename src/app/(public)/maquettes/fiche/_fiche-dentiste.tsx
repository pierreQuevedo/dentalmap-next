/** MAQUETTE. Fiche dentiste revendiquée et complète, style validé : B1 (héros carte, section Étapes). */
import {
  Accessibility,
  BadgeCheck,
  CreditCard,
  Languages,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { Carte } from '@/components/map/carte'
import { empriseAutour, clePosition } from '@/lib/annuaire/emprise'
import { FilAriane } from '@/components/annuaire/primitives'
import { DENTISTE as D } from './_donnees'
import { Actions, BarreMobile, Declare, Etiquette, HorairesListe, LienSite, Photo, Registre, Semaine, Statut, Titre2 } from './_blocs'

const ARIANE = [
  { libelle: 'Accueil', href: '/' },
  { libelle: 'Chirurgiens-dentistes', href: '/dentistes/' },
  { libelle: 'Bordeaux', href: '/dentistes/gironde/bordeaux/' },
  { libelle: D.nom },
]

function Verifie({ sombre }: { sombre?: boolean }) {
  return (
    <span
      className={`squircle-full inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        sombre ? 'bg-white/10 text-white ring-white/15' : 'bg-bg text-fg ring-line'
      }`}
    >
      <ShieldCheck className="size-3.5 text-teal" aria-hidden /> Vérifié auprès des registres officiels
    </span>
  )
}

const INFOS_D = [
  { i: Stethoscope, t: 'Soins pratiqués', v: D.soins, note: 'Déclarés par le praticien, ce ne sont pas des spécialités de l’Ordre.' },
  { i: Languages, t: 'Langues parlées', v: D.langues },
  { i: Accessibility, t: 'Accès au cabinet', v: D.acces },
  { i: CreditCard, t: 'Paiement', v: D.paiements, note: D.tiersPayant + '.' },
]

/** 1 · Étapes : le format « Comment ça marche » de l'accueil (process2). */
function SectionCabinet() {
  return (
    <section className="container py-20 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Le cabinet</h2>
          <p className="mt-5 leading-relaxed text-fg-2">{D.presentation}</p>
          <Photo src={D.photos[0]} className="squircle-2xl mt-8 aspect-[4/3] border border-line" />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <LienSite />
            <Declare le={D.declareLe.presentation} />
          </div>
        </div>
        <ol>
          {INFOS_D.map((b, k) => (
            <li key={b.t} className="border-b border-line py-10 first:pt-0">
              <p className="text-6xl font-light tabular-nums tracking-tight text-fg md:text-7xl">0{k + 1}</p>
              <h3 className="mt-6 flex items-center gap-2 text-xl font-semibold tracking-tight text-fg">
                <b.i className="size-5 text-teal" aria-hidden /> {b.t}
              </h3>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {b.v.map((x) => (
                  <Etiquette key={x}>{x}</Etiquette>
                ))}
              </div>
              {b.note && <p className="mt-3 text-sm text-fg-2">{b.note}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function FicheDentiste() {
  return (
    <>
      <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
        <div className="pointer-events-none absolute inset-0 [&_.maplibregl-ctrl-bottom-right]:hidden [&_.maplibregl-ctrl-top-right]:hidden">
          <Carte profession="dentistes" emprise={empriseAutour(D.lon, D.lat, 900)} className="size-full" survol={clePosition(D.lon, D.lat)} />
          <div className="absolute inset-0 bg-ardoise mix-blend-color" />
          <div className="absolute inset-0 [background:radial-gradient(ellipse_70%_80%_at_70%_45%,color-mix(in_oklch,var(--background)_30%,transparent)_0%,var(--background)_85%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="container relative z-10 grid gap-10 pb-16 pt-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/70">
              <FilAriane segments={ARIANE} />
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <span className="squircle-full bg-white/10 px-3 py-1 text-sm text-white ring-1 ring-inset ring-white/15">{D.profession}</span>
              <Statut sombre />
            </div>
            <h1 className="mt-5 text-5xl font-normal tracking-tight text-white md:text-6xl">{D.nom}</h1>
            <p className="mt-3 text-lg text-white/75">
              {D.structure} · {D.adresse}, {D.commune}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Verifie sombre />
              <span className="squircle-full inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/15">
                <BadgeCheck className="size-3.5 text-teal" aria-hidden /> Fiche gérée par le praticien
              </span>
            </div>
            <div className="mt-8">
              <Actions sombre />
            </div>
          </div>
          <div className="squircle-2xl shadow-pop overflow-hidden border border-white/10 bg-[#161c21]">
            <Photo src={D.photo} className="aspect-[4/3]" />
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">
                <span className="lg:hidden">Aujourd’hui, jeudi</span>
                <span className="hidden lg:inline">Cette semaine</span>
              </p>
              <p className="mt-2 tabular-nums text-white lg:hidden">8h30 à 12h30 · 14h00 à 19h00</p>
              <div className="mt-2 hidden lg:block">
                <HorairesListe sombre />
              </div>
            </div>
          </div>
        </div>
      </section>

      <BarreMobile titre={D.nom} detail="Ouvert · ferme à 19 h" />
      <SectionCabinet />
      {/* Horaires et lieux, bande sombre comme « Explorer l'annuaire » */}
      <section className="dark bg-background py-20 text-fg">
        <div className="container">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Horaires et lieux
            <span className="block text-white/55">Le cabinet reçoit dans deux lieux, selon le jour.</span>
          </h2>
          <div className="mt-10">
            <Semaine />
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {D.lieux.map((l, i) => (
              <div key={l.titre} className="squircle-2xl grid overflow-hidden border border-line bg-bg-soft sm:grid-cols-[12rem_1fr]">
                <div className="relative h-36 sm:h-auto sm:min-h-36 [&_.maplibregl-control-container]:hidden">
                  <Carte profession="dentistes" emprise={empriseAutour(i ? -0.6436 : D.lon, i ? 44.8386 : D.lat, 400)} className="size-full" />
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-fg-2">{l.titre}</p>
                  <p className="mt-1 text-fg">{l.adresse}</p>
                  <p className="mt-2 text-sm text-fg-2">{l.jours}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Declare le={D.declareLe.horaires} sombre />
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Titre2 sous="Ces informations viennent de registres publics et ne sont pas modifiables par le praticien.">Ce que dit le registre</Titre2>
            <div className="mt-6">
              <Registre lignes={D.registre} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {D.photos.map((p) => (
              <Photo key={p} src={p} className="squircle-2xl aspect-[4/5] border border-line" />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
