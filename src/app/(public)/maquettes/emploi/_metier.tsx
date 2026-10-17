/**
 * MAQUETTE. Page métier nationale : `/emploi/assistant-dentaire`.
 * Titre, salaire moyen par secteur (études), offres récentes, départements
 * avec le plus d'offres, alternance et écoles, lien vers la fiche métier
 * des Ressources (`/conseils/metiers/assistant-dentaire/`).
 */
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, BookOpen, GraduationCap } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { AlerteEmail, LienFleche, Recherche, SourceSalaires, TitreDeuxTons, euros } from './_blocs'
import { ListeEditoriale } from './_accueil'
import { DEPARTEMENTS_AD, ECOLES, METIERS, OFFRES_NATIONAL, SALAIRES, SECTEURS } from './_donnees'

export function Metier() {
  const m = METIERS[0]!
  const salaires = SALAIRES[0]!
  const max = DEPARTEMENTS_AD[0]!.n
  return (
    <main>
      <section className="container pb-14 pt-8 md:pb-16">
        <FilAriane segments={[{ libelle: 'Emploi', href: '/emploi/' }, { libelle: 'Assistant(e) dentaire' }]} />
        <div className="mt-8">
          <TitreDeuxTons as="h1" sous={`${euros(m.n)} offres en France.`}>
            Assistant(e) dentaire
          </TitreDeuxTons>
        </div>
        <p className="mt-5 max-w-2xl text-lg text-fg-2">
          CDI, CDD, temps plein ou partiel, en cabinet libéral, en centre de santé ou à l’hôpital. Chaque offre est publiée par un recruteur vérifié et affiche sa
          rémunération.
        </p>
        <div className="mt-10">
          <Recherche metier="Assistant(e) dentaire" grande />
        </div>
      </section>

      <section className="border-y border-line bg-bg-soft">
        <div className="container py-16 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Salaire moyen par secteur</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SECTEURS.map((s, i) => {
              const v = salaires.valeurs[i]
              return (
                <li key={s} className="squircle-2xl border border-line bg-bg p-5">
                  <p className="text-sm text-fg-2">{s}</p>
                  {v === null ? (
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

      <section className="container py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <TitreDeuxTons sous="partout en France.">Offres récentes</TitreDeuxTons>
          <p className="text-sm text-fg-2">Les dernières publiées. Indiquez une ville pour les voir par distance.</p>
        </div>
        <div className="mt-10">
          <ListeEditoriale offres={OFFRES_NATIONAL.filter((o) => o.metier === 'Assistant(e) dentaire')} />
        </div>
        <a className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground">
          Voir les {euros(m.n)} offres <ArrowRight className="size-4" aria-hidden />
        </a>
      </section>

      <section className="border-t border-line">
        <div className="container grid gap-14 py-16 md:py-20 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">Les départements qui recrutent le plus</h2>
            <ol className="mt-8 space-y-3">
              {DEPARTEMENTS_AD.map((d) => (
                <li key={d.nom}>
                  <a className="grid grid-cols-[9rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm sm:grid-cols-[11rem_minmax(0,1fr)_3rem]">
                    <span className="truncate text-fg underline-offset-4 hover:underline">{d.nom}</span>
                    <span className="h-2 rounded-full bg-bg-soft">
                      <span className="block h-full rounded-full bg-teal" style={{ width: `${(d.n / max) * 100}%` }} />
                    </span>
                    <span className="text-right tabular-nums text-fg-2">{d.n}</span>
                  </a>
                </li>
              ))}
            </ol>
            <div className="mt-6">
              <LienFleche petit>Tous les départements</LienFleche>
            </div>
          </div>
          <div className="squircle-3xl border border-teal/25 bg-teal/[0.06] p-6 md:p-8">
            <p className="flex items-center gap-2 font-semibold text-fg">
              <GraduationCap className="size-5 text-teal" aria-hidden /> Se former en alternance
            </p>
            <p className="mt-2 text-fg-2">Le titre d’assistant(e) dentaire se prépare en alternance, avec un cabinet employeur. Les offres d’alternance indiquent le rythme de l’école.</p>
            <ul className="mt-5 divide-y divide-teal/20 border-y border-teal/20">
              {ECOLES.slice(1, 2).concat(ECOLES.slice(0, 1)).map((e) => (
                <li key={e.nom} className="py-3">
                  <a className="font-medium text-fg underline-offset-4 hover:underline">{e.nom}</a>
                  <p className="text-sm text-fg-2">
                    {e.detail} · {e.commune}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
              <LienFleche petit>Offres en alternance</LienFleche>
              <LienFleche petit>Toutes les formations</LienFleche>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-bg-soft">
        <div className="container grid gap-10 py-16 md:py-20 lg:grid-cols-2 lg:gap-20">
          <AlerteEmail detail="Assistant(e) dentaire, partout en France ou autour de votre ville. Un email par semaine au plus, et un lien de désinscription dans chaque envoi." />
          <a className="squircle-3xl group relative flex min-h-64 flex-col justify-end overflow-hidden bg-neutral-900 p-6 text-white">
            <Image src={m.photo} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover opacity-60 transition-transform duration-500 group-hover:scale-[1.03]" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="relative">
              <p className="flex items-center gap-2 text-sm text-white/70">
                <BookOpen className="size-4" aria-hidden /> Fiche métier
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">Le métier d’assistant(e) dentaire</p>
              <p className="mt-1 text-white/70">Missions, formation, salaire moyen et évolutions.</p>
            </div>
            <ArrowUpRight className="absolute right-5 top-5 size-5 text-white/80" aria-hidden />
          </a>
        </div>
      </section>
    </main>
  )
}
