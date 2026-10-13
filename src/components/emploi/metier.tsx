/**
 * Page métier nationale : `/emploi/assistant-dentaire/`.
 * Titre et compteur, salaire moyen par secteur (études), offres récentes,
 * départements qui recrutent le plus, alternance ou remplacements selon le
 * métier, alerte et lien vers la fiche métier des Ressources.
 */
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, BookOpen, GraduationCap, Repeat2 } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { chemin } from '@/lib/navigation'
import { ALTERNANCE, EMPLOI, REMPLACEMENTS, cheminDepartement, cheminFicheMetier } from '@/lib/emploi/chemins'
import { euros } from '@/lib/emploi/format'
import type { Metier } from '@/lib/emploi/metiers'
import { getComptes, getDepartementsQuiRecrutent, getOffresRecentes } from '@/lib/emploi/queries'
import { SALAIRES, SECTEURS } from '@/lib/emploi/salaires'
import { AucuneOffre, ListeEditoriale } from './accueil'
import { AlerteEmail } from './alerte-email'
import { LienFleche, Recherche, SourceSalaires, TitreDeuxTons, nombreOffres } from './blocs'

export async function PageMetier({ metier: m }: { metier: Metier }) {
  const [comptes, recentes, departements] = await Promise.all([
    getComptes(),
    getOffresRecentes({ metier: m.code, limite: 8 }),
    getDepartementsQuiRecrutent({ metier: m.code }, 8),
  ])
  const total = comptes.parMetier[m.code] ?? 0
  const salaires = SALAIRES[m.code]
  const max = departements[0]?.total ?? 1
  const dentiste = m.code === 'chirurgien_dentiste'

  return (
    <main>
      <section className="container pb-14 pt-8 md:pb-16">
        <FilAriane segments={[{ libelle: 'Emploi', href: EMPLOI }, { libelle: m.nom }]} />
        <div className="mt-8">
          <TitreDeuxTons as="h1" sous={total > 0 ? `${nombreOffres(total)} en France.` : 'Aucune offre en ligne pour le moment.'}>
            {m.nom}
          </TitreDeuxTons>
        </div>
        <p className="mt-5 max-w-2xl text-lg text-fg-2">
          {m.detail}. Chaque offre est publiée par un recruteur vérifié auprès des registres officiels et affiche sa rémunération.
        </p>
        <div className="mt-10">
          <Recherche metier={m.slug} grande />
        </div>
      </section>

      {salaires && (
        <section className="border-y border-line bg-bg-soft">
          <div className="container py-16 md:py-20">
            <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Salaire moyen par secteur</h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SECTEURS.map((s, i) => {
                const v = salaires.valeurs[i]
                return (
                  <li key={s} className="squircle-2xl border border-line bg-bg p-5">
                    <p className="text-sm text-fg-2">{s}</p>
                    {v == null ? (
                      <p className="mt-3 text-lg text-fg-2">Peu de postes</p>
                    ) : (
                      <p className="mt-3">
                        <span className="text-4xl font-semibold tabular-nums tracking-tight text-fg">{euros(v)} €</span>
                        <span className="block text-sm text-fg-2">brut par mois</span>
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
            <SourceSalaires className="mt-4" />
          </div>
        </section>
      )}

      <section className="container py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <TitreDeuxTons sous="partout en France.">Offres récentes</TitreDeuxTons>
          {recentes.length > 0 && <p className="text-sm text-fg-2">Les dernières publiées. Indiquez une ville pour les voir par distance.</p>}
        </div>
        <div className="mt-10">
          {recentes.length > 0 ? (
            <ListeEditoriale offres={recentes} />
          ) : (
            <AucuneOffre
              texte={`Aucune offre ${m.de} n’est en ligne pour le moment. Recevez les prochaines par email dès leur publication.`}
              criteres={{ metiers: [m.code], contrats: [] }}
            />
          )}
        </div>
      </section>

      <section className="border-t border-line">
        <div className={`container grid gap-14 py-16 md:py-20 lg:gap-20 ${departements.length ? 'lg:grid-cols-2' : ''}`}>
          {departements.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Les départements qui recrutent le plus</h2>
              <ol className="mt-8 space-y-3">
                {departements.map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={chemin(cheminDepartement(m.slug, d.slug))}
                      className="grid grid-cols-[9rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm sm:grid-cols-[11rem_minmax(0,1fr)_3rem]"
                    >
                      <span className="truncate text-fg underline-offset-4 hover:underline">{d.nom}</span>
                      <span className="h-2 rounded-full bg-bg-soft">
                        <span className="block h-full rounded-full bg-teal" style={{ width: `${(d.total / max) * 100}%` }} />
                      </span>
                      <span className="text-right tabular-nums text-fg-2">{d.total}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {dentiste ? (
            <div className="squircle-3xl border border-white/10 bg-ardoise p-6 text-white md:p-8">
              <p className="flex items-center gap-2 font-semibold">
                <Repeat2 className="size-5 text-teal" aria-hidden /> Remplacements et collaborations
              </p>
              <p className="mt-2 text-white/75">Les remplacements et les collaborations libérales affichent leur taux de rétrocession ou de redevance, avec les conditions d’exercice à connaître.</p>
              <div className="mt-5">
                <LienFleche href={REMPLACEMENTS} petit sombre>
                  Remplacements et collaborations
                </LienFleche>
              </div>
            </div>
          ) : (
            <div className="squircle-3xl border border-teal/25 bg-teal/[0.06] p-6 md:p-8">
              <p className="flex items-center gap-2 font-semibold text-fg">
                <GraduationCap className="size-5 text-teal" aria-hidden /> Se former en alternance
              </p>
              <p className="mt-2 text-fg-2">
                Les métiers du cabinet et du laboratoire se préparent souvent en alternance, avec un employeur. Les offres d’alternance affichent leur rémunération, et les écoles
                sont présentées dans la rubrique Formation.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                <LienFleche href={ALTERNANCE} petit>
                  Offres en alternance
                </LienFleche>
                <LienFleche href="/formation/" petit>
                  Toutes les formations
                </LienFleche>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-line bg-bg-soft">
        <div className="container grid gap-10 py-16 md:py-20 lg:grid-cols-2 lg:gap-20">
          <AlerteEmail
            criteres={{ metiers: [m.code], contrats: [] }}
            detail={`${m.nom}, partout en France. Un email par semaine au plus, et un lien de désinscription dans chaque envoi.`}
          />
          <Link href={chemin(cheminFicheMetier(m.slug))} className="squircle-3xl group relative flex min-h-64 flex-col justify-end overflow-hidden bg-neutral-900 p-6 text-white">
            <Image src={m.photo} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover opacity-60 transition-transform duration-500 group-hover:scale-[1.03]" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="relative">
              <p className="flex items-center gap-2 text-sm text-white/70">
                <BookOpen className="size-4" aria-hidden /> Fiche métier
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">Le métier {m.de}</p>
              <p className="mt-1 text-white/70">Missions, formation, salaire moyen et évolutions.</p>
            </div>
            <ArrowUpRight className="absolute right-5 top-5 size-5 text-white/80" aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  )
}
