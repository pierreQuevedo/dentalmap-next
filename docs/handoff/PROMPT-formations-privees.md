# Prompt · Formations privées dans l’espace pro

À coller dans la session qui code l’espace pro et l’onboarding de `dentalmap-next`.

---

Tu codes la partie « Formations privées » de l’espace pro de DentalMap. Lis d’abord `AGENTS.md`, `CLAUDE.md` et `docs/handoff/README.md`, puis la ligne « Formations privées (13 octobre 2026) » de `docs/handoff/00-contexte-et-decisions.md`. Le code existant fait foi. Utilise pnpm uniquement, ne pousse jamais sur `main` et ne committe jamais de secret. Écris en français et vouvoie. N’utilise aucun tiret cadratin ni demi-cadratin, et mets des apostrophes typographiques ’. N’écris jamais que le service est gratuit ni qu’il n’y aura pas de mise en avant payante.

## Décisions du client (13 octobre 2026)
1. **Qui publie :** tout professionnel connecté peut proposer une formation privée. La proposition passe par une demande faite depuis son espace compte, et l’équipe la vérifie avant publication. Rien n’est publié sans vérification.
2. **Thèmes :** une liste unique, déjà en place dans `src/lib/formation/themes.ts` (`THEMES_FORMATION`, 10 thèmes). Elle est partagée avec la liste d’attente W1, où `SPECIALITES` de `src/lib/espace-pro/etablissement.ts` la ré-exporte. « Prothèse » est devenu « Prothèse et CFAO » : si la table `liste_attente_formation` contient encore la valeur « Prothèse », écris une migration qui la renomme.
3. **Prise en charge :** DPC, FIF PL et Qualiopi s’affichent, chacun « déclaré par l’organisme » ou « vérifié » avec sa source. Qualiopi se vérifie sur la liste publique des organismes certifiés, DPC sur la liste des actions de l’ANDPC. Sans vérification, la mention reste « déclarée ».
4. **Alerte des praticiens :** un email quand une formation est publiée sur un thème, dans une région et pour un public choisis. Elle s’inscrit sans compte, avec seulement l’adresse email et une confirmation par lien, sur le modèle des alertes emploi.
5. **Garde-fou, déjà fait :** `aUnType` dans `src/lib/formation/types.ts`. Une formation WordPress sans type ACF connu est exclue de `getFormations`, `getFormationsAccueil` et `getFormation`. N’y touche pas.
6. La rubrique publique `/formation/formations-privees` reste en « Bientôt » (`aVenir: true` dans `FAMILLES`) tant qu’aucune formation n’est publiée. Ne la change pas.

## Ce que tu construis
**A. Demande d’ajout d’une formation**, écran dans la coque de l’espace pro (`src/components/espace/coque.tsx`), accessible depuis « Compte et sécurité » (`src/app/(pro)/espace-pro/compte/page.tsx`). Une entrée « Proposer une formation » s’ajoute à cette page ; la route de l’écran est à ta main, par exemple `/espace-pro/compte/formation`.
- **Champs**, d’après la fiche maquettée `src/app/(public)/maquettes/formations-privees/_fiche.tsx` et ses données `_donnees.ts` :
  - organisme (nom ; SIREN facultatif, contrôlé par Sirene comme pour les laboratoires) ;
  - intitulé et thème (liste unique) ;
  - public : chirurgiens-dentistes, assistant(e)s, prothésistes ;
  - format : présentiel, distanciel ou mixte ;
  - durée et sessions (dates, ville ou « en ligne », places) ;
  - programme en étapes, prérequis, tarif « indiqué par l’organisme » ;
  - prise en charge déclarée : DPC, FIF PL, Qualiopi ;
  - lien d’inscription externe et site de l’organisme.
- **Stockage :** dans Neon, dans une table de demandes (statut `en_attente`, `publiee` ou `refusee`, avec un motif). Mets à jour le schéma Drizzle, puis lance `pnpm db:generate`.
- **Accusé de réception :** à l’écran et par email, sur le modèle de `envoyerAjoutEtablissementRecu` dans `src/lib/email.ts`.

**B. Relecture par l’équipe**, dans la page de modération existante `src/app/(pro)/espace-pro/moderation/page.tsx`. Ajoute une file « Formations proposées » avec trois actions : accepter, refuser avec motif, vérifier une mention de prise en charge.
- **À l’acceptation :** la formation est créée dans WordPress (CPT `formation`, type ACF `privee`) par l’API REST et le mot de passe d’application, sur le modèle de `src/lib/wp/ecriture.ts`. L’écriture reste coupée tant que `WP_ECRITURE` ne vaut pas `1`. Si l’écriture est coupée ou échoue, la demande reste « acceptée, à publier » et l’équipe la crée à la main ; journalise l’échec.
- **Champs WordPress :** le CPT n’a pas encore les champs sessions, programme, public, format, tarif ni prise en charge. Liste-les dans `docs/handoff/` pour qu’ils soient créés dans ACF, ou garde ces détails dans Neon et lis-les sur la page publique. Choisis la voie cohérente avec la fiche établissement, qui lit déjà des données déclarées dans Neon, et explique ton choix.
- **Emails au demandeur :** acceptation ou refus avec motif, sur le modèle de `envoyerAttestationDecidee`.

**C. Alerte des praticiens**
- **Inscription :** adresse email, thèmes, région et public, puis confirmation par lien. Désinscription en un clic depuis chaque email.
- **Envoi :** déclenché à la publication d’une formation, par le webhook de revalidation WordPress ou par un job n8n, à aligner sur `docs/handoff/04-donnees-auth-integrations.md` §6. Ajoute une ligne `alertes-formation` au tableau des jobs.
- **Rythme :** au plus un email par semaine et par adresse, sur le modèle des alertes emploi.

## Références visuelles
- **Figma**, fichier `oxe3W5vGaT9QEYH6ur6Z3p` :
  - page « Site », section « Site · Formations privées » : liste, fiche, attente ;
  - page « Parcours · step by step » : coque et écrans de l’espace pro, états d’ouverture en tiroir ou en modale.
- **Maquettes :** `src/app/(public)/maquettes/formations-privees/`, et les états d’ouverture de `src/app/(maquettes)/maquettes/espace/_ouvert.tsx` (tiroir, champs, boutons).
- **Bouton de la page d’attente :** dans la maquette `_attente.tsx`, « Faire une demande » mène pour l’instant à `/espace-pro/compte/`. Fais-le pointer vers la vraie route de l’écran A.

## Vérification attendue
- `pnpm lint` et `npx tsc --noEmit` passent sans nouvelle erreur.
- Les migrations Drizzle sont générées et appliquées sur une branche Neon de développement.
- Les trois parcours sont testés en local sur https://localhost : proposer une formation, l’accepter ou la refuser en modération, s’inscrire à l’alerte puis la confirmer. Fais des captures à 1440 et à 390 px.
- `docs/handoff/AVANCEMENT.md` est à jour.
- Rends la liste des fichiers modifiés, les routes créées, les migrations et ce qui reste à décider.
