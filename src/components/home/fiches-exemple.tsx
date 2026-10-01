'use client'

import Image from 'next/image'
import { Award, MapPin } from 'lucide-react'
import { CarteFiche } from '@/components/recherche/carte-fiche'
import type { PraticienProche } from '@/lib/annuaire/queries'

/**
 * Les fiches d'exemple du hero, dans le dessin retenu pour la recherche.
 *
 * Ce sont les cartes de résultats elles-mêmes, la carte immersive pour le
 * dentiste, la carte à image en tête pour le laboratoire, et leur cousine
 * pour l'école, avec des données inventées : ce qu'un visiteur verra dans
 * l'annuaire, montré avant tout texte. Elles sont rendues à l'échelle réduite
 * par le décor, et hors de portée du clavier comme du curseur.
 */
const rien = () => {}

const DENTISTE: PraticienProche = {
  slug: 'exemple-camille-riviere',
  lieuId: 'exemple',
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

const LABORATOIRE: PraticienProche = {
  ...DENTISTE,
  slug: 'exemple-artemis',
  civilite: null,
  nom: 'ARTEMIS DENTAIRE',
  prenom: null,
  raisonSociale: 'LABORATOIRE ARTEMIS DENTAIRE',
  adresseLigne: '8 AVENUE DE LA SOMME',
  codePostal: '33700',
  revendiquee: true,
  communeNom: 'Mérignac',
  communeSlug: 'merignac',
  metres: 4800,
}

export function FicheDentisteExemple() {
  return (
    <ol className="[&>li]:shadow-pop">
      <CarteFiche praticien={DENTISTE} base="dentistes" profession="dentiste" actif={false} onSurvol={rien} />
    </ol>
  )
}

export function FicheLaboratoireExemple() {
  return (
    <ol className="[&>li]:shadow-pop">
      <CarteFiche
        praticien={LABORATOIRE}
        base="prothesistes"
        profession="prothesiste"
        photo="/images/demo/pexels-8413334.jpg"
        actif={false}
        onSurvol={rien}
      />
    </ol>
  )
}

/** L'école, dans la forme retenue pour les formations : photo en tête et diplômes en lignes, avec leur durée. */
export function FicheEcoleExemple() {
  return (
    <div className="squircle-2xl relative overflow-hidden border border-line bg-bg-soft shadow-pop">
      <div className="relative aspect-[16/9]">
        <Image src="/images/demo/pexels-3881296.jpg" alt="" fill sizes="22rem" className="object-cover dark:brightness-[0.42]" />
        <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-2 py-0.5 text-xs font-medium text-fg backdrop-blur">
          École de prothèse
        </span>
      </div>
      <div className="p-4 pb-3">
        <h2 className="text-base font-semibold leading-tight text-fg">École de prothèse dentaire de Bordeaux</h2>
        <p className="mt-1.5 text-sm text-fg-2">Établissement privé sous contrat, alternance possible.</p>
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {[
          ['Bac pro prothèse dentaire', '3 ans'],
          ['BTMS prothésiste dentaire', '2 ans'],
          ['BTS prothésiste dentaire', '2 ans'],
        ].map(([nom, duree]) => (
          <li key={nom} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
            <span className="inline-flex items-center gap-2 text-fg">
              <Award className="size-4 shrink-0 text-teal" /> {nom}
            </span>
            <span className="shrink-0 text-fg-2">{duree}</span>
          </li>
        ))}
      </ul>
      <p className="inline-flex items-center gap-1.5 border-t border-line px-4 py-3 text-sm text-fg-2">
        <MapPin className="size-3.5" /> Talence · 6,1 km
      </p>
    </div>
  )
}
