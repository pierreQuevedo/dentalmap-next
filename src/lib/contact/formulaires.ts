import type { Objet } from './objets'

/**
 * Les formulaires dédiés de la page contact : un par entrée, chacun avec les
 * champs qui servent à traiter sa demande. Partagé par le client (rendu) et
 * le serveur (validation et contenu du courriel), sans React.
 *
 * Les champs communs (prénom, nom, adresse, message, consentement) sont
 * toujours présents ; `champs` ne liste que ce qui est propre à l'entrée.
 */
export type ChampDedie = {
  nom: CleDetail
  libelle: string
  type: 'texte' | 'liste'
  requis?: boolean
  placeholder?: string
  options?: readonly (readonly [string, string])[]
}

export type FormulaireDedie = {
  titre: string
  intro: string
  champs: readonly ChampDedie[]
  /** Libellé du message libre. */
  message: string
  placeholder: string
  /** Le téléphone est proposé, facultatif. */
  telephone?: boolean
  /** Lien utile affiché sous l'intro. */
  lien?: { libelle: string; href: string }
}

/** Les champs propres aux entrées, seuls acceptés par l'action en plus des champs communs. */
export const CLES_DETAILS = ['fiche', 'erreur', 'rpps', 'sujet', 'laboratoire', 'siren', 'changement', 'page', 'motif', 'media', 'echeance', 'droit'] as const
export type CleDetail = (typeof CLES_DETAILS)[number]

export const FORMULAIRES: Record<Exclude<Objet, 'partenariat'>, FormulaireDedie> = {
  'erreur-fiche': {
    titre: 'Une erreur sur une fiche',
    intro: 'Nous vérifions auprès des registres officiels, puis nous corrigeons.',
    champs: [
      { nom: 'fiche', libelle: 'Fiche concernée', type: 'texte', requis: true, placeholder: 'Lien de la fiche ou nom du praticien' },
      {
        nom: 'erreur',
        libelle: 'Ce qui est inexact',
        type: 'liste',
        requis: true,
        options: [
          ['adresse', 'L’adresse'],
          ['telephone', 'Le téléphone'],
          ['horaires', 'Les horaires'],
          ['n-exerce-plus', 'Le praticien n’exerce plus ici'],
          ['profession', 'La profession ou la spécialité'],
          ['autre', 'Autre chose'],
        ],
      },
    ],
    message: 'Ce que vous avez constaté',
    placeholder: 'Par exemple : le cabinet a déménagé au 12 rue…',
  },
  praticien: {
    titre: 'Ma fiche ou mon espace pro',
    intro: 'Revendication, connexion, modification ou retrait de votre fiche.',
    champs: [
      { nom: 'rpps', libelle: 'Numéro RPPS', type: 'texte', placeholder: '11 chiffres, facultatif' },
      {
        nom: 'sujet',
        libelle: 'Votre demande',
        type: 'liste',
        requis: true,
        options: [
          ['revendication', 'Revendiquer ma fiche'],
          ['connexion', 'Me connecter à mon espace'],
          ['modification', 'Modifier une information'],
          ['retrait', 'Retirer ma fiche'],
          ['autre', 'Autre chose'],
        ],
      },
    ],
    message: 'Votre message',
    placeholder: 'Ce que vous souhaitez faire, et ce qui bloque.',
    telephone: true,
    lien: { libelle: 'Revendiquer ma fiche directement', href: '/espace-pro/revendiquer' },
  },
  laboratoire: {
    titre: 'Mon laboratoire',
    intro: 'Un changement d’activité, de nom ou d’adresse, ou une question sur votre fiche.',
    champs: [
      { nom: 'laboratoire', libelle: 'Nom du laboratoire', type: 'texte', requis: true },
      { nom: 'siren', libelle: 'SIREN', type: 'texte', placeholder: '9 chiffres, facultatif' },
      {
        nom: 'changement',
        libelle: 'Votre demande',
        type: 'liste',
        requis: true,
        options: [
          ['nom', 'Changement de nom'],
          ['adresse', 'Changement d’adresse'],
          ['activite', 'Changement d’activité'],
          ['fermeture', 'Fermeture'],
          ['autre', 'Autre chose'],
        ],
      },
    ],
    message: 'Votre message',
    placeholder: 'Ce qui a changé, et depuis quand.',
    telephone: true,
  },
  annonce: {
    titre: 'Une offre, une annonce ou une formation',
    intro: 'Une publication qui vous paraît inexacte, expirée ou abusive : nous la vérifions.',
    champs: [
      { nom: 'page', libelle: 'Page concernée', type: 'texte', requis: true, placeholder: 'Lien de l’offre, de l’annonce ou de la formation' },
      {
        nom: 'motif',
        libelle: 'Le problème',
        type: 'liste',
        requis: true,
        options: [
          ['inexacte', 'Informations inexactes'],
          ['expiree', 'Poste pourvu ou annonce expirée'],
          ['abusive', 'Contenu abusif ou trompeur'],
          ['discriminatoire', 'Critère discriminatoire'],
          ['autre', 'Autre chose'],
        ],
      },
    ],
    message: 'Ce que vous avez constaté',
    placeholder: 'Ce qui pose problème dans cette publication.',
  },
  presse: {
    titre: 'Une demande presse',
    intro: 'Chiffres de l’annuaire, méthode de vérification, entretiens.',
    champs: [
      { nom: 'media', libelle: 'Média', type: 'texte', requis: true },
      { nom: 'echeance', libelle: 'Date de bouclage', type: 'texte', placeholder: 'Facultatif' },
    ],
    message: 'Votre demande',
    placeholder: 'Le sujet, l’angle, ce dont vous avez besoin.',
    telephone: true,
  },
  donnees: {
    titre: 'Mes données personnelles',
    intro: 'Nous répondons sous un mois au plus, comme le prévoit le RGPD.',
    champs: [
      {
        nom: 'droit',
        libelle: 'Le droit que vous exercez',
        type: 'liste',
        requis: true,
        options: [
          ['acces', 'Accès'],
          ['rectification', 'Rectification'],
          ['effacement', 'Effacement'],
          ['opposition', 'Opposition'],
          ['limitation', 'Limitation'],
          ['portabilite', 'Portabilité'],
          ['autre', 'Autre chose'],
        ],
      },
    ],
    message: 'Votre demande',
    placeholder: 'Les données concernées et ce que vous souhaitez.',
    lien: { libelle: 'Lire la politique de confidentialité', href: '/confidentialite' },
  },
  autre: {
    titre: 'Une autre demande',
    intro: 'Une question sur l’annuaire, une suggestion : une personne de l’équipe vous répond.',
    champs: [],
    message: 'Votre message',
    placeholder: 'Ce que vous souhaitez nous dire ou nous demander.',
    telephone: true,
  },
}

/** Le libellé d'une valeur de liste, pour le courriel. */
export function libelleDetail(objet: Exclude<Objet, 'partenariat'>, cle: CleDetail, valeur: string): { libelle: string; valeur: string } {
  const champ = FORMULAIRES[objet].champs.find((c) => c.nom === cle)
  const option = champ?.options?.find(([v]) => v === valeur)
  return { libelle: champ?.libelle ?? cle, valeur: option?.[1] ?? valeur }
}
