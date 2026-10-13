# Prompt Claude Code : header, méga-menu, footer et theme switcher

À coller tel quel dans Claude Code, à la racine du repo `dentalmap-next`, une fois la phase 0 terminée (`pnpm check` vert). Les trois documents de référence doivent être présents dans le repo ou dans le contexte : `architecture-v2-nextjs-headless.md`, `navigation-hierarchie.md`, `header-footer-style-airbnb.md`.

---

## Contexte

Tu travailles sur `dentalmap-next` (Next.js 16, App Router, Cache Components, Tailwind 4, pnpm, TypeScript strict, `typedRoutes: true`). Le projet est un annuaire dentaire vérifié par registres officiels. Deux règles non négociables : aucune logique de mise en avant payante nulle part, et copie en français avec vouvoiement, sans tirets cadratins.

Objectif de cette session : implémenter le header (onglets, méga-menu, pill de recherche, mode compact au scroll, menu utilisateur), le pied de page (bloc d'exploration à onglets, trois colonnes, barre basse) et un theme switcher clair / sombre / système, dans le style Airbnb décrit dans `header-footer-style-airbnb.md`. La source unique des liens est `src/lib/navigation.ts` décrit dans `navigation-hierarchie.md` §6 et complété dans `header-footer-style-airbnb.md` §5. Aucun lien n'est écrit en dur dans un composant.

Lis ces trois documents en entier avant d'écrire une ligne de code. En cas de contradiction entre eux, `header-footer-style-airbnb.md` prime pour la mise en forme et `navigation-hierarchie.md` pour les URL.

## Étape 1 : socle UI

1. Vérifie si shadcn est initialisé (`components.json` à la racine). Sinon : `pnpm dlx shadcn@latest init` avec les choix New York, base color Neutral, CSS variables oui, alias `@/components`. Ne change pas l'arborescence existante.
2. Installe `next-themes` : `pnpm add next-themes`.
3. Crée `src/components/theme-provider.tsx` :

```tsx
'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'

export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props} />
}
```

4. Dans `src/app/layout.tsx`, ajoute `suppressHydrationWarning` sur `<html lang="fr">` et enveloppe `{children}` dans `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>`.
5. Charge la police avec `next/font/google` : `Figtree({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })`, classe sur `<html>`.
6. Réécris `src/app/globals.css` avec les tokens de `header-footer-style-airbnb.md` §2, en adaptant le mode sombre au fonctionnement de `next-themes` (classe `.dark` sur `<html>`, pas de media query) et en les reliant aux variables shadcn pour que les composants installés héritent de la charte :

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --bg: #ffffff; --bg-soft: #f4f6f7; --fg: #222629; --fg-2: #6b7378;
  --line: #dfe3e6; --line-strong: #c9cfd3; --brand: #2c3e48; --brand-hover: #1f2d35;
  --shadow-pill: 0 3px 12px rgba(20,30,36,.10), 0 1px 2px rgba(20,30,36,.06);
  --shadow-pop: 0 8px 28px rgba(20,30,36,.16);

  /* pont vers shadcn */
  --background: var(--bg); --foreground: var(--fg);
  --card: var(--bg); --card-foreground: var(--fg);
  --popover: var(--bg); --popover-foreground: var(--fg);
  --primary: var(--brand); --primary-foreground: #ffffff;
  --secondary: var(--bg-soft); --secondary-foreground: var(--fg);
  --muted: var(--bg-soft); --muted-foreground: var(--fg-2);
  --accent: var(--bg-soft); --accent-foreground: var(--fg);
  --border: var(--line); --input: var(--line); --ring: var(--brand);
  --radius: 0.75rem;
}
.dark {
  --bg: #15191c; --bg-soft: #1d2226; --fg: #eceff1; --fg-2: #9aa5ac;
  --line: #2c3338; --line-strong: #3a434a; --brand: #d5dde2; --brand-hover: #ffffff;
  --shadow-pill: 0 3px 12px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.4);
  --shadow-pop: 0 8px 28px rgba(0,0,0,.55);
  --primary-foreground: #15191c;
}

@theme inline {
  --color-bg: var(--bg); --color-bg-soft: var(--bg-soft); --color-fg: var(--fg); --color-fg-2: var(--fg-2);
  --color-line: var(--line); --color-line-strong: var(--line-strong);
  --color-brand: var(--brand); --color-brand-hover: var(--brand-hover);
  --color-background: var(--background); --color-foreground: var(--foreground);
  --color-popover: var(--popover); --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary); --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary); --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted); --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent); --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border); --color-input: var(--input); --color-ring: var(--ring);
  --font-sans: var(--font-sans), "Helvetica Neue", Arial, sans-serif;
  --shadow-pill: var(--shadow-pill); --shadow-pop: var(--shadow-pop);
  --radius-pop: 20px;
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-bg text-fg font-sans antialiased; }
}
```

Point de contrôle : `pnpm dev`, la page `/setup-check` s'affiche en Figtree, et basculer `<html class="dark">` dans les devtools inverse bien les couleurs.

## Étape 2 : theme switcher (matos-ui)

1. Installe le composant : `pnpm dlx shadcn@latest add https://matos-ui.com/r/theme-toggler-button.json`. Il arrive dans `src/components/matos-ui/theme-toggler-button.tsx` (vérifie le chemin réel après installation et adapte les imports). Il dépend du `ThemeProvider` de `next-themes` posé à l'étape 1 et utilise l'API View Transitions avec repli en fondu.
2. Lis le fichier installé. Ne le modifie pas, sauf pour remplacer d'éventuelles couleurs codées en dur par les tokens (`bg-bg-soft`, `text-fg`, `border-line`).
3. Utilisation dans le header : `<ThemeTogglerButton variant="circle-blur" size="icon" modes={['light', 'dark', 'system']} />`, placé dans le groupe d'actions à droite, entre le lien "Vous êtes praticien ?" et le menu utilisateur, avec `aria-label="Changer de thème"`. Le bouton doit ressembler aux autres boutons ronds du header (42 px, fond `bg-bg-soft` au survol) : passe la classe nécessaire via `className`.
4. Ajoute le même bouton, en `size="sm"` et `variant="fade"`, dans la barre basse du footer à gauche de "Français (FR)".

Point de contrôle : le clic bascule le thème avec l'animation, le choix persiste après rechargement (localStorage `theme`), le mode système suit les préférences de l'OS, `prefers-reduced-motion` désactive l'animation.

## Étape 3 : méga-menu (21st.dev)

1. Installe le composant : `pnpm dlx shadcn@latest add "https://21st.dev/r/ln-dev7/mega-menu"`. Accepte l'installation de ses `registryDependencies` (probablement `navigation-menu`, `button`) et de ses `dependencies` (`lucide-react`, éventuellement `motion`). Note dans ta réponse finale le chemin exact des fichiers installés et leurs dépendances.
2. Lis intégralement le composant installé et son fichier de démo. Identifie : la structure de données qu'il attend (items de premier niveau, sections, liens, icônes, éventuel bloc "featured"), le composant exporté, la façon dont il gère l'ouverture (survol, clic, `NavigationMenu` Radix) et le style par défaut.
3. Écris un adaptateur `src/lib/navigation-to-mega-menu.ts` qui transforme `mainNav` (et `accesRapide` fourni en argument) vers la structure attendue par le composant. Ne duplique pas les liens : `navigation.ts` reste la seule source. Si le composant attend un champ que `navigation.ts` n'a pas (description, icône), ajoute-le proprement dans les types de `navigation.ts` plutôt que d'inventer un mapping fragile.
4. Restyle le composant installé pour coller à `header-footer-style-airbnb.md` §2 et §3 :
   - déclencheurs : pill `rounded-full px-3.5 py-2.5 text-[15px] font-medium text-fg-2`, `text-fg` et `bg-bg-soft` au survol et à l'ouverture, trait de 2 px sous l'onglet actif (déduit de `usePathname` selon les préfixes indiqués dans le doc) ;
   - panneau : `rounded-[20px] border border-line bg-bg shadow-pop p-6`, ouverture 12 px sous la barre ;
   - l'onglet Annuaire ouvre un panneau de 920 px sur quatre colonnes (Chirurgiens-dentistes, Prothésistes dentaires, Accès rapide, Notre méthode) avec la quatrième colonne sur fond `bg-bg-soft rounded-2xl` et son texte d'explication ; les quatre autres onglets ouvrent un popover simple d'une colonne avec le premier lien en gras et un séparateur ;
   - le panneau Annuaire est centré sous la barre d'onglets, jamais sous son déclencheur, et ne déborde jamais horizontalement ;
   - supprime toute icône, badge "New", image ou dégradé décoratif livré avec la démo qui ne correspond pas à un contenu réel de DentalMap ;
   - icônes des onglets : cinq icônes `lucide-react` en trait 1.8 (`MapPin`, `FileText`, `Mail`, `GraduationCap`, `Info`), 20 px.
5. Si le composant ne permet pas l'ouverture au survol avec délai de fermeture (180 ms) et la fermeture à Échap, au clic extérieur et au changement de route, ajoute ces comportements sans casser l'accessibilité Radix (`aria-expanded`, navigation clavier).
6. Si, après lecture, le composant s'avère trop éloigné de ce cahier des charges (par exemple un panneau pleine largeur impossible à contraindre, ou une structure à un seul niveau), dis-le explicitement, garde ses primitives (`NavigationMenu` de shadcn) et implémente `MainNav.tsx` tel que fourni dans `header-footer-style-airbnb.md` §6.2 par-dessus. Ne perds pas de temps à tordre un composant qui ne convient pas.

Point de contrôle : à 1440 px, survoler chaque onglet ouvre le bon panneau, centré, sans débordement ; Tab puis Entrée ouvre un panneau au clavier ; Échap le ferme.

## Étape 4 : header complet

Implémente, d'après `header-footer-style-airbnb.md` §6 :

- `src/components/site/Header.tsx` (serveur, `async`, charge `getAccesRapide(8)` et le passe au méga-menu) ;
- `src/components/site/SearchPill.tsx` et `useHeaderCompact.ts` (pill Profession / Où ? / Besoin, mini-pill au-delà de 40 px de scroll, hauteur de barre fixe à 80 px, aucun décalage de mise en page) ;
- `src/components/site/UserMenu.tsx` (hamburger + avatar, `useSession()` de Better Auth, contenu différent connecté / déconnecté), rendu sous `Suspense` pour que le reste du header reste cachable ;
- `src/lib/annuaire/acces-rapide.ts` tel que fourni dans `navigation-hierarchie.md` §6, en `use cache` avec `cacheLife('listing')` et `cacheTag('annuaire')`.

Mobile (< 950 px) : onglets et actions masqués, logo + pill réduite à "Où ?" + hamburger. Le tiroir plein écran n'est pas dans le périmètre de cette session : le hamburger ouvre pour l'instant le même popover que `UserMenu`, avec en plus les cinq entrées principales sous forme de liens simples.

## Étape 5 : footer

Implémente `Footer.tsx` (serveur, async) et `FooterExplore.tsx` (client) d'après `header-footer-style-airbnb.md` §6.5, avec les fonctions de données du §4 :

- `getAccesRapide(18)`, `getRegionsPanel()`, `getLabosPanel(12)`, `getLastSyncDate()` dans `src/lib/annuaire/footer.ts`, en `use cache`, profil `listing`, tag `annuaire`. Tant que la table `sync_runs` n'existe pas dans le schéma Drizzle, `getLastSyncDate` renvoie `null` et le `title` du badge est omis ; ajoute un `TODO(phase 1)` ;
- `getFormationPanel()` dans `src/lib/wp/footer.ts`, WPGraphQL, profil `editorial`, tag `wp:formation`. Tant que le CPT `formation` n'a pas de contenu, renvoie les trois types statiques uniquement.

Les panneaux vides ne rendent pas d'onglet.

## Étape 6 : intégration et contrôles

1. Monte `<Header />` et `<Footer />` dans `src/app/(public)/layout.tsx` ; l'espace pro garde son propre layout sans footer d'exploration.
2. Ajoute `src/lib/navigation.test.ts` (Vitest, à installer si absent : `pnpm add -D vitest`) qui vérifie que chaque `href` interne de `mainNav`, `footerCols`, `legalNav` et `exploreStatic` commence par `/`, ne se termine pas par `/` (Next.js gère le trailing slash), et que `dentalbridge` n'apparaît que dans `footerCols`.
3. Ajoute `scripts/check-nav-links.ts` (tsx) qui, contre `http://localhost:3000`, fait un `fetch` de chaque lien interne et échoue sur autre chose qu'un 200. Les routes manquantes listées dans `navigation-hierarchie.md` §2 (`/conseils`, `/partenaires`, `/contact`, pages légales, `/plan-du-site`) peuvent être créées comme pages minimales "Page en cours de rédaction" avec `noindex` pour que le script passe ; liste-les dans ta réponse finale.
4. `pnpm check` vert (typecheck, lint, build). Aucune route interne inconnue ne doit passer grâce à `typedRoutes`.
5. Vérification visuelle avec Playwright (déjà disponible) : capture à 1440 px avec le méga-menu Annuaire ouvert, à 1440 px après 200 px de scroll, à 390 px, et en thème sombre. Regarde les quatre captures et corrige ce qui déborde, se chevauche ou devient illisible avant de conclure.

## Ce que tu ne fais pas

- Aucune couleur rouge, rose ou bleu santé : l'accent est l'anthracite `#2C3E48` (clair) / `#D5DDE2` (sombre).
- Aucun sélecteur de devise, aucune icône de réseau social, aucun logo institutionnel.
- Aucun lien vers DentalBridge ailleurs que dans la colonne Professionnels du footer.
- Aucune modification du schéma Drizzle ni du mu-plugin WordPress dans cette session.
- Aucun `git push` : tu commites sur une branche `feat/header-footer` et tu t'arrêtes.

## Réponse finale attendue

Un tableau des fichiers créés ou modifiés avec leur rôle, la liste des dépendances ajoutées avec leur version, le chemin réel et les dépendances des deux composants installés (matos-ui, 21st.dev), les pages minimales créées pour le script de liens, les quatre captures Playwright, et les écarts éventuels par rapport aux trois documents de référence avec leur justification.
