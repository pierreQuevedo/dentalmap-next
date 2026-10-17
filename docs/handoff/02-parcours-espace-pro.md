# 02 · Parcours espace pro, spécification écran par écran

Généré depuis la page Figma « Parcours · step by step » (fichier `oxe3W5vGaT9QEYH6ur6Z3p`, page `68:1827`). Chaque étape existe en desktop 1440 et mobile 390. Version machine : `parcours.json`.

Mise à jour du 13 octobre 2026 : un chirurgien-dentiste ne dépose plus aucun document. Le contenu d’une attestation (nom, RPPS) est public, donc imitable, et aucune vérification automatique ne garantit qu’elle n’est pas fausse. Preuves gardées : Pro Santé Connect, la carte d’identité par FranceConnect+ (application France Identité, annoncée, habilitation à obtenir ; accord seulement si le nom concorde et sans homonyme) et la demande à l’équipe. JD1, K et L sont retirés du parcours soignant ; le Kbis des laboratoires est inchangé.

Mise à jour du 11 octobre 2026 (décisions client) : courrier au cabinet abandonné (fiches de saisie du code courrier et de code bloqué supprimées), justificatif vérifié automatiquement et jamais conservé, nouvel écran B0S, cinquième profil « Salarié ou étudiant » et espace emploi. Les écrans ajoutés n'ont pas encore de node id Figma : la mention « node id à reporter » le signale.

Lecture : **Objectif** dit pourquoi l'écran existe, **Règles** ce qui doit être validé, **Données** ce qui est lu ou écrit, **Sorties** toutes les transitions possibles avec leur condition. Une sortie dont la condition dépend du système (registre, examen) n'est pas un choix utilisateur : c'est la logique serveur qui décide.

## Index

| ID | Étape | Couloir | Route cible |
|---|---|---|---|
| [CX1](#cx1) | Connexion ou inscription | Tronc commun | `/connexion` |
| [CX2](#cx2) | Lien envoyé ou code | Tronc commun | `/connexion/verifier` |
| [CX3](#cx3) | Première connexion | Tronc commun | `/connexion/bienvenue` |
| [T3](#t3) | Qui êtes-vous ? | Tronc commun | `/bienvenue/profil` |
| [CX1-E](#cx1-e) | Connexion, adresse invalide | Tronc commun | `/connexion (état erreur)` |
| [CX2-E](#cx2-e) | Code incorrect | Tronc commun | `/connexion/verifier (état erreur)` |
| [CX4](#cx4) | Proposer une clé d'accès | Tronc commun | `/connexion/cle-d-acces` |
| [CX6](#cx6) | Plus accès à mon email | Tronc commun | `/connexion/recuperation` |
| [CX5](#cx5) | Lien expiré ou déjà utilisé | Tronc commun | `/connexion/expire` |
| [P2](#p2) | Retour à la fiche, numéro visible | Patient ou proche | `fiche publique, numéro révélé (/dentistes/.../[slug])` |
| [P1](#p1) | Personnaliser (facultatif) | Patient ou proche | `/bienvenue/patient` |
| [S0](#s0) | Comment vous identifier ? | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer` |
| [PSC1](#psc1) | Redirection Pro Santé Connect | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/psc` |
| [PSC-ANS](#psc-ans) | Écran de l'ANS (externe) | Chirurgien-dentiste ou spécialiste | `externe (ANS)` |
| [PSC2](#psc2) | Retour PSC, fiche trouvée | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/psc/retour` |
| [M1](#m1) | Choisir les lieux d'exercice | Chirurgien-dentiste ou spécialiste | `/espace-pro/lieux` |
| [PSC-E](#psc-e) | Échec Pro Santé Connect | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/psc/retour (état erreur)` |
| [PSC-0](#psc-0) | RPPS sans fiche | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/psc/retour (sans fiche)` |
| [S1](#s1) | Profession et RPPS | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/recherche` |
| [S2](#s2) | C'est bien vous ? | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/[praticienId]` |
| [S3a](#s3a) | Lien sur l'email du registre | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/[praticienId]/email` |
| [H1](#h1) | Homonymes | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/recherche?resultats=multiples` |
| [C1](#c1) | Fiche déjà revendiquée | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/[praticienId]/conflit` |
| [S3b](#s3b) | Choisir la vérification | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/[praticienId]/methode` |
| [S1-0](#s1-0) | Aucune fiche trouvée | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/recherche?resultats=aucun` |
| [R1](#r1) | Retirer ma fiche | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/[praticienId]/retrait` |
| [R2](#r2) | Fiche retirée | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/[praticienId]/retrait/confirme` |
| [JD1](#jd1) | Déposer un justificatif | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/[praticienId]/justificatif` |
| [K](#k) | Vérification automatique du justificatif | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/suivi` |
| [L](#l) | Justificatif refusé | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/suivi (refus)` |
| [REMP](#remp) | Remplaçant ou collaborateur | Chirurgien-dentiste ou spécialiste | `/espace-pro/revendiquer/[praticienId]/remplacant` |
| [B0](#b0) | Ce que nous savons déjà | Onboarding de complétion, dentiste | `/espace-pro/onboarding/recuperation` |
| [B0S](#b0s) | Spécialité et domaines de soins | Onboarding de complétion, dentiste | `/espace-pro/onboarding/specialite` |
| [B1](#b1) | Horaires | Onboarding de complétion, dentiste | `/espace-pro/onboarding/horaires` |
| [B2](#b2) | Conventionnement | Onboarding de complétion, dentiste | `/espace-pro/onboarding/conventionnement` |
| [B3](#b3) | Accueil des patients | Onboarding de complétion, dentiste | `/espace-pro/onboarding/accueil` |
| [B4](#b4) | Photo du cabinet | Onboarding de complétion, dentiste | `/espace-pro/onboarding/photo` |
| [B5](#b5) | Présentation | Onboarding de complétion, dentiste | `/espace-pro/onboarding/presentation` |
| [B6](#b6) | Domaines de soins | Onboarding de complétion, dentiste | `/espace-pro/onboarding/soins` |
| [B7](#b7) | Votre fiche est prête | Onboarding de complétion, dentiste | `/espace-pro/onboarding/recapitulatif` |
| [J](#j) | Célébration, palier atteint | Onboarding de complétion, dentiste | `/espace-pro (modale de palier)` |
| [DASH](#dash) | Espace pro, force de fiche | Onboarding de complétion, dentiste | `/espace-pro` |
| [L1](#l1) | Retrouver le laboratoire | Prothésiste, laboratoire | `/espace-pro/laboratoire/revendiquer` |
| [L2](#l2) | Votre laboratoire et votre rôle | Prothésiste, laboratoire | `/espace-pro/laboratoire/revendiquer/[praticienId]` |
| [L3](#l3) | Kbis ou courrier au siège | Prothésiste, laboratoire | `/espace-pro/laboratoire/revendiquer/[praticienId]/preuve` |
| [KL](#kl) | Kbis en examen | Prothésiste, laboratoire | `/espace-pro/revendiquer/suivi` |
| [LK1](#lk1) | Lier à une fiche praticien | Prothésiste, laboratoire | `/espace-pro/laboratoire/liaison` |
| [LE1](#le1) | Choisir l'établissement | Prothésiste, laboratoire | `/espace-pro/laboratoire/revendiquer?etablissements=multiples` |
| [MAN](#man) | Mandat du gérant | Prothésiste, laboratoire | `/espace-pro/laboratoire/revendiquer/[praticienId]/mandat` |
| [LCODE](#lcode) | Code reçu au siège | Prothésiste, laboratoire | `/espace-pro/laboratoire/revendiquer/[praticienId]/courrier` |
| [LREF](#lref) | Kbis refusé | Prothésiste, laboratoire | `/espace-pro/revendiquer/suivi (refus)` |
| [LA1](#la1) | Demande d'ajout | Prothésiste, laboratoire | `/espace-pro/laboratoire/ajout` |
| [LINFO](#linfo) | Prothésiste salarié | Prothésiste, laboratoire | `/espace-pro/laboratoire/revendiquer/[praticienId]/salarie` |
| [LC1](#lc1) | Laboratoire déjà revendiqué | Prothésiste, laboratoire | `/espace-pro/laboratoire/revendiquer/[praticienId]/conflit` |
| [LO0](#lo0) | Ce que nous savons du laboratoire | Onboarding de complétion, laboratoire | `/espace-pro/laboratoire/onboarding/recuperation` |
| [LO1](#lo1) | Savoir-faire et matériaux | Onboarding de complétion, laboratoire | `/espace-pro/laboratoire/onboarding/savoir-faire` |
| [LO2](#lo2) | Délais et zone desservie | Onboarding de complétion, laboratoire | `/espace-pro/laboratoire/onboarding/delais` |
| [LO3](#lo3) | Réalisations et ANSM | Onboarding de complétion, laboratoire | `/espace-pro/laboratoire/onboarding/realisations` |
| [LO4](#lo4) | Fiche laboratoire prête | Onboarding de complétion, laboratoire | `/espace-pro/laboratoire/onboarding/recapitulatif` |
| [U](#u) | Espace laboratoire | Onboarding de complétion, laboratoire | `/espace-pro (profil laboratoire)` |
| [O1](#o1) | Type d'organisme | École ou organisme | `/espace-pro/organisme` |
| [O2a](#o2a) | Retrouver l'établissement | École ou organisme | `/espace-pro/organisme/etablissement` |
| [O3a](#o3a) | Compléter les formations | École ou organisme | `/espace-pro/organisme/formations` |
| [OEND](#oend) | Établissement publié | École ou organisme | `/espace-pro/organisme/publie` |
| [W1](#w1) | Liste d'attente formation continue | École ou organisme | `/espace-pro/organisme/liste-d-attente` |
| [OA1](#oa1) | Demande d'ajout d'établissement | École ou organisme | `/espace-pro/organisme/etablissement/ajout` |
| [OAT](#oat) | Attestation de fonction | École ou organisme | `/espace-pro/organisme/etablissement/attestation` |
| [O2b](#o2b) | Proposer un partenariat | École ou organisme | `/espace-pro/organisme/partenariat` |
| [O3b](#o3b) | Demande reçue | École ou organisme | `/espace-pro/organisme/partenariat/recu` |
| [SE1](#se1) | Votre situation | Salarié ou étudiant | `/emploi/bienvenue/situation` |
| [SE2](#se2) | Ce que vous recherchez | Salarié ou étudiant | `/emploi/bienvenue/recherche` |
| [SE3](#se3) | Votre qualification | Salarié ou étudiant | `/emploi/bienvenue/qualification` |
| [SE3E](#se3e) | Votre formation | Salarié ou étudiant | `/emploi/bienvenue/formation` |
| [SE4](#se4) | Visibilité du profil | Salarié ou étudiant | `/emploi/bienvenue/visibilite` |
| [SE5](#se5) | Votre profil est prêt | Salarié ou étudiant | `/emploi/bienvenue/pret` |
| [D-EMPLOI](#d-emploi) | Emploi, dentiste | Espace emploi, professionnels | `/espace-pro/emploi` |
| [L-EMPLOI](#l-emploi) | Emploi, laboratoire | Espace emploi, professionnels | `/espace-pro/emploi (profil laboratoire)` |
| [D-CAND](#d-cand) | Candidatures reçues, dentiste | Espace emploi, professionnels | `/espace-pro/emploi/candidatures` |
| [L-CAND](#l-cand) | Candidatures reçues, laboratoire | Espace emploi, professionnels | `/espace-pro/emploi/candidatures (profil laboratoire)` |
| [OUV-PD-OFFRE](#ouv-pd-offre) | Publier une offre, dentiste | Espace emploi, professionnels | `/espace-pro/emploi (état : publier une offre)` |
| [OUV-PL-OFFRE](#ouv-pl-offre) | Publier une offre, laboratoire | Espace emploi, professionnels | `/espace-pro/emploi (profil laboratoire, état : publier une offre)` |
| [OUV-PD-PUBLIEE](#ouv-pd-publiee) | Offre publiée | Espace emploi, professionnels | `/espace-pro/emploi (état : offre publiée)` |
| [OUV-PD-ECHANGE](#ouv-pd-echange) | Proposer un échange | Espace emploi, professionnels | `/espace-pro/emploi (état : proposer un échange)` |
| [OUV-PD-POURVUE](#ouv-pd-pourvue) | Offre pourvue | Espace emploi, professionnels | `/espace-pro/emploi (état : offre pourvue)` |
| [CAND-VUE](#cand-vue) | Vue d'ensemble, salarié | Espace emploi, salarié ou étudiant | `/emploi` |
| [CAND-OFFRES](#cand-offres) | Offres, salarié | Espace emploi, salarié ou étudiant | `/emploi/offres` |
| [CAND-OFFRE](#cand-offre) | Détail d'une offre, salarié | Espace emploi, salarié ou étudiant | `/emploi/offres/[offreId]` |
| [CAND-CANDID](#cand-candid) | Candidatures, salarié | Espace emploi, salarié ou étudiant | `/emploi/candidatures` |
| [CAND-PROFIL](#cand-profil) | Profil, salarié | Espace emploi, salarié ou étudiant | `/emploi/profil` |
| [CAND-ALERTES](#cand-alertes) | Alertes | Espace emploi, salarié ou étudiant | `/emploi/alertes` |
| [CAND-VISI](#cand-visi) | Visibilité | Espace emploi, salarié ou étudiant | `/emploi/visibilite` |
| [ETU-VUE](#etu-vue) | Vue d'ensemble, étudiant | Espace emploi, salarié ou étudiant | `/emploi (profil étudiant)` |
| [ETU-OFFRES](#etu-offres) | Offres, étudiant | Espace emploi, salarié ou étudiant | `/emploi/offres (profil étudiant)` |
| [ETU-OFFRE](#etu-offre) | Détail d'une offre, étudiant | Espace emploi, salarié ou étudiant | `/emploi/offres/[offreId] (profil étudiant)` |
| [ETU-CANDID](#etu-candid) | Candidatures, étudiant | Espace emploi, salarié ou étudiant | `/emploi/candidatures (profil étudiant)` |
| [ETU-PROFIL](#etu-profil) | Profil, étudiant | Espace emploi, salarié ou étudiant | `/emploi/profil (profil étudiant)` |
| [ETU-FORM](#etu-form) | Formation | Espace emploi, salarié ou étudiant | `/emploi/formation` |
| [OUV-C-POSTULER](#ouv-c-postuler) | Postuler | Espace emploi, salarié ou étudiant | `/emploi/offres/[offreId] (état : postuler)` |
| [OUV-C-ENVOYEE](#ouv-c-envoyee) | Candidature envoyée | Espace emploi, salarié ou étudiant | `/emploi/offres/[offreId] (état : envoyée)` |
| [OUV-C-ALERTE](#ouv-c-alerte) | Créer une alerte | Espace emploi, salarié ou étudiant | `/emploi/alertes (état : créer une alerte)` |
| [OUV-C-ECHANGE](#ouv-c-echange) | Répondre à un échange | Espace emploi, salarié ou étudiant | `/emploi/candidatures (état : proposition d'échange)` |
| [OUV-C-MASQUER](#ouv-c-masquer) | Masquer une structure | Espace emploi, salarié ou étudiant | `/emploi/visibilite (état : masquer une structure)` |

## Tronc commun (connexion et aiguillage)

### CX1

**Connexion ou inscription** · titre affiché : « Connexion »

- Route : `/connexion`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=69-1811) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=69-1855)
- Action principale : « Recevoir mon lien de connexion »
- Action secondaire : « Utiliser une clé d'accès »
- Objectif : Point d'entrée unique, connexion et inscription confondues.
- Règles : Email au format RFC, normalisé en minuscules. Contexte d'origine mémorisé (paramètre next). Limite : 5 envois par heure et par adresse.
- Données : Écrit : demande de lien (table verification de Better Auth).
- Sorties :
  - → **CX2** : email valide
  - → **CX1-E** : email invalide
  - → **PSC1** : bouton Pro Santé Connect
  - → **CX6** : plus accès à l'email
  - → **Espace** : clé d'accès reconnue

### CX2

**Lien envoyé ou code** · titre affiché : « Lien envoyé, ou saisissez le code »

- Route : `/connexion/verifier`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=69-1997) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=69-2047)
- Action principale : « Valider le code »
- Action secondaire : « Renvoyer (disponible dans 45 s) »
- Objectif : Vérifier la possession de l'adresse.
- Règles : Lien valable 5 min, usage unique. Code 6 chiffres valable 10 min, 5 essais. Renvoi après 45 s.
- Données : Better Auth : plugins magicLink + emailOTP, un seul email contenant les deux.
- Sorties :
  - → **CX3** : 1re connexion avec cette adresse
  - → **T3** : compte sans profil
  - → **Origine** : compte avec profil : retour à la page d'origine
  - → **CX4** : 2e connexion : proposer une clé
  - → **CX2-E** : code incorrect
  - → **CX5** : lien expiré

### CX3

**Première connexion** · titre affiché : « Bienvenue sur DentalMap »

- Route : `/connexion/bienvenue`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=70-1948) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=70-1996)
- Action principale : « Créer mon compte »
- Objectif : Créer le compte et recueillir le consentement.
- Règles : CGU obligatoires (bouton inactif sinon). Rappels en opt-in, décochés par défaut.
- Données : Écrit : user (Better Auth), consentements horodatés (version des CGU).
- Sorties :
  - → **T3** : toujours, au premier passage
  - → **Fiche d'origine** : si arrivé par « Revendiquer cette fiche » : profil santé et fiche présélectionnés, saut vers S2

### T3

**Qui êtes-vous ?** · titre affiché : « Qui êtes-vous ? »

- Route : `/bienvenue/profil`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=70-2053) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=70-2112)
- Action principale : « Continuer »
- Action secondaire : « Je préfère ne pas répondre »
- Objectif : Aiguiller vers le parcours adapté.
- Règles : Choix unique parmi cinq profils. Posé une seule fois par compte.
- Données : Écrit : user.profil (patient, sante, labo, organisme, salarie).
- Sorties :
  - → **P2 ou P1** : Patient (selon l'origine)
  - → **S0** : Dentiste ou spécialiste
  - → **L1** : Prothésiste, laboratoire
  - → **O1** : École ou organisme
  - → **SE1** : Salarié ou étudiant (assistant(e), secrétaire, prothésiste salarié, étudiant)
  - → **P1** : Ne pas répondre

### CX1-E

**Connexion, adresse invalide** · titre affiché : « Connexion »

- Route : `/connexion (état erreur)`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=69-1910) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=69-1948)
- Action principale : « Recevoir mon lien de connexion »
- Objectif : Signaler une adresse mal formée sans quitter l'écran.
- Règles : Validation côté client puis côté serveur. Suggestion de correction pour les domaines courants (gmial.com → gmail.com).
- Données : Rien n'est écrit.
- Sorties :
  - → **CX2** : adresse corrigée

### CX2-E

**Code incorrect** · titre affiché : « Lien envoyé, ou saisissez le code »

- Route : `/connexion/verifier (état erreur)`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=69-2108) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=69-2157)
- Action principale : « Valider le code »
- Action secondaire : « Recevoir un nouveau code »
- Objectif : Expliquer l'échec et le nombre d'essais restants.
- Règles : Compteur par code. Au 5e échec, code invalidé et renvoi proposé.
- Données : Incrément du compteur d'essais.
- Sorties :
  - → **CX3** : code correct
  - → **CX2** : nouveau code demandé
  - → **CX5** : 5 erreurs

### CX4

**Proposer une clé d'accès** · titre affiché : « La prochaine fois, d'un geste »

- Route : `/connexion/cle-d-acces`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=70-2182) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=70-2222)
- Action principale : « Créer une clé d'accès »
- Action secondaire : « Plus tard »
- Objectif : Accélérer les connexions suivantes.
- Règles : Affiché si : 2e connexion réussie et aucune clé enregistrée. Une relance maximum.
- Données : Écrit : passkey (plugin Better Auth).
- Sorties :
  - → **Origine** : après création ou « Plus tard »

### CX6

**Plus accès à mon email** · titre affiché : « Plus accès à votre adresse ? »

- Route : `/connexion/recuperation`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=70-2362) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=70-2413)
- Action principale : « Continuer »
- Objectif : Récupérer un compte sans accès à l'adresse.
- Règles : Choix unique, selon le profil déclaré.
- Données : Écrit : demande de changement d'adresse (examen manuel pour labos et établissements).
- Sorties :
  - → **PSC1** : professionnel de santé
  - → **Formulaire** : laboratoire ou établissement
  - → **CX1** : patient, nouvelle adresse

### CX5

**Lien expiré ou déjà utilisé** · titre affiché : « Ce lien a expiré »

- Route : `/connexion/expire`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=70-2273) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=70-2311)
- Action principale : « Recevoir un nouveau lien »
- Action secondaire : « Saisir un code à la place »
- Objectif : Sortir d'un lien mort sans repartir de zéro.
- Règles : L'adresse est pré-remplie depuis le jeton expiré.
- Données : Nouvelle demande de lien.
- Sorties :
  - → **CX2** : nouveau lien ou code


## Patient ou proche

### P2

**Retour à la fiche, numéro visible** · titre affiché : « Le numéro est maintenant visible »

- Route : `fiche publique, numéro révélé (/dentistes/.../[slug])`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=73-2166) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=73-2210)
- Action principale : « Appeler le cabinet »
- Action secondaire : « Ajouter aux favoris »
- Objectif : Rendre le service demandé : le numéro du cabinet.
- Règles : Affiché si le compte arrive depuis « Afficher le numéro ».
- Données : Lu : fiche (registre). Écrit : favori si demandé.
- Sorties :
  - → **tel:** : Appeler
  - → **Favoris** : Ajouter aux favoris
  - → **Fiche** : retour à la fiche consultée

### P1

**Personnaliser (facultatif)** · titre affiché : « Où cherchez-vous en général ? »

- Route : `/bienvenue/patient`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=73-2263) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=73-2313)
- Action principale : « Terminer »
- Action secondaire : « Passer »
- Objectif : Personnaliser l'accueil pour un patient arrivé sans contexte.
- Règles : Ville via autocomplétion (table communes puis BAN). Tout est facultatif.
- Données : Écrit : préférences du compte (commune, profession).
- Sorties :
  - → **Accueil** : recherche pré-remplie


## Chirurgien-dentiste ou spécialiste (revendication)

### S0

**Comment vous identifier ?** · titre affiché : « Comment vous identifier ? »

- Route : `/espace-pro/revendiquer`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=73-2374) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=73-2424)
- Action principale : « S'identifier avec Pro Santé Connect »
- Action secondaire : « Rechercher ma fiche sans PSC »
- Objectif : Choisir la voie d'identification du soignant.
- Règles : PSC proposé par défaut. Description de la recherche sans PSC : « Vérification par email du registre, justificatif ou Pro Santé Connect ». Prérequis : raccordement DentalMap à PSC (api.gouv, bac à sable puis production).
- Données : Aucune écriture.
- Sorties :
  - → **PSC1** : Pro Santé Connect
  - → **S1** : recherche manuelle

### PSC1

**Redirection Pro Santé Connect** · titre affiché : « Vous quittez DentalMap quelques instants »

- Route : `/espace-pro/revendiquer/psc`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=73-2483) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=73-2534)
- Action principale : « Continuer vers Pro Santé Connect »
- Action secondaire : « Annuler »
- Objectif : Préparer la redirection vers l'ANS.
- Règles : Le choix e-CPS ou carte n'est qu'indicatif : PSC propose les deux.
- Données : Écrit : state, nonce en session.
- Sorties :
  - → **PSC-ANS** : continuer
  - → **S0** : annuler

### PSC-ANS

**Écran de l'ANS (externe)** · titre affiché : « Validez sur votre téléphone »

- Route : `externe (ANS)`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=73-2598) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=73-2631)
- Objectif : Authentifier le soignant chez l'ANS.
- Règles : Hors du contrôle de DentalMap.
- Données : Retour : code d'autorisation échangé contre un jeton.
- Sorties :
  - → **PSC2** : authentification réussie
  - → **PSC-E** : annulée, refusée ou erreur

### PSC2

**Retour PSC, fiche trouvée** · titre affiché : « Bonjour Dr Martin Dupont »

- Route : `/espace-pro/revendiquer/psc/retour`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=74-2382) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=74-2433)
- Action principale : « Revendiquer et continuer »
- Action secondaire : « Ce n'est pas ma fiche »
- Objectif : Confirmer le rapprochement RPPS et fiche.
- Règles : Correspondance exacte sur le RPPS. Si la fiche est déjà revendiquée par un autre compte : C1.
- Données : Écrit : revendications (méthode psc, statut validée), verifications.
- Sorties :
  - → **M1** : plusieurs lieux
  - → **B0** : un seul lieu
  - → **C1** : déjà revendiquée
  - → **S1** : ce n'est pas ma fiche

### M1

**Choisir les lieux d'exercice** · titre affiché : « Où exercez-vous ? »

- Route : `/espace-pro/lieux`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=74-2711) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=74-2757)
- Action principale : « Gérer ces lieux »
- Objectif : Choisir les lieux à compléter.
- Règles : Au moins un lieu. L'ordre de complétion suit le lieu principal.
- Données : Écrit : lieux gérés par le compte.
- Sorties :
  - → **B0** : lieux choisis

### PSC-E

**Échec Pro Santé Connect** · titre affiché : « Pro Santé Connect n'a pas abouti »

- Route : `/espace-pro/revendiquer/psc/retour (état erreur)`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=74-2497) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=74-2547)
- Action principale : « Réessayer »
- Action secondaire : « Rechercher ma fiche »
- Objectif : Ne jamais bloquer : proposer une autre voie.
- Règles : Erreur OIDC traduite en message unique. state invalide : nouvelle tentative obligatoire.
- Données : Journal technique uniquement.
- Sorties :
  - → **PSC1** : réessayer
  - → **S1** : recherche manuelle

### PSC-0

**RPPS sans fiche** · titre affiché : « Votre fiche n'existe pas encore »

- Route : `/espace-pro/revendiquer/psc/retour (sans fiche)`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=74-2610) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=74-2655)
- Action principale : « M'avertir par email »
- Action secondaire : « Retour à l'accueil »
- Objectif : Traiter un praticien valide absent de la base.
- Règles : Revendication en attente liée au RPPS, appliquée automatiquement à la création de la fiche.
- Données : Écrit : revendications (statut en_attente_fiche).
- Sorties :
  - → **Email** : fiche créée et revendiquée
  - → **Accueil** : retour

### S1

**Profession et RPPS** · titre affiché : « Retrouvons votre fiche »

- Route : `/espace-pro/revendiquer/recherche`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=74-2814) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=74-2862)
- Action principale : « Rechercher ma fiche »
- Action secondaire : « Je n'ai pas mon RPPS sous la main »
- Objectif : Retrouver la fiche sans PSC.
- Règles : RPPS : 11 chiffres, contrôle de clé. Nom : 2 caractères minimum, recherche trigram.
- Données : Lu : praticiens.
- Sorties :
  - → **S2** : 1 résultat
  - → **H1** : plusieurs résultats
  - → **S1-0** : aucun résultat

### S2

**C'est bien vous ?** · titre affiché : « C'est bien vous ? »

- Route : `/espace-pro/revendiquer/[praticienId]`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=74-2921) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=74-2971)
- Action principale : « C'est ma fiche »
- Action secondaire : « Ce n'est pas moi »
- Objectif : Confirmer l'identité de la fiche.
- Règles : Liens texte : retrait (R1), remplaçant (REMP).
- Données : Lu : praticiens, revendications.
- Sorties :
  - → **S3a** : email connu du registre
  - → **S3b** : pas d'email au registre
  - → **C1** : déjà revendiquée
  - → **R1** : retirer ma fiche
  - → **REMP** : remplaçant
  - → **S1** : ce n'est pas moi

### S3a

**Lien sur l'email du registre** · titre affiché : « Ouvrez le lien sur votre email professionnel »

- Route : `/espace-pro/revendiquer/[praticienId]/email`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=75-2633) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=75-2671)
- Action principale : « J'ai cliqué sur le lien »
- Action secondaire : « Je n'ai plus accès à cette adresse »
- Objectif : Prouver la possession de l'email du registre.
- Règles : Lien valable 24 h, usage unique. L'écran se met à jour seul quand le lien est ouvert.
- Données : Écrit : revendications (méthode email_pro, validée).
- Sorties :
  - → **M1** : validé, plusieurs lieux
  - → **B0** : validé, un seul lieu
  - → **S3b** : plus accès à l'adresse

### H1

**Homonymes** · titre affiché : « 3 fiches portent ce nom »

- Route : `/espace-pro/revendiquer/recherche?resultats=multiples`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=75-2720) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=75-2776)
- Action principale : « C'est ma fiche »
- Action secondaire : « Aucune n'est la mienne »
- Objectif : Départager plusieurs résultats.
- Règles : Tri par ville saisie puis alphabétique. 20 résultats max.
- Données : Lu : praticiens, lieux_exercice.
- Sorties :
  - → **S2** : fiche choisie
  - → **S1-0** : aucune n'est la mienne
  - → **S1** : nouvelle recherche

### C1

**Fiche déjà revendiquée** · titre affiché : « Cette fiche est déjà gérée par un autre compte »

- Route : `/espace-pro/revendiquer/[praticienId]/conflit`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=75-2845) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=75-2886)
- Action principale : « Prouver avec Pro Santé Connect »
- Action secondaire : « Écrire à l’équipe »
- Objectif : Résoudre un conflit de revendication.
- Règles : Mêmes preuves que S3b (Pro Santé Connect, carte d’identité par FranceConnect+, équipe), aucun document. Délai de réponse de 7 jours pour le compte actuel.
- Données : Écrit : contestation liée aux deux comptes.
- Sorties :
  - → **PSC1** : prouver avec PSC
  - → **Contact** : écrire à l’équipe

### S3b

**Choisir la vérification** · titre affiché : « Comment prouver que c'est vous ? »

- Route : `/espace-pro/revendiquer/[praticienId]/methode`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=75-2938) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=75-2992)
- Action principale : « Continuer »
- Objectif : Choisir comment prouver son identité, sans document.
- Règles (13 octobre 2026) : Pro Santé Connect (immédiat), carte d’identité par FranceConnect+ (« Bientôt »), ou « Demander à l’équipe » (contact, objet « Ma fiche ou mon espace pro »). Aucun document reçu. Le courrier au cabinet est abandonné (11 octobre 2026).
- Données : Écrit : méthode choisie.
- Sorties :
  - → **PSC1** : Pro Santé Connect
  - → **FranceConnect+** : carte d’identité (à venir)
  - → **Contact** : demander à l’équipe

### S1-0

**Aucune fiche trouvée** · titre affiché : « Aucune fiche ne correspond »

- Route : `/espace-pro/revendiquer/recherche?resultats=aucun`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=76-2948) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=76-2999)
- Action principale : « M'avertir à la création »
- Action secondaire : « Modifier ma recherche »
- Objectif : Ne pas laisser un praticien sans issue.
- Règles : Alerte liée au RPPS saisi, déclenchée par le job sync-ans.
- Données : Écrit : alerte (rpps, user).
- Sorties :
  - → **Email** : fiche créée
  - → **S1** : modifier la recherche

### R1

**Retirer ma fiche** · titre affiché : « Retirer votre fiche de DentalMap »

- Route : `/espace-pro/revendiquer/[praticienId]/retrait`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=76-3063) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=76-3112)
- Action principale : « Vérifier mon identité »
- Action secondaire : « Finalement, la garder »
- Objectif : Exercer le droit de retrait.
- Règles : Retrait effectif seulement après vérification d'identité.
- Données : Écrit : demande de retrait (statut en_attente).
- Sorties :
  - → **PSC1 ou S3a ou S3b** : vérification
  - → **R2** : identité vérifiée
  - → **S2** : garder la fiche

### R2

**Fiche retirée** · titre affiché : « Votre fiche est retirée »

- Route : `/espace-pro/revendiquer/[praticienId]/retrait/confirme`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=76-3172) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=76-3217)
- Action principale : « Terminer »
- Action secondaire : « Annuler le retrait »
- Objectif : Confirmer le retrait.
- Règles : Marqueur de retrait respecté par la synchro (la fiche n'est pas recréée).
- Données : Écrit : praticiens.retrait_demande_le, revalidateTag praticien et commune.
- Sorties :
  - → **Accueil** : terminer
  - → **S2** : annuler le retrait (30 j)

### JD1

> Retiré du parcours soignant le 13 octobre 2026 : l’adresse redirige vers S3b. Section gardée pour l’historique.

**Déposer un justificatif** · titre affiché : « Déposez un justificatif »

- Route : `/espace-pro/revendiquer/[praticienId]/justificatif`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=76-3273) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=76-3315)
- Action principale : « Envoyer le justificatif »
- Action secondaire : « Choisir une autre méthode »
- Objectif : Recueillir une preuve documentaire, vérifiée automatiquement.
- Règles : Types : PDF, JPG, PNG. Taille max 10 Mo. Vérification automatique en quelques minutes : lisibilité, présence du nom, comparaison au registre RPPS.
- Données : Le document est analysé puis supprimé dès la fin de la vérification, validée ou non : il n'est jamais stocké. Écrit : revendications (méthode document, résultat de la vérification).
- Sorties :
  - → **K** : envoyé
  - → **S3b** : autre méthode

### K

> Retiré du parcours soignant le 13 octobre 2026. `/espace-pro/revendiquer/suivi` reste le suivi du Kbis (KL) et des contestations.

**Vérification automatique du justificatif** · titre affiché : « Vérification automatique en cours »

- Route : `/espace-pro/revendiquer/suivi`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=76-3368) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=76-3434)
- Action principale : « Préparer ma fiche »
- Action secondaire : « Remplacer le document »
- Objectif : Faire patienter quelques minutes sans immobiliser le praticien.
- Règles : Écran d'attente de quelques minutes, mis à jour seul. Frise : justificatif reçu, comparaison au registre RPPS (en cours), document supprimé, fiche publiée. Encart : « Votre justificatif n'est pas conservé ». Aucun délai d'examen ni relance interne.
- Données : Lu : revendications (résultat de la vérification). Écrit : brouillon fiches_completees.
- Sorties :
  - → **B0** : préparer en brouillon
  - → **M1 ou B0** : validé
  - → **L** : refusé

### L

> Côté soignant, le refus propose désormais les preuves de S3b, sans « autre document ».

**Justificatif refusé** · titre affiché : « Nous n'avons pas pu valider ce justificatif »

- Route : `/espace-pro/revendiquer/suivi (refus)`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=76-3513) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=76-3569)
- Action principale : « Continuer »
- Action secondaire : « Écrire à l'équipe »
- Objectif : Expliquer le refus et relancer une nouvelle vérification.
- Règles : Motif issu de la vérification automatique, choisi dans une liste fermée (exemple : « numéro RPPS illisible »). Pas d'option courrier. Nouvelle vérification automatique en quelques minutes.
- Données : Écrit : revendications (refusée, motif). Le document refusé est déjà supprimé : rien n'est conservé.
- Sorties :
  - → **JD1** : autre document, nouvelle vérification automatique en quelques minutes
  - → **PSC1** : Pro Santé Connect

### REMP

**Remplaçant ou collaborateur** · titre affiché : « Vous exercez dans le cabinet d'un confrère ? »

- Route : `/espace-pro/revendiquer/[praticienId]/remplacant`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=76-3638) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=76-3686)
- Action principale : « Me prévenir »
- Action secondaire : « Retour »
- Objectif : Traiter les exercices sans lieu propre.
- Règles : Inscription à une liste d'intérêt, aucune revendication créée.
- Données : Écrit : liste d'intérêt (user, motif).
- Sorties :
  - → **Accueil** : me prévenir
  - → **S2** : retour


## Onboarding de complétion, dentiste

### B0

**Ce que nous savons déjà** · titre affiché : « Voici ce que nous savons déjà »

- Route : `/espace-pro/onboarding/recuperation`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=77-3269) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=77-3337)
- Action principale : « C'est juste, continuer »
- Action secondaire : « Signaler une erreur »
- Objectif : Montrer la valeur déjà acquise avant de demander quoi que ce soit.
- Règles : Aucune saisie. « Signaler une erreur » ouvre un formulaire hors tunnel.
- Données : Lu : praticiens, lieux_exercice, verifications.
- Sorties :
  - → **B0S** : c'est juste
  - → **Signalement** : erreur dans le registre

### B0S

**Spécialité et domaines de soins** · titre affiché : « Votre spécialité et vos domaines de soins »

- Route : `/espace-pro/onboarding/specialite`
- Figma : section 200:7039 (desktop 200:7057, mobile 200:7211). Codé le 15 octobre 2026.
- Action principale : « Continuer »
- Action secondaire : « Passer cette étape »
- Objectif : Afficher la qualification du registre et recueillir les domaines d'exercice.
- Règles : Étape 1 sur 4. Qualification lue au registre (Annuaire Santé), verrouillée : omnipratique, ou spécialité qualifiante (orthopédie dento-faciale, chirurgie orale, médecine bucco-dentaire). Domaines d'exercice déclarés, 5 au plus, liste fermée : soins conservateurs, endodontie, parodontologie, implantologie, prothèse, orthodontie, soins des enfants, chirurgie orale, esthétique, occlusodontie, soins sous sédation, patients en situation de handicap. Affichés « renseigné par le praticien ». Ouvre le filtre « Domaine de soins ». Remplace la mission « Domaines de soins » du tableau de bord (ancienne B6). Poids à arbitrer : la mission valait +8 %, aucun gain affiché sur le bouton tant qu'il n'est pas fixé.
- Données : Lu : qualification (praticiens.specialite, Annuaire Santé). Écrit : fiches_completees.orientations (text[]), la colonne existante de la mission.
- Sorties :
  - → **B1** : valider ou passer

### B1

**Horaires** · titre affiché : « Quand êtes-vous ouvert ? »

- Route : `/espace-pro/onboarding/horaires`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=77-3421) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=77-3501)
- Action principale : « Valider · +20 % »
- Action secondaire : « Passer cette étape »
- Objectif : Recueillir les horaires hebdomadaires.
- Règles : Étape 2 sur 4. Au moins un jour ouvert. Créneaux sans chevauchement. Pause déjeuner facultative.
- Données : Écrit : fiches_completees.horaires (jsonb), horaires_confirmes_le.
- Sorties :
  - → **B2** : valider ou passer

### B2

**Conventionnement** · titre affiché : « Conventionnement et paiement »

- Route : `/espace-pro/onboarding/conventionnement`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=77-3597) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=77-3658)
- Action principale : « Valider · +10 % »
- Action secondaire : « Passer cette étape »
- Objectif : Renseigner secteur et tiers payant.
- Règles : Étape 3 sur 4. Choix uniques, tous deux requis pour les 10 points.
- Données : Écrit : fiches_completees.secteur, tiers_payant.
- Sorties :
  - → **B3** : valider ou passer

### B3

**Accueil des patients** · titre affiché : « Qui pouvez-vous accueillir ? »

- Route : `/espace-pro/onboarding/accueil`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=77-3737) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=77-3801)
- Action principale : « Valider · +10 % »
- Action secondaire : « Passer cette étape »
- Objectif : Renseigner langues, accessibilité, âge minimum.
- Règles : Étape 4 sur 4. Trois réponses requises pour les 10 points.
- Données : Écrit : langues (text[]), acces_pmr, age_min.
- Sorties :
  - → **B4** : valider ou passer

### B4

**Photo du cabinet** · titre affiché : « Montrez l'entrée du cabinet »

- Route : `/espace-pro/onboarding/photo`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=78-3535) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=78-3576)
- Action principale : « Utiliser cette photo · +12 % »
- Action secondaire : « Passer cette étape »
- Objectif : Ajouter la photo de l'entrée.
- Règles : JPG ou PNG, 5 Mo max, recadrage 16:9 proposé. Métadonnées EXIF supprimées.
- Données : Écrit : Vercel Blob (public), fiches_completees.photo_blob_url.
- Sorties :
  - → **B5** : valider ou passer

### B5

**Présentation** · titre affiché : « Présentez votre pratique »

- Route : `/espace-pro/onboarding/presentation`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=78-3632) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=78-3677)
- Action principale : « Valider · +10 % »
- Action secondaire : « Passer cette étape »
- Objectif : Recueillir une présentation utile et neutre.
- Règles : 200 à 800 caractères. Liste de termes refusés (meilleur, n°1, garanti, prix…). Points accordés si aucun terme refusé.
- Données : Écrit : fiches_completees.presentation.
- Sorties :
  - → **B7** : valider ou passer

### B6

**Domaines de soins** · titre affiché : « Vos domaines de soins »

- Route : `/espace-pro/onboarding/soins`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=78-3737) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=78-3797)
- Note : remplacé par B0S le 11 octobre 2026 (domaines déclarés dès l'onboarding). Fiche conservée pour la trace, ne pas implémenter.
- Action principale : « Valider · +8 % »
- Action secondaire : « Passer cette étape »
- Objectif : Préciser les soins pratiqués.
- Règles : Liste fermée, minimum 2 pour les 8 points.
- Données : Écrit : fiches_completees.specialites (text[]).
- Sorties :
  - → **B0S** : remplacé par B0S

### B7

**Votre fiche est prête** · titre affiché : « Voici ce que verront les patients »

- Route : `/espace-pro/onboarding/recapitulatif`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=78-3874) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=78-3938)
- Action principale : « Publier ma fiche »
- Action secondaire : « Modifier une réponse »
- Objectif : Faire valider le rendu public avant publication.
- Règles : Publication immédiate. revalidateTag praticien et commune.
- Données : Écrit : fiches_completees.updated_at, statut publié.
- Sorties :
  - → **J** : palier franchi (90 % ou plus)
  - → **DASH** : sinon, espace pro
  - → **B0S à B5** : modifier une réponse

### J

**Célébration, palier atteint**

- Route : `/espace-pro (modale de palier)`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=78-4012) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=78-4077)
- Objectif : Marquer le franchissement d'un palier.
- Règles : Plein écran à 90 points et plus, toast léger aux paliers 40 et 70. Respecte prefers-reduced-motion (pas de confettis animés).
- Données : Écrit : distinction débloquée (horodatée).
- Sorties :
  - → **DASH** : continuer
  - → **Fiche publique** : voir comme un patient

### DASH

**Espace pro, force de fiche**

- Route : `/espace-pro`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=78-4135) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=78-4319)
- Objectif : Point d'arrivée : piloter la complétude et la fraîcheur.
- Règles : Prochaine action calculée : élément non rempli au plus fort gain, puis élément à reconfirmer.
- Données : Lu : fiches_completees, verifications, distinctions. Score calculé à la volée.
- Sorties :
  - → **Ma fiche** : prochaine action
  - → **Données du registre** : onglet Registre
  - → **Compte et sécurité** : onglet Compte


## Prothésiste, laboratoire (revendication)

### L1

**Retrouver le laboratoire** · titre affiché : « Retrouvons votre laboratoire »

- Route : `/espace-pro/laboratoire/revendiquer`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=79-3874) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=79-3916)
- Action principale : « Rechercher »
- Action secondaire : « Mon laboratoire vient d'être créé »
- Objectif : Retrouver la fiche du laboratoire.
- Règles : SIREN 9 chiffres ou SIRET 14 (clé de Luhn), ou raison sociale (trigram).
- Données : Lu : praticiens (profession prothesiste).
- Sorties :
  - → **L2** : 1 établissement
  - → **LE1** : plusieurs établissements
  - → **LA1** : introuvable ou création récente

### L2

**Votre laboratoire et votre rôle** · titre affiché : « C'est bien votre laboratoire ? »

- Route : `/espace-pro/laboratoire/revendiquer/[praticienId]`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=79-4188) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=79-4242)
- Action principale : « C'est mon laboratoire »
- Action secondaire : « Ce n'est pas le bon établissement »
- Objectif : Confirmer l'établissement et le rôle.
- Règles : Rôle obligatoire.
- Données : Écrit : rôle déclaré.
- Sorties :
  - → **L3** : gérant
  - → **MAN** : salarié mandaté
  - → **LINFO** : prothésiste salarié
  - → **LC1** : déjà revendiqué
  - → **L1** : pas le bon établissement

### L3

**Kbis ou courrier au siège** · titre affiché : « Vérifions que vous représentez ce laboratoire »

- Route : `/espace-pro/laboratoire/revendiquer/[praticienId]/preuve`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=80-4186) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=80-4235)
- Action principale : « Envoyer l'extrait Kbis »
- Action secondaire : « Recevoir un code au siège »
- Objectif : Prouver le lien avec l'établissement.
- Règles : Kbis : date de moins de 3 mois, SIREN identique, gérant nommé.
- Données : Écrit : Kbis (Blob privé), revendications (méthode document ou courrier).
- Sorties :
  - → **KL** : Kbis envoyé
  - → **LCODE** : courrier au siège

### KL

**Kbis en examen** · titre affiché : « Votre Kbis est en cours d'examen »

- Route : `/espace-pro/revendiquer/suivi`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=80-4502) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=80-4569)
- Action principale : « Préparer la fiche »
- Action secondaire : « Remplacer le document »
- Objectif : Faire patienter en restant actif.
- Règles : SLA 48 h ouvrées.
- Données : Écrit : brouillon fiche laboratoire.
- Sorties :
  - → **LK1 ou LO1** : validé
  - → **LREF** : refusé
  - → **LO1** : préparer en brouillon

### LK1

**Lier à une fiche praticien** · titre affiché : « Laboratoire intégré à un cabinet ? »

- Route : `/espace-pro/laboratoire/liaison`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=80-4762) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=80-4810)
- Action principale : « Lier les deux fiches »
- Action secondaire : « Ignorer »
- Objectif : Relier un labo intégré à la fiche du praticien.
- Règles : Proposé si correspondance nom du gérant et RPPS. Facultatif.
- Données : Écrit : liaison labo et praticien.
- Sorties :
  - → **LO1** : lier ou ignorer
  - → **PSC1** : fiche praticien non revendiquée

### LE1

**Choisir l'établissement** · titre affiché : « Ce SIREN a 3 établissements »

- Route : `/espace-pro/laboratoire/revendiquer?etablissements=multiples`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=79-3968) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=79-4020)
- Action principale : « Gérer la sélection »
- Action secondaire : « Retour »
- Objectif : Choisir les établissements à revendiquer.
- Règles : Sélection multiple. Établissements fermés non sélectionnables.
- Données : Lu : établissements par SIREN.
- Sorties :
  - → **L2** : sélection faite

### MAN

**Mandat du gérant** · titre affiché : « Vous agissez pour le gérant »

- Route : `/espace-pro/laboratoire/revendiquer/[praticienId]/mandat`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=79-4306) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=79-4351)
- Action principale : « Envoyer Kbis et mandat »
- Action secondaire : « Télécharger le modèle de mandat »
- Objectif : Autoriser un salarié à gérer la fiche.
- Règles : Deux fichiers requis. Email du gérant obligatoire.
- Données : Écrit : Kbis et mandat (Blob privé), notification au gérant.
- Sorties :
  - → **KL** : envoyé

### LCODE

**Code reçu au siège** · titre affiché : « Saisissez le code reçu au siège »

- Route : `/espace-pro/laboratoire/revendiquer/[praticienId]/courrier`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=80-4294) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=80-4345)
- Action principale : « Valider le code »
- Action secondaire : « Je n'ai rien reçu »
- Objectif : Valider la revendication par courrier.
- Règles : Comparaison sur hash, 3 essais.
- Données : Écrit : revendications (validée).
- Sorties :
  - → **LK1 ou LO1** : code correct
  - → **CE1** : code bloqué ou expiré
  - → **L3** : rien reçu

### LREF

**Kbis refusé** · titre affiché : « Nous n'avons pas pu valider ce Kbis »

- Route : `/espace-pro/revendiquer/suivi (refus)`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=80-4648) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=80-4699)
- Action principale : « Continuer »
- Action secondaire : « Écrire à l'équipe »
- Objectif : Relancer après refus.
- Règles : Motif issu d'une liste fermée.
- Données : Écrit : revendications (refusée, motif).
- Sorties :
  - → **L3** : autre Kbis ou courrier

### LA1

**Demande d'ajout** · titre affiché : « Votre laboratoire n'est pas listé »

- Route : `/espace-pro/laboratoire/ajout`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=79-4084) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=79-4131)
- Action principale : « Envoyer la demande »
- Action secondaire : « Retour »
- Objectif : Faire entrer un laboratoire absent.
- Règles : Contrôle Sirene : établissement actif. NAF hors 32.50A : examen manuel de l'activité.
- Données : Écrit : demande d'ajout + Kbis (Blob privé).
- Sorties :
  - → **Email** : fiche créée
  - → **L1** : retour

### LINFO

**Prothésiste salarié** · titre affiché : « Pas de fiche individuelle pour l'instant »

- Route : `/espace-pro/laboratoire/revendiquer/[praticienId]/salarie`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=79-4408) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=79-4454)
- Action principale : « Continuer »
- Action secondaire : « Retour »
- Objectif : Ne pas laisser sans issue un salarié non habilité.
- Règles : Aucune revendication créée.
- Données : Écrit : liste d'intérêt.
- Sorties :
  - → **Accueil** : continuer
  - → **L2** : retour

### LC1

**Laboratoire déjà revendiqué** · titre affiché : « Ce laboratoire est déjà géré par un autre compte »

- Route : `/espace-pro/laboratoire/revendiquer/[praticienId]/conflit`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=80-4408) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=80-4450)
- Action principale : « Envoyer un extrait Kbis »
- Action secondaire : « Demander une invitation »
- Objectif : Résoudre un conflit sur une fiche laboratoire.
- Règles : Kbis obligatoire, délai de réponse de 7 jours.
- Données : Écrit : contestation.
- Sorties :
  - → **KL** : Kbis envoyé
  - → **Invitation** : demande transmise au titulaire


## Onboarding de complétion, laboratoire

### LO0

**Ce que nous savons du laboratoire** · titre affiché : « Voici ce que nous savons déjà »

- Route : `/espace-pro/laboratoire/onboarding/recuperation`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=81-4445) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=81-4505)
- Action principale : « C'est juste, continuer »
- Action secondaire : « Signaler une erreur »
- Objectif : Montrer la valeur acquise.
- Règles : Aucune saisie.
- Données : Lu : praticiens (prothesiste), lieux_exercice.
- Sorties :
  - → **LO1** : continuer

### LO1

**Savoir-faire et matériaux** · titre affiché : « Ce que votre laboratoire fabrique »

- Route : `/espace-pro/laboratoire/onboarding/savoir-faire`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=81-4582) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=81-4642)
- Action principale : « Valider · +25 % »
- Action secondaire : « Passer cette étape »
- Objectif : Décrire le savoir-faire.
- Règles : Listes fermées. 3 techniques minimum pour les 15 points.
- Données : Écrit : fiche labo (techniques, materiaux).
- Sorties :
  - → **LO2** : valider ou passer

### LO2

**Délais et zone desservie** · titre affiché : « Délais et zone desservie »

- Route : `/espace-pro/laboratoire/onboarding/delais`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=81-4719) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=81-4771)
- Action principale : « Valider · +20 % »
- Action secondaire : « Passer cette étape »
- Objectif : Indiquer délais moyens et zone.
- Règles : Délais en jours ouvrés, 1 à 60. Rayon 5 à 150 km.
- Données : Écrit : delais (jsonb), rayon_km, ramassage.
- Sorties :
  - → **LO3** : valider ou passer

### LO3

**Réalisations et ANSM** · titre affiché : « Montrez vos réalisations »

- Route : `/espace-pro/laboratoire/onboarding/realisations`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=81-4840) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=81-4882)
- Action principale : « Valider · +20 % »
- Action secondaire : « Passer cette étape »
- Objectif : Montrer le travail et la conformité.
- Règles : 1 à 8 photos, 5 Mo chacune. EXIF supprimé.
- Données : Écrit : Blob public, declare_ansm.
- Sorties :
  - → **LO4** : valider ou passer

### LO4

**Fiche laboratoire prête** · titre affiché : « Voici ce que verront les cabinets »

- Route : `/espace-pro/laboratoire/onboarding/recapitulatif`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=81-4941) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=81-4996)
- Action principale : « Publier la fiche »
- Action secondaire : « Ajouter une présentation »
- Objectif : Valider le rendu avant publication.
- Règles : Publication immédiate, revalidation des tags.
- Données : Écrit : statut publié.
- Sorties :
  - → **U** : publier
  - → **J** : palier franchi

### U

**Espace laboratoire**

- Route : `/espace-pro (profil laboratoire)`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=83-5454) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=83-5710)
- Objectif : Point d'arrivée du laboratoire.
- Règles : Barème laboratoire : identité 30, savoir-faire 15, matériaux 10, délais 10, zone 10, réalisations 10, ANSM 10, présentation 5.
- Données : Score calculé à la volée, jamais triable.
- Sorties :
  - → **Ma fiche** : prochaine action
  - → **Collaborateurs** : inviter un salarié


## École ou organisme

### O1

**Type d'organisme** · titre affiché : « Quel type d'organisme ? »

- Route : `/espace-pro/organisme`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=82-4704) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=82-4767)
- Action principale : « Continuer »
- Objectif : Aiguiller les organismes.
- Règles : Choix unique.
- Données : Écrit : user.profil = organisme, sous-type.
- Sorties :
  - → **O2a** : école ou faculté
  - → **W1** : formation continue
  - → **O2b** : Ordre, syndicat, éditeur

### O2a

**Retrouver l'établissement** · titre affiché : « Retrouvons votre établissement »

- Route : `/espace-pro/organisme/etablissement`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=82-4840) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=82-4891)
- Action principale : « C'est mon établissement »
- Action secondaire : « Mon établissement n'est pas listé »
- Objectif : Retrouver la fiche établissement.
- Règles : Recherche sur nom, ville, UAI.
- Données : Lu : CPT formation (WordPress) et référentiel UAI.
- Sorties :
  - → **O3a** : email sur le domaine
  - → **OAT** : email hors domaine
  - → **OA1** : non listé

### O3a

**Compléter les formations** · titre affiché : « Vos formations »

- Route : `/espace-pro/organisme/formations`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=82-5152) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=82-5213)
- Action principale : « Publier »
- Action secondaire : « Terminer plus tard »
- Objectif : Compléter la fiche établissement.
- Règles : Au moins une formation active.
- Données : Écrit : CPT formation via API (champs ACF).
- Sorties :
  - → **OEND** : publier

### OEND

**Établissement publié** · titre affiché : « Votre établissement est en ligne »

- Route : `/espace-pro/organisme/publie`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=83-5004) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=83-5050)
- Action principale : « Voir la fiche publique »
- Action secondaire : « Modifier les formations »
- Objectif : Confirmer la publication.
- Règles : revalidateTag wp:formation.
- Données : Lu : CPT formation.
- Sorties :
  - → **Fiche publique** : voir
  - → **O3a** : modifier

### W1

**Liste d'attente formation continue** · titre affiché : « Le recensement de la formation continue n'est pas encore ouvert »

- Route : `/espace-pro/organisme/liste-d-attente`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=83-5108) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=83-5155)
- Action principale : « M'inscrire sur la liste »
- Action secondaire : « Voir les écoles et facultés »
- Objectif : Capter l'intérêt sans publier de données non vérifiées.
- Règles : Organisme et spécialités obligatoires.
- Données : Écrit : liste d'attente.
- Sorties :
  - → **Accueil** : inscription faite
  - → **O2a** : écoles et facultés

### OA1

**Demande d'ajout d'établissement** · titre affiché : « Ajouter votre établissement »

- Route : `/espace-pro/organisme/etablissement/ajout`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=82-4954) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=82-5003)
- Action principale : « Envoyer la demande »
- Action secondaire : « Retour »
- Objectif : Faire entrer un établissement absent.
- Règles : UAI au format 7 chiffres + 1 lettre.
- Données : Écrit : demande d'ajout.
- Sorties :
  - → **Email** : fiche créée
  - → **O2a** : retour

### OAT

**Attestation de fonction** · titre affiché : « Votre email n'est pas sur le domaine de l'établissement »

- Route : `/espace-pro/organisme/etablissement/attestation`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=82-5062) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=82-5102)
- Action principale : « Envoyer l'attestation »
- Action secondaire : « Utiliser une adresse de l'établissement »
- Objectif : Prouver le lien sans email institutionnel.
- Règles : PDF signé, moins de 3 mois.
- Données : Écrit : attestation (Blob privé).
- Sorties :
  - → **O3a** : validée
  - → **O2a** : autre adresse

### O2b

**Proposer un partenariat** · titre affiché : « Devenir partenaire »

- Route : `/espace-pro/organisme/partenariat`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=83-5212) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=83-5261)
- Action principale : « Envoyer ma demande »
- Action secondaire : « Retour »
- Objectif : Recueillir une demande de partenariat.
- Règles : Tous les champs requis. Aucun compte pro créé.
- Données : Écrit : demande de partenariat (même formulaire que l'accueil).
- Sorties :
  - → **O3b** : envoyer

### O3b

**Demande reçue** · titre affiché : « Demande reçue »

- Route : `/espace-pro/organisme/partenariat/recu`
- Figma : [desktop](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=83-5320) · [mobile](https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=83-5382)
- Action principale : « Retour à l'accueil »
- Objectif : Confirmer et fixer les attentes.
- Règles : Accusé de réception par email.
- Données : Lu : demande.
- Sorties :
  - → **Accueil** : retour


## Salarié ou étudiant

Parcours ouvert par le cinquième profil de T3 (assistant(e), secrétaire, prothésiste salarié, étudiant). Il crée un profil candidat, pas une fiche publique.

### SE1

**Votre situation** · titre affiché : « Quelle est votre situation ? »

- Route : `/emploi/bienvenue/situation`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Continuer »
- Objectif : Adapter l'espace emploi à la situation de la personne.
- Règles : Choix unique : assistant(e) dentaire, secrétaire ou assistant(e) de gestion, prothésiste salarié(e), étudiant(e).
- Données : Écrit : user.profil = salarie, profil candidat (situation).
- Sorties :
  - → **SE2** : situation choisie

### SE2

**Ce que vous recherchez** · titre affiché : « Que recherchez-vous ? »

- Route : `/emploi/bienvenue/recherche`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Continuer »
- Objectif : Recueillir les critères de recherche et créer la première alerte.
- Règles : Contrats, choix multiple : CDI, CDD, remplacement, alternance, stage. Temps plein ou partiel. Ville par autocomplétion (table communes puis BAN), rayon de 5 à 50 km. Disponibilité. Crée la première alerte avec ces critères.
- Données : Écrit : profil candidat (contrats, temps, commune, rayon_km, disponibilité), première alerte.
- Sorties :
  - → **SE3** : salarié
  - → **SE3E** : étudiant

### SE3

**Votre qualification** · titre affiché : « Votre qualification »

- Route : `/emploi/bienvenue/qualification`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Continuer »
- Action secondaire : « Vérifier mon titre plus tard »
- Objectif : Connaître la qualification et permettre de la faire vérifier.
- Règles : Choix unique : titre d'assistant(e) dentaire, en formation, autre. Vérification du titre facultative et automatique ; le document est supprimé dès la fin de la vérification, validée ou non. Badge « Titre vérifié » si la vérification aboutit.
- Données : Écrit : profil candidat (qualification, titre_verifie_le). Aucun document conservé.
- Sorties :
  - → **SE4** : continuer ou vérifier plus tard

### SE3E

**Votre formation** · titre affiché : « Votre formation »

- Route : `/emploi/bienvenue/formation`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Continuer »
- Action secondaire : « Passer cette étape »
- Objectif : Connaître la formation d'un étudiant pour lui proposer alternance, stage ou job étudiant.
- Règles : École choisie parmi les pages établissement vérifiées. Formation, année d'études. Recherche : alternance, stage, job étudiant. Certificat de scolarité facultatif, vérifié automatiquement puis supprimé.
- Données : Lu : établissements vérifiés. Écrit : profil candidat (école, formation, année, recherche). Aucun document conservé.
- Sorties :
  - → **SE4** : continuer ou passer

### SE4

**Visibilité du profil** · titre affiché : « Qui peut voir votre profil ? »

- Route : `/emploi/bienvenue/visibilite`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Continuer »
- Objectif : Laisser la personne choisir ce que voient les recruteurs.
- Règles : Choix unique : visible par les recruteurs vérifiés, anonymisé, ou discret (aucun recruteur ne voit le profil, la personne postule elle-même). Masquage d'une ou plusieurs structures (l'employeur actuel par exemple). Alertes par courriel, cochées ou non par la personne. Jamais de coordonnées transmises sans accord.
- Données : Écrit : profil candidat (visibilite, structures_masquees), préférences d'alerte.
- Sorties :
  - → **SE5** : continuer

### SE5

**Votre profil est prêt** · titre affiché : « Votre profil est prêt »

- Route : `/emploi/bienvenue/pret`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Voir les offres »
- Action secondaire : « Compléter mon profil »
- Objectif : Confirmer la création du profil et ouvrir l'espace emploi.
- Règles : Récapitulatif : situation, critères, qualification ou formation, visibilité. Tout reste modifiable depuis l'espace emploi.
- Données : Lu : profil candidat.
- Sorties :
  - → **CAND-VUE** : salarié : espace emploi
  - → **ETU-VUE** : étudiant : espace emploi
  - → **CAND-PROFIL ou ETU-PROFIL** : compléter mon profil


## Espace emploi, professionnels (dentiste et laboratoire)

Nouvelle rubrique « Emploi » de la barre latérale de l'espace pro : après « Fraîcheur » pour le dentiste, après « Conformité » pour le laboratoire. Les états OUV-PD-PUBLIEE, OUV-PD-ECHANGE et OUV-PD-POURVUE servent aux deux profils. Routes proposées, à confirmer à l'implémentation.

### D-EMPLOI

**Emploi, dentiste** · titre affiché : « Emploi »

- Route : `/espace-pro/emploi`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Publier une offre »
- Action secondaire : « Voir les candidatures »
- Objectif : Gérer les offres du cabinet et voir les profils disponibles autour.
- Règles : Rubrique « Emploi » de la barre latérale, après « Fraîcheur ». Offres regroupées par statut : en ligne, brouillon, pourvue. Profils disponibles près de vous : anonymisés, triés par distance, seulement les profils visibles ou anonymisés, jamais les profils discrets ni ceux qui ont masqué la structure. Jamais de coordonnées sans accord de la personne. La copie ne promet ni gratuité ni absence de mise en avant payante.
- Données : Lu : offres de la structure, profils candidats (selon leur visibilité et leurs structures masquées).
- Sorties :
  - → **OUV-PD-OFFRE** : publier une offre
  - → **D-CAND** : voir les candidatures
  - → **OUV-PD-ECHANGE** : proposer un échange à un profil
  - → **OUV-PD-POURVUE** : marquer une offre pourvue

### L-EMPLOI

**Emploi, laboratoire** · titre affiché : « Emploi »

- Route : `/espace-pro/emploi (profil laboratoire)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Publier une offre »
- Action secondaire : « Voir les candidatures »
- Objectif : Gérer les offres du laboratoire et voir les profils disponibles autour.
- Règles : Rubrique « Emploi » de la barre latérale, après « Conformité ». Offres regroupées par statut : en ligne, brouillon, pourvue. Profils disponibles près de vous : anonymisés, triés par distance, seulement les profils visibles ou anonymisés, jamais les profils discrets ni ceux qui ont masqué la structure. Jamais de coordonnées sans accord de la personne. La copie ne promet ni gratuité ni absence de mise en avant payante.
- Données : Lu : offres de la structure, profils candidats (selon leur visibilité et leurs structures masquées).
- Sorties :
  - → **OUV-PL-OFFRE** : publier une offre
  - → **L-CAND** : voir les candidatures
  - → **OUV-PD-ECHANGE** : proposer un échange à un profil
  - → **OUV-PD-POURVUE** : marquer une offre pourvue

### D-CAND

**Candidatures reçues, dentiste** · titre affiché : « Candidatures reçues »

- Route : `/espace-pro/emploi/candidatures`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Proposer un échange »
- Action secondaire : « Ne pas retenir »
- Objectif : Suivre les candidatures reçues sur les offres du cabinet.
- Règles : Statuts : Nouvelle, Vue, Échange proposé, Retenue, Non retenue. Ouvrir une candidature la passe à Vue. Coordonnées masquées tant que la personne n'a pas accepté un échange. Candidatures supprimées 6 mois après la clôture de l'offre (à valider).
- Données : Lu : candidatures. Écrit : statut de la candidature.
- Sorties :
  - → **OUV-PD-ECHANGE** : proposer un échange
  - → **D-EMPLOI** : retour à l'emploi

### L-CAND

**Candidatures reçues, laboratoire** · titre affiché : « Candidatures reçues »

- Route : `/espace-pro/emploi/candidatures (profil laboratoire)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Proposer un échange »
- Action secondaire : « Ne pas retenir »
- Objectif : Suivre les candidatures reçues sur les offres du laboratoire.
- Règles : Statuts : Nouvelle, Vue, Échange proposé, Retenue, Non retenue. Ouvrir une candidature la passe à Vue. Coordonnées masquées tant que la personne n'a pas accepté un échange. Candidatures supprimées 6 mois après la clôture de l'offre (à valider).
- Données : Lu : candidatures. Écrit : statut de la candidature.
- Sorties :
  - → **OUV-PD-ECHANGE** : proposer un échange
  - → **L-EMPLOI** : retour à l'emploi

### OUV-PD-OFFRE

**Publier une offre, dentiste** · titre affiché : « Publier une offre »

- Route : `/espace-pro/emploi (état : publier une offre)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Publier l'offre »
- Action secondaire : « Enregistrer en brouillon »
- Objectif : Créer une offre d'emploi pour le cabinet.
- Règles : Liste des postes à définir. Champs : poste, contrat, temps de travail, date de début, rémunération brute mensuelle en fourchette (minimum et maximum, obligatoire), lieu (parmi les lieux gérés), description, avantages. Publication 30 jours. Enregistrable en brouillon.
- Données : Lu : lieux gérés. Écrit : offres (statut brouillon ou en_ligne, publiee_le, expire_le).
- Sorties :
  - → **OUV-PD-PUBLIEE** : offre publiée
  - → **D-EMPLOI** : brouillon enregistré

### OUV-PL-OFFRE

**Publier une offre, laboratoire** · titre affiché : « Publier une offre »

- Route : `/espace-pro/emploi (profil laboratoire, état : publier une offre)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Publier l'offre »
- Action secondaire : « Enregistrer en brouillon »
- Objectif : Créer une offre d'emploi pour le laboratoire.
- Règles : Liste des postes à définir. Champs : poste, contrat, temps de travail, date de début, rémunération brute mensuelle en fourchette (minimum et maximum, obligatoire), lieu (parmi les lieux gérés), description, avantages. Publication 30 jours. Enregistrable en brouillon.
- Données : Lu : établissement du laboratoire. Écrit : offres (statut brouillon ou en_ligne, publiee_le, expire_le).
- Sorties :
  - → **OUV-PD-PUBLIEE** : offre publiée
  - → **L-EMPLOI** : brouillon enregistré

### OUV-PD-PUBLIEE

**Offre publiée** · titre affiché : « Votre offre est en ligne »

- Route : `/espace-pro/emploi (état : offre publiée)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Voir l'offre »
- Action secondaire : « Retour à l'emploi »
- Objectif : Confirmer la publication et la date de fin.
- Règles : Affiche la date de fin de publication (30 jours). Les candidats dont une alerte correspond sont prévenus selon leurs préférences. Commun au dentiste et au laboratoire.
- Données : Lu : offre.
- Sorties :
  - → **D-EMPLOI ou L-EMPLOI** : retour à l'emploi

### OUV-PD-ECHANGE

**Proposer un échange** · titre affiché : « Proposer un échange »

- Route : `/espace-pro/emploi (état : proposer un échange)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Envoyer la proposition »
- Action secondaire : « Annuler »
- Objectif : Proposer un échange à un candidat ou à un profil disponible.
- Règles : Message court. Les coordonnées ne sont partagées que si la personne accepte ; sans réponse ou en cas de refus, rien n'est transmis. Commun au dentiste et au laboratoire.
- Données : Écrit : proposition d'échange (en attente), candidature au statut Échange proposé.
- Sorties :
  - → **D-CAND ou L-CAND** : proposition envoyée
  - → **D-EMPLOI ou L-EMPLOI** : annuler

### OUV-PD-POURVUE

**Offre pourvue** · titre affiché : « Marquer l'offre comme pourvue »

- Route : `/espace-pro/emploi (état : offre pourvue)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Confirmer »
- Action secondaire : « Annuler »
- Objectif : Clore une offre pourvue.
- Règles : L'offre quitte les résultats et passe au statut pourvue. Le délai de suppression des candidatures (6 mois après la clôture, à valider) démarre. Commun au dentiste et au laboratoire.
- Données : Écrit : offres (statut pourvue, cloturee_le).
- Sorties :
  - → **D-EMPLOI ou L-EMPLOI** : confirmer ou annuler


## Espace emploi, salarié ou étudiant

Espace du salarié (CAND) et de l'étudiant (ETU), ouvert après SE5. Règles communes : offres triées par distance, jamais de coordonnées sans accord, candidatures supprimées 6 mois après la clôture de l'offre (à valider), aucune promesse de gratuité ni d'absence de mise en avant payante. Routes proposées, à confirmer à l'implémentation.

### CAND-VUE

**Vue d'ensemble, salarié** · titre affiché : « Votre espace emploi »

- Route : `/emploi`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Voir les offres »
- Objectif : Point d'arrivée : offres proches, candidatures en cours, alertes.
- Règles : Offres récentes triées par distance. Candidatures avec leur statut. Propositions d'échange en attente mises en évidence.
- Données : Lu : profil candidat, offres, candidatures, alertes.
- Sorties :
  - → **CAND-OFFRES** : voir les offres
  - → **CAND-CANDID** : candidatures
  - → **CAND-PROFIL** : profil
  - → **OUV-C-ECHANGE** : proposition d'échange reçue

### CAND-OFFRES

**Offres, salarié** · titre affiché : « Offres près de chez vous »

- Route : `/emploi/offres`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Voir l'offre »
- Action secondaire : « Créer une alerte »
- Objectif : Parcourir les offres correspondant aux critères.
- Règles : Tri par distance, puis ordre alphabétique à distance égale. Filtres : contrat, temps de travail, rayon (5 à 50 km). La copie ne promet ni gratuité ni absence de mise en avant payante.
- Données : Lu : offres en ligne, critères du profil.
- Sorties :
  - → **CAND-OFFRE** : offre choisie
  - → **OUV-C-ALERTE** : créer une alerte

### CAND-OFFRE

**Détail d'une offre, salarié**

- Route : `/emploi/offres/[offreId]`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Postuler »
- Action secondaire : « Masquer cette structure »
- Objectif : Présenter l'offre complète.
- Règles : Rémunération brute mensuelle toujours affichée en fourchette. Structure vérifiée (fiche revendiquée). Distance depuis la ville du profil.
- Données : Lu : offre, structure.
- Sorties :
  - → **OUV-C-POSTULER** : postuler
  - → **OUV-C-MASQUER** : masquer cette structure
  - → **OUV-C-ALERTE** : créer une alerte similaire

### CAND-CANDID

**Candidatures, salarié** · titre affiché : « Vos candidatures »

- Route : `/emploi/candidatures`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Voir l'offre »
- Objectif : Suivre les candidatures envoyées.
- Règles : Statuts vus par la personne : Envoyée, Vue, Échange proposé, Retenue, Non retenue. Candidatures supprimées 6 mois après la clôture de l'offre (à valider).
- Données : Lu : candidatures.
- Sorties :
  - → **OUV-C-ECHANGE** : répondre à une proposition d'échange
  - → **CAND-OFFRE** : voir l'offre

### CAND-PROFIL

**Profil, salarié** · titre affiché : « Votre profil »

- Route : `/emploi/profil`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Enregistrer »
- Objectif : Tenir à jour le profil vu par les recruteurs.
- Règles : Situation, critères, qualification et badge « Titre vérifié », CV facultatif. Aperçu du profil tel que le voit un recruteur selon la visibilité choisie.
- Données : Lu et écrit : profil candidat, CV facultatif.
- Sorties :
  - → **CAND-VISI** : visibilité
  - → **CAND-ALERTES** : alertes

### CAND-ALERTES

**Alertes** · titre affiché : « Vos alertes »

- Route : `/emploi/alertes`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Créer une alerte »
- Objectif : Gérer les alertes d'offres.
- Règles : Une alerte par jeu de critères (contrat, temps, ville, rayon). Envoi par courriel seulement si la personne l'a accepté. Commun au salarié et à l'étudiant.
- Données : Lu et écrit : alertes.
- Sorties :
  - → **OUV-C-ALERTE** : créer ou modifier une alerte

### CAND-VISI

**Visibilité** · titre affiché : « Qui peut voir votre profil ? »

- Route : `/emploi/visibilite`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Enregistrer »
- Objectif : Modifier la visibilité et les structures masquées.
- Règles : Visible par les recruteurs vérifiés, anonymisé ou discret. Liste des structures masquées, retirables. Commun au salarié et à l'étudiant.
- Données : Écrit : profil candidat (visibilite, structures_masquees).
- Sorties :
  - → **OUV-C-MASQUER** : masquer une structure

### ETU-VUE

**Vue d'ensemble, étudiant** · titre affiché : « Votre espace emploi »

- Route : `/emploi (profil étudiant)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Voir les offres »
- Objectif : Point d'arrivée : offres proches, candidatures en cours, alertes.
- Règles : Offres récentes triées par distance. Candidatures avec leur statut. Propositions d'échange en attente mises en évidence.
- Données : Lu : profil candidat, offres, candidatures, alertes.
- Sorties :
  - → **ETU-OFFRES** : voir les offres
  - → **ETU-CANDID** : candidatures
  - → **ETU-PROFIL** : profil
  - → **OUV-C-ECHANGE** : proposition d'échange reçue

### ETU-OFFRES

**Offres, étudiant** · titre affiché : « Offres près de chez vous »

- Route : `/emploi/offres (profil étudiant)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Voir l'offre »
- Action secondaire : « Créer une alerte »
- Objectif : Parcourir les offres correspondant aux critères.
- Règles : Tri par distance, puis ordre alphabétique à distance égale. Filtres : contrat, temps de travail, rayon (5 à 50 km). Contrats proposés par défaut : alternance, stage, job étudiant. La copie ne promet ni gratuité ni absence de mise en avant payante.
- Données : Lu : offres en ligne, critères du profil.
- Sorties :
  - → **ETU-OFFRE** : offre choisie
  - → **OUV-C-ALERTE** : créer une alerte

### ETU-OFFRE

**Détail d'une offre, étudiant**

- Route : `/emploi/offres/[offreId] (profil étudiant)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Postuler »
- Action secondaire : « Masquer cette structure »
- Objectif : Présenter l'offre complète.
- Règles : Rémunération brute mensuelle toujours affichée en fourchette. Structure vérifiée (fiche revendiquée). Distance depuis la ville du profil.
- Données : Lu : offre, structure.
- Sorties :
  - → **OUV-C-POSTULER** : postuler
  - → **OUV-C-MASQUER** : masquer cette structure
  - → **OUV-C-ALERTE** : créer une alerte similaire

### ETU-CANDID

**Candidatures, étudiant** · titre affiché : « Vos candidatures »

- Route : `/emploi/candidatures (profil étudiant)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Voir l'offre »
- Objectif : Suivre les candidatures envoyées.
- Règles : Statuts vus par la personne : Envoyée, Vue, Échange proposé, Retenue, Non retenue. Candidatures supprimées 6 mois après la clôture de l'offre (à valider).
- Données : Lu : candidatures.
- Sorties :
  - → **OUV-C-ECHANGE** : répondre à une proposition d'échange
  - → **ETU-OFFRE** : voir l'offre

### ETU-PROFIL

**Profil, étudiant** · titre affiché : « Votre profil »

- Route : `/emploi/profil (profil étudiant)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Enregistrer »
- Objectif : Tenir à jour le profil vu par les recruteurs.
- Règles : Situation, critères, formation (voir ETU-FORM), CV facultatif. Aperçu du profil tel que le voit un recruteur selon la visibilité choisie.
- Données : Lu et écrit : profil candidat, CV facultatif.
- Sorties :
  - → **ETU-FORM** : formation
  - → **CAND-VISI** : visibilité
  - → **CAND-ALERTES** : alertes

### ETU-FORM

**Formation** · titre affiché : « Votre formation »

- Route : `/emploi/formation`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Enregistrer »
- Action secondaire : « Ajouter un certificat de scolarité »
- Objectif : Tenir à jour la formation de l'étudiant.
- Règles : École choisie parmi les pages établissement vérifiées, formation, année, recherche (alternance, stage, job étudiant). Certificat de scolarité facultatif, vérifié automatiquement puis supprimé.
- Données : Écrit : profil candidat (école, formation, année, recherche). Aucun document conservé.
- Sorties :
  - → **ETU-PROFIL** : retour au profil

### OUV-C-POSTULER

**Postuler** · titre affiché : « Postuler à cette offre »

- Route : `/emploi/offres/[offreId] (état : postuler)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Envoyer ma candidature »
- Action secondaire : « Annuler »
- Objectif : Envoyer une candidature.
- Règles : Message facultatif, CV facultatif. La structure voit le profil selon la visibilité choisie ; les coordonnées ne sont transmises qu'après accord d'un échange.
- Données : Écrit : candidature (statut Nouvelle).
- Sorties :
  - → **OUV-C-ENVOYEE** : candidature envoyée
  - → **CAND-OFFRE ou ETU-OFFRE** : annuler

### OUV-C-ENVOYEE

**Candidature envoyée** · titre affiché : « Votre candidature est envoyée »

- Route : `/emploi/offres/[offreId] (état : envoyée)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Voir mes candidatures »
- Action secondaire : « Retour aux offres »
- Objectif : Confirmer l'envoi et fixer les attentes.
- Règles : Rappelle que les coordonnées ne sont partagées qu'après accord d'un échange.
- Données : Lu : candidature.
- Sorties :
  - → **CAND-CANDID ou ETU-CANDID** : voir mes candidatures
  - → **CAND-OFFRES ou ETU-OFFRES** : retour aux offres

### OUV-C-ALERTE

**Créer une alerte** · titre affiché : « Créer une alerte »

- Route : `/emploi/alertes (état : créer une alerte)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Créer l'alerte »
- Action secondaire : « Annuler »
- Objectif : Créer ou modifier une alerte d'offres.
- Règles : Critères pré-remplis depuis la recherche ou l'offre. Courriel envoyé seulement si la personne l'a accepté.
- Données : Écrit : alertes.
- Sorties :
  - → **CAND-ALERTES** : alerte créée

### OUV-C-ECHANGE

**Répondre à un échange** · titre affiché : « Une structure vous propose un échange »

- Route : `/emploi/candidatures (état : proposition d'échange)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Accepter et partager mes coordonnées »
- Action secondaire : « Refuser »
- Objectif : Laisser la personne décider du partage de ses coordonnées.
- Règles : Les coordonnées ne sont partagées qu'en cas d'accord, horodaté. Un refus ne transmet rien.
- Données : Écrit : proposition d'échange (acceptée ou refusée, horodatée).
- Sorties :
  - → **CAND-CANDID ou ETU-CANDID** : accepter ou refuser

### OUV-C-MASQUER

**Masquer une structure** · titre affiché : « Masquer une structure »

- Route : `/emploi/visibilite (état : masquer une structure)`
- Figma : node id à reporter (écran ajouté le 11 octobre 2026, absent de la page Figma).
- Action principale : « Masquer »
- Action secondaire : « Annuler »
- Objectif : Empêcher une structure de voir le profil.
- Règles : La structure masquée ne voit plus le profil dans ses profils disponibles et ses offres ne sont plus proposées à la personne. Réversible depuis CAND-VISI.
- Données : Écrit : profil candidat (structures_masquees).
- Sorties :
  - → **CAND-VISI** : masquée ou annulée
