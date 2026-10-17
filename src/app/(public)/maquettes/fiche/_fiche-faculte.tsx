/** MAQUETTE. Page unique d'une faculté d'odontologie, style B, variante de la page établissement. */
import {
  Accessibility,
  BadgeCheck,
  BedDouble,
  Building2,
  CalendarDays,
  Clock,
  ExternalLink,
  Globe,
  GraduationCap,
  HeartPulse,
  Library,
  Mail,
  MapPin,
  Phone,
  Quote,
  ShieldCheck,
  Stethoscope,
  UtensilsCrossed,
} from 'lucide-react'
import { Carte } from '@/components/map/carte'
import { empriseAutour, clePosition } from '@/lib/annuaire/emprise'
import { FilAriane } from '@/components/annuaire/primitives'
import { FAC as F } from './_donnees-faculte'
import { BarreMobile, Etiquette, Galerie, Logo, Photo, Registre, Titre2 } from './_blocs'

const NOM = `${F.nom}, ${F.universite}`
const ARIANE = [
  { libelle: 'Accueil', href: '/' },
  { libelle: 'Formation', href: '/formation/' },
  { libelle: 'Facultés d’odontologie', href: '/formation/facultes-odontologie/' },
  { libelle: F.universite },
]
const maxCap = Math.max(...F.capacites.map((c) => c.n))

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
const Declare = () => <p className="text-xs text-fg-2">Déclaré par la faculté, confirmé le {F.majLe}</p>

/* 1 · Héros */
function Heros() {
  return (
    <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
      <div className="pointer-events-none absolute inset-0 [&_.maplibregl-ctrl-bottom-right]:hidden [&_.maplibregl-ctrl-top-right]:hidden">
        <Carte profession="dentistes" emprise={empriseAutour(F.lon, F.lat, 2500)} className="size-full" survol={clePosition(F.lon, F.lat)} />
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
              <span className="squircle-full bg-white/10 px-3 py-1 text-sm text-white ring-1 ring-inset ring-white/15">Faculté d’odontologie</span>
              <Pastille sombre>
                <ShieldCheck className="size-3.5 text-teal" aria-hidden /> Établissement vérifié, référentiel UAI
              </Pastille>
              <Pastille sombre>
                <BadgeCheck className="size-3.5 text-teal" aria-hidden /> Fiche gérée par la faculté
              </Pastille>
            </div>
            <div className="mt-5 flex items-center gap-5">
              <Logo monogramme={F.monogramme} taille="size-16 md:size-20" />
              <div>
                <h1 className="text-4xl font-normal tracking-tight text-white md:text-6xl">{F.nom}</h1>
                <p className="mt-1 text-xl text-white/80 md:text-2xl">{F.universite}</p>
              </div>
            </div>
            <p className="mt-4 text-lg text-white/70">
              {F.statut} · {F.adresse}, {F.cp} {F.commune}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <a className="hover-lift col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground">
                <GraduationCap className="size-4" aria-hidden /> Accès aux études
              </a>
              <a className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 text-sm font-medium text-white">
                <HeartPulse className="size-4" aria-hidden /> Se faire soigner
              </a>
              <a className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 text-sm font-medium text-white">
                <Globe className="size-4" aria-hidden /> Site <ExternalLink className="size-3.5 opacity-60" aria-hidden />
              </a>
            </div>
          </div>
          <div className="squircle-2xl shadow-pop overflow-hidden border border-white/10 bg-[#161c21]">
            <Photo src={F.photo} className="aspect-[4/3]" />
            <div className="space-y-4 p-5">
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
                  <CalendarDays className="size-4 text-teal" aria-hidden /> Prochaines portes ouvertes
                </p>
                <p className="mt-1 text-lg font-semibold text-white">{F.portesOuvertes.prochaine}</p>
                <p className="text-sm text-white/60">{F.portesOuvertes.horaire}</p>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
                  <Clock className="size-4 text-teal" aria-hidden /> Entrer en odontologie
                </p>
                <p className="mt-1 text-sm text-white">PASS ou L.AS, puis admission en 2e année sur classement</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
          {F.chiffres.map((c) => (
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

/* 2 · Présentation et 3 · Galerie */
function Presentation() {
  return (
    <section className="container py-20 md:py-24">
      <div className="max-w-4xl">
        <Quote className="size-8 text-teal" aria-hidden />
        <p className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-fg md:text-4xl">
          {F.citation.debut} <span className="text-fg-2">{F.citation.suite}</span>
        </p>
        <p className="mt-6 max-w-3xl leading-relaxed text-fg-2">{F.presentation}</p>
        <div className="mt-4">
          <Declare />
        </div>
      </div>
      <div className="mt-12">
        <Galerie photos={F.galerie} total={F.galerieTotal} credit={F.galerieCredit} source={`Photos publiées par la faculté, ${F.galerieTotal} au total.`} />
      </div>
    </section>
  )
}

/* 4 · Accès aux études, en étapes, avec les places en 2e année */
function Acces() {
  return (
    <section className="bg-bg-soft py-20 md:py-24">
      <div className="container grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Accès aux études</h2>
          <p className="mt-5 leading-relaxed text-fg-2">L’odontologie ne se choisit pas après le bac : on y entre en deuxième année, après une première année de santé.</p>
          <div className="squircle-2xl mt-8 border border-line bg-bg p-6">
            <p className="text-sm font-semibold text-fg">Places ouvertes en 2e année</p>
            <ul className="mt-5 flex h-36 items-end gap-3">
              {F.capacites.map((c, i) => (
                <li key={c.annee} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-semibold tabular-nums text-fg">{c.n}</span>
                  <span className={`w-full rounded-t-lg ${i === F.capacites.length - 1 ? 'bg-teal' : 'bg-teal/25'}`} style={{ height: Math.round((c.n / maxCap) * 96) }} />
                  <span className="text-xs tabular-nums text-fg-2">{c.annee}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-fg-2">Source : arrêtés annuels fixant les capacités d’accueil.</p>
          </div>
        </div>
        <ol>
          {F.acces.map((e, k) => (
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

/* 5 · Cursus, en frise de cycles */
function Cursus() {
  return (
    <section className="container py-20 md:py-24">
      <Titre2 sous="Six ans de la première année de santé au diplôme d’État, puis l’internat pour ceux qui se spécialisent.">Le cursus</Titre2>
      <ol className="mt-10 grid gap-3 md:grid-cols-3">
        {F.cursus.map((c, i) => (
          <li key={c.titre} className="squircle-2xl relative border border-line bg-bg-soft p-6">
            <div className="flex items-center justify-between">
              <Pastille accent>{c.annees}</Pastille>
              <span className="text-4xl font-light tabular-nums text-fg-2">0{i + 1}</span>
            </div>
            <p className="mt-6 text-xs font-medium uppercase tracking-wide text-fg-2">{c.cycle}</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-fg">{c.titre}</h3>
            <p className="mt-3 text-sm leading-relaxed text-fg-2">{c.d}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8">
        <p className="text-sm font-semibold text-fg">Après le diplôme, à la faculté</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {F.autresDiplomes.map((d) => (
            <Etiquette key={d}>{d}</Etiquette>
          ))}
        </div>
      </div>
    </section>
  )
}

/* 6 · Internat, bande sombre */
function Internat() {
  return (
    <section className="dark bg-background py-20 text-fg md:py-24">
      <div className="container grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          L’internat en odontologie
          <span className="block text-white/55">Trois spécialités, sur concours national à la fin de la sixième année.</span>
        </h2>
        <div>
          <ul className="divide-y divide-line border-y border-line">
            {F.internats.map((i) => (
              <li key={i.specialite} className="grid grid-cols-[1fr_auto] items-center gap-4 py-5">
                <div>
                  <p className="text-lg font-semibold text-white">{i.specialite}</p>
                  <p className="text-sm text-white/60">{i.duree} d’internat</p>
                </div>
                <p className="text-right">
                  <span className="block text-3xl font-semibold tabular-nums text-white">{i.postes}</span>
                  <span className="text-xs text-white/60">postes en {F.internatAnnee}</span>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-white/55">Source : arrêté annuel du Centre national de gestion. Rattachement hospitalier : {F.chu}.</p>
        </div>
      </div>
    </section>
  )
}

/* 7 · Se faire soigner : la section pour les patients */
function Soins() {
  return (
    <section id="soins" className="container py-20 md:py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <Etiquette>Pour les patients</Etiquette>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-fg md:text-4xl">Se faire soigner à la faculté</h2>
          <p className="mt-4 leading-relaxed text-fg-2">
            Les centres de soins reçoivent tous les patients. Les soins sont réalisés par les étudiants de quatrième à sixième année, encadrés par des praticiens
            hospitaliers, aux tarifs de la Sécurité sociale. Les séances sont plus longues qu’en cabinet.
          </p>
          <div className="mt-6 flex flex-wrap gap-1.5">
            {F.soins.map((s) => (
              <Etiquette key={s}>{s}</Etiquette>
            ))}
          </div>
          <ul className="mt-8 space-y-3">
            {F.centres.map((c) => (
              <li key={c.nom} className="squircle-2xl flex flex-wrap items-center justify-between gap-4 border border-line bg-bg-soft p-5">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-fg">
                    <Stethoscope className="size-4 text-teal" aria-hidden /> {c.nom}
                  </p>
                  <p className="mt-1 text-sm text-fg-2">{c.adresse}</p>
                  <p className="text-sm text-fg-2">{c.horaires}</p>
                </div>
                <a className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-semibold text-action-foreground">
                  <Phone className="size-4" aria-hidden /> Rendez-vous
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="squircle-2xl relative aspect-square overflow-hidden border border-line">
          <Carte profession="dentistes" emprise={empriseAutour(-0.59, 44.83, 2200)} className="size-full" />
        </div>
      </div>
    </section>
  )
}

/* 8 · Vie étudiante */
function Vie() {
  const ic = [Library, UtensilsCrossed, BedDouble, Accessibility]
  return (
    <section className="bg-bg-soft py-20 md:py-24">
      <div className="container">
        <Titre2 sous="Les services de l’université ouverts aux étudiants de la faculté.">Vie étudiante</Titre2>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {F.vie.map((v, k) => {
            const I = ic[k]
            return (
              <div key={v.t} className="squircle-2xl border border-line bg-bg p-6">
                <I className="size-6 text-teal" strokeWidth={1.5} aria-hidden />
                <p className="mt-6 text-sm font-semibold text-fg">{v.t}</p>
                <p className="mt-1 text-sm text-fg-2">{v.d}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* 9 · Coûts */
function Couts() {
  return (
    <section className="container py-20 md:py-24">
      <Titre2 sous="Une université publique : droits nationaux, aides de l’État.">Coûts et aides</Titre2>
      <dl className="mt-10 divide-y divide-line border-y border-line">
        {F.couts.map((c) => (
          <div key={c.t} className="grid gap-2 py-6 md:grid-cols-[16rem_14rem_1fr] md:items-baseline md:gap-8">
            <dt className="text-sm font-medium text-fg-2">{c.t}</dt>
            <dd className="text-2xl font-semibold tracking-tight text-fg">{c.v}</dd>
            <dd className="text-fg-2">{c.d}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* 10 · Rendez-vous */
function Evenements() {
  return (
    <section className="dark bg-background py-20 text-fg md:py-24">
      <div className="container">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Portes ouvertes et rendez-vous
          <span className="block text-white/55">Rencontrer la faculté avant de s’inscrire en santé.</span>
        </h2>
        <ol className="mt-10 grid gap-3 md:grid-cols-3">
          {F.evenements.map((v) => (
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
        <p className="mt-4 text-xs text-white/55">Les dates passées disparaissent d’elles-mêmes. Déclarées par la faculté, confirmées le {F.majLe}.</p>
      </div>
    </section>
  )
}

/* 11 · Accès et contacts */
function Contacts() {
  return (
    <section className="container py-20 md:py-24">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <Titre2>Accès et contacts</Titre2>
          <p className="mt-6 flex items-start gap-2 text-fg">
            <MapPin className="mt-1 size-4 shrink-0 text-teal" aria-hidden /> {F.adresse}, {F.cp} {F.commune}
          </p>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {F.contacts.map((c) => (
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
            <Globe className="size-4 text-teal" aria-hidden /> {F.site} <ExternalLink className="size-3.5 opacity-60" aria-hidden />
          </a>
        </div>
        <div className="squircle-2xl relative min-h-80 overflow-hidden border border-line">
          <Carte profession="dentistes" emprise={empriseAutour(F.lon, F.lat, 500)} className="size-full" survol={clePosition(F.lon, F.lat)} />
        </div>
      </div>
    </section>
  )
}

/* 12 · Registres et autres facultés */
function RegistreEtAutres() {
  return (
    <section className="container pb-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
          <Titre2 sous="Ces informations viennent des référentiels et arrêtés publics, et ne sont pas modifiables par la faculté.">Ce que disent les registres</Titre2>
          <div className="mt-6">
            <Registre lignes={F.registre} />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-fg-2">Autres facultés d’odontologie</p>
          <ul className="mt-4 space-y-3">
            {F.autres.map((a) => (
              <li key={a.ville} className="squircle-xl flex items-center gap-4 border border-line p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-bg-soft">
                  <Building2 className="size-5 text-teal" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-fg">
                    {a.nom}, {a.ville}
                  </p>
                  <p className="text-sm text-fg-2">{a.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function FicheFaculte() {
  return (
    <>
      <Heros />
      <BarreMobile titre={NOM} detail={`Portes ouvertes le ${F.portesOuvertes.prochaine.replace('Samedi ', '')}`} secondaire={<HeartPulse className="size-5" aria-hidden />} />
      <Presentation />
      <Acces />
      <Cursus />
      <Internat />
      <Soins />
      <Vie />
      <Couts />
      <Evenements />
      <Contacts />
      <RegistreEtAutres />
    </>
  )
}

