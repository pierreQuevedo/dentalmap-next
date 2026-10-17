/**
 * MAQUETTE. Gabarit unique des pages légales, dans la lignée de la FAQ
 * textuelle : héros court, encadré « En bref », sommaire collant à gauche
 * (pastilles défilantes sur mobile), articles numérotés, liens croisés et
 * contact discret. Les champs entre crochets sont surlignés pour Figma.
 */
import { ArrowUpRight, FileWarning } from 'lucide-react'
import Link from 'next/link'
import { chemin } from '@/lib/navigation'
import { PAGES, type Bloc, type PageLegale } from './_contenu'

/** Surligne « [À compléter : …] », « [À valider …] » et « [À confirmer …] ». */
function Texte({ children }: { children: string }) {
  const morceaux = children.split(/(\[À (?:compléter|valider|confirmer)[^\]]*\])/g)
  return (
    <>
      {morceaux.map((m, i) =>
        /^\[À /.test(m) ? (
          <mark key={i} className="rounded bg-amber-200/70 px-1 py-px text-[0.92em] font-medium text-amber-950 [box-decoration-break:clone] dark:bg-amber-300/30 dark:text-amber-100">
            {m}
          </mark>
        ) : (
          m
        ),
      )}
    </>
  )
}

function Bloc({ bloc }: { bloc: Bloc }) {
  if (typeof bloc === 'string') return <p className="leading-relaxed text-fg-2">{<Texte>{bloc}</Texte>}</p>
  if ('liste' in bloc)
    return (
      <ul className="space-y-2.5">
        {bloc.liste.map((l) => (
          <li key={l} className="flex gap-3 leading-relaxed text-fg-2">
            <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
            <span>
              <Texte>{l}</Texte>
            </span>
          </li>
        ))}
      </ul>
    )
  const { entetes, lignes } = bloc.tableau
  const avecEntetes = entetes.some(Boolean)
  return (
    <div className="squircle-xl overflow-hidden border border-line">
      {avecEntetes && (
        <div
          className="hidden gap-6 bg-bg-soft px-5 py-3 text-xs font-semibold uppercase tracking-wide text-fg-2 md:grid"
          style={{ gridTemplateColumns: `repeat(${entetes.length}, minmax(0, 1fr))` }}
        >
          {entetes.map((e) => (
            <span key={e}>{e}</span>
          ))}
        </div>
      )}
      <dl className="divide-y divide-line">
        {lignes.map((l) => (
          <div key={l[0]} className="grid gap-1 px-5 py-3.5 text-sm md:grid-cols-[var(--cols)] md:gap-6 md:text-[15px]" style={{ '--cols': `repeat(${l.length}, minmax(0, 1fr))` } as React.CSSProperties}>
            <dt className="font-medium text-fg">{l[0]}</dt>
            {l.slice(1).map((c, i) => (
              <dd key={i} className="text-fg-2">
                {entetes.length > 2 && <span className="mr-1 font-medium text-fg md:hidden">{entetes[i + 1]} :</span>}
                <Texte>{c}</Texte>
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </div>
  )
}

function Sommaire({ page }: { page: PageLegale }) {
  return (
    <nav aria-label="Sommaire" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
      <p className="hidden text-xs font-semibold uppercase tracking-wide text-fg-2 lg:block">Sommaire</p>
      <ol className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:mx-0 lg:mt-4 lg:block lg:space-y-0.5 lg:overflow-visible lg:border-l lg:border-line lg:px-0 lg:pb-0">
        {page.articles.map((a, i) => (
          <li key={a.id} className="shrink-0">
            <a
              href={`#${a.id}`}
              className={`inline-flex items-baseline gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm lg:-ml-px lg:flex lg:whitespace-normal lg:rounded-none lg:border-0 lg:border-l-2 lg:py-1.5 lg:pl-4 lg:pr-0 ${
                i === 0 ? 'border-fg bg-fg text-bg lg:border-teal lg:bg-transparent lg:font-semibold lg:text-fg' : 'border-line text-fg hover:border-line-strong lg:border-transparent'
              }`}
            >
              <span className={`tabular-nums ${i === 0 ? 'text-bg/70 lg:text-fg-2' : 'text-fg-2'}`}>{String(i + 1).padStart(2, '0')}</span>
              {a.titre}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function PageLegaleVue({ page }: { page: PageLegale }) {
  const autres = PAGES.filter((p) => p.slug !== page.slug)
  return (
    <main>
      {/* Bandeau de maquette, pas un élément d'interface. */}
      <div className="bg-amber-100 text-amber-950">
        <p className="container flex items-center gap-2 py-2.5 text-sm font-medium">
          <FileWarning className="size-4 shrink-0" aria-hidden /> Brouillon à faire relire par un juriste
        </p>
      </div>

      <section className="border-b border-line">
        <div className="container pb-12 pt-12 md:pb-16 md:pt-20">
          <h1 className="text-4xl font-semibold tracking-tight text-fg md:text-6xl">{page.titre}</h1>
          <p className="mt-4 max-w-xl text-lg text-fg-2">{page.chapo}</p>
          <p className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-sm text-fg-2">
            <span>Mise à jour le {page.majLe}</span>
            <span aria-hidden>·</span>
            <span>{page.version}</span>
          </p>
        </div>
      </section>

      <div className="container grid grid-cols-1 gap-10 py-10 md:py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20 lg:py-20">
        <Sommaire page={page} />
        <div className="min-w-0 max-w-3xl">
          <aside className="squircle-2xl border border-line bg-bg-soft p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">En bref</p>
            <ul className="mt-4 space-y-3">
              {page.enBref.map((b) => (
                <li key={b} className="flex gap-3 text-[17px] leading-relaxed text-fg">
                  <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
                  <span>
                    <Texte>{b}</Texte>
                  </span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="mt-14 space-y-14 md:mt-16 md:space-y-16">
            {page.articles.map((a, i) => (
              <section key={a.id} id={a.id} className="scroll-mt-28">
                <div className="flex flex-col gap-1 border-b-2 border-fg pb-3 sm:flex-row sm:items-baseline sm:gap-4">
                  <span className="shrink-0 text-sm tabular-nums text-fg-2">Article {i + 1}</span>
                  <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">{a.titre}</h2>
                </div>
                <div className="mt-6 space-y-5 text-base md:text-[17px]">
                  {a.blocs.map((b, k) => (
                    <Bloc key={k} bloc={b} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <footer className="mt-20 space-y-8 border-t border-line pt-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-fg-2">Voir aussi</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {autres.map((p) => (
                  <li key={p.slug}>
                    <a href={`/${p.slug}/`} className="squircle-xl group flex items-center justify-between gap-3 border border-line p-4 hover:bg-bg-soft">
                      <span>
                        <span className="block font-semibold text-fg">{p.titre}</span>
                        <span className="block text-sm text-fg-2">{p.chapo}</span>
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 text-fg-2" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-fg-2">
              Une question sur cette page ?{' '}
              <Link href={chemin('/contact/')} className="font-medium text-fg underline decoration-line underline-offset-4 hover:text-teal">
                Écrivez-nous
              </Link>
              .
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}
