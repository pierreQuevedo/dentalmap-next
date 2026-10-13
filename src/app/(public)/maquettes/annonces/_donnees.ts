/**
 * MAQUETTE, à supprimer après arbitrage. Annonces de cession d'exemple :
 * secteurs, montants et dates inventés, plausibles, marqués comme exemples
 * à l'écran. Forme du CPT `annonce` de WordPress (type, département, date
 * d'expiration, contact : `docs/architecture-v2-nextjs-headless.md` 7.2),
 * complétée des champs que la page affiche, à créer côté WordPress.
 *
 * Confidentialité : une annonce n'a qu'un secteur approximatif (centre et
 * rayon), jamais d'adresse ni de point exact.
 */
import { empriseAutour } from '@/lib/annuaire/emprise'

export type TypeCession = 'Cabinet individuel' | 'Parts de société' | 'Patientèle' | 'Murs ou locaux'

export type Annonce = {
  id: string
  titre: string
  type: TypeCession
  secteur: string
  commune: string
  lon: number
  lat: number
  /** Rayon du secteur affiché, en mètres. */
  rayon: number
  fauteuils: number
  /** Chiffre d'affaires annuel indicatif, en milliers d'euros. */
  ca?: [number, number]
  /** Prix demandé, en milliers d'euros ; absent : « sur demande ». */
  prix?: number
  surface?: number
  dispo: string
  photo?: string
  publiee: string
  depuis: string
  expire: string
  km?: number
}

export const ANNONCES: Annonce[] = [
  {
    id: 'c1',
    titre: 'Cabinet deux fauteuils, clientèle fidèle',
    type: 'Cabinet individuel',
    secteur: 'Bordeaux rive droite',
    commune: 'Bordeaux',
    lon: -0.555,
    lat: 44.846,
    rayon: 1500,
    fauteuils: 2,
    ca: [380, 450],
    prix: 210,
    surface: 95,
    dispo: 'Janvier 2027',
    photo: '/images/demo/pexels-6627320.jpg',
    publiee: '2 octobre 2026',
    depuis: 'il y a 10 jours',
    expire: '2 janvier 2027',
    km: 1.4,
  },
  {
    id: 'c2',
    titre: 'Parts de SELARL, cabinet de groupe trois praticiens',
    type: 'Parts de société',
    secteur: 'Mérignac',
    commune: 'Mérignac',
    lon: -0.645,
    lat: 44.838,
    rayon: 2000,
    fauteuils: 4,
    ca: [900, 1100],
    dispo: 'D’ici six mois',
    photo: '/images/demo/pexels-6627447.jpg',
    publiee: '28 septembre 2026',
    depuis: 'il y a 2 semaines',
    expire: '28 décembre 2026',
    km: 5.8,
  },
  {
    id: 'c3',
    titre: 'Patientèle à reprendre, départ en retraite',
    type: 'Patientèle',
    secteur: 'Pessac',
    commune: 'Pessac',
    lon: -0.632,
    lat: 44.806,
    rayon: 2000,
    fauteuils: 1,
    ca: [220, 260],
    prix: 65,
    dispo: 'Immédiate',
    publiee: '7 octobre 2026',
    depuis: 'il y a 5 jours',
    expire: '7 janvier 2027',
    km: 6.9,
  },
  {
    id: 'c4',
    titre: 'Locaux de cabinet dentaire équipés, rez-de-chaussée',
    type: 'Murs ou locaux',
    secteur: 'Talence',
    commune: 'Talence',
    lon: -0.588,
    lat: 44.808,
    rayon: 1500,
    fauteuils: 2,
    prix: 290,
    surface: 120,
    dispo: 'Immédiate',
    photo: '/images/demo/pexels-7800669.jpg',
    publiee: '19 septembre 2026',
    depuis: 'il y a 3 semaines',
    expire: '19 décembre 2026',
    km: 4.3,
  },
  {
    id: 'c5',
    titre: 'Cabinet trois fauteuils avec cone beam',
    type: 'Cabinet individuel',
    secteur: 'Libourne',
    commune: 'Libourne',
    lon: -0.243,
    lat: 44.915,
    rayon: 3000,
    fauteuils: 3,
    ca: [520, 600],
    dispo: 'Mi-2027',
    publiee: '11 octobre 2026',
    depuis: 'hier',
    expire: '11 janvier 2027',
    km: 29.1,
  },
  {
    id: 'c6',
    titre: 'Cabinet un fauteuil en centre-bourg',
    type: 'Cabinet individuel',
    secteur: 'Bassin d’Arcachon',
    commune: 'Arcachon',
    lon: -1.15,
    lat: 44.655,
    rayon: 4000,
    fauteuils: 1,
    ca: [260, 300],
    prix: 120,
    surface: 70,
    dispo: 'D’ici six mois',
    photo: '/images/demo/pexels-3881296.jpg',
    publiee: '25 septembre 2026',
    depuis: 'il y a 17 jours',
    expire: '25 décembre 2026',
    km: 52.3,
  },
]

export const EMPRISE_GIRONDE_ANNONCES = empriseAutour(-0.62, 44.79, 32000)

export const TYPES: TypeCession[] = ['Cabinet individuel', 'Parts de société', 'Patientèle', 'Murs ou locaux']

/** « 210 000 € », ou « Sur demande ». */
export const prix = (a: Annonce) => (a.prix ? `${(a.prix * 1000).toLocaleString('fr-FR')} €` : 'Sur demande')
export const ca = (a: Annonce) => (a.ca ? `${a.ca[0].toLocaleString('fr-FR')} à ${a.ca[1].toLocaleString('fr-FR')} k€` : 'non communiqué')
export const etiquettePrix = (a: Annonce) => (a.prix ? `${a.prix.toLocaleString('fr-FR')} k€` : 'Sur demande')
export const km = (n: number) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`

/** La page de détail d'exemple. */
export const DETAIL = {
  a: ANNONCES[0]!,
  reference: 'CES-2026-0142',
  resume: 'Cabinet de deux fauteuils en rez-de-chaussée, à proximité du tram. Patientèle familiale fidèle, agenda complet à trois semaines.',
  equipements: ['Deux fauteuils récents', 'Radiographie panoramique', 'Caméra intra-orale', 'Autoclave et salle de stérilisation', 'Logiciel de gestion et dossiers numérisés'],
  conditions: ['Accompagnement du repreneur pendant trois mois', 'Présentation à la patientèle', 'Reprise possible de l’assistante dentaire', 'Bail commercial transférable'],
  locaux: ['95 m², rez-de-chaussée', 'Accessible aux personnes à mobilité réduite', 'Salle d’attente, deux salles de soins, bureau'],
  proches: [ANNONCES[3]!, ANNONCES[1]!, ANNONCES[2]!],
}
