/**
 * Détail d'une cession, dans le gabarit de l'offre d'emploi : héros sombre
 * posé sur la carte du secteur, l'essentiel en bandeau, puis le cabinet en
 * blocs numérotés, le secteur, le contact et les annonces proches.
 *
 * Confidentialité : un cercle de secteur, jamais de point ; ni nom ni
 * coordonnées du cédant, qu'on joint avec un compte par la messagerie.
 */
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight, Armchair, Bell, CalendarClock, Clock, Euro, Flag, Mail, Maximize2, Tag, TrendingUp } from 'lucide-react'
import { chemin } from '@/lib/navigation'
import { FilAriane } from '@/components/annuaire/primitives'
import { empriseAutour } from '@/lib/annuaire/emprise'
import { getCompte } from '@/lib/tunnel/compte'
import { chiffreAffaires, dateLongue, formaterDisponibilite, lignes, paragraphes, prixLong, referenceAnnonce } from '@/lib/cessions/format'
import { LISTE_CESSIONS, ROUTE_MESSAGERIE_CESSION, cheminAnnonceCession, cheminDepartementCession } from '@/lib/cessions/routes'
import { LIBELLE_TYPE, type AnnonceDetail, type AnnonceResume } from '@/lib/cessions/types'
import { CarteSecteur } from './carte'
import { CarteAnnonce, CedantVerifie, Etiquette, Visuel } from './blocs'
import { BoutonPartager, FormulaireMessage } from './message'

function Hero({ a }: { a: AnnonceDetail }) {
  const ariane = [
    { libelle: 'Accueil', href: '/' },
    { libelle: 'Cessions de cabinet', href: LISTE_CESSIONS },
    { libelle: a.departementNom, href: cheminDepartementCession(a.departementSlug) },
    { libelle: a.secteur },
  ]
  const dispo = formaterDisponibilite(a.disponibilite)
  const essentiel = [
    { icone: Tag, label: 'Type de cession', valeur: LIBELLE_TYPE[a.type] },
    a.fauteuils ? { icone: Armchair, label: 'Fauteuils', valeur: String(a.fauteuils) } : null,
    { icone: TrendingUp, label: 'Chiffre d’affaires', valeur: chiffreAffaires(a.caMin, a.caMax), detail: 'Indicatif, annuel' },
    { icone: Euro, label: 'Prix', valeur: prixLong(a.prix), detail: a.prix ? 'Prix demandé' : undefined },
    a.surface ? { icone: Maximize2, label: 'Surface', valeur: `${a.surface} m²` } : null,
    dispo ? { icone: CalendarClock, label: 'Disponibilité', valeur: dispo } : null,
  ].filter((e) => e !== null)
  const resume = paragraphes(a.description)[0] ?? ''

  return (
    <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
      <div aria-hidden inert className="pointer-events-none absolute inset-0">
        <CarteSecteur
          emprise={empriseAutour(a.lon - (a.rayonM * 0.6) / 111_320, a.lat, a.rayonM * 1.6)}
          mention={false}
          points={[]}
          rayon={{ lon: a.lon, lat: a.lat, metres: a.rayonM }}
        />
        <div className="absolute inset-0 bg-ardoise mix-blend-color" />
        <div className="absolute inset-0 [background:radial-gradient(ellipse_70%_80%_at_70%_45%,color-mix(in_oklch,var(--background)_30%,transparent)_0%,var(--background)_85%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>
      <p className="absolute bottom-3 right-4 z-10 text-[11px] text-white/45">Plans © OpenStreetMap, OpenMapTiles, via OpenFreeMap</p>

      <div className="container relative z-10 pb-14 pt-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="min-w-0">
            <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/70">
              <FilAriane segments={ariane} />
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <Etiquette ton="sombre">Cession de cabinet</Etiquette>
              <Etiquette ton="sombre">{LIBELLE_TYPE[a.type]}</Etiquette>
              <span className="inline-flex items-center gap-1.5 text-xs text-white/60">
                <Clock className="size-3.5" aria-hidden /> Publiée le {dateLongue(a.publieeLe)}
              </span>
            </div>
            <h1 className="mt-5 text-4xl font-normal tracking-tight text-white md:text-6xl">{a.titre}</h1>
            <p className="mt-3 text-lg text-white/75">
              Secteur {a.secteur}, {a.departementNom}
            </p>
            <div className="mt-4">
              <CedantVerifie sombre />
            </div>
            <p className="mt-8">
              <span className="block text-3xl font-semibold tabular-nums tracking-tight text-white md:text-4xl">{prixLong(a.prix)}</span>
              <span className="text-sm text-white/60">
                {a.prix ? 'Prix demandé' : 'Prix communiqué par le cédant'} · CA indicatif {chiffreAffaires(a.caMin, a.caMax)}
              </span>
            </p>
            <div className="mt-8 grid grid-cols-[1fr_auto_auto] gap-2 sm:flex sm:flex-wrap">
              <a href="#contact" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                <Mail className="size-4" aria-hidden /> Contacter le cédant
              </a>
              <Link
                href={chemin(`${cheminDepartementCession(a.departementSlug)}#alerte`)}
                aria-label="Créer une alerte"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10 sm:px-5"
              >
                <Bell className="size-4" aria-hidden /> <span className="hidden sm:inline">Créer une alerte</span>
              </Link>
              <BoutonPartager titre={a.titre} />
            </div>
          </div>
          <div className="squircle-2xl shadow-pop overflow-hidden border border-white/10 bg-[#161c21]">
            <Visuel a={a} className="aspect-[16/10]" priorite />
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">Le cabinet</p>
              <p className="mt-1 line-clamp-4 text-white">{resume}</p>
              {a.photo && <p className="mt-2 text-xs text-white/50">Photo déposée par le cédant</p>}
            </div>
          </div>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-8 md:grid-cols-3 xl:grid-cols-6">
          {essentiel.map((e) => (
            <div key={e.label}>
              <dt className="flex items-center gap-1.5 text-sm text-white/60">
                <e.icone className="size-4 text-teal" aria-hidden /> {e.label}
              </dt>
              <dd className="mt-1.5 text-lg font-semibold leading-snug tracking-tight text-white">{e.valeur}</dd>
              {'detail' in e && e.detail && <dd className="text-sm text-white/60">{e.detail}</dd>}
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
      {items.map((x, i) => (
        <li key={`${i}-${x}`} className="flex gap-3 text-fg">
          <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
          {x}
        </li>
      ))}
    </ul>
  )
}

function Cabinet({ a }: { a: AnnonceDetail }) {
  const locaux = lignes(a.locaux)
  const blocs = [
    { titre: 'Équipements', items: a.equipements },
    { titre: 'Conditions de la cession', items: lignes(a.conditions) },
    { titre: 'Locaux', items: a.surface && !locaux.some((l) => l.includes('m²')) ? [`${a.surface} m²`, ...locaux] : locaux },
  ].filter((b) => b.items.length > 0)
  return (
    <section className="container py-20 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Le cabinet</h2>
          <div className="mt-5 space-y-4 leading-relaxed text-fg-2">
            {paragraphes(a.description).map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
          <div className="squircle-2xl mt-8 border border-line bg-bg-soft p-5 text-sm">
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-fg-2">
              <span>
                Publiée le <span className="text-fg">{dateLongue(a.publieeLe)}</span>
              </span>
              <span>
                Expire le <span className="text-fg">{dateLongue(a.expireLe)}</span>
              </span>
              <span>Référence {referenceAnnonce(a.id, a.publieeLe)}</span>
            </p>
            <Link href={chemin(`/contact/?objet=annonce&page=${encodeURIComponent(cheminAnnonceCession(a.departementSlug, a.slug))}`)} className="mt-3 inline-flex items-center gap-1.5 text-xs text-fg-2 underline-offset-4 hover:underline">
              <Flag className="size-3.5" aria-hidden /> Signaler cette annonce
            </Link>
          </div>
        </div>
        {blocs.length > 0 && (
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
        )}
      </div>
    </section>
  )
}

function Secteur({ a }: { a: AnnonceDetail }) {
  return (
    <section className="dark bg-background py-20 text-fg">
      <div className="container grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Le secteur
            <span className="block text-white/55">Jamais l’adresse exacte.</span>
          </h2>
          <p className="mt-5 text-fg-2">
            Le cabinet se trouve dans un rayon d’environ {(a.rayonM / 1000).toLocaleString('fr-FR')} km autour de {a.communeNom}. L’adresse est communiquée par le cédant, s’il donne suite à
            votre message.
          </p>
        </div>
        <div className="squircle-2xl overflow-hidden border border-line">
          <CarteSecteur className="h-72 md:h-96" emprise={empriseAutour(a.lon, a.lat, a.rayonM * 1.5)} points={[]} rayon={{ lon: a.lon, lat: a.lat, metres: a.rayonM }} />
        </div>
      </div>
    </section>
  )
}

const bouton = 'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-action text-sm font-semibold text-action-foreground hover:bg-action-hover'

/** Lit la session : sans compte, on se connecte d'abord ; sur sa propre annonce, on renvoie à la messagerie. */
async function ContactSelonCompte({ a }: { a: AnnonceDetail }) {
  const retour = cheminAnnonceCession(a.departementSlug, a.slug)
  const compte = await getCompte()
  if (!compte) {
    return (
      <div className="space-y-3">
        <Link href={chemin(`/connexion/?retour=${encodeURIComponent(retour)}`)} className={bouton}>
          <Mail className="size-4" aria-hidden /> Contacter le cédant
        </Link>
        <p className="text-center text-xs text-fg-2">Connectez-vous ou créez votre compte pour écrire au cédant ; vous revenez ensuite à cette annonce.</p>
      </div>
    )
  }
  if (compte.id === a.auteurUserId) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-fg">C’est votre annonce. Les messages des repreneurs arrivent dans la messagerie de votre espace pro.</p>
        <Link href={chemin(ROUTE_MESSAGERIE_CESSION)} className={bouton}>
          Ouvrir mon espace pro
        </Link>
      </div>
    )
  }
  return <FormulaireMessage annonceId={a.id} retour={retour} />
}

function Contact({ a }: { a: AnnonceDetail }) {
  return (
    <section id="contact" className="container scroll-mt-24 py-20">
      <div className="squircle-3xl grid gap-8 border border-line bg-bg-soft p-6 md:p-10 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-16">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">Ce cabinet vous intéresse ?</h2>
          <p className="mt-3 max-w-xl text-fg-2">Votre message est transmis au cédant, qui est prévenu par email ; ses coordonnées ne sont pas affichées.</p>
          <ul className="mt-6 space-y-2 text-sm text-fg-2">
            <li>Un compte DentalMap est nécessaire pour écrire au cédant.</li>
            <li>Vos échanges restent dans la messagerie : chacun choisit ce qu’il communique.</li>
          </ul>
        </div>
        <div className="self-center">
          <Suspense
            fallback={
              <span className={`${bouton} opacity-60`} aria-hidden>
                <Mail className="size-4" /> Contacter le cédant
              </span>
            }
          >
            <ContactSelonCompte a={a} />
          </Suspense>
        </div>
      </div>
    </section>
  )
}

function Proches({ a, proches }: { a: AnnonceDetail; proches: AnnonceResume[] }) {
  if (!proches.length) return null
  return (
    <section className="container pb-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Annonces proches</h2>
        <Link href={chemin(cheminDepartementCession(a.departementSlug))} className="inline-flex items-center gap-2 text-sm font-medium text-fg">
          Toutes les cessions en {a.departementNom} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <ul className="mt-6 space-y-3 sm:hidden">
        {proches.map((p) => (
          <CarteAnnonce key={p.id} a={p} />
        ))}
      </ul>
      <ul className="mt-6 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {proches.map((p) => (
          <CarteAnnonce key={p.id} a={p} forme="carte" />
        ))}
      </ul>
    </section>
  )
}

export function PageAnnonce({ a, proches }: { a: AnnonceDetail; proches: AnnonceResume[] }) {
  return (
    <main>
      <Hero a={a} />
      <Cabinet a={a} />
      <Secteur a={a} />
      <Contact a={a} />
      <Proches a={a} proches={proches} />
    </main>
  )
}
