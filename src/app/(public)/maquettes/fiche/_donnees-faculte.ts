/**
 * MAQUETTE. Données d'exemple d'une faculté d'odontologie. L'université est
 * inventée pour ne prêter à aucune faculté réelle des chiffres qui ne sont pas
 * les siens ; la structure suit ce que `lireFaculte` sait lire aujourd'hui.
 */
export const FAC = {
  nom: 'Faculté d’odontologie',
  universite: 'Université de l’Estuaire',
  monogramme: 'UE',
  statut: 'Université publique',
  adresse: '16 Cours de la Marne',
  cp: '33000',
  commune: 'Bordeaux',
  lon: -0.5658,
  lat: 44.8282,
  site: 'odontologie.universite-estuaire.fr',
  photo: '/images/demo/pexels-6627447.jpg',
  galerie: ['/images/demo/pexels-6627471.jpg', '/images/demo/pexels-6627320.jpg', '/images/demo/pexels-6627447.jpg', '/images/demo/pexels-8413334.jpg', '/images/demo/pexels-7800669.jpg'],
  galerieTotal: 18,
  galerieCredit: 'Service communication, Université de l’Estuaire',
  citation: {
    debut: 'Former des chirurgiens-dentistes au contact des patients dès la quatrième année.',
    suite: 'La faculté forme les étudiants, soigne la population dans ses centres de soins et mène la recherche avec le CHU.',
  },
  presentation:
    'La faculté accueille chaque année les étudiants admis en deuxième année après le PASS ou une L.AS, jusqu’au diplôme d’État de docteur en chirurgie dentaire. Ses deux centres de soins, rattachés au CHU, reçoivent des patients toute l’année : les soins y sont réalisés par les étudiants de quatrième à sixième année, encadrés par des praticiens hospitaliers.',
  chiffres: [
    { v: '98', l: 'places en 2e année, rentrée 2026' },
    { v: '6 ans', l: 'jusqu’au diplôme d’État' },
    { v: '3', l: 'internats préparés' },
    { v: '2', l: 'centres de soins ouverts aux patients' },
  ],
  portesOuvertes: { prochaine: 'Samedi 30 janvier 2027', horaire: '9h00 à 13h00' },
  acces: [
    { t: 'Première année de santé', d: 'Parcours d’accès spécifique santé (PASS) ou licence avec option accès santé (L.AS), dans l’université.', quand: '1re année' },
    { t: 'Admission en deuxième année', d: 'Sur classement, dans la limite des places ouvertes en odontologie. Épreuves écrites puis orales selon les résultats.', quand: 'Fin de 1re année' },
    { t: 'Passerelles', d: 'Pour les titulaires de certains masters, diplômes paramédicaux ou d’ingénieur, sur dossier et entretien.', quand: 'Dossier en mars' },
    { t: 'Inscription', d: 'Inscription administrative à l’université, puis pédagogique à la faculté.', quand: 'Juillet' },
  ],
  capacites: [
    { annee: '2022', n: 86 },
    { annee: '2023', n: 90 },
    { annee: '2024', n: 92 },
    { annee: '2025', n: 95 },
    { annee: '2026', n: 98 },
  ],
  cursus: [
    { cycle: 'Premier cycle', titre: 'DFGSO', annees: '2e et 3e années', d: 'Diplôme de formation générale en sciences odontologiques : sciences fondamentales, travaux pratiques sur simulateur.' },
    { cycle: 'Deuxième cycle', titre: 'DFASO', annees: '4e et 5e années', d: 'Diplôme de formation approfondie : premiers soins aux patients dans les centres de soins, stages hospitaliers.' },
    { cycle: 'Troisième cycle court', titre: 'Diplôme d’État', annees: '6e année', d: 'Stage actif chez un praticien, soutenance de thèse : diplôme d’État de docteur en chirurgie dentaire.' },
  ],
  autresDiplomes: ['Diplôme universitaire d’implantologie', 'Diplôme universitaire d’esthétique du sourire', 'Certificat d’études supérieures de parodontologie'],
  internats: [
    { specialite: 'Orthopédie dento-faciale', postes: 4, duree: '4 ans' },
    { specialite: 'Chirurgie orale', postes: 2, duree: '4 ans' },
    { specialite: 'Médecine bucco-dentaire', postes: 3, duree: '3 ans' },
  ],
  internatAnnee: '2026',
  chu: 'Centre hospitalier universitaire de l’Estuaire',
  centres: [
    { nom: 'Centre de soins dentaires du centre-ville', adresse: '3 Rue de la Faculté, 33000 Bordeaux', horaires: 'Du lundi au vendredi, 8h30 à 17h00', lon: -0.5781, lat: 44.8329 },
    { nom: 'Centre de soins dentaires du campus', adresse: '8 Allée des Hôpitaux, 33000 Bordeaux', horaires: 'Du lundi au vendredi, 8h00 à 16h30', lon: -0.6046, lat: 44.8262 },
  ],
  soins: ['Soins courants et détartrage', 'Prothèses', 'Orthodontie', 'Chirurgie orale', 'Soins aux enfants', 'Soins aux patients en situation de handicap'],
  vie: [
    { t: 'Bibliothèque universitaire', d: 'Section santé, ouverte jusqu’à 22h00 en semaine.' },
    { t: 'Restauration', d: 'Restaurant universitaire à 200 m de la faculté.' },
    { t: 'Logement', d: 'Résidences universitaires, demande par le dossier social étudiant.' },
    { t: 'Handicap', d: 'Mission handicap de l’université, aménagement des examens.' },
  ],
  couts: [
    { t: 'Droits d’inscription', v: 'Droits nationaux', d: 'Fixés chaque année par arrêté, identiques dans toutes les universités publiques.' },
    { t: 'Contribution vie étudiante', v: 'CVEC', d: 'Due chaque année avant l’inscription, sauf boursiers.' },
    { t: 'Matériel', v: 'Fourni en partie', d: 'Instruments de travaux pratiques prêtés en premier cycle.' },
    { t: 'Aides', v: 'Bourses', d: 'Bourses sur critères sociaux et aides au logement.' },
  ],
  evenements: [
    { date: '30 janvier 2027', t: 'Journée portes ouvertes', d: '9h00 à 13h00, présentation du PASS, des L.AS et visite des centres de soins.' },
    { date: '12 mars 2027', t: 'Réunion passerelles', d: 'Pour les candidats à l’admission directe en deuxième année.' },
    { date: '18 juin 2027', t: 'Journée de la recherche', d: 'Présentation des travaux des doctorants et des internes.' },
  ],
  contacts: [
    { t: 'Scolarité', d: 'Inscriptions, examens, passerelles' },
    { t: 'Centres de soins', d: 'Prise de rendez-vous des patients' },
    { t: 'Relations internationales', d: 'Échanges et stages à l’étranger' },
  ],
  registre: [
    ['Numéro UAI', '0331XXXX'],
    ['SIRET de l’université', '1XX XXX XXX XXXXX'],
    ['Statut', 'Établissement public à caractère scientifique, culturel et professionnel'],
    ['Diplôme', 'Diplôme d’État de docteur en chirurgie dentaire, inscrit au RNCP'],
    ['Places en 2e année', 'Arrêté annuel fixant les capacités d’accueil'],
    ['Postes d’internat', 'Arrêté annuel du Centre national de gestion'],
    ['Dernière vérification', '4 octobre 2026'],
  ],
  autres: [
    { nom: 'Faculté d’odontologie', ville: 'Toulouse', d: 'Université publique' },
    { nom: 'Faculté d’odontologie', ville: 'Montpellier', d: 'Université publique' },
    { nom: 'Faculté d’odontologie', ville: 'Nantes', d: 'Université publique' },
  ],
  majLe: '12 septembre 2026',
}
