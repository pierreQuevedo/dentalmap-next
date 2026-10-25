/**
 * Questions de la page `/faq/`, rangées par catégorie. Elles ont la forme du
 * type de contenu `faq` de WordPress (question, réponse, ordre) plus une
 * catégorie, que WordPress ne porte pas encore : tant que ce champ n'existe
 * pas, la liste vit ici plutôt que dans `getFaq()`.
 *
 * Chaque réponse reprend une règle déjà écrite : `docs/handoff/00-contexte-et-decisions.md`,
 * `03-gamification.md`, `06-annexe-informations-et-poids.md`,
 * `docs/pro-sante-connect.md`, la copie de l'accueil (`HomeStats`,
 * `HomeProcess`), la page Favoris et les annonces d'emploi. Aucun chiffre en dur.
 */
import { faqPage } from '@/lib/seo/jsonld'

export type Question = {
  /** Champ `ordre` du CPT : tri dans la catégorie. */
  ordre: number
  question: string
  reponse: string
  lien?: { texte: string; href: string }
}

export type Categorie = {
  slug: string
  titre: string
  pour: string
  questions: Question[]
}

export const CATEGORIES: Categorie[] = [
  {
    slug: 'trouver',
    titre: 'Trouver un professionnel',
    pour: 'Pour les patients',
    questions: [
      {
        ordre: 1,
        question: 'D’où viennent les fiches ?',
        reponse:
          'Des registres publics : l’Annuaire Santé de l’ANS pour les praticiens, la base Sirene de l’INSEE pour les cabinets et les laboratoires. Une fiche existe avant toute inscription du professionnel.',
      },
      {
        ordre: 2,
        question: 'Que veut dire « Vérifié auprès des registres officiels » ?',
        reponse:
          'La fiche a été rapprochée d’un registre public : numéro RPPS ou ADELI, profession et spécialité, ou établissement ouvert au répertoire Sirene. Ce rapprochement est refait chaque jour.',
      },
      {
        ordre: 3,
        question: 'Que veut dire « Renseigné par le praticien » ?',
        reponse:
          'L’information a été ajoutée par le professionnel, après vérification de son identité. Elle est enregistrée à part du registre et porte sa date de confirmation.',
      },
      {
        ordre: 4,
        question: 'Que me demande-t-on pour chercher ?',
        reponse:
          'Une ville, un code postal ou une adresse : la recherche fonctionne sans géolocalisation. Un compte patient ne demande que votre email, et aucune donnée de santé ne vous est demandée.',
      },
      {
        ordre: 5,
        question: 'À quoi servent les favoris ?',
        reponse: 'À mettre des fiches de côté pour les retrouver sur tous vos appareils. Ils sont liés à votre compte.',
      },
    ],
  },
  {
    slug: 'fiches',
    titre: 'Les fiches et leur vérification',
    pour: 'Pour tous',
    questions: [
      {
        ordre: 1,
        question: 'À quelle fréquence les fiches sont-elles vérifiées ?',
        reponse: 'Les registres sont resynchronisés chaque jour. La date du dernier passage est affichée telle quelle, même en cas de retard.',
      },
      {
        ordre: 2,
        question: 'Une information est fausse : que faire ?',
        reponse:
          'Signalez-la depuis la fiche ou le formulaire de contact, sans créer de compte. Quand la correction dépend d’un registre officiel, nous l’indiquons publiquement.',
        lien: { texte: 'Signaler une erreur sur une fiche', href: '/contact?objet=erreur-fiche' },
      },
      {
        ordre: 3,
        question: 'Un praticien peut-il modifier les données du registre ?',
        reponse:
          'Non. Nom, profession, numéro RPPS et lieux d’exercice viennent du registre et restent en lecture seule. Le praticien ajoute ses propres informations à part, comme ses horaires ou ses langues parlées.',
      },
      {
        ordre: 4,
        question: 'Les informations déclarées sont-elles à jour ?',
        reponse:
          'Chaque information déclarée porte sa date de confirmation, et des rappels invitent le professionnel à la reconfirmer. Des horaires non confirmés depuis six mois sont signalés comme tels sur la fiche.',
      },
      {
        ordre: 5,
        question: 'Peut-on demander la création d’une fiche ?',
        reponse: 'Non. Seule la synchronisation des registres crée des fiches : aucune n’est créée à la demande.',
      },
    ],
  },
  {
    slug: 'professionnels',
    titre: 'Professionnels',
    pour: 'Praticiens, laboratoires, établissements',
    questions: [
      {
        ordre: 1,
        question: 'Comment revendiquer ma fiche ?',
        reponse:
          'Avec Pro Santé Connect (carte CPS ou e-CPS), en une minute. Sans carte, l’équipe vérifie votre identité avec vous. Il vous demande alors un justificatif en PDF, qu’il contrôle sous 48 heures ouvrées. Bientôt, la carte d’identité par l’application France Identité.',
        lien: { texte: 'Revendiquer ma fiche', href: '/espace-pro/revendiquer' },
      },
      {
        ordre: 2,
        question: 'Dois-je envoyer un document ?',
        reponse: 'Non. Votre identité est confirmée à la source, par Pro Santé Connect ou bientôt par FranceConnect+ : nous ne recevons ni copie de carte ni attestation. Seul un laboratoire joint un extrait Kbis.',
      },
      {
        ordre: 3,
        question: 'Je gère un laboratoire de prothèse : comment faire ?',
        reponse:
          'La base Sirene ne publie pas d’email : la vérification passe par un Kbis ou par un courrier au siège. Si vous êtes salarié du laboratoire, un mandat signé vous est demandé.',
      },
      {
        ordre: 4,
        question: 'Je représente une école ou une faculté : comment faire ?',
        reponse: 'Avec une adresse email sur le domaine de l’établissement, immédiatement, ou avec une attestation de fonction, sous 48 h.',
      },
      {
        ordre: 5,
        question: 'Puis-je faire retirer ma fiche ?',
        reponse:
          'Oui, à tout moment, après la même vérification d’identité qu’une revendication. La page disparaît du site et n’est pas recréée par la synchronisation des registres.',
      },
    ],
  },
  {
    slug: 'emploi',
    titre: 'Emploi',
    pour: 'Étudiants, salariés et recruteurs',
    questions: [
      {
        ordre: 1,
        question: 'Qui publie les offres ?',
        reponse: 'Des cabinets, centres de santé et laboratoires dont la fiche est vérifiée, depuis leur espace pro. Sans fiche vérifiée, pas de publication.',
      },
      {
        ordre: 2,
        question: 'La rémunération est-elle affichée ?',
        reponse: 'Oui, sur chaque offre, sous forme de fourchette.',
      },
      {
        ordre: 3,
        question: 'Faut-il un compte pour postuler ?',
        reponse: 'Oui, la candidature se fait avec un compte. Sans postuler, vous pouvez recevoir des alertes par email.',
      },
      {
        ordre: 4,
        question: 'Mes coordonnées sont-elles transmises au recruteur ?',
        reponse: 'Seulement quand vous postulez à son offre : il reçoit alors votre téléphone et votre email avec la candidature. Votre profil disponible, lui, ne les montre jamais.',
      },
      {
        ordre: 5,
        question: 'Mon profil est-il visible des recruteurs ?',
        reponse: 'Vous choisissez : un profil visible mais anonymisé, ou un profil discret.',
      },
    ],
  },
  {
    slug: 'donnees',
    titre: 'Données personnelles',
    pour: 'Pour tous',
    questions: [
      {
        ordre: 1,
        question: 'Quelles données me demandez-vous ?',
        reponse: 'Un compte patient ne demande que votre adresse email. Aucune donnée de santé n’est demandée, nulle part sur le site.',
      },
      {
        ordre: 2,
        question: 'DentalMap sait-il si j’ai appelé un cabinet ?',
        reponse: 'Non. Le numéro affiché est celui du cabinet, sans numéro de suivi.',
      },
      {
        ordre: 3,
        question: 'Comment accéder à mes données ou les faire supprimer ?',
        reponse: 'Les démarches sont décrites dans notre politique de confidentialité. Vous pouvez aussi nous écrire depuis le formulaire de contact.',
        lien: { texte: 'Vos données personnelles', href: '/confidentialite' },
      },
    ],
  },
]

export const TOTAL = CATEGORIES.reduce((n, c) => n + c.questions.length, 0)

/** Le `FAQPage` de la page, produit depuis la même liste que l'accordéon (comme `HomeFaq`). */
export const FAQ_JSONLD = faqPage(CATEGORIES.flatMap((c) => c.questions.map((q) => ({ question: q.question, reponse: q.reponse }))))
