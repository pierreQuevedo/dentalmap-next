# DentalMap v2

Annuaire dentaire vérifié par registres officiels. Deux sources de données, jamais mélangées :
- Neon Postgres (Drizzle, PostGIS) : praticiens, lieux, communes, espace pro. Source : registres ANS/INSEE, importés par les scripts de `scripts/sync/` (GitHub Actions, `.github/workflows/sync.yml`).
- WordPress headless (WPGraphQL) : conseils, annonces, formation, pages, FAQ.

Règles :
- Tout accès données passe par une fonction `'use cache'` avec `cacheLife` et `cacheTag` (profils : editorial, praticien, listing). Les lectures Neon utilisent `'use cache: remote'` : le cache est partagé entre les instances de Vercel, alors que `'use cache'` reste en mémoire, par instance, et relit la base à chaque démarrage. Le forfait gratuit de Neon a été bloqué le 2026-10-28 par le transfert de données (5 Go par mois).
- Tri des listes de résultats : points de progression des fiches (force de fiche, un point par pour cent, plus lien Google, badge, partages, parrainages, fraîcheur ; bonus des paliers 4 et 5 et des parrainages, `src/lib/annuaire/remplissage.ts`), puis distance au centre de la recherche, puis alphabétique. Le site le dit aux pros, de façon directe : plus une fiche est complète, plus elle remonte dans les recherches ; sans détailler le barème ni les bonus. La copie ne promet ni gratuité ni absence de mise en avant payante : une rémunération des professionnels est prévue, ne pas écrire le contraire.
- Copie en français, vouvoiement, pas de tirets cadratins.
- Après modification d'une requête GraphQL : `pnpm codegen`. Après modification du schéma Drizzle : `pnpm db:generate`.
- Node 22 (voir `.nvmrc`), pnpm 10. Les positions PostGIS utilisent `point4326` de `src/db/columns.ts`, jamais `geometry()` de drizzle-orm (qui perd le SRID).
- Référence : `docs/architecture-v2-nextjs-headless.md` et `docs/setup-socle-phase-0.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
