/**
 * Textes des trois pages légales : mentions légales, conditions d'utilisation
 * et politique de confidentialité. Relecture par un juriste à prévoir avant la
 * mise en ligne. Rien n'est inventé : ce qui n'est pas établi dans le dépôt est
 * un champ entre crochets, « [À compléter : …] », « [À valider : …] » ou
 * « [À confirmer : …] », surligné à l'affichage pour qu'aucun ne passe
 * inaperçu.
 *
 * Sources : `AGENTS.md`, `docs/architecture-v2-nextjs-headless.md` (Vercel,
 * Neon Francfort, WordPress sur OVH, BAN), `docs/handoff/00`, `03`, `04`
 * (aucun document d'identité reçu, purge des candidatures, retrait annulable),
 * `06`, `docs/phase-1-donnees.md`, `docs/pro-sante-connect.md`, et `src/`
 * pour les cookies réels (`src/lib/auth.ts`, `src/lib/psc/etat.ts`,
 * `src/lib/espace-pro/saisie.ts`, `src/lib/espace-pro/etablissement.ts`,
 * `next-themes`, `src/components/map/style.ts`).
 */

/** Un bloc d'article : un paragraphe, ou une liste de puces. */
export type Bloc = string | { liste: string[] } | { tableau: { entetes: string[]; lignes: string[][] } }

export type Article = { id: string; titre: string; blocs: Bloc[] }

export type PageLegale = {
  slug: 'mentions-legales' | 'cgu' | 'confidentialite'
  titre: string
  chapo: string
  version: string
  majLe: string
  enBref: string[]
  articles: Article[]
}

const VERSION = 'Version 0.1'
const MAJ = '12 octobre 2026'

export const PAGES: PageLegale[] = [
  {
    slug: 'mentions-legales',
    titre: 'Mentions légales',
    chapo: 'Qui édite DentalMap, qui l’héberge, et d’où viennent ses données.',
    version: VERSION,
    majLe: MAJ,
    enBref: [
      'DentalMap est édité par [À compléter : raison sociale].',
      'Le site est hébergé par Vercel ; la base de l’annuaire, par Neon.',
      'Les fiches viennent de registres publics : Annuaire Santé de l’ANS et base Sirene de l’INSEE.',
      'Pour toute question : [À compléter : email de contact].',
    ],
    articles: [
      {
        id: 'editeur',
        titre: 'Éditeur du site',
        blocs: [
          {
            tableau: {
              entetes: ['', ''],
              lignes: [
                ['Raison sociale', '[À compléter : raison sociale]'],
                ['Forme juridique et capital', '[À compléter : forme juridique, capital social]'],
                ['Siège social', '[À compléter : adresse du siège]'],
                ['SIREN et RCS', '[À compléter : SIREN, ville du RCS]'],
                ['Numéro de TVA intracommunautaire', '[À compléter : numéro de TVA]'],
                ['Directeur de la publication', '[À compléter : nom et qualité]'],
                ['Contact', '[À compléter : email de contact]'],
              ],
            },
          },
        ],
      },
      {
        id: 'hebergement',
        titre: 'Hébergement',
        blocs: [
          {
            tableau: {
              entetes: ['Service', 'Prestataire', 'Localisation des données'],
              lignes: [
                ['Site dentalmap.fr', 'Vercel Inc. [À compléter : adresse]', '[À confirmer : région d’exécution]'],
                ['Base de l’annuaire et des comptes', 'Neon [À compléter : raison sociale et adresse]', 'Francfort, Allemagne [À confirmer]'],
                ['Contenus éditoriaux (WordPress)', 'OVH [À compléter : raison sociale et adresse]', '[À confirmer : localisation]'],
                ['Photos déposées par les professionnels', 'Vercel Blob', '[À confirmer : localisation]'],
                ['Envoi des emails', 'Resend [À compléter : raison sociale et adresse]', '[À confirmer : localisation]'],
              ],
            },
          },
        ],
      },
      {
        id: 'sources',
        titre: 'Sources des données de l’annuaire',
        blocs: [
          'Les fiches de l’annuaire sont construites à partir de registres publics, en lecture seule, et rapprochées chaque jour :',
          {
            liste: [
              'Annuaire Santé de l’Agence du Numérique en Santé (ANS) : identité, profession, spécialité et lieux d’exercice des praticiens (numéros RPPS et ADELI). [À compléter : licence de réutilisation]',
              'Base Sirene de l’Institut national de la statistique et des études économiques (INSEE) : établissements, adresses et cessations d’activité. [À compléter : licence de réutilisation]',
              'Référentiel UAI de l’Éducation nationale, pour les établissements de formation. [À compléter : licence de réutilisation]',
              'Base Adresse Nationale et API Géo de l’État, pour placer les adresses sur la carte et rattacher les communes. [À compléter : licence de réutilisation]',
            ],
          },
          'Ce que les professionnels ajoutent à leur fiche est affiché à part, avec la mention « renseigné par le praticien » et sa date de confirmation.',
          'Fond de plan : OpenFreeMap, OpenMapTiles, données © contributeurs OpenStreetMap.',
        ],
      },
      {
        id: 'propriete',
        titre: 'Propriété intellectuelle',
        blocs: [
          'La structure du site, ses textes, ses visuels et sa marque sont la propriété de [À compléter : raison sociale] ou de leurs auteurs, sauf mention contraire. Toute reproduction sans autorisation est interdite.',
          'Les données issues des registres publics restent soumises aux conditions de réutilisation de leurs producteurs. Les photos et textes déposés par un professionnel restent sa propriété ; il autorise leur affichage sur sa fiche.',
        ],
      },
      {
        id: 'signalement',
        titre: 'Signaler un contenu',
        blocs: [
          'Une information fausse sur une fiche, ou un contenu qui vous semble illicite, se signale depuis la fiche ou le formulaire de contact, sans créer de compte.',
        ],
      },
    ],
  },
  {
    slug: 'cgu',
    titre: 'Conditions d’utilisation',
    chapo: 'Les règles d’usage de DentalMap, pour les visiteurs, les professionnels et les recruteurs.',
    version: VERSION,
    majLe: MAJ,
    enBref: [
      'Les résultats sont classés par distance, puis par ordre alphabétique.',
      'Les données de registre ne sont pas modifiables ; ce qu’ajoute un professionnel est affiché à part.',
      'Pour compléter une fiche, il faut prouver son identité ; une fiche peut être retirée à tout moment.',
      'Une offre d’emploi vient d’un recruteur vérifié et affiche sa rémunération.',
      'DentalMap ne prend pas de rendez-vous et ne donne pas d’avis médical.',
    ],
    articles: [
      {
        id: 'objet',
        titre: 'Objet',
        blocs: [
          'Les présentes conditions encadrent l’utilisation du site DentalMap, annuaire dentaire vérifié par les registres officiels, de ses ressources, de sa partie formation, de sa partie emploi et de l’espace pro. Utiliser le site vaut acceptation de ces conditions.',
        ],
      },
      {
        id: 'service',
        titre: 'Le service',
        blocs: [
          'DentalMap permet de trouver un chirurgien-dentiste, un spécialiste, un laboratoire de prothèse ou un établissement de formation, et de le contacter directement.',
          {
            liste: [
              'DentalMap ne prend pas de rendez-vous et ne s’interpose pas entre le patient et le professionnel.',
              'Le numéro affiché est celui du cabinet, sans numéro de suivi.',
              'Les contenus du site ne remplacent pas l’avis d’un professionnel de santé.',
            ],
          },
          'Les conditions financières du service pour les professionnels : [À compléter : offre et tarifs, le cas échéant].',
        ],
      },
      {
        id: 'classement',
        titre: 'Classement des résultats',
        blocs: [
          'Les résultats sont classés par distance, puis par ordre alphabétique. Cette règle est la seule appliquée.',
          'Le classement ne dépend ni de la complétude d’une fiche, ni d’un score. Une information renseignée permet seulement d’apparaître dans le filtre correspondant (par exemple « Ouvert maintenant » ou « Tiers payant »). Les distinctions attribuées dans l’espace pro sont privées et ne sont pas affichées aux patients.',
        ],
      },
      {
        id: 'fiches',
        titre: 'Les fiches',
        blocs: [
          {
            liste: [
              'Les fiches sont créées uniquement par la synchronisation des registres publics. Aucune fiche n’est créée à la demande.',
              'Les données de registre sont en lecture seule, y compris pour le professionnel concerné.',
              'Les informations déclarées par un professionnel sont enregistrées à part, affichées « renseigné par le praticien » et datées. Des rappels l’invitent à les reconfirmer ; des horaires non confirmés depuis six mois sont signalés comme tels.',
              'Chacun peut signaler une erreur, sans compte. Quand la correction dépend d’un registre, DentalMap l’indique publiquement.',
            ],
          },
        ],
      },
      {
        id: 'compte',
        titre: 'Compte utilisateur',
        blocs: [
          'Un compte se crée avec une adresse email et un mot de passe ; un code à six chiffres envoyé par email confirme l’adresse. L’utilisateur garde ses identifiants confidentiels et répond de leur usage.',
          '[À compléter : conditions de suspension ou de suppression d’un compte par l’éditeur]',
        ],
      },
      {
        id: 'espace-pro',
        titre: 'Espace pro',
        blocs: [
          'Un professionnel peut revendiquer sa fiche après vérification de son identité :',
          {
            liste: [
              'praticien de santé : Pro Santé Connect, ou vérification avec l’équipe ; aucun document d’identité n’est reçu ;',
              'laboratoire de prothèse : extrait Kbis ou courrier au siège, et mandat signé si la demande vient d’un salarié ;',
              'établissement de formation : adresse email sur le domaine de l’établissement, ou attestation de fonction.',
            ],
          },
          'Le professionnel garantit l’exactitude de ce qu’il déclare. Une présentation ne doit contenir ni promesse de résultat, ni comparaison, ni prix. Une photo ne doit montrer aucun patient identifiable. DentalMap peut retirer un contenu qui ne respecte pas ces règles. [À valider : liste des termes refusés et procédure de retrait d’un contenu]',
          'Un professionnel peut demander le retrait de sa fiche à tout moment, après la même vérification d’identité. La page disparaît du site et n’est pas recréée par la synchronisation. Le retrait est annulable pendant 30 jours.',
        ],
      },
      {
        id: 'emploi',
        titre: 'Offres d’emploi',
        blocs: [
          {
            liste: [
              'Seul un recruteur dont la fiche est vérifiée peut publier une offre, depuis son espace pro.',
              'Chaque offre affiche une rémunération brute en fourchette. Elle est publiée 30 jours.',
              'Une offre ne peut contenir aucun critère discriminatoire au sens du Code du travail, ni porter sur un poste fictif. DentalMap peut retirer une offre qui ne respecte pas ces règles.',
              'La candidature nécessite un compte. Les coordonnées d’un candidat ne sont transmises au recruteur que s’il accepte sa proposition d’échange.',
            ],
          },
        ],
      },
      {
        id: 'responsabilite',
        titre: 'Responsabilité',
        blocs: [
          'DentalMap s’efforce de tenir les fiches à jour à partir de sources officielles, sans pouvoir garantir l’absence d’erreur ou de retard d’un registre. Les informations déclarées le sont sous la responsabilité de leur auteur.',
          'DentalMap n’est pas responsable des sites tiers vers lesquels il renvoie, ni d’une interruption du service due à la maintenance ou à un cas de force majeure.',
        ],
      },
      {
        id: 'propriete',
        titre: 'Propriété intellectuelle',
        blocs: ['Voir les mentions légales. L’extraction systématique des données du site est interdite sans accord écrit. [À valider par le juriste : droit du producteur de bases de données]'],
      },
      {
        id: 'droit',
        titre: 'Modification et droit applicable',
        blocs: [
          'Ces conditions peuvent évoluer ; la version en vigueur et sa date sont affichées en haut de page. Elles sont soumises au droit français. À défaut d’accord amiable, les tribunaux compétents sont ceux de [À compléter : ressort], sous réserve des règles protectrices du consommateur.',
        ],
      },
    ],
  },
  {
    slug: 'confidentialite',
    titre: 'Politique de confidentialité',
    chapo: 'Les données que DentalMap traite, pourquoi, combien de temps, et vos droits.',
    version: VERSION,
    majLe: MAJ,
    enBref: [
      'Un compte patient ne demande que votre email. Aucune donnée de santé n’est demandée.',
      'Aucun document d’identité n’est demandé à un praticien : son identité est confirmée par Pro Santé Connect, qui ne nous transmet que son nom et son numéro RPPS.',
      'Le site ne dépose ni cookie publicitaire, ni cookie de mesure d’audience.',
      'Vous pouvez accéder à vos données, les corriger ou les faire supprimer.',
    ],
    articles: [
      {
        id: 'responsable',
        titre: 'Responsable du traitement',
        blocs: [
          '[À compléter : raison sociale, adresse du siège], représentée par [À compléter : nom]. Contact pour vos données : [À compléter : email dédié]. Délégué à la protection des données : [À compléter : DPO, s’il est désigné].',
        ],
      },
      {
        id: 'donnees',
        titre: 'Données traitées',
        blocs: [
          {
            tableau: {
              entetes: ['Qui', 'Données', 'Pourquoi'],
              lignes: [
                ['Visiteur', 'Ville ou code postal saisis pour la recherche (aucune géolocalisation imposée)', 'Afficher les résultats'],
                ['Patient avec compte', 'Email, mot de passe (conservé sous forme d’empreinte), favoris', 'Compte et favoris'],
                ['Professionnel', 'Compte, demande de revendication, informations déclarées (horaires, langues, accessibilité, photo, présentation…)', 'Gérer et compléter sa fiche'],
                ['Laboratoire, extrait Kbis', 'Stockage privé, lu par l’équipe de vérification seule', 'Vérifier le gérant'],
                ['Candidat emploi', 'Profil, candidatures, alertes, choix de visibilité (anonymisé ou discret)', 'Candidater, recevoir des alertes'],
                ['Recruteur', 'Offres publiées, échanges avec les candidats', 'Publier et recruter'],
                ['Toute personne', 'Messages envoyés par le formulaire de contact et signalements', 'Répondre, corriger les fiches'],
              ],
            },
          },
          'Aucune donnée de santé n’est demandée, nulle part sur le site.',
        ],
      },
      {
        id: 'fiches',
        titre: 'Les fiches des professionnels',
        blocs: [
          'Les fiches reprennent des données publiées par des registres publics (Annuaire Santé de l’ANS, base Sirene de l’INSEE). Base légale : intérêt légitime à informer le public sur l’offre de soins [À valider par le juriste].',
          'Un professionnel peut s’opposer à l’affichage de sa fiche : après vérification de son identité, la page disparaît du site et n’est pas recréée par la synchronisation des registres.',
        ],
      },
      {
        id: 'bases-legales',
        titre: 'Bases légales',
        blocs: [
          {
            liste: [
              'Exécution du service demandé : compte, favoris, espace pro, candidatures.',
              'Intérêt légitime : annuaire construit depuis les registres, sécurité du site, réponse aux signalements. [À valider par le juriste]',
              'Consentement : alertes emploi par email, et visibilité du profil candidat. [À valider par le juriste]',
              'Obligation légale : conservation de certaines données à la demande des autorités. [À valider par le juriste]',
            ],
          },
        ],
      },
      {
        id: 'durees',
        titre: 'Durées de conservation',
        blocs: [
          {
            tableau: {
              entetes: ['Données', 'Durée'],
              lignes: [
                ['Extrait Kbis d’un laboratoire', '30 jours après la décision'],
                ['Session de connexion', '30 jours'],
                ['Code de connexion envoyé par email', '10 minutes'],
                ['Candidatures et CV', '6 mois après la clôture de l’offre [À valider]'],
                ['Offres d’emploi', 'Publiées 30 jours [À compléter : durée de conservation après retrait]'],
                ['Compte inactif', '[À compléter : durée]'],
                ['Messages de contact', '[À compléter : durée]'],
                ['Données de registre d’une fiche retirée', '[À compléter : durée, et conservation du seul marqueur de retrait]'],
              ],
            },
          },
        ],
      },
      {
        id: 'destinataires',
        titre: 'Destinataires et sous-traitants',
        blocs: [
          'Vos données ne sont ni vendues ni louées. Elles sont traitées par les prestataires techniques suivants, pour le compte de DentalMap :',
          {
            liste: [
              'Vercel : hébergement du site et des photos déposées. [À confirmer : localisation et garanties de transfert]',
              'Neon : base de données, région de Francfort. [À confirmer]',
              'Resend : envoi des emails. [À confirmer : localisation et garanties de transfert]',
              'OVH : hébergement des contenus éditoriaux (WordPress), qui ne contient pas de données de compte. [À confirmer]',
              'Agence du Numérique en Santé, pour Pro Santé Connect, si vous choisissez cette méthode : DentalMap reçoit votre numéro RPPS et votre profession.',
              'OpenFreeMap : votre navigateur télécharge le fond de plan de la carte depuis ses serveurs, qui reçoivent donc votre adresse IP. [À confirmer : mention exacte]',
            ],
          },
          'Un recruteur ne reçoit les coordonnées d’un candidat que si celui-ci accepte sa proposition d’échange.',
        ],
      },
      {
        id: 'cookies',
        titre: 'Cookies et stockage local',
        blocs: [
          'DentalMap ne dépose aucun cookie publicitaire ni de mesure d’audience. Les seuls cookies et stockages utilisés sont nécessaires au fonctionnement du site ou mémorisent un choix de votre part ; ils ne demandent pas de consentement. [À valider par le juriste]',
          {
            tableau: {
              entetes: ['Nom', 'Rôle', 'Durée'],
              lignes: [
                ['Session de connexion (Better Auth)', 'Vous garder connecté', '30 jours'],
                ['dm_psc', 'Suivre une connexion Pro Santé Connect en cours', '10 minutes'],
                ['dm_psc_identite', 'Retenir l’identité renvoyée par Pro Santé Connect le temps de la confirmer', '10 minutes'],
                ['dm_saisie', 'Conserver une saisie de l’espace pro entre deux écrans', '1 minute'],
                ['dm_partenariat', 'Afficher la confirmation d’une demande de partenariat', '10 minutes'],
                ['theme (stockage local)', 'Retenir le thème clair ou sombre choisi', 'Jusqu’à effacement par le navigateur'],
              ],
            },
          },
          'Les polices du site sont servies par DentalMap lui-même : aucun appel à un service de polices tiers.',
        ],
      },
      {
        id: 'droits',
        titre: 'Vos droits',
        blocs: [
          'Vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition, de limitation du traitement et de portabilité de vos données, ainsi que du droit de définir des directives sur leur sort après votre décès.',
          'Pour les exercer : [À compléter : email dédié] ou le formulaire de contact. Une réponse vous est apportée dans un délai d’un mois. [À valider]',
          'Vous pouvez introduire une réclamation auprès de la Commission nationale de l’informatique et des libertés (CNIL), www.cnil.fr.',
        ],
      },
      {
        id: 'securite',
        titre: 'Sécurité',
        blocs: [
          'Les échanges sont chiffrés (HTTPS). Les codes envoyés par courrier aux laboratoires sont comparés sur empreinte. Les photos déposées sont débarrassées de leurs métadonnées (EXIF). [À compléter : autres mesures]',
        ],
      },
    ],
  },
]

/** Une page par son slug, qui est aussi son chemin : `/cgu/`, `/confidentialite/`… */
export function pageLegale(slug: PageLegale['slug']): PageLegale {
  return PAGES.find((p) => p.slug === slug)!
}
