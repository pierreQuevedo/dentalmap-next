# DentalMap v2

Annuaire dentaire vérifié par registres officiels. Deux sources de données, jamais mélangées :
- Neon Postgres (Drizzle, PostGIS) : praticiens, lieux, communes, espace pro. Source : registres ANS/INSEE via n8n.
- WordPress headless (WPGraphQL) : conseils, annonces, formation, pages, FAQ.

Règles :
- Tout accès données passe par une fonction `'use cache'` avec `cacheLife` et `cacheTag` (profils : editorial, praticien, listing).
- Aucune colonne ni logique de mise en avant payante. Tri : distance puis alphabétique.
- Copie en français, vouvoiement, pas de tirets cadratins.
- Après modification d'une requête GraphQL : `pnpm codegen`. Après modification du schéma Drizzle : `pnpm db:generate`.
- Node 22 (voir `.nvmrc`), pnpm 10. Les positions PostGIS utilisent `point4326` de `src/db/columns.ts`, jamais `geometry()` de drizzle-orm (qui perd le SRID).
- Référence : `docs/architecture-v2-nextjs-headless.md` et `docs/setup-socle-phase-0.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
