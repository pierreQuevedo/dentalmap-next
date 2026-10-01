'use client'

import Image from 'next/image'
import {
  Accessibility,
  Award,
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock,
  Euro,
  GraduationCap,
  Languages,
  MapPin,
  Navigation,
  Phone,
  Stethoscope,
  Truck,
  Users,
} from 'lucide-react'
import { BadgeGeree, Verification } from '@/components/annuaire/primitives'
import { CarteFiche } from '@/components/recherche/carte-fiche'
import { illustration } from '@/lib/annuaire/illustration'
import type { PraticienProche } from '@/lib/annuaire/queries'

/**
 * Banc d'essai des cartes de résultats.
 *
 * Chaque section pose plusieurs formes de carte pour un même public, avec
 * les mêmes données inventées, à la largeur qu'elles auraient dans la colonne
 * de la recherche : un choix se fait en regardant les cartes côte à côte,
 * pas en lisant une description. Les formes sont numérotées pour qu'on puisse
 * en parler par leur numéro.
 */
const SOMMAIRE = [
  { id: 'dentistes', label: 'Dentistes' },
  { id: 'laboratoires', label: 'Laboratoires' },
  { id: 'ecoles', label: 'Écoles' },
  { id: 'formations', label: 'Formations' },
]

/* ------------------------------------------------------------------ */
/* Données inventées                                                   */
/* ------------------------------------------------------------------ */

const DENTISTE: PraticienProche = {
  slug: 'camille-riviere',
  lieuId: 'demo',
  civilite: 'MME',
  nom: 'RIVIERE',
  prenom: 'CAMILLE',
  raisonSociale: null,
  statutVerification: 'verifie',
  adresseLigne: '14 RUE VITAL CARLES',
  codePostal: '33000',
  aTelephone: true,
  revendiquee: false,
  communeNom: 'Bordeaux',
  communeSlug: 'bordeaux',
  departementSlug: 'gironde',
  precisionPosition: 'numero',
  lon: -0.579,
  lat: 44.838,
  metres: 1200,
}

const D = {
  nom: 'Dr Camille Rivière',
  specialite: 'Chirurgien-dentiste · Orthopédie dento-faciale',
  adresse: '14 rue Vital Carles',
  ville: '33000 Bordeaux',
  distance: '1,2 km',
  horaire: 'Ouvert · ferme à 19 h',
  langues: ['Français', 'Anglais', 'Espagnol'],
  acces: ['PMR', 'Ascenseur'],
  tiersPayant: 'Tiers payant intégral',
  photo: '/images/demo/pexels-6627447.jpg',
}

const L = {
  nom: 'Laboratoire Artemis Dentaire',
  activite: 'Prothèse dentaire · Sirene 842 156 320',
  adresse: '8 avenue de la Somme',
  ville: '33700 Mérignac',
  distance: '4,8 km',
  prestations: ['Prothèse fixe', 'Amovible', 'Implantologie', 'CFAO', 'Céramique'],
  delai: 'Délai moyen 5 jours',
  livraison: 'Livraison Gironde et Landes',
  equipe: '12 prothésistes',
  photo: '/images/demo/pexels-8413334.jpg',
}

const E = {
  nom: 'École de prothèse dentaire de Bordeaux',
  statut: 'Établissement privé sous contrat',
  ville: 'Talence (33)',
  distance: '6,1 km',
  diplomes: [
    { nom: 'Bac pro prothèse dentaire', duree: '3 ans' },
    { nom: 'BTMS prothésiste dentaire', duree: '2 ans' },
    { nom: 'BTS prothésiste dentaire', duree: '2 ans' },
  ],
  alternance: 'Alternance possible',
  effectif: '180 élèves',
  portes: 'Portes ouvertes le 14 mars',
  photo: '/images/demo/pexels-3881296.jpg',
}

const F = {
  titre: 'Implantologie : de la planification à la pose',
  type: 'Diplôme universitaire',
  organisme: 'Université de Bordeaux, UFR d’odontologie',
  ville: 'Bordeaux',
  duree: '120 heures sur 1 an',
  modalite: 'Présentiel',
  session: 'Prochaine rentrée en octobre',
  public: 'Chirurgiens-dentistes diplômés',
  places: '18 places',
  photo: '/images/demo/pexels-6627325.jpg',
}

/* ------------------------------------------------------------------ */
/* Briques                                                             */
/* ------------------------------------------------------------------ */

function Pastille({ children, teal = false }: { children: React.ReactNode; teal?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        teal ? 'bg-teal/10 text-teal ring-teal/30' : 'bg-bg-soft text-fg ring-line'
      }`}
    >
      {children}
    </span>
  )
}

function Ligne({ icone: Icone, children }: { icone: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-fg-2">
      <Icone className="size-3.5 shrink-0" />
      {children}
    </span>
  )
}

/** Carte de base : squircle, filet, fond doux, élévation au survol. */
function Boite({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`squircle-2xl hover-lift relative overflow-hidden border border-line bg-bg-soft [--lift:5px] hover:shadow-pop ${className}`}>
      {children}
    </div>
  )
}

function Bouton({ children, plein = false }: { children: React.ReactNode; plein?: boolean }) {
  return (
    <span
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold ${
        plein ? 'bg-teal text-white' : 'border border-line bg-bg text-fg'
      }`}
    >
      {children}
    </span>
  )
}

function Exemple({ numero, titre, note, children, large = false }: { numero: string; titre: string; note: string; children: React.ReactNode; large?: boolean }) {
  return (
    <div className={large ? 'md:col-span-2 xl:col-span-3' : ''}>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="rounded-full bg-fg px-2 py-0.5 text-xs font-semibold tabular-nums text-bg">{numero}</span>
        <h3 className="text-sm font-semibold text-fg">{titre}</h3>
      </div>
      <div className={large ? '' : 'max-w-[26rem]'}>{children}</div>
      <p className="mt-3 max-w-[26rem] text-xs text-fg-2">{note}</p>
    </div>
  )
}

function Section({ id, titre, intro, children }: { id: string; titre: string; intro: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-line pt-10">
      <h2 className="text-xl font-semibold tracking-tight text-fg">{titre}</h2>
      <p className="mt-2 max-w-2xl text-sm text-fg-2">{intro}</p>
      <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Dentistes                                                           */
/* ------------------------------------------------------------------ */

function DentisteImmersive() {
  return (
    <ol>
      <CarteFiche praticien={DENTISTE} base="dentistes" profession="dentiste" actif={false} onSurvol={() => {}} />
    </ol>
  )
}

function DentistePortrait({ photo }: { photo?: string }) {
  return (
    <Boite>
      <div className="relative aspect-[4/3]">
        <Image src={photo ?? illustration('dentiste', 'MME')} alt="" fill sizes="26rem" className="object-cover object-[center_30%]" />
        {photo && (
          <BadgeGeree profession="dentiste" className="absolute left-3 top-3" />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold leading-tight text-fg">{D.nom}</h3>
        <p className="mt-0.5 text-sm text-fg-2">{D.specialite}</p>
        <div className="mt-2">
          <Verification statut="verifie" />
        </div>
        <p className="mt-3 text-sm text-fg">
          {D.adresse}
          <br />
          {D.ville}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <Ligne icone={MapPin}>{D.distance}</Ligne>
          <Ligne icone={Clock}>{D.horaire}</Ligne>
        </div>
      </div>
    </Boite>
  )
}

function DentisteHorizontale() {
  return (
    <Boite className="flex gap-4 p-4">
      <Image src={illustration('dentiste', 'MME')} alt="" width={72} height={90} className="squircle-lg h-[5.5rem] w-[4.5rem] shrink-0 border border-line object-cover object-[center_26%]" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold leading-tight text-fg">{D.nom}</h3>
        <p className="truncate text-sm text-fg-2">{D.specialite}</p>
        <p className="mt-1.5 text-sm text-fg">
          {D.adresse}, {D.ville}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Verification statut="verifie" />
          <Ligne icone={MapPin}>{D.distance}</Ligne>
        </div>
      </div>
    </Boite>
  )
}

function DentisteRiche() {
  return (
    <Boite>
      <div className="flex gap-4 p-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-line">
          <Image src={D.photo} alt="" fill sizes="5rem" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold leading-tight text-fg">{D.nom}</h3>
            <Pastille teal>
              <BadgeCheck className="size-3" /> Revendiquée
            </Pastille>
          </div>
          <p className="mt-0.5 text-sm text-fg-2">{D.specialite}</p>
          <p className="mt-1.5 text-sm text-fg">
            {D.adresse}, {D.ville} · <span className="text-fg-2">{D.distance}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line px-4 py-3">
        <Ligne icone={Clock}>{D.horaire}</Ligne>
        <Ligne icone={Languages}>{D.langues.join(', ')}</Ligne>
        <Ligne icone={Accessibility}>{D.acces.join(', ')}</Ligne>
        <Ligne icone={BadgeCheck}>{D.tiersPayant}</Ligne>
      </div>
      <div className="flex gap-2 border-t border-line p-3">
        <Bouton plein>Voir la fiche</Bouton>
        <Bouton>
          <Phone className="size-4" /> Appeler
        </Bouton>
      </div>
    </Boite>
  )
}

function DentisteDense() {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {[D, { ...D, nom: 'Dr Paul Nguyen', specialite: 'Chirurgien-dentiste', adresse: '3 cours de l’Intendance', distance: '1,4 km', horaire: 'Fermé · ouvre demain à 9 h' }, { ...D, nom: 'Dr Inès Haddad', specialite: 'Chirurgien-dentiste · Chirurgie orale', adresse: '27 rue Sainte-Catherine', distance: '1,9 km' }].map((p) => (
        <li key={p.nom} className="flex items-center gap-4 py-3 hover:bg-bg-soft">
          <Image src={illustration('dentiste', 'MME')} alt="" width={40} height={50} className="squircle-md h-12 w-10 shrink-0 border border-line object-cover object-[center_26%]" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-fg">{p.nom}</p>
            <p className="truncate text-sm text-fg-2">
              {p.specialite} · {p.adresse}
            </p>
          </div>
          <div className="hidden shrink-0 text-right text-sm sm:block">
            <p className="text-fg-2">{p.distance}</p>
            <p className="text-xs text-fg-2">{p.horaire}</p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-fg-2" />
        </li>
      ))}
    </ul>
  )
}

function DentisteMiniPlan() {
  return (
    <Boite>
      <div className="relative aspect-[2/1]">
        <Image src="/images/cartes/bordeaux.jpg" alt="" fill sizes="26rem" className="object-cover" />
        <span className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-teal shadow-pop" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg-soft to-transparent" />
      </div>
      <div className="-mt-6 flex gap-3 px-4 pb-4">
        <Image src={illustration('dentiste', 'MME')} alt="" width={56} height={70} className="squircle-lg h-[4.4rem] w-14 shrink-0 border border-line bg-bg object-cover object-[center_26%]" />
        <div className="min-w-0 pt-6">
          <h3 className="truncate text-base font-semibold leading-tight text-fg">{D.nom}</h3>
          <p className="truncate text-sm text-fg-2">{D.specialite}</p>
          <p className="mt-1 text-sm text-fg">
            {D.adresse}, {D.ville}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Verification statut="verifie" />
            <Ligne icone={MapPin}>{D.distance}</Ligne>
          </div>
        </div>
      </div>
    </Boite>
  )
}

/* ------------------------------------------------------------------ */
/* Laboratoires                                                        */
/* ------------------------------------------------------------------ */

function LaboImmersive() {
  return (
    <ol>
      <CarteFiche
        praticien={{ ...DENTISTE, slug: 'artemis', civilite: null, nom: 'ARTEMIS DENTAIRE', prenom: null, raisonSociale: 'LABORATOIRE ARTEMIS DENTAIRE', adresseLigne: '8 AVENUE DE LA SOMME', codePostal: '33700', communeNom: 'Mérignac', communeSlug: 'merignac', metres: 4800 }}
        base="prothesistes"
        profession="prothesiste"
        actif={false}
        onSurvol={() => {}}
      />
    </ol>
  )
}

function LaboPhoto() {
  return (
    <Boite>
      <div className="relative aspect-[16/9]">
        <Image src={L.photo} alt="" fill sizes="26rem" className="object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold leading-tight text-fg">{L.nom}</h3>
        <p className="mt-0.5 text-sm text-fg-2">{L.activite}</p>
        <p className="mt-2 text-sm text-fg">
          {L.adresse}, {L.ville}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {L.prestations.slice(0, 4).map((p) => (
            <Pastille key={p}>{p}</Pastille>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <Ligne icone={MapPin}>{L.distance}</Ligne>
          <Ligne icone={Truck}>{L.livraison}</Ligne>
        </div>
      </div>
    </Boite>
  )
}

function LaboHorizontale() {
  return (
    <Boite className="flex gap-4 p-4">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-teal text-white">
        <Building2 className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold leading-tight text-fg">{L.nom}</h3>
        <p className="truncate text-sm text-fg-2">{L.activite}</p>
        <p className="mt-1.5 text-sm text-fg">
          {L.adresse}, {L.ville}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Verification statut="verifie" />
          <Ligne icone={MapPin}>{L.distance}</Ligne>
        </div>
      </div>
    </Boite>
  )
}

function LaboRiche() {
  return (
    <Boite>
      <div className="flex gap-4 p-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-line">
          <Image src={L.photo} alt="" fill sizes="5rem" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold leading-tight text-fg">{L.nom}</h3>
            <Pastille teal>
              <BadgeCheck className="size-3" /> Revendiquée
            </Pastille>
          </div>
          <p className="mt-0.5 text-sm text-fg-2">{L.activite}</p>
          <p className="mt-1.5 text-sm text-fg">
            {L.adresse}, {L.ville} · <span className="text-fg-2">{L.distance}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-line px-4 py-3">
        {L.prestations.map((p) => (
          <Pastille key={p}>{p}</Pastille>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line px-4 py-3">
        <Ligne icone={Clock}>{L.delai}</Ligne>
        <Ligne icone={Truck}>{L.livraison}</Ligne>
        <Ligne icone={Users}>{L.equipe}</Ligne>
      </div>
      <div className="flex gap-2 border-t border-line p-3">
        <Bouton plein>Demander un devis</Bouton>
        <Bouton>Voir la fiche</Bouton>
      </div>
    </Boite>
  )
}

function LaboDense() {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {[L, { ...L, nom: 'Dentalis Prothèse', ville: '33000 Bordeaux', adresse: '19 rue du Palais Gallien', distance: '2,3 km', prestations: ['Prothèse fixe', 'Céramique'] }, { ...L, nom: 'Atelier Céram Sud-Ouest', ville: '33600 Pessac', adresse: '4 allée des Fauvettes', distance: '7,9 km', prestations: ['Amovible', 'CFAO'] }].map((p) => (
        <li key={p.nom} className="flex items-center gap-4 py-3 hover:bg-bg-soft">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-bg-soft text-fg">
            <Building2 className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-fg">{p.nom}</p>
            <p className="truncate text-sm text-fg-2">
              {p.prestations.join(', ')} · {p.ville}
            </p>
          </div>
          <span className="shrink-0 text-sm text-fg-2">{p.distance}</span>
          <ChevronRight className="size-4 shrink-0 text-fg-2" />
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------ */
/* Écoles                                                              */
/* ------------------------------------------------------------------ */

function EcolePhoto() {
  return (
    <Boite>
      <div className="relative aspect-[16/9]">
        <Image src={E.photo} alt="" fill sizes="26rem" className="object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-2 py-0.5 text-xs font-medium text-fg backdrop-blur">{E.alternance}</span>
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold leading-tight text-fg">{E.nom}</h3>
        <p className="mt-0.5 text-sm text-fg-2">{E.statut}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {E.diplomes.map((d) => (
            <Pastille key={d.nom}>{d.nom}</Pastille>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <Ligne icone={MapPin}>
            {E.ville} · {E.distance}
          </Ligne>
          <Ligne icone={Users}>{E.effectif}</Ligne>
        </div>
      </div>
    </Boite>
  )
}

function EcoleHorizontale() {
  return (
    <Boite className="flex gap-4 p-4">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-teal text-white">
        <GraduationCap className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold leading-tight text-fg">{E.nom}</h3>
        <p className="mt-0.5 text-sm text-fg-2">
          {E.statut} · {E.ville}
        </p>
        <p className="mt-1.5 text-sm text-fg">{E.diplomes.map((d) => d.nom).join(' · ')}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Pastille teal>{E.alternance}</Pastille>
          <Ligne icone={MapPin}>{E.distance}</Ligne>
        </div>
      </div>
    </Boite>
  )
}

function EcoleRiche() {
  return (
    <Boite>
      <div className="flex gap-4 p-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-line">
          <Image src={E.photo} alt="" fill sizes="5rem" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-tight text-fg">{E.nom}</h3>
          <p className="mt-0.5 text-sm text-fg-2">{E.statut}</p>
          <p className="mt-1.5 text-sm text-fg">
            {E.ville} · <span className="text-fg-2">{E.distance}</span>
          </p>
        </div>
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {E.diplomes.map((d) => (
          <li key={d.nom} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
            <span className="inline-flex items-center gap-2 text-fg">
              <Award className="size-4 text-teal" /> {d.nom}
            </span>
            <span className="text-fg-2">{d.duree}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line px-4 py-3">
        <Ligne icone={Users}>{E.effectif}</Ligne>
        <Ligne icone={CalendarDays}>{E.portes}</Ligne>
      </div>
      <div className="flex gap-2 border-t border-line p-3">
        <Bouton plein>Voir l’école</Bouton>
        <Bouton>Demander une brochure</Bouton>
      </div>
    </Boite>
  )
}

function EcoleDense() {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {[E, { ...E, nom: 'Lycée professionnel Léonard de Vinci', statut: 'Public', ville: 'Blanquefort (33)', distance: '11 km', diplomes: [{ nom: 'Bac pro prothèse dentaire', duree: '3 ans' }] }, { ...E, nom: 'CFA des métiers de la santé', statut: 'Apprentissage', ville: 'Pessac (33)', distance: '8 km', diplomes: [{ nom: 'BTMS prothésiste dentaire', duree: '2 ans' }] }].map((e) => (
        <li key={e.nom} className="flex items-center gap-4 py-3 hover:bg-bg-soft">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-bg-soft text-fg">
            <GraduationCap className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-fg">{e.nom}</p>
            <p className="truncate text-sm text-fg-2">
              {e.diplomes.map((d) => d.nom).join(', ')} · {e.ville}
            </p>
          </div>
          <span className="shrink-0 text-sm text-fg-2">{e.distance}</span>
          <ChevronRight className="size-4 shrink-0 text-fg-2" />
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------ */
/* Formations                                                          */
/* ------------------------------------------------------------------ */

function FormationCarte() {
  return (
    <Boite className="p-4">
      <div className="flex items-center justify-between gap-2">
        <Pastille teal>{F.type}</Pastille>
        <span className="text-xs text-fg-2">{F.modalite}</span>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-tight text-fg">{F.titre}</h3>
      <p className="mt-1 text-sm text-fg-2">{F.organisme}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <Ligne icone={MapPin}>{F.ville}</Ligne>
        <Ligne icone={Clock}>{F.duree}</Ligne>
        <Ligne icone={CalendarDays}>{F.session}</Ligne>
      </div>
    </Boite>
  )
}

function FormationPhoto() {
  return (
    <Boite>
      <div className="relative aspect-[16/9]">
        <Image src={F.photo} alt="" fill sizes="26rem" className="object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-2 py-0.5 text-xs font-medium text-fg backdrop-blur">{F.type}</span>
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold leading-tight text-fg">{F.titre}</h3>
        <p className="mt-1 text-sm text-fg-2">{F.organisme}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <Ligne icone={MapPin}>{F.ville}</Ligne>
          <Ligne icone={Clock}>{F.duree}</Ligne>
        </div>
      </div>
    </Boite>
  )
}

function FormationRiche() {
  return (
    <Boite>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <Pastille teal>{F.type}</Pastille>
          <span className="text-xs text-fg-2">{F.places}</span>
        </div>
        <h3 className="mt-3 text-base font-semibold leading-tight text-fg">{F.titre}</h3>
        <p className="mt-1 text-sm text-fg-2">{F.organisme}</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line px-4 py-3 text-sm">
        <div>
          <dt className="text-xs text-fg-2">Durée</dt>
          <dd className="text-fg">{F.duree}</dd>
        </div>
        <div>
          <dt className="text-xs text-fg-2">Modalité</dt>
          <dd className="text-fg">
            {F.modalite}, {F.ville}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-fg-2">Public</dt>
          <dd className="text-fg">{F.public}</dd>
        </div>
        <div>
          <dt className="text-xs text-fg-2">Session</dt>
          <dd className="text-fg">{F.session}</dd>
        </div>
      </dl>
      <div className="flex gap-2 border-t border-line p-3">
        <Bouton plein>Voir la formation</Bouton>
        <Bouton>Contacter l’organisme</Bouton>
      </div>
    </Boite>
  )
}

function FormationDense() {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {[F, { ...F, titre: 'Parodontologie clinique', type: 'Formation continue', organisme: 'Institut Paro Aquitaine', duree: '2 jours', session: 'Session en novembre' }, { ...F, titre: 'Gestion du cabinet dentaire', type: 'Formation continue', organisme: 'Progress Santé', duree: '14 heures', modalite: 'À distance', ville: 'En ligne' }].map((f) => (
        <li key={f.titre} className="flex items-center gap-4 py-3 hover:bg-bg-soft">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-bg-soft text-fg">
            <Clock className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-fg">{f.titre}</p>
            <p className="truncate text-sm text-fg-2">
              {f.type} · {f.organisme} · {f.ville}
            </p>
          </div>
          <span className="hidden shrink-0 text-sm text-fg-2 sm:block">{f.duree}</span>
          <ChevronRight className="size-4 shrink-0 text-fg-2" />
        </li>
      ))}
    </ul>
  )
}


/* ------------------------------------------------------------------ */
/* Briques supplémentaires                                             */
/* ------------------------------------------------------------------ */

/** Carte sombre en ardoise, jetons shadcn du thème sombre. */
function BoiteSombre({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`dark squircle-2xl hover-lift relative overflow-hidden bg-ardoise text-foreground [--lift:5px] hover:shadow-pop ${className}`}>
      {children}
    </div>
  )
}

/** Trois repères alignés, séparés par un filet, en bas d'une carte « ticket ». */
function Reperes({ items }: { items: { icone: React.ComponentType<{ className?: string }>; libelle: string; valeur: string }[] }) {
  return (
    <div className="grid grid-cols-3 divide-x divide-line border-t border-line">
      {items.map((r) => (
        <div key={r.libelle} className="px-3 py-2.5">
          <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[.06em] text-fg-2">
            <r.icone className="size-3" /> {r.libelle}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-fg">{r.valeur}</p>
        </div>
      ))}
    </div>
  )
}

/** Bandeau de couverture avec un médaillon qui déborde dessous. */
function Bandeau({ couverture, medaillon }: { couverture: string; medaillon: React.ReactNode }) {
  return (
    <>
      <div className="relative h-24">
        <Image src={couverture} alt="" fill sizes="26rem" className="object-cover" />
      </div>
      <div className="-mt-8 px-4">{medaillon}</div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Dentistes, suite                                                    */
/* ------------------------------------------------------------------ */

function DentisteEditoriale() {
  return (
    <Boite className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[.06em] text-teal">Orthopédie dento-faciale</p>
      <h3 className="mt-2 text-xl font-semibold leading-tight tracking-tight text-fg">{D.nom}</h3>
      <p className="mt-2 text-sm text-fg-2">Cabinet de trois praticiens, conventionné secteur 1, soins enfants et adultes.</p>
      <p className="mt-4 text-sm text-fg">
        {D.adresse}, {D.ville}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Verification statut="verifie" />
        <Ligne icone={MapPin}>{D.distance}</Ligne>
      </div>
    </Boite>
  )
}

function DentisteBandeau() {
  return (
    <Boite>
      <Bandeau
        couverture={D.photo}
        medaillon={
          <Image src={illustration('dentiste', 'MME')} alt="" width={64} height={80} className="squircle-lg h-20 w-16 border-2 border-bg-soft bg-bg object-cover object-[center_26%]" />
        }
      />
      <div className="p-4 pt-3">
        <h3 className="text-base font-semibold leading-tight text-fg">{D.nom}</h3>
        <p className="mt-0.5 text-sm text-fg-2">{D.specialite}</p>
        <p className="mt-2 text-sm text-fg">
          {D.adresse}, {D.ville}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Pastille teal>
            <BadgeCheck className="size-3" /> Revendiquée
          </Pastille>
          <Ligne icone={MapPin}>{D.distance}</Ligne>
        </div>
      </div>
    </Boite>
  )
}

function DentisteGrilleFaits() {
  return (
    <Boite className="p-4">
      <div className="flex gap-3">
        <Image src={illustration('dentiste', 'MME')} alt="" width={56} height={70} className="squircle-lg h-[4.4rem] w-14 shrink-0 border border-line object-cover object-[center_26%]" />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold leading-tight text-fg">{D.nom}</h3>
          <p className="truncate text-sm text-fg-2">{D.specialite}</p>
          <p className="mt-1 truncate text-sm text-fg">
            {D.adresse}, {D.ville}
          </p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        {[
          ['Distance', D.distance],
          ['Horaires', 'Ouvert jusqu’à 19 h'],
          ['Langues', 'FR, EN, ES'],
          ['Tiers payant', 'Intégral'],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-bg px-3 py-2">
            <dt className="text-[11px] uppercase tracking-[.06em] text-fg-2">{k}</dt>
            <dd className="mt-0.5 font-medium text-fg">{v}</dd>
          </div>
        ))}
      </dl>
    </Boite>
  )
}

function DentisteSombre() {
  return (
    <BoiteSombre className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="relative size-14 overflow-hidden rounded-full border border-white/15">
          <Image src={D.photo} alt="" fill sizes="3.5rem" className="object-cover" />
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white">{D.distance}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-tight text-white">{D.nom}</h3>
      <p className="mt-0.5 text-sm text-white/70">{D.specialite}</p>
      <p className="mt-3 text-sm text-white/85">
        {D.adresse}, {D.ville}
      </p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/70">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" /> {D.horaire}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Languages className="size-3.5" /> FR, EN, ES
        </span>
      </div>
      <div className="mt-4 flex gap-2">
        <span className="inline-flex h-9 items-center rounded-full bg-teal px-4 text-sm font-semibold text-white">Voir la fiche</span>
        <span className="inline-flex h-9 items-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white">Appeler</span>
      </div>
    </BoiteSombre>
  )
}

function DentisteTicket() {
  return (
    <Boite>
      <div className="flex gap-3 p-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal">
          <Stethoscope className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold leading-tight text-fg">{D.nom}</h3>
          <p className="truncate text-sm text-fg-2">{D.specialite}</p>
          <p className="mt-1 text-sm text-fg">
            {D.adresse}, {D.ville}
          </p>
        </div>
      </div>
      <Reperes
        items={[
          { icone: MapPin, libelle: 'Distance', valeur: D.distance },
          { icone: Clock, libelle: 'Aujourd’hui', valeur: '9 h à 19 h' },
          { icone: Languages, libelle: 'Langues', valeur: 'FR, EN, ES' },
        ]}
      />
    </Boite>
  )
}

function DentisteMinimale() {
  return (
    <ul className="border-t border-line">
      {[D, { ...D, nom: 'Dr Paul Nguyen', specialite: 'Chirurgien-dentiste', distance: '1,4 km' }, { ...D, nom: 'Dr Inès Haddad', specialite: 'Chirurgie orale', distance: '1,9 km' }].map((p) => (
        <li key={p.nom} className="flex items-baseline justify-between gap-4 border-b border-line py-4 hover:bg-bg-soft">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold tracking-tight text-fg">{p.nom}</p>
            <p className="truncate text-sm text-fg-2">
              {p.specialite} · {p.adresse}
            </p>
          </div>
          <span className="shrink-0 text-sm tabular-nums text-fg-2">{p.distance}</span>
        </li>
      ))}
    </ul>
  )
}

function DentisteActions() {
  return (
    <Boite className="p-4">
      <div className="flex gap-4">
        <Image src={illustration('dentiste', 'MME')} alt="" width={72} height={90} className="squircle-lg h-[5.5rem] w-[4.5rem] shrink-0 border border-line object-cover object-[center_26%]" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold leading-tight text-fg">{D.nom}</h3>
          <p className="truncate text-sm text-fg-2">{D.specialite}</p>
          <p className="mt-1.5 text-sm text-fg">
            {D.adresse}, {D.ville}
          </p>
          <p className="mt-1 text-sm text-fg-2">
            {D.distance} · {D.horaire}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Bouton plein>Voir la fiche</Bouton>
        <Bouton>
          <Phone className="size-4" /> Appeler
        </Bouton>
        <Bouton>
          <Navigation className="size-4" /> Itinéraire
        </Bouton>
      </div>
    </Boite>
  )
}

function DentisteMosaique() {
  return (
    <Boite>
      <div className="grid grid-cols-3 gap-0.5">
        {[D.photo, '/images/demo/pexels-6627471.jpg', '/images/demo/pexels-6627320.jpg'].map((src, i) => (
          <div key={src} className={`relative ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`}>
            <Image src={src} alt="" fill sizes="18rem" className="object-cover" />
          </div>
        ))}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-tight text-fg">{D.nom}</h3>
          <Pastille teal>
            <BadgeCheck className="size-3" /> Revendiquée
          </Pastille>
        </div>
        <p className="mt-0.5 text-sm text-fg-2">{D.specialite}</p>
        <p className="mt-2 text-sm text-fg">
          {D.adresse}, {D.ville} · <span className="text-fg-2">{D.distance}</span>
        </p>
      </div>
    </Boite>
  )
}

/* ------------------------------------------------------------------ */
/* Laboratoires, suite                                                 */
/* ------------------------------------------------------------------ */

function LaboCatalogue() {
  return (
    <Boite className="p-4">
      <h3 className="text-base font-semibold leading-tight text-fg">{L.nom}</h3>
      <p className="mt-0.5 text-sm text-fg-2">
        {L.ville} · {L.distance}
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {L.prestations.map((p) => (
          <li key={p} className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2 text-sm text-fg">
            <BadgeCheck className="size-4 shrink-0 text-teal" /> {p}
          </li>
        ))}
        <li className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2 text-sm text-fg-2">
          <Clock className="size-4 shrink-0" /> {L.delai}
        </li>
      </ul>
    </Boite>
  )
}

function LaboSombre() {
  return (
    <BoiteSombre>
      <div className="relative h-28">
        <Image src={L.photo} alt="" fill sizes="26rem" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ardoise to-transparent" />
      </div>
      <div className="p-5 pt-2">
        <h3 className="text-lg font-semibold leading-tight text-white">{L.nom}</h3>
        <p className="mt-0.5 text-sm text-white/70">{L.activite}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {L.prestations.slice(0, 4).map((p) => (
            <span key={p} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">
              {p}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-white/70">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="size-3.5" /> {L.livraison}
          </span>
          <span>{L.distance}</span>
        </div>
      </div>
    </BoiteSombre>
  )
}

function LaboBandeau() {
  return (
    <Boite>
      <Bandeau
        couverture={L.photo}
        medaillon={
          <span className="flex size-16 items-center justify-center rounded-xl border-2 border-bg-soft bg-teal text-white">
            <Building2 className="size-7" />
          </span>
        }
      />
      <div className="p-4 pt-3">
        <h3 className="text-base font-semibold leading-tight text-fg">{L.nom}</h3>
        <p className="mt-0.5 text-sm text-fg-2">{L.activite}</p>
        <p className="mt-2 text-sm text-fg">
          {L.adresse}, {L.ville}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Verification statut="verifie" />
          <Ligne icone={MapPin}>{L.distance}</Ligne>
        </div>
      </div>
    </Boite>
  )
}

function LaboTicket() {
  return (
    <Boite>
      <div className="flex gap-3 p-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal">
          <Building2 className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold leading-tight text-fg">{L.nom}</h3>
          <p className="truncate text-sm text-fg-2">{L.prestations.slice(0, 3).join(', ')}</p>
          <p className="mt-1 text-sm text-fg">
            {L.adresse}, {L.ville}
          </p>
        </div>
      </div>
      <Reperes
        items={[
          { icone: MapPin, libelle: 'Distance', valeur: L.distance },
          { icone: Clock, libelle: 'Délai', valeur: '5 jours' },
          { icone: Users, libelle: 'Équipe', valeur: L.equipe },
        ]}
      />
    </Boite>
  )
}

/* ------------------------------------------------------------------ */
/* Écoles, suite                                                       */
/* ------------------------------------------------------------------ */

function EcoleParcours() {
  return (
    <Boite className="p-4">
      <h3 className="text-base font-semibold leading-tight text-fg">{E.nom}</h3>
      <p className="mt-0.5 text-sm text-fg-2">
        {E.statut} · {E.ville}
      </p>
      <ol className="mt-4 space-y-3 border-l-2 border-teal/30 pl-4">
        {E.diplomes.map((d) => (
          <li key={d.nom} className="relative">
            <span className="absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full bg-teal" />
            <p className="text-sm font-medium text-fg">{d.nom}</p>
            <p className="text-xs text-fg-2">{d.duree}</p>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap gap-2">
        <Pastille teal>{E.alternance}</Pastille>
        <Pastille>{E.effectif}</Pastille>
      </div>
    </Boite>
  )
}

function EcoleBandeau() {
  return (
    <Boite>
      <Bandeau
        couverture={E.photo}
        medaillon={
          <span className="flex size-16 items-center justify-center rounded-xl border-2 border-bg-soft bg-bg text-fg">
            <GraduationCap className="size-7" />
          </span>
        }
      />
      <div className="p-4 pt-3">
        <h3 className="text-base font-semibold leading-tight text-fg">{E.nom}</h3>
        <p className="mt-0.5 text-sm text-fg-2">
          {E.statut} · {E.ville}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {E.diplomes.map((d) => (
            <Pastille key={d.nom}>{d.nom.replace(' prothèse dentaire', '').replace(' prothésiste dentaire', '')}</Pastille>
          ))}
        </div>
      </div>
    </Boite>
  )
}

function EcoleSombre() {
  return (
    <BoiteSombre className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[.06em] text-white/60">{E.statut}</p>
      <h3 className="mt-2 text-lg font-semibold leading-tight text-white">{E.nom}</h3>
      <p className="mt-1 text-sm text-white/70">
        {E.ville} · {E.distance}
      </p>
      <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
        {E.diplomes.map((d) => (
          <li key={d.nom} className="flex items-center justify-between py-2 text-sm">
            <span className="text-white">{d.nom}</span>
            <span className="text-white/60">{d.duree}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-white/70">
        {E.alternance} · {E.effectif}
      </p>
    </BoiteSombre>
  )
}

function EcoleChiffres() {
  return (
    <Boite>
      <div className="p-4">
        <h3 className="text-base font-semibold leading-tight text-fg">{E.nom}</h3>
        <p className="mt-0.5 text-sm text-fg-2">
          {E.statut} · {E.ville}
        </p>
      </div>
      <Reperes
        items={[
          { icone: Award, libelle: 'Diplômes', valeur: '3 filières' },
          { icone: Users, libelle: 'Élèves', valeur: '180' },
          { icone: CalendarDays, libelle: 'Portes ouvertes', valeur: '14 mars' },
        ]}
      />
    </Boite>
  )
}

/* ------------------------------------------------------------------ */
/* Formations, suite                                                   */
/* ------------------------------------------------------------------ */

function FormationAgenda() {
  return (
    <Boite className="flex gap-4 p-4">
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-teal text-white">
        <span className="text-[11px] font-semibold uppercase tracking-[.08em]">Oct.</span>
        <span className="text-2xl font-semibold leading-none">12</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[.06em] text-teal">{F.type}</p>
        <h3 className="mt-1 text-base font-semibold leading-tight text-fg">{F.titre}</h3>
        <p className="mt-1 text-sm text-fg-2">{F.organisme}</p>
        <p className="mt-2 text-sm text-fg-2">
          {F.duree} · {F.modalite}, {F.ville}
        </p>
      </div>
    </Boite>
  )
}

function FormationOrganisme() {
  return (
    <Boite>
      <Bandeau
        couverture={F.photo}
        medaillon={
          <span className="flex size-16 items-center justify-center rounded-xl border-2 border-bg-soft bg-bg text-fg">
            <GraduationCap className="size-7" />
          </span>
        }
      />
      <div className="p-4 pt-3">
        <p className="text-sm font-medium text-fg-2">{F.organisme}</p>
        <h3 className="mt-1 text-base font-semibold leading-tight text-fg">{F.titre}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pastille teal>{F.type}</Pastille>
          <Pastille>{F.modalite}</Pastille>
          <Pastille>{F.duree}</Pastille>
        </div>
      </div>
    </Boite>
  )
}

function FormationSombre() {
  return (
    <BoiteSombre className="p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white">{F.type}</span>
        <span className="text-xs text-white/60">{F.places}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-tight text-white">{F.titre}</h3>
      <p className="mt-1 text-sm text-white/70">{F.organisme}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-white/50">Durée</p>
          <p className="text-white">{F.duree}</p>
        </div>
        <div>
          <p className="text-xs text-white/50">Session</p>
          <p className="text-white">Octobre</p>
        </div>
      </div>
    </BoiteSombre>
  )
}

function FormationTarif() {
  return (
    <Boite>
      <div className="p-4">
        <Pastille teal>{F.type}</Pastille>
        <h3 className="mt-3 text-base font-semibold leading-tight text-fg">{F.titre}</h3>
        <p className="mt-1 text-sm text-fg-2">{F.organisme}</p>
      </div>
      <Reperes
        items={[
          { icone: Clock, libelle: 'Durée', valeur: '120 h' },
          { icone: Euro, libelle: 'Tarif', valeur: '1 200 €' },
          { icone: CalendarDays, libelle: 'Rentrée', valeur: 'Octobre' },
        ]}
      />
      <div className="border-t border-line p-3">
        <Bouton plein>Demander le programme</Bouton>
      </div>
    </Boite>
  )
}

function FormationHorizontale() {
  return (
    <Boite className="flex gap-4 p-4">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-teal text-white">
        <Clock className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[.06em] text-fg-2">{F.type}</p>
        <h3 className="mt-0.5 text-base font-semibold leading-tight text-fg">{F.titre}</h3>
        <p className="mt-1 text-sm text-fg-2">
          {F.organisme} · {F.ville}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <Ligne icone={Clock}>{F.duree}</Ligne>
          <Ligne icone={CalendarDays}>{F.session}</Ligne>
        </div>
      </div>
    </Boite>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function PageCartes() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 md:px-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[.06em] text-fg-2">DentalMap · guide de style</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg">Cartes de résultats</h1>
        <p className="mt-3 max-w-2xl text-fg-2">
          Plusieurs formes de carte par public, à la largeur qu’elles auraient dans la colonne de la recherche. Les
          données sont inventées, les photos viennent des images de démonstration. Chaque forme porte un numéro, pour
          en parler simplement.
        </p>
        <nav aria-label="Sommaire" className="mt-6 flex flex-wrap gap-2">
          {SOMMAIRE.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="rounded-full border border-line px-3 py-1 text-sm text-fg hover:bg-bg-soft">
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="mt-12 space-y-16">
        <Section
          id="dentistes"
          titre="Dentistes"
          intro="Une fiche de registre : nom, spécialité ordinale, adresse, distance, vérification. Les fiches revendiquées ajoutent la photo, les horaires, les langues, l’accessibilité et le tiers payant."
        >
          <Exemple numero="D1" titre="Immersive" note="La carte actuelle de la recherche : illustration pleine carte, texte posé dessus derrière un voile. Haute, très visuelle, peu d’informations.">
            <DentisteImmersive />
          </Exemple>
          <Exemple numero="D2" titre="Portrait en tête" note="Illustration ou photo au-dessus, informations dessous. Plus lisible, la ligne horaire et la distance trouvent leur place.">
            <DentistePortrait />
          </Exemple>
          <Exemple numero="D3" titre="Portrait, fiche revendiquée" note="La même forme quand le praticien a déposé une photo : l’étiquette signale la revendication.">
            <DentistePortrait photo={D.photo} />
          </Exemple>
          <Exemple numero="D4" titre="Horizontale compacte" note="Vignette à gauche, texte à droite. Deux fois plus de résultats à l’écran, l’illustration reste présente.">
            <DentisteHorizontale />
          </Exemple>
          <Exemple numero="D5" titre="Riche, fiche revendiquée" note="Tout ce qu’une fiche complétée peut montrer, avec deux actions. La carte la plus haute, réservée aux fiches qui ont de quoi la remplir.">
            <DentisteRiche />
          </Exemple>
          <Exemple numero="D6" titre="Avec mini-plan" note="Le plan de la commune en tête, le point du cabinet dessus. Rappelle la carte sans la dupliquer.">
            <DentisteMiniPlan />
          </Exemple>
          <Exemple numero="D7" titre="Éditoriale" note="Sans image : la spécialité en surtitre teal, le nom en grand, une ligne de présentation. Une carte qui se lit.">
            <DentisteEditoriale />
          </Exemple>
          <Exemple numero="D8" titre="Bandeau et médaillon" note="Photo du cabinet en couverture, portrait en médaillon qui déborde. La forme des profils sociaux.">
            <DentisteBandeau />
          </Exemple>
          <Exemple numero="D9" titre="Grille de faits" note="En-tête compact puis quatre faits en cases : distance, horaires, langues, tiers payant. Se balaie du regard.">
            <DentisteGrilleFaits />
          </Exemple>
          <Exemple numero="D10" titre="Sombre" note="Ardoise et teal, photo ronde, deux actions. Une carte qui se distingue, à réserver aux fiches revendiquées.">
            <DentisteSombre />
          </Exemple>
          <Exemple numero="D11" titre="Ticket" note="Pictogramme, texte, puis trois repères alignés dans un bandeau bas. Toujours la même hauteur, quelle que soit la fiche.">
            <DentisteTicket />
          </Exemple>
          <Exemple numero="D12" titre="Actions rapides" note="La compacte, avec trois actions en pied : fiche, appel, itinéraire. Pour un usage mobile.">
            <DentisteActions />
          </Exemple>
          <Exemple numero="D13" titre="Mosaïque de photos" note="Trois photos du cabinet en mosaïque. Suppose plusieurs photos déposées.">
            <DentisteMosaique />
          </Exemple>
          <Exemple numero="D14" titre="Liste dense" note="Une ligne par praticien, pour les longues listes de commune. Se lit comme un annuaire, pas comme une vitrine." large>
            <DentisteDense />
          </Exemple>
          <Exemple numero="D15" titre="Liste minimale" note="Typographique : le nom en grand, une ligne dessous, la distance à droite. Aucune image, aucune pastille." large>
            <DentisteMinimale />
          </Exemple>
        </Section>

        <Section
          id="laboratoires"
          titre="Laboratoires de prothèse"
          intro="Une structure, pas une personne : raison sociale, activité Sirene, adresse. Les fiches revendiquées ajoutent les prestations, les délais, la zone de livraison et l’équipe."
        >
          <Exemple numero="L1" titre="Immersive" note="La carte actuelle : surface neutre, monogramme, aucune photo. Fonctionne mais dit peu de choses d’un laboratoire.">
            <LaboImmersive />
          </Exemple>
          <Exemple numero="L2" titre="Photo en tête" note="Photo du laboratoire, prestations en pastilles, zone de livraison. Suppose une photo déposée.">
            <LaboPhoto />
          </Exemple>
          <Exemple numero="L3" titre="Horizontale compacte" note="Pictogramme à gauche à la place d’une photo : toutes les fiches de registre ont la même forme, revendiquées ou non.">
            <LaboHorizontale />
          </Exemple>
          <Exemple numero="L4" titre="Riche, fiche revendiquée" note="Prestations, délais, livraison, équipe, et une demande de devis en action principale.">
            <LaboRiche />
          </Exemple>
          <Exemple numero="L5" titre="Catalogue" note="Les prestations en cases cochées, le délai avec. Le laboratoire dit d’abord ce qu’il fait.">
            <LaboCatalogue />
          </Exemple>
          <Exemple numero="L6" titre="Sombre" note="Photo fondue dans l’ardoise, prestations en pastilles claires.">
            <LaboSombre />
          </Exemple>
          <Exemple numero="L7" titre="Bandeau et médaillon" note="Photo en couverture, pictogramme teal en médaillon.">
            <LaboBandeau />
          </Exemple>
          <Exemple numero="L8" titre="Ticket" note="Trois repères en bandeau bas : distance, délai, équipe.">
            <LaboTicket />
          </Exemple>
          <Exemple numero="L9" titre="Liste dense" note="Une ligne par laboratoire, prestations et commune en sous-titre." large>
            <LaboDense />
          </Exemple>
        </Section>

        <Section
          id="ecoles"
          titre="Écoles de prothèse dentaire"
          intro="Un établissement, ses diplômes et leurs durées, son statut, l’alternance. Les écoles viennent du CMS, avec photo."
        >
          <Exemple numero="E1" titre="Photo en tête" note="Photo de l’établissement, diplômes en pastilles, alternance en étiquette sur la photo.">
            <EcolePhoto />
          </Exemple>
          <Exemple numero="E2" titre="Horizontale compacte" note="Pictogramme, statut et ville, diplômes sur une ligne.">
            <EcoleHorizontale />
          </Exemple>
          <Exemple numero="E3" titre="Riche" note="Chaque diplôme avec sa durée, effectif, journée portes ouvertes, deux actions.">
            <EcoleRiche />
          </Exemple>
          <Exemple numero="E4" titre="Parcours" note="Les diplômes en frise verticale, avec leur durée. Montre le chemin d’une formation à l’autre.">
            <EcoleParcours />
          </Exemple>
          <Exemple numero="E5" titre="Bandeau et médaillon" note="Photo en couverture, pictogramme en médaillon, diplômes abrégés.">
            <EcoleBandeau />
          </Exemple>
          <Exemple numero="E6" titre="Sombre" note="Ardoise, diplômes en tableau.">
            <EcoleSombre />
          </Exemple>
          <Exemple numero="E7" titre="Chiffres" note="Trois repères en bandeau bas : filières, élèves, portes ouvertes.">
            <EcoleChiffres />
          </Exemple>
          <Exemple numero="E8" titre="Liste dense" note="Une ligne par école, diplômes et ville en sous-titre." large>
            <EcoleDense />
          </Exemple>
        </Section>

        <Section
          id="formations"
          titre="Formations"
          intro="Un programme plutôt qu’un lieu : type, titre, organisme, durée, modalité, prochaine session. La photo n’est pas toujours pertinente."
        >
          <Exemple numero="F1" titre="Carte texte" note="Sans image : le type en pastille, le titre en vedette, trois lignes de repères. La forme la plus honnête pour un programme.">
            <FormationCarte />
          </Exemple>
          <Exemple numero="F2" titre="Photo en tête" note="Avec l’image du CMS quand elle existe. Plus chaleureuse, moins dense.">
            <FormationPhoto />
          </Exemple>
          <Exemple numero="F3" titre="Riche" note="Durée, modalité, public, session en grille, et deux actions.">
            <FormationRiche />
          </Exemple>
          <Exemple numero="F4" titre="Agenda" note="La date de rentrée en bloc à gauche, comme un événement. Pour les formations datées.">
            <FormationAgenda />
          </Exemple>
          <Exemple numero="F5" titre="Organisme en tête" note="L’organisme d’abord, le titre ensuite, les repères en pastilles.">
            <FormationOrganisme />
          </Exemple>
          <Exemple numero="F6" titre="Sombre" note="Ardoise, durée et session en deux colonnes.">
            <FormationSombre />
          </Exemple>
          <Exemple numero="F7" titre="Tarif et rentrée" note="Trois repères dont le tarif, et une demande de programme. Suppose un tarif communiqué.">
            <FormationTarif />
          </Exemple>
          <Exemple numero="F8" titre="Horizontale compacte" note="Pictogramme à gauche, type en surtitre, deux repères.">
            <FormationHorizontale />
          </Exemple>
          <Exemple numero="F9" titre="Liste dense" note="Une ligne par formation, type, organisme et ville en sous-titre." large>
            <FormationDense />
          </Exemple>
        </Section>
      </div>
    </main>
  )
}
