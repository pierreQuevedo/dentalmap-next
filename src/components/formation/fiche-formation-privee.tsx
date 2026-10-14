/**
 * Page d'une formation privée, dans le style des fiches d'établissement :
 * héros sombre, organisme en monogramme, l'essentiel en bandeau, programme en
 * étapes, sessions, public et prérequis, tarif et prise en charge,
 * inscription externe.
 *
 * L'article WordPress (type `privee`) donne l'adresse, le titre et la photo ;
 * tout le reste est le détail déclaré par l'organisme et vérifié par l'équipe
 * avant publication (Neon, `demandes_formation`). Un bloc sans donnée ne
 * s'affiche pas.
 */
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Clock, Euro, ExternalLink, Flag, Laptop, MapPin, ShieldCheck, Users } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { chemin } from '@/lib/navigation'
import { Balisage, filAriane } from '@/lib/seo/jsonld'
import { domaine, enLigne, lieuSession, mentions, pave, phraseMentions, type FormationPriveeVue } from '@/lib/formation/privee-liste'
import { ARIANE, CarteFormationPrivee, Etiquette, Monogramme, Prise, lienPrivee } from './blocs-formation-privee'

type Props = { f: FormationPriveeVue; autres: FormationPriveeVue[]; base?: string }

const date = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(new Date(iso))
const places = (n: number | null) => (n ? `${n} ${n > 1 ? 'places' : 'place'}` : null)

function Declare({ f }: { f: FormationPriveeVue }) {
  return <p className="text-xs text-fg-2">Déclaré par l’organisme, publié après vérification le {date(f.publieeLe)}</p>
}

function Heros({ f }: Props) {
  const { d } = f
  const s = f.avenir[0]
  const m = mentions(d, f.verifications)
  const essentiel = [
    [Clock, 'Durée', d.duree],
    [Laptop, 'Format', d.format],
    [Users, 'Public', d.publics.join(', ')],
    ...(d.tarif ? [[Euro, 'Tarif', d.tarif] as const] : []),
  ] as const
  return (
    <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {f.image && <Image src={f.image.url} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
      <div className="container relative z-10 pb-16 pt-10">
        <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/70">
          <FilAriane segments={[...ARIANE, { libelle: d.theme }]} />
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="squircle-full bg-white/10 px-3 py-1 text-sm text-white ring-1 ring-inset ring-white/15">Formation continue</span>
              <Etiquette ton="sombre">{d.theme}</Etiquette>
              <Etiquette ton="sombre">{d.format}</Etiquette>
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-normal tracking-tight text-white md:text-6xl">{f.titre}</h1>
            <div className="mt-5 flex items-center gap-3">
              <Monogramme organisme={d.organisme} className="size-12 text-base" />
              <div>
                <p className="font-semibold text-white">{d.organisme}</p>
                <p className="text-sm text-white/60">Organisme de formation</p>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
              {s && (
                <a href="#sessions" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover">
                  <CalendarDays className="size-4" aria-hidden /> Voir les sessions
                </a>
              )}
              <a
                href={d.lienInscription}
                target="_blank"
                rel="noopener nofollow"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 text-sm font-medium text-white hover:bg-white/10"
              >
                S’inscrire sur le site de l’organisme <ExternalLink className="size-3.5 opacity-60" aria-hidden />
              </a>
            </div>
          </div>
          <div className="squircle-2xl shadow-pop overflow-hidden border border-white/10 bg-[#161c21] p-5">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
              <CalendarDays className="size-4 text-teal" aria-hidden /> Prochaine session
            </p>
            {s ? (
              <>
                <p className="mt-1 text-lg font-semibold text-white">{s.dates}</p>
                <p className="text-sm text-white/60">{[lieuSession(s), places(s.places)].filter(Boolean).join(' · ')}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-white/70">Aucune session à venir n’est annoncée. Consultez le site de l’organisme.</p>
            )}
            {m.length > 0 && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-white/60">Prise en charge</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.map((p) => (
                    <Prise key={p.nom} p={p} sombre />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
          {essentiel.map(([Icone, l, v]) => (
            <div key={l}>
              <dt className="flex items-center gap-1.5 text-sm text-white/60">
                <Icone className="size-4 text-teal" aria-hidden /> {l}
              </dt>
              <dd className="mt-1.5 text-lg font-semibold leading-snug tracking-tight text-white">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function Programme({ f }: { f: FormationPriveeVue }) {
  const { d } = f
  if (!d.resume && !d.programme.length) return null
  return (
    <section className="container py-20 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Le programme</h2>
          {d.resume && <p className="mt-5 leading-relaxed text-fg-2">{d.resume}</p>}
          <div className="mt-6">
            <Declare f={f} />
          </div>
        </div>
        {d.programme.length > 0 && (
          <ol>
            {d.programme.map((p, k) => (
              <li key={k} className="border-b border-line py-8 first:pt-0">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-5xl font-light tabular-nums tracking-tight text-fg md:text-6xl">{String(k + 1).padStart(2, '0')}</p>
                  {p.duree && <span className="text-sm text-fg-2">{p.duree}</span>}
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-fg">{p.titre}</h3>
                {p.detail && <p className="mt-1 text-fg-2">{p.detail}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

function Sessions({ f }: { f: FormationPriveeVue }) {
  return (
    <section id="sessions" className="dark scroll-mt-20 bg-background py-20 text-fg">
      <div className="container">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Sessions à venir
          <span className="block text-white/55">Dates et lieux indiqués par l’organisme.</span>
        </h2>
        {f.avenir.length ? (
          <ul className="mt-10 grid gap-3 md:grid-cols-3">
            {f.avenir.map((s, i) => {
              const { jour, mois } = pave(s)
              return (
                <li key={i} className="squircle-2xl flex items-center gap-4 border border-line bg-bg-soft p-5">
                  <div className="squircle-xl grid w-16 shrink-0 place-content-center bg-white/5 py-2 text-center">
                    <span className="text-3xl font-semibold tabular-nums leading-none text-white">{jour}</span>
                    <span className="mt-1 text-xs uppercase tracking-wide text-white/60">{mois}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{s.dates}</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-white/70">
                      {enLigne(s) ? <Laptop className="size-3.5 text-teal" aria-hidden /> : <MapPin className="size-3.5 text-teal" aria-hidden />} {lieuSession(s)}
                      {s.places && ` · ${places(s.places)}`}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mt-10 text-white/70">Aucune session à venir n’est annoncée. Consultez le site de l’organisme pour les prochaines dates.</p>
        )}
      </div>
    </section>
  )
}

function Infos({ f }: { f: FormationPriveeVue }) {
  const { d } = f
  const m = mentions(d, f.verifications)
  const phrase = phraseMentions(m)
  const tarif = d.tarif || m.length > 0
  return (
    <section className="container py-20">
      <div className={`grid gap-3 ${tarif ? 'lg:grid-cols-2' : ''}`}>
        <div className="squircle-2xl border border-line bg-bg-soft p-6">
          <h2 className="text-lg font-semibold text-fg">{d.prerequis.length ? 'Public et prérequis' : 'Public'}</h2>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {d.publics.map((p) => (
              <Etiquette key={p}>{p}</Etiquette>
            ))}
          </div>
          {d.prerequis.length > 0 && (
            <ul className="mt-4 space-y-2 text-fg-2">
              {d.prerequis.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
        {tarif && (
          <div className="squircle-2xl border border-line bg-bg-soft p-6">
            <h2 className="text-lg font-semibold text-fg">{d.tarif ? 'Tarif et prise en charge' : 'Prise en charge'}</h2>
            {d.tarif && (
              <>
                <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-fg">{d.tarif}</p>
                <p className="text-sm text-fg-2">Indiqué par l’organisme</p>
              </>
            )}
            {m.length > 0 && (
              <>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {m.map((p) => (
                    <Prise key={p.nom} p={p} />
                  ))}
                </div>
                <p className="mt-3 flex gap-2 text-xs text-fg-2">
                  <ShieldCheck className="size-3.5 shrink-0 text-teal" aria-hidden /> {phrase}
                </p>
              </>
            )}
          </div>
        )}
      </div>
      <div className="squircle-3xl mt-3 flex flex-col gap-6 border border-line p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-xl font-semibold tracking-tight text-fg">L’inscription se fait chez l’organisme.</p>
          <p className="mt-1 text-sm text-fg-2">DentalMap ne vend pas de formation et ne prend pas d’inscription.</p>
          <Link href={chemin(`/contact/?objet=annonce&page=${encodeURIComponent(lienPrivee(f.slug))}`)} className="mt-3 inline-flex items-center gap-1.5 text-xs text-fg-2 underline-offset-4 hover:underline">
            <Flag className="size-3.5" aria-hidden /> Signaler une erreur sur cette formation
          </Link>
        </div>
        <a
          href={d.lienInscription}
          target="_blank"
          rel="noopener nofollow"
          className="inline-flex h-12 min-w-0 shrink-0 items-center justify-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground hover:bg-action-hover"
        >
          <span className="truncate">{domaine(d.siteOrganisme ?? d.lienInscription)}</span> <ExternalLink className="size-4 shrink-0" aria-hidden />
        </a>
      </div>
    </section>
  )
}

function Autres({ autres, base }: { autres: FormationPriveeVue[]; base?: string }) {
  if (!autres.length) return null
  return (
    <section className="container pb-20">
      <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Autres formations</h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {autres.map((x) => (
          <CarteFormationPrivee key={x.slug} f={x} base={base} />
        ))}
      </ol>
    </section>
  )
}

export function FicheFormationPrivee({ f, autres, base }: Props) {
  const segments = [...ARIANE.map((s) => ({ nom: s.libelle, chemin: s.href })), { nom: f.titre, chemin: lienPrivee(f.slug, base) }]
  return (
    <main>
      <Balisage donnees={filAriane(segments)} />
      <Heros f={f} autres={autres} />
      <Programme f={f} />
      <Sessions f={f} />
      <Infos f={f} />
      <Autres autres={autres} base={base} />
    </main>
  )
}
