/**
 * MAQUETTE. Détail d'une cession, dans le gabarit A validé pour l'offre
 * d'emploi : héros sombre posé sur la carte, l'essentiel en bandeau, puis le
 * cabinet en blocs numérotés, le secteur, le contact par formulaire et les
 * annonces proches. Confidentialité : un cercle de secteur, jamais de point,
 * ni nom ni coordonnées du cédant.
 */
import { ArrowRight, Bell, CalendarClock, Clock, Euro, Flag, Mail, Maximize2, Armchair, Send, Share2, TrendingUp, Tag } from 'lucide-react'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { FilAriane } from '@/components/annuaire/primitives'
import { empriseAutour } from '@/lib/annuaire/emprise'
import { CarteSecteur } from './_carte'
import { AValider, CarteAnnonce, CedantVerifie, Etiquette, Visuel } from './_blocs'
import { DETAIL, ca, prix } from './_donnees'

const { a } = DETAIL

const ARIANE = [
  { libelle: 'Accueil', href: '/' },
  { libelle: 'Annonces', href: '/annonces/' },
  { libelle: 'Cessions de cabinet', href: '/annonces/cession/' },
  { libelle: 'Gironde', href: '/annonces/cession/gironde/' },
  { libelle: a.secteur },
]

const ESSENTIEL = [
  { icone: Tag, label: 'Type de cession', valeur: a.type },
  { icone: Armchair, label: 'Fauteuils', valeur: String(a.fauteuils) },
  { icone: TrendingUp, label: 'Chiffre d’affaires', valeur: ca(a), detail: 'Indicatif, annuel' },
  { icone: Euro, label: 'Prix', valeur: prix(a), detail: 'Exemple' },
  { icone: Maximize2, label: 'Surface', valeur: `${a.surface} m²` },
  { icone: CalendarClock, label: 'Disponibilité', valeur: a.dispo },
]

function Hero() {
  return (
    <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
      <div aria-hidden inert className="pointer-events-none absolute inset-0">
        <CarteSecteur emprise={empriseAutour(a.lon - 0.012, a.lat, 3200)} mention={false} points={[]} rayon={{ lon: a.lon, lat: a.lat, metres: a.rayon }} />
        <div className="absolute inset-0 bg-ardoise mix-blend-color" />
        <div className="absolute inset-0 [background:radial-gradient(ellipse_70%_80%_at_70%_45%,color-mix(in_oklch,var(--background)_30%,transparent)_0%,var(--background)_85%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>
      <p className="absolute bottom-3 right-4 z-10 text-[11px] text-white/45">Plans © OpenStreetMap, OpenMapTiles, via OpenFreeMap</p>

      <div className="container relative z-10 pb-14 pt-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="min-w-0">
            <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/70">
              <FilAriane segments={ARIANE} />
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <Etiquette ton="sombre">Cession de cabinet</Etiquette>
              <Etiquette ton="sombre">{a.type}</Etiquette>
              <span className="inline-flex items-center gap-1.5 text-xs text-white/60">
                <Clock className="size-3.5" aria-hidden /> Publiée {a.depuis}
              </span>
            </div>
            <h1 className="mt-5 text-4xl font-normal tracking-tight text-white md:text-6xl">{a.titre}</h1>
            <p className="mt-3 text-lg text-white/75">Secteur {a.secteur}, Gironde</p>
            <div className="mt-4">
              <CedantVerifie sombre />
            </div>
            <p className="mt-8">
              <span className="block text-3xl font-semibold tabular-nums tracking-tight text-white md:text-4xl">{prix(a)}</span>
              <span className="text-sm text-white/60">Prix demandé, exemple · CA indicatif {ca(a)}</span>
            </p>
            <div className="mt-8 grid grid-cols-[1fr_auto_auto] gap-2 sm:flex sm:flex-wrap">
              <a href="#contact" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground">
                <Mail className="size-4" aria-hidden /> Contacter le cédant
              </a>
              <a aria-label="Créer une alerte" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 text-sm font-medium text-white sm:px-5">
                <Bell className="size-4" aria-hidden /> <span className="hidden sm:inline">Créer une alerte</span>
              </a>
              <a aria-label="Partager" className="inline-flex size-12 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white">
                <Share2 className="size-4" aria-hidden />
              </a>
            </div>
          </div>
          <div className="squircle-2xl shadow-pop overflow-hidden border border-white/10 bg-[#161c21]">
            <Visuel a={a} className="aspect-[16/10]" />
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">Le cabinet</p>
              <p className="mt-1 text-white">{DETAIL.resume}</p>
              <p className="mt-2 text-xs text-white/50">Photo déposée par le cédant</p>
            </div>
          </div>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-8 md:grid-cols-3 xl:grid-cols-6">
          {ESSENTIEL.map((e) => (
            <div key={e.label}>
              <dt className="flex items-center gap-1.5 text-sm text-white/60">
                <e.icone className="size-4 text-teal" aria-hidden /> {e.label}
              </dt>
              <dd className="mt-1.5 text-lg font-semibold leading-snug tracking-tight text-white">{e.valeur}</dd>
              {e.detail && <dd className="text-sm text-white/60">{e.detail}</dd>}
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function Liste({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((x) => (
        <li key={x} className="flex gap-3 text-fg">
          <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
          {x}
        </li>
      ))}
    </ul>
  )
}

function Cabinet() {
  const blocs = [
    { titre: 'Équipements', items: DETAIL.equipements },
    { titre: 'Conditions de la cession', items: DETAIL.conditions },
    { titre: 'Locaux', items: DETAIL.locaux },
  ]
  return (
    <section className="container py-20 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Le cabinet</h2>
          <p className="mt-5 leading-relaxed text-fg-2">{DETAIL.resume}</p>
          <div className="squircle-2xl mt-8 border border-line bg-bg-soft p-5 text-sm">
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-fg-2">
              <span>
                Publiée le <span className="text-fg">{a.publiee}</span>
              </span>
              <span>
                Expire le <span className="text-fg">{a.expire}</span>
              </span>
              <span>Référence {DETAIL.reference}</span>
            </p>
            <a className="mt-3 inline-flex items-center gap-1.5 text-xs text-fg-2 underline-offset-4 hover:underline">
              <Flag className="size-3.5" aria-hidden /> Signaler cette annonce
            </a>
          </div>
        </div>
        <ol>
          {blocs.map((b, k) => (
            <li key={b.titre} className="border-b border-line py-10 first:pt-0">
              <p className="text-6xl font-light tabular-nums tracking-tight text-fg md:text-7xl">0{k + 1}</p>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-fg">{b.titre}</h3>
              <div className="mt-4">
                <Liste items={b.items} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Secteur() {
  return (
    <section className="dark bg-background py-20 text-fg">
      <div className="container grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Le secteur
            <span className="block text-white/55">Jamais l’adresse exacte.</span>
          </h2>
          <p className="mt-5 text-fg-2">L’adresse est communiquée par le cédant, s’il donne suite à votre message.</p>
        </div>
        <div className="squircle-2xl overflow-hidden border border-line">
          <CarteSecteur className="h-72 md:h-96" emprise={empriseAutour(a.lon, a.lat, 3000)} points={[]} rayon={{ lon: a.lon, lat: a.lat, metres: a.rayon }} />
        </div>
      </div>
    </section>
  )
}

function Champ({ id, libelle, type = 'text', placeholder }: { id: string; libelle: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={`cession-${id}`} className="mb-1.5 block text-sm font-medium text-fg">
        {libelle}
      </label>
      <input id={`cession-${id}`} type={type} placeholder={placeholder} className="h-11 w-full rounded-lg border border-line bg-bg px-3 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong" />
    </div>
  )
}

function Contact() {
  return (
    <section id="contact" className="container scroll-mt-24 py-20">
      <div className="squircle-3xl grid gap-8 border border-line bg-bg-soft p-6 md:p-10 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-16">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">{'Ce cabinet vous intéresse ?'}</h2>
          <p className="mt-3 max-w-xl text-fg-2">Votre message est transmis au cédant ; ses coordonnées ne sont pas affichées.</p>
          <ul className="mt-6 space-y-2 text-sm text-fg-2">
            <li>
              Compte nécessaire pour écrire au cédant
              <AValider />
            </li>
            <li>
              Vos coordonnées transmises avec votre message
              <AValider />
            </li>
          </ul>
        </div>
        <form className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Champ id="nom" libelle="Nom" />
            <Champ id="email" libelle="Adresse électronique" type="email" placeholder="prenom.nom@exemple.fr" />
          </div>
          <div>
            <label htmlFor="cession-message" className="mb-1.5 block text-sm font-medium text-fg">
              Votre message
            </label>
            <textarea
              id="cession-message"
              rows={4}
              placeholder="Votre situation, votre projet de reprise et vos disponibilités pour une visite."
              className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none placeholder:text-fg-2 focus:border-line-strong"
            />
          </div>
          <button type="button" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-action text-sm font-semibold text-action-foreground">
            <Send className="size-4" aria-hidden /> Envoyer au cédant
          </button>
        </form>
      </div>
    </section>
  )
}

function Proches() {
  return (
    <section className="container pb-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Annonces proches</h2>
        <Link href={chemin('/maquettes/annonces/liste/')} className="inline-flex items-center gap-2 text-sm font-medium text-fg">
          Toutes les cessions en Gironde <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <ul className="mt-6 space-y-3 sm:hidden">
        {DETAIL.proches.map((p) => (
          <CarteAnnonce key={p.id} a={p} />
        ))}
      </ul>
      <ul className="mt-6 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {DETAIL.proches.map((p) => (
          <CarteAnnonce key={p.id} a={p} forme="carte" />
        ))}
      </ul>
    </section>
  )
}

export function PageAnnonce() {
  return (
    <main>
      <Hero />
      <Cabinet />
      <Secteur />
      <Contact />
      <Proches />
    </main>
  )
}
