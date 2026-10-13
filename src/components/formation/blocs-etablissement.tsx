import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, Building2, CalendarDays, ExternalLink, Globe, Mail, MapPin, Navigation, Phone, Quote, ShieldCheck } from 'lucide-react'
import { Carte } from '@/components/map/carte'
import { FilAriane } from '@/components/annuaire/primitives'
import { empriseAutour, clePosition } from '@/lib/annuaire/emprise'
import type { BaseUrl } from '@/lib/annuaire/types'
import { chemin } from '@/lib/navigation'
import { dateLisible, monogramme, siteLisible } from '@/lib/formation/page-etablissement'
import type { DeclarationPublique } from '@/lib/espace-pro/etablissement-donnees'
import type { Bloc } from '@/lib/espace-pro/etablissement'

/**
 * Briques communes aux pages d'établissement de formation, école de prothèse
 * et faculté d'odontologie : héros sur carte, citation, galerie, rendez-vous,
 * contacts, registres. Chaque brique reçoit des données déjà lues et ne
 * s'affiche pas quand elles manquent.
 */

export type Position = { lon: number; lat: number }

export function Pastille({ children, sombre, accent }: { children: React.ReactNode; sombre?: boolean; accent?: boolean }) {
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

export function Etiquette({ children }: { children: React.ReactNode }) {
  return <span className="squircle-full inline-flex bg-bg px-2.5 py-0.5 text-xs font-medium text-fg ring-1 ring-inset ring-line">{children}</span>
}

export function Titre2({ children, sous, id }: { children: React.ReactNode; sous?: string; id?: string }) {
  return (
    <div>
      <h2 id={id} className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">
        {children}
      </h2>
      {sous && <p className="mt-2 max-w-2xl text-fg-2">{sous}</p>}
    </div>
  )
}

/** Mention de provenance sous un bloc : déclaré par l'établissement, ou relevé aux sources publiques. */
export function Mention({ children, sombre }: { children: React.ReactNode; sombre?: boolean }) {
  return <p className={`text-xs ${sombre ? 'text-white/55' : 'text-fg-2'}`}>{children}</p>
}

/** Date de confirmation d'un bloc déclaré : sa dernière confirmation, sinon la dernière mise à jour de la fiche. */
export function confirmeLe(declaration: DeclarationPublique, bloc: Bloc): string {
  return dateLisible(declaration.donnees.confirmeLe[bloc] ?? declaration.misAJourLe)
}

/** Le logo de l'établissement sur fond blanc, ou ses initiales tant qu'il n'est pas fourni. */
export function Logo({ logo, nom, taille = 'size-16' }: { logo: { url: string; alt: string } | null; nom: string; taille?: string }) {
  return (
    <span className={`squircle-xl relative grid ${taille} shrink-0 place-items-center overflow-hidden bg-white text-lg font-bold tracking-tight text-[#0e1317] ring-1 ring-black/5`}>
      {logo ? (
        <Image src={logo.url} alt={logo.alt || `Logo, ${nom}`} fill sizes="80px" className="object-contain p-2" />
      ) : (
        <span aria-hidden>{monogramme(nom)}</span>
      )}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Héros                                                                */
/* ------------------------------------------------------------------ */

export type BlocCarteHeros = { icone: typeof CalendarDays; titre: string; valeur: string; detail?: string | null; grand?: boolean }

export function Heros({
  profession,
  position,
  rayon,
  segments,
  famille,
  uai,
  geree,
  gereePar,
  logo,
  titre,
  sousTitre,
  ligne,
  actions,
  photo,
  blocs,
  chiffres,
}: {
  profession: BaseUrl
  position: Position | null
  rayon: number
  segments: { libelle: string; href?: string }[]
  famille: string
  uai: string | null
  geree: boolean
  gereePar: string
  logo: { url: string; alt: string } | null
  titre: string
  sousTitre?: string | null
  ligne: string | null
  actions: React.ReactNode
  photo: { url: string; alt: string; credit?: string | null } | null
  blocs: BlocCarteHeros[]
  chiffres: { v: string; l: string }[]
}) {
  const carte = photo || blocs.length > 0
  return (
    <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
      {position && (
        <div className="pointer-events-none absolute inset-0 [&_.maplibregl-ctrl-bottom-right]:hidden [&_.maplibregl-ctrl-top-right]:hidden">
          <Carte profession={profession} emprise={empriseAutour(position.lon, position.lat, rayon)} className="size-full" survol={clePosition(position.lon, position.lat)} />
          <div className="absolute inset-0 bg-ardoise mix-blend-color" />
          <div className="absolute inset-0 bg-background/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
      )}
      <div className="container relative z-10 pb-16 pt-10">
        <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/70">
          <FilAriane segments={segments} />
        </div>
        <div className={`mt-10 grid gap-10 ${carte ? 'lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end' : ''}`}>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="squircle-full bg-white/10 px-3 py-1 text-sm text-white ring-1 ring-inset ring-white/15">{famille}</span>
              {uai && (
                <Pastille sombre>
                  <ShieldCheck className="size-3.5 text-teal" aria-hidden /> Établissement référencé, UAI {uai}
                </Pastille>
              )}
              {geree && (
                <Pastille sombre>
                  <BadgeCheck className="size-3.5 text-teal" aria-hidden /> Fiche gérée par {gereePar}
                </Pastille>
              )}
            </div>
            <div className="mt-5 flex items-center gap-5">
              <Logo logo={logo} nom={titre} taille="size-16 md:size-20" />
              <div className="min-w-0">
                <h1 className="text-balance text-4xl font-normal tracking-tight text-white md:text-6xl">{titre}</h1>
                {sousTitre && <p className="mt-1 text-xl text-white/80 md:text-2xl">{sousTitre}</p>}
              </div>
            </div>
            {ligne && <p className={`${sousTitre ? 'mt-4 text-white/70' : 'mt-3 text-white/75'} text-lg`}>{ligne}</p>}
            <div className="mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">{actions}</div>
          </div>
          {carte && (
            <div className="squircle-2xl shadow-pop overflow-hidden border border-white/10 bg-[#161c21]">
              {photo && (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={photo.url} alt={photo.alt} fill priority sizes="(min-width: 1024px) 22rem, 100vw" className="object-cover" />
                  {photo.credit && <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-white/80">{photo.credit}</span>}
                </div>
              )}
              {blocs.length > 0 && (
                <div className="space-y-4 p-5">
                  {blocs.map((b, i) => (
                    <div key={b.titre} className={i > 0 ? 'border-t border-white/10 pt-4' : ''}>
                      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
                        <b.icone className="size-4 text-teal" aria-hidden /> {b.titre}
                      </p>
                      <p className={`mt-1 ${b.grand ? 'text-lg font-semibold' : 'text-sm'} text-white`}>{b.valeur}</p>
                      {b.detail && <p className="text-sm text-white/60">{b.detail}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {chiffres.length > 0 && (
          <div className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
            {chiffres.map((c) => (
              <div key={c.l}>
                <p className="text-3xl font-semibold tracking-tight text-white">{c.v}</p>
                <p className="mt-1 text-sm text-white/60">{c.l}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/** Bouton du héros : le premier en couleur d'action, les autres en contour. */
export function BoutonHeros({ href, icone: Icone, children, principal, externe }: { href: string; icone: typeof Globe; children: React.ReactNode; principal?: boolean; externe?: boolean }) {
  return (
    <a
      href={href}
      rel={externe ? 'noopener' : undefined}
      className={
        principal
          ? 'hover-lift col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover'
          : 'inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 text-sm font-medium text-white hover:bg-white/10'
      }
    >
      <Icone className="size-4" aria-hidden /> {children}
      {externe && <ExternalLink className="size-3.5 opacity-60" aria-hidden />}
    </a>
  )
}

/** Barre d'action fixe en bas d'écran, mobile seulement. */
export function BarreMobile({
  titre,
  detail,
  secondaire,
  principal,
}: {
  titre: string
  detail: string | null
  secondaire?: { href: string; libelle: string; icone: React.ReactNode; externe?: boolean } | null
  principal?: { href: string; libelle: string; icone: React.ReactNode; externe?: boolean } | null
}) {
  if (!principal && !secondaire) return null
  return (
    <>
      <div data-barre-mobile className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-4 pb-6 pt-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-fg">{titre}</p>
            {detail && (
              <p className="flex items-center gap-1.5 text-xs text-teal">
                <span className="size-1.5 shrink-0 rounded-full bg-teal" /> <span className="truncate">{detail}</span>
              </p>
            )}
          </div>
          {secondaire && (
            <a href={secondaire.href} rel={secondaire.externe ? 'noopener' : undefined} aria-label={secondaire.libelle} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line text-fg">
              {secondaire.icone}
            </a>
          )}
          {principal && (
            <a href={principal.href} rel={principal.externe ? 'noopener' : undefined} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground">
              {principal.icone} {principal.libelle}
            </a>
          )}
        </div>
      </div>
      {/* La barre fixe ne doit pas masquer le pied de page. */}
      <div aria-hidden className="h-24 lg:hidden" />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Présentation et galerie                                              */
/* ------------------------------------------------------------------ */

export function Citation({ avant, suite, texte, mention }: { avant: string | null; suite: string | null; texte: string | null; mention: React.ReactNode }) {
  return (
    <div className="max-w-4xl">
      {avant && (
        <>
          <Quote className="size-8 text-teal" aria-hidden />
          <p className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-fg md:text-4xl">
            {avant} {suite && <span className="text-fg-2">{suite}</span>}
          </p>
        </>
      )}
      {texte && <p className={`max-w-3xl whitespace-pre-line leading-relaxed ${avant ? 'mt-6 text-fg-2' : 'text-xl text-fg md:text-2xl'}`}>{texte}</p>}
      <div className="mt-4">{mention}</div>
    </div>
  )
}

/**
 * Galerie : une grande photo, quatre petites. Au-delà de cinq, la dernière
 * vignette ouvre la galerie complète, affichée sous la grille par l'ancre
 * (`:target`), sans script.
 */
export function Galerie({ photos, credit, source }: { photos: { url: string; legende: string }[]; credit: string | null; source: string }) {
  if (!photos.length) return null
  const n = photos.length
  const grille = n >= 5 ? 'grid-cols-2 md:grid-cols-4 md:grid-rows-2' : n === 1 ? 'grid-cols-1' : `grid-cols-2 ${n === 3 ? 'md:grid-cols-3' : n === 4 ? 'md:grid-cols-4' : ''}`
  return (
    <div>
      <ul className={`grid gap-3 ${grille}`}>
        {photos.slice(0, 5).map((p, i) => (
          <li
            key={p.url}
            className={`squircle-2xl relative overflow-hidden border border-line ${
              n >= 5 ? (i === 0 ? 'col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto' : 'aspect-square') : n === 1 ? 'aspect-[16/9]' : n === 3 && i === 0 ? 'col-span-2 aspect-[4/3] md:col-span-1' : 'aspect-[4/3]'
            }`}
          >
            <Image src={p.url} alt={p.legende} fill sizes={i === 0 ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'} className="object-cover" />
            {i === 4 && n > 5 && (
              <a href="#galerie-complete" className="absolute inset-0 grid place-items-center bg-black/55 text-sm font-semibold text-white">
                Voir les {n} photos
              </a>
            )}
          </li>
        ))}
      </ul>
      {n > 5 && (
        <ul id="galerie-complete" className="mt-3 hidden scroll-mt-24 grid-cols-2 gap-3 target:grid md:grid-cols-4">
          {photos.slice(5).map((p) => (
            <li key={p.url} className="squircle-2xl relative aspect-square overflow-hidden border border-line">
              <Image src={p.url} alt={p.legende} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-fg-2">{credit ? `Crédit photo : ${credit}` : source}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Portes ouvertes et rendez-vous                                       */
/* ------------------------------------------------------------------ */

export function Evenements({ sous, evenements, mention }: { sous: string; evenements: { date: string; titre: string; detail?: string | null }[]; mention: string }) {
  if (!evenements.length) return null
  return (
    <section id="portes-ouvertes" className="dark scroll-mt-20 bg-background py-20 text-fg md:py-24">
      <div className="container">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Portes ouvertes et rendez-vous
          <span className="block text-white/55">{sous}</span>
        </h2>
        <ol className="mt-10 grid gap-3 md:grid-cols-3">
          {evenements.map((v) => (
            <li key={v.date + v.titre} className="squircle-2xl flex flex-col gap-6 border border-line bg-bg-soft p-6">
              <p className="flex items-center gap-2 text-sm font-medium text-teal">
                <CalendarDays className="size-4" aria-hidden /> {v.date}
              </p>
              <div>
                <p className="text-xl font-semibold tracking-tight text-white">{v.titre}</p>
                {v.detail && <p className="mt-2 text-sm text-white/65">{v.detail}</p>}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-white/55">{mention}</p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Accès et contacts                                                    */
/* ------------------------------------------------------------------ */

export function Contacts({
  adresses,
  contact,
  siteWeb,
  position,
  profession,
}: {
  adresses: string[]
  contact: { titre: string; telephone: string | null; email: string | null } | null
  siteWeb: string | null
  position: Position | null
  profession: BaseUrl
}) {
  if (!adresses.length && !contact && !siteWeb) return null
  const itineraire = adresses[0] ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresses[0])}` : null
  return (
    <section id="contacts" className="container scroll-mt-20 py-20 md:py-24">
      <div className={`grid gap-12 ${position ? 'lg:grid-cols-2' : ''}`}>
        <div className="min-w-0">
          <Titre2>Accès et contacts</Titre2>
          {adresses.map((a, i) => (
            <p key={a} className={`${i === 0 ? 'mt-6' : 'mt-2'} flex items-start gap-2 text-fg`}>
              <MapPin className="mt-1 size-4 shrink-0 text-teal" aria-hidden /> {a}
            </p>
          ))}
          {contact && (contact.telephone || contact.email) && (
            <ul className="mt-8 divide-y divide-line border-y border-line">
              <li className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-medium text-fg">{contact.titre}</p>
                  <p className="break-all text-sm text-fg-2">{[contact.telephone, contact.email].filter(Boolean).join(' · ')}</p>
                </div>
                <div className="flex gap-2">
                  {contact.telephone && (
                    <a href={`tel:${contact.telephone.replace(/[\s.]/g, '')}`} aria-label={`Appeler le ${contact.telephone}`} className="grid size-10 place-items-center rounded-full border border-line text-fg hover:bg-bg-soft">
                      <Phone className="size-4" aria-hidden />
                    </a>
                  )}
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} aria-label={`Écrire à ${contact.email}`} className="grid size-10 place-items-center rounded-full border border-line text-fg hover:bg-bg-soft">
                      <Mail className="size-4" aria-hidden />
                    </a>
                  )}
                </div>
              </li>
            </ul>
          )}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            {siteWeb && (
              <a href={siteWeb} rel="noopener" className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-fg underline-offset-4 hover:underline">
                <Globe className="size-4 shrink-0 text-teal" aria-hidden /> <span className="truncate">{siteLisible(siteWeb)}</span> <ExternalLink className="size-3.5 shrink-0 opacity-60" aria-hidden />
              </a>
            )}
            {itineraire && (
              <a href={itineraire} rel="noopener" className="inline-flex items-center gap-2 text-sm font-medium text-fg underline-offset-4 hover:underline">
                <Navigation className="size-4 text-teal" aria-hidden /> Itinéraire <ExternalLink className="size-3.5 opacity-60" aria-hidden />
              </a>
            )}
          </div>
        </div>
        {position && (
          <div className="squircle-2xl relative min-h-80 overflow-hidden border border-line">
            <Carte profession={profession} emprise={empriseAutour(position.lon, position.lat, 500)} className="absolute inset-0 size-full" survol={clePosition(position.lon, position.lat)} />
          </div>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Registres, autres établissements, gestion                            */
/* ------------------------------------------------------------------ */

export function RegistreEtAutres({
  sous,
  lignes,
  sources,
  autresTitre,
  autres,
  tousHref,
  tousLibelle,
  gestion,
}: {
  sous: string
  lignes: [string, string][]
  sources: string[]
  autresTitre: string
  autres: { href: string; nom: string; detail: string | null }[]
  tousHref: string
  tousLibelle: string
  gestion: React.ReactNode
}) {
  return (
    <section id="sources" className="container scroll-mt-20 pb-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="min-w-0">
          <Titre2 sous={sous}>Ce que disent les registres</Titre2>
          {lignes.length > 0 && (
            <dl className="mt-6 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              {lignes.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-fg-2">{k}</dt>
                  <dd className={k.startsWith('Numéro') ? 'font-mono text-fg' : 'text-fg'}>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {sources.length > 0 && (
            <details className="squircle-xl group mt-8 border border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-sm font-medium text-fg [&::-webkit-details-marker]:hidden">
                {sources.length} {sources.length > 1 ? 'pages consultées' : 'page consultée'}
                <span className="text-xs font-normal text-fg-2 group-open:hidden">Afficher</span>
              </summary>
              <ul className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
                {sources.map((u) => (
                  <li key={u} className="truncate">
                    <a href={u} rel="noopener" className="text-action underline underline-offset-4">
                      {u.replace(/^https?:\/\//, '')}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <p className="mt-4 text-xs text-fg-2">
            Une information inexacte ?{' '}
            <Link href={chemin('/contact/?objet=autre')} className="underline underline-offset-2 hover:text-fg">
              Signaler une erreur
            </Link>
            .
          </p>
        </div>
        <div className="min-w-0 space-y-8">
          {gestion}
          {autres.length > 0 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-fg-2">{autresTitre}</p>
              <ul className="mt-4 space-y-3">
                {autres.map((a) => (
                  <li key={a.href}>
                    <Link href={chemin(a.href)} className="squircle-xl flex items-center gap-4 border border-line p-4 hover:bg-bg-soft">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-bg-soft">
                        <Building2 className="size-5 text-teal" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-fg">{a.nom}</span>
                        {a.detail && <span className="block truncate text-sm text-fg-2">{a.detail}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={chemin(tousHref)} className="mt-4 inline-flex text-sm font-medium text-fg underline-offset-4 hover:underline">
                {tousLibelle}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
