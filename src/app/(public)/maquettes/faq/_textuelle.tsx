/**
 * MAQUETTE, version textuelle de la FAQ : sobre et rapide. Héros court avec
 * recherche, sommaire des catégories (collant à gauche sur grand écran,
 * pastilles défilantes sur mobile), toutes les questions en accordéon, la
 * première de chaque catégorie ouverte, bloc contact discret.
 */
import { Balisage } from '@/lib/seo/jsonld'
import { CATEGORIES, FAQ_JSONLD, TOTAL } from './_donnees'
import { LienFleche, Questions, Recherche } from './_blocs'

function Sommaire() {
  return (
    <nav aria-label="Catégories" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
      <p className="hidden text-xs font-semibold uppercase tracking-wide text-fg-2 lg:block">Catégories</p>
      {/* Mobile : une rangée de pastilles qui défile, du bord au bord de l'écran. */}
      <ol className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:mx-0 lg:mt-4 lg:block lg:space-y-1 lg:overflow-visible lg:border-l lg:border-line lg:px-0 lg:pb-0">
        {CATEGORIES.map((c, i) => (
          <li key={c.slug} className="shrink-0">
            <a
              href={`#${c.slug}`}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm lg:-ml-px lg:flex lg:justify-between lg:rounded-none lg:border-0 lg:border-l-2 lg:py-2 lg:pl-4 lg:pr-0 ${
                i === 0 ? 'border-fg bg-fg text-bg lg:border-teal lg:bg-transparent lg:font-semibold lg:text-fg' : 'border-line text-fg hover:border-line-strong lg:border-transparent'
              }`}
            >
              {c.titre}
              <span className={`tabular-nums ${i === 0 ? 'text-bg/70 lg:text-fg-2' : 'text-fg-2'}`}>{c.questions.length}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function FaqTextuelle() {
  return (
    <main>
      <Balisage donnees={FAQ_JSONLD} />
      <section className="border-b border-line">
        <div className="container pb-12 pt-12 md:pb-16 md:pt-20">
          <h1 className="text-4xl font-semibold tracking-tight text-fg md:text-6xl">Questions fréquentes</h1>
          <p className="mt-4 max-w-xl text-lg text-fg-2">{TOTAL} réponses courtes sur les fiches, leur vérification, l’emploi et vos données.</p>
          <div className="mt-8 max-w-xl">
            <Recherche />
          </div>
        </div>
      </section>

      <div className="container grid grid-cols-1 gap-10 py-10 md:py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20 lg:py-20">
        <Sommaire />
        <div className="min-w-0 max-w-3xl space-y-16 md:space-y-20">
          {CATEGORIES.map((c) => (
            <section key={c.slug} id={c.slug} className="scroll-mt-28">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-fg pb-3">
                <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">{c.titre}</h2>
                <p className="text-sm text-fg-2">{c.pour}</p>
              </div>
              <Questions categorie={c} />
            </section>
          ))}

          <aside className="border-t border-line pt-8">
            <p className="font-semibold text-fg">{'Vous n’avez pas trouvé votre réponse\u00a0?'}</p>
            <p className="mt-1 text-fg-2">Écrivez-nous, une personne vous répond.</p>
            <p className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              <LienFleche href="/contact/" petit>
                Nous écrire
              </LienFleche>
              <LienFleche href="/contact/?objet=erreur-fiche" petit>
                Signaler une erreur sur une fiche
              </LienFleche>
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}
