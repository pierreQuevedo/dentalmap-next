/**
 * Textes courts de la page « Le projet DentalMap ». Chaque phrase reprend une règle écrite
 * dans `docs/handoff/00-contexte-et-decisions.md`, `03-gamification.md`,
 * `06-annexe-informations-et-poids.md`, `docs/pro-sante-connect.md` ou la
 * copie de l'accueil (`HomeStats`, `HomeProcess`). Aucun chiffre en dur.
 */

/** Liens internes de la page, sans slash final comme dans `@/lib/navigation`. */
export const LIENS = {
  faq: '/faq',
  contact: '/contact',
  partenaires: '/partenaires',
  erreur: '/contact?objet=erreur-fiche',
  revendiquer: '/espace-pro/revendiquer',
  donnees: '/confidentialite',
}

/** Bande défilante : registres et métiers. */
export const DEFILE = [
  'Annuaire Santé',
  'RPPS',
  'ADELI',
  'Sirene',
  'Référentiel UAI',
  'Chirurgiens-dentistes',
  'Stomatologues',
  'Chirurgiens maxillo-faciaux',
  'ORL',
  'Laboratoires de prothèse',
  'Écoles de prothèse',
  'Facultés d’odontologie',
]

export type Etape = { titre: string; texte: string; visuel: 'registre' | 'synchro' | 'separe' | 'identite' | 'date' }

/** Les cinq étapes de la méthode, une phrase chacune. */
export const ETAPES: Etape[] = [
  {
    titre: 'Le registre crée la fiche',
    texte: 'Annuaire Santé de l’ANS pour les praticiens, Sirene pour les laboratoires. Aucune fiche n’est créée à la demande.',
    visuel: 'registre',
  },
  {
    titre: 'Rapprochée chaque jour',
    texte: 'Les registres sont resynchronisés chaque jour, et la date du dernier passage est affichée telle quelle.',
    visuel: 'synchro',
  },
  {
    titre: 'Le registre ne se modifie pas',
    texte: 'Ce que le praticien ajoute est stocké à part et affiché « renseigné par le praticien ».',
    visuel: 'separe',
  },
  {
    titre: 'Une identité prouvée',
    texte: 'Pour compléter sa fiche, le professionnel la revendique. Son identité est confirmée par Pro Santé Connect, ou par l’équipe sur justificatif.',
    visuel: 'identite',
  },
  {
    titre: 'Datée, et retirable',
    texte: 'Chaque information déclarée porte sa date. Une fiche retirée disparaît et n’est pas recréée.',
    visuel: 'date',
  },
]

export type Profil = {
  cle: string
  onglet: string
  titre: string
  texte: string
  image: string
  methodes: { nom: string; delai?: string }[]
}

/** Revendication par profil. Le patient n'a rien à revendiquer : son onglet dit ce qu'on lui demande. */
export const PROFILS: Profil[] = [
  {
    cle: 'praticien',
    onglet: 'Praticien',
    titre: 'Chirurgien-dentiste ou spécialiste',
    texte: 'Votre identité est confirmée par Pro Santé Connect, ou par l’équipe sur justificatif PDF.',
    image: '/images/demo/pexels-6627471.jpg',
    methodes: [
      { nom: 'Pro Santé Connect', delai: 'Immédiat' },
      { nom: 'Carte d’identité, FranceConnect+', delai: 'Bientôt' },
      { nom: 'Avec l’équipe', delai: 'Sur demande' },
    ],
  },
  {
    cle: 'laboratoire',
    onglet: 'Laboratoire',
    titre: 'Laboratoire de prothèse',
    texte: 'Kbis ou courrier au siège. Un mandat signé si la demande vient d’un salarié.',
    image: '/images/fiche-laboratoire.png',
    methodes: [{ nom: 'Kbis', delai: '48 h' }, { nom: 'Courrier au siège' }, { nom: 'Mandat si salarié' }],
  },
  {
    cle: 'etablissement',
    onglet: 'Établissement',
    titre: 'École ou faculté',
    texte: 'Une adresse sur le domaine de l’établissement, ou une attestation de fonction.',
    image: '/images/demo/pexels-19879741.jpg',
    methodes: [
      { nom: 'Email du domaine', delai: 'Immédiat' },
      { nom: 'Attestation de fonction', delai: '48 h' },
    ],
  },
  {
    cle: 'patient',
    onglet: 'Patient',
    titre: 'Vous cherchez un soin',
    texte: 'Rien à revendiquer. Une ville suffit pour chercher, et un compte ne demande que votre email.',
    image: '/images/demo/pexels-3881296.jpg',
    methodes: [{ nom: 'Sans géolocalisation' }, { nom: 'Email seulement' }, { nom: 'Aucune donnée de santé' }],
  },
]

export const FAQ = [
  {
    q: 'D’où viennent les informations d’une fiche ?',
    r: 'Des registres publics, en lecture seule. Ce que le professionnel ajoute est affiché à part, avec sa date.',
  },
  {
    q: 'Faut-il envoyer un document pour revendiquer une fiche ?',
    r: 'Pas avec Pro Santé Connect : l’identité est confirmée en une minute. Sans carte CPS, un justificatif PDF vérifié par l’équipe sous 48 heures ouvrées. Un laboratoire joint un extrait Kbis.',
  },
  {
    q: 'Comment une fiche remonte-t-elle dans les résultats ?',
    r: 'En se complétant. Horaires, photo, présentation, informations tenues à jour, partages : chaque ajout compte, et une fiche complète passe devant dans les recherches de son secteur.',
  },
  {
    q: 'Un professionnel peut-il faire retirer sa fiche ?',
    r: 'Oui, à tout moment, après vérification de son identité. La page disparaît et n’est pas recréée.',
  },
]
