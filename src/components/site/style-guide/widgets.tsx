'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { BouncyToggle } from '@/components/matos-ui/bouncy-toggle'
import { Coachmark } from '@/components/matos-ui/coachmark'
import { Cursor } from '@/components/motion-primitives/cursor'
import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from '@/components/motion-primitives/disclosure'
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur'
import { ScrollProgress } from '@/components/motion-primitives/scroll-progress'
import { Spotlight } from '@/components/motion-primitives/spotlight'
import { ApercuFiche } from '@/components/annuaire/apercu-fiche'
import { Verification } from '@/components/annuaire/primitives'
import type { PraticienResume } from '@/lib/annuaire/types'

/**
 * Bancs d'essai des composants animés, montrés sur des cas réels de DentalMap
 * plutôt que sur des carrés de couleur : une animation ne se juge pas dans le
 * vide, elle se juge sur le contenu qu'elle va porter.
 *
 * Les photos viennent de Pexels, licence libre, et ne servent qu'ici : aucune
 * fiche de l'annuaire n'a de photo, et une photo d'illustration sur une fiche
 * laisserait croire qu'elle montre le cabinet.
 */
const PHOTO = {
  fauteuil: '/images/demo/pexels-6627447.jpg',
  equipe: '/images/demo/pexels-3881296.jpg',
  explication: '/images/demo/pexels-6627320.jpg',
  radio: '/images/demo/pexels-6627471.jpg',
  cabinet: '/images/demo/pexels-7800669.jpg',
  praticien: '/images/demo/pexels-6627325.jpg',
}

export function Banc({
  titre,
  source,
  usage,
  children,
}: {
  titre: string
  /** « bibliothèque / composant », sert aussi de repère aux contrôles visuels. */
  source: string
  usage: string
  children: React.ReactNode
}) {
  const repere = source.split('/').pop()?.trim()
  // Description à gauche, banc à droite : en pleine largeur les démonstrations
  // laissaient la moitié droite vide et la page paraissait deux fois plus longue.
  return (
    <div
      data-banc={repere}
      className="grid gap-5 rounded-2xl border border-line p-5 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-8"
    >
      <div>
        <h3 className="text-sm font-semibold text-fg">{titre}</h3>
        <p className="mt-1 font-mono text-xs text-fg-2">{source}</p>
        <p className="mt-3 text-sm text-fg-2">{usage}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

/** Disclosure : une fiche qui garde ses détails repliés. */
export function FicheDepliante() {
  const [ouverte, setOuverte] = useState(false)
  return (
    <div className="max-w-md overflow-hidden rounded-2xl border border-line bg-bg">
      <div className="relative h-40">
        <Image src={PHOTO.praticien} alt="" fill sizes="448px" className="object-cover" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-fg">Dr Adrien Abballe</p>
            <p className="text-sm text-fg-2">128 rue Fondaudège, 33000 Bordeaux</p>
          </div>
          <Verification statut="verifie" />
        </div>

        <Disclosure open={ouverte} onOpenChange={setOuverte} className="mt-4">
          <DisclosureTrigger>
            <button
              type="button"
              className="text-sm font-semibold text-fg underline underline-offset-4"
            >
              {ouverte ? 'Replier' : 'Voir le détail'}
            </button>
          </DisclosureTrigger>
          <DisclosureContent>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-line py-1.5">
                <dt className="text-fg-2">Identifiant RPPS</dt>
                <dd className="tabular-nums text-fg">10 003 456 789</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line py-1.5">
                <dt className="text-fg-2">Conventionnement</dt>
                <dd className="text-fg">Secteur 1</dd>
              </div>
              <div className="flex justify-between gap-4 py-1.5">
                <dt className="text-fg-2">Dernière confrontation</dt>
                <dd className="text-fg">12 septembre 2026</dd>
              </div>
            </dl>
          </DisclosureContent>
        </Disclosure>
      </div>
    </div>
  )
}

/** Cursor : le curseur ne change que dans la zone, jamais sur toute la page. */
export function CurseurSurvol() {
  return (
    <div className="relative h-56 max-w-md overflow-hidden rounded-2xl border border-line">
      <Image src={PHOTO.fauteuil} alt="" fill sizes="448px" className="object-cover" />
      <Cursor
        attachToParent
        variants={{
          initial: { opacity: 0, scale: 0.4 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.4 },
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      >
        <span className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground shadow-pill">
          Voir la fiche
        </span>
      </Cursor>
    </div>
  )
}

/** ScrollProgress : barre de lecture d'un article, ici bornée au conteneur. */
export function ProgressionLecture() {
  const conteneur = useRef<HTMLDivElement>(null)
  return (
    <div className="max-w-xl overflow-hidden rounded-2xl border border-line">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 z-10 h-1 bg-line">
          <ScrollProgress
            containerRef={conteneur}
            className="h-1 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-4"
          />
        </div>
        <div ref={conteneur} className="h-64 overflow-y-auto p-6">
          <h4 className="text-fg">Comment choisir son chirurgien-dentiste</h4>
          <p className="mt-3 text-sm text-fg-2">
            La proximité reste le premier critère, mais elle ne dit rien de la pratique. Trois
            éléments se vérifient avant le premier rendez-vous.
          </p>
          <p className="mt-3 text-sm text-fg-2">
            L’inscription au tableau de l’Ordre, d’abord. Elle conditionne le droit d’exercer, et
            c’est elle que DentalMap confronte au répertoire partagé des professionnels de santé.
          </p>
          <p className="mt-3 text-sm text-fg-2">
            Le secteur de conventionnement ensuite, qui détermine ce qui reste à votre charge. Un
            praticien en secteur 1 applique les tarifs de la Sécurité sociale.
          </p>
          <p className="mt-3 text-sm text-fg-2">
            L’accessibilité enfin : étage, ascenseur, place de stationnement. Ces informations ne
            figurent dans aucun registre, elles viennent du praticien lui-même.
          </p>
          <p className="mt-3 text-sm text-fg-2">
            Rien de tout cela ne se paie sur DentalMap. Le classement suit la distance, puis
            l’ordre alphabétique, et la place ne s’achète pas.
          </p>
        </div>
      </div>
    </div>
  )
}

/** Spotlight : le halo suit le curseur, le parent passe en relatif tout seul. */
export function CarteHalo() {
  return (
    <div className="max-w-md rounded-2xl border border-line bg-bg-soft p-6">
      <Spotlight className="bg-brand/20 blur-2xl" size={220} />
      <p className="text-xs font-semibold uppercase tracking-[.06em] text-fg-2">Espace professionnel</p>
      <p className="mt-2 text-lg font-semibold text-fg">Revendiquez votre fiche</p>
      <p className="mt-2 text-sm text-fg-2">
        Complétez les informations qu’aucun registre ne contient : horaires, accès, langues parlées.
      </p>
      <span className="mt-4 inline-block rounded-full bg-action px-4 py-2 text-sm font-semibold text-action-foreground">
        Commencer
      </span>
    </div>
  )
}

/** ProgressiveBlur : le flou ne monte que sous la légende, l’image reste nette. */
export function PhotoLegendee() {
  return (
    <div className="relative h-56 max-w-md overflow-hidden rounded-2xl border border-line">
      <Image src={PHOTO.equipe} alt="" fill sizes="448px" className="object-cover" />
      <ProgressiveBlur className="pointer-events-none absolute inset-x-0 bottom-0 h-24" blurIntensity={1.2} />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-sm font-semibold text-white drop-shadow">Cabinet dentaire, Bordeaux</p>
        <p className="text-xs text-white/85 drop-shadow">Photo d’illustration, Pexels</p>
      </div>
    </div>
  )
}

/** BouncyToggle : un filtre de liste, pas un réglage décoratif. */
export function FiltreVerifie() {
  const [verifiesSeuls, setVerifiesSeuls] = useState(true)
  return (
    <div className="max-w-md space-y-4">
      <label className="flex items-center justify-between gap-4 rounded-2xl border border-line p-4">
        <span>
          <span className="block text-sm font-medium text-fg">Fiches vérifiées uniquement</span>
          <span className="block text-sm text-fg-2">Confrontées au RPPS ou à Sirene</span>
        </span>
        <BouncyToggle checked={verifiesSeuls} onCheckedChange={setVerifiesSeuls} size="lg" />
      </label>
      <p className="text-sm text-fg-2">
        <span className="tabular-nums font-semibold text-fg">
          {verifiesSeuls ? '445' : '512'}
        </span>{' '}
        chirurgiens-dentistes à Bordeaux
      </p>
    </div>
  )
}

/** Coachmark : la visite de l’espace pro, jouée sur une maquette réduite. */
export function VisiteGuidee() {
  const [ouverte, setOuverte] = useState(false)
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div id="sg-visite-fiche" className="rounded-2xl border border-line p-4">
          <p className="text-sm font-semibold text-fg">Ma fiche</p>
          <p className="mt-1 text-xs text-fg-2">Horaires, accès, langues</p>
        </div>
        <div id="sg-visite-verif" className="rounded-2xl border border-line p-4">
          <p className="text-sm font-semibold text-fg">Vérification</p>
          <p className="mt-1 text-xs text-fg-2">Statut au RPPS</p>
        </div>
        <div id="sg-visite-annonces" className="rounded-2xl border border-line p-4">
          <p className="text-sm font-semibold text-fg">Annonces</p>
          <p className="mt-1 text-xs text-fg-2">Cession, collaboration</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOuverte(true)}
        className="mt-4 rounded-full bg-action px-4 py-2 text-sm font-semibold text-action-foreground hover:bg-action-hover"
      >
        Lancer la visite
      </button>

      <Coachmark
        open={ouverte}
        onOpenChange={setOuverte}
        labels={{ back: 'Retour', next: 'Suivant', done: 'Terminer', skip: 'Passer', of: 'sur' }}
        steps={[
          {
            target: '#sg-visite-fiche',
            title: 'Votre fiche',
            description:
              'Les informations issues des registres sont en lecture seule. Vous complétez le reste.',
          },
          {
            target: '#sg-visite-verif',
            title: 'La vérification',
            description:
              'Elle est rejouée chaque semaine. Un praticien radié sort de l’annuaire sans intervention.',
          },
          {
            target: '#sg-visite-annonces',
            title: 'Vos annonces',
            description: 'Cession, collaboration, remplacement, emploi. Réservé aux comptes validés.',
          },
        ]}
      />
    </div>
  )
}

/**
 * Aperçu de fiche : le composant est celui de l'annuaire, pas une maquette.
 * Les données ci-dessous ont la forme exacte que renvoient déjà
 * `getPraticiensDeCommune` et `getPraticiensProches`.
 */
const EXEMPLES: PraticienResume[] = [
  {
    slug: 'dr-adrien-abballe-4240',
    nom: 'ABBALLE',
    prenom: 'ADRIEN',
    raisonSociale: null,
    statutVerification: 'verifie',
    adresseLigne: '128 RUE FONDAUDEGE',
    codePostal: '33000',
    telephone: '05 56 81 11 11',
    communeNom: 'Bordeaux',
    communeSlug: 'bordeaux',
    departementSlug: 'gironde',
    lon: null,
    lat: null,
  },
  {
    slug: 'dr-lina-abdeddaim-1180',
    nom: 'ABDEDDAIM',
    prenom: 'LINA',
    raisonSociale: null,
    statutVerification: 'partiel',
    adresseLigne: '158 COURS DE LA MARNE',
    codePostal: '33800',
    telephone: null,
    communeNom: 'Bordeaux',
    communeSlug: 'bordeaux',
    departementSlug: 'gironde',
    lon: null,
    lat: null,
  },
]

export function ApercuDeFiche() {
  return (
    <div className="max-w-md space-y-3">
      <ApercuFiche praticien={EXEMPLES[0]} profession="dentiste" distance={510} />
      <ApercuFiche praticien={EXEMPLES[1]} profession="dentiste" distance={784} />
      <p className="text-xs text-fg-2">
        Sans photo, comme sur l’annuaire : les initiales tiennent lieu de portrait. Le composant
        accepte une image quand il y en a une, par exemple pour un laboratoire qui a fourni la
        sienne.
      </p>
      <ApercuFiche
        praticien={{ ...EXEMPLES[0], slug: 'labo-demo', nom: 'CERAMIQUE DENTAIRE DU PORT', prenom: null, raisonSociale: 'CERAMIQUE DENTAIRE DU PORT' }}
        profession="prothesiste"
        image={PHOTO.explication}
      />
    </div>
  )
}
