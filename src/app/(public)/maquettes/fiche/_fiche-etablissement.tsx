/** MAQUETTE. Page unique d'un établissement de formation, style B (héros carte), version la plus complète. */
import Image from 'next/image'
import {
  Accessibility,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CircleCheck,
  Clock,
  ExternalLink,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Quote,
  ShieldCheck,
  Train,
  Users,
  UtensilsCrossed,
  BedDouble,
  Wrench,
} from 'lucide-react'
import { Carte } from '@/components/map/carte'
import { empriseAutour, clePosition } from '@/lib/annuaire/emprise'
import { FilAriane } from '@/components/annuaire/primitives'
import { ETAB as E } from './_donnees-etab'
import { BarreMobile, Etiquette, Galerie, Logo, Photo, Registre, Titre2 } from './_blocs'

const ARIANE = [
  { libelle: 'Accueil', href: '/' },
  { libelle: 'Formation', href: '/formation/' },
  { libelle: 'Écoles de prothèse dentaire', href: '/formation/ecoles-de-prothese/' },
  { libelle: E.nom },
]

function Pastille({ children, sombre, accent }: { children: React.ReactNode; sombre?: boolean; accent?: boolean }) {
  return (
    <span
      className={`squircle-full inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        sombre ? 'bg-white/10 text-white ring-white/15' : accent ? 'bg-teal/10 text-teal ring-teal/30' : 'bg-bg text-fg ring-line'
      }`}
    >
      {children}
    </span>
  )
}

function Declare() {
  return <p className="text-xs text-fg-2">Déclaré par l’établissement, confirmé le {E.majLe}</p>
}

function Source({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-fg-2">Source : {children}</p>
}

/* 1 · Héros ------------------------------------------------------------ */
function Heros() {
  return (
    <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
      <div className="pointer-events-none absolute inset-0 [&_.maplibregl-ctrl-bottom-right]:hidden [&_.maplibregl-ctrl-top-right]:hidden">
        <Carte profession="prothesistes" emprise={empriseAutour(E.lon, E.lat, 9000)} className="size-full" survol={clePosition(E.lon, E.lat)} />
        <div className="absolute inset-0 bg-ardoise mix-blend-color" />
        <div className="absolute inset-0 bg-background/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
      <div className="container relative z-10 pb-16 pt-10">
        <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/70">
          <FilAriane segments={ARIANE} />
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="squircle-full bg-white/10 px-3 py-1 text-sm text-white ring-1 ring-inset ring-white/15">École de prothèse dentaire</span>
              <Pastille sombre>
                <ShieldCheck className="size-3.5 text-teal" aria-hidden /> Établissement vérifié, référentiel UAI
              </Pastille>
              <Pastille sombre>
                <BadgeCheck className="size-3.5 text-teal" aria-hidden /> Fiche gérée par l’établissement
              </Pastille>
            </div>
            <div className="mt-5 flex items-center gap-5">
              <Logo monogramme={E.monogramme} taille="size-16 md:size-20" />
              <h1 className="text-4xl font-normal tracking-tight text-white md:text-6xl">{E.nom}</h1>
            </div>
            <p className="mt-3 text-lg text-white/75">
              {E.statut} · {E.adresse}, {E.cp} {E.commune}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <a className="hover-lift col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground">
                <GraduationCap className="size-4" aria-hidden /> Voir les formations
              </a>
              <a className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 text-sm font-medium text-white">
                <Globe className="size-4" aria-hidden /> Site <ExternalLink className="size-3.5 opacity-60" aria-hidden />
              </a>
              <a className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 text-sm font-medium text-white">
                <Phone className="size-4" aria-hidden /> Appeler
              </a>
            </div>
          </div>
          <div className="squircle-2xl shadow-pop overflow-hidden border border-white/10 bg-[#161c21]">
            <Photo src={E.photo} className="aspect-[4/3]" />
            <div className="space-y-4 p-5">
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
                  <CalendarDays className="size-4 text-teal" aria-hidden /> Prochaines portes ouvertes
                </p>
                <p className="mt-1 text-lg font-semibold text-white">{E.portesOuvertes.prochaine}</p>
                <p className="text-sm text-white/60">{E.portesOuvertes.horaire}</p>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
                  <Clock className="size-4 text-teal" aria-hidden /> Candidatures
                </p>
                <p className="mt-1 text-sm text-white">{E.candidatures}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
          {E.chiffres.map((c) => (
            <div key={c.l}>
              <p className="text-3xl font-semibold tracking-tight text-white">{c.v}</p>
              <p className="mt-1 text-sm text-white/60">{c.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* 2 · Présentation, en citation ----------------------------------------- */
function Presentation() {
  return (
    <section className="container py-20 md:py-24">
      <div className="max-w-4xl">
        <Quote className="size-8 text-teal" aria-hidden />
        <p className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-fg md:text-4xl">
          {E.citation.debut} <span className="text-fg-2">{E.citation.suite}</span>
        </p>
        <p className="mt-6 max-w-3xl leading-relaxed text-fg-2">{E.presentation}</p>
        <div className="mt-4">
          <Declare />
        </div>
      </div>
    </section>
  )
}

/* 3 · Formations proposées ---------------------------------------------- */
function Formations() {
  return (
    <section id="formations" className="bg-bg-soft py-20 md:py-24">
      <div className="container">
        <Titre2 sous="Les diplômes préparés à la rentrée 2027, avec leur niveau, leur durée et la voie de candidature.">Formations proposées</Titre2>
        <ol className="mt-10 grid gap-4 lg:grid-cols-3">
          {E.formations.map((f) => (
            <li key={f.nom} className="squircle-2xl flex flex-col border border-line bg-bg p-6">
              <div className="flex flex-wrap gap-1.5">
                <Pastille accent>{f.niveau}</Pastille>
                <Pastille>{f.duree}</Pastille>
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-fg">{f.nom}</h3>
              <p className="mt-1 text-sm text-fg-2">{f.apres}</p>
              <dl className="mt-6 flex-1 divide-y divide-line border-y border-line text-sm">
                {[
                  ['Voie', f.modes.join(', ')],
                  ['Places', `${f.places} par an`],
                  ['Candidature', f.candidature],
                  ['Rentrée', f.rentree],
                  ['Certification', f.rncp],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-fg-2">{k}</dt>
                    <dd className={`text-right ${k === 'Certification' ? 'font-mono' : ''} text-fg`}>{v}</dd>
                  </div>
                ))}
              </dl>
              <a className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-line bg-bg px-4 text-sm font-medium text-fg">
                Détail de la formation
              </a>
            </li>
          ))}
        </ol>
        <div className="mt-4">
          <Declare />
        </div>
      </div>
    </section>
  )
}

/* 4 · Admission, en étapes (process2) ----------------------------------- */
function Admission() {
  return (
    <section className="container py-20 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Admission</h2>
          <p className="mt-5 leading-relaxed text-fg-2">Du dépôt de la candidature à l’inscription, le calendrier de la rentrée 2027.</p>
          <div className="squircle-2xl mt-8 border border-line bg-bg-soft p-6">
            <p className="text-sm font-semibold text-fg">Ce que l’école attend</p>
            <ul className="mt-3 space-y-2 text-sm text-fg-2">
              {E.prerequis.map((p) => (
                <li key={p} className="flex gap-2">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ol>
          {E.admission.map((e, k) => (
            <li key={e.t} className="border-b border-line py-10 first:pt-0">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-6xl font-light tabular-nums tracking-tight text-fg md:text-7xl">0{k + 1}</p>
                <Pastille accent>{e.quand}</Pastille>
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-fg">{e.t}</h3>
              <p className="mt-3 max-w-xl text-fg-2">{e.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* 5 · Alternance, bande sombre avec les laboratoires autour -------------- */
function Alternance() {
  return (
    <section className="dark bg-background py-20 text-fg md:py-24">
      <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            L’alternance
            <span className="block text-white/55">{E.alternance.rythme}.</span>
          </h2>
          <ul className="mt-8 space-y-5">
            {[
              { i: Briefcase, t: 'Trouver un laboratoire', d: E.alternance.aide },
              { i: Users, t: `${E.alternance.partenaires} laboratoires partenaires`, d: 'Ils accueillent chaque année des apprentis de l’école.' },
              { i: BookOpen, t: 'Rémunération', d: E.alternance.remuneration + '.' },
            ].map((b) => (
              <li key={b.t} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10">
                  <b.i className="size-5 text-teal" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-white">{b.t}</p>
                  <p className="mt-1 text-sm text-white/65">{b.d}</p>
                </div>
              </li>
            ))}
          </ul>
          <a className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0e1317]">
            Voir les laboratoires autour de l’école
          </a>
        </div>
        <div className="squircle-2xl relative aspect-[4/3] overflow-hidden border border-line">
          <Carte profession="prothesistes" emprise={empriseAutour(E.lon, E.lat, 12000)} className="size-full" survol={clePosition(E.lon, E.lat)} />
          <div className="absolute bottom-3 left-3 rounded-full bg-bg/90 px-3 py-1 text-xs font-medium text-fg ring-1 ring-line">Laboratoires de prothèse à moins de 12 km</div>
        </div>
      </div>
    </section>
  )
}

/* 6 · Résultats et débouchés (stats9) ------------------------------------ */
function Resultats() {
  return (
    <section className="container py-20 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <Etiquette>Résultats</Etiquette>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-fg md:text-4xl">Réussite et insertion</h2>
          <p className="mt-4 leading-relaxed text-fg-2">
            Taux publiés par le ministère de l’Éducation nationale, jamais saisis par l’établissement. Ils sont repris tels quels, avec leur année.
          </p>
          <p className="mt-8 text-sm font-semibold text-fg">Débouchés</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {E.debouches.map((d) => (
              <Etiquette key={d}>{d}</Etiquette>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {E.resultats.map((r) => (
            <div key={r.l} className="squircle-2xl border border-line bg-bg-soft p-6">
              <p className="text-5xl font-semibold tracking-tight tabular-nums text-fg">{r.v}</p>
              <p className="mt-2 text-fg">{r.l}</p>
              <div className="mt-4">
                <Source>{r.s}</Source>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* 7 · Plateau technique et vie étudiante (bento) ------------------------- */
function Campus() {
  const icVie = [BedDouble, UtensilsCrossed, Train, Accessibility]
  return (
    <section className="bg-bg-soft py-20 md:py-24">
      <div className="container">
        <Titre2 sous="Les ateliers où se fait la formation, et ce qui facilite la vie des élèves.">Plateau technique et vie étudiante</Titre2>
        <div className="mt-10 grid grid-flow-row-dense grid-cols-12 gap-3">
          <div className="squircle-2xl relative col-span-12 min-h-80 overflow-hidden border border-line lg:col-span-5 lg:row-span-3">
            <Image src={E.photos[0]} alt="" fill sizes="40vw" className="object-cover" />
          </div>
          {E.equipements.map((q) => (
            <div key={q.t} className="squircle-2xl col-span-12 border border-line bg-bg p-6 lg:col-span-7">
              <p className="flex items-center gap-2 text-sm font-semibold text-fg">
                <Wrench className="size-4 text-teal" aria-hidden /> {q.t}
              </p>
              <p className="mt-2 text-sm text-fg-2">{q.d}</p>
            </div>
          ))}
          {E.vie.map((v, k) => {
            const I = icVie[k]
            return (
              <div key={v.t} className="squircle-2xl col-span-12 border border-line bg-bg p-6 sm:col-span-6 lg:col-span-3">
                <I className="size-6 text-teal" strokeWidth={1.5} aria-hidden />
                <p className="mt-6 text-sm font-semibold text-fg">{v.t}</p>
                <p className="mt-1 text-sm text-fg-2">{v.d}</p>
              </div>
            )
          })}
        </div>
        <div className="mt-4">
          <Declare />
        </div>
      </div>
    </section>
  )
}

/* 8 · Coûts et aides ------------------------------------------------------ */
function Couts() {
  return (
    <section className="container py-20 md:py-24">
      <Titre2 sous="Ce que coûte la formation, et ce qui la finance.">Coûts et aides</Titre2>
      <dl className="mt-10 divide-y divide-line border-y border-line">
        {E.couts.map((c) => (
          <div key={c.t} className="grid gap-2 py-6 md:grid-cols-[16rem_14rem_1fr] md:items-baseline md:gap-8">
            <dt className="text-sm font-medium text-fg-2">{c.t}</dt>
            <dd className="text-2xl font-semibold tracking-tight text-fg">{c.v}</dd>
            <dd className="text-fg-2">{c.d}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3">
        <Declare />
      </div>
    </section>
  )
}

/* 9 · Portes ouvertes et événements -------------------------------------- */
function Evenements() {
  return (
    <section className="dark bg-background py-20 text-fg md:py-24">
      <div className="container">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Portes ouvertes et rendez-vous
          <span className="block text-white/55">Venir voir les ateliers avant de candidater.</span>
        </h2>
        <ol className="mt-10 grid gap-3 md:grid-cols-3">
          {E.evenements.map((v) => (
            <li key={v.t} className="squircle-2xl flex flex-col gap-6 border border-line bg-bg-soft p-6">
              <p className="flex items-center gap-2 text-sm font-medium text-teal">
                <CalendarDays className="size-4" aria-hidden /> {v.date}
              </p>
              <div>
                <p className="text-xl font-semibold tracking-tight text-white">{v.t}</p>
                <p className="mt-2 text-sm text-white/65">{v.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-white/55">Les dates passées disparaissent d’elles-mêmes. Déclarées par l’établissement, confirmées le {E.majLe}.</p>
      </div>
    </section>
  )
}

/* 10 · Accès et contacts --------------------------------------------------- */
function Contacts() {
  return (
    <section className="container py-20 md:py-24">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <Titre2>Accès et contacts</Titre2>
          <p className="mt-6 flex items-start gap-2 text-fg">
            <MapPin className="mt-1 size-4 shrink-0 text-teal" aria-hidden /> {E.adresse}, {E.cp} {E.commune}
          </p>
          <p className="mt-2 flex items-start gap-2 text-fg-2">
            <Train className="mt-1 size-4 shrink-0 text-teal" aria-hidden /> {E.vie[2].d}
          </p>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {E.contacts.map((c) => (
              <li key={c.t} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-fg">{c.t}</p>
                  <p className="text-sm text-fg-2">{c.d}</p>
                </div>
                <div className="flex gap-2">
                  <a className="grid size-10 place-items-center rounded-full border border-line text-fg">
                    <Phone className="size-4" aria-hidden />
                  </a>
                  <a className="grid size-10 place-items-center rounded-full border border-line text-fg">
                    <Mail className="size-4" aria-hidden />
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <a className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-fg underline-offset-4 hover:underline">
            <Globe className="size-4 text-teal" aria-hidden /> {E.site} <ExternalLink className="size-3.5 opacity-60" aria-hidden />
          </a>
        </div>
        <div className="squircle-2xl relative min-h-80 overflow-hidden border border-line">
          <Carte profession="prothesistes" emprise={empriseAutour(E.lon, E.lat, 500)} className="size-full" survol={clePosition(E.lon, E.lat)} />
        </div>
      </div>
    </section>
  )
}

/* 11 · Registre et 12 · Autres établissements ----------------------------- */
function RegistreEtAutres() {
  return (
    <section className="container pb-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
          <Titre2 sous="Ces informations viennent des référentiels publics et ne sont pas modifiables par l’établissement.">Ce que disent les registres</Titre2>
          <div className="mt-6">
            <Registre lignes={E.registre} />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-fg-2">Former au même métier</p>
          <ul className="mt-4 space-y-3">
            {E.autres.map((a) => (
              <li key={a.nom} className="squircle-xl flex items-center gap-4 border border-line p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-bg-soft">
                  <Building2 className="size-5 text-teal" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-fg">{a.nom}</p>
                  <p className="text-sm text-fg-2">
                    {a.ville} · {a.d}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function FicheEtablissement() {
  return (
    <>
      <Heros />
      <BarreMobile titre={E.nom} detail={`Portes ouvertes le ${E.portesOuvertes.prochaine.replace('Samedi ', '')}`} secondaire={<Globe className="size-5" aria-hidden />} />
      <Presentation />
      <section className="container pb-20 md:pb-24">
        <Galerie photos={E.galerie} total={E.galerieTotal} credit={E.galerieCredit} source={`Photos publiées par l’établissement, ${E.galerieTotal} au total.`} />
      </section>
      <Formations />
      <Admission />
      <Alternance />
      <Resultats />
      <Campus />
      <Couts />
      <Evenements />
      <Contacts />
      <RegistreEtAutres />
    </>
  )
}
