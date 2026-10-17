/**
 * MAQUETTE. Accueil Emploi, version retenue : héros éditorial de B sans
 * colonne de points ni photo, métiers en bento (national), offres récentes,
 * méthode de A sur fond doux, salaires moyens par métier et secteur,
 * « Vous recrutez ? » et FAQ de B.
 */
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, CalendarClock, GraduationCap, MapPin, Repeat2 } from 'lucide-react'
import { Stats9 } from '@/components/stats9'
import {
  BoutonSecondaire,
  FaqEmploi,
  FicheVerifiee,
  LienFleche,
  PILIERS,
  Recherche,
  SalairesSecteurs,
  TitreDeuxTons,
  contratTexte,
  euros,
  remuneration,
} from './_blocs'
import { METIERS, OFFRES_NATIONAL, PARCOURS, TOTAL_FRANCE } from './_donnees'

function Hero() {
  return (
    <section className="container pb-16 pt-12 md:pb-20 md:pt-20">
      <p className="inline-flex items-center gap-2 text-sm font-medium text-fg-2">
        <span className="size-1.5 rounded-full bg-teal" /> Emploi dentaire, {euros(TOTAL_FRANCE)} offres en France
      </p>
      <div className="mt-5">
        <TitreDeuxTons as="h1" grand sous="près de chez vous.">
          Le bon poste,
        </TitreDeuxTons>
      </div>
      <div className="mt-12">
        <Recherche grande />
      </div>
      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-fg-2">
        <span>Recherches fréquentes :</span>
        {['Assistant(e) dentaire', 'Alternance', 'Remplacements', 'Prothésiste dentaire'].map((r) => (
          <a key={r} className="text-fg underline decoration-line underline-offset-4">
            {r}
          </a>
        ))}
      </p>
    </section>
  )
}

/** Bento des métiers, en national, sur fond sombre : la grande case pour le métier le plus demandé, les parcours en bandes. */
function Bento() {
  const [assistant, secretaire, prothesiste, aide] = METIERS
  return (
    <section className="dark bg-background text-fg">
      <div className="container py-16 md:py-20">
      <TitreDeuxTons sous="Combien de postes sont ouverts en France aujourd’hui.">Les offres par métier</TitreDeuxTons>
      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-[repeat(3,minmax(11rem,auto))]">
        <a className="squircle-3xl group relative col-span-2 min-h-[20rem] overflow-hidden lg:row-span-2">
          <Image src={assistant!.photo} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <p className="text-7xl font-light tabular-nums tracking-tight text-white md:text-8xl">{euros(assistant!.n)}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{assistant!.nom}</p>
            <p className="mt-1 text-white/75">{assistant!.detail}</p>
          </div>
          <ArrowUpRight className="absolute right-6 top-6 size-6 text-white" aria-hidden />
        </a>
        {[secretaire!, aide!].map((m) => (
          <a key={m.slug} className="squircle-3xl flex flex-col justify-between border border-line bg-bg-soft p-5 md:p-6">
            <p className="text-5xl font-light tabular-nums tracking-tight text-fg md:text-6xl">{euros(m.n)}</p>
            <div className="mt-6">
              <p className="font-semibold leading-snug text-fg">{m.nom}</p>
              <p className="mt-1 text-sm text-fg-2">{m.detail}</p>
            </div>
          </a>
        ))}
        <a className="squircle-3xl relative col-span-2 min-h-[11rem] overflow-hidden">
          <Image src={prothesiste!.photo} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
          <div className="absolute inset-y-0 left-0 flex flex-col justify-end p-5 md:p-6">
            <p className="text-5xl font-light tabular-nums tracking-tight text-white md:text-6xl">{euros(prothesiste!.n)}</p>
            <p className="mt-2 font-semibold text-white">{prothesiste!.nom}</p>
            <p className="text-sm text-white/75">{prothesiste!.detail}</p>
          </div>
        </a>
        <a className="squircle-3xl col-span-2 flex flex-col justify-between border border-teal/25 bg-teal/[0.07] p-5 md:p-6">
          <div>
            <p className="flex items-center gap-2 font-semibold text-fg">
              <GraduationCap className="size-5 text-teal" aria-hidden /> Alternance et stages
            </p>
            <p className="mt-1 text-sm text-fg-2">Des contrats reliés aux écoles et centres de formation, avec le rythme école et entreprise affiché sur chaque offre.</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {PARCOURS.slice(0, 2).map((p) => (
              <span key={p.slug} className="squircle-xl border border-teal/20 bg-bg/60 p-3">
                <span className="block text-3xl font-light tabular-nums text-fg">{euros(p.n)}</span>
                <span className="text-sm text-fg-2">{p.nom}</span>
              </span>
            ))}
          </div>
        </a>
        <div className="squircle-3xl col-span-2 flex flex-col justify-between border border-white/10 bg-ardoise p-5 text-white md:p-6">
          <div>
            <p className="flex items-center gap-2 font-semibold">
              <Repeat2 className="size-5 text-teal" aria-hidden /> Remplacements et collaborations
            </p>
            <p className="mt-1 text-sm text-white/70">Pour les chirurgiens-dentistes, avec le taux de rétrocession ou de redevance affiché. Les cessions de cabinet restent dans les Annonces.</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {PARCOURS.slice(2).map((p) => (
              <a key={p.slug} className="squircle-xl border border-white/15 p-3">
                <span className="block text-3xl font-light tabular-nums">{euros(p.n)}</span>
                <span className="text-sm text-white/75">{p.nom}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}

/** Offres récentes en liste éditoriale, toutes régions : une ligne par offre, la rémunération alignée à droite. */
export function ListeEditoriale({ offres }: { offres: typeof OFFRES_NATIONAL }) {
  return (
    <ol className="border-t border-fg">
      {offres.map((o) => {
        const r = remuneration(o)
        return (
          <li key={o.id} className="group relative grid gap-2 border-b border-line py-5 md:grid-cols-[9rem_minmax(0,1fr)_11rem_15rem] md:items-center md:gap-6">
            <p className="text-sm text-fg-2">
              <MapPin className="mr-1 inline size-3.5 align-[-2px] text-geo" aria-hidden />
              {o.commune}
            </p>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold leading-snug text-fg md:text-xl">
                <a className="after:absolute after:inset-0">{o.titre}</a>
              </h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-2">
                {o.recruteur} <FicheVerifiee taille="xs" />
              </p>
            </div>
            <p className="text-sm text-fg-2">
              <span className="font-medium text-fg">{contratTexte(o)}</span>
              <span className="md:hidden"> · </span>
              <span className="md:block">{o.temps}</span>
            </p>
            <p className="md:text-right">
              <span className="font-semibold tabular-nums text-fg">{r.principal}</span>
              <span className="block text-xs text-fg-2">
                {r.detail} · {o.depuis}
              </span>
              {r.estimation && <span className="block text-xs text-fg-2">{r.estimation}</span>}
            </p>
          </li>
        )
      })}
    </ol>
  )
}

function Recentes() {
  return (
    <section className="container py-16 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <TitreDeuxTons sous="partout en France.">Offres récentes</TitreDeuxTons>
        <p className="inline-flex items-center gap-1.5 text-sm text-fg-2">
          <CalendarClock className="size-4" aria-hidden /> Les dernières publiées. Indiquez une ville pour les voir par distance.
        </p>
      </div>
      <div className="mt-10">
        <ListeEditoriale offres={OFFRES_NATIONAL} />
      </div>
      <a className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground">
        Voir toutes les offres <ArrowRight className="size-4" aria-hidden />
      </a>
    </section>
  )
}

export function SectionRecruter() {
  const etapes = [
    ['Votre fiche est vérifiée', 'Le cabinet, le centre de santé ou le laboratoire est rapproché des registres officiels. Sans fiche vérifiée, pas de publication.'],
    ['Vous publiez depuis l’espace pro', 'Poste, contrat, rémunération, date de début. L’offre s’affiche avec votre fiche.'],
    ['Vous choisissez avec qui échanger', 'Les candidats ont un compte ; leurs coordonnées vous parviennent quand ils acceptent votre proposition d’échange.'],
  ]
  return (
    <section className="dark bg-background text-fg">
      <div className="container grid gap-12 py-20 md:py-24 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">Vous recrutez ?</h2>
          <p className="mt-5 max-w-md text-lg text-fg-2">Publiez votre offre là où les assistant(e)s, secrétaires, prothésistes et chirurgiens-dentistes la cherchent.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            <a className="inline-flex h-11 items-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground">Publier une offre</a>
            <BoutonSecondaire sombre>Comment ça marche</BoutonSecondaire>
          </div>
        </div>
        <ol className="divide-y divide-line border-y border-line">
          {etapes.map(([t, d], i) => (
            <li key={t} className="grid grid-cols-[3rem_1fr] gap-4 py-6">
              <span className="text-2xl font-light tabular-nums text-fg-2">0{i + 1}</span>
              <div>
                <p className="text-lg font-semibold text-white">{t}</p>
                <p className="mt-1 text-fg-2">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function SectionFaq({ items, sous = 'Sur les recruteurs, les candidatures et vos coordonnées.' }: { items?: { q: string; r: string }[]; sous?: string }) {
  return (
    <section className="container grid gap-10 py-20 md:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
      <div>
        <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">Questions fréquentes</h2>
        <p className="mt-4 text-fg-2">{sous}</p>
        <div className="mt-6">
          <LienFleche>Nous écrire</LienFleche>
        </div>
      </div>
      <FaqEmploi items={items} />
    </section>
  )
}

export function Accueil() {
  return (
    <main>
      <Hero />
      <Bento />
      <Recentes />
      {/* La méthode de l'accueil A, sur le fond doux du site ; les cartes du block repassent sur le fond de page pour rester lisibles. */}
      <div className="border-y border-line bg-bg-soft [&_.bg-muted]:bg-bg">
        <Stats9
          className="py-20 md:py-24"
          label="Pourquoi ces offres sont fiables"
          heading="Un recruteur vérifié derrière chaque offre"
          description="Une offre n’arrive pas sur DentalMap parce qu’un compte l’a saisie, mais parce qu’un cabinet, un centre de santé ou un laboratoire vérifié auprès des registres officiels l’a publiée depuis son espace pro."
          stats={[
            { value: euros(TOTAL_FRANCE), label: 'offres en France' },
            { value: euros(1412), label: 'recruteurs vérifiés' },
            { value: '100 %', label: 'avec rémunération affichée' },
          ]}
          features={[
            ...PILIERS.map((p) => ({ icon: <p.icone className="size-7" strokeWidth={1.5} />, title: p.titre, description: p.texte })),
            {
              icon: <CalendarClock className="size-7" strokeWidth={1.5} />,
              title: 'Dates affichées',
              description: 'Chaque offre porte sa date de publication et sa date d’expiration. Une offre pourvue disparaît.',
            },
          ]}
        />
      </div>
      <section className="container py-20 md:py-24">
        <TitreDeuxTons sous="par métier et par secteur.">Salaires moyens</TitreDeuxTons>
        <p className="mt-4 max-w-2xl text-fg-2">
          Pour situer une offre avant de postuler : le salaire moyen de chaque métier ouvert sur DentalMap, selon que l’on travaille en cabinet libéral, en centre de
          santé, en laboratoire ou à l’hôpital.
        </p>
        <div className="mt-10">
          <SalairesSecteurs />
        </div>
      </section>
      <SectionRecruter />
      <SectionFaq />
    </main>
  )
}
