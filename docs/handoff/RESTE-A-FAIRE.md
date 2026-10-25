# Ce qui reste à faire (2026-10-25)

Carte refaite le 2026-10-25, une fois tout l’espace pro repassé écran par écran avec Pierre (validation ou retours) : inscription et connexion, dentiste, laboratoire, école et faculté, formation continue et partenariat, Emploi. Ce qui reste : quelques écrans non construits ou « Bientôt », le site public, le back-office, la mise en ligne, des décisions et de la dette.

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
| Candidat | Points gagnés par les avis | **Non affichés** (voir § 1) |

## 1. Espace pro : écrans encore « Bientôt » ou non construits

| Profil | Écran | État | Remarque |
|---|---|---|---|
| Tous | Notifications | « Bientôt » dans le menu | Aucune donnée derrière : à définir (quels événements, email ou centre de notifications). |
| Établissement | Statistiques | « Bientôt » | Les dentistes et laboratoires ont la leur (`/espace-pro/statistiques/`) : vues, visites par source. À décliner : vues de la page, clics site et téléphone, avis dans le temps. |
| Établissement | Événements | « Bientôt » | Portes ouvertes, salons, journées d’information ; la page publique lit déjà les événements relevés. |
| École | Admission et calendrier | « Bientôt » | Étapes de candidature, dates clés de la rentrée. |
| Candidat | Points gagnés par les avis | Non affichés | Les points comptent déjà dans Profils disponibles ; le candidat ne les voit pas, et rien ne l’invite à donner un avis. |
| Patient | P1 Personnaliser, P2 Retour à la fiche | Non construits | Écrans courts du parcours patient. |
| Laboratoire | LCODE, code au siège | Bloqué | Attend un prestataire d’envoi postal. |
| Dentiste | Distinction « Toujours à jour » | Non calculée | Il manque l’historique des reconfirmations. |
| Laboratoire | Équipe | Retirée le 2026-10-25 | Menu, invitations et arrivée par lien fermés ; code et table gardés pour la rouvrir. |

## 2. Site public

- **Formations privées** : la famille reste « Bientôt » (`aVenir`) tant qu’aucune formation n’est en ligne ; décider si le bandeau d’alerte reste au-dessus de la liste.
- **Pages légales** : relecture par un juriste. Les CGU n’exposent plus les critères de classement, alors que la loi oblige une plateforme à les donner (art. L111-7 C. conso) ; plus pressant depuis que les avis font 80 % du classement des écoles et facultés. Les mentions sur le recueil des avis (art. L111-7-2) sont sur la page publique, avec les points accordés aux auteurs.
- **Page établissement** : avertissement React « script tag » dans la console (balisage JSON-LD rendu côté client), sans effet visible, à corriger.

## 3. Back-office (wp-admin, décision du 2026-10-15)

L’administration vit dans WordPress, un plugin par espace, les données Neon passant par l’API Next (`x-dentalmap-admin`).

- **SAV** : écrans V2 à V10 et socle S1, S2, S4 ; brancher le formulaire de contact Next sur les tickets ; poser `DM_API_KEY` ; recherche d’un professionnel (V7, V8).
- **Revendications** : brancher les actions de `lib/tunnel/actions.ts` sur `deciderRevendication`.
- **Modération restée dans Next** : `/espace-pro/moderation/` (revendications, établissements, formations privées et, depuis le 2026-10-22, avis signalés) est à reprendre dans un plugin, avec des routes `/api/admin/` pour les avis (liste des signalements, décision).
- `dm_api_url` pointe sur la prévisualisation `feat-vitrine` : à remettre sur la production.

## 4. Avant la mise en ligne : configuration et données

- **Base principale** (`ep-polished-band`) : appliquer les migrations 0020 à 0034 (0030 avis, 0033 étendue de la zone, 0034 contestations). Elles ne sont appliquées qu’à la préproduction (`ep-lively-feather`). Les entrées 0033 et 0034 du journal `meta/` sont à commiter avec 0031 et 0032.
- **Tâche planifiée** `/api/cron/contestations/` (8 h 30) : relance la modération à J+7, demande `CRON_SECRET`.
- **Variables Vercel** : `BLOB_READ_WRITE_TOKEN` (dépôts de fichiers), `CRON_SECRET` (aucune tâche planifiée ne tourne sans), `DM_API_KEY`.
- **WordPress** : décider de passer `WP_ECRITURE` à `1` après un essai sur un article de test.
- **Synchro n8n** : respecter `praticiens.retire_le`.
- **Identité** : Pro Santé Connect en production ; habilitation FranceConnect+ ; clés d’accès à tester sur dentalmap.fr (liées au domaine).
- **Données de test à retirer** (préproduction) : photos de démonstration des deux établissements (`public/uploads/etablissements/demo-*`, crédit « Photos de démonstration (Pexels) »), six avis et un signalement de test, comptes `test-ecole@example.com` et `test-candidat-*@example.com`, offres et échanges de Dr Test. Laboratoire : comptes `test-labo@example.com` (renommé « Test Dentalmap ») et `test-labo-bis@example.com`, fiches `laboratoire-essai-dentalmap` (SIREN 999999997, revendication acceptée, liée à Dr Test, ANSM factice, photo de démo) et `laboratoire-mandat-dentalmap`, contestation sur `laboratoire-test-dentalmap-2`. Dentiste : compte `test-dentiste@example.com`, fiches factices `dr-essai-revendication-0046` (RPPS 10999990046, retirée par le test de R2) et `dr-essai-verifiee-0061` (RPPS 10999990061, revendication acceptée), demande d’ajout pour le RPPS 10999990053.

## 5. Décisions à prendre

- Barème faculté : les 10 points de l’alternance vont aux centres de soins (à reporter dans `03-gamification.md`).
- Poids de B0S (spécialité et domaines) ; durée de conservation des candidatures (6 mois proposée).
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
