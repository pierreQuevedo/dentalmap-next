# DentalMap v2 : hiérarchie des liens (navigation et pied de page)

Document de référence pour le header, le méga-menu, le pied de page et la navigation mobile du front Next.js. Rédigé le 13 septembre 2026. Il s'appuie sur l'arborescence des routes du document d'architecture v2 et la complète là où une page d'index manquait.

## 1. Principes

| Principe | Application |
|---|---|
| Navigation principale limitée à 5 entrées plus un accès pro | Annuaire, Conseils, Annonces, Formation, À propos. L'espace pro est un bouton à droite, jamais une entrée de menu |
| Neutralité visible dès le menu | Aucune entrée sponsorisée, aucun "praticien à la une". Le lien "Méthode de vérification et classement" est accessible depuis le méga-menu Annuaire et depuis chaque liste |
| DentalBridge hors de la navigation principale | Lien externe dans le pied de page uniquement, colonne Professionnels, avec l'attribut `rel="noopener"` et une mention "site externe" |
| Chaque entrée de menu pointe vers une page d'index réelle | Pas d'entrée parent non cliquable : Annuaire, Conseils, Annonces, Formation et À propos ont chacun une URL |
| Vouvoiement, libellés courts, pas de jargon | "Trouver un dentiste" plutôt que "Recherche praticien" |

## 2. Inventaire des URL

Les routes marquées "à ajouter" n'existent pas dans l'arborescence v2 d'origine et sont nécessaires pour que chaque lien du menu ait une cible.

| URL | Source | Rôle | Statut |
|---|---|---|---|
| `/` | Next.js | Accueil | existant |
| `/dentistes/` | Neon | Index régions et départements, profession dentiste | existant |
| `/dentistes/{departement}/` | Neon | Liste des communes du département | existant |
| `/dentistes/{departement}/{commune}/` | Neon | Liste des dentistes de la commune | existant |
| `/dentistes/{departement}/{commune}/{slug}/` | Neon | Fiche dentiste | existant |
| `/prothesistes/…` | Neon | Même structure pour les laboratoires | existant |
| `/recherche/` | Neon | Carte et liste, dynamique | existant |
| `/conseils/` | WordPress | Index des conseils, toutes catégories | à ajouter |
| `/conseils/{categorie}/` | WordPress | Index filtré : `patients`, `praticiens`, `prothesistes` | à ajouter |
| `/conseils/{slug}/` | WordPress | Article | existant |
| `/annonces/` | WordPress | Index des annonces actives | existant |
| `/annonces/{type}/` | WordPress | Index filtré : `cession`, `collaboration`, `remplacement`, `emploi` | à ajouter |
| `/annonces/{slug}/` | WordPress | Annonce | existant |
| `/formation/` | WordPress | Index des trois types | existant |
| `/formation/{type}/` | WordPress | `ecoles-de-prothese`, `facultes-odontologie`, `formations-privees` | existant |
| `/formation/{type}/{slug}/` | WordPress | Fiche établissement | existant |
| `/a-propos/` | WordPress (page) | Le projet, l'équipe, la neutralité | existant |
| `/methode-de-verification/` | WordPress (page) | Registres, statuts, règle de classement | existant |
| `/faq/` | WordPress (page + CPT faq) | FAQ patients et praticiens | existant |
| `/partenaires/` | WordPress (page) | "Devenir partenaire", sans logos tant qu'aucun accord n'est signé | à ajouter |
| `/contact/` | Next.js | Formulaire de contact | à ajouter |
| `/mentions-legales/`, `/confidentialite/`, `/cgu/` | WordPress (page) | Pages légales | à ajouter |
| `/plan-du-site/` | Next.js | Plan du site HTML (distinct du sitemap XML) | à ajouter |
| `/connexion/` | Better Auth | Connexion et inscription pro | existant |
| `/espace-pro/` | Better Auth | Tableau de bord pro | existant |
| `/espace-pro/revendiquer/` | Better Auth | Recherche de sa fiche puis revendication | existant |
| `/espace-pro/fiche/` | Better Auth | Édition de la fiche complétée | existant |

Collision de slugs : `/conseils/{categorie}/` et `/annonces/{type}/` partagent le segment avec `/conseils/{slug}/` et `/annonces/{slug}/`. Le route handler `[slug]` teste d'abord la liste des valeurs réservées (3 catégories, 4 types) avant d'interroger WordPress, et ces valeurs sont interdites comme slug de contenu côté CMS (filtre `wp_unique_post_slug` dans le mu-plugin).

## 3. Header

### 3.1 Barre principale (desktop)

| Position | Élément | Cible | Comportement |
|---|---|---|---|
| Gauche | Logo DentalMap | `/` | Lien accueil |
| Centre 1 | Annuaire | `/dentistes/` | Méga-menu au survol et au clic |
| Centre 2 | Conseils | `/conseils/` | Menu déroulant simple |
| Centre 3 | Annonces | `/annonces/` | Menu déroulant simple |
| Centre 4 | Formation | `/formation/` | Menu déroulant simple |
| Centre 5 | À propos | `/a-propos/` | Menu déroulant simple |
| Droite 1 | Rechercher (icône loupe) | `/recherche/` | Ouvre la recherche géolocalisée |
| Droite 2 | Espace pro (bouton contour) | `/espace-pro/` si session, sinon `/connexion/` | Composant dynamique sous `Suspense`, le reste du header est caché |

### 3.2 Méga-menu Annuaire (quatre colonnes)

| Colonne | Titre | Liens |
|---|---|---|
| 1 | Chirurgiens-dentistes | Tous les dentistes `/dentistes/` ; Par département `/dentistes/#departements` ; Trouver un dentiste près de chez vous `/recherche/?profession=dentiste` |
| 2 | Prothésistes dentaires | Tous les laboratoires `/prothesistes/` ; Par département `/prothesistes/#departements` ; Trouver un laboratoire `/recherche/?profession=prothesiste` |
| 3 | Accès rapide | Les 8 communes les plus peuplées ayant des praticiens, calculées depuis la table `communes` et cachées avec le tag `annuaire` : Paris, Marseille, Lyon, Toulouse, Nice, Nantes, Montpellier, Bordeaux, chacune vers `/dentistes/{departement}/{commune}/` |
| 4 | Notre méthode | Méthode de vérification et classement `/methode-de-verification/` ; Vous êtes praticien ? Revendiquez votre fiche `/espace-pro/revendiquer/` |

La colonne 4 est encadrée visuellement (fond acier clair) pour rappeler la promesse de neutralité au moment où l'utilisateur entre dans l'annuaire.

### 3.3 Menus déroulants simples

| Entrée | Liens du déroulant |
|---|---|
| Conseils | Tous les conseils `/conseils/` ; Pour les patients `/conseils/patients/` ; Pour les praticiens `/conseils/praticiens/` ; Pour les prothésistes `/conseils/prothesistes/` |
| Annonces | Toutes les annonces `/annonces/` ; Cessions de cabinet `/annonces/cession/` ; Collaborations `/annonces/collaboration/` ; Remplacements `/annonces/remplacement/` ; Emploi `/annonces/emploi/` ; Publier une annonce `/espace-pro/annonces/nouvelle/` (réservé aux comptes validés, à prévoir en phase 4) |
| Formation | Toutes les formations `/formation/` ; Écoles de prothèse dentaire `/formation/ecoles-de-prothese/` ; Facultés d'odontologie `/formation/facultes-odontologie/` ; Formations privées `/formation/formations-privees/` |
| À propos | Le projet DentalMap `/a-propos/` ; Méthode de vérification `/methode-de-verification/` ; Questions fréquentes `/faq/` ; Devenir partenaire `/partenaires/` ; Contact `/contact/` |

### 3.4 Navigation mobile

Tiroir plein écran ouvert par un bouton "Menu". Ordre : champ de recherche géolocalisée en haut, puis les cinq entrées en accordéon (fermées par défaut, une seule ouverte à la fois), puis le bouton Espace pro en bas, pleine largeur. Le méga-menu Annuaire devient deux accordéons (Dentistes, Prothésistes) suivis de la liste Accès rapide ; la colonne Notre méthode est repliée dans l'accordéon À propos pour ne pas doubler les liens.

## 4. Pied de page (quatre colonnes)

Mise à jour du 13 septembre 2026 : la mise en forme retenue est le modèle Airbnb, décrit dans `header-footer-style-airbnb.md`. Le pied de page y passe à trois colonnes (Assistance, Professionnels, DentalMap) précédées d'un bloc d'exploration à onglets ; les liens ci-dessous restent la référence, seule leur répartition change.

| Colonne | Titre | Liens |
|---|---|---|
| 1 | DentalMap | Le projet `/a-propos/` ; Méthode de vérification et classement `/methode-de-verification/` ; Questions fréquentes `/faq/` ; Devenir partenaire `/partenaires/` ; Contact `/contact/` |
| 2 | Annuaire | Chirurgiens-dentistes `/dentistes/` ; Prothésistes dentaires `/prothesistes/` ; Recherche sur la carte `/recherche/` ; Dentistes à Paris, Lyon, Marseille, Bordeaux (4 liens, même source que l'accès rapide) |
| 3 | Ressources | Conseils `/conseils/` ; Annonces `/annonces/` ; Formation `/formation/` ; Écoles de prothèse `/formation/ecoles-de-prothese/` ; Facultés d'odontologie `/formation/facultes-odontologie/` |
| 4 | Professionnels | Espace pro `/espace-pro/` ; Revendiquer ma fiche `/espace-pro/revendiquer/` ; Créer un compte `/connexion/?mode=inscription` ; DentalBridge, logiciel de gestion de cabinet (site externe) `https://dentalbridge.fr` |

Au-dessus des colonnes : logo, baseline "L'annuaire dentaire vérifié par les registres officiels", et une ligne "Données issues de l'Annuaire Santé (RPPS, ADELI) et du répertoire Sirene (INSEE), mises à jour chaque semaine" avec la date du dernier `sync_runs` terminé, lue en `use cache` avec le tag `annuaire`.

Barre basse :

| Élément | Cible |
|---|---|
| © DentalMap, année courante | texte |
| Mentions légales | `/mentions-legales/` |
| Politique de confidentialité | `/confidentialite/` |
| Conditions d'utilisation | `/cgu/` |
| Plan du site | `/plan-du-site/` |
| Gestion des cookies | ouvre le bandeau de consentement (bouton, pas un lien) |

Aucun lien vers des réseaux sociaux tant que les comptes n'existent pas ; aucun logo institutionnel tant qu'aucun partenariat n'est signé.

## 5. Fil d'Ariane

Présent sur toutes les pages sauf l'accueil, avec le JSON-LD `BreadcrumbList` correspondant.

| Page | Fil d'Ariane |
|---|---|
| Fiche dentiste | Accueil › Dentistes › Gironde › Bordeaux › Dr Martin Dupont |
| Liste commune | Accueil › Dentistes › Gironde › Bordeaux |
| Article conseil | Accueil › Conseils › Patients › Titre de l'article |
| Annonce | Accueil › Annonces › Cessions de cabinet › Titre |
| Fiche formation | Accueil › Formation › Écoles de prothèse dentaire › Nom de l'école |
| Page statique | Accueil › Titre de la page |

## 6. Implémentation : source unique de vérité

Un seul fichier décrit toute la navigation. Header, méga-menu, tiroir mobile, pied de page et plan du site HTML lisent cette structure ; aucun lien n'est écrit en dur dans un composant.

`src/lib/navigation.ts` :

```ts
import type { Route } from 'next'

export type NavLink = {
  label: string
  href: Route | string
  external?: boolean
  description?: string
}

export type NavColumn = {
  title: string
  links: NavLink[]
  highlight?: boolean
  dynamic?: 'acces-rapide'
}

export type NavEntry = {
  label: string
  href: Route
  columns?: NavColumn[]
  links?: NavLink[]
}

export const CONSEIL_CATEGORIES = ['patients', 'praticiens', 'prothesistes'] as const
export const ANNONCE_TYPES = ['cession', 'collaboration', 'remplacement', 'emploi'] as const
export const FORMATION_TYPES = ['ecoles-de-prothese', 'facultes-odontologie', 'formations-privees'] as const

export const mainNav: NavEntry[] = [
  {
    label: 'Annuaire',
    href: '/dentistes',
    columns: [
      {
        title: 'Chirurgiens-dentistes',
        links: [
          { label: 'Tous les dentistes', href: '/dentistes' },
          { label: 'Par département', href: '/dentistes#departements' },
          { label: 'Trouver un dentiste près de chez vous', href: '/recherche?profession=dentiste' },
        ],
      },
      {
        title: 'Prothésistes dentaires',
        links: [
          { label: 'Tous les laboratoires', href: '/prothesistes' },
          { label: 'Par département', href: '/prothesistes#departements' },
          { label: 'Trouver un laboratoire', href: '/recherche?profession=prothesiste' },
        ],
      },
      { title: 'Accès rapide', links: [], dynamic: 'acces-rapide' },
      {
        title: 'Notre méthode',
        highlight: true,
        links: [
          { label: 'Méthode de vérification et classement', href: '/methode-de-verification' },
          { label: 'Vous êtes praticien ? Revendiquez votre fiche', href: '/espace-pro/revendiquer' },
        ],
      },
    ],
  },
  {
    label: 'Conseils',
    href: '/conseils',
    links: [
      { label: 'Tous les conseils', href: '/conseils' },
      { label: 'Pour les patients', href: '/conseils/patients' },
      { label: 'Pour les praticiens', href: '/conseils/praticiens' },
      { label: 'Pour les prothésistes', href: '/conseils/prothesistes' },
    ],
  },
  {
    label: 'Annonces',
    href: '/annonces',
    links: [
      { label: 'Toutes les annonces', href: '/annonces' },
      { label: 'Cessions de cabinet', href: '/annonces/cession' },
      { label: 'Collaborations', href: '/annonces/collaboration' },
      { label: 'Remplacements', href: '/annonces/remplacement' },
      { label: 'Emploi', href: '/annonces/emploi' },
    ],
  },
  {
    label: 'Formation',
    href: '/formation',
    links: [
      { label: 'Toutes les formations', href: '/formation' },
      { label: 'Écoles de prothèse dentaire', href: '/formation/ecoles-de-prothese' },
      { label: "Facultés d'odontologie", href: '/formation/facultes-odontologie' },
      { label: 'Formations privées', href: '/formation/formations-privees' },
    ],
  },
  {
    label: 'À propos',
    href: '/a-propos',
    links: [
      { label: 'Le projet DentalMap', href: '/a-propos' },
      { label: 'Méthode de vérification', href: '/methode-de-verification' },
      { label: 'Questions fréquentes', href: '/faq' },
      { label: 'Devenir partenaire', href: '/partenaires' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

export const footerNav: NavColumn[] = [
  {
    title: 'DentalMap',
    links: [
      { label: 'Le projet', href: '/a-propos' },
      { label: 'Méthode de vérification et classement', href: '/methode-de-verification' },
      { label: 'Questions fréquentes', href: '/faq' },
      { label: 'Devenir partenaire', href: '/partenaires' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Annuaire',
    dynamic: 'acces-rapide',
    links: [
      { label: 'Chirurgiens-dentistes', href: '/dentistes' },
      { label: 'Prothésistes dentaires', href: '/prothesistes' },
      { label: 'Recherche sur la carte', href: '/recherche' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Conseils', href: '/conseils' },
      { label: 'Annonces', href: '/annonces' },
      { label: 'Formation', href: '/formation' },
      { label: 'Écoles de prothèse', href: '/formation/ecoles-de-prothese' },
      { label: "Facultés d'odontologie", href: '/formation/facultes-odontologie' },
    ],
  },
  {
    title: 'Professionnels',
    links: [
      { label: 'Espace pro', href: '/espace-pro' },
      { label: 'Revendiquer ma fiche', href: '/espace-pro/revendiquer' },
      { label: 'Créer un compte', href: '/connexion?mode=inscription' },
      {
        label: 'DentalBridge, logiciel de gestion de cabinet',
        href: 'https://dentalbridge.fr',
        external: true,
        description: 'site externe',
      },
    ],
  },
]

export const legalNav: NavLink[] = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Politique de confidentialité', href: '/confidentialite' },
  { label: "Conditions d'utilisation", href: '/cgu' },
  { label: 'Plan du site', href: '/plan-du-site' },
]
```

Accès rapide, alimenté depuis Neon et caché avec le tag `annuaire` :

```ts
// src/lib/annuaire/acces-rapide.ts
import { cacheLife, cacheTag } from 'next/cache'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import type { NavLink } from '@/lib/navigation'

export async function getAccesRapide(limit = 8): Promise<NavLink[]> {
  'use cache'
  cacheLife('listing')
  cacheTag('annuaire')
  const rows = await db.execute<{ nom: string; slug: string; dep_slug: string }>(sql`
    SELECT c.nom, c.slug, d.slug AS dep_slug
    FROM communes c
    JOIN departements d ON d.code = c.departement_code
    WHERE EXISTS (
      SELECT 1 FROM lieux_exercice l
      JOIN praticiens p ON p.id = l.praticien_id
      WHERE l.code_insee = c.code_insee AND p.profession = 'dentiste' AND p.deleted_at IS NULL
    )
    ORDER BY c.population DESC NULLS LAST
    LIMIT ${limit}
  `)
  return rows.map((r) => ({ label: `Dentistes à ${r.nom}`, href: `/dentistes/${r.dep_slug}/${r.slug}` }))
}
```

Le pied de page prend les 4 premiers résultats, le méga-menu les 8. Paris, Lyon et Marseille sont gérés par leur commune INSEE principale (les arrondissements sont rattachés à la commune dans `sync-cog`).

## 7. Contrôles avant mise en production

| Contrôle | Attendu |
|---|---|
| Script de parcours de `mainNav`, `footerNav`, `legalNav` en `fetch` | Aucune 404, aucune 3xx |
| `typedRoutes: true` | Toute route interne inconnue casse le `pnpm typecheck` |
| Lighthouse accessibilité | Menu navigable au clavier, `aria-expanded` sur les déclencheurs, focus visible, tiroir mobile avec piège de focus |
| Aucun lien vers DentalBridge hors pied de page | `grep -r dentalbridge src/` ne renvoie que `navigation.ts` |
| Plan du site HTML | Généré depuis les mêmes exports, plus la liste des départements |