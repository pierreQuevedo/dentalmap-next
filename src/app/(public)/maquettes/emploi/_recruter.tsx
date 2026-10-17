/**
 * MAQUETTE. `/emploi/recruter` : la page des cabinets, centres de santé et
 * laboratoires. Pourquoi publier ici, profils disponibles anonymisés, trois
 * étapes, renvoi vers l'espace pro, FAQ. Aucun prix.
 */
import { ArrowRight, BadgeEuro, Crosshair, MapPin, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { CarteOffre, Etiquette, TitreDeuxTons } from './_blocs'
import { SectionFaq } from './_accueil'
import { FAQ_RECRUTEURS, OFFRE, PROFILS } from './_donnees'

const RAISONS = [
  { icone: Crosshair, titre: 'Des candidats ciblés', texte: 'Uniquement des métiers du dentaire, et des candidats qui cherchent autour de votre adresse : les offres sont classées par distance.' },
  { icone: ShieldCheck, titre: 'Un recruteur vérifié', texte: 'Votre offre porte la pastille « Fiche vérifiée » et renvoie à votre fiche : plateau technique, équipe, horaires, accès.' },
  { icone: BadgeEuro, titre: 'La rémunération affichée', texte: 'Les candidats savent avant de postuler. Moins de candidatures hors sujet, des entretiens qui portent sur le poste.' },
  { icone: UsersRound, titre: 'Des profils disponibles', texte: 'Consultez des profils anonymisés de candidats qui cherchent près de chez vous, et proposez-leur un échange.' },
]

const ETAPES = [
  { t: 'Votre fiche est vérifiée', d: 'Votre cabinet, centre de santé ou laboratoire est rapproché des registres officiels. Vous gérez la fiche depuis l’espace pro.' },
  { t: 'Vous publiez votre offre', d: 'Poste, contrat, temps de travail, date de début et rémunération. L’offre s’affiche avec votre fiche et sur la carte.' },
  { t: 'Vous choisissez avec qui échanger', d: 'Vous recevez des candidatures de personnes qui ont un compte. Leurs coordonnées vous parviennent quand elles acceptent votre proposition d’échange.' },
]

export function Recruter() {
  return (
    <main>
      <section className="container pb-16 pt-8 md:pb-20">
        <FilAriane segments={[{ libelle: 'Emploi', href: '/emploi/' }, { libelle: 'Recruter' }]} />
        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end lg:gap-16">
          <div>
            <TitreDeuxTons as="h1" grand sous="près de votre cabinet.">
              Recrutez
            </TitreDeuxTons>
            <p className="mt-6 max-w-xl text-lg text-fg-2">
              Assistant(e)s dentaires, secrétaires, prothésistes, remplaçant(e)s et collaborateurs : publiez votre offre depuis l’espace pro de votre fiche vérifiée.
            </p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
              <a className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-action px-7 text-sm font-semibold text-action-foreground">
                Publier une offre <ArrowRight className="size-4" aria-hidden />
              </a>
              <a className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line px-6 text-sm font-medium text-fg">Voir les profils disponibles</a>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-2">Votre offre, telle que les candidats la verront</p>
            <ul>
              <CarteOffre o={OFFRE} />
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-bg-soft">
        <div className="container py-16 md:py-20">
          <TitreDeuxTons sous="et pas ailleurs.">Pourquoi publier ici</TitreDeuxTons>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RAISONS.map((r) => (
              <li key={r.titre} className="squircle-2xl border border-line bg-bg p-6">
                <r.icone className="size-7 text-teal" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-5 font-semibold text-fg">{r.titre}</h3>
                <p className="mt-2 text-sm text-fg-2">{r.texte}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <TitreDeuxTons sous="près de Bordeaux, anonymisés.">Profils disponibles</TitreDeuxTons>
          <p className="max-w-sm text-sm text-fg-2">Ni nom, ni photo, ni coordonnées. Le candidat décide s’il accepte votre proposition d’échange.</p>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROFILS.map((p) => (
            <li key={p.metier} className="squircle-2xl flex flex-col border border-line p-5">
              <span className="grid size-11 place-items-center rounded-full bg-bg-soft text-fg-2" aria-hidden>
                <UserRound className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold leading-snug text-fg">{p.metier}</h3>
              <p className="text-sm text-fg-2">{p.experience}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.competences.map((c) => (
                  <Etiquette key={c}>{c}</Etiquette>
                ))}
              </div>
              <p className="mt-4 text-sm text-fg">{p.dispo}</p>
              <p className="inline-flex items-center gap-1.5 text-sm text-fg-2">
                <MapPin className="size-3.5 text-geo" aria-hidden /> {p.zone}
              </p>
              <div className="mt-auto pt-5">
                <a className="inline-flex h-10 w-full items-center justify-center rounded-full border border-line text-sm font-medium text-fg">Proposer un échange</a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="dark bg-background text-fg">
        <div className="container py-20 md:py-24">
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Comment ça marche
            <span className="block text-white/55">en trois étapes.</span>
          </h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {ETAPES.map((e, i) => (
              <li key={e.t} className="border-t border-line pt-6">
                <p className="text-6xl font-light tabular-nums tracking-tight text-white md:text-7xl">0{i + 1}</p>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">{e.t}</h3>
                <p className="mt-3 text-fg-2">{e.d}</p>
              </li>
            ))}
          </ol>
          <div className="squircle-3xl mt-14 grid gap-6 border border-line bg-bg-soft p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <p className="text-xl font-semibold text-white">Votre fiche est déjà gérée ?</p>
              <p className="mt-1 text-fg-2">Les offres se publient depuis l’espace pro. Sinon, commencez par revendiquer votre fiche.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <a className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground">
                Aller à l’espace pro <ArrowRight className="size-4" aria-hidden />
              </a>
              <a className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 text-sm font-medium text-white">Revendiquer ma fiche</a>
            </div>
          </div>
        </div>
      </section>

      <SectionFaq items={FAQ_RECRUTEURS} sous="Sur la publication, les candidatures et les profils disponibles." />
    </main>
  )
}
