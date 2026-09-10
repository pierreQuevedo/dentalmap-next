# DentalMap v2 : setup du socle de développement

Runbook de la phase 0. À la fin de ce document, vous avez : un repo GitHub avec Next.js 16 configuré (Cache Components, Tailwind, Drizzle, Better Auth, codegen GraphQL, MapLibre), une base Neon avec PostGIS et une première migration, un WordPress 7.1 headless de préproduction qui répond sur `/graphql`, un projet Vercel lié avec Preview Deployments et branches Neon, une CI GitHub Actions, et une page de contrôle qui lit les deux sources de données.

Les commandes sont à exécuter dans l'ordre. Chaque étape se termine par un point de contrôle.

## 0. Prérequis

| Outil / compte | Vérification |
|---|---|
| Node 22 LTS | `node -v` renvoie 22.x (installer via `fnm` ou `nvm` si besoin) |
| pnpm 10 | `pnpm -v` (sinon `corepack enable && corepack prepare pnpm@latest --activate`) |
| Git + GitHub CLI | `gh auth status` connecté sur le compte pierreQuevedo |
| Vercel CLI | `pnpm add -g vercel` puis `vercel login` |
| Compte Neon | Créé via le Marketplace Vercel à l'étape 4, pas besoin de compte séparé |
| Accès SSH OVH mutualisé | `dentalk@ssh.cluster100.hosting.ovh.net`, port 22. Clé SSH installée (`ssh-copy-id`) pour que les commandes de l'étape 7 passent sans mot de passe |
| Compte Resend | Clé API pour les emails transactionnels de Better Auth (peut attendre la phase 4) |

Aucun plugin payant n'est requis : les champs structurés WordPress utilisent ACF en version gratuite (étape 7).

## 1. Repo GitHub et projet Next.js

```bash
cd ~/Projects
pnpm create next-app@latest dentalmap-next --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes
cd dentalmap-next
git init -b main
gh repo create pierreQuevedo/dentalmap-next --private --source=. --remote=origin
git add -A && git commit -m "chore: scaffold Next.js 16"
git push -u origin main
git checkout -b dev && git push -u origin dev
```

Protection de `main` (PR obligatoire, CI verte) :

```bash
gh api -X PUT repos/pierreQuevedo/dentalmap-next/branches/main/protection \
  -f required_status_checks[strict]=true \
  -f required_status_checks[contexts][]=ci \
  -f enforce_admins=false \
  -f required_pull_request_reviews[required_approving_review_count]=0 \
  -f restrictions=null
```

Point de contrôle : `pnpm dev` démarre sur http://localhost:3000 avec Turbopack, le repo est visible sur GitHub avec deux branches.

## 2. Configuration Next.js

`next.config.ts` :

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    editorial: { stale: 3600, revalidate: 3600, expire: 86400 },
    praticien: { stale: 86400, revalidate: 86400, expire: 604800 },
    listing: { stale: 43200, revalidate: 86400, expire: 604800 },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cms.dentalmap.fr' },
      { protocol: 'https', hostname: 'cms.dentalmap.fr' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  typedRoutes: true,
}

export default nextConfig
```

Arborescence à créer (dossiers vides avec un `.gitkeep` pour l'instant) :

```bash
mkdir -p src/app/\(public\) src/app/\(pro\) src/app/api/revalidate src/app/api/auth/\[...all\] \
  src/lib/wp src/lib/annuaire src/lib/seo src/db/migrations src/components/ui src/components/map \
  scripts .github/workflows
```

`.env.example` (commité) :

```
DATABASE_URL=
WP_GRAPHQL_URL=https://cms.dentalmap.fr/graphql
REVALIDATE_SECRET=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=
RESEND_API_KEY=
```

Ajouter `.env*.local` au `.gitignore` (déjà présent avec le scaffold, vérifier).

## 3. Dépendances

```bash
pnpm add drizzle-orm @neondatabase/serverless better-auth zod graphql maplibre-gl html-react-parser @vercel/blob resend
pnpm add -D drizzle-kit @better-auth/cli @graphql-codegen/cli @graphql-codegen/client-preset @types/node tsx dotenv-cli
```

Scripts dans `package.json` :

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "dotenv -e .env.local -- drizzle-kit migrate",
    "db:studio": "dotenv -e .env.local -- drizzle-kit studio",
    "db:push:preview": "drizzle-kit push",
    "auth:generate": "npx @better-auth/cli@latest generate --output src/db/auth-schema.ts -y",
    "codegen": "dotenv -e .env.local -- graphql-codegen --config codegen.ts",
    "check": "pnpm typecheck && pnpm lint && pnpm build"
  }
}
```

## 4. Vercel et Neon

```bash
vercel link          # créer le projet "dentalmap-next", lier au repo GitHub
vercel git connect   # déploiements automatiques : main = production, dev et PR = preview
```

Dans le dashboard Vercel du projet : Storage > Create Database > Neon (Marketplace). Région : Frankfurt (eu-central-1). Cocher "Create a database branch for each Preview Deployment". Laisser l'intégration injecter `DATABASE_URL` (et `DATABASE_URL_UNPOOLED`) dans les environnements Production, Preview et Development.

Récupérer les variables en local :

```bash
vercel env pull .env.local
```

Activer PostGIS sur la branche principale (une seule fois, depuis le SQL Editor Neon ou psql) :

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
SELECT postgis_full_version();
```

Ajouter les autres variables (Production + Preview + Development) :

```bash
openssl rand -base64 32   # à utiliser pour REVALIDATE_SECRET
openssl rand -base64 32   # à utiliser pour BETTER_AUTH_SECRET
vercel env add REVALIDATE_SECRET
vercel env add BETTER_AUTH_SECRET
vercel env add WP_GRAPHQL_URL
vercel env pull .env.local
```

`BETTER_AUTH_URL` : `https://dentalmap.fr` en Production, laisser vide en Preview (Better Auth lit `VERCEL_URL`), `http://localhost:3000` en local.

Point de contrôle : `.env.local` contient `DATABASE_URL` et `SELECT postgis_full_version();` renvoie une version 3.x.

## 5. Drizzle

`drizzle.config.ts` à la racine :

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/db/schema.ts', './src/db/auth-schema.ts'],
  out: './src/db/migrations',
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! },
  extensionsFilters: ['postgis'],
  strict: true,
  verbose: true,
})
```

`src/db/index.ts` :

```ts
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'
import * as authSchema from './auth-schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema: { ...schema, ...authSchema } })
export type Db = typeof db
```

`src/db/schema.ts`, version socle (le schéma complet est dans le document d'architecture, on pose ici le référentiel géographique et les praticiens pour valider la chaîne) :

```ts
import { pgTable, text, boolean, integer, timestamp, geometry, index, uniqueIndex } from 'drizzle-orm/pg-core'

export const regions = pgTable('regions', {
  code: text('code').primaryKey(),
  nom: text('nom').notNull(),
  slug: text('slug').notNull().unique(),
})

export const departements = pgTable('departements', {
  code: text('code').primaryKey(),
  nom: text('nom').notNull(),
  slug: text('slug').notNull().unique(),
  regionCode: text('region_code').notNull().references(() => regions.code),
})

export const communes = pgTable('communes', {
  codeInsee: text('code_insee').primaryKey(),
  nom: text('nom').notNull(),
  slug: text('slug').notNull(),
  departementCode: text('departement_code').notNull().references(() => departements.code),
  codesPostaux: text('codes_postaux').array().notNull().default([]),
  population: integer('population'),
  centre: geometry('centre', { type: 'point', mode: 'xy', srid: 4326 }),
}, (t) => [
  uniqueIndex('communes_dep_slug').on(t.departementCode, t.slug),
  index('communes_nom_trgm').using('gin', t.nom.op('gin_trgm_ops')),
])

export const praticiens = pgTable('praticiens', {
  id: text('id').primaryKey(),
  profession: text('profession', { enum: ['dentiste', 'prothesiste'] }).notNull(),
  slug: text('slug').notNull().unique(),
  nom: text('nom').notNull(),
  prenom: text('prenom'),
  raisonSociale: text('raison_sociale'),
  rpps: text('rpps').unique(),
  adeli: text('adeli'),
  siren: text('siren'),
  siret: text('siret'),
  statutVerification: text('statut_verification', { enum: ['verifie', 'partiel', 'non_verifie'] }).notNull().default('non_verifie'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => [
  index('praticiens_profession').on(t.profession),
])

export const lieuxExercice = pgTable('lieux_exercice', {
  id: text('id').primaryKey(),
  praticienId: text('praticien_id').notNull().references(() => praticiens.id, { onDelete: 'cascade' }),
  adresseLigne: text('adresse_ligne'),
  codePostal: text('code_postal'),
  codeInsee: text('code_insee').references(() => communes.codeInsee),
  position: geometry('position', { type: 'point', mode: 'xy', srid: 4326 }),
  telephoneOfficiel: text('telephone_officiel'),
  principal: boolean('principal').notNull().default(false),
}, (t) => [
  index('lieux_position_gist').using('gist', t.position),
  index('lieux_commune').on(t.codeInsee),
])
```

## 6. Better Auth

`src/lib/auth.ts` :

```ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { magicLink } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/db'
import { sendMagicLink } from '@/lib/email'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true, minPasswordLength: 12 },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => sendMagicLink(email, url),
    }),
    nextCookies(),
  ],
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  advanced: { database: { generateId: 'uuid' } },
})

export type Session = typeof auth.$Infer.Session
```

`src/lib/email.ts` (Resend, stub acceptable tant que la clé n'est pas là) :

```ts
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendMagicLink(to: string, url: string) {
  if (!resend) {
    console.log(`[dev] lien magique pour ${to} : ${url}`)
    return
  }
  await resend.emails.send({
    from: 'DentalMap <connexion@dentalmap.fr>',
    to,
    subject: 'Votre lien de connexion DentalMap',
    text: `Bonjour,\n\nVoici votre lien de connexion, valable 5 minutes : ${url}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\nDentalMap`,
  })
}
```

`src/lib/auth-client.ts` :

```ts
import { createAuthClient } from 'better-auth/react'
import { magicLinkClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({ plugins: [magicLinkClient()] })
export const { signIn, signOut, useSession } = authClient
```

`src/app/api/auth/[...all]/route.ts` :

```ts
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
```

Génération du schéma auth puis migration complète :

```bash
pnpm auth:generate      # produit src/db/auth-schema.ts (tables user, session, account, verification)
pnpm db:generate        # produit src/db/migrations/0000_*.sql
pnpm db:migrate
```

Vérifier que la migration générée contient bien `CREATE EXTENSION` absent (l'extension est déjà activée, Drizzle ne doit pas la recréer) et les index GIST/GIN. Si `drizzle-kit` ne génère pas l'index trigram correctement, l'ajouter dans un fichier `src/db/migrations/0001_indexes.sql` custom via `drizzle-kit generate --custom`.

Point de contrôle : `pnpm db:studio` montre les tables `regions`, `departements`, `communes`, `praticiens`, `lieux_exercice`, `user`, `session`, `account`, `verification`.

## 7. WordPress headless sur OVH

Objectif : l'ancien WordPress de dentalmap.fr est sauvegardé puis supprimé, un WordPress 7.1 propre est installé dans `~/cms` et servi par `cms.dentalmap.fr`, sans Elementor, et expose `/graphql`. La racine `~/www` ne garde qu'une page d'attente jusqu'à la bascule DNS vers Vercel.

Accès : `ssh dentalk@ssh.cluster100.hosting.ovh.net` (port 22). Pour que Claude Code puisse exécuter ces commandes sans saisie de mot de passe, installer une clé SSH une fois : `ssh-copy-id dentalk@ssh.cluster100.hosting.ovh.net`.

Deux particularités OVH mutualisé : WP-CLI n'est pas fourni (on l'installe dans le home), et `mysqldump` doit être lancé avec `--no-tablespaces` (privilège PROCESS absent).

### 7.0 Sauvegarde de l'ancien site puis nettoyage

Actions manuelles dans l'espace client OVH avant les commandes : Hébergement > Multisite > dentalmap.fr > désactiver le déploiement Git (sinon OVH redéploie l'ancien code) ; Hébergement > Bases de données > créer une base neuve pour le CMS (noter hôte, nom, utilisateur, mot de passe). L'ancienne base reste intacte quelques semaines comme filet de sécurité.

```bash
ssh dentalk@ssh.cluster100.hosting.ovh.net

# WP-CLI dans le home
mkdir -p ~/bin && curl -sSLo ~/bin/wp https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && chmod +x ~/bin/wp
grep -q 'HOME/bin' ~/.bashrc || echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
export PATH="$HOME/bin:$PATH"
wp --info

# Sauvegarde complète datée de l'ancien site
cd ~/www
mkdir -p ~/backup-ancien-wp
mysqldump --no-tablespaces -h "$(wp config get DB_HOST)" -u "$(wp config get DB_USER)" -p"$(wp config get DB_PASSWORD)" "$(wp config get DB_NAME)" | gzip > ~/backup-ancien-wp/db-$(date +%F).sql.gz
tar czf ~/backup-ancien-wp/wp-content-$(date +%F).tar.gz -C ~/www wp-content
cp ~/www/wp-config.php ~/backup-ancien-wp/
wp export --dir=$HOME/backup-ancien-wp --filename_format='contenus-{date}.xml'
ls -lh ~/backup-ancien-wp
```

Rapatrier la sauvegarde sur le Mac avant toute suppression :

```bash
scp -r dentalk@ssh.cluster100.hosting.ovh.net:backup-ancien-wp ~/Projects/dentalmap-backup-$(date +%F)
```

Nettoyage (uniquement après vérification de la copie locale) :

```bash
rm -rf ~/www/* ~/www/.htaccess ~/www/.git ~/www/.gitignore
cat > ~/www/index.html <<'EOF'
<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>DentalMap</title><meta name="robots" content="noindex"></head>
<body style="font-family:system-ui;margin:4rem auto;max-width:40rem;color:#2C3E48"><h1>DentalMap</h1><p>Le site est en cours de mise en ligne.</p></body></html>
EOF
ls -la ~/www
```

### 7.1 Sous-domaine et installation

Action manuelle dans l'espace client OVH : Hébergement > Multisite > Ajouter un domaine > `cms.dentalmap.fr`, dossier racine `cms`, SSL Let's Encrypt activé, PHP 8.3 sur la configuration. Attendre la propagation (quelques minutes à une heure).

```bash
mkdir -p ~/cms && cd ~/cms
wp core download --locale=fr_FR --version=7.1
wp config create --dbname=<db> --dbuser=<user> --dbpass='<pass>' --dbhost=<host> --dbprefix=dm_
wp core install --url=https://cms.dentalmap.fr --title="DentalMap CMS" \
  --admin_user=pierre --admin_email=pierre@digitaljouss.com --admin_password='<mot de passe fort>' --skip-email
wp option update blog_public 0
wp option update permalink_structure '/%postname%/'
wp rewrite flush
```

### 7.2 Plugins

Tous gratuits, disponibles sur wordpress.org :

```bash
wp plugin delete akismet hello
wp plugin install wp-graphql --activate
wp plugin install advanced-custom-fields --activate   # ACF version gratuite
wp plugin install wpgraphql-acf --activate            # expose les champs ACF dans le schéma
wp theme install twentytwentyfive --activate          # thème minimal, jamais rendu côté public
```

La version gratuite d'ACF couvre tout ce dont le CMS a besoin (texte, nombre, select, date, URL, email, vrai/faux, image). Les seules fonctions Pro sont les répéteurs, les blocs ACF et les pages d'options ; aucune n'est nécessaire, les données répétitives (horaires, lieux) vivent dans Neon.

Constantes headless dans `wp-config.php` :

```bash
wp config set NEXT_REVALIDATE_URL 'https://<preview>.vercel.app/api/revalidate' --type=constant
wp config set NEXT_REVALIDATE_SECRET '<même valeur que REVALIDATE_SECRET côté Vercel>' --type=constant
wp config set GRAPHQL_DEBUG false --raw --type=constant
wp config set DISALLOW_FILE_EDIT true --raw --type=constant
```

### 7.3 mu-plugin

Créer `wp-content/mu-plugins/dentalmap-headless.php` avec le contenu de la section 7.3 du document d'architecture (CPT `conseil`, `annonce`, `formation`, `faq`, webhook de revalidation, durcissement, redirection de la racine). Tant que dentalmap.fr n'est pas basculé sur Vercel, remplacer la redirection 301 de la racine par `wp_die('DentalMap CMS')` ; la redirection est rétablie à la phase 5.

Introspection GraphQL : le mu-plugin la coupe quand `WP_DEBUG` est false. Pendant la phase 0, laisser `WP_DEBUG` à true (`wp config set WP_DEBUG true --raw`) pour que le codegen fonctionne, puis repasser à false avant la mise en production après avoir exporté `schema.graphql` dans le repo Next.js.

Le mu-plugin est versionné : créer un dépôt `dentalmap-cms` avec la structure suivante, déployé par l'intégration Git native OVH (même mécanique que le site actuel, SSH sur le port 443) :

```
dentalmap-cms/
  wp-content/mu-plugins/dentalmap-headless.php
  wp-content/themes/dentalmap-headless/   (style.css + index.php vide)
  .gitignore                              (tout sauf wp-content/mu-plugins et le thème)
```

### 7.4 Groupes de champs ACF (version gratuite)

Créer via l'interface ACF un groupe par CPT, avec "Show in GraphQL" activé et un nom GraphQL explicite. Activer la synchronisation JSON en créant un dossier `acf-json/` dans le thème `dentalmap-headless` : ACF y écrit chaque groupe en JSON, ce qui les versionne dans le dépôt `dentalmap-cms` et permet de les réimporter en production d'un clic (ACF > Groupes de champs > Sync).

| Groupe | GraphQL field name | Champs | Attaché à |
|---|---|---|---|
| Conseil | `conseilFields` | tempsLecture (number), categorie (select : patients / praticiens / prothesistes) | conseil |
| Annonce | `annonceFields` | typeAnnonce (select), departement (text, code), dateExpiration (date), contactEmail (email) | annonce |
| Formation | `formationFields` | typeFormation (select : ecole_prothese / faculte / privee), ville, departement, siteWeb (url), duree, diplome | formation |
| FAQ | `faqFields` | ordre (number) | faq |
| SEO | `seoFields` | metaTitle, metaDescription, noindex (true/false) | tous les types |

Publier un contenu de test de chaque type.

Point de contrôle :

```bash
curl -s -G 'https://cms.dentalmap.fr/graphql' \
  --data-urlencode 'query={ conseils(first: 1) { nodes { title slug content conseilFields { tempsLecture } } } }' | jq
```

renvoie le conseil de test, et `curl -I https://cms.dentalmap.fr/` renvoie `X-Robots-Tag: noindex, nofollow`.

## 8. Client GraphQL et codegen

`codegen.ts` à la racine :

```ts
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: process.env.WP_GRAPHQL_URL,
  documents: ['src/lib/wp/**/*.ts', '!src/lib/wp/generated/**'],
  generates: {
    'src/lib/wp/generated/': {
      preset: 'client',
      presetConfig: { fragmentMasking: false },
      config: { scalars: { DateTime: 'string' } },
    },
  },
  ignoreNoDocuments: true,
}

export default config
```

Le codegen a besoin de l'introspection, active tant que `WP_DEBUG` est true sur le CMS (voir 7.3). Avant de couper l'introspection, exporter le schéma dans le repo (`pnpm dlx get-graphql-schema $WP_GRAPHQL_URL > schema.graphql`) et faire pointer `schema:` de `codegen.ts` sur `./schema.graphql`.

`src/lib/wp/client.ts` :

```ts
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { print } from 'graphql'

const endpoint = process.env.WP_GRAPHQL_URL!

export async function wp<TResult, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
): Promise<TResult> {
  const url = new URL(endpoint)
  url.searchParams.set('query', print(document))
  if (variables) url.searchParams.set('variables', JSON.stringify(variables))

  const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`WPGraphQL ${res.status} ${res.statusText}`)
  const json = (await res.json()) as { data?: TResult; errors?: { message: string }[] }
  if (json.errors?.length) throw new Error(`WPGraphQL: ${json.errors.map((e) => e.message).join(' | ')}`)
  return json.data as TResult
}
```

`src/lib/wp/queries.ts` (première requête, sert aussi de source au codegen) :

```ts
import { cacheLife, cacheTag } from 'next/cache'
import { graphql } from './generated'
import { wp } from './client'

const ConseilsRecentsDocument = graphql(`
  query ConseilsRecents($first: Int = 5) {
    conseils(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        slug
        title
        excerpt
        date
        conseilFields { tempsLecture }
      }
    }
  }
`)

export async function getConseilsRecents(first = 5) {
  'use cache'
  cacheLife('editorial')
  cacheTag('wp', 'wp:conseil')
  const data = await wp(ConseilsRecentsDocument, { first })
  return data.conseils?.nodes ?? []
}
```

```bash
pnpm codegen
```

Point de contrôle : `src/lib/wp/generated/graphql.ts` existe et `pnpm typecheck` passe.

## 9. Routes techniques

`src/app/api/revalidate/route.ts` :

```ts
import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const Body = z.object({ tags: z.array(z.string().min(1)).min(1).max(100) })

export async function POST(req: NextRequest) {
  if (req.headers.get('x-revalidate-secret') !== process.env.REVALIDATE_SECRET) {
    return Response.json({ ok: false }, { status: 401 })
  }
  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ ok: false, error: 'tags invalides' }, { status: 400 })
  for (const tag of parsed.data.tags) revalidateTag(tag, 'max')
  return Response.json({ ok: true, tags: parsed.data.tags, at: Date.now() })
}
```

`src/app/(public)/layout.tsx` et `src/app/(pro)/espace-pro/layout.tsx` restent minimaux à ce stade (le layout pro appelle `auth.api.getSession({ headers: await headers() })` et redirige vers `/connexion` si absent).

## 10. Page de contrôle du socle

`src/app/setup-check/page.tsx`, à supprimer avant la bascule en production :

```tsx
import { Suspense } from 'react'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { getConseilsRecents } from '@/lib/wp/queries'

async function DbStatus() {
  const [{ postgis }] = await db.execute<{ postgis: string }>(sql`SELECT postgis_version() AS postgis`)
  const [{ n }] = await db.execute<{ n: number }>(sql`SELECT count(*)::int AS n FROM praticiens`)
  return <p>Neon OK, PostGIS {postgis}, {n} praticien(s) en base.</p>
}

async function WpStatus() {
  const conseils = await getConseilsRecents(3)
  return (
    <ul>
      {conseils.map((c) => (
        <li key={c.id}>{c.title} ({c.conseilFields?.tempsLecture ?? '?'} min)</li>
      ))}
    </ul>
  )
}

export default function SetupCheck() {
  return (
    <main className="mx-auto max-w-2xl p-8 space-y-4">
      <h1 className="text-xl font-medium">Contrôle du socle</h1>
      <Suspense fallback={<p>Base…</p>}><DbStatus /></Suspense>
      <Suspense fallback={<p>WordPress…</p>}><WpStatus /></Suspense>
    </main>
  )
}
```

Point de contrôle : http://localhost:3000/setup-check affiche la version PostGIS et le conseil de test WordPress. Puis tester la revalidation :

```bash
curl -s -X POST http://localhost:3000/api/revalidate \
  -H "content-type: application/json" -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -d '{"tags":["wp:conseil"]}'
```

## 11. CI GitHub Actions

`.github/workflows/ci.yml` :

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main, dev]

jobs:
  ci:
    runs-on: ubuntu-latest
    env:
      WP_GRAPHQL_URL: ${{ secrets.WP_GRAPHQL_URL }}
      DATABASE_URL: ${{ secrets.DATABASE_URL_CI }}
      BETTER_AUTH_SECRET: ci-only-secret-not-used
      REVALIDATE_SECRET: ci-only-secret-not-used
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm codegen
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm build
```

Secrets à créer dans le repo : `WP_GRAPHQL_URL` (préprod) et `DATABASE_URL_CI` (une branche Neon dédiée `ci`, créée depuis le dashboard Neon).

```bash
gh secret set WP_GRAPHQL_URL --body 'https://cms.dentalmap.fr/graphql'
gh secret set DATABASE_URL_CI --body '<url de la branche ci>'
```

Le job s'appelle `ci`, ce qui correspond au contexte requis par la protection de `main` posée à l'étape 1.

## 12. Migrations sur les Preview Deployments

Chaque PR a sa branche Neon, il faut y appliquer le schéma. Ajouter dans `package.json` :

```json
"vercel-build": "if [ \"$VERCEL_ENV\" = \"preview\" ]; then pnpm db:push:preview; else pnpm db:migrate; fi && pnpm codegen && next build"
```

et dans les réglages Vercel du projet, Build Command : `pnpm vercel-build`. En production, `drizzle-kit migrate` applique les migrations versionnées ; en preview, `drizzle-kit push` synchronise le schéma sur la branche jetable. `DATABASE_URL_UNPOOLED` doit être présent dans les deux environnements pour que drizzle-kit passe par une connexion directe.

## 13. Fichiers d'aide aux agents

Le scaffold Next.js 16 crée `AGENTS.md` et `CLAUDE.md`. Y ajouter en tête :

```markdown
# DentalMap v2

Annuaire dentaire vérifié par registres officiels. Deux sources de données, jamais mélangées :
- Neon Postgres (Drizzle, PostGIS) : praticiens, lieux, communes, espace pro. Source : registres ANS/INSEE via n8n.
- WordPress headless (WPGraphQL) : conseils, annonces, formation, pages, FAQ.

Règles :
- Tout accès données passe par une fonction `'use cache'` avec `cacheLife` et `cacheTag` (profils : editorial, praticien, listing).
- Aucune colonne ni logique de mise en avant payante. Tri : distance puis alphabétique.
- Copie en français, vouvoiement, pas de tirets cadratins.
- Après modification d'une requête GraphQL : `pnpm codegen`. Après modification du schéma Drizzle : `pnpm db:generate`.
- Référence : document d'architecture v2 dans le projet Dental Map.
```

## 14. Definition of done de la phase 0

| Contrôle | Commande / URL | Attendu |
|---|---|---|
| Repo et branches | `gh repo view pierreQuevedo/dentalmap-next` | main protégée, dev existante |
| Build local | `pnpm check` | typecheck, lint et build verts |
| Base | `pnpm db:studio` | 9 tables, PostGIS 3.x |
| Auth | `curl -s http://localhost:3000/api/auth/ok` | `{"ok":true}` |
| WordPress | `curl -I https://cms.dentalmap.fr/` | 200 + `X-Robots-Tag: noindex` |
| GraphQL | requête `conseils` en curl | contenu de test renvoyé |
| Codegen | `pnpm codegen` | `generated/graphql.ts` à jour, aucun diff inattendu |
| Page de contrôle | `/setup-check` | PostGIS + conseil de test affichés |
| Revalidation | POST `/api/revalidate` | `{"ok":true}` ; 401 sans secret |
| Vercel | ouvrir une PR depuis dev | Preview déployé, branche Neon créée, CI verte |
| Webhook WP | publier un conseil sur la préprod | log Vercel montrant le POST `/api/revalidate` |

Quand cette table est entièrement verte, la phase 1 (jobs n8n et import ANS/INSEE) peut démarrer sur une branche Neon dédiée.
