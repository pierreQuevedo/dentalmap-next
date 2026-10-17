/**
 * MAQUETTE, à supprimer une fois les pages Emploi codées. Données d'exemple :
 * structures et personnes inventées, Bordeaux et Gironde pour les pages
 * locales, quelques grandes villes pour les pages nationales. Les distances
 * sont mesurées depuis le centre de la commune de la page.
 *
 * Indexation : une page commune sans offre (`liste-vide`) est servie en 200
 * avec `robots: noindex, follow`, comme les pages commune vides de l'annuaire.
 */
import { empriseAutour } from '@/lib/annuaire/emprise'

export type Contrat = 'CDI' | 'CDD' | 'Alternance' | 'Stage' | 'Remplacement' | 'Collaboration'

/**
 * Rémunération.
 * - Contrats salariés et alternance : `min` et `max` sont la fourchette brute mensuelle.
 * - Remplacement : rétrocession d'honoraires en pourcentage (`taux`).
 * - Collaboration libérale : redevance versée au cabinet en pourcentage (`taux`).
 *   Pour ces deux modes, `min` et `max` sont une estimation mensuelle indicative,
 *   toujours libellée « estimation ».
 * - Stage : gratification, `min` et `max` à zéro.
 */
export type Mode = 'salaire' | 'retrocession' | 'redevance' | 'gratification'

export type Offre = {
  id: string
  slug: string
  titre: string
  metier: string
  contrat: Contrat
  duree?: string
  temps: string
  debut: string
  mode?: Mode
  taux?: number
  min: number
  max: number
  recruteur: string
  type: 'cabinet' | 'laboratoire' | 'centre'
  adresse: string
  cp: string
  commune: string
  lon: number
  lat: number
  /** Distance au centre de la commune de la page ; absente sur les pages nationales. */
  km?: number
  trajet?: string
  publiee: string
  depuis: string
  /** Photo déposée par le recruteur. Absente : fond neutre avec monogramme. */
  photo?: string
}

const PHOTOS = {
  a: '/images/demo/pexels-6627320.jpg',
  b: '/images/demo/pexels-6627447.jpg',
  c: '/images/demo/pexels-6627471.jpg',
  d: '/images/demo/pexels-8413334.jpg',
  e: '/images/demo/pexels-3881296.jpg',
  f: '/images/demo/pexels-7800669.jpg',
  g: '/images/demo/pexels-6627325.jpg',
  h: '/images/demo/pexels-19879741.jpg',
}

export const OFFRE: Offre = {
  id: 'o1',
  slug: 'assistant-dentaire-qualifie-cdi-bordeaux-cabinet-sainte-catherine',
  titre: 'Assistant(e) dentaire qualifié(e)',
  metier: 'Assistant(e) dentaire',
  contrat: 'CDI',
  temps: 'Temps plein, 35 h',
  debut: '3 novembre 2026',
  min: 2100,
  max: 2400,
  recruteur: 'Cabinet Sainte-Catherine',
  type: 'cabinet',
  adresse: '12 rue Sainte-Catherine',
  cp: '33000',
  commune: 'Bordeaux',
  lon: -0.5737,
  lat: 44.8398,
  km: 0.5,
  trajet: '7 min à pied',
  publiee: '6 octobre 2026',
  depuis: 'il y a 6 jours',
  photo: PHOTOS.b,
}

const O7: Offre = {
  id: 'o7', slug: 'assistant-dentaire-cdd-bordeaux-bastide', titre: 'Assistant(e) dentaire', metier: 'Assistant(e) dentaire',
  contrat: 'CDD', duree: '12 mois', temps: 'Temps plein, 35 h', debut: 'Dès que possible', min: 2000, max: 2200,
  recruteur: 'Cabinet Dr Sophie Bernard', type: 'cabinet', adresse: '27 avenue Thiers', cp: '33100', commune: 'Bordeaux',
  lon: -0.5585, lat: 44.8418, km: 1.6, trajet: '9 min en tram', publiee: '9 octobre 2026', depuis: 'il y a 3 jours',
}
const O11: Offre = {
  id: 'o11', slug: 'assistant-dentaire-chirurgie-implantaire-bordeaux', titre: 'Assistant(e) dentaire, chirurgie implantaire', metier: 'Assistant(e) dentaire',
  contrat: 'CDI', temps: 'Temps plein, 35 h', debut: '1er décembre 2026', min: 2200, max: 2600,
  recruteur: 'Cabinet Drs Perrin et Caron', type: 'cabinet', adresse: '48 cours Portal', cp: '33000', commune: 'Bordeaux',
  lon: -0.5713, lat: 44.8545, km: 1.9, trajet: '11 min en tram', publiee: '8 octobre 2026', depuis: 'il y a 4 jours', photo: PHOTOS.h,
}
const O13: Offre = {
  id: 'o13', slug: 'assistant-dentaire-pedodontie-bordeaux', titre: 'Assistant(e) dentaire, pédodontie', metier: 'Assistant(e) dentaire',
  contrat: 'CDI', temps: 'Temps plein, 35 h', debut: '5 janvier 2027', min: 2100, max: 2350,
  recruteur: 'Cabinet Dr Inès Lambert', type: 'cabinet', adresse: '5 rue de Benauge', cp: '33100', commune: 'Bordeaux',
  lon: -0.55, lat: 44.838, km: 2.4, trajet: '12 min en tram', publiee: '5 octobre 2026', depuis: 'il y a 1 semaine',
}
const O10: Offre = {
  id: 'o10', slug: 'assistant-dentaire-bordeaux-saint-augustin', titre: 'Assistant(e) dentaire', metier: 'Assistant(e) dentaire',
  contrat: 'CDI', temps: 'Temps plein, 35 h', debut: 'Dès que possible', min: 2050, max: 2300,
  recruteur: 'Cabinet Dr Léa Fontaine', type: 'cabinet', adresse: '31 rue de la Pelouse de Douet', cp: '33000', commune: 'Bordeaux',
  lon: -0.605, lat: 44.834, km: 2.8, trajet: '14 min en bus', publiee: '1er octobre 2026', depuis: 'il y a 11 jours', photo: PHOTOS.c,
}
const O12: Offre = {
  id: 'o12', slug: 'assistant-dentaire-debutant-bordeaux-cauderan', titre: 'Assistant(e) dentaire, débutant(e) accepté(e)', metier: 'Assistant(e) dentaire',
  contrat: 'CDD', duree: '6 mois', temps: 'Temps partiel, 30 h', debut: '17 novembre 2026', min: 1700, max: 1850,
  recruteur: 'Cabinet Dr Nicolas Robin', type: 'cabinet', adresse: '6 avenue du Général Leclerc', cp: '33200', commune: 'Bordeaux',
  lon: -0.623, lat: 44.85, km: 3.9, trajet: '19 min en bus', publiee: '30 septembre 2026', depuis: 'il y a 12 jours',
}
const O8: Offre = {
  id: 'o8', slug: 'assistant-dentaire-orthodontie-le-bouscat', titre: 'Assistant(e) dentaire en orthodontie', metier: 'Assistant(e) dentaire',
  contrat: 'CDI', temps: 'Temps plein, 35 h', debut: '5 janvier 2027', min: 2150, max: 2450,
  recruteur: 'Cabinet d’orthodontie Dr Hugo Fabre', type: 'cabinet', adresse: '102 avenue de la Libération', cp: '33110', commune: 'Le Bouscat',
  lon: -0.601, lat: 44.865, km: 3.4, trajet: '16 min en bus', publiee: '4 octobre 2026', depuis: 'il y a 1 semaine', photo: PHOTOS.d,
}
const O9: Offre = {
  id: 'o9', slug: 'assistant-dentaire-merignac', titre: 'Assistant(e) dentaire qualifié(e)', metier: 'Assistant(e) dentaire',
  contrat: 'CDI', temps: 'Temps partiel, 32 h', debut: '1er décembre 2026', min: 1950, max: 2250,
  recruteur: 'Cabinet Dr Julien Marchand', type: 'cabinet', adresse: '14 avenue de l’Yser', cp: '33700', commune: 'Mérignac',
  lon: -0.639, lat: 44.843, km: 6.2, trajet: '24 min en tram', publiee: '2 octobre 2026', depuis: 'il y a 10 jours',
}
const O3: Offre = {
  id: 'o3', slug: 'secretaire-assistant-gestion-bordeaux-chartrons', titre: 'Secrétaire et assistant(e) de gestion', metier: 'Secrétaire ou assistant(e) de gestion',
  contrat: 'CDI', temps: 'Temps partiel, 24 h', debut: '1er décembre 2026', min: 1350, max: 1500,
  recruteur: 'Cabinet Drs Perrin et Caron', type: 'cabinet', adresse: '48 cours Portal', cp: '33000', commune: 'Bordeaux',
  lon: -0.5713, lat: 44.8545, km: 1.9, trajet: '11 min en tram', publiee: '8 octobre 2026', depuis: 'il y a 4 jours', photo: PHOTOS.h,
}
const O6: Offre = {
  id: 'o6', slug: 'aide-dentaire-begles', titre: 'Aide dentaire', metier: 'Aide dentaire',
  contrat: 'CDI', temps: 'Temps partiel, 28 h', debut: '17 novembre 2026', min: 1450, max: 1600,
  recruteur: 'Cabinet Drs Vidal et Garnier', type: 'cabinet', adresse: '9 rue Calixte Camelle', cp: '33130', commune: 'Bègles',
  lon: -0.548, lat: 44.808, km: 4.1, trajet: '18 min en tram', publiee: '7 octobre 2026', depuis: 'il y a 5 jours',
}
const O2: Offre = {
  id: 'o2', slug: 'prothesiste-dentaire-ceramiste-merignac', titre: 'Prothésiste dentaire céramiste', metier: 'Prothésiste dentaire',
  contrat: 'CDI', temps: 'Temps plein, 35 h', debut: '5 janvier 2027', min: 2300, max: 2800,
  recruteur: 'Laboratoire Artemis Dentaire', type: 'laboratoire', adresse: '8 avenue de la Somme', cp: '33700', commune: 'Mérignac',
  lon: -0.6436, lat: 44.8386, km: 6.9, trajet: '27 min en tram', publiee: '10 octobre 2026', depuis: 'il y a 2 jours', photo: PHOTOS.g,
}

/* Remplacements et collaborations de chirurgiens-dentistes. */
export const R1: Offre = {
  id: 'r1', slug: 'remplacement-chirurgien-dentiste-pessac-decembre', titre: 'Remplacement de chirurgien-dentiste', metier: 'Chirurgien-dentiste',
  contrat: 'Remplacement', duree: '3 semaines', temps: '4 jours par semaine', debut: '1er décembre 2026',
  mode: 'retrocession', taux: 40, min: 7000, max: 9000,
  recruteur: 'Cabinet Dr Antoine Leroy', type: 'cabinet', adresse: '18 avenue Jean Jaurès', cp: '33600', commune: 'Pessac',
  lon: -0.631, lat: 44.806, km: 7.0, trajet: '22 min en tram', publiee: '9 octobre 2026', depuis: 'il y a 3 jours', photo: PHOTOS.f,
}
const R2: Offre = {
  id: 'r2', slug: 'collaboration-liberale-begles', titre: 'Collaboration libérale', metier: 'Chirurgien-dentiste',
  contrat: 'Collaboration', temps: '4 jours par semaine', debut: '5 janvier 2027',
  mode: 'redevance', taux: 35, min: 9000, max: 12000,
  recruteur: 'Cabinet Drs Vidal et Garnier', type: 'cabinet', adresse: '9 rue Calixte Camelle', cp: '33130', commune: 'Bègles',
  lon: -0.548, lat: 44.808, km: 4.1, trajet: '18 min en tram', publiee: '6 octobre 2026', depuis: 'il y a 6 jours',
}
const R3: Offre = {
  id: 'r3', slug: 'remplacement-conge-maternite-bordeaux', titre: 'Remplacement pendant un congé maternité', metier: 'Chirurgien-dentiste',
  contrat: 'Remplacement', duree: '4 mois', temps: 'Temps plein', debut: '1er février 2027',
  mode: 'retrocession', taux: 45, min: 8000, max: 10000,
  recruteur: 'Cabinet Dr Inès Lambert', type: 'cabinet', adresse: '5 rue de Benauge', cp: '33100', commune: 'Bordeaux',
  lon: -0.55, lat: 44.838, km: 2.4, trajet: '12 min en tram', publiee: '3 octobre 2026', depuis: 'il y a 9 jours', photo: PHOTOS.a,
}
const R4: Offre = {
  id: 'r4', slug: 'chirurgien-dentiste-salarie-centre-de-sante-merignac', titre: 'Chirurgien-dentiste salarié(e)', metier: 'Chirurgien-dentiste',
  contrat: 'CDI', temps: 'Temps plein, 35 h', debut: '1er décembre 2026', min: 5500, max: 6500,
  recruteur: 'Centre de santé dentaire Les Tilleuls', type: 'centre', adresse: '40 avenue de la Marne', cp: '33700', commune: 'Mérignac',
  lon: -0.636, lat: 44.84, km: 5.8, trajet: '23 min en tram', publiee: '2 octobre 2026', depuis: 'il y a 10 jours',
}
const R5: Offre = {
  id: 'r5', slug: 'remplacement-ponctuel-merignac-fevrier', titre: 'Remplacement ponctuel', metier: 'Chirurgien-dentiste',
  contrat: 'Remplacement', duree: '2 semaines', temps: '5 jours par semaine', debut: '15 février 2027',
  mode: 'retrocession', taux: 40, min: 6500, max: 8000,
  recruteur: 'Cabinet Dr Julien Marchand', type: 'cabinet', adresse: '14 avenue de l’Yser', cp: '33700', commune: 'Mérignac',
  lon: -0.639, lat: 44.843, km: 6.2, trajet: '24 min en tram', publiee: '28 septembre 2026', depuis: 'il y a 2 semaines',
}
export const REMPLACEMENTS: Offre[] = [R3, R2, R4, R5, R1].sort((a, b) => (a.km ?? 0) - (b.km ?? 0))

/* Alternance et stages. */
const A1: Offre = {
  id: 'a1', slug: 'assistant-dentaire-alternance-bordeaux', titre: 'Assistant(e) dentaire en alternance', metier: 'Assistant(e) dentaire',
  contrat: 'Alternance', duree: '18 mois', temps: 'Rythme école et cabinet', debut: '5 janvier 2027', min: 1100, max: 1350,
  recruteur: 'Cabinet Dr Sophie Bernard', type: 'cabinet', adresse: '27 avenue Thiers', cp: '33100', commune: 'Bordeaux',
  lon: -0.5585, lat: 44.8418, km: 1.6, trajet: '9 min en tram', publiee: '8 octobre 2026', depuis: 'il y a 4 jours',
}
const A2: Offre = {
  id: 'a2', slug: 'prothesiste-alternance-btms-merignac', titre: 'Prothésiste dentaire en alternance, BTMS', metier: 'Prothésiste dentaire',
  contrat: 'Alternance', duree: '2 ans', temps: 'Rythme école et laboratoire', debut: '1er septembre 2027', min: 1200, max: 1450,
  recruteur: 'Laboratoire Artemis Dentaire', type: 'laboratoire', adresse: '8 avenue de la Somme', cp: '33700', commune: 'Mérignac',
  lon: -0.6436, lat: 44.8386, km: 6.9, trajet: '27 min en tram', publiee: '10 octobre 2026', depuis: 'il y a 2 jours', photo: PHOTOS.g,
}
const A3: Offre = {
  id: 'a3', slug: 'secretaire-alternance-talence', titre: 'Assistant(e) de gestion en alternance', metier: 'Secrétaire ou assistant(e) de gestion',
  contrat: 'Alternance', duree: '12 mois', temps: 'Rythme école et cabinet', debut: '5 janvier 2027', min: 1050, max: 1250,
  recruteur: 'Cabinet Dr Claire Morel', type: 'cabinet', adresse: '15 cours de la Libération', cp: '33400', commune: 'Talence',
  lon: -0.5895, lat: 44.8075, km: 4.0, trajet: '15 min en tram', publiee: '5 octobre 2026', depuis: 'il y a 1 semaine', photo: PHOTOS.c,
}
const S1: Offre = {
  id: 's1', slug: 'stage-assistant-dentaire-bordeaux', titre: 'Stage d’assistant(e) dentaire', metier: 'Assistant(e) dentaire',
  contrat: 'Stage', duree: '6 semaines', temps: 'Temps plein', debut: '2 mars 2027', mode: 'gratification', min: 0, max: 0,
  recruteur: 'Cabinet Sainte-Catherine', type: 'cabinet', adresse: '12 rue Sainte-Catherine', cp: '33000', commune: 'Bordeaux',
  lon: -0.5737, lat: 44.8398, km: 0.5, trajet: '7 min à pied', publiee: '7 octobre 2026', depuis: 'il y a 5 jours', photo: PHOTOS.b,
}
export const ALTERNANCES: Offre[] = [S1, A1, A3, A2]

/** Offres de la page « offre » : voisines, par distance au cabinet. */
export const OFFRES_PROCHES: Offre[] = [O7, O11, O13]
export const OFFRES_PROCHES_REMP: Offre[] = [R2, R3, R4]

/** Offres récentes, toutes régions, pour l'accueil et la page métier. Par date de publication. */
export const OFFRES_NATIONAL: Offre[] = [
  { ...O2, km: undefined },
  {
    id: 'n1', slug: 'assistant-dentaire-lyon-7', titre: 'Assistant(e) dentaire qualifié(e)', metier: 'Assistant(e) dentaire', contrat: 'CDI',
    temps: 'Temps plein, 35 h', debut: 'Dès que possible', min: 2150, max: 2450, recruteur: 'Cabinet Dr Mathieu Garcia', type: 'cabinet',
    adresse: '', cp: '69007', commune: 'Lyon', lon: 0, lat: 0, publiee: '10 octobre 2026', depuis: 'il y a 2 jours', photo: PHOTOS.e,
  },
  { ...R1, km: undefined },
  {
    id: 'n2', slug: 'secretaire-centre-de-sante-nantes', titre: 'Secrétaire de centre de santé dentaire', metier: 'Secrétaire ou assistant(e) de gestion', contrat: 'CDI',
    temps: 'Temps plein, 35 h', debut: '1er décembre 2026', min: 1950, max: 2150, recruteur: 'Centre de santé dentaire Les Cèdres', type: 'centre',
    adresse: '', cp: '44000', commune: 'Nantes', lon: 0, lat: 0, publiee: '9 octobre 2026', depuis: 'il y a 3 jours',
  },
  { ...O7, km: undefined },
  {
    id: 'n3', slug: 'aide-dentaire-lille', titre: 'Aide dentaire', metier: 'Aide dentaire', contrat: 'CDD', duree: '6 mois',
    temps: 'Temps partiel, 28 h', debut: '17 novembre 2026', min: 1450, max: 1550, recruteur: 'Cabinet Drs Lefèvre et Martin', type: 'cabinet',
    adresse: '', cp: '59000', commune: 'Lille', lon: 0, lat: 0, publiee: '8 octobre 2026', depuis: 'il y a 4 jours',
  },
  { ...A1, km: undefined },
  { ...OFFRE, km: undefined },
]

/** Offres de la page « assistant(e) dentaire à Bordeaux », par distance au centre. */
export const OFFRES_BORDEAUX: Offre[] = [OFFRE, O7, O11, O13, O10, O12]

/** Offres de la page « assistant(e) dentaire en Gironde », par distance au chef-lieu. */
export const OFFRES_GIRONDE: Offre[] = [OFFRE, O7, O11, O13, O10, O8, O12, O9]

/** Offres voisines pour la page vide de Saint-Émilion, par distance à Saint-Émilion. */
export const SAINT_EMILION = { lon: -0.1556, lat: 44.8933, nom: 'Saint-Émilion' }
export const OFFRES_VOISINES_SE: Offre[] = [
  {
    id: 'v1', slug: 'assistant-dentaire-libourne', titre: 'Assistant(e) dentaire qualifié(e)', metier: 'Assistant(e) dentaire', contrat: 'CDI',
    temps: 'Temps plein, 35 h', debut: '1er décembre 2026', min: 2000, max: 2300, recruteur: 'Cabinet Dr Pauline Girard', type: 'cabinet',
    adresse: '22 rue Gambetta', cp: '33500', commune: 'Libourne', lon: -0.243, lat: 44.916, km: 7.4, trajet: '12 min en voiture',
    publiee: '7 octobre 2026', depuis: 'il y a 5 jours', photo: PHOTOS.e,
  },
  {
    id: 'v2', slug: 'assistant-dentaire-cdd-libourne', titre: 'Assistant(e) dentaire', metier: 'Assistant(e) dentaire', contrat: 'CDD', duree: '4 mois',
    temps: 'Temps plein, 35 h', debut: 'Dès que possible', min: 1950, max: 2150, recruteur: 'Cabinet Drs Moreau et Petit', type: 'cabinet',
    adresse: '3 allées Robert Boulin', cp: '33500', commune: 'Libourne', lon: -0.24, lat: 44.92, km: 7.9, trajet: '13 min en voiture',
    publiee: '3 octobre 2026', depuis: 'il y a 9 jours',
  },
  {
    id: 'v3', slug: 'assistant-dentaire-alternance-castillon', titre: 'Assistant(e) dentaire en alternance', metier: 'Assistant(e) dentaire', contrat: 'Alternance', duree: '18 mois',
    temps: 'Rythme école et cabinet', debut: '5 janvier 2027', min: 1100, max: 1350, recruteur: 'Cabinet Dr Thomas Faure', type: 'cabinet',
    adresse: '10 place de la Victoire', cp: '33350', commune: 'Castillon-la-Bataille', lon: -0.042, lat: 44.854, km: 11.2, trajet: '16 min en voiture',
    publiee: '1er octobre 2026', depuis: 'il y a 11 jours',
  },
]

/** Compteurs nationaux. */
export const METIERS = [
  { slug: 'assistant-dentaire', nom: 'Assistant(e) dentaire', court: 'Assistant(e) dentaire', n: 1284, detail: 'CDI, CDD, temps plein ou partiel', photo: PHOTOS.a },
  { slug: 'secretaire-assistant-gestion', nom: 'Secrétaire ou assistant(e) de gestion', court: 'Secrétariat et gestion', n: 342, detail: 'Accueil, planning, facturation', photo: PHOTOS.c },
  { slug: 'prothesiste-dentaire', nom: 'Prothésiste dentaire', court: 'Prothésiste dentaire', n: 287, detail: 'Laboratoires de prothèse', photo: PHOTOS.g },
  { slug: 'aide-dentaire', nom: 'Aide dentaire', court: 'Aide dentaire', n: 196, detail: 'Stérilisation, hygiène, accueil', photo: PHOTOS.e },
]
export const PARCOURS = [
  { slug: 'alternance', nom: 'Alternance', n: 412 },
  { slug: 'stages', nom: 'Stages', n: 158 },
  { slug: 'remplacements', nom: 'Remplacements', n: 389 },
  { slug: 'collaborations', nom: 'Collaborations', n: 241 },
]
export const TOTAL_FRANCE = 2739

export const DEPARTEMENTS_AD = [
  { nom: 'Paris', n: 132 },
  { nom: 'Rhône', n: 78 },
  { nom: 'Bouches-du-Rhône', n: 64 },
  { nom: 'Nord', n: 52 },
  { nom: 'Gironde', n: 46 },
  { nom: 'Haute-Garonne', n: 41 },
  { nom: 'Loire-Atlantique', n: 37 },
  { nom: 'Hérault', n: 33 },
]

export const COMMUNES_GIRONDE_AD = [
  { nom: 'Bordeaux', n: 6 }, { nom: 'Mérignac', n: 5 }, { nom: 'Pessac', n: 4 }, { nom: 'Talence', n: 3 },
  { nom: 'Arcachon', n: 2 }, { nom: 'Bègles', n: 2 }, { nom: 'La Teste-de-Buch', n: 2 }, { nom: 'Le Bouscat', n: 2 },
  { nom: 'Libourne', n: 2 }, { nom: 'Saint-André-de-Cubzac', n: 2 }, { nom: 'Saint-Médard-en-Jalles', n: 2 },
  { nom: 'Andernos-les-Bains', n: 1 }, { nom: 'Biganos', n: 1 }, { nom: 'Blanquefort', n: 1 }, { nom: 'Castillon-la-Bataille', n: 1 },
  { nom: 'Cenon', n: 1 }, { nom: 'Cestas', n: 1 }, { nom: 'Coutras', n: 1 }, { nom: 'Eysines', n: 1 }, { nom: 'Floirac', n: 1 },
  { nom: 'Gradignan', n: 1 }, { nom: 'Langon', n: 1 }, { nom: 'Lesparre-Médoc', n: 1 }, { nom: 'Lormont', n: 1 },
  { nom: 'Villenave-d’Ornon', n: 1 },
]

export const ECOLES = [
  { nom: 'École de prothèse dentaire de Bordeaux', detail: 'BTMS et BTS prothésiste dentaire, en alternance', commune: 'Talence', rythme: 'Deux semaines à l’école, deux semaines au laboratoire', photo: PHOTOS.e },
  { nom: 'Institut de formation des assistants dentaires de l’Estuaire', detail: 'Titre d’assistant(e) dentaire, 18 mois en alternance', commune: 'Bordeaux', rythme: 'Un jour par semaine à l’institut, quatre jours au cabinet' },
  { nom: 'Faculté d’odontologie de l’Université de l’Estuaire', detail: 'Stages cliniques, remplacements des étudiants en fin de cursus', commune: 'Bordeaux', rythme: 'Stages encadrés selon l’année d’études', photo: PHOTOS.h },
]

/**
 * Salaires moyens issus d'études, par métier et par secteur. Ce ne sont pas
 * des calculs sur les offres publiées. Montants d'exemple, à remplacer par
 * ceux de l'étude retenue ; `null` : métier peu présent dans ce secteur.
 */
export const SECTEURS = ['Cabinet libéral', 'Centre de santé', 'Laboratoire de prothèse', 'Hôpital ou centre universitaire']
export const SALAIRES: { metier: string; valeurs: (number | null)[] }[] = [
  { metier: 'Assistant(e) dentaire', valeurs: [2050, 2150, null, 2250] },
  { metier: 'Secrétaire ou assistant(e) de gestion', valeurs: [1900, 2000, 1950, 2100] },
  { metier: 'Prothésiste dentaire', valeurs: [null, 2300, 2250, 2450] },
  { metier: 'Aide dentaire', valeurs: [1800, 1850, null, 1900] },
  { metier: 'Chirurgien-dentiste salarié(e)', valeurs: [null, 5800, null, 5200] },
]
export const SOURCE_SALAIRES = 'Source : étude salariale à citer, année'
export const SALAIRES_ALTERNANCE = [
  { annee: 'Première année', moyenne: 1050 },
  { annee: 'Deuxième année', moyenne: 1250 },
  { annee: 'Troisième année', moyenne: 1450 },
]
export const RETROCESSION_MOYENNE = { remplacement: 40, collaboration: 35 }

export const FAQ = [
  {
    q: 'Qui peut publier une offre ?',
    r: 'Seuls les cabinets dentaires, centres de santé et laboratoires dont l’identité a été vérifiée auprès des registres officiels, l’Annuaire Santé pour les praticiens et la base Sirene pour les entreprises. Chaque offre renvoie à la fiche du recruteur.',
  },
  {
    q: 'Faut-il un compte pour postuler ?',
    r: 'Oui. Une candidature passe par votre compte DentalMap, ce qui permet au recruteur de vous répondre et à vous de suivre vos démarches. Pour recevoir les nouvelles offres par email, en revanche, aucun compte n’est nécessaire.',
  },
  {
    q: 'Quand mes coordonnées sont-elles transmises ?',
    r: 'Le recruteur voit votre profil et votre message. Votre téléphone et votre adresse email ne lui sont transmis que si vous acceptez sa proposition d’échange.',
  },
  {
    q: 'Pourquoi la rémunération est-elle toujours indiquée ?',
    r: 'Une offre ne peut pas être publiée sans sa rémunération : fourchette brute mensuelle pour un contrat salarié ou une alternance, taux de rétrocession ou de redevance pour un remplacement ou une collaboration.',
  },
  {
    q: 'Dans quel ordre les offres sont-elles affichées ?',
    r: 'Par distance depuis le lieu de votre recherche, la plus proche d’abord. À distance égale, la plus récente passe devant.',
  },
]

export const FAQ_RECRUTEURS = [
  {
    q: 'Qui peut publier une offre ?',
    r: 'Un cabinet, un centre de santé ou un laboratoire dont la fiche est vérifiée auprès des registres officiels, et gérée depuis l’espace pro par son titulaire.',
  },
  {
    q: 'Pourquoi la rémunération est-elle obligatoire ?',
    r: 'Les candidats comparent avant de postuler. Une fourchette brute mensuelle pour un poste salarié, un taux de rétrocession ou de redevance pour un remplacement ou une collaboration.',
  },
  {
    q: 'Comment recevoir les coordonnées d’un candidat ?',
    r: 'Vous voyez son profil et son message. Vous lui proposez un échange ; s’il accepte, son téléphone et son email vous sont transmis.',
  },
  {
    q: 'Que montrent les profils disponibles ?',
    r: 'Le métier, l’expérience, les compétences, la disponibilité et une zone de recherche. Ni nom, ni photo, ni coordonnées : le candidat choisit s’il accepte votre proposition.',
  },
  {
    q: 'Combien de temps une offre reste-t-elle en ligne ?',
    r: 'Jusqu’à sa date d’expiration, que vous choisissez, ou jusqu’à ce que vous la marquiez pourvue depuis l’espace pro.',
  },
]

export const PROFILS = [
  { metier: 'Assistant(e) dentaire qualifié(e)', experience: '6 ans d’expérience', competences: ['Implantologie', 'Stérilisation', 'Radiologie'], dispo: 'Disponible en janvier', zone: 'Bordeaux et 10 km' },
  { metier: 'Prothésiste dentaire', experience: '3 ans d’expérience', competences: ['Zircone', 'CFAO', 'Céramique'], dispo: 'Disponible immédiatement', zone: 'Mérignac et 20 km' },
  { metier: 'Secrétaire de cabinet', experience: '10 ans d’expérience', competences: ['Planning', 'Facturation', 'Tiers payant'], dispo: 'Disponible en décembre', zone: 'Pessac et 15 km' },
  { metier: 'Chirurgien-dentiste remplaçant(e)', experience: 'Thèse soutenue en 2025', competences: ['Omnipratique', 'Endodontie'], dispo: 'Libre en février et mars', zone: 'Gironde' },
]

export const EMPRISE_BORDEAUX = empriseAutour(-0.585, 44.845, 4300)
export const EMPRISE_GIRONDE = empriseAutour(-0.59, 44.84, 9000)
export const EMPRISE_SE = empriseAutour(-0.16, 44.895, 14000)

/** Le détail des deux offres de la page « offre ». */
export const DETAIL = {
  reference: 'DM-E-2026-0412',
  expire: '5 décembre 2026',
  horaires: 'Du lundi au vendredi, 8h30 à 12h30 et 14h00 à 18h30, un samedi matin sur deux',
  resume:
    'Le cabinet recherche un(e) assistant(e) dentaire qualifié(e) pour rejoindre une équipe de cinq personnes. Vous assistez principalement le Dr Martin Dupont au fauteuil, en soins courants, prothèse et implantologie.',
  missions: [
    'Assistance au fauteuil en soins courants, prothèse et implantologie',
    'Accueil des patients, gestion du planning et des appels',
    'Stérilisation, traçabilité et préparation des salles de soins',
    'Prise de radiographies et suivi des dossiers patients',
    'Gestion des stocks et des commandes auprès des fournisseurs',
  ],
  profil: [
    'Titre d’assistant(e) dentaire, ou formation en cours de validation',
    'Une première expérience en cabinet est appréciée',
    'Sens de l’accueil et goût du travail en équipe',
    'Aisance avec un logiciel de gestion de cabinet',
  ],
  avantages: [
    'Mutuelle d’entreprise prise en charge à 60 %',
    'Titres-restaurant de 9 €',
    'Abonnement de transport remboursé à 50 %',
    'Formation continue financée : radioprotection, gestes d’urgence',
    'Treizième mois après un an d’ancienneté',
  ],
  cabinet: {
    nom: 'Cabinet Sainte-Catherine',
    praticien: 'Dr Martin Dupont',
    adresse: '12 rue Sainte-Catherine, 33000 Bordeaux',
    photo: PHOTOS.b,
    photos: [PHOTOS.c, PHOTOS.h],
    horaires: 'Lundi au vendredi, 8h30 à 19h00 · samedi, 9h00 à 12h00',
    plateau: ['3 fauteuils', 'Radiographie panoramique', 'Empreinte optique', 'Caméra intra-orale', 'Salle de stérilisation dédiée'],
    equipe: '2 chirurgiens-dentistes, 2 assistantes, 1 secrétaire',
    declareLe: '2 octobre 2026',
    acces: 'Tram A et B, arrêt Sainte-Catherine à 200 m',
  },
}

export const DETAIL_REMP = {
  reference: 'DM-E-2026-0437',
  expire: '20 novembre 2026',
  dates: 'Du 1er au 19 décembre 2026',
  horaires: 'Du lundi au jeudi, 8h30 à 12h30 et 14h00 à 19h00',
  resume:
    'Le Dr Antoine Leroy cherche un(e) remplaçant(e) pendant trois semaines d’absence. Patientèle d’omnipratique installée, agenda déjà rempli à 80 %, une assistante au fauteuil pendant toute la durée du remplacement.',
  activite: [
    'Omnipratique : soins conservateurs, endodontie, prothèse fixe',
    'Une vingtaine de patients par jour, urgences du jour en fin de matinée',
    'Pas de chirurgie implantaire pendant le remplacement',
  ],
  attentes: [
    'Chirurgien-dentiste inscrit(e) au tableau de l’Ordre, ou étudiant(e) titulaire d’une autorisation de remplacement',
    'Aisance en endodontie et en prothèse fixe',
    'Disponibilité sur toute la période',
  ],
  conditions: [
    'Inscription au tableau de l’Ordre, ou autorisation de remplacement délivrée par le conseil départemental de l’Ordre pour un étudiant',
    'Carte de professionnel de santé (CPS) de remplaçant',
    'Contrat de remplacement écrit, communiqué au conseil départemental de l’Ordre',
    'Assurance en responsabilité civile professionnelle à jour',
  ],
  materiel: [
    'Assistante au fauteuil à temps plein',
    'Logiciel de gestion et agenda en ligne déjà paramétrés',
    'Rétrocession versée à la fin de chaque mois, sur les honoraires encaissés',
  ],
  cabinet: {
    nom: 'Cabinet Dr Antoine Leroy',
    praticien: 'Dr Antoine Leroy',
    adresse: '18 avenue Jean Jaurès, 33600 Pessac',
    photo: PHOTOS.f,
    photos: [PHOTOS.d, PHOTOS.a],
    horaires: 'Lundi au vendredi, 8h30 à 19h00',
    plateau: ['2 fauteuils', 'Radiographie panoramique', 'Caméra intra-orale', 'Salle de stérilisation dédiée'],
    equipe: '1 chirurgien-dentiste, 1 assistante, 1 secrétaire à mi-temps',
    declareLe: '28 septembre 2026',
    acces: 'Tram B, arrêt Pessac centre à 300 m',
  },
}

/**
 * Données structurées JobPosting de l'offre, à injecter avec `Balisage` sur la
 * vraie page. `validThrough` suit la date d'expiration ; `baseSalary` reprend
 * la fourchette brute mensuelle ; `directApply` est faux parce qu'il faut un
 * compte pour postuler. Pour un remplacement, `employmentType` vaut
 * `CONTRACTOR` et `baseSalary` est omis (rétrocession en pourcentage).
 */
export const JOB_POSTING = {
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title: 'Assistant(e) dentaire qualifié(e)',
  description: `<p>${DETAIL.resume}</p>`,
  identifier: { '@type': 'PropertyValue', name: 'DentalMap', value: DETAIL.reference },
  datePosted: '2026-10-06',
  validThrough: '2026-12-05T23:59:59+01:00',
  employmentType: 'FULL_TIME',
  hiringOrganization: {
    '@type': 'Dentist',
    name: 'Cabinet Sainte-Catherine',
    sameAs: 'https://dentalmap.fr/dentistes/gironde/bordeaux/cabinet-sainte-catherine/',
  },
  jobLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '12 rue Sainte-Catherine',
      postalCode: '33000',
      addressLocality: 'Bordeaux',
      addressRegion: 'Nouvelle-Aquitaine',
      addressCountry: 'FR',
    },
  },
  baseSalary: {
    '@type': 'MonetaryAmount',
    currency: 'EUR',
    value: { '@type': 'QuantitativeValue', minValue: 2100, maxValue: 2400, unitText: 'MONTH' },
  },
  occupationalCategory: '3251 Assistants dentaires (CITP 2008)',
  directApply: false,
}
