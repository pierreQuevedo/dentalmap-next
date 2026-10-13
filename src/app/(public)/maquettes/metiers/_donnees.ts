/**
 * MAQUETTE. Données des fiches métier, rangées dans les Ressources sous une
 * quatrième rubrique « Métiers ». Les faits réglementaires (durées, niveaux,
 * diplômes) sont à faire relire avant publication : ils portent la marque
 * « À valider ». Les salaires sont ceux des pages emploi : moyennes issues
 * d'études, jamais calculées sur les offres publiées.
 */
import { METIERS as METIERS_EMPLOI, SALAIRES, SECTEURS } from '../emploi/_donnees'

export { SALAIRES, SECTEURS }

const PHOTOS = {
  a: '/images/demo/pexels-6627320.jpg',
  b: '/images/demo/pexels-6627447.jpg',
  c: '/images/demo/pexels-6627471.jpg',
  d: '/images/demo/pexels-8413334.jpg',
  e: '/images/demo/pexels-3881296.jpg',
  g: '/images/demo/pexels-6627325.jpg',
  h: '/images/demo/pexels-19879741.jpg',
}

export type MetierCarte = {
  slug: string
  nom: string
  accroche: string
  formation: string
  salaire: number | null
  offres: number
  photo: string
}

const offres = (slug: string) => METIERS_EMPLOI.find((m) => m.slug === slug)?.n ?? 0

export const METIERS: MetierCarte[] = [
  { slug: 'assistant-dentaire', nom: 'Assistant(e) dentaire', accroche: 'Au fauteuil, aux côtés du praticien.', formation: '18 mois en alternance', salaire: 2050, offres: offres('assistant-dentaire'), photo: PHOTOS.a },
  { slug: 'chirurgien-dentiste', nom: 'Chirurgien-dentiste', accroche: 'Diagnostiquer, soigner, prévenir.', formation: '6 ans au minimum', salaire: null, offres: 630, photo: PHOTOS.h },
  { slug: 'prothesiste-dentaire', nom: 'Prothésiste dentaire', accroche: 'Concevoir les prothèses au laboratoire.', formation: 'CAP, BTMS puis BTS', salaire: 2250, offres: offres('prothesiste-dentaire'), photo: PHOTOS.g },
  { slug: 'secretaire-assistant-gestion', nom: 'Secrétaire ou assistant(e) de gestion', accroche: 'L’accueil, le planning et la facturation.', formation: 'Secrétariat médical', salaire: 1900, offres: offres('secretaire-assistant-gestion'), photo: PHOTOS.c },
  { slug: 'aide-dentaire', nom: 'Aide dentaire', accroche: 'L’hygiène et la stérilisation du cabinet.', formation: 'Sans diplôme obligatoire', salaire: 1800, offres: offres('aide-dentaire'), photo: PHOTOS.e },
  { slug: 'assistant-specialise', nom: 'Assistant(e) spécialisé(e)', accroche: 'Orthodontie, chirurgie ou implantologie.', formation: 'Après le titre d’assistant(e)', salaire: 2250, offres: 118, photo: PHOTOS.d },
]

export type Fiche = {
  metier: MetierCarte
  majLe: string
  lecture: number
  photo: string
  resume: string
  chiffres: { valeur: string; libelle: string }[]
  missions: { icone: 'fauteuil' | 'hygiene' | 'accueil' | 'gestion' | 'diagnostic' | 'atelier' | 'controle' | 'planning'; titre: string; detail: string }[]
  qualites: string[]
  formation: string
  etapes: { titre: string; detail: string }[]
  /** Salaire moyen par secteur, dans l'ordre de `SECTEURS` ; `null` : peu de postes. */
  salaires: (number | null)[]
  evolutions: { titre: string; detail: string }[]
  sources: string[]
}

const m = (slug: string) => METIERS.find((x) => x.slug === slug)!
const val = (metier: string) => SALAIRES.find((x) => x.metier === metier)!.valeurs
const MAJ = '13 octobre 2026'

export const FICHES: Record<string, Fiche> = {
  'assistant-dentaire': {
    metier: m('assistant-dentaire'),
    majLe: MAJ,
    lecture: 6,
    photo: PHOTOS.a,
    resume: 'Profession de santé depuis 2016, l’assistant(e) dentaire accompagne le praticien au fauteuil et fait tourner le cabinet.',
    chiffres: [
      { valeur: '18 mois', libelle: 'de formation en alternance' },
      { valeur: 'Niveau 4', libelle: 'titre reconnu, équivalent bac' },
      { valeur: '2 050 €', libelle: 'brut mensuel moyen en cabinet' },
      { valeur: '1 284', libelle: 'offres publiées en France' },
    ],
    missions: [
      { icone: 'fauteuil', titre: 'Assister au fauteuil', detail: 'Préparer le plateau, aspirer, tendre les instruments.' },
      { icone: 'hygiene', titre: 'Hygiène et stérilisation', detail: 'Décontaminer, stériliser, tracer chaque cycle.' },
      { icone: 'accueil', titre: 'Accueillir les patients', detail: 'Rassurer, expliquer un devis, planifier les rendez-vous.' },
      { icone: 'gestion', titre: 'Gérer le cabinet', detail: 'Stocks, commandes, télétransmission.' },
    ],
    qualites: ['Rigueur', 'Sens du contact', 'Dextérité', 'Discrétion', 'Travail en équipe'],
    formation: 'Uniquement en alternance.',
    etapes: [
      { titre: 'Trouver un cabinet employeur', detail: 'Le contrat d’apprentissage ou de professionnalisation ouvre l’entrée en formation.' },
      { titre: 'Se former en alternance', detail: 'Environ 18 mois, avec des cours en institut et la pratique au cabinet.' },
      { titre: 'Obtenir le titre', detail: 'Examen final, puis inscription comme professionnel de santé.' },
    ],
    salaires: val('Assistant(e) dentaire'),
    evolutions: [
      { titre: 'Assistant(e) spécialisé(e)', detail: 'Orthodontie, chirurgie, implantologie.' },
      { titre: 'Responsable de cabinet', detail: 'Coordination d’équipe et gestion.' },
      { titre: 'Formateur ou formatrice', detail: 'Transmettre en institut de formation.' },
    ],
    sources: ['Code de la santé publique, article L4393-8', 'Référentiel du titre d’assistant(e) dentaire', 'Étude salariale à citer, année'],
  },
  'chirurgien-dentiste': {
    metier: m('chirurgien-dentiste'),
    majLe: MAJ,
    lecture: 7,
    photo: PHOTOS.h,
    resume: 'Le chirurgien-dentiste diagnostique et soigne les dents, les gencives et la bouche, en libéral, en centre de santé ou à l’hôpital.',
    chiffres: [
      { valeur: '6 ans', libelle: 'd’études au minimum après le bac' },
      { valeur: 'Diplôme d’État', libelle: 'de docteur en chirurgie dentaire' },
      { valeur: '5 800 €', libelle: 'brut mensuel moyen en centre de santé' },
      { valeur: '630', libelle: 'remplacements et collaborations' },
    ],
    missions: [
      { icone: 'diagnostic', titre: 'Diagnostiquer', detail: 'Examen clinique, radiographies, plan de traitement.' },
      { icone: 'fauteuil', titre: 'Soigner', detail: 'Caries, extractions, prothèses, parodontie.' },
      { icone: 'accueil', titre: 'Prévenir', detail: 'Hygiène bucco-dentaire, dépistage, suivi.' },
      { icone: 'gestion', titre: 'Diriger le cabinet', detail: 'Équipe, matériel, obligations réglementaires.' },
    ],
    qualites: ['Précision', 'Écoute', 'Endurance', 'Sens des responsabilités', 'Goût du geste'],
    formation: 'Accès par le PASS ou une L.AS.',
    etapes: [
      { titre: 'Réussir la première année', detail: 'PASS ou L.AS, puis admission en filière odontologie.' },
      { titre: 'Cinq ans en faculté', detail: 'Enseignements, stages cliniques, premiers remplacements en fin de cursus.' },
      { titre: 'Thèse et inscription à l’Ordre', detail: 'Le diplôme d’État ouvre l’exercice, après inscription au tableau.' },
    ],
    salaires: val('Chirurgien-dentiste salarié(e)'),
    evolutions: [
      { titre: 'Internat qualifiant', detail: 'Orthodontie, chirurgie orale, médecine bucco-dentaire.' },
      { titre: 'Installation en libéral', detail: 'Création, reprise ou association.' },
      { titre: 'Enseignement et recherche', detail: 'Faculté et centre hospitalier universitaire.' },
    ],
    sources: ['Code de la santé publique, articles L4141-1 et suivants', 'Arrêté relatif aux études en vue du diplôme d’État de docteur en chirurgie dentaire', 'Étude salariale à citer, année'],
  },
  'prothesiste-dentaire': {
    metier: m('prothesiste-dentaire'),
    majLe: MAJ,
    lecture: 6,
    photo: PHOTOS.g,
    resume: 'Au laboratoire, le prothésiste conçoit et fabrique les prothèses sur mesure prescrites par le chirurgien-dentiste.',
    chiffres: [
      { valeur: '2 à 6 ans', libelle: 'de formation selon le diplôme' },
      { valeur: 'CAP au BTS', libelle: 'trois niveaux de diplôme' },
      { valeur: '2 250 €', libelle: 'brut mensuel moyen en laboratoire' },
      { valeur: '287', libelle: 'offres publiées en France' },
    ],
    missions: [
      { icone: 'diagnostic', titre: 'Lire la prescription', detail: 'Empreinte, teinte, matériau demandé par le praticien.' },
      { icone: 'planning', titre: 'Modéliser', detail: 'Conception assistée par ordinateur, fichiers numériques.' },
      { icone: 'atelier', titre: 'Fabriquer', detail: 'Céramique, résine, métal, usinage.' },
      { icone: 'controle', titre: 'Contrôler et tracer', detail: 'Déclaration de conformité, traçabilité du dispositif.' },
    ],
    qualites: ['Minutie', 'Patience', 'Sens esthétique', 'Aisance numérique', 'Rigueur'],
    formation: 'En lycée professionnel ou en alternance.',
    etapes: [
      { titre: 'CAP prothésiste dentaire', detail: 'Deux ans pour apprendre les techniques de base.' },
      { titre: 'BTMS ou brevet professionnel', detail: 'Deux ans de plus pour gagner en autonomie.' },
      { titre: 'BTS prothésiste dentaire', detail: 'Encadrer, concevoir et gérer la production.' },
    ],
    salaires: val('Prothésiste dentaire'),
    evolutions: [
      { titre: 'Céramiste spécialisé(e)', detail: 'Esthétique et pièces complexes.' },
      { titre: 'Chef de laboratoire', detail: 'Production, équipe et qualité.' },
      { titre: 'Créer son laboratoire', detail: 'Installation ou reprise.' },
    ],
    sources: ['Règlement (UE) 2017/745 relatif aux dispositifs médicaux', 'Référentiels du CAP, du BTMS et du BTS prothésiste dentaire', 'Étude salariale à citer, année'],
  },
  'secretaire-assistant-gestion': {
    metier: m('secretaire-assistant-gestion'),
    majLe: MAJ,
    lecture: 5,
    photo: PHOTOS.c,
    resume: 'Premier contact du patient, la secrétaire ou l’assistant(e) de gestion tient le planning, la facturation et les dossiers du cabinet.',
    chiffres: [
      { valeur: '1 an', libelle: 'de formation au secrétariat médical' },
      { valeur: 'Niveau 4', libelle: 'titre de secrétaire médical(e)' },
      { valeur: '1 900 €', libelle: 'brut mensuel moyen en cabinet' },
      { valeur: '342', libelle: 'offres publiées en France' },
    ],
    missions: [
      { icone: 'accueil', titre: 'Accueillir', detail: 'Au comptoir et au téléphone, avec discrétion.' },
      { icone: 'planning', titre: 'Tenir le planning', detail: 'Rendez-vous, urgences, rappels.' },
      { icone: 'gestion', titre: 'Facturer', detail: 'Devis, télétransmission, tiers payant.' },
      { icone: 'controle', titre: 'Suivre les dossiers', detail: 'Dossiers patients, courriers, archives.' },
    ],
    qualites: ['Organisation', 'Amabilité', 'Discrétion', 'Calme', 'Aisance informatique'],
    formation: 'En formation courte ou en alternance.',
    etapes: [
      { titre: 'Se former au secrétariat médical', detail: 'Titre professionnel ou formation équivalente.' },
      { titre: 'Stage ou alternance en cabinet', detail: 'Logiciel métier, nomenclature, télétransmission.' },
      { titre: 'Prendre son poste', detail: 'En cabinet, en centre de santé ou à l’hôpital.' },
    ],
    salaires: val('Secrétaire ou assistant(e) de gestion'),
    evolutions: [
      { titre: 'Assistant(e) de gestion', detail: 'Comptabilité et relations avec les organismes.' },
      { titre: 'Responsable administratif', detail: 'Dans un centre de santé.' },
      { titre: 'Coordination', detail: 'Organisation d’un cabinet de groupe.' },
    ],
    sources: ['Référentiel du titre de secrétaire assistant(e) médico-social(e)', 'Étude salariale à citer, année'],
  },
  'aide-dentaire': {
    metier: m('aide-dentaire'),
    majLe: MAJ,
    lecture: 4,
    photo: PHOTOS.e,
    resume: 'L’aide dentaire assure l’hygiène et la stérilisation du cabinet et prépare le matériel, sans intervenir au fauteuil.',
    chiffres: [
      { valeur: 'Sans diplôme', libelle: 'obligatoire pour commencer' },
      { valeur: 'Au cabinet', libelle: 'formation aux protocoles' },
      { valeur: '1 800 €', libelle: 'brut mensuel moyen en cabinet' },
      { valeur: '196', libelle: 'offres publiées en France' },
    ],
    missions: [
      { icone: 'hygiene', titre: 'Stériliser', detail: 'Nettoyer, conditionner, stériliser les instruments.' },
      { icone: 'controle', titre: 'Tracer', detail: 'Enregistrer chaque cycle de stérilisation.' },
      { icone: 'atelier', titre: 'Préparer le matériel', detail: 'Plateaux, consommables, salles de soins.' },
      { icone: 'accueil', titre: 'Accueillir', detail: 'En appui du secrétariat.' },
    ],
    qualites: ['Rigueur', 'Méthode', 'Discrétion', 'Réactivité', 'Travail en équipe'],
    formation: 'Une porte d’entrée vers le titre d’assistant(e).',
    etapes: [
      { titre: 'Entrer en cabinet', detail: 'Sans diplôme exigé, sur motivation.' },
      { titre: 'Apprendre les protocoles', detail: 'Hygiène, stérilisation, traçabilité.' },
      { titre: 'Préparer le titre d’assistant(e)', detail: 'En alternance, avec le même employeur.' },
    ],
    salaires: val('Aide dentaire'),
    evolutions: [
      { titre: 'Assistant(e) dentaire', detail: 'Par l’alternance.' },
      { titre: 'Responsable stérilisation', detail: 'Dans un centre de santé.' },
      { titre: 'Secrétariat', detail: 'Accueil et planning.' },
    ],
    sources: ['Convention collective nationale des cabinets dentaires', 'Étude salariale à citer, année'],
  },
  'assistant-specialise': {
    metier: m('assistant-specialise'),
    majLe: MAJ,
    lecture: 5,
    photo: PHOTOS.d,
    resume: 'Après le titre d’assistant(e) dentaire, une spécialisation en orthodontie, chirurgie ou implantologie.',
    chiffres: [
      { valeur: 'Titre requis', libelle: 'd’assistant(e) dentaire' },
      { valeur: 'Formation', libelle: 'complémentaire courte' },
      { valeur: '2 250 €', libelle: 'brut mensuel moyen en cabinet' },
      { valeur: '118', libelle: 'offres publiées en France' },
    ],
    missions: [
      { icone: 'fauteuil', titre: 'Orthodontie', detail: 'Empreintes numériques, suivi des appareils.' },
      { icone: 'hygiene', titre: 'Chirurgie et implantologie', detail: 'Assistance en conditions stériles.' },
      { icone: 'planning', titre: 'Coordonner les traitements', detail: 'Plans de traitement longs, rendez-vous.' },
      { icone: 'accueil', titre: 'Accompagner le patient', detail: 'Consignes avant et après l’intervention.' },
    ],
    qualites: ['Sang-froid', 'Précision', 'Anticipation', 'Pédagogie', 'Rigueur'],
    formation: 'Après le titre d’assistant(e) dentaire.',
    etapes: [
      { titre: 'Obtenir le titre d’assistant(e)', detail: '18 mois en alternance.' },
      { titre: 'Se spécialiser', detail: 'Formation complémentaire dans une spécialité.' },
      { titre: 'Exercer en cabinet spécialisé', detail: 'Orthodontie, chirurgie, implantologie.' },
    ],
    salaires: [2250, 2300, null, 2350],
    evolutions: [
      { titre: 'Responsable de bloc', detail: 'Organisation des interventions.' },
      { titre: 'Formateur ou formatrice', detail: 'En institut ou chez un fabricant.' },
      { titre: 'Coordination de cabinet', detail: 'Équipe et parcours patient.' },
    ],
    sources: ['Référentiel du titre d’assistant(e) dentaire', 'Étude salariale à citer, année'],
  },
}

export const FICHE = FICHES['assistant-dentaire']!

export const AUTRES_ARTICLES = [
  { titre: 'Réussir son entretien en cabinet dentaire', rubrique: 'Métiers', lecture: 4 },
  { titre: 'Alternance : ce que prévoit le contrat', rubrique: 'Métiers', lecture: 5 },
  { titre: 'Les obligations d’hygiène au cabinet', rubrique: 'Praticiens', lecture: 7 },
]
