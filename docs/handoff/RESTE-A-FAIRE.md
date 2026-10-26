# Ce qui reste à faire (2026-10-25)

Carte refaite le 2026-10-25 au soir : tout l’espace pro est repassé écran par écran avec Pierre, le site public relu (fiche complète qui remonte, plus de gratuité), les pages légales remplies et validées, les durées de conservation appliquées chaque nuit. Ce qui reste : quelques écrans non construits ou « Bientôt », le back-office, la mise en ligne, des décisions et de la dette.

## 0. Revue écran par écran de l’espace pro

| Parcours | Écrans | État |
|---|---|---|
| Inscription et connexion | CX1, CX2, CX3, T3 (inscription par profil, code, email de bienvenue) | Repassés (2026-10-24) |
| Connexion, cas annexes | CX1-E, CX2-E, CX4 clé d’accès, CX5 code expiré ou annulé, CX6 plus accès à l’email | Repassés (2026-10-25) |
| Patient | P1 Personnaliser, P2 Retour à la fiche | **Non construits** |
| Dentiste, revendication | S0, S1, H1, S1-0 (avec demande d’ajout), S2, S3b, C1, JD1, K, L, REMP, R1, R2 | Repassés (2026-10-25). PSC1, PSC2, PSC-E, PSC-0 et M1 attendent Pro Santé Connect ; S3a (lien sur l’email du registre) non rencontré, aucune fiche de test n’a d’email |
| Dentiste, onboarding | B0, B0S, B1, B2, B3, B7 | Repassés (2026-10-25) : aperçu et taux en direct, domaine libre. B4 à B6 sont devenus des missions |
| Dentiste, tableau de bord | Vue d’ensemble, Ma fiche, Progression, missions (photo, présentation, galerie, marques, liens), Partager, Statistiques, Registre, Mises à jour, Compte | Repassés (2026-10-25), en attente de vérification puis vérifiée (vue d’ensemble, célébration de palier, Progression). Galerie et Marques sont du travail en cours non commité (titres et marques en cartes ajoutés dans ces fichiers) |
| Laboratoire, entrée | L1, L2, L3, KL, LREF, LK1, LE1, MAN, LA1, LINFO, LC1 | Repassés (2026-10-24 et 25). LCODE bloqué (envoi postal) |
| Laboratoire, onboarding | LO0, LO1, LO2, LO4 | Repassés. LO3 est devenue les missions Réalisations et Conformité, repassées avec le tableau de bord |
| Laboratoire, tableau de bord | Vue d’ensemble, Délais, Savoir-faire, Zone, Réalisations, Conformité | Repassés (2026-10-25). Équipe retirée (`EQUIPE_OUVERTE`) |
| École et faculté | O1, O2a, OA1, OAT, O3a, OEND, espace établissement complet, Partage et avis | Repassés |
| Formation continue, partenariat | W1, O2b, O3b | Repassés (2026-10-25) : proposer sa formation avant la liste d’attente, accroche partenaire corrigée, type de partenariat |
| Emploi | SE1 à SE5, offres, candidatures, profil, alertes, profils disponibles | Repassés |

## 1. Espace pro : écrans encore « Bientôt » ou non construits

Vocabulaire (2026-10-25) : l’espace des étudiants et salariés ne dit jamais « candidat » (« Mon profil », la situation dans la carte du menu) ; côté recruteur, le mot reste.


| Profil | Écran | État | Remarque |
|---|---|---|---|
| Tous | Notifications | « Bientôt » dans le menu | Aucune donnée derrière : à définir (quels événements, email ou centre de notifications). |
| Établissement | Statistiques | « Bientôt » | Les dentistes et laboratoires ont la leur (`/espace-pro/statistiques/`) : vues, visites par source. À décliner : vues de la page, clics site et téléphone, avis dans le temps. |
| Établissement | Événements | « Bientôt » | Portes ouvertes, salons, journées d’information ; la page publique lit déjà les événements relevés. |
| École | Admission et calendrier | « Bientôt » | Étapes de candidature, dates clés de la rentrée. |
| Patient | P1 Personnaliser, P2 Retour à la fiche | Non construits | Écrans courts du parcours patient. |
| Laboratoire | LCODE, code au siège | Bloqué | Attend un prestataire d’envoi postal. |
| Dentiste | Distinction « Toujours à jour » | Non calculée | Il manque l’historique des reconfirmations. |
| Laboratoire | Équipe | Retirée le 2026-10-25 | Menu, invitations et arrivée par lien fermés ; code et table gardés pour la rouvrir. |

## 2. Site public

- **Formations privées** : la famille reste « Bientôt » (`aVenir`) tant qu’aucune formation n’est en ligne ; décider si le bandeau d’alerte reste au-dessus de la liste.
- **Pages légales** : remplies (éditeur RINIA, hébergeurs et localisations, durées) et validées par Pierre le 2026-10-25, sans juriste pour l’instant. Plus tard, une relecture : les CGU n’exposent plus les critères de classement, alors que la loi oblige une plateforme à les donner (art. L111-7 C. conso) ; plus pressant depuis que les avis font 80 % du classement des écoles et facultés. Les mentions sur le recueil des avis (art. L111-7-2) sont sur la page publique, avec les points accordés aux auteurs.
- **Boîte `dpo@dentalmap.fr`** : citée dans les pages légales, créée le 2026-10-25.
- **Page établissement** : avertissement React « script tag » dans la console (balisage JSON-LD rendu côté client), sans effet visible, à corriger.

## 3. Back-office (wp-admin, décision du 2026-10-15)

L’administration vit dans WordPress, un plugin par espace, les données Neon passant par l’API Next (`x-dentalmap-admin`).

- **SAV** (plugin `dentalmap-sav` 1.3.5, dépôt `~/Projects/dentalmap-cms`) : repassé avec Pierre le 2026-10-26, écran par écran (boîte de réception, ticket, nouveau ticket, demandes à valider, modèles de réponse, réglages). Formulaire de contact branché ; courriels reçus sur contact@ et dpo@ relevés en IMAP toutes les 5 minutes (ticket, ou réponse ajoutée au fil) ; réponses envoyées par le serveur d’envoi de contact@ (plus d’indésirables) ; échéance RGPD de 30 jours visible ; téléphone et canal pour une saisie à la main ; tickets liés et lien vers la fiche sur une demande à valider. Reste : socle S1, S2, S4 ; recherche d’un professionnel (V7, V8). Le lien « Voir la fiche publique » arrive avec le prochain déploiement du site (commit e458c01).
- **Revendications** : brancher les actions de `lib/tunnel/actions.ts` sur `deciderRevendication`.
- **Modération restée dans Next** : `/espace-pro/moderation/` (revendications, établissements, formations privées et, depuis le 2026-10-22, avis signalés) est à reprendre dans un plugin, avec des routes `/api/admin/` pour les avis (liste des signalements, décision).
- **Messages de contact, 1 an** : appliqué chaque nuit par le plugin SAV (tickets sans activité depuis un an, courriels de plus d’un an de la boîte contact@).
- `dm_api_url` pointe sur la prévisualisation `feat-vitrine` : à remettre sur la production.

## 4. Avant la mise en ligne : configuration et données

- **Bases Neon** (2026-10-26) : deux branches seulement. `main` (`ep-polished-band`) est la production ; `dev-local` (`ep-floral-sea`), copie de `main` faite le 2026-10-26, sert au localhost (`.env.development.local`). L’ancienne préproduction (`ep-lively-feather`) a été supprimée ; `dev-vitrine` et `ci` sont à supprimer, après avoir mis le secret GitHub `DATABASE_URL_CI` sur `dev-local` (la CI le lit pour construire le site).
- **Base principale** (`ep-polished-band`) : migrations 0020 à 0035 appliquées le 2026-10-25, 0032 (marques) comprise, par `pnpm db:migrate` (36 entrées au journal de la base). Le fichier 0032 et son entrée de journal restent à commiter avec le travail sur Galerie et Marques. Attention : `.env.local` vise la base principale, `.env.development.local` la préproduction.
- **Tâches planifiées** : `/api/cron/contestations/` (8 h 30, relance la modération à J+7) et `/api/cron/conservation/` (2 h 30 : offres closes et candidatures après 6 mois, comptes sans connexion après 2 ans et un email d’avertissement). Toutes demandent `CRON_SECRET`. Fonctions Vercel à Francfort (`fra1`).
- **Variables Vercel** : posées le 2026-10-25, actives au prochain déploiement de production. `CRON_SECRET` (secret, production seule, là où tournent les tâches planifiées) ; `DM_API_KEY` (posée le 2026-10-17 sur les trois environnements, à tester avec « Tester la connexion » dans WordPress). Blob : le store privé `dentalmap-justificatifs` est relié par `BLOB_STORE_ID` (authentification OIDC), qui suffit aux dépôts ; ne pas ajouter `BLOB_READ_WRITE_TOKEN`, qui activerait le téléversement direct en accès public, refusé par un store privé.
- **WordPress** : décider de passer `WP_ECRITURE` à `1` après un essai sur un article de test.
- **Synchro du registre** : pas de n8n, l’import tourne en GitHub Actions (`.github/workflows/sync.yml`, chaque dimanche, depuis la branche par défaut). `scripts/sync/sync-ans.ts` respecte `praticiens.retire_le` depuis le 2026-10-25 : une fiche retirée n’est plus remise en ligne. Prend effet quand la correction arrive sur `main`.
- **Identité** : Pro Santé Connect en production ; habilitation FranceConnect+ ; clés d’accès à tester sur dentalmap.fr (liées au domaine).
- **Données de test** : retirées le 2026-10-25 des deux bases. Base principale : les 8 comptes de test (dont `test-psc@example.com`, qui avait revendiqué la fiche réelle de Dr Jade Molis avec une fiche complétée de test) et ce qui en dépendait. Préproduction : les 21 comptes, les 10 fiches factices (RPPS 10999990…, laboratoires SIREN 99999999…), la demande d’ajout du RPPS 10999990053 et les deux fiches établissement de Bordeaux remplies de contenu de démonstration. La préproduction n’a plus aucun compte : les identifiants `ESSAI_*` de `.env.development.local` ne mènent plus nulle part. Photos `public/uploads/etablissements/demo-*` supprimées (elles étaient ignorées par git). Les 7 fichiers de test du stockage Blob `dentalmap-justificatifs` (5 justificatifs des fiches factices, 2 photos) sont supprimés : le stockage est vide.

## 4 bis. Sécurité (audit du 2026-10-26)

- Base : RLS désactivées, sans risque tant que la Data API de Neon reste fermée (seul le serveur s'y connecte, en propriétaire). À activer avec des règles avant toute Data API.
- Corrigé : H1, H2, M1, M2 (en-têtes), M3 (HTML WordPress nettoyé), M5, M6, L2, L4 à L11 ; CMS : XML-RPC fermé, en-têtes. Voir les commits « Sécurité ».
- Reste : M4, limitation de débit (codes de connexion, contact, partenariat, alertes), qui demande un stockage partagé (Upstash Redis) ; L1, numéros de téléphone sans limite par compte ; L3, second facteur pour les modérateurs ; L12, énumération par le parrainage ; L13, requête interne du proxy fondée sur l'en-tête Host (sans effet sur Vercel) ; CSP des scripts avec nonces ; EXIF retirées côté serveur ; identifiant WordPress `pierre` visible (GraphQL, `?author=1`) ; vérifier `pnpm audit`.

## 5. Décisions à prendre

- Barème faculté : les 10 points de l’alternance vont aux centres de soins (à reporter dans `03-gamification.md`).
- Poids de B0S (spécialité et domaines).
- Points d’un avis pour son auteur : 20, deux avis au plus (valeurs par défaut).
- Paliers de l’établissement et ce qu’ils débloquent (formules prudentes, sans mise en avant).
- Vérification DPC, FIF PL, Qualiopi : qui, avec quelle source, sous quel délai.
- Prestataire d’envoi postal (débloque LCODE).

## 6. Figma, documentation, dette

- **Figma** : le code fait foi. Sont codés sans écran Figma à jour : l’espace Emploi (offres, candidatures, profil candidat, alertes, profils disponibles), la gamification et les en-têtes de l’espace établissement, Partage et avis, les visuels d’avis, la coque (carte fixée en bas, barre fixée en haut sur mobile) ; et, depuis le 2026-10-24, la recherche en direct (S1), la demande d’ajout d’un praticien, le recadrage de la photo, l’aperçu en direct de l’onboarding, les choix libres (pièces, techniques, matériaux, domaines, marques), la carte des établissements (LE1) et le plan de la zone desservie. Node ids à reporter dans `parcours.json`.
- **`AVANCEMENT.md`** : les lignes SE, CAND, ETU, OUV, D-EMPLOI et L-EMPLOI sont encore « à faire » alors que les écrans existent.
- **Docs** : `00`, `03`, `04` et `05` mentionnent encore le courrier, le code à 8 chiffres et le justificatif en Blob privé.
- **Tests de bout en bout** : revendication dentiste (justificatif, refus, retrait) et laboratoire (Kbis, refus, contestation) déroulés en préproduction le 2026-10-25 ; reste la proposition de formation privée.
- **Code mort** : `demanderCreationFiche` (`lib/tunnel/actions.ts`) n’a plus de page ; la demande d’ajout d’un praticien passe par `demanderAjoutPraticien` (S1-0).
- **Lint** : erreurs anciennes dans les maquettes, sans effet sur le site.
