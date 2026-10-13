/**
 * `/emploi/recruter/` : la page des cabinets, centres de santé et
 * laboratoires. Pourquoi publier ici, à quoi ressemble une offre et un profil
 * de candidat, trois étapes, renvoi vers l'espace pro, FAQ. Aucun prix.
 *
 * L'offre et les profils montrés sont des exemples, signalés comme tels : la
 * page ne prétend pas montrer de vrais candidats.
 */
import Link from 'next/link'
import { ArrowRight, BadgeEuro, Crosshair, MapPin, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import { FilAriane } from '@/components/annuaire/primitives'
import { chemin } from '@/lib/navigation'
import { EMPLOI, ROUTE_PUBLIER_OFFRE } from '@/lib/emploi/chemins'
import type { OffreResume } from '@/lib/emploi/types'
import { CarteOffre, Etiquette, TitreDeuxTons } from './blocs'
import { SectionFaq } from './accueil'

export const FAQ_RECRUTEURS = [
  {
    q: 'Qui peut publier une offre ?',
    r: 'Un cabinet, un centre de santé ou un laboratoire dont la fiche est vérifiée auprès des registres officiels, et gérée depuis l’espace pro par son titulaire.',
  },
  {
    q: 'Pourquoi la rémunération est-elle obligatoire ?',
    r: 'Les candidats comparent avant de postuler. Une fourchette brute mensuelle pour un poste salarié, un taux de rétrocession ou de redevance pour un remplacement ou une collaboration.',
  },
  {
    q: 'Comment recevoir les coordonnées d’un candidat ?',
    r: 'Vous voyez son profil et son message. Vous lui proposez un échange ; s’il accepte, son téléphone et son email vous sont transmis.',
  },
  {
    q: 'Que montrent les profils disponibles ?',
    r: 'Le métier, l’expérience, les compétences, la disponibilité et une zone de recherche. Ni nom, ni photo, ni coordonnées : le candidat choisit s’il accepte votre proposition.',
  },
  {
    q: 'Combien de temps une offre reste-t-elle en ligne ?',
    r: 'Trente jours, à condition de la confirmer tous les quinze jours depuis l’espace pro : une offre non confirmée est retirée. Vous la marquez pourvue dès que le poste est pris.',
  },
]

const RAISONS = [
  { icone: Crosshair, titre: 'Des candidats ciblés', texte: 'Uniquement des métiers du dentaire, et des candidats qui cherchent autour de votre adresse : les offres sont classées par distance.' },
  { icone: ShieldCheck, titre: 'Un recruteur vérifié', texte: 'Votre offre porte la pastille « Fiche vérifiée » et renvoie à votre fiche : adresse, présentation, accès.' },
  { icone: BadgeEuro, titre: 'La rémunération affichée', texte: 'Les candidats savent avant de postuler. Moins de candidatures hors sujet, des entretiens qui portent sur le poste.' },
  { icone: UsersRound, titre: 'Des profils disponibles', texte: 'Consultez des profils anonymisés de candidats qui cherchent près de chez vous, et proposez-leur un échange.' },
]

const ETAPES = [
  { t: 'Votre fiche est vérifiée', d: 'Votre cabinet, centre de santé ou laboratoire est rapproché des registres officiels. Vous gérez la fiche depuis l’espace pro.' },
  { t: 'Vous publiez votre offre', d: 'Poste, contrat, temps de travail, date de début et rémunération. L’offre s’affiche avec votre fiche et sur la carte.' },
  { t: 'Vous choisissez avec qui échanger', d: 'Vous recevez des candidatures de personnes qui ont un compte. Leurs coordonnées vous parviennent quand elles acceptent votre proposition d’échange.' },
]

/** Une offre d'exemple, pour l'aperçu : structure et personne inventées. */
const EXEMPLE: OffreResume = {
  id: 'exemple',
  slug: 'exemple',
  titre: 'Assistant(e) dentaire qualifié(e)',
  metier: 'assistant_dentaire',
  contrat: 'cdi',
  tempsPlein: true,
  heuresHebdo: 35,
  debut: null,
  fin: null,
  mode: 'salaire',
  min: 2100,
  max: 2400,
  recruteur: 'Votre cabinet',
  type: 'cabinet',
  adresse: null,
  codePostal: null,
  commune: 'Votre commune',
  communeSlug: '',
  departementSlug: '',
  lon: null,
  lat: null,
  metres: null,
  publieeLe: null,
  photo: null,
}

const PROFILS = [
  { metier: 'Assistant(e) dentaire qualifié(e)', experience: '6 ans d’expérience', competences: ['Implantologie', 'Stérilisation', 'Radiologie'], dispo: 'Disponible en janvier', zone: 'Votre commune et 10 km' },
  { metier: 'Prothésiste dentaire', experience: '3 ans d’expérience', competences: ['Zircone', 'CFAO', 'Céramique'], dispo: 'Disponible immédiatement', zone: 'Votre commune et 20 km' },
  { metier: 'Secrétaire de cabinet', experience: '10 ans d’expérience', competences: ['Planning', 'Facturation', 'Tiers payant'], dispo: 'Disponible en décembre', zone: 'Votre département' },
  { metier: 'Chirurgien-dentiste remplaçant(e)', experience: 'Thèse soutenue', competences: ['Omnipratique', 'Endodontie'], dispo: 'Libre deux mois', zone: 'Votre département' },
]

export function Recruter() {
  return (
    <main>
      <section className="container pb-16 pt-8 md:pb-20">
        <FilAriane segments={[{ libelle: 'Emploi', href: EMPLOI }, { libelle: 'Recruter' }]} />
        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end lg:gap-16">
          <div>
            <TitreDeuxTons as="h1" grand sous="près de votre cabinet.">
              Recrutez
            </TitreDeuxTons>
            <p className="mt-6 max-w-xl text-lg text-fg-2">
              Assistant(e)s dentaires, secrétaires, prothésistes, remplaçant(e)s et collaborateurs : publiez votre offre depuis l’espace pro de votre fiche vérifiée.
            </p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
              <Link
                href={chemin(ROUTE_PUBLIER_OFFRE)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-action px-7 text-sm font-semibold text-action-foreground hover:bg-action-hover"
              >
                Publier une offre <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a href="#profils" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line px-6 text-sm font-medium text-fg">
                Les profils disponibles
              </a>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-2">Votre offre, telle que les candidats la verront</p>
            <ul>
              <CarteOffre o={EXEMPLE} sansLien />
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

      <section id="profils" className="container scroll-mt-24 py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <TitreDeuxTons sous="anonymisés, dans votre espace pro.">Profils disponibles</TitreDeuxTons>
          <p className="max-w-sm text-sm text-fg-2">Ni nom, ni photo, ni coordonnées. Le candidat décide s’il accepte votre proposition d’échange. Ci-dessous, des exemples.</p>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROFILS.map((p) => (
            <li key={p.metier} className="squircle-2xl flex flex-col border border-line p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-bg-soft text-fg-2" aria-hidden>
                  <UserRound className="size-5" />
                </span>
                <Etiquette>Exemple</Etiquette>
              </div>
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
              <Link
                href={chemin('/espace-pro/')}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-action px-6 text-sm font-semibold text-action-foreground hover:bg-action-hover"
              >
                Aller à l’espace pro <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href={chemin('/espace-pro/revendiquer/')}
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 text-sm font-medium text-white"
              >
                Revendiquer ma fiche
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SectionFaq items={FAQ_RECRUTEURS} sous="Sur la publication, les candidatures et les profils disponibles." />
    </main>
  )
}
