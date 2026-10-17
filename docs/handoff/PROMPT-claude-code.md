# Prompt Claude Code : espace pro DentalMap v2

À coller dans Claude Code, à la racine du repo `dentalmap-next`, après avoir copié le dossier `docs/` de cette transmission.

---

## Contexte

Tu reprends le chantier « Espace pro » de DentalMap v2, conçu en dehors de ce repo. Tout ce qui a été décidé est dans `docs/handoff/`. Le socle (phase 0), le header, le footer et l'accueil sont décrits dans `docs/reference/`. Tu réponds en français, sans tirets cadratins. Toute copie d'interface est en français, au vouvoiement, sans tirets cadratins ni demi-cadratins.

## Avant d'écrire du code

1. Lis dans cet ordre : `docs/handoff/README.md`, `00-contexte-et-decisions.md`, `01-design-system.md`, `03-gamification.md`, `04-donnees-auth-integrations.md`, `05-plan-de-mise-en-oeuvre.md`. Parcours ensuite l'index de `02-parcours-espace-pro.md` ; tu liras le détail des écrans phase par phase. `parcours.json` contient les mêmes données en version machine.
2. Inspecte le repo : `src/db/schema.ts`, `src/lib/auth.ts`, `src/app/globals.css`, `components.json`, les composants déjà présents. Note ce qui existe déjà et diffère des documents.
3. Rends-moi un résumé de 15 lignes maximum : ce que tu as compris, les écarts entre le repo et les documents, et le plan de la phase A. Attends ma validation.

## Maquettes

Fichier Figma `oxe3W5vGaT9QEYH6ur6Z3p`, page « Parcours · step by step ». Chaque étape a un frame desktop et un frame mobile ; leurs node IDs sont dans `parcours.json` (`figma.desktop_node`, `figma.mobile_node`). Si le serveur MCP Figma est disponible, utilise `get_design_context` sur ces nodes avant d'implémenter un écran, et `get_screenshot` pour comparer ton rendu. Sinon, travaille depuis les liens et la spec écrite.

Ignore les bandeaux jaunes « SIMULER » : ce sont des outils du prototype Figma.

## Règles

- Réutilise les tokens et utilitaires CSS existants du projet (voir `01-design-system.md`). N'ajoute que `success`, `warning`, `recompense` s'ils n'existent pas.
- Aucune colonne ni logique de score triable. `calculerForce()` est une fonction pure.
- Vérifie chaque API de bibliothèque (Better Auth, Drizzle, Vercel Blob, Next.js 16) avec la documentation à jour (Context7 si disponible) avant de l'utiliser. Les extraits de code des documents sont des intentions, pas des signatures garanties.
- pnpm uniquement, jamais npx ni npm.
- Après modification du schéma : `pnpm db:generate`. Migrations testées sur une branche Neon, jamais sur la branche principale en dehors de `db:migrate`.
- Secrets jamais commités.
- Une branche par phase (`feat/espace-pro-a-fondations`, etc.), commits `feat(espace-pro): <écran ou sujet>`, pas de push sur `main`.

## Déroulé

Suis les phases de `05-plan-de-mise-en-oeuvre.md` dans l'ordre A, B, C, puis demande-moi avant D (back-office non maquetté) et avant E (Pro Santé Connect nécessite des identifiants ANS que je te fournirai).

Pour chaque écran : lis sa fiche dans `02-parcours-espace-pro.md` (objectif, règles, données, sorties), implémente desktop et mobile, branche **toutes** les sorties listées, puis coche-le dans un fichier `docs/handoff/AVANCEMENT.md` que tu tiens à jour (ID, statut, écarts).

À la fin de chaque phase : `pnpm check` vert, captures Playwright desktop 1440 et mobile 390 des écrans de la phase comparées aux frames Figma, et un récapitulatif (fichiers créés, migrations, écarts avec justification, questions ouvertes).

## Quand tu dois t'arrêter et demander

- Une décision de `00-contexte-et-decisions.md` semble impossible ou contredite par le code existant.
- Une API de bibliothèque ne permet pas le comportement décrit (par exemple un seul email pour lien et code).
- Un écran nécessite une donnée absente du schéma et des documents.
