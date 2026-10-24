# Ce qui reste à faire (2026-10-24)

Carte refaite après l’Emploi (offres, candidatures, profil candidat, alertes, profils disponibles), le parcours école et faculté (de l’inscription à Compte et sécurité), la gamification de l’espace établissement et les avis. Remplace l’état du 2026-10-13, où l’Emploi comptait encore 33 écrans à faire : ils sont construits (le tableau d’`AVANCEMENT.md` n’a pas été remis à jour pour ces lignes, voir § 6).

## 1. Espace pro : écrans encore « Bientôt » ou non construits

| Profil | Écran | État | Remarque |
|---|---|---|---|
| Tous | Notifications | « Bientôt » dans le menu | Aucune donnée derrière : à définir (quels événements, email ou centre de notifications). |
| Établissement | Statistiques | « Bientôt » | Les dentistes et laboratoires ont la leur (`/espace-pro/statistiques/`) : vues, visites par source. À décliner : vues de la page, clics site et téléphone, avis dans le temps. |
| Établissement | Événements | « Bientôt » | Portes ouvertes, salons, journées d’information ; la page publique lit déjà les événements relevés. |
| École | Admission et calendrier | « Bientôt » | Étapes de candidature, dates clés de la rentrée. |
| Candidat | Points gagnés par les avis | Non affichés | Les points comptent déjà dans Profils disponibles ; le candidat ne les voit pas, et rien ne l’invite à donner un avis. |
| Dentiste | P1 Personnaliser, P2 Retour à la fiche | Non construits | Écrans courts du parcours de revendication. |
| Laboratoire | LCODE, code au siège | Bloqué | Attend un prestataire d’envoi postal. |
| Dentiste | Distinction « Toujours à jour » | Non calculée | Il manque l’historique des reconfirmations. |
| Tous | Clôture des contestations à J+7 | Non faite | Tâche planifiée à ajouter. |

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

- **Base principale** (`ep-polished-band`) : appliquer les migrations 0020 à 0030 (0030 : avis et signalements). Elles ne sont appliquées qu’à la préproduction (`ep-lively-feather`).
- **Variables Vercel** : `BLOB_READ_WRITE_TOKEN` (dépôts de fichiers), `CRON_SECRET` (aucune tâche planifiée ne tourne sans), `DM_API_KEY`.
- **WordPress** : décider de passer `WP_ECRITURE` à `1` après un essai sur un article de test.
- **Synchro n8n** : respecter `praticiens.retire_le`.
- **Identité** : Pro Santé Connect en production ; habilitation FranceConnect+ ; clés d’accès à tester sur dentalmap.fr (liées au domaine).
- **Données de test à retirer** (préproduction) : photos de démonstration des deux établissements (`public/uploads/etablissements/demo-*`, crédit « Photos de démonstration (Pexels) »), six avis et un signalement de test, comptes `test-ecole@example.com` et `test-candidat-*@example.com`, offres et échanges de Dr Test.

## 5. Décisions à prendre

- Barème faculté : les 10 points de l’alternance vont aux centres de soins (à reporter dans `03-gamification.md`).
- Poids de B0S (spécialité et domaines) ; durée de conservation des candidatures (6 mois proposée).
- Points d’un avis pour son auteur : 20, deux avis au plus (valeurs par défaut).
- Paliers de l’établissement et ce qu’ils débloquent (formules prudentes, sans mise en avant).
- Vérification DPC, FIF PL, Qualiopi : qui, avec quelle source, sous quel délai.
- Prestataire d’envoi postal (débloque LCODE).

## 6. Figma, documentation, dette

- **Figma** : le code fait foi. Sont codés sans écran Figma à jour : l’espace Emploi (offres, candidatures, profil candidat, alertes, profils disponibles), la gamification et les en-têtes de l’espace établissement, Partage et avis, les visuels d’avis, la coque (carte fixée en bas, barre fixée en haut sur mobile). Node ids à reporter dans `parcours.json`.
- **`AVANCEMENT.md`** : les lignes SE, CAND, ETU, OUV, D-EMPLOI et L-EMPLOI sont encore « à faire » alors que les écrans existent.
- **Docs** : `00`, `03`, `04` et `05` mentionnent encore le courrier, le code à 8 chiffres et le justificatif en Blob privé.
- **Tests de bout en bout** : la préproduction et les comptes de test existent désormais ; restent à dérouler avec une vraie session la revendication dentiste et la proposition de formation privée.
- **Lint** : erreurs anciennes dans les maquettes, sans effet sur le site.
