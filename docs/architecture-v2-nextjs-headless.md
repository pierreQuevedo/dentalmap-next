# DentalMap v2 : architecture Next.js + WordPress headless

Document de référence pour la refonte de dentalmap.fr. Rédigé le 10 septembre 2026. Toute session ultérieure qui touche à l'architecture, au modèle de données ou au déploiement doit partir de ce document.

## 1. Décisions figées

| Sujet | Décision | Motif |
|---|---|---|
| Front | Next.js 16.x (App Router, Cache Components) sur Vercel | ISR sur 45 000+ pages, Metadata API, cache edge, zéro ops |
| Données annuaire | Postgres Neon + PostGIS, Drizzle ORM | Données de registres, requêtes géo, branching par PR, coût à l'usage |
| Contenu éditorial | WordPress 7.1 headless sur OVH, exposé via WPGraphQL 2.22+ | WordPress conservé absolument comme CMS ; schéma typé, codegen TS |
| Cache | `use cache` + `cacheLife` + `cacheTag`, invalidation par webhook `revalidateTag` | Stratégie unique pour les deux sources, réglable fonction par fonction |
| Auth espace pro | Better Auth (adaptateur Drizzle) | Tables dans le même schéma, pas de dépendance à un fournisseur d'auth |
| Médias uploadés | Vercel Blob | Photos de cabinet des pros ; les médias éditoriaux restent dans WordPress |
| Synchronisation registres | n8n sur le VPS OVH (existant) | Jobs ANS/INSEE hebdomadaires, appel du webhook de revalidation en fin de run |
| Elementor | Supprimé du WordPress cible | Aucun rôle en headless, le rendu est dans React |
| URL publiques | Hiérarchie actuelle conservée à l'identique | Bascule sans perte SEO |

Ce qui est explicitement hors périmètre : Supabase, Prisma, Faust.js, WPGraphQL Smart Cache, Elementor, JetEngine Map Listing.

## 2. Schéma d'ensemble

```
                    ┌──────────────────────────────┐
  Visiteurs ──────► │  Vercel : Next.js 16          │
  Pros (auth) ────► │  use cache / ISR / Metadata   │
                    │  Better Auth / Server Actions │
                    └───────┬──────────────┬────────┘
                            │              │
              GET /graphql  │              │ Drizzle + @neondatabase/serverless
                            ▼              ▼
             ┌──────────────────┐   ┌──────────────────────┐
             │ cms.dentalmap.fr │   │ Neon Postgres        │
             │ WordPress 7.1    │   │ + PostGIS            │
             │ WPGraphQL        │   │ praticiens, lieux,   │
             │ conseils,        │   │ communes, users...   │
             │ annonces,        │   └──────────┬───────────┘
             │ formation, pages │              ▲
             └────────┬─────────┘              │ upserts
                      │ webhook                │
                      │ save_post     ┌────────┴─────────┐
                      ▼               │ n8n (VPS OVH)    │
             POST /api/revalidate ◄───┤ sync ANS + INSEE │
                                      │ + BAN géocodage  │
                                      └──────────────────┘
```

## 3. Domaines et hébergement

| Hôte | Rôle | Hébergement |
|---|---|---|
| dentalmap.fr | Front public + espace pro | Vercel (projet lié au repo GitHub `dentalmap`) |
| cms.dentalmap.fr | WordPress headless, wp-admin, /graphql | OVH mutualisé Pro (actuel), PHP 8.3 |
| n8n.preproduction-digitaljouss.fr | Jobs de synchronisation | VPS OVH (existant) |
| Neon | Base annuaire, région Francfort | Neon via Vercel Marketplace |

Le WordPress actuel sur dentalmap.fr est déplacé sur cms.dentalmap.fr en phase 3 (voir plan de migration). Tant que le front n'est pas basculé, il continue de servir le site en l'état.

Restrictions à appliquer sur cms.dentalmap.fr : `noindex` global via en-tête `X-Robots-Tag`, thème minimal sans front (une page blanche ou une redirection 301 de la racine vers dentalmap.fr), désactivation de l'endpoint `/wp-json/wp/v2/users`, introspection WPGraphQL coupée en production, limitation de la profondeur de requête, `WPGRAPHQL_DEBUG` à false.

## 4. Versions de référence

| Composant | Version | Note |
|---|---|---|
| Next.js | 16.3.x | LTS, `cacheComponents: true` |
| React | 19.x | livré avec Next.js 16 |
| WordPress | 7.1 "Mary Lou" | WPGraphQL 2.22.3 testé jusqu'à 7.0.4 : valider sur une préprod avant de figer |
| WPGraphQL | 2.22.x | plus WPGraphQL for ACF si ACF est retenu pour les champs |
| Drizzle ORM | dernière stable | avec `drizzle-kit` pour les migrations |
| Better Auth | dernière stable | adaptateur Drizzle |
| PostGIS | 3.x | extension activée sur Neon |
| Node | 22 LTS | runtime Vercel |

## 5. Modèle de données Postgres

Principe : le référentiel est alimenté par les registres, jamais par saisie libre. Tout ce qu'un pro peut modifier est stocké dans des tables séparées, avec horodatage et trace de la source, pour ne jamais mélanger donnée officielle et donnée déclarative.

### 5.1 Référentiel géographique

| Table | Colonnes principales | Source |
|---|---|---|
| `regions` | code, nom, slug | INSEE COG |
| `departements` | code, nom, slug, region_code | INSEE COG |
| `communes` | code_insee (PK), nom, slug, departement_code, code_postal[], population, centre (geometry point 4326) | INSEE COG + BAN |

Le slug de commune est unique à l'intérieur d'un département (Saint-Denis existe dans plusieurs départements). L'URL `/{base}/{departement}/{commune}/` résout donc sur le couple (departement_slug, commune_slug).

### 5.2 Professionnels

| Table | Colonnes principales | Source |
|---|---|---|
| `praticiens` | id (PK, texte = identifiant RPPS ou SIREN), profession (`dentiste` / `prothesiste`), slug (unique), nom, prenom, raison_sociale, rpps, adeli, siren, siret, statut_verification, source_snapshot_id, created_at, updated_at, deleted_at | ANS / INSEE |
| `lieux_exercice` | id, praticien_id (FK), adresse_ligne, code_postal, code_insee (FK communes), position (geometry point 4326, index GIST), telephone_officiel, principal (bool) | ANS + géocodage BAN |
| `verifications` | id, praticien_id, registre (`rpps`, `adeli`, `sirene`), statut (`verifie`, `introuvable`, `radie`, `cesse`), verifie_le, payload_hash | Jobs n8n |
| `sync_runs` | id, registre, demarre_le, termine_le, lignes_lues, inserees, modifiees, supprimees, erreurs (jsonb) | Jobs n8n |

Un praticien radié ou une entreprise cessée n'est pas supprimé : `deleted_at` est renseigné, la page passe en 410 Gone et sort du sitemap. C'est la règle "rien de déclaratif, tout est sourcé" appliquée à la suppression.

### 5.3 Espace professionnel

| Table | Colonnes principales | Note |
|---|---|---|
| `user`, `session`, `account`, `verification` | générées par Better Auth | ne pas modifier à la main, laisser Better Auth les gérer |
| `revendications` | id, user_id (FK user), praticien_id (FK praticiens), methode (`email_pro`, `courrier_code`, `document`), statut (`en_attente`, `validee`, `refusee`), code_hash, expire_le, validee_le | Une fiche ne peut être revendiquée que par un compte validé |
| `fiches_completees` | praticien_id (PK, FK), horaires (jsonb), site_web, email_contact, telephone_affiche, specialites (text[]), langues (text[]), acces_pmr (bool), photo_blob_url, presentation (text, limite 800 caractères), updated_by, updated_at | Données déclaratives, affichées avec la mention "renseigné par le praticien" |

Règle de neutralité : aucune colonne de type `sponsorise`, `premium`, `boost` ou `score` n'existe dans ce schéma, et aucune ne sera ajoutée. Le seul tri disponible est alphabétique ou par distance.

### 5.4 Schéma Drizzle (extrait)

```ts
// db/schema.ts
import { pgTable, text, boolean, integer, timestamp, jsonb, geometry, index, uniqueIndex } from 'drizzle-orm/pg-core'

export const communes = pgTable('communes', {
  codeInsee: text('code_insee').primaryKey(),
  nom: text('nom').notNull(),
  slug: text('slug').notNull(),
  departementCode: text('departement_code').notNull(),
  codesPostaux: text('codes_postaux').array().notNull(),
  population: integer('population'),
  centre: geometry('centre', { type: 'point', mode: 'xy', srid: 4326 }),
}, (t) => [
  uniqueIndex('communes_dep_slug').on(t.departementCode, t.slug),
])

export const praticiens = pgTable('praticiens', {
  id: text('id').primaryKey(),
  profession: text('profession', { enum: ['dentiste', 'prothesiste'] }).notNull(),
  slug: text('slug').notNull().unique(),
  nom: text('nom').notNull(),
  prenom: text('prenom'),
  raisonSociale: text('raison_sociale'),
  rpps: text('rpps'),
  adeli: text('adeli'),
  siren: text('siren'),
  siret: text('siret'),
  statutVerification: text('statut_verification', { enum: ['verifie', 'partiel', 'non_verifie'] }).notNull().default('non_verifie'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

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

export const fichesCompletees = pgTable('fiches_completees', {
  praticienId: text('praticien_id').primaryKey().references(() => praticiens.id, { onDelete: 'cascade' }),
  horaires: jsonb('horaires').$type<Horaires>(),
  siteWeb: text('site_web'),
  emailContact: text('email_contact'),
  telephoneAffiche: text('telephone_affiche'),
  specialites: text('specialites').array(),
  langues: text('langues').array(),
  accesPmr: boolean('acces_pmr'),
  photoBlobUrl: text('photo_blob_url'),
  presentation: text('presentation'),
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
```

Connexion :

```ts
// db/index.ts
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

## 6. Pipeline de synchronisation (n8n)

| Job | Fréquence | Source | Actions |
|---|---|---|---|
| `sync-ans` | hebdomadaire, nuit de dimanche | Extraction open data Annuaire Santé (fichier des professionnels, filtre profession 40 chirurgien-dentiste) | Téléchargement, parsing en flux, upsert `praticiens` + `lieux_exercice`, marquage `deleted_at` des absents, insertion `verifications` |
| `sync-sirene` | hebdomadaire, après `sync-ans` | API Sirene INSEE (NAF 32.50A fabrication de matériel médico-chirurgical et dentaire, filtré sur les laboratoires de prothèse) + contrôle des SIREN des cabinets | Upsert `praticiens` prothésistes, statut `cesse` propagé |
| `geocode-ban` | après chaque sync, sur les lieux sans position | API Adresse (BAN), gratuite, française | Remplissage de `position` et `code_insee`, score minimal 0,6 sinon lieu marqué à vérifier |
| `sync-cog` | annuelle (janvier) | Code officiel géographique INSEE | Mise à jour `regions`, `departements`, `communes` (fusions de communes) |
| `revalidate` | fin de chaque run | webhook Next.js | POST `/api/revalidate` avec les tags `annuaire`, et `commune:{code}` pour chaque commune touchée |

Chaque run écrit une ligne `sync_runs`. Un run avec plus de 5 % de suppressions est bloqué en attente de validation manuelle : c'est la protection contre un fichier source tronqué.

Le géocodage BAN plutôt que Google ou Mapbox : source publique française, cohérente avec le positionnement, pas de clé ni de quota payant.

## 7. WordPress cible (cms.dentalmap.fr)

### 7.1 Plugins

| Plugin | Rôle |
|---|---|
| WPGraphQL | API |
| WPGraphQL for ACF + ACF Pro | Champs structurés exposés dans le schéma. Voie officiellement supportée. JetEngine peut rester pour les CPT s'il expose ses meta fields dans WPGraphQL de façon vérifiée sur la préprod ; sinon les CPT sont déclarés en PHP dans un mu-plugin avec `show_in_graphql` |
| Rank Math ou Yoast | Uniquement pour les champs title / meta description exposés via WPGraphQL (extension SEO). Les sitemaps et le schema.org sont produits par Next.js, ceux du plugin sont désactivés |
| mu-plugin `dentalmap-headless` | Déclaration des CPT, webhook de revalidation, durcissement (noindex, users endpoint, introspection) |

Supprimés : Elementor, JetEngine Map Listing, plugin DentalMap v1.2.0 (le routing est côté Next.js), plugins de cache.

### 7.2 Types de contenu

| CPT | Slug GraphQL | Champs | Usage front |
|---|---|---|---|
| `conseil` | conseils | Gutenberg (contenu), image, catégorie, temps de lecture | Pilier Conseils et ressources |
| `annonce` | annonces | type (cession, collaboration, remplacement, emploi), département, date d'expiration, contact | Section Annonces |
| `formation` | formations | type (école de prothèse, faculté, formation privée), ville, département, site, durée, diplôme | Pilier Formation |
| `page` | pages | Gutenberg | Pages statiques (à propos, méthode de vérification, mentions légales, FAQ) |
| `faq` | faqs | question, réponse, ordre | Blocs FAQ + JSON-LD FAQPage |

Le contenu Gutenberg est récupéré en HTML rendu (`content`) et passé dans un parseur (`html-react-parser`) avec une liste blanche de balises et un remplacement des `<img>` par `next/image`. Pas de WPGraphQL Content Blocks en v1 : le HTML rendu suffit pour des articles, et ça évite de reconstruire chaque bloc en React.

### 7.3 mu-plugin de durcissement et de revalidation

```php
<?php
/**
 * Plugin Name: DentalMap Headless
 * Description: CPT, durcissement et revalidation Next.js pour cms.dentalmap.fr
 */

defined('NEXT_REVALIDATE_URL') || define('NEXT_REVALIDATE_URL', 'https://dentalmap.fr/api/revalidate');
// NEXT_REVALIDATE_SECRET est défini dans wp-config.php

// CPT
add_action('init', function () {
    $types = [
        'conseil'   => ['Conseils', 'Conseil', 'conseils', 'conseil'],
        'annonce'   => ['Annonces', 'Annonce', 'annonces', 'annonce'],
        'formation' => ['Formations', 'Formation', 'formations', 'formation'],
        'faq'       => ['FAQ', 'Question', 'faqs', 'faq'],
    ];
    foreach ($types as $slug => [$plural, $single, $gqlPlural, $gqlSingle]) {
        register_post_type($slug, [
            'label'               => $plural,
            'public'              => false,
            'show_ui'             => true,
            'show_in_rest'        => true,
            'show_in_graphql'     => true,
            'graphql_single_name' => $gqlSingle,
            'graphql_plural_name' => $gqlPlural,
            'supports'            => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
            'has_archive'         => false,
            'rewrite'             => false,
        ]);
    }
});

// Revalidation Next.js
add_action('transition_post_status', function ($new, $old, $post) {
    if ($new !== 'publish' && $old !== 'publish') return;
    if (wp_is_post_revision($post->ID)) return;
    wp_remote_post(NEXT_REVALIDATE_URL, [
        'blocking' => false,
        'headers'  => ['Content-Type' => 'application/json', 'x-revalidate-secret' => NEXT_REVALIDATE_SECRET],
        'body'     => wp_json_encode(['tags' => ["wp:{$post->post_type}", "wp:{$post->post_type}:{$post->post_name}"]]),
    ]);
}, 10, 3);

// Durcissement
add_action('send_headers', fn() => header('X-Robots-Tag: noindex, nofollow', true));
add_filter('rest_endpoints', function ($endpoints) {
    unset($endpoints['/wp/v2/users'], $endpoints['/wp/v2/users/(?P<id>[\d]+)']);
    return $endpoints;
});
add_filter('graphql_introspection_enabled', fn() => defined('WP_DEBUG') && WP_DEBUG);
add_filter('graphql_query_depth_max', fn() => 10);
add_filter('graphql_query_depth_enabled', '__return_true');

// Racine du CMS vers le front
add_action('template_redirect', function () {
    if (is_admin() || wp_doing_ajax() || defined('GRAPHQL_REQUEST')) return;
    wp_redirect('https://dentalmap.fr', 301);
    exit;
});
```

## 8. Application Next.js

### 8.1 Arborescence

```
app/
  (public)/
    page.tsx                                   accueil
    dentistes/
      page.tsx                                 /dentistes/ (index régions)
      [departement]/page.tsx                   /dentistes/gironde/
      [departement]/[commune]/page.tsx         /dentistes/gironde/bordeaux/
      [departement]/[commune]/[slug]/page.tsx  /dentistes/gironde/bordeaux/dr-martin-dupont/
    prothesistes/                              même structure
    conseils/[slug]/page.tsx
    annonces/page.tsx, annonces/[slug]/page.tsx
    formation/page.tsx, formation/[type]/page.tsx, formation/[type]/[slug]/page.tsx
    recherche/page.tsx                         résultats carte + liste (dynamique)
    [slug]/page.tsx                            pages WordPress (a-propos, methode-de-verification...)
  (pro)/
    espace-pro/layout.tsx                      Better Auth requis
    espace-pro/page.tsx
    espace-pro/revendiquer/[praticienId]/page.tsx
    espace-pro/fiche/page.tsx
  api/
    revalidate/route.ts
    auth/[...all]/route.ts                     Better Auth
    geo/autocomplete/route.ts                  autocomplétion communes (BAN + table communes)
    geo/markers/route.ts                       marqueurs dans une bbox (GeoJSON, cache court)
  sitemap.ts + sitemap/[id]/route.ts           sitemaps shardés
  robots.ts
lib/
  wp/  (client GraphQL, requêtes, types générés par graphql-codegen)
  annuaire/ (requêtes Drizzle, géo)
  seo/ (metadata, JSON-LD)
db/ (schema, migrations, index)
```

### 8.2 Résolution des URL

La hiérarchie `/{base}/{departement}/{commune}/{slug}/` est conservée. Le slug praticien est généré une seule fois à l'import (`dr-{prenom}-{nom}-{4 derniers chiffres RPPS}` pour les dentistes, `{raison-sociale}-{4 derniers chiffres SIREN}` pour les laboratoires) et n'est jamais recalculé, même si le nom change. Si un praticien déménage dans une autre commune, l'ancienne URL renvoie une 301 vers la nouvelle (table `redirections` alimentée par le job de sync).

Archives vides : une commune sans praticien de la profession demandée renvoie une page 200 avec `noindex` et un message d'orientation vers les communes voisines (calcul PostGIS des 5 communes les plus proches avec au moins un praticien). C'est le comportement de l'ancien plugin, conservé.

### 8.3 Cache

Profils déclarés dans `next.config.ts` : `editorial` (1 h, expire 1 j), `praticien` (1 j, expire 7 j), `listing` (12 h, expire 7 j). Tags :

| Tag | Posé par | Invalidé par |
|---|---|---|
| `wp` | toute requête WordPress | manuellement, en cas de refonte globale |
| `wp:{type}` | requêtes par type | webhook WordPress |
| `wp:{type}:{slug}` | requête d'un contenu | webhook WordPress |
| `annuaire` | toute requête annuaire | fin de run n8n |
| `commune:{code_insee}` | listes commune | fin de run n8n (communes touchées), Server Action pro |
| `praticien:{slug}` | fiche | Server Action pro (`updateTag`), run n8n |

Les pages de l'espace pro ne sont jamais mises en cache : elles lisent `headers()` via Better Auth, ce qui les rend dynamiques de fait. Sur la fiche publique, le bloc "Vous êtes ce praticien ?" est un composant dynamique isolé sous `Suspense`, le reste de la page est caché.

`generateStaticParams` prégénère : toutes les pages départements, les communes de plus de 20 000 habitants, et rien d'autre. Les 45 000 fiches se remplissent à la demande.

### 8.4 SEO

| Élément | Implémentation |
|---|---|
| Metadata | `generateMetadata` par route, title et description calculés côté Next.js pour l'annuaire, lus depuis WPGraphQL (champs SEO) pour l'éditorial |
| Sitemaps | Index `sitemap.xml` + shards de 10 000 URL : `sitemap/annuaire-dentistes-{n}.xml`, `sitemap/annuaire-prothesistes-{n}.xml`, `sitemap/communes.xml`, `sitemap/editorial.xml`. Générés en `use cache` avec le tag `annuaire` |
| JSON-LD | `Dentist` (schema.org) sur les fiches dentistes avec `address`, `geo`, `telephone` officiel uniquement ; `MedicalBusiness` pour les laboratoires ; `BreadcrumbList` partout ; `FAQPage` sur les pages avec FAQ ; `Organization` sur l'accueil |
| Canonical | Toujours l'URL hiérarchique, jamais l'URL de recherche |
| Redirections | Table `redirections` en base, lue dans `middleware.ts` (proxy) avec cache mémoire, plus les 301 de migration listées en section 10 |

### 8.5 Carte et recherche

MapLibre GL JS avec tuiles vectorielles (OpenFreeMap ou tuiles OSM auto-hébergées sur le VPS si le trafic le justifie), style personnalisé anthracite/acier conforme à la charte. Les marqueurs sont chargés par bbox via `/api/geo/markers` (GeoJSON, `Cache-Control: public, s-maxage=3600`), clusterisés côté client par MapLibre. L'autocomplétion de localisation interroge d'abord la table `communes` (préfixe, index trigram) puis la BAN pour les adresses précises.

Ordre des résultats : distance au point recherché, à égalité ordre alphabétique. Cette règle est écrite sur la page "Méthode de vérification et classement", accessible depuis chaque liste.

## 9. Espace professionnel

Better Auth avec email + mot de passe et lien magique, sans OAuth social en v1 (un dentiste ne se connecte pas avec Google sur un annuaire institutionnel). Parcours de revendication :

1. Le pro recherche sa fiche et clique sur "Revendiquer cette fiche".
2. Trois méthodes, par ordre de préférence : email professionnel connu du registre s'il existe, courrier postal avec code à 8 chiffres envoyé à l'adresse du lieu d'exercice principal (source ANS, donc vérifiable), ou upload d'un justificatif traité manuellement.
3. Une fois validée, la revendication ouvre l'édition de `fiches_completees` uniquement. Les données de registre restent en lecture seule et affichées séparément, avec leur source et leur date de vérification.
4. Toute modification appelle `updateTag('praticien:{slug}')` et `updateTag('commune:{code}')` dans la Server Action.

Aucun paiement, aucune option de mise en avant, dans l'espace pro. Le lien vers DentalBridge y figure comme un lien externe sortant, dans le pied de page, sans traitement particulier.

## 10. Plan de migration

| Phase | Contenu | Critère de sortie |
|---|---|---|
| 0. Préparation | Repo `dentalmap-next`, projet Vercel, Neon lié, schéma Drizzle et première migration, préprod WordPress 7.1 + WPGraphQL sur cms-preprod pour valider la compatibilité 7.1 | `drizzle-kit migrate` passe, `/graphql` répond |
| 1. Données | Jobs n8n `sync-cog`, `sync-ans`, `sync-sirene`, `geocode-ban` ; import complet sur une branche Neon ; contrôle qualité (taux de géocodage > 97 %, aucun doublon RPPS) | 45 000 fiches en base avec position |
| 2. Front annuaire | Routes dentistes/prothésistes, fiches, listes, carte, recherche, sitemaps, JSON-LD, sur un domaine Vercel de préprod | Lighthouse > 95 mobile sur fiche et liste, parité des URL avec le site actuel vérifiée par script |
| 3. Éditorial | Migration du WordPress actuel vers cms.dentalmap.fr (copie, Better Search Replace pour les URL, suppression Elementor, conversion des pages Elementor en Gutenberg), CPT et mu-plugin, routes Next.js éditoriales, codegen | Tout le contenu existant rendu dans Next.js |
| 4. Espace pro | Better Auth, revendication, édition de fiche, Vercel Blob | Un parcours complet testé avec un vrai RPPS |
| 5. Bascule | DNS dentalmap.fr vers Vercel, 301 depuis les anciennes URL WordPress non conservées (`/?p=`, `/category/`, `/wp-content/uploads/` vers le CMS), soumission des sitemaps dans Search Console, surveillance des 404 pendant 30 jours | Aucune perte de position sur les requêtes suivies |

L'ancien WordPress reste accessible en lecture sur cms.dentalmap.fr pendant toute la transition, ce qui rend chaque phase réversible jusqu'à la bascule DNS.

## 11. Risques identifiés

| Risque | Parade |
|---|---|
| WPGraphQL 2.22 non validé sur WordPress 7.1 | Préprod en phase 0 ; rester sur 7.0.x le temps de la validation si nécessaire |
| Fichier ANS tronqué ou format modifié | Seuil de 5 % de suppressions bloquant, `sync_runs` avec compteurs, alerte n8n |
| Cold start Neon sur la première requête d'une fiche non cachée | Servi en arrière-plan par la régénération ; désactiver le scale-to-zero si les temps de régénération dépassent 2 s |
| Homonymes de communes | Résolution sur le couple département + commune, jamais sur le slug seul |
| Contenu Elementor à convertir | Inventaire des pages en phase 3, conversion manuelle en Gutenberg, le volume est faible (pages institutionnelles) |
| Doublons RPPS / SIREN entre cabinets et laboratoires | Clé primaire = identifiant de registre, profession comme discriminant, contrainte unique sur (rpps) et (siren) |
| Perte SEO à la bascule | Parité des URL vérifiée par script avant bascule, 301 exhaustives, sitemaps soumis le jour J |

## 12. Variables d'environnement

```
DATABASE_URL=                  # Neon, injectée par l'intégration Vercel
WP_GRAPHQL_URL=https://cms.dentalmap.fr/graphql
REVALIDATE_SECRET=             # partagé avec le mu-plugin WordPress et n8n
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=https://dentalmap.fr
BLOB_READ_WRITE_TOKEN=         # Vercel Blob
RESEND_API_KEY=                # emails transactionnels (liens magiques, codes)
```
