/**
 * MAQUETTE. Liste retenue pour `/formation/formations-privees` (13 octobre
 * 2026) : le gabarit des pages Emploi (en-tête sur fond doux, filtres en
 * colonne, sessions en lignes datées), en vue unique sans carte, avec les
 * pastilles de familles de la rubrique Formation.
 */
import { Bell, ChevronDown, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { FilAriane } from '@/components/annuaire/primitives'
import { ARIANE, LigneSession } from './_blocs'
import { FORMATIONS, THEMES } from './_donnees'

const FAMILLES = [
  { titre: 'Écoles de prothèse dentaire', href: '/formation/ecoles-de-prothese/' },
  { titre: 'Facultés d’odontologie', href: '/formation/facultes-odontologie/' },
  { titre: 'Formations privées', href: '/formation/formations-privees/', actif: true },
]

function Exemple() {
  return <p className="mt-2 text-xs text-fg-2">Formations d’exemple : organismes, dates et lieux inventés.</p>
}

function Case({ coche }: { coche?: boolean }) {
  return (
    <span className={`grid size-4 shrink-0 place-items-center rounded border ${coche ? 'border-fg bg-fg' : 'border-line-strong bg-bg'}`}>
      {coche && (
        <svg viewBox="0 0 16 16" className="size-3 text-bg" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M3 8.5l3.5 3.5L13 5" />
        </svg>
      )}
    </span>
  )
}

function Groupe({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line py-5 first:pt-0">
      <legend className="text-sm font-semibold text-fg">{titre}</legend>
      <div className="mt-3">{children}</div>
    </fieldset>
  )
}

function Cases({ items, coches = [] }: { items: string[]; coches?: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((t) => (
        <li key={t} className="flex items-center gap-2.5 text-fg">
          <Case coche={coches.includes(t)} /> {t}
        </li>
      ))}
    </ul>
  )
}

function Filtres() {
  return (
    <form className="text-sm">
      <Groupe titre="Thème">
        <div className="flex flex-wrap gap-1.5">
          {THEMES.map((t, i) => (
            <span key={t} className={`rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ${i === 0 ? 'bg-teal/10 text-teal ring-teal/30' : 'text-fg ring-line'}`}>
              {t}
            </span>
          ))}
        </div>
      </Groupe>
      <Groupe titre="Public">
        <Cases items={['Chirurgiens-dentistes', 'Assistant(e)s', 'Prothésistes']} coches={['Chirurgiens-dentistes']} />
      </Groupe>
      <Groupe titre="Format">
        <div className="grid grid-cols-4 rounded-full bg-bg-soft p-1 text-center text-xs">
          {['Tous', 'Sur place', 'En ligne', 'Mixte'].map((t, i) => (
            <span key={t} className={`rounded-full py-1.5 ${i === 0 ? 'bg-bg font-medium text-fg shadow-sm' : 'text-fg-2'}`}>
              {t}
            </span>
          ))}
        </div>
      </Groupe>
      <Groupe titre="Région">
        <div className="flex h-10 items-center justify-between rounded-lg border border-line px-3">
          <span className="text-fg">Toute la France</span>
          <ChevronDown className="size-4 text-fg-2" aria-hidden />
        </div>
      </Groupe>
      <Groupe titre="Durée">
        <Cases items={['Une journée ou moins', 'Deux à trois jours', 'Plus de trois jours']} />
      </Groupe>
      <Groupe titre="Prise en charge déclarée">
        <Cases items={['DPC', 'FIF PL', 'Qualiopi']} />
        <p className="mt-2 text-xs text-fg-2">Déclarée par l’organisme, sauf mention « vérifié » avec sa source.</p>
      </Groupe>
      <button type="button" className="mt-5 text-sm font-medium text-fg underline underline-offset-4">
        Effacer les filtres
      </button>
    </form>
  )
}

export function Liste() {
  return (
    <main>
      <section className="border-b border-line bg-bg-soft">
        <div className="container py-8 md:py-12">
          <FilAriane segments={ARIANE.map((s, i) => (i < ARIANE.length - 1 ? s : { libelle: s.libelle }))} />
          <div className="mt-4">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">Formations privées</h1>
              <p className="mt-2 text-fg-2">Les prochaines sessions de formation continue, sur place ou en ligne.</p>
              <Exemple />
            </div>
            <nav aria-label="Familles de formation" className="mt-6 flex flex-wrap items-center gap-2">
              <Link href={chemin('/formation/')} className="rounded-full border border-line bg-bg px-4 py-2 text-sm font-medium text-fg hover:bg-bg-soft">
                Toutes
              </Link>
              {FAMILLES.map((f) => (
                <a
                  key={f.href}
                  href={f.href}
                  aria-current={f.actif ? 'page' : undefined}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${f.actif ? 'border-fg bg-fg text-bg' : 'border-line bg-bg text-fg hover:bg-bg-soft'}`}
                >
                  {f.titre}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </section>
      <div className="container grid gap-10 py-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12 lg:py-10">
        <aside className="hidden lg:block">
          <Filtres />
        </aside>
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap gap-2 lg:hidden">
            <button type="button" className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-bg px-3.5 text-sm font-medium text-fg">
              <SlidersHorizontal className="size-4" aria-hidden /> Filtres <span className="grid size-5 place-items-center rounded-full bg-fg text-[11px] text-bg">2</span>
            </button>
            <span className="inline-flex h-9 items-center rounded-full border border-fg bg-fg px-3.5 text-sm text-bg">Implantologie</span>
            <span className="inline-flex h-9 items-center rounded-full border border-fg bg-fg px-3.5 text-sm text-bg">Chirurgiens-dentistes</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line pb-4">
            <p className="text-sm font-semibold text-fg">{FORMATIONS.length} sessions</p>
            <p className="text-sm text-fg-2">
              <span className="font-medium text-fg">Les plus proches dans le temps</span> d’abord
            </p>
          </div>
          <ul className="mt-5 space-y-3">
            {FORMATIONS.map((f, i) => (
              <LigneSession key={f.slug} f={f} actif={i === 0} />
            ))}
          </ul>
          <div className="squircle-2xl mt-6 flex flex-col gap-4 bg-bg-soft p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-3 text-sm text-fg">
              <Bell className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
              <span>Soyez prévenu(e) des nouvelles sessions en implantologie, par email et sans compte.</span>
            </p>
            <a className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-foreground">Créer l’alerte</a>
          </div>
        </div>
      </div>
    </main>
  )
}
