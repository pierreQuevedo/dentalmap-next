/**
 * Rubrique « Métiers » des Ressources : le hub des métiers et la fiche d'un
 * métier (héros sombre plein cadre, comme les fiches formation et
 * établissement). Données : conseils WordPress de catégorie `metiers` et
 * groupe ACF « Fiche métier », voir `src/lib/conseils/metier.ts`.
 *
 * Le bandeau vers les offres d'emploi viendra avec les pages Emploi : tant
 * qu'elles n'existent pas, la fiche s'arrête aux sources et aux autres métiers.
 */
import Image from 'next/image'
import Link from 'next/link'
import { Armchair, ArrowRight, ArrowUpRight, CalendarDays, ClipboardList, FileCheck, GraduationCap, Hammer, MessageCircle, ScanSearch, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { formaterDate, lienConseil } from '@/components/conseils/primitives'
import { chemin } from '@/lib/navigation'
import { SECTEURS, type CarteMetier, type CaseSalaireFiche, type FicheMetier, type IconeMission } from '@/lib/conseils/metier'
import type { ConseilComplet, ConseilResume } from '@/lib/wp/queries'

const ICONES: Record<IconeMission, typeof Armchair> = {
  fauteuil: Armchair,
  hygiene: ShieldCheck,
  accueil: MessageCircle,
  gestion: ClipboardList,
  diagnostic: ScanSearch,
  atelier: Hammer,
  controle: FileCheck,
  planning: CalendarDays,
}

const ARIANE = [
  { libelle: 'Accueil', href: '/' },
  { libelle: 'Ressources', href: '/conseils/' },
]

const euros = (n: number) => n.toLocaleString('fr-FR')
const lienMetier = (slug: string) => chemin(lienConseil({ categorie: 'metiers', slug }))

export function PastilleMetiers({ sombre }: { sombre?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-medium ${sombre ? 'text-white/70' : 'text-fg-2'}`}>
      <span aria-hidden className="size-2 rounded-full bg-teal" />
      Métiers
    </span>
  )
}

export function CarteMetierPhoto({ m, grande }: { m: CarteMetier; grande?: boolean }) {
  return (
    <Link href={lienMetier(m.slug)} className="group squircle-3xl relative flex h-full min-h-80 flex-col justify-end overflow-hidden bg-neutral-900 p-6 text-white">
      {m.image && (
        <Image src={m.image.url} alt="" fill sizes={grande ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 33vw, 100vw'} className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-[1.03]" />
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="relative">
        <h3 className={`font-semibold tracking-tight ${grande ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>{m.nom}</h3>
        {m.accroche && <p className="mt-1 text-white/75">{m.accroche}</p>}
        {(m.formation || m.salaire !== null) && (
          <div className="mt-5 flex flex-wrap gap-1.5 text-xs">
            {m.formation && (
              <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
                <GraduationCap className="mr-1 inline size-3.5" aria-hidden />
                {m.formation}
              </span>
            )}
            {m.salaire !== null && <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">{euros(m.salaire)} € brut minimum</span>}
          </div>
        )}
      </div>
      <ArrowUpRight className="absolute right-5 top-5 size-5 text-white/80" aria-hidden />
    </Link>
  )
}

/* ---------- Hub ---------- */

export function HubMetiers({ metiers, articles }: { metiers: CarteMetier[]; articles: ConseilResume[] }) {
  const [premier, ...suite] = metiers
  const avecSalaire = metiers.filter((m) => m.salaire !== null)
  const max = Math.max(1, ...avecSalaire.map((m) => m.salaire!))
  return (
    <main>
      <section className="container pb-12 pt-8">
        <FilAriane segments={[...ARIANE, { libelle: 'Métiers' }]} />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight text-fg md:text-7xl">
            Les métiers
            <span className="block text-fg-2">du dentaire.</span>
          </h1>
          <p className="max-w-sm text-lg text-fg-2">Missions, formation et salaire minimum, métier par métier.</p>
        </div>
      </section>

      <section className="container pb-16">
        {premier ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 lg:row-span-2 [&>a]:min-h-[28rem]">
              <CarteMetierPhoto m={premier} grande />
            </div>
            {suite.map((m) => (
              <CarteMetierPhoto key={m.slug} m={m} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-line bg-bg-soft p-4 text-sm text-fg-2">Aucune fiche métier publiée pour le moment.</p>
        )}
      </section>

      {avecSalaire.length > 1 && (
        <section className="border-y border-line bg-bg-soft">
          <div className="container grid gap-10 py-16 md:py-20 lg:grid-cols-2 lg:gap-20">
            <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
              Comparer les salaires minimums
              <span className="block text-fg-2">d’un métier à l’autre.</span>
            </h2>
            <ul className="space-y-4">
              {avecSalaire.map((m) => (
                <li key={m.slug} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 gap-y-2">
                  <span className="truncate text-sm text-fg-2">{m.nom}</span>
                  <span className="font-semibold tabular-nums text-fg">{euros(m.salaire!)} €</span>
                  <span className="col-span-2 h-2.5 rounded-full bg-bg">
                    <span className="block h-full rounded-full bg-teal" style={{ width: `${(m.salaire! / max) * 100}%` }} />
                  </span>
                </li>
              ))}
              <li className="pt-2 text-xs text-fg-2">Minimum conventionnel brut mensuel, cité sur chaque fiche.</li>
            </ul>
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="container py-16 md:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">À lire aussi</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {articles.slice(0, 3).map((a) => (
              <li key={a.slug}>
                <Link href={chemin(lienConseil(a))} className="squircle-2xl block h-full border border-line p-6 hover:bg-bg-soft">
                  <p className="text-lg font-semibold leading-snug text-fg">{a.titre}</p>
                  {a.tempsLecture && <p className="mt-4 text-xs text-fg-2">{a.tempsLecture} min de lecture</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}

/* ---------- Fiche ---------- */

/** Chiffres clés du héros : autant de colonnes que de chiffres, quatre au plus. */
const COLONNES_CHIFFRES: Record<number, string> = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' }

/** Les barres : proportionnelles au haut de la fourchette s'il existe, sinon au minimum ; pas de barre pour un texte. */
function SalairesBarres({ valeurs, source }: { valeurs: CaseSalaireFiche[]; source: string | null }) {
  const reference = (c: CaseSalaireFiche) => (c && 'montant' in c ? (c.haut ?? c.montant) : null)
  const max = Math.max(1, ...valeurs.map(reference).filter((v): v is number => v !== null))
  return (
    <div>
      <ul className="space-y-4">
        {SECTEURS.map((s, i) => {
          const c = valeurs[i] ?? null
          const ref = reference(c)
          return (
            <li key={s} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 gap-y-2">
              <span className="text-sm text-fg-2">{s}</span>
              <span className="text-right">
                {c === null ? (
                  <span className="text-sm text-fg-2">Pas de grille de référence</span>
                ) : (
                  <span className="font-semibold tabular-nums text-fg">{'montant' in c ? (c.haut ? `${euros(c.montant)} € à ${euros(c.haut)} €` : `${euros(c.montant)} €`) : c.texte}</span>
                )}
                {c?.precision && <span className="block text-xs text-fg-2">{c.precision}</span>}
              </span>
              <span className="col-span-2 h-2.5 rounded-full bg-bg-soft">
                {ref !== null && <span className="block h-full rounded-full bg-teal" style={{ width: `${(ref / max) * 100}%` }} />}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-xs text-fg-2">
        Brut mensuel pour un temps plein. Ce sont les minimums fixés par les conventions collectives ou les grilles publiques : un salaire réel peut être plus élevé.
      </p>
      {source && (
        <p className="mt-2 text-xs text-fg-2">
          Source : {source}
          {/[.!?]$/.test(source) ? '' : '.'}
        </p>
      )}
    </div>
  )
}

export function FicheMetierPage({ conseil, fiche, autres }: { conseil: ConseilComplet; fiche: FicheMetier; autres: CarteMetier[] }) {
  const maj = formaterDate(conseil.modifie ?? conseil.date)
  const aSalaires = fiche.salaires.some((v) => v !== null)
  const colonnes = COLONNES_CHIFFRES[fiche.chiffres.length] ?? 'md:grid-cols-4'
  return (
    <main>
      <section className="dark relative -mt-20 overflow-hidden bg-background pt-20 text-fg">
        {conseil.image && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <Image src={conseil.image.url} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        )}
        <div className="container relative z-10 pb-14 pt-10">
          <div className="text-white/70 [&_a]:text-white/70 [&_span]:text-white/70">
            <FilAriane segments={[...ARIANE, { libelle: 'Métiers', href: '/conseils/metiers/' }, { libelle: conseil.titre }]} />
          </div>
          <div className="mt-16 max-w-3xl">
            <PastilleMetiers sombre />
            <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-7xl">{conseil.titre}</h1>
            {conseil.extrait && <p className="mt-6 text-xl text-white/75">{conseil.extrait}</p>}
            <p className="mt-4 text-sm text-white/55">
              {[maj ? `Mis à jour le ${maj}` : null, conseil.tempsLecture ? `${conseil.tempsLecture} min de lecture` : null].filter(Boolean).join(' · ')}
            </p>
          </div>
          {fiche.chiffres.length > 0 && (
            <dl className={`mt-16 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 ${colonnes}`}>
              {fiche.chiffres.map((c) => (
                <div key={c.libelle} className="flex flex-col-reverse">
                  <dt className="mt-1 text-sm text-white/60">{c.libelle}</dt>
                  <dd className="text-3xl font-semibold tabular-nums tracking-tight text-white md:text-4xl">{c.valeur}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {fiche.missions.length > 0 && (
        <section className="container py-20 md:py-24">
          <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">
            Au quotidien
            <span className="block text-fg-2">{fiche.missions.length === 4 ? 'quatre missions.' : 'ses missions.'}</span>
          </h2>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fiche.missions.map((m) => {
              const I = ICONES[m.icone]
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
          {fiche.qualites.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <span className="mr-2 flex items-center gap-1.5 text-sm text-fg-2">
                <Sparkles className="size-4 text-teal" aria-hidden /> Qualités attendues
              </span>
              {fiche.qualites.map((q) => (
                <span key={q} className="rounded-full border border-line px-3 py-1 text-sm text-fg">
                  {q}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {fiche.etapes.length > 0 && (
        <section className="dark bg-background py-20 text-fg md:py-24">
          <div className="container grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Se former</h2>
              {fiche.formation && <p className="mt-4 text-white/70">{fiche.formation}</p>}
              <Link href={chemin('/formation/')} className="mt-8 inline-flex items-center gap-2 font-medium text-white">
                <GraduationCap className="size-4 text-teal" aria-hidden /> Les écoles et formations <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <ol>
              {fiche.etapes.map((e, k) => (
                <li key={e.titre} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-4 border-b border-white/10 py-7 first:pt-0">
                  <p className="text-5xl font-light tabular-nums tracking-tight text-white" aria-hidden>
                    {String(k + 1).padStart(2, '0')}
                  </p>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-white">{e.titre}</h3>
                    <p className="mt-1 text-white/65">{e.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {(aSalaires || fiche.evolutions.length > 0) && (
        <section className="container grid gap-14 py-20 md:py-24 lg:grid-cols-2 lg:gap-20">
          {aSalaires && (
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">Salaire minimum conventionnel par secteur</h2>
              <div className="mt-8">
                <SalairesBarres valeurs={fiche.salaires} source={fiche.sourceSalaires} />
              </div>
            </div>
          )}
          {fiche.evolutions.length > 0 && (
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">Évoluer</h2>
              <ul className="mt-8 space-y-3">
                {fiche.evolutions.map((e) => (
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
          )}
        </section>
      )}

      {fiche.sources.length > 0 && (
        <div className="container pb-16">
          <div className="border-t border-line pt-6 text-xs text-fg-2">
            <p className="font-medium text-fg">Sources</p>
            <ul className="mt-2 space-y-1">
              {fiche.sources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            {maj && <p className="mt-2">Mise à jour le {maj}.</p>}
          </div>
        </div>
      )}

      {autres.length > 0 && (
        <section className="border-t border-line bg-bg-soft">
          <div className="container py-16 md:py-20">
            <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
              Les autres métiers
              <span className="block text-fg-2">du cabinet et du laboratoire.</span>
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {autres.slice(0, 3).map((m) => (
                <CarteMetierPhoto key={m.slug} m={m} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
