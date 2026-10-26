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
const MAJ = '25 octobre 2026'

export const PAGES: PageLegale[] = [
  {
    slug: 'mentions-legales',
    titre: 'Mentions légales',
    chapo: 'Qui édite DentalMap, qui l’héberge, et d’où viennent ses données.',
    version: VERSION,
    majLe: MAJ,
    enBref: [
      'DentalMap est édité par RINIA, SARL immatriculée au RCS d’Angoulême.',
      'Le site est hébergé par Vercel et la base de l’annuaire par Neon, tous deux à Francfort.',
      'Les fiches viennent de registres publics : Annuaire Santé de l’ANS et base Sirene de l’INSEE.',
      'Pour toute question : contact@dentalmap.fr.',
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
                ['Raison sociale', 'RINIA'],
                ['Forme juridique et capital', 'Société à responsabilité limitée (SARL) au capital de 2 500 €'],
                ['Siège social', 'ZAE Lot La Triquedondaine, 14 D route de la Cigogne, 16300 Barbezieux-Saint-Hilaire'],
                ['SIREN et RCS', '920 221 579 R.C.S. Angoulême'],
                ['Numéro de TVA intracommunautaire', 'FR32920221579'],
                ['Directeur de la publication', 'Pierre Quevedo, gérant'],
                ['Contact', 'contact@dentalmap.fr'],
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
                ['Site dentalmap.fr', 'Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis', 'Francfort, Allemagne'],
                ['Base de l’annuaire et des comptes', 'Neon, LLC (groupe Databricks), 160 Spear Street, Suite 1300, San Francisco, CA 94105, États-Unis', 'Francfort, Allemagne'],
                ['Contenus éditoriaux (WordPress)', 'OVH SAS, 2 rue Kellermann, 59100 Roubaix, France', 'France'],
                ['Photos et justificatifs déposés par les professionnels', 'Vercel Inc. (service Vercel Blob), même adresse', 'Paris, France'],
                ['Envoi des emails', 'Resend, édité par Plus Five Five, Inc., États-Unis', 'Irlande'],
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
              'Annuaire Santé de l’Agence du Numérique en Santé (ANS) : identité, profession, spécialité et lieux d’exercice des praticiens (numéros RPPS et ADELI). Données en libre accès, réutilisées selon les conditions d’usage publiées par l’ANS.',
              'Base Sirene de l’Institut national de la statistique et des études économiques (INSEE) : établissements, adresses et cessations d’activité. Licence Ouverte 2.0 (Etalab).',
              'Référentiel UAI de l’Éducation nationale, pour les établissements de formation. Licence Ouverte 2.0 (Etalab).',
              'Base Adresse Nationale et API Géo de l’État, pour placer les adresses sur la carte et rattacher les communes. Licence Ouverte 2.0 (Etalab).',
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
          'La structure du site, ses textes, ses visuels et sa marque sont la propriété de RINIA ou de leurs auteurs, sauf mention contraire. Toute reproduction sans autorisation est interdite.',
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
          'Des services payants pourront être proposés aux professionnels. Leurs conditions et tarifs seront communiqués avant toute souscription.',
        ],
      },
      {
        id: 'fiches',
        titre: 'Les fiches',
        blocs: [
          {
            liste: [
              'Les fiches sont créées à partir des registres publics. Un professionnel absent du registre peut demander l’ajout de sa fiche : l’équipe vérifie son inscription au registre avant de la créer.',
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
          'DentalMap peut suspendre ou supprimer un compte en cas de manquement à ces conditions, d’usurpation d’identité, de fausse déclaration ou d’usage frauduleux, après en avoir informé l’utilisateur sauf urgence. Un compte inactif depuis deux ans est supprimé, après un email d’avertissement.',
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
          'Le professionnel garantit l’exactitude de ce qu’il déclare. Une présentation ne doit contenir ni promesse de résultat, ni comparaison, ni prix. Une photo ne doit montrer aucun patient identifiable. DentalMap peut retirer un contenu qui ne respecte pas ces règles.',
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
              'La candidature nécessite un compte. En postulant, vous transmettez au recruteur de l’offre votre nom, votre téléphone et votre email.',
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
        blocs: ['Voir les mentions légales. L’extraction systématique des données du site est interdite sans accord écrit.'],
      },
      {
        id: 'droit',
        titre: 'Modification et droit applicable',
        blocs: [
          'Ces conditions peuvent évoluer ; la version en vigueur et sa date sont affichées en haut de page. Elles sont soumises au droit français. À défaut d’accord amiable, les tribunaux compétents sont ceux d’Angoulême, sous réserve des règles protectrices du consommateur.',
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
      'Avec Pro Santé Connect, l’identité d’un praticien est confirmée sans document : nous ne recevons que son nom et son numéro RPPS. Sans carte CPS, un justificatif PDF est demandé, puis supprimé 30 jours après la décision.',
      'Les cookies de mesure d’audience et de publicité ne sont déposés qu’avec votre accord, modifiable à tout moment par le lien « Gérer les cookies » en pied de page.',
      'Vous pouvez accéder à vos données, les corriger ou les faire supprimer.',
    ],
    articles: [
      {
        id: 'responsable',
        titre: 'Responsable du traitement',
        blocs: [
          'RINIA, SARL, ZAE Lot La Triquedondaine, 14 D route de la Cigogne, 16300 Barbezieux-Saint-Hilaire, représentée par Pierre Quevedo, gérant. Contact pour vos données : dpo@dentalmap.fr. Aucun délégué à la protection des données n’est désigné ; cette adresse est suivie par le responsable du traitement.',
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
                ['Étudiant ou salarié (Emploi)', 'Profil, candidatures, alertes, choix de visibilité (anonymisé ou discret)', 'Postuler, recevoir des alertes'],
                ['Recruteur', 'Offres publiées, candidatures reçues', 'Publier et recruter'],
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
          'Les fiches reprennent des données publiées par des registres publics (Annuaire Santé de l’ANS, base Sirene de l’INSEE). Base légale : intérêt légitime à informer le public sur l’offre de soins.',
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
              'Intérêt légitime : annuaire construit depuis les registres, sécurité du site, réponse aux signalements.',
              'Consentement : alertes emploi par email, et visibilité de votre profil emploi.',
              'Obligation légale : conservation de certaines données à la demande des autorités.',
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
                ['Candidatures et CV', '6 mois après la clôture de l’offre'],
                ['Offres d’emploi', 'Publiées 30 jours, conservées 6 mois après leur retrait ou leur expiration'],
                ['Compte inactif', '2 ans sans connexion, après un email d’avertissement'],
                ['Messages de contact', '1 an'],
                ['Fiche retirée', 'Ajouts du professionnel supprimés aussitôt ; seul un marqueur de retrait est conservé, pour que la synchronisation ne recrée pas la fiche'],
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
              'Vercel : hébergement du site (Francfort) et des photos déposées. Société américaine : les transferts éventuels sont encadrés par le Data Privacy Framework et les clauses contractuelles types de la Commission européenne.',
              'Neon : base de données, à Francfort.',
              'Resend : envoi des emails, depuis l’Irlande. Société américaine : transferts éventuels encadrés par les clauses contractuelles types.',
              'OVH : hébergement des contenus éditoriaux (WordPress), en France ; il ne contient pas de données de compte.',
              'Agence du Numérique en Santé, pour Pro Santé Connect, si vous choisissez cette méthode : DentalMap reçoit votre numéro RPPS et votre profession.',
              'OpenFreeMap : votre navigateur télécharge le fond de plan de la carte depuis ses serveurs, qui reçoivent donc votre adresse IP, sans autre donnée.',
            ],
          },
          'Un recruteur ne reçoit vos coordonnées que si vous postulez à son offre.',
        ],
      },
      {
        id: 'cookies',
        titre: 'Cookies et stockage local',
        blocs: [
          'Les cookies nécessaires au fonctionnement du site, ou qui mémorisent un choix de votre part, ne demandent pas de consentement. Les cookies de mesure d’audience et de publicité ne sont déposés qu’avec votre accord, recueilli par le bandeau Axeptio affiché à votre première visite. Refuser est aussi simple qu’accepter, et ne limite pas l’accès au site.',
          'Votre choix est conservé [À confirmer : durée réglée dans la console Axeptio, six mois recommandés par la CNIL], puis vous est redemandé. Vous pouvez le modifier à tout moment par le lien « Gérer les cookies » en pied de page.',
          {
            tableau: {
              entetes: ['Finalité', 'Outils', 'Durée'],
              lignes: [
                ['Mesure d’audience', '[À confirmer : Google Analytics 4, via Google Tag Manager]', '[À confirmer : 13 mois au plus]'],
                [
                  'Publicité et réseaux sociaux',
                  '[À confirmer : Meta Pixel, LinkedIn Insight Tag, Google Ads, selon les balises publiées dans Google Tag Manager]',
                  '[À confirmer : 13 mois au plus]',
                ],
              ],
            },
          },
          'Ces outils peuvent transférer des données hors de l’Union européenne, vers des sociétés établies aux États-Unis, dans le cadre du Data Privacy Framework. [À valider : par un juriste]',
          {
            tableau: {
              entetes: ['Nom', 'Rôle', 'Durée'],
              lignes: [
                ['Session de connexion (Better Auth)', 'Vous garder connecté', '30 jours'],
                ['dm_psc', 'Suivre une connexion Pro Santé Connect en cours', '10 minutes'],
                ['dm_psc_identite', 'Retenir l’identité renvoyée par Pro Santé Connect le temps de la confirmer', '10 minutes'],
                ['dm_saisie', 'Conserver une saisie de l’espace pro entre deux écrans', '1 minute'],
                ['dm_partenariat', 'Afficher la confirmation d’une demande de partenariat', '10 minutes'],
                ['axeptio_cookies, axeptio_authorized_vendors, axeptio_all_vendors (Axeptio)', 'Retenir votre choix sur les cookies', '[À confirmer : durée réglée dans la console Axeptio]'],
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
          'Pour les exercer : dpo@dentalmap.fr ou le formulaire de contact. Une réponse vous est apportée dans un délai d’un mois.',
          'Vous pouvez introduire une réclamation auprès de la Commission nationale de l’informatique et des libertés (CNIL), www.cnil.fr.',
        ],
      },
      {
        id: 'securite',
        titre: 'Sécurité',
        blocs: [
          'Les échanges sont chiffrés (HTTPS). Les mots de passe ne sont jamais stockés en clair. Les codes envoyés par email valent dix minutes et cinq essais. Les justificatifs (Kbis, attestations) sont rangés en stockage privé, lisibles par l’équipe seule, et supprimés 30 jours après la décision. Les photos déposées sont débarrassées de leurs métadonnées (EXIF). La connexion par clé d’accès (Face ID, Touch ID) est proposée.',
        ],
      },
    ],
  },
]

/** Une page par son slug, qui est aussi son chemin : `/cgu/`, `/confidentialite/`… */
export function pageLegale(slug: PageLegale['slug']): PageLegale {
  return PAGES.find((p) => p.slug === slug)!
}
