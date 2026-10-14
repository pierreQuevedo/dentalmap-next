/**
 * DÉMONSTRATION, à supprimer dès qu'un établissement réel a son groupe ACF
 * « Formation, informations détaillées » rempli dans WordPress.
 *
 * Deux établissements fictifs, avec une saisie complète du groupe telle que
 * WPGraphQL la renverrait (`formationDetails`), passée par `lireDetails`
 * comme dans `getFormation`. Le contenu relevé (`Ecole`, `Faculte`) est
 * réduit au minimum pour que chaque bloc montré vienne du groupe. Les champs
 * texte d'une ligne (frais, portes ouvertes) séparent leurs éléments par « ; ».
 */
import { lireDetails, type DetailsBruts } from '@/lib/formation/details'
import type { Ecole, Faculte } from '@/lib/formation/faculte'
import type { FormationComplete } from '@/lib/wp/queries'

export const SAISIE_ECOLE: DetailsBruts = {
  universite: 'Académie de Bordeaux',
  adresse: '12 cours de la Libération',
  codePostal: '33400',
  telephone: '05 56 00 00 00',
  email: 'scolarite@ecole-prothese-val.example',
  voiesAcces: [
    'Vous candidatez | Sur Parcoursup pour le BTS, sur Affelnet pour le bac pro, par dossier à l’école pour le BTMS. | Janvier à mars',
    'L’école étudie votre dossier | Bulletins, projet professionnel, éventuels stages en laboratoire. | Mars',
    'Entretien et test manuel | Vingt minutes d’échange et une épreuve de dextérité sur cire. | Avril',
    'Résultats et inscription | Réponse sur la plateforme, puis inscription administrative à l’école. | Mai à juillet',
  ].join('\n'),
  capaciteAccueil: 48,
  prerequis: 'Goût pour le travail manuel de précision\nBonne vision des couleurs\nStage d’observation en laboratoire conseillé',
  frais: [
    'Frais de scolarité | 0 € | Établissement sous contrat avec l’État.',
    'Équipement de l’élève | Environ 450 € | Trousse d’instruments et tenue, la première année.',
    'Aides | Bourses | Bourses de lycée et d’enseignement supérieur, aides régionales au premier équipement.',
    'Apprentissage | Formation financée | Aucun frais pour l’apprenti, qui est rémunéré.',
  ].join(' ; '),
  rentree: 'Septembre 2027',
  portesOuvertes:
    '06/02/2027 | Journée portes ouvertes | 9h00 à 16h00, visite des ateliers et rencontre des enseignants. ; 14/03/2027 | Mini-stage d’une journée | Sur inscription, pour les élèves de 3e et de terminale. ; 22/05/2027 | Forum alternance | Rencontre avec les laboratoires qui recrutent des apprentis.',
  latitude: 44.8106,
  longitude: -0.5897,
  sources: 'https://www.onisep.fr/\nhttps://www.education.gouv.fr/',
  dateReleve: '2026-10-04',
}

export const SAISIE_FACULTE: DetailsBruts = {
  universite: 'Université de l’Estuaire',
  adresse: '16 cours de la Marne',
  codePostal: '33000',
  telephone: '05 57 00 00 00',
  email: 'scolarite-odontologie@universite-estuaire.example',
  voiesAcces: [
    'PASS ou L.AS | Une première année de santé à l’université, avec une mineure ou une majeure santé. | Septembre',
    'Classement et oraux | Admission en deuxième année sur notes, puis épreuves orales pour une partie des places. | Mai à juin',
    'Passerelles | Admission directe en deuxième ou troisième année pour certains diplômés, sur dossier. | Mars',
  ].join('\n'),
  frais: [
    'Droits d’inscription | Droits nationaux | Fixés chaque année par arrêté, identiques dans toutes les universités publiques.',
    'Contribution vie étudiante | CVEC | Due chaque année avant l’inscription, sauf boursiers.',
    'Matériel | Fourni en partie | Instruments de travaux pratiques prêtés en premier cycle.',
    'Aides | Bourses | Bourses sur critères sociaux et aides au logement.',
  ].join(' ; '),
  portesOuvertes:
    '30/01/2027 | Journée portes ouvertes | 9h00 à 13h00, présentation du PASS, des L.AS et visite des centres de soins. ; 12/03/2027 | Réunion passerelles | Pour les candidats à l’admission directe en deuxième année. ; 18/06/2027 | Journée de la recherche | Présentation des travaux des doctorants et des internes.',
  latitude: 44.8268,
  longitude: -0.5626,
  sources: 'https://www.legifrance.gouv.fr/',
  dateReleve: '2026-10-04',
}

const base = {
  extrait: null,
  departement: '33',
  diplome: null,
  duree: null,
  diplomes: [],
  uai: null,
  creditImage: 'Photo de démonstration',
  contenu: null,
  date: null,
  modifie: null,
  seoTitre: null,
  seoDescription: null,
  noindex: true,
}

export const FORMATION_ECOLE: FormationComplete = {
  ...base,
  slug: 'demo-ecole-prothese-val',
  titre: 'École de prothèse du Val',
  type: 'ecole_prothese',
  ville: 'Talence',
  image: { url: '/images/demo/pexels-6627447.jpg', alt: 'Élève prothésiste au laboratoire' },
  logo: { url: '/images/demo/partenaires-fictifs/ecole-prothese-val.svg', alt: 'Logo, École de prothèse du Val' },
  siteWeb: 'https://ecole-prothese-val.example/',
  details: lireDetails(SAISIE_ECOLE, 'Talence'),
}

/** Le relevé du contenu, réduit : présentation et diplômes. Adresse, contact, frais et sources viennent du groupe. */
export const ECOLE: Ecole = {
  presentation:
    'Former des prothésistes prêts pour le laboratoire. La moitié de la formation se passe en entreprise, et chaque élève travaille dès la première année sur un plateau de CFAO.',
  type: 'École privée',
  statut: 'prive',
  adresse: null,
  siteWeb: null,
  telephone: null,
  email: null,
  diplomes: [
    { intitule: 'Bac pro Technicien en prothèse dentaire', niveau: 'Bac', duree: '3 ans', modalite: 'Initiale ou apprentissage' },
    { intitule: 'BTS Prothésiste dentaire', niveau: 'Bac + 2', duree: '2 ans', modalite: 'Apprentissage' },
    { intitule: 'BTMS Prothésiste dentaire', niveau: 'Bac + 2', duree: '2 ans', modalite: 'Apprentissage' },
  ],
  capacite: null,
  frais: null,
  sources: [],
  dateReleve: null,
}

export const FORMATION_FACULTE: FormationComplete = {
  ...base,
  slug: 'demo-faculte-odontologie-estuaire',
  titre: 'Faculté d’odontologie de l’Estuaire',
  type: 'faculte',
  ville: 'Bordeaux',
  duree: '6 à 9 ans',
  image: { url: '/images/demo/pexels-6627320.jpg', alt: 'Soins au centre de la faculté' },
  logo: { url: '/images/demo/partenaires-fictifs/faculte-estuaire.svg', alt: 'Logo, Faculté d’odontologie de l’Estuaire' },
  siteWeb: 'https://odontologie.universite-estuaire.example/',
  details: lireDetails(SAISIE_FACULTE, 'Bordeaux'),
}

/** Le relevé du contenu, réduit : capacité, internat et centres de soins. Université, accès, frais et rendez-vous viennent du groupe. */
export const FACULTE: Faculte = {
  presentation:
    'Une faculté ouverte sur la ville. Ses centres de soins reçoivent les patients du quartier, encadrés par des praticiens hospitaliers.',
  universite: null,
  adresse: '16 cours de la Marne, 33000 Bordeaux',
  siteWeb: null,
  telephone: null,
  email: null,
  voiesAcces: null,
  capacite: { nombre: 82, annee: '2026-2027', detail: 'En 2025-2026 : 80.' },
  duree: '6 à 9 ans',
  diplome: 'Diplôme d’État de docteur en chirurgie dentaire',
  autresDiplomes: null,
  effectif: null,
  internats: [
    { specialite: 'Orthopédie dento-faciale', postes: 4, annee: '2026-2027', texte: '' },
    { specialite: 'Chirurgie orale', postes: 2, annee: '2026-2027', texte: '' },
  ],
  chu: null,
  centresDeSoins: ['Centre de soins dentaires, 16 cours de la Marne, 33000 Bordeaux'],
  sources: [],
  dateReleve: null,
}
