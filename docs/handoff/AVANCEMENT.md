# Avancement espace pro

Tenu à jour par Claude Code. Statuts : à faire, en cours, fait, bloqué, retiré.

| ID | Écran | Phase | Desktop | Mobile | Sorties branchées | Écarts / notes |
|---|---|---|---|---|---|---|
| CX1 | Connexion ou inscription | B | fait | fait | 3/5 | Site actuel, inchangé. PSC annoncé « Bientôt ». Clé d'accès : voir CX4. |
| CX2 | Lien envoyé ou code | B | fait | fait | 4/6 | Site actuel (code à six chiffres). Clé d’accès : voir CX4 (fait). |
| CX3 | Première connexion | B | fait | fait | 2/2 | Site actuel, profil choisi à l'inscription : T3 est sauté. |
| CX7 | Mot de passe oublié | B | fait | fait | 1/1 | Site actuel, inchangé. |
| T3 | Qui êtes-vous ? | B | fait | fait | 2/6 | `/inscription/profil` dans la coquille compte. Spécialistes sous le rôle `dentiste`, nouveau rôle `organisme`. « Ne pas répondre » = patient. Sorties S0, L1, O1, P1/P2 à reconstruire. Sortie SE1 (salarié ou étudiant) ajoutée le 2026-10-11. |
| CX1-E | Connexion, adresse invalide | B | fait | fait | 1/1 | État de `/connexion`, suggestion de domaine en un clic (`suggererAdresse`). |
| CX2-E | Code incorrect | B | fait | fait | 3/3 | Essais restants sur 5, renvoi depuis l'erreur, bascule vers CX5. |
| CX4 | Proposer une clé d'accès | B | fait | fait | 1/1 | `/connexion/cle-d-acces/` (2026-10-17), après chaque connexion par mot de passe : 2e session au moins, aucune clé, proposition puis une relance à 7 jours. Plugin `@better-auth/passkey` 1.7.4, table `passkey` (migration 0019). « Se connecter avec une clé d’accès » sur `/connexion`, tuile « Clés d’accès » dans les deux pages « Compte et sécurité ». Figma 70:2175. |
| CX6 | Plus accès à mon email | B | fait | fait | 2/3 | État de `/connexion`, lien depuis « Mot de passe oublié ». Santé « Bientôt » (PSC n'ouvre pas de session), structure vers `/contact/`, patient vers l'inscription. |
| CX5 | Lien expiré ou déjà utilisé | B | fait | fait | 1/1 | État de `/connexion` (code expiré ou épuisé), adresse gardée. |
| FAV | Mes favoris | B | fait | fait | 2/2 | `/favoris/`, conforme à la maquette 267:8539. 2026-10-17 : adresse et lien repris du premier lieu quand aucun n’est principal (16 994 fiches sur 72 374), corrigé aussi dans la modération et l’email d’acceptation. |
| FAV-0 | Mes favoris, aucune fiche | B | fait | fait | 1/1 | Même page sans favori, conforme à 267:10989. |
| P2 | Retour à la fiche, numéro visible | B | à faire | à faire | 0/3 | |
| P1 | Personnaliser (facultatif) | B | à faire | à faire | 0/1 | |
| S0 | Comment vous identifier ? | C | fait | fait | 2/2 | `/espace-pro/revendiquer/`. Depuis une fiche (`?fiche=`), la recherche est faite : carte centrée sur le praticien, RPPS dans la pastille, « Confirmer ma fiche » mène droit à S2. |
| PSC1 | Redirection Pro Santé Connect | E | fait | fait | 2/2 | `/espace-pro/revendiquer/psc/`, part par `/api/psc/connexion/` (fiche facultative). |
| PSC-ANS | Écran de l'ANS (externe) | E | à faire | à faire | 0/2 | |
| PSC2 | Retour PSC, fiche trouvée | E | fait | fait | 4/4 | `/espace-pro/revendiquer/psc/confirmer/`. Le retour ne décide plus seul : identité scellée en cookie, écriture à la confirmation. Fiche gérée par un autre compte : contestation en attente. |
| M1 | Choisir les lieux d'exercice | C | fait | fait | 1/1 | `/espace-pro/lieux/?fiche=`, `revendications.lieux_geres`. Mène à l'espace pro tant que B0 n'est pas refait. |
| B0 | Ce que nous savons déjà | F | fait | fait | 2/2 | `/espace-pro/onboarding/recuperation/`, aperçu patient à gauche. |
| B0S | Spécialité et domaines de soins | F | fait | fait | 1/1 | `/espace-pro/onboarding/specialite/` (2026-10-15), première question après B0. Qualification du registre verrouillée, domaines dans `fiches_completees.orientations` (5 au plus, aussi dans la mission), pas de gain affiché (poids non arbitré, barème +8 % inchangé). B0 dit « 4 questions », B7 liste les domaines. Figma 200:7039. |
| B1 | Horaires | F | fait | fait | 1/1 | Interrupteur par jour, deux plages, copie du lundi. `horaires_confirmes_le`. |
| B2 | Conventionnement | F | fait | fait | 1/1 | Secteur + tiers payant (Oui, Partiel, Non rangés sous les codes existants). |
| B3 | Accueil des patients | F | fait | fait | 1/1 | Langues, `acces_pmr` (oui alimente aussi le filtre `pmr`), `age_minimum`. |
| B4 | Photo du cabinet | F | fait | fait | 1/1 | Devenue la mission MIS-1 : recadrage 16:9 et ré-encodage dans le navigateur (EXIF retiré), Vercel Blob public. |
| B5 | Présentation | F | fait | fait | 1/1 | Devenue la mission MIS-2 : compteur et termes refusés en direct. |
| B6 | Domaines de soins | F | fait | fait | 1/1 | Devenue une mission, `orientations` existantes. |
| B7 | Votre fiche est prête | F | fait | fait | 3/3 | Publication (`publiee_le`, `termine_le`) ; en attente de vérification, « Terminer ». |
| J | Célébration, palier atteint | F | fait | fait | 2/2 | Au-dessus de la vue d'ensemble quand une écriture franchit 90 %. |
| DASH | Espace pro, force de fiche | F | fait | fait | 3/3 | `/espace-pro/` : DASH-1, 2, 3 selon l'état réel. Force par `calculerForce()` (tests). |
| PSC-E | Échec Pro Santé Connect | E | fait | fait | 2/2 | `/espace-pro/revendiquer/psc/erreur/?code=`, une phrase par cause. |
| PSC-0 | RPPS sans fiche | E | fait | fait | 2/2 | `/espace-pro/revendiquer/psc/sans-fiche/`, alerte `fiche_creee`. L'envoi de l'email à la création relève de la synchro n8n. |
| S1 | Profession et RPPS | C | fait | fait | 3/3 | `/espace-pro/revendiquer/recherche/`, contrôle de clé Luhn (vérifié sur 3 000 RPPS réels). 1 résultat : S2 direct. |
| S2 | C'est bien vous ? | C | fait | fait | 5/6 | `/espace-pro/revendiquer/[slug]/` (slug, pas id). Données du registre sous verrou. S3a jamais (pas d'email au registre). |
| S3a | Lien sur l'email du registre | C | bloqué | bloqué | 0/3 | Le registre importé ne porte pas d'adresse électronique. |
| H1 | Homonymes | C | fait | fait | 3/3 | Même page que S1, 20 au plus (« Au moins 20 » au plafond), RPPS masqué. |
| C1 | Fiche déjà revendiquée | C | fait | fait | 2/2 | `/espace-pro/revendiquer/[slug]/conflit/`. Contestation en attente, la modération transfère la fiche. Preuves : Pro Santé Connect, carte d’identité (« Bientôt »), équipe (2026-10-13). |
| S3b | Choisir la vérification | C | fait | fait | 2/3 | `/espace-pro/revendiquer/[slug]/methode/`, sert aussi au retrait (`?objet=retrait`). Depuis le 2026-10-13 : Pro Santé Connect, carte d’identité par FranceConnect+ (« Bientôt »), « Demander à l’équipe ». Plus de document ni de courrier. |
| S1-0 | Aucune fiche trouvée | C | fait | fait | 2/2 | Même page que S1. Alerte seulement avec un RPPS valide. |
| R1 | Retirer ma fiche | C | fait | fait | 3/3 | `/espace-pro/revendiquer/[slug]/retrait/` puis S3b. |
| R2 | Fiche retirée | C | fait | fait | 2/2 | `deleted_at` + `praticiens.retire_le`, annulable 30 jours. La synchro n8n doit respecter `retire_le`. |
| JD1 | Déposer un justificatif | C | retiré | retiré | 0/0 | Retiré le 2026-10-13 : redirige vers S3b. `deposerJustificatif` n’accepte plus que le Kbis d’un laboratoire. |
| K | Vérification automatique du justificatif | C | retiré | retiré | 0/0 | Retiré le 2026-10-13 côté soignant. Le suivi reste pour le Kbis (KL) et les contestations. |
| L | Justificatif refusé | C | fait | fait | 2/2 | Même page que le suivi. Côté soignant, propose les preuves de S3b (2026-10-13) ; côté laboratoire, autre Kbis. |
| REMP | Remplaçant ou collaborateur | C | fait | fait | 2/2 | Alerte `remplacant`. |
| L1 | Retrouver le laboratoire | G | fait | fait | 3/3 | `/espace-pro/laboratoire/revendiquer/`. SIREN, SIRET (ramené au SIREN) ou raison sociale. Depuis une fiche, droit au rôle. |
| L2 | Votre laboratoire et votre rôle | G | fait | fait | 5/5 | Gérant → L3, mandaté → MAN, salarié → LINFO, déjà géré → LC1. |
| L3 | Kbis ou courrier au siège | G | fait | fait | 1/2 | Kbis (Blob privé). Code au siège « Bientôt » (pas de prestataire postal). |
| KL | Kbis en examen | G | fait | fait | 3/3 | Suivi commun `/espace-pro/revendiquer/suivi/`, libellés « Kbis ». |
| LK1 | Lier à une fiche praticien | G | fait | fait | 2/2 | `/espace-pro/laboratoire/liaison/` : proposé si un dentiste porte le nom du compte au même code postal. `praticien_lie_id`. |
| LO0 | Ce que nous savons du laboratoire | G | fait | fait | 1/1 | `/espace-pro/laboratoire/onboarding/recuperation/`. |
| LO1 | Savoir-faire et matériaux | G | fait | fait | 1/1 | Listes fermées, usinage, STL, 3D. |
| LO2 | Délais et zone desservie | G | fait | fait | 1/1 | Délais au pas, rayon au curseur, ramassage. |
| LO3 | Réalisations et ANSM | G | fait | fait | 1/1 | Devenues missions : `/espace-pro/realisations/` et `/espace-pro/conformite/`. |
| LO4 | Fiche laboratoire prête | G | fait | fait | 2/2 | Publication à 75 %, ou publication puis présentation. |
| U | Espace laboratoire | G | fait | fait | 2/2 | Coque à navigation laboratoire ; équipe avec invitations. |
| LE1 | Choisir l'établissement | G | fait | fait | 1/1 | Une fiche par SIREN en base : LE1 choisit les lieux de la fiche (`lieux_geres`). |
| MAN | Mandat du gérant | G | fait | fait | 1/1 | Kbis + mandat + adresse du gérant, prévenu par courriel. Modèle : `/espace-pro/laboratoire/modele-mandat/`. |
| LCODE | Code reçu au siège | G | bloqué | bloqué | 0/3 | Pas de prestataire d'envoi postal. |
| LREF | Kbis refusé | G | fait | fait | 1/1 | Suivi commun, motif en liste fermée. |
| LA1 | Demande d'ajout | G | fait | fait | 2/2 | `/espace-pro/laboratoire/ajout/` : contrôle Sirene par l'API Recherche d'entreprises (actif, NAF 32.50A), Kbis joint. |
| LINFO | Prothésiste salarié | G | fait | fait | 2/2 | Alerte `prothesiste_salarie`. |
| LC1 | Laboratoire déjà revendiqué | G | fait | fait | 2/2 | Kbis (contestation) ou demande d'invitation transmise au titulaire. |
| O1 | Type d'organisme | H | fait | fait | 3/3 | `/espace-pro/organisme/`. Un compte sans profil devient « organisme ». « Assistanat » retiré du détail : aucune école d'assistant n'est recensée. |
| O2a | Retrouver l'établissement | H | fait | fait | 3/3 | Nom, ville, UAI (lu dans l'adresse académique quand le contenu la porte). `?fiche=` depuis la page publique : la recherche est faite et pointe sur l'établissement. |
| O3a | Compléter les formations | H | fait | fait | 1/1 | Préremplies depuis le contenu WordPress (diplômes balisés ; diplôme d'État pour une faculté). Stockées dans Neon (`fiches_etablissement`). Écriture WordPress codée mais coupée (`WP_ECRITURE`). |
| OEND | Établissement publié | H | fait | fait | 2/2 | `revalidateTag('wp:formation')`. Variante « prêtes, en attente » quand l'attestation est en examen. |
| W1 | Liste d'attente formation continue | H | fait | fait | 2/2 | Table `liste_attente_formation`, une ligne par adresse. Encart « Vous avez déjà une formation à présenter ? » vers la proposition, sur le formulaire et sur la confirmation (W1-OK). |
| OA1 | Demande d'ajout d'établissement | H | fait | fait | 2/2 | UAI contrôlé (7 chiffres, lettre de clé modulo 23). Table `demandes_ajout_etablissement`, file de modération. |
| OAT | Attestation de fonction | H | fait | fait | 2/2 | PDF seulement, Blob privé, file de modération. Domaine attendu affiché ; « Utiliser une adresse de l'établissement » mène à la connexion. |
| O2b | Proposer un partenariat | H | fait | fait | 1/1 | Même circuit que l'accueil (`envoyerDemandePartenariat`), rien de stocké. |
| O3b | Demande reçue | H | fait | fait | 1/1 | Accusé de réception par courriel ; adresse gardée dix minutes dans un cookie, pas dans l'URL. |
| SE1 | Votre situation | à définir | à faire | à faire | 0/1 | Ajouté le 2026-10-11, node id Figma à reporter. |
| SE2 | Ce que vous recherchez | à définir | à faire | à faire | 0/2 | Ajouté le 2026-10-11, node id Figma à reporter. |
| SE3 | Votre qualification | à définir | à faire | à faire | 0/1 | Ajouté le 2026-10-11, node id Figma à reporter. |
| SE3E | Votre formation | à définir | à faire | à faire | 0/1 | Ajouté le 2026-10-11, node id Figma à reporter. |
| SE4 | Visibilité du profil | à définir | à faire | à faire | 0/1 | Ajouté le 2026-10-11, node id Figma à reporter. |
| SE5 | Votre profil est prêt | à définir | à faire | à faire | 0/3 | Ajouté le 2026-10-11, node id Figma à reporter. |
| D-EMPLOI | Emploi, dentiste | à définir | à faire | à faire | 0/4 | Ajouté le 2026-10-11, node id Figma à reporter. |
| L-EMPLOI | Emploi, laboratoire | à définir | à faire | à faire | 0/4 | Ajouté le 2026-10-11, node id Figma à reporter. |
| D-CAND | Candidatures reçues, dentiste | à définir | à faire | à faire | 0/2 | Ajouté le 2026-10-11, node id Figma à reporter. |
| L-CAND | Candidatures reçues, laboratoire | à définir | à faire | à faire | 0/2 | Ajouté le 2026-10-11, node id Figma à reporter. |
| OUV-PD-OFFRE | Publier une offre, dentiste | à définir | à faire | à faire | 0/2 | Ajouté le 2026-10-11, node id Figma à reporter. |
| OUV-PL-OFFRE | Publier une offre, laboratoire | à définir | à faire | à faire | 0/2 | Ajouté le 2026-10-11, node id Figma à reporter. |
| OUV-PD-PUBLIEE | Offre publiée | à définir | à faire | à faire | 0/1 | Ajouté le 2026-10-11, node id Figma à reporter. |
| OUV-PD-ECHANGE | Proposer un échange | à définir | à faire | à faire | 0/2 | Ajouté le 2026-10-11, node id Figma à reporter. |
| OUV-PD-POURVUE | Offre pourvue | à définir | à faire | à faire | 0/1 | Ajouté le 2026-10-11, node id Figma à reporter. |
| CAND-VUE | Vue d'ensemble, salarié | à définir | à faire | à faire | 0/4 | Ajouté le 2026-10-11, node id Figma à reporter. |
| CAND-OFFRES | Offres, salarié | à définir | à faire | à faire | 0/2 | Ajouté le 2026-10-11, node id Figma à reporter. |
| CAND-OFFRE | Détail d'une offre, salarié | à définir | à faire | à faire | 0/3 | Ajouté le 2026-10-11, node id Figma à reporter. |
| CAND-CANDID | Candidatures, salarié | à définir | à faire | à faire | 0/2 | Ajouté le 2026-10-11, node id Figma à reporter. |
| CAND-PROFIL | Profil, salarié | à définir | à faire | à faire | 0/2 | Ajouté le 2026-10-11, node id Figma à reporter. |
| CAND-ALERTES | Alertes | à définir | à faire | à faire | 0/1 | Ajouté le 2026-10-11, node id Figma à reporter. |
| CAND-VISI | Visibilité | à définir | à faire | à faire | 0/1 | Ajouté le 2026-10-11, node id Figma à reporter. |
| ETU-VUE | Vue d'ensemble, étudiant | à définir | à faire | à faire | 0/4 | Ajouté le 2026-10-11, node id Figma à reporter. |
| ETU-OFFRES | Offres, étudiant | à définir | à faire | à faire | 0/2 | Ajouté le 2026-10-11, node id Figma à reporter. |
| ETU-OFFRE | Détail d'une offre, étudiant | à définir | à faire | à faire | 0/3 | Ajouté le 2026-10-11, node id Figma à reporter. |
| ETU-CANDID | Candidatures, étudiant | à définir | à faire | à faire | 0/2 | Ajouté le 2026-10-11, node id Figma à reporter. |
| ETU-PROFIL | Profil, étudiant | à définir | à faire | à faire | 0/3 | Ajouté le 2026-10-11, node id Figma à reporter. |
| ETU-FORM | Formation | à définir | à faire | à faire | 0/1 | Ajouté le 2026-10-11, node id Figma à reporter. |
| OUV-C-POSTULER | Postuler | à définir | à faire | à faire | 0/2 | Ajouté le 2026-10-11, node id Figma à reporter. |
| OUV-C-ENVOYEE | Candidature envoyée | à définir | à faire | à faire | 0/2 | Ajouté le 2026-10-11, node id Figma à reporter. |
| OUV-C-ALERTE | Créer une alerte | à définir | à faire | à faire | 0/1 | Ajouté le 2026-10-11, node id Figma à reporter. |
| OUV-C-ECHANGE | Répondre à un échange | à définir | à faire | à faire | 0/1 | Ajouté le 2026-10-11, node id Figma à reporter. |
| OUV-C-MASQUER | Masquer une structure | à définir | à faire | à faire | 0/1 | Ajouté le 2026-10-11, node id Figma à reporter. |

## Retrait de l'existant (2026-10-10)

Pages supprimées pour reconstruction d'après Figma : `espace-pro/onboarding`, `espace-pro/revendiquer`, `espace-pro/fiche` (`choisir`, `creer`), `espace-pro/attente` et `components/espace-pro/onboarding.tsx`. Les liens « Revendiquer ma fiche » mènent à `/espace-pro/` (retiré du pied de page, où il doublait « Espace pro »), et les étapes `fiche`, `verification`, `onboarding` du tunnel aussi. La logique (`lib/tunnel`, `lib/espace-pro`) et la modération sont gardées.
## Revendication soignant (2026-10-11)

Migration `0012_faithful_turbo` appliquée : table `alertes_espace_pro`, `praticiens.retire_le`, et sur `revendications` : `objet`, `justificatif_*`, `motif_refus`, `commentaire_refus`, `lieux_geres`. Méthode `justificatif` ajoutée.

Les écrans se vérifient avec un vrai compte : aperçus sans session et onglets d'états de `/connexion` retirés le 2026-10-11. Entrées : bouton « Revendiquer cette fiche » des fiches (vers S0, fiche présélectionnée), menu compte, pied de page, accueil, `/connexion?mode=inscription&profil=`.

À faire ailleurs : la synchro n8n doit respecter `retire_le` et envoyer les alertes `fiche_creee` ; `BLOB_READ_WRITE_TOKEN` à poser sur Vercel pour les justificatifs.

## Décisions client (2026-10-11)

Documentation mise à jour (`02-parcours-espace-pro.md`, `parcours.json`, `06-annexe-informations-et-poids.md`), aucun code modifié.

- Revendication sans email au registre : courrier au cabinet abandonné. Deux preuves seulement, justificatif (vérification automatique en quelques minutes) ou Pro Santé Connect. S3c et CE1 supprimés ; S3b et L sortent vers JD1 et PSC1.
- Justificatif jamais conservé : lu pour la vérification puis supprimé, validé ou non. Remplace le Blob privé et la purge à 30 jours. K devient « Vérification automatique du justificatif » (plus de SLA 48 h ni de relance à 36 h). JD1, K, L et S3b sont à reprendre dans le code.
- S0 : description « Vérification par email du registre, justificatif ou Pro Santé Connect ».
- Nouvel écran B0S « Spécialité et domaines de soins » entre B0 et B1 : qualification lue au registre et verrouillée, domaines déclarés (5 au plus) dans `fiches_completees.domaines`. Remplace la mission « Domaines de soins » (B6). Onboarding à 4 questions. Poids à arbitrer, pourcentages inchangés.
- T3 : cinquième profil « Salarié ou étudiant » (`user.profil = salarie`), vers SE1.
- Nouveau parcours SE1 à SE5 (avec SE3E pour l'étudiant) et espace emploi : rubrique « Emploi » côté dentiste et laboratoire, espace candidat (CAND) et étudiant (ETU), états OUV. Candidatures supprimées 6 mois après la clôture de l'offre (à valider).
- Nouveaux écrans sans node id Figma : à reporter une fois dessinés. Le parcours laboratoire (L3, LCODE, courrier au siège) est inchangé ; sa sortie LCODE vers CE1 pointe désormais vers une fiche supprimée, à trancher.
- Hors périmètre de cette mise à jour, encore à aligner : `00-contexte-et-decisions.md`, `03-gamification.md`, `04-donnees-auth-integrations.md` et `05-plan-de-mise-en-oeuvre.md` mentionnent toujours le courrier, le code à 8 chiffres et le justificatif en Blob privé.
## Couloir dentiste, onboarding et tableau de bord (2026-10-11)

Migration `0013_massive_ma_gnuci` appliquée : sur `fiches_completees`, `secteur`, `acces_pmr`, `age_minimum`, `presentation`, `photo_url`, `site_web`, `rdv_en_ligne`, les dates de confirmation par bloc et `publiee_le`.

Tableau de bord dans `(pro)/espace-pro/` : vue d'ensemble, ma fiche, missions (photo, présentation, soins, liens), fraîcheur (reconfirmation en un clic), registre, distinctions, partager (lien court `/p/<slug>/`, badge HTML), compte et sécurité (mot de passe, appareils). Écarts assumés :
- distinctions calculées sur l'état présent, pas stockées ; « Toujours à jour » reste à obtenir faute d'historique de reconfirmations ;
- Emploi (recruteur) : deux onglets, « Créer un poste » (ses offres) et « Rechercher un poste » (`/espace-pro/emploi/recherche/`, la recherche du site : métier ou tous, autour du cabinet ou d'une commune, rayon, filtres, vue liste et vue carte). Créer un poste en pages enfant (`/espace-pro/emploi/creer/<etape>/`) : le cabinet (présentation, avantages et lieu par défaut, communs à toutes les offres, table `recrutement_cabinets`, migration 0023, affichés dans « Le cabinet » de chaque offre publique), le poste (crée le brouillon), la rémunération (obligatoire), l'annonce (présentation, missions, profil, avantages), la publication (récapitulatif). Les mêmes pages servent à modifier. Une page par offre (`/espace-pro/emploi/<offre>/`), confirmation tous les 15 jours, pourvue, retrait, republication ; publication réservée aux fiches vérifiées au palier 4 (Ambassadeur). Postuler ne demande qu'un compte connecté, sans palier. Candidatures : à venir.
- Notifications : « Bientôt » dans la navigation (aucune donnée derrière) ; Statistiques ouvertes (visites des liens de partage par canal, `/p/<slug>/<code>/`, compteur par jour sans cookie) ; visuels réseaux ouverts (carte de résultat sur le plan, export dans le navigateur) ; « Fraîcheur » renommée « Mises à jour », rangée dans Compte ; progression par points et paliers (carte du menu, encart de gain, passage de palier plein écran, page « Progression » qui remplace Missions et Distinctions (anciennes adresses redirigées ; missions détaillées sous `/espace-pro/missions/<cle>/`), bonus de classement aux paliers 4 et 5) ; en-tête des pages collant ; parrainage ouvert (invitations email, bonus de classement temporaire, voir 06) ;
- test hebdomadaire des liens du cabinet, rappels par courriel de fraîcheur : faits le 2026-10-15 (voir « Tâches planifiées »).

La fiche publique affiche photo, présentation, liens, secteur, âge minimum et la mention « horaires non confirmés depuis six mois ».
## Couloir laboratoire (2026-10-11)

Migrations `0014_fearless_mandrill` (champs laboratoire sur `fiches_completees`, rôle et mandat sur `revendications`, table `invitations_fiche`) et `0015_silly_skrulls` (Kbis joint aux demandes d'ajout) appliquées.

Barème laboratoire dans `src/lib/espace-pro/force-labo.ts` (tests) : 30 % vérifié, 75 % après LO1 et LO2. Tableau de bord : délais (reconfirmation à six mois), savoir-faire, zone et logistique, réalisations (une à huit photos, recadrées et nettoyées dans le navigateur), conformité ANSM, équipe (invitations par lien à usage unique, trente jours). Fiche publique : savoir-faire, matériaux, frise des délais (masquée au-delà d'un an), zone, réalisations avec crédit, mention ANSM.

Écarts : les laboratoires sont en base une fiche par SIREN, sans SIRET ; le code au siège (LCODE, CE1) attend un prestataire postal ; les critères des cabinets (« Zircone », « Ramassage »…) sont filtrables dans la recherche depuis le 2026-10-15 (voir plus bas).

## Couloir école et organisme (2026-10-11)

Migration `0016_cuddly_prima` appliquée : `revendications_etablissement`, `fiches_etablissement` (un document JSON par établissement, désigné par son slug WordPress), `demandes_ajout_etablissement`, `liste_attente_formation`.

Vérification : une adresse sur le domaine de l'établissement (domaine de ses adresses publiées et de son site) donne la main tout de suite ; un domaine académique (`ac-*.fr`) ou une messagerie ne vaut que pour l'adresse exacte. Sinon, attestation de fonction (OAT), examinée en modération. Logique pure et testée dans `src/lib/espace-pro/etablissement.ts` (UAI, domaines, préremplissage, barème de l'annexe 06).

Tableau de bord `/espace-pro/etablissement/` (coque à navigation établissement) :
- école : vue d'ensemble, ma page (sections et état, portes ouvertes, présentation), formations, galerie (24 photos, crédit, droits), registres, compte ;
- faculté : accès aux études, cursus et internat, centres de soins à la place de formations ;
- admission, coûts, vie étudiante, événements et statistiques annoncés « Bientôt ».

Barème : pour une faculté, l'alternance ne s'applique pas ; ses 10 points vont aux centres de soins (à confirmer dans `03-gamification.md`).

Page publique de la formation : module « L'établissement en parle » (renseigné par l'établissement, seulement si la page est publiée et le gestionnaire vérifié), et encart « Vous représentez cet établissement ? » qui ouvre O2a sur lui.

Écarts :
- l'écriture dans WordPress (champ ACF `diplome`) est codée dans `src/lib/wp/ecriture.ts` mais coupée tant que `WP_ECRITURE` ne vaut pas `1` : à valider avant d'écrire dans le CMS ;
- pas de référentiel UAI branché : l'UAI n'est connu que pour les lycées dont l'adresse académique le porte ;
- une demande d'ajout acceptée suppose que l'équipe crée la page dans WordPress à la main.


## Retours de la repasse Figma (2026-10-12)

- « Ma fiche » et « Ma page » en mobile : statut et bouton passent sous le texte de chaque bloc (la colonne était écrasée à 390 px).
- Espace laboratoire : « Où les cabinets vous trouvent », « visible par les cabinets », célébration et distinctions au vocabulaire laboratoire.
- Zone de dépôt : sous le fichier choisi, le nom du document (« Extrait Kbis », « Justificatif ») au lieu de la consigne « Glissez… ».
- Alertes « fiche créée » (PSC-0, S1-0) : un email part dès que la synchronisation crée la fiche (`src/lib/espace-pro/alertes.ts`), appelé après chaque `/api/revalidate` et par `/api/cron/alertes` (`CRON_SECRET`, à poser sur Vercel avec une tâche planifiée si l'on veut un filet quotidien). Les listes d'attente (remplaçants, prothésistes salariés, formation continue) restent des annonces à envoyer au lancement de ces fonctions.
- Tableau de bord soignant et laboratoire : après un enregistrement réussi, « Enregistré. Votre fiche publique est à jour. » en tête de la page d’arrivée (`?enregistre=1`, retiré de l’adresse aussitôt lu ; composant `Enregistre` dans la coque). L’espace établissement garde son retour bloc par bloc.
- Erreur d’enregistrement : la saisie n’est plus perdue. `erreur()` garde les champs envoyés une minute (cookie `dm_saisie`, `src/lib/espace-pro/saisie.ts`) et la page les relit quand elle s’ouvre sur `?erreur=` : présentation, liens, photo, réalisations, ANSM, délais, zone, horaires. Les cases de droits ne sont jamais recochées d’office.

## Emails et logo (2026-10-12)

- Emails mis en forme d’après le gabarit validé dans Figma (couloir « Emails ») : `src/lib/email-gabarit.ts` (fonction pure, testée : HTML en tables et styles en ligne, 600 de large, version texte brut toujours jointe) et `src/lib/email.ts`.
- Textes corrigés : bienvenue (adresse et mot de passe, plus de lien magique), accusé de demande de retrait distinct, décision sur une attestation d’établissement (`envoyerAttestationDecidee`, plus de mention de l’Ordre ni du Kbis), page d’établissement créée (`envoyerEtablissementAjoute`, envoyé quand la modération clique « Page créée »), accusé de partenariat aussi depuis le formulaire public, origine et nom propres dans l’email interne, formulations neutres, bouton « Ouvrir la modération » dans « À modérer ». `envoyerFichePubliee`, envoyé par aucun parcours, est retiré.
- Logo : `public/images/marque/` (fond clair, fond sombre, pictogramme), composant `src/components/site/logo.tsx` à la place du carré provisoire (en-tête du site, menu mobile, coquille du compte, volet carte, onboarding, coque de l’espace pro). Dans Figma : composants « Logo » sur la page Site, posés sur tous les écrans et les emails.

## Formations privées (2026-10-13)

Migration `0017_square_blizzard` appliquée : tables `demandes_formation` et `alertes_formation`, et « Prothèse » renommé « Prothèse et CFAO » dans `liste_attente_formation` (la table était vide).

- **A. Proposer une formation** : `/espace-pro/compte/formation/`, ouvert à tout professionnel connecté, dans la coque de son espace (soignant, laboratoire, établissement) ou dans une coque simple s’il n’a pas de fiche (organisme de formation continue). Champs d’après la fiche maquettée ; SIREN facultatif contrôlé par Sirene (`consulterSiren`). Liste « Vos propositions » avec leur état. Accusé à l’écran et par email. Entrées : tuile « Proposer une formation » dans les deux pages « Compte et sécurité », encart dans W1, bouton de la rubrique publique et de la maquette `_attente.tsx`.
- **B. Modération** : file « Formations proposées » (accepter, refuser avec motif, vérifier DPC, FIF PL, Qualiopi à leur source, mettre en ligne avec le slug d’un article créé à la main). À l’acceptation, l’article WordPress minimal est créé par `creerFormationPrivee` (titre, type `privee`, ville, durée, site), coupé tant que `WP_ECRITURE` ne vaut pas `1` : la demande reste alors « acceptée, à publier ». Emails de décision au demandeur.
- **Choix de stockage** : le détail déclaré (sessions, programme, public, format, tarif, prise en charge et vérifications) reste dans Neon et se lit sur la page publique (`ModuleFormationPrivee`), comme les données déclarées d’un établissement. Aucun champ ACF à créer ; WordPress ne porte que l’adresse publique.
- **C. Alerte des praticiens** : inscription sans compte dans la rubrique publique (adresse, thèmes, région, public), confirmation par lien (`/formation/alerte/confirmer/[jeton]/`), désinscription en un clic par lien signé, valable dans chaque email (`/formation/alerte/desinscrire/[jeton]/`). Un email par semaine au plus. Job `alertes-formation` ajouté au tableau de `04-donnees-auth-integrations.md` §6.
- La rubrique `/formation/formations-privees` reste en « Bientôt » (`aVenir`). Alignée le 2026-10-13 sur la maquette validée (Site, nodes 301:10201 et 301:2298) : bandeau sombre « Le recensement n’est pas encore ouvert. » avec les dix thèmes, puis deux cartes, « Vous proposez une formation » et « Être prévenu des nouvelles formations » (formulaire d’alerte), puis les liens vers écoles et facultés.
- « Vos propositions » : une seule pastille par état (« En vérification », « Acceptée, bientôt en ligne », « En ligne », « Refusée ») ; `Statut` accepte un `libelle` qui remplace le texte du statut de bloc.
- Non testé de bout en bout : les parcours A et B demandent une session (pas de compte de test sur la base partagée) ; l’inscription à l’alerte enverrait un vrai email (Resend). Vérifié : compilation, redirections, rendu de la rubrique publique à 1440 et 390, pages d’alerte, tests unitaires (`tests/formation-privee.test.ts`).

Analyse de ce qui reste : `docs/handoff/RESTE-A-FAIRE.md` (2026-10-13).

## Preuve d’identité sans document (2026-10-13)

Décision : un chirurgien-dentiste ne dépose plus de document. Une attestation de l’Ordre ne porte que des données publiques (nom, RPPS), donc imitables, et rien ne permet de vérifier automatiquement qu’elle est authentique ; une photo de carte CPS est exclue. Un Kbis est vérifiable (QR code Infogreffe) mais commandable par n’importe qui, et un libéral en nom propre n’en a pas.

- S3b, C1 et le refus (L) proposent : Pro Santé Connect, carte d’identité par FranceConnect+ (« Bientôt » : habilitation DataPass à demander ; accord seulement si le nom certifié concorde avec la fiche et sans homonyme, 1 254 dentistes sur 64 739 partagent nom et prénom), « Demander à l’équipe » (contact, objet « Ma fiche ou mon espace pro »). Voies communes : `voiesIdentite()` dans `revendiquer/_commun.tsx`.
- JD1 redirige vers S3b ; `deposerJustificatif` refuse un soignant. Le Kbis des laboratoires, la modération et la lecture des anciens justificatifs sont inchangés.
- Email de refus et maquettes FAQ, À propos et Mentions légales réécrits (plus de « justificatif vérifié automatiquement », plus d’« email connu du registre »).
- Figma (même jour) : S3b, C1 et L redessinés avec les trois voies (icônes « id-card » et « message-circle » ajoutées au jeu « Icônes » de la page Site) ; JD1 et K grisés et renommés « Retiré » ; S0, S0F, modération (exemple praticien devenu une contestation Pro Santé Connect), emails (accusé, refus, « À modérer ») et notes alignés.
- Conséquence : tant que Pro Santé Connect n’est pas ouvert en production, un dentiste ne peut revendiquer qu’en écrivant à l’équipe, qui vérifie à la main.

## Filtres de recherche des laboratoires (2026-10-15)

- Panneau « Filtres » de la recherche des prothésistes : « Savoir-faire » (8 techniques) et « Matériau » (7 matériaux), un choix chacun, et « Équipement et logistique » : usinage CFAO sur place, empreintes STL acceptées, impression 3D, ramassage des empreintes au cabinet. Absents pour les autres professions.
- `src/lib/annuaire/filtres.ts` (paramètres `technique`, `materiau`, `usinage`, `stl`, `impression3d`, `ramassage`) et `clauseFiltres` : une sous-requête sur `fiches_completees`, comptée seulement sur une fiche attribuée, comme l’orientation et l’accessibilité. Liste, compteur et points de la carte filtrent ensemble.
- Vérifié : API (133 laboratoires sans filtre sur l’emprise d’essai, 0 avec « Zircone » et ramassage), compteur du panneau, tests d’aller-retour par l’adresse. Aujourd’hui aucun laboratoire n’a de fiche attribuée et remplie : tout filtre labo rend 0 résultat tant que les laboratoires n’ont pas complété leur fiche.
- Non fait : « dessert ma zone » (rayon déclaré contre la position du cabinet) et un filtre par délai ; le panneau Figma des filtres n’a pas été redessiné.

## Tâches planifiées (2026-10-15)

Migration `0018_large_kingpin` appliquée : sur `fiches_completees`, `rappel_fraicheur_le`, `rappels_coupes_le`, `liens_testes_le`, `liens_echecs` (jsonb).

- **Rappels de fraîcheur** (`/api/cron/rappels-fraicheur/`, chaque jour) : pour chaque fiche publiée et gérée, les blocs en « rappel », « à reconfirmer » ou « expiré » (règles de `fraicheurDe` et `fraicheurLabo`), dans un seul email avec le bouton « Reconfirmer mes informations ». Un email par fiche et par mois au plus, daté avant l’envoi et remis en l’état si l’envoi échoue.
- **Test des liens du cabinet** (`/api/cron/liens/`, chaque jour par lots de 50, chaque fiche une fois par semaine) : HEAD puis GET, 10 s, redirections suivies et contrôlées à chaque saut (domaines publics seulement, ni IP ni nom local). 401, 403 et 429 comptent comme une réponse. Deux échecs de suite : le bouton est masqué sur la fiche (`lienPublic`), la fiche est revalidée et le professionnel reçoit un email. La mission « Liens du cabinet » signale l’échec dès la première fois ; enregistrer remet le compteur à zéro.
- **Purge des documents** (`/api/cron/purge-documents/`, chaque jour) : Kbis, mandats, attestations et anciens justificatifs supprimés du stockage 30 jours après la décision, et leurs colonnes vidées. Tient la promesse des mentions légales.
- **Coupure des rappels** : lien signé au bas de chaque email (`/rappels/couper/[jeton]/`, bouton de confirmation, sans connexion) ; « Fraîcheur » affiche l’état et permet de les rétablir.
- `vercel.json` déclare les cinq tâches (purge 2 h, liens 3 h, alertes 6 h, alertes formation 7 h, rappels 8 h, heure UTC). Elles ne tournent qu’avec `CRON_SECRET` posé sur Vercel.
- Vérifié : routes refusées sans secret (401), page de coupure, SQL contre le schéma, tests (`tests/rappels.test.ts`). Non lancé : aucune tâche n’a été exécutée contre la base (pas de `CRON_SECRET` local) ; en base aujourd’hui, aucune fiche publiée à rappeler, aucun lien à tester, aucun document à purger.
- Non fait : « Toujours à jour » (historique des reconfirmations) et clôture automatique des contestations à J+7.


## Repasse du couloir chirurgien-dentiste (2026-10-17)

- Comparaison texte par texte des maquettes desktop (S0, PSC1, PSC2, PSC-E, PSC-0, M1, S1, S2, H1, S1-0, C1, S3b, R1, R2, L, REMP, B0, B0S, B1, B2, B3, B7, J, DASH-1 à 3) avec le code : aucun écart de libellé, hors chaînes construites à partir des données (nom, nombre de lieux, RPPS).
- Figma remis au niveau du code après B0S : B7 liste les domaines de soins parmi les réponses, deux missions restantes (photo, présentation), aperçu à jour ; B0 affiche « Avant de commencer · 4 questions » sans numéro d’étape, quatre segments vides ; notes de B7 et R1 corrigées.
- Non vérifié à l’écran : ces pages demandent une session (pas de compte de test sur la base partagée).
