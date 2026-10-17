# Ce qui reste à faire (2026-10-13)

État après l’alignement des formations privées sur la maquette. Tableau d’avancement : 63 écrans faits, 38 à faire, 2 bloqués. Sur les 38 à faire, 33 relèvent de l’emploi (SE, CAND, ETU, OUV, D-EMPLOI, L-EMPLOI) : le reste du parcours compte est construit.

## 1. Avant la mise en ligne : configuration (aucun code)

| Sujet | Effet tant que ce n’est pas fait | Action |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` sur Vercel | Justificatifs, Kbis, attestations et photos ne se déposent pas | Poser la variable |
| `CRON_SECRET` sur Vercel | Aucune tâche planifiée ne tourne : ni rappels de fraîcheur, ni test des liens, ni purge des documents, ni filet des alertes | Poser la variable ; les cinq tâches sont déjà déclarées dans `vercel.json` |
| Synchro n8n | Une fiche retirée peut revenir ; l’alerte `fiche_creee` dépend de l’appel à `/api/revalidate` | Respecter `praticiens.retire_le` dans le workflow |
| `WP_ECRITURE` | Aucune écriture dans WordPress : diplômes des établissements et article minimal des formations privées sont à créer à la main | Décider de passer à `1` après un essai sur un article de test |

## 2. Décisions à prendre

- **Ouvrir les formations privées** : retirer `aVenir` de la famille quand la première formation est en ligne. La page bascule seule sur la liste dès qu’une formation existe ; reste à décider si l’on garde le bandeau d’alerte au-dessus de la liste.
- **Vérification DPC, FIF PL, Qualiopi** : qui vérifie, avec quelle source, et sous quel délai. Le bouton existe en modération, pas la procédure.
- **Prestataire d’envoi postal** : sans lui, LCODE (code au siège du laboratoire) reste bloqué ; sa sortie vers CE1, supprimé, est à trancher.
- **Barème faculté** : les 10 points de l’alternance vont aux centres de soins, à confirmer dans `03-gamification.md`.
- **Poids de B0S** (spécialité et domaines) et durée de conservation des candidatures (6 mois proposée).

## 3. Chantiers produit, par ordre conseillé

1. **Preuve d’identité sans document** : fait le 2026-10-13 (voir AVANCEMENT). Reste : obtenir Pro Santé Connect en production (sans lui, l’équipe vérifie chaque dentiste à la main) et demander l’habilitation FranceConnect+ pour la carte d’identité.
2. **B0S, Spécialité et domaines de soins** : fait le 2026-10-15. Reste à arbitrer son poids (aujourd’hui +8 % dès deux domaines, sans gain affiché).
3. **Filtres de recherche laboratoire** : faits le 2026-10-15 (savoir-faire, matériau, usinage, STL, 3D, ramassage). Reste possible : « dessert ma zone » et un filtre par délai.
4. **Tâches planifiées de l’espace pro** : rappels de fraîcheur, test des liens et purge des documents faits le 2026-10-15. Restent « Toujours à jour » (historique des reconfirmations) et la clôture des contestations à J+7.
5. **CX4, clé d’accès** : faite le 2026-10-17. À tester sur dentalmap.fr avec un vrai compte (les clés sont liées au domaine : rien ne marche sur une prévisualisation Vercel).
6. **P1 et P2** (personnaliser, retour à la fiche) : écrans courts, non construits.
7. **Emploi** (SE1 à SE5, espaces candidat et étudiant, offres, candidatures) : le plus gros lot restant, 33 écrans. Seule la partie publique a une maquette de code (`/maquettes/emploi`) ; les écrans de l’espace n’ont pas de node id dans `parcours.json`. À dessiner et figer dans Figma avant de coder.
8. **Statistiques et notifications** du tableau de bord : « Bientôt » dans la navigation, aucune donnée derrière.
9. **Référentiel UAI** : l’UAI n’est connu que lorsque l’adresse académique le porte.

## 4. Vérification et dette

- **Parcours connectés non testés de bout en bout** : la base Neon est partagée et Resend envoie de vrais emails, donc aucun compte de test n’a été créé. Il faut une base de préproduction (branche Neon) et une clé Resend de test pour dérouler revendication, laboratoire, établissement et proposition de formation avec une vraie session.
- **Figma** : deux écrans encore en capture aplatie (liste desktop de LAB-FICHE, bas de P2) ; node ids des nouveaux écrans à reporter dans `parcours.json`.
- **Docs** : `00`, `03`, `04` et `05` mentionnent encore le courrier, le code à 8 chiffres et le justificatif en Blob privé.
- **Lint** : erreurs anciennes dans les maquettes (`_ouverts.tsx`, `emploi/_donnees.ts`), sans effet sur le site.
