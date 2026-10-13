/**
 * MAQUETTE, à supprimer une fois le lien Annuaire et Emploi codé. Données
 * d'exemple statiques, aucune lecture de la base : noms inventés, adresses
 * de Bordeaux. Deux cabinets recrutent : ceux de Dr Élodie Benoit (Cabinet
 * Sainte-Catherine) et de Dr Sophie Bernard, dont les offres figurent dans les
 * maquettes Emploi.
 */
import type { Emprise } from '@/lib/annuaire/emprise'
import { empriseAutour } from '@/lib/annuaire/emprise'
import type { PraticienProche } from '@/lib/annuaire/queries'
import type { Civilite, PrecisionPosition } from '@/lib/annuaire/types'
import { OFFRES_BORDEAUX } from '../emploi/_donnees'

/** Centre de Bordeaux, d'où la recherche mesure les distances. */
export const CENTRE = { lon: -0.5792, lat: 44.8378 }

/** Emprise de la commune, celle que la vraie page lit dans `getEmpriseCommune`. */
export const EMPRISE_COMMUNE: Emprise = { ouest: -0.6386, sud: 44.8106, est: -0.5336, nord: 44.9161 }
/** Emprise de la recherche, vingt kilomètres autour de la commune choisie. */
export const EMPRISE_RECHERCHE: Emprise = empriseAutour(CENTRE.lon, CENTRE.lat, 20_000)

type Ligne = [civilite: Civilite, prenom: string, nom: string, adresse: string, cp: string, lon: number, lat: number, options?: { geree?: boolean; recrute?: boolean; precision?: PrecisionPosition }]

const LIGNES: Ligne[] = [
  ['MME', 'Julie', 'ABADIE', '22 Cours Georges Clemenceau', '33000', -0.5755, 44.842],
  ['M', 'Marc', 'ALBERT', '61 Rue du Palais Gallien', '33000', -0.581, 44.846],
  ['MME', 'Sarah', 'ALONSO', '9 Place Gambetta', '33000', -0.581, 44.841],
  ['M', 'Nicolas', 'ARNAUD', '112 Cours Victor Hugo', '33000', -0.57, 44.835, { precision: 'voie' }],
  ['MME', 'Claire', 'AUBERT', '3 Rue Esprit des Lois', '33000', -0.5715, 44.843, { geree: true }],
  ['M', 'Hugo', 'BARON', '45 Cours de Verdun', '33000', -0.573, 44.85],
  ['MME', 'Léa', 'BARTHE', '20 Quai des Chartrons', '33000', -0.569, 44.852],
  ['MME', 'Élodie', 'BENOIT', '12 Rue Sainte-Catherine', '33000', -0.5737, 44.8398, { geree: true, recrute: true }],
  ['MME', 'Sophie', 'BERNARD', '27 Avenue Thiers', '33100', -0.5585, 44.8418, { geree: true, recrute: true }],
  ['M', 'Paul', 'BLANCHARD', '88 Cours de la Marne', '33800', -0.565, 44.827],
  ['MME', 'Inès', 'BOYER', '7 Rue Judaïque', '33000', -0.583, 44.842],
  ['M', 'Antoine', 'BRUN', '150 Avenue Thiers', '33100', -0.548, 44.844],
]

function metres(lon: number, lat: number) {
  const r = 6_371_000
  const dLat = ((lat - CENTRE.lat) * Math.PI) / 180
  const dLon = ((lon - CENTRE.lon) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((CENTRE.lat * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return Math.round((2 * r * Math.asin(Math.sqrt(a))) / 10) * 10
}

export type PraticienMaquette = PraticienProche & { recrute: boolean }

const PRATICIENS: PraticienMaquette[] = LIGNES.map(([civilite, prenom, nom, adresse, cp, lon, lat, o = {}], i) => ({
  slug: `exemple-${prenom}-${nom}`.toLowerCase().normalize('NFD').replace(/[^a-z-]/g, ''),
  lieuId: `l${i}`,
  civilite,
  nom,
  prenom,
  raisonSociale: null,
  statutVerification: 'verifie',
  adresseLigne: adresse,
  codePostal: cp,
  aTelephone: true,
  revendiquee: Boolean(o.geree),
  communeNom: 'Bordeaux',
  communeSlug: 'bordeaux',
  departementSlug: 'gironde',
  precisionPosition: o.precision ?? 'numero',
  lon,
  lat,
  metres: metres(lon, lat),
  recrute: Boolean(o.recrute),
}))

/**
 * Neutralité : la pastille « Recrute » n'entre dans aucun tri. La commune est
 * classée par ordre alphabétique, la recherche par distance puis ordre
 * alphabétique, exactement comme sans offre.
 */
export const PRATICIENS_COMMUNE = [...PRATICIENS].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
export const PRATICIENS_RECHERCHE = [...PRATICIENS].sort((a, b) => a.metres - b.metres || a.nom.localeCompare(b.nom, 'fr'))

/** Les trois offres les plus proches du centre de Bordeaux, par distance. */
export const OFFRES_PROCHES = [...OFFRES_BORDEAUX].sort((a, b) => (a.km ?? 0) - (b.km ?? 0)).slice(0, 3)

export const VOISINES = [
  { libelle: 'Le Bouscat', href: '/dentistes/gironde/le-bouscat/', total: 34, detail: '1,5 km' },
  { libelle: 'Bruges', href: '/dentistes/gironde/bruges/', total: 11, detail: '3,3 km' },
  { libelle: 'Cenon', href: '/dentistes/gironde/cenon/', total: 50, detail: '5 km' },
  { libelle: 'Eysines', href: '/dentistes/gironde/eysines/', total: 21, detail: '5,1 km' },
  { libelle: 'Lormont', href: '/dentistes/gironde/lormont/', total: 29, detail: '5,5 km' },
]
