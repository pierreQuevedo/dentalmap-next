/**
 * MAQUETTE. `/emploi/alternance` : alternance et stages. Offres, rythme école
 * et entreprise, liens vers les pages des écoles, salaire moyen d'un alternant
 * issu d'études.
 */
import { ArrowRight, GraduationCap, MapPin } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { AlerteEmail, CarteOffre, LienFleche, Photo, TitreDeuxTons, euros } from './_blocs'
import { ALTERNANCES, ECOLES, PARCOURS, SALAIRES_ALTERNANCE } from './_donnees'

/** Une semaine type : une case par jour ou par semaine, école en teal, entreprise en ardoise. */
const RYTHMES: { libelle: string; cases: ('ecole' | 'entreprise')[]; unite: string; lieu: string }[] = [
  { libelle: 'Institut de formation des assistants dentaires de l’Estuaire', cases: ['ecole', 'entreprise', 'entreprise', 'entreprise', 'entreprise'], unite: 'Une case par jour de la semaine.', lieu: 'Cabinet' },
  { libelle: 'École de prothèse dentaire de Bordeaux', cases: ['ecole', 'ecole', 'entreprise', 'entreprise'], unite: 'Une case par semaine du mois.', lieu: 'Labo' },
]

function Rythme({ cases, lieu }: { cases: ('ecole' | 'entreprise')[]; lieu: string }) {
  return (
    <div className="flex gap-1.5">
      {cases.map((c, i) => (
        <span
          key={i}
          className={`grid h-9 flex-1 place-items-center rounded-lg text-[11px] font-medium ${c === 'ecole' ? 'bg-teal/15 text-teal' : 'bg-ardoise text-white'}`}
        >
          {c === 'ecole' ? 'École' : lieu}
        </span>
      ))}
    </div>
  )
}

export function Alternance() {
  return (
    <main>
      <section className="container pb-12 pt-8">
        <FilAriane segments={[{ libelle: 'Emploi', href: '/emploi/' }, { libelle: 'Alternance et stages' }]} />
        <div className="mt-8">
          <TitreDeuxTons as="h1" sous="dans les cabinets et les laboratoires.">
            Alternance et stages
          </TitreDeuxTons>
        </div>
        <p className="mt-5 max-w-2xl text-lg text-fg-2">
          Des contrats d’alternance et des stages publiés par des recruteurs vérifiés, reliés aux écoles qui forment aux métiers du dentaire. Le rythme de l’école et la
          rémunération sont affichés sur chaque offre.
        </p>
        <div role="tablist" className="mt-8 inline-flex rounded-full border border-line p-1">
          {PARCOURS.slice(0, 2).map((p, i) => (
            <a key={p.slug} role="tab" aria-selected={i === 0} className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold ${i === 0 ? 'bg-fg text-bg' : 'text-fg'}`}>
              {p.nom} <span className={i === 0 ? 'text-bg/70' : 'text-fg-2'}>{euros(p.n)}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="container pb-16">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
          <h2 className="text-2xl font-semibold tracking-tight text-fg">Offres près de Bordeaux</h2>
          <p className="inline-flex items-center gap-1.5 text-sm text-fg-2">
            <MapPin className="size-4 text-geo" aria-hidden /> Les plus proches d’abord · <a className="font-medium text-fg underline underline-offset-4">Changer de ville</a>
          </p>
        </div>
        <ul className="mt-5 grid gap-3 lg:grid-cols-2">
          {ALTERNANCES.map((o) => (
            <CarteOffre key={o.id} o={o} forme="ligne" />
          ))}
        </ul>
        <a className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-fg">
          Toutes les offres d’alternance en Gironde <ArrowRight className="size-4" aria-hidden />
        </a>
      </section>

      <section className="border-y border-line bg-bg-soft">
        <div className="container py-16 md:py-20">
          <TitreDeuxTons sous="et ce qu’en disent les écoles.">Le rythme école et entreprise</TitreDeuxTons>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {RYTHMES.map((r) => {
              const e = ECOLES.find((x) => x.nom === r.libelle)!
              return (
                <div key={r.libelle} className="squircle-2xl border border-line bg-bg p-5 md:p-6">
                  <p className="font-semibold text-fg">{e.nom}</p>
                  <p className="text-sm text-fg-2">{e.detail}</p>
                  <div className="mt-5">
                    <Rythme cases={r.cases} lieu={r.lieu} />
                  </div>
                  <p className="mt-3 text-sm text-fg">{e.rythme}</p>
                  <p className="text-xs text-fg-2">{r.unite}</p>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-sm text-fg-2">Le rythme exact dépend de l’école et de l’année de formation. Il figure sur chaque offre d’alternance.</p>
        </div>
      </section>

      <section className="container py-16 md:py-20">
        <TitreDeuxTons sous="et leurs pages sur DentalMap.">Les écoles</TitreDeuxTons>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {ECOLES.map((e) => (
            <li key={e.nom} className="squircle-2xl group relative flex flex-col overflow-hidden border border-line bg-bg-soft">
              {e.photo ? (
                <Photo src={e.photo} className="aspect-[16/9]" />
              ) : (
                <div className="grid aspect-[16/9] place-items-center bg-[color-mix(in_oklch,var(--color-teal)_7%,var(--bg-soft))]" aria-hidden>
                  <GraduationCap className="size-10 text-teal/70" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs text-fg-2">{e.commune}</p>
                <h3 className="mt-1 font-semibold leading-snug text-fg">
                  <a className="after:absolute after:inset-0">{e.nom}</a>
                </h3>
                <p className="mt-1 text-sm text-fg-2">{e.detail}</p>
                <p className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-fg">
                  Voir la page de l’école <ArrowRight className="size-4" aria-hidden />
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line">
        <div className="container grid gap-14 py-16 md:py-20 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Salaire moyen d’un alternant</h2>
            <p className="mt-2 text-fg-2">Il dépend de l’âge et de l’année de contrat. Chaque offre affiche sa fourchette brute mensuelle.</p>
            <dl className="mt-8 grid grid-cols-3 gap-3">
              {SALAIRES_ALTERNANCE.map((s) => (
                <div key={s.annee} className="squircle-2xl border border-line p-4">
                  <dt className="text-xs text-fg-2 sm:text-sm">{s.annee}</dt>
                  <dd className="mt-2 whitespace-nowrap text-xl font-semibold tabular-nums tracking-tight text-fg sm:text-3xl">{euros(s.moyenne)} €</dd>
                  <dd className="text-xs text-fg-2">brut par mois</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-fg-2">Moyennes issues d’études salariales, et non calculées sur les offres. Source : étude salariale à citer, année.</p>
            <p className="mt-6 text-sm text-fg-2">
              Stages : au-delà de deux mois, le stage donne droit à une gratification légale, indiquée sur l’offre. <LienFleche petit>En savoir plus</LienFleche>
            </p>
          </div>
          <AlerteEmail titre="Les nouvelles offres d’alternance par email" detail="Alternance et stages autour de Bordeaux. Un email par semaine au plus, et un lien de désinscription dans chaque envoi." />
        </div>
      </section>
    </main>
  )
}
