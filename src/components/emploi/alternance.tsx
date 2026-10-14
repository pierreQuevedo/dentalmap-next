/**
 * `/emploi/alternance/` : alternance et stages. Les offres les plus récentes,
 * deux onglets (`?contrat=stage` pour les stages), des exemples de rythme
 * école et entreprise, les écoles de la rubrique Formation et la
 * rémunération minimale d'un alternant, en pourcentage du SMIC (Code du travail).
 */
import Link from 'next/link'
import { ArrowRight, GraduationCap } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { chemin } from '@/lib/navigation'
import { ALTERNANCE, EMPLOI } from '@/lib/emploi/chemins'
import { euros } from '@/lib/emploi/format'
import { getComptes, getOffresRecentes } from '@/lib/emploi/queries'
import { APPRENTISSAGE, PROFESSIONNALISATION, SMIC, SOURCES_ALTERNANCE } from '@/lib/emploi/salaires'
import { AucuneOffre } from './accueil'
import { AlerteEmail } from './alerte-email'
import { CarteOffre, TitreDeuxTons } from './blocs'

/** Deux rythmes courants, à titre d'exemple : une case par jour ou par semaine, école en teal, entreprise en ardoise. */
const RYTHMES: { titre: string; detail: string; cases: ('ecole' | 'entreprise')[]; unite: string; lieu: string }[] = [
  { titre: 'Une journée par semaine à l’école', detail: 'Rythme fréquent pour les métiers du cabinet.', cases: ['ecole', 'entreprise', 'entreprise', 'entreprise', 'entreprise'], unite: 'Une case par jour de la semaine.', lieu: 'Cabinet' },
  { titre: 'Deux semaines sur quatre à l’école', detail: 'Rythme fréquent pour la prothèse dentaire.', cases: ['ecole', 'ecole', 'entreprise', 'entreprise'], unite: 'Une case par semaine du mois.', lieu: 'Labo' },
]

const ECOLES = [
  { nom: 'Écoles de prothèse dentaire', detail: 'BTMS et BTS prothésiste dentaire, souvent en alternance', href: '/formation/ecoles-de-prothese/' },
  { nom: 'Facultés d’odontologie', detail: 'Stages cliniques et remplacements des étudiants en fin de cursus', href: '/formation/facultes-odontologie/' },
  { nom: 'Toutes les formations', detail: 'Écoles, facultés et formations continues', href: '/formation/' },
]

function Rythme({ cases, lieu }: { cases: ('ecole' | 'entreprise')[]; lieu: string }) {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {cases.map((c, i) => (
        <span key={i} className={`grid h-9 flex-1 place-items-center rounded-lg text-[11px] font-medium ${c === 'ecole' ? 'bg-teal/15 text-teal' : 'bg-ardoise text-white'}`}>
          {c === 'ecole' ? 'École' : lieu}
        </span>
      ))}
    </div>
  )
}

export async function PageAlternance({ stages }: { stages: boolean }) {
  const contrat = stages ? 'stage' : 'alternance'
  const [comptes, offres] = await Promise.all([getComptes(), getOffresRecentes({ contrats: [contrat], limite: 12 })])
  const onglets = [
    { cle: 'alternance', nom: 'Alternance', n: comptes.parContrat.alternance ?? 0, href: ALTERNANCE },
    { cle: 'stage', nom: 'Stages', n: comptes.parContrat.stage ?? 0, href: `${ALTERNANCE}?contrat=stage` },
  ]
  return (
    <main>
      <section className="container pb-12 pt-8">
        <FilAriane segments={[{ libelle: 'Emploi', href: EMPLOI }, { libelle: 'Alternance et stages' }]} />
        <div className="mt-8">
          <TitreDeuxTons as="h1" sous="dans les cabinets et les laboratoires.">
            Alternance et stages
          </TitreDeuxTons>
        </div>
        <p className="mt-5 max-w-2xl text-lg text-fg-2">
          Des contrats d’alternance et des stages publiés par des recruteurs vérifiés auprès des registres officiels. La rémunération est affichée sur chaque offre.
        </p>
        <nav aria-label="Type de contrat" className="mt-8 inline-flex rounded-full border border-line p-1">
          {onglets.map((o) => {
            const actif = o.cle === contrat
            return (
              <Link
                key={o.cle}
                href={chemin(o.href)}
                aria-current={actif ? 'page' : undefined}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold ${actif ? 'bg-fg text-bg' : 'text-fg'}`}
              >
                {o.nom} <span className={actif ? 'text-bg/70' : 'text-fg-2'}>{euros(o.n)}</span>
              </Link>
            )
          })}
        </nav>
      </section>

      <section className="container pb-16">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
          <h2 className="text-2xl font-semibold tracking-tight text-fg">{stages ? 'Stages récents' : 'Offres d’alternance récentes'}</h2>
          {offres.length > 0 && <p className="text-sm text-fg-2">Les dernières publiées, partout en France.</p>}
        </div>
        <div className="mt-5">
          {offres.length > 0 ? (
            <ul className="grid gap-3 lg:grid-cols-2">
              {offres.map((o) => (
                <CarteOffre key={o.id} o={o} forme="ligne" />
              ))}
            </ul>
          ) : (
            <AucuneOffre
              texte={stages ? 'Aucun stage n’est en ligne pour le moment. Recevez les prochains par email dès leur publication.' : 'Aucune offre d’alternance n’est en ligne pour le moment. Recevez les prochaines par email dès leur publication.'}
              criteres={{ metiers: [], contrats: [contrat] }}
            />
          )}
        </div>
      </section>

      <section className="border-y border-line bg-bg-soft">
        <div className="container py-16 md:py-20">
          <TitreDeuxTons sous="deux exemples courants.">Le rythme école et entreprise</TitreDeuxTons>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {RYTHMES.map((r) => (
              <div key={r.titre} className="squircle-2xl border border-line bg-bg p-5 md:p-6">
                <p className="font-semibold text-fg">{r.titre}</p>
                <p className="text-sm text-fg-2">{r.detail}</p>
                <div className="mt-5">
                  <Rythme cases={r.cases} lieu={r.lieu} />
                </div>
                <p className="mt-3 text-xs text-fg-2">{r.unite}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-fg-2">Le rythme exact dépend de l’école et de l’année de formation. Demandez-le au recruteur ou à l’école avant de signer.</p>
        </div>
      </section>

      <section className="container py-16 md:py-20">
        <TitreDeuxTons sous="dans la rubrique Formation.">Les écoles</TitreDeuxTons>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {ECOLES.map((e) => (
            <li key={e.href} className="squircle-2xl group relative flex flex-col overflow-hidden border border-line bg-bg-soft">
              <div className="grid aspect-[16/9] place-items-center bg-[color-mix(in_oklch,var(--color-teal)_7%,var(--bg-soft))]" aria-hidden>
                <GraduationCap className="size-10 text-teal/70" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-semibold leading-snug text-fg">
                  <Link href={chemin(e.href)} className="after:absolute after:inset-0">
                    {e.nom}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-fg-2">{e.detail}</p>
                <p className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-fg">
                  Voir la page <ArrowRight className="size-4" aria-hidden />
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line">
        <div className="container grid gap-14 py-16 md:py-20 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Rémunération minimale d’un alternant</h2>
            <p className="mt-2 text-fg-2">
              Un pourcentage du SMIC fixé par le Code du travail, selon l’âge et l’année de contrat. Chaque offre affiche sa rémunération brute mensuelle.
            </p>

            <h3 className="mt-8 font-semibold text-fg">Contrat d’apprentissage</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-line">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Pourcentage du SMIC selon l’âge et l’année de contrat</caption>
                <thead className="bg-bg-soft text-xs text-fg-2">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 font-medium sm:px-4">Âge</th>
                    {['1re année', '2e année', '3e année'].map((a) => (
                      <th key={a} scope="col" className="px-2 py-2.5 text-right font-medium sm:px-4">
                        {a}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {APPRENTISSAGE.map((l) => (
                    <tr key={l.age}>
                      <th scope="row" className="px-3 py-2.5 font-normal text-fg-2 sm:px-4">
                        {l.age}
                      </th>
                      {l.taux.map((t, k) => (
                        <td key={k} className="whitespace-nowrap px-2 py-2.5 text-right font-semibold tabular-nums text-fg sm:px-4">
                          {t}&nbsp;%
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-fg-2">À partir de 21 ans, le salaire minimum conventionnel de l’emploi s’applique s’il est plus élevé.</p>

            <h3 className="mt-8 font-semibold text-fg">Contrat de professionnalisation</h3>
            <dl className="mt-3 divide-y divide-line rounded-2xl border border-line text-sm">
              {PROFESSIONNALISATION.map((l) => (
                <div key={l.age} className="flex items-baseline justify-between gap-4 px-3 py-2.5 sm:px-4">
                  <dt className="text-fg-2">{l.age}</dt>
                  <dd className="text-right">
                    <span className="font-semibold tabular-nums text-fg">{l.taux}&nbsp;% du SMIC</span>
                    <span className="block text-xs text-fg-2">{l.avecBac}&nbsp;% avec un bac pro ou plus</span>
                  </dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 px-3 py-2.5 sm:px-4">
                <dt className="text-fg-2">26 ans et plus</dt>
                <dd className="text-right font-semibold text-fg">85&nbsp;% du minimum de la branche</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-fg-2">
              Assistant(e) dentaire en cabinet : l’accord de branche fixe 90&nbsp;% du SMIC avant 26 ans et 100&nbsp;% à partir de 26 ans.
            </p>

            <p className="mt-6 text-sm text-fg-2">
              SMIC au {SMIC.date} : {SMIC.mensuel.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € brut par mois pour 35 heures par semaine.
            </p>
            <div className="mt-3 text-xs text-fg-2">
              <p>Sources :</p>
              <ul className="mt-1 space-y-1">
                {SOURCES_ALTERNANCE.map((src) => (
                  <li key={src.url}>
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-fg">
                      {src.libelle}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-6 text-sm text-fg-2">
              Stages : au-delà de deux mois, le stage donne droit à une gratification légale, indiquée sur l’offre.
            </p>
          </div>
          <AlerteEmail
            criteres={{ metiers: [], contrats: ['alternance', 'stage'] }}
            titre="Les nouvelles offres d’alternance par email"
            detail="Alternance et stages, partout en France. Un email par semaine au plus, et un lien de désinscription dans chaque envoi."
          />
        </div>
      </section>
    </main>
  )
}
