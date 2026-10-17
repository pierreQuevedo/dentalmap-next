# DentalMap v2 : header et footer, style Airbnb

Spécification et composants Next.js du header (onglets, méga-menu, pill de recherche, mode compact) et du pied de page (bloc d'exploration à onglets, trois colonnes, barre basse). Rédigé le 13 septembre 2026. Ce document précise la mise en forme ; la hiérarchie des liens reste celle de `navigation-hierarchie.md`, à une exception près : le pied de page passe de quatre colonnes à trois, plus un bloc d'exploration à onglets, pour coller au modèle Airbnb.

Prévisualisation interactive : artifact "DentalMap Navigation" (header, méga-menu, footer, mode compact au scroll).

## 1. Ce qu'on reprend d'Airbnb, et comment on le transpose

| Pattern Airbnb (airbnb.fr, 2026) | Transposition DentalMap |
|---|---|
| Header 80 px, logo à gauche, onglets centrés avec icône, actions à droite | Identique. Cinq onglets : Annuaire, Conseils, Annonces, Formation, À propos. Icônes en trait fin, pas d'icônes animées |
| Onglet actif souligné d'un trait de 2 px, hover en fond gris arrondi | Identique |
| Pill de recherche sous les onglets (Destination / Dates / Voyageurs + bouton rond) | Profession / Où ? / Besoin + bouton rond anthracite. Trois cellules au lieu de trois plus une, séparateurs verticaux qui disparaissent au survol |
| Au scroll, la pill se replie en mini-pill dans la barre et les onglets disparaissent | Identique, seuil 40 px, mini-pill "Dentiste · Où ?" qui renvoie en haut de page |
| À droite : "Devenir hôte", globe langue, bouton hamburger + avatar | "Vous êtes praticien ?", icône aide, bouton hamburger + avatar. Pas de sélecteur de langue en v1, site français uniquement |
| Menus en popover blanc, coins 20 px, ombre portée, items arrondis au survol | Identique. Annuaire ouvre un méga-menu quatre colonnes, les quatre autres onglets ouvrent un popover simple |
| Footer gris clair, bloc "Des idées pour vos prochaines escapades" avec onglets et grille 6 colonnes "Ville / Type", lien "Afficher plus" | Bloc "Trouver un professionnel près de chez vous", onglets Grandes villes / Par région / Prothésistes dentaires / Formation / Conseils, grille 6 colonnes "Ville / Chirurgiens-dentistes" |
| Trois colonnes Assistance / Accueil de voyageurs / Airbnb | Assistance / Professionnels / DentalMap |
| Barre basse : © année, Confidentialité, Conditions générales, Fonctionnement du site, Infos sur l'entreprise ; à droite langue, devise, réseaux sociaux | © 2026 DentalMap, Confidentialité, Conditions d'utilisation, Mentions légales, Plan du site, Gestion des cookies ; à droite "Français (FR)" et deux badges de source "ANS · RPPS" et "INSEE · Sirene" à la place de la devise et des réseaux sociaux |
| Couleur d'accent rouge Rausch sur le bouton de recherche | Anthracite `#2C3E48` de la charte, jamais de rouge |

Ce qui n'est volontairement pas repris : le sélecteur de devise, les icônes de réseaux sociaux tant que les comptes n'existent pas, les vidéos d'icônes dans les onglets, le fond dégradé rose du bouton.

## 2. Tokens

| Token | Clair | Sombre | Usage |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#15191C` | fond de page et des popovers |
| `--bg-soft` | `#F4F6F7` | `#1D2226` | fond du footer, hover des items, colonne "Notre méthode" |
| `--fg` | `#222629` | `#ECEFF1` | texte principal |
| `--fg-2` | `#6B7378` | `#9AA5AC` | texte secondaire, onglets inactifs |
| `--line` | `#DFE3E6` | `#2C3338` | bordures, séparateurs |
| `--brand` | `#2C3E48` | `#D5DDE2` | logo, bouton de recherche |
| `--pill-shadow` | `0 3px 12px rgba(20,30,36,.10), 0 1px 2px rgba(20,30,36,.06)` | plus dense | pill, bouton menu au survol |
| `--pop-shadow` | `0 8px 28px rgba(20,30,36,.16)` | plus dense | popovers |

Rayons : pill et boutons 999 px, popovers 20 px, items de menu 12 px, colonne mise en avant 16 px. Gouttières : 80 px au-delà de 1128 px, 40 px entre 744 et 1127 px, 24 px en dessous (les trois paliers Airbnb).

Typographie : Figtree (Google Fonts), la plus proche d'Airbnb Cereal parmi les polices libres. Poids 400 corps, 500 onglets, 600 titres et libellés, 700 logo. Corps 14 px, items de menu 15 px, titre de bloc footer 22 px, libellés de colonnes du méga-menu 12 px capitales espacées.

Tailwind : déclarer ces tokens dans `globals.css` sous `@theme` (Tailwind 4) pour les utiliser en `bg-bg-soft`, `text-fg-2`, `border-line`, etc.

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-bg: #ffffff;
  --color-bg-soft: #f4f6f7;
  --color-fg: #222629;
  --color-fg-2: #6b7378;
  --color-line: #dfe3e6;
  --color-line-strong: #c9cfd3;
  --color-brand: #2c3e48;
  --color-brand-hover: #1f2d35;
  --font-sans: "Figtree", "Helvetica Neue", Arial, sans-serif;
  --shadow-pill: 0 3px 12px rgba(20, 30, 36, .10), 0 1px 2px rgba(20, 30, 36, .06);
  --shadow-pop: 0 8px 28px rgba(20, 30, 36, .16);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #15191c; --color-bg-soft: #1d2226; --color-fg: #eceff1; --color-fg-2: #9aa5ac;
    --color-line: #2c3338; --color-line-strong: #3a434a; --color-brand: #d5dde2; --color-brand-hover: #ffffff;
  }
}
```

Police : `next/font/google` avec `Figtree({ subsets: ['latin'], variable: '--font-sans' })` dans le layout racine.

## 3. Comportements

| Comportement | Règle |
|---|---|
| Ouverture des menus | Au survol (délai de fermeture 180 ms pour traverser l'espace entre l'onglet et le popover) et au clic ; fermeture à Échap, au clic extérieur, au changement de route |
| Ancrage | Les popovers simples sont centrés sous leur onglet ; le méga-menu Annuaire est centré sous la barre d'onglets (`position: static` sur l'onglet, `relative` sur le `nav`) pour ne jamais déborder à gauche |
| Mode compact | Au-delà de 40 px de scroll : la ligne de recherche se replie, les onglets disparaissent, une mini-pill apparaît au centre de la barre. Le clic sur la mini-pill remonte en haut de page (pas de dépliage in-place en v1) |
| Onglet actif | Déduit du premier segment de l'URL (`usePathname`) : `/dentistes`, `/prothesistes`, `/recherche` activent Annuaire |
| Accessibilité | `aria-expanded` et `aria-haspopup` sur les déclencheurs, `role="menu"` sur les popovers, tabulation dans l'ordre visuel, focus visible 2 px anthracite, `prefers-reduced-motion` coupe les transitions |
| Espace pro | Le bouton hamburger + avatar ouvre un popover : Connexion / Créer un compte si déconnecté ; Espace pro / Ma fiche / Déconnexion si connecté. Composant client qui lit `useSession()` de Better Auth, isolé pour que le reste du header reste cachable |
| Mobile (< 950 px) | Onglets et actions masqués, bouton hamburger seul, pill réduite à "Où ?" + bouton. Le tiroir plein écran suit la spec de `navigation-hierarchie.md` §3.4 |
| Footer, onglets d'exploration | Cinq onglets, un seul panneau visible, 6 colonnes au-delà de 1128 px, 3 entre 744 et 1127, 2 en dessous. "Afficher plus" déplie le panneau complet (jusqu'à 60 liens) |

## 4. Données du footer

| Panneau | Source | Cache |
|---|---|---|
| Grandes villes | `getAccesRapide(18)` (communes les plus peuplées avec au moins un dentiste) | `use cache`, profil `listing`, tag `annuaire` |
| Par région | table `regions` avec nombre de départements | idem |
| Prothésistes dentaires | même requête que Grandes villes avec `profession = 'prothesiste'`, 12 résultats | idem |
| Formation | 3 types + 3 facultés mises en avant (champ ACF `miseEnAvant` sur le CPT formation) | profil `editorial`, tag `wp:formation` |
| Conseils | 3 catégories + FAQ + Annonces + Méthode | statique, dans `navigation.ts` |
| Badges de source | date du dernier `sync_runs` terminé, affichée en `title` | profil `listing`, tag `annuaire` |

## 5. Structure des composants

```
src/components/site/
  Header.tsx            serveur : logo, <MainNav/>, <SearchPill/>, <UserMenu/>
  MainNav.tsx           client : onglets, popovers, méga-menu, actif selon pathname
  SearchPill.tsx        client : pill 3 cellules + mini-pill compacte, écoute du scroll
  UserMenu.tsx          client : hamburger + avatar, lit useSession()
  Footer.tsx            serveur async : charge les panneaux, rend <FooterExplore/> + colonnes + barre basse
  FooterExplore.tsx     client : onglets et panneaux
src/lib/navigation.ts   source unique des liens (voir navigation-hierarchie.md, complété ci-dessous)
```

Ajouts dans `src/lib/navigation.ts` :

```ts
export type NavIcon = 'map' | 'article' | 'mail' | 'school' | 'info'

export const mainNavIcons: Record<string, NavIcon> = {
  Annuaire: 'map', Conseils: 'article', Annonces: 'mail', Formation: 'school', 'À propos': 'info',
}

export const footerCols: NavColumn[] = [
  {
    title: 'Assistance',
    links: [
      { label: 'Questions fréquentes', href: '/faq' },
      { label: 'Méthode de vérification et classement', href: '/methode-de-verification' },
      { label: 'Signaler une erreur sur une fiche', href: '/contact?objet=erreur-fiche' },
      { label: 'Contact', href: '/contact' },
      { label: 'Vos données personnelles', href: '/confidentialite' },
    ],
  },
  {
    title: 'Professionnels',
    links: [
      { label: 'Revendiquer ma fiche', href: '/espace-pro/revendiquer' },
      { label: 'Espace pro', href: '/espace-pro' },
      { label: 'Créer un compte', href: '/connexion?mode=inscription' },
      { label: 'Déposer une annonce', href: '/annonces' },
      { label: 'DentalBridge, logiciel de gestion de cabinet', href: 'https://dentalbridge.fr', external: true, description: 'site externe' },
    ],
  },
  {
    title: 'DentalMap',
    links: [
      { label: 'Le projet', href: '/a-propos' },
      { label: 'Notre engagement de neutralité', href: '/a-propos#neutralite' },
      { label: 'Devenir partenaire', href: '/partenaires' },
      { label: 'Conseils et ressources', href: '/conseils' },
      { label: 'Formation', href: '/formation' },
    ],
  },
]

export type ExploreLink = { title: string; sub: string; href: string }
export type ExplorePanel = { id: string; label: string; links: ExploreLink[] }

export const exploreStatic: ExplorePanel = {
  id: 'conseils',
  label: 'Conseils',
  links: [
    { title: 'Pour les patients', sub: 'Choisir, comprendre, préparer', href: '/conseils/patients' },
    { title: 'Pour les praticiens', sub: 'Installation, réglementation', href: '/conseils/praticiens' },
    { title: 'Pour les prothésistes', sub: 'Laboratoire, normes, matériaux', href: '/conseils/prothesistes' },
    { title: 'Questions fréquentes', sub: 'Vérification, données, fiches', href: '/faq' },
    { title: 'Annonces', sub: 'Cessions, remplacements, emploi', href: '/annonces' },
    { title: 'Méthode de vérification', sub: 'RPPS, ADELI, Sirene', href: '/methode-de-verification' },
  ],
}
```

## 6. Composants

### 6.1 `Header.tsx`

```tsx
// src/components/site/Header.tsx
import Link from 'next/link'
import { Suspense } from 'react'
import { MainNav } from './MainNav'
import { SearchPill } from './SearchPill'
import { UserMenu } from './UserMenu'

export function Header() {
  return (
    <header id="site-header" className="sticky top-0 z-50 border-b border-line bg-bg">
      <div className="grid h-20 grid-cols-[auto_1fr_auto] items-center px-6 md:grid-cols-[1fr_auto_1fr] md:px-10 xl:px-20">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-brand">
          <span aria-hidden className="size-[30px] rounded-md bg-brand" />
          DentalMap
        </Link>
        <MainNav />
        <div className="flex items-center justify-end gap-2">
          <Link href="/espace-pro/revendiquer" className="hidden rounded-full px-3 py-3 text-sm font-medium hover:bg-bg-soft md:inline-block">
            Vous êtes praticien ?
          </Link>
          <Suspense fallback={<span className="h-[42px] w-[86px] rounded-full border border-line" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
      <SearchPill />
    </header>
  )
}
```

### 6.2 `MainNav.tsx`

```tsx
// src/components/site/MainNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { mainNav, mainNavIcons, type NavEntry, type NavLink } from '@/lib/navigation'
import { NavIconSvg } from './NavIconSvg'
import { useHeaderCompact } from './useHeaderCompact'

const ANNUAIRE_PREFIXES = ['/dentistes', '/prothesistes', '/recherche']

function isActive(entry: NavEntry, pathname: string) {
  if (entry.label === 'Annuaire') return ANNUAIRE_PREFIXES.some((p) => pathname.startsWith(p))
  return pathname === entry.href || pathname.startsWith(entry.href + '/')
}

export function MainNav({ accesRapide = [] }: { accesRapide?: NavLink[] }) {
  const pathname = usePathname()
  const compact = useHeaderCompact()
  const [open, setOpen] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => setOpen(null), [pathname])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    const onClick = () => setOpen(null)
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick) }
  }, [])

  const enter = (label: string) => { if (timer.current) clearTimeout(timer.current); setOpen(label) }
  const leave = () => { timer.current = setTimeout(() => setOpen(null), 180) }

  if (compact) return null

  return (
    <nav aria-label="Navigation principale" className="relative hidden justify-self-center gap-1 md:flex">
      {mainNav.map((entry) => {
        const active = isActive(entry, pathname)
        const isOpen = open === entry.label
        const mega = !!entry.columns
        return (
          <div
            key={entry.label}
            className={mega ? 'static' : 'relative'}
            onMouseEnter={() => enter(entry.label)}
            onMouseLeave={leave}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="true"
              onClick={(e) => { e.stopPropagation(); setOpen(isOpen ? null : entry.label) }}
              className={[
                'relative inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-[15px] font-medium transition-colors',
                active || isOpen ? 'text-fg' : 'text-fg-2 hover:text-fg',
                isOpen ? 'bg-bg-soft' : 'hover:bg-bg-soft',
                active ? 'after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded after:bg-fg' : '',
              ].join(' ')}
            >
              <NavIconSvg name={mainNavIcons[entry.label]} className="size-5" />
              {entry.label}
            </button>

            {isOpen && (mega
              ? <MegaMenu entry={entry} accesRapide={accesRapide} />
              : <SimpleMenu entry={entry} />)}
          </div>
        )
      })}
    </nav>
  )
}

function SimpleMenu({ entry }: { entry: NavEntry }) {
  const [head, ...rest] = entry.links ?? []
  return (
    <div role="menu" className="absolute left-1/2 top-[calc(100%+12px)] z-[55] min-w-[260px] -translate-x-1/2 rounded-[20px] border border-line bg-bg p-2 shadow-pop">
      <Link role="menuitem" href={head.href} className="block rounded-xl px-4 py-3 text-[15px] font-semibold hover:bg-bg-soft">{head.label}</Link>
      <hr className="mx-2 my-1.5 border-line" />
      {rest.map((l) => (
        <Link key={l.href} role="menuitem" href={l.href} className="block rounded-xl px-4 py-3 text-[15px] hover:bg-bg-soft">{l.label}</Link>
      ))}
    </div>
  )
}

function MegaMenu({ entry, accesRapide }: { entry: NavEntry; accesRapide: NavLink[] }) {
  return (
    <div role="menu" className="absolute left-1/2 top-[calc(100%+12px)] z-[55] grid w-[920px] max-w-[calc(100vw-5rem)] -translate-x-1/2 grid-cols-4 gap-6 rounded-[20px] border border-line bg-bg p-6 shadow-pop">
      {entry.columns!.map((col) => {
        const links = col.dynamic === 'acces-rapide' ? accesRapide.slice(0, 5) : col.links
        return (
          <div key={col.title} className={col.highlight ? 'rounded-2xl bg-bg-soft px-1 py-3' : ''}>
            <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-[.06em] text-fg-2">{col.title}</h4>
            {col.highlight && (
              <p className="mx-3 mb-2 text-[13px] text-fg-2">
                Chaque fiche est vérifiée dans les registres RPPS, ADELI et Sirene. Le classement se fait par distance puis par ordre alphabétique. La place ne s'achète pas.
              </p>
            )}
            {links.map((l) => (
              <Link key={l.href} role="menuitem" href={l.href} className={['block rounded-xl px-3 py-2.5 text-[15px] hover:bg-bg-soft', col.highlight ? 'font-semibold' : ''].join(' ')}>
                {l.label}
              </Link>
            ))}
          </div>
        )
      })}
    </div>
  )
}
```

`accesRapide` est passé depuis `Header.tsx` (serveur) après `await getAccesRapide(8)` ; le Header devient alors `async` et `MainNav` reçoit la prop.

```tsx
// src/components/site/NavIconSvg.tsx
import type { NavIcon } from '@/lib/navigation'

const paths: Record<NavIcon, string> = {
  map: 'M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10zM12 8.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4z',
  article: 'M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM14 4v5h5M8 13h8M8 17h8',
  mail: 'M4 7h16v12H4zM4 7l8 6 8-6',
  school: 'M3 9l9-4 9 4-9 4-9-4zM7 11v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5M21 9v6',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8h.01',
}

export function NavIconSvg({ name, className }: { name: NavIcon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={paths[name]} />
    </svg>
  )
}
```

### 6.3 `useHeaderCompact.ts` et `SearchPill.tsx`

```ts
// src/components/site/useHeaderCompact.ts
'use client'
import { useEffect, useState } from 'react'

export function useHeaderCompact(threshold = 40) {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return compact
}
```

```tsx
// src/components/site/SearchPill.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useHeaderCompact } from './useHeaderCompact'

type Profession = 'dentiste' | 'prothesiste'

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className={className} aria-hidden>
      <circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" />
    </svg>
  )
}

export function SearchPill() {
  const compact = useHeaderCompact()
  const router = useRouter()
  const [profession, setProfession] = useState<Profession>('dentiste')
  const [where, setWhere] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = new URLSearchParams({ profession })
    if (where.trim()) q.set('q', where.trim())
    router.push(`/recherche?${q.toString()}`)
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-line py-1.5 pl-4 pr-1.5 text-sm font-semibold shadow-pill md:inline-flex"
        aria-label="Ouvrir la recherche"
      >
        <span className="px-4 py-1.5">{profession === 'dentiste' ? 'Dentiste' : 'Prothésiste'}</span>
        <span className="border-l border-line px-4 py-1.5 font-normal text-fg-2">{where || 'Où ?'}</span>
        <span className="ml-1 grid size-[34px] place-items-center rounded-full bg-brand text-bg"><SearchIcon className="size-3.5" /></span>
      </button>
    )
  }

  return (
    <div className="flex justify-center px-6 pb-4 md:px-10 md:pb-5 xl:px-20">
      <form
        role="search"
        onSubmit={submit}
        className="grid w-full max-w-[850px] grid-cols-[1fr_auto] items-center rounded-full border border-line bg-bg shadow-pill md:grid-cols-[1.2fr_1.6fr_1fr_auto]"
      >
        <label className="group relative hidden rounded-full px-6 py-3.5 hover:bg-bg-soft md:block">
          <span className="block text-xs font-semibold">Profession</span>
          <select
            id="search-profession"
            value={profession}
            onChange={(e) => setProfession(e.target.value as Profession)}
            className="w-full appearance-none bg-transparent text-sm outline-none"
          >
            <option value="dentiste">Chirurgien-dentiste</option>
            <option value="prothesiste">Prothésiste dentaire</option>
          </select>
        </label>
        <label className="relative rounded-full px-6 py-3.5 hover:bg-bg-soft md:before:absolute md:before:inset-y-3.5 md:before:left-0 md:before:w-px md:before:bg-line md:hover:before:bg-transparent">
          <span className="block text-xs font-semibold">Où ?</span>
          <input
            id="search-where"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="Ville, code postal ou adresse"
            autoComplete="off"
            className="w-full bg-transparent text-sm outline-none placeholder:text-fg-2"
          />
        </label>
        <div className="relative hidden rounded-full px-6 py-3.5 hover:bg-bg-soft md:block before:absolute before:inset-y-3.5 before:left-0 before:w-px before:bg-line hover:before:bg-transparent">
          <span className="block text-xs font-semibold">Besoin</span>
          <span className="text-sm text-fg-2">Tous les praticiens</span>
        </div>
        <button type="submit" aria-label="Rechercher" className="m-[7px] grid size-12 place-items-center rounded-full bg-brand text-bg transition-colors hover:bg-brand-hover">
          <SearchIcon className="size-[18px]" />
        </button>
      </form>
    </div>
  )
}
```

La cellule "Besoin" est un emplacement réservé (spécialité, accès PMR, langue) branché sur `fiches_completees` en phase 4 ; en v1 elle affiche "Tous les praticiens" et n'ouvre rien. L'autocomplétion du champ "Où ?" appelle `/api/geo/autocomplete` (voir architecture §8.5) dans un popover sous la pill ; elle n'est pas incluse ici.

### 6.4 `UserMenu.tsx`

```tsx
// src/components/site/UserMenu.tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { signOut, useSession } from '@/lib/auth-client'

export function UserMenu() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  const item = 'block rounded-xl px-4 py-3 text-[15px] hover:bg-bg-soft'

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className="inline-flex items-center gap-3 rounded-full border border-line py-1.5 pl-3 pr-1.5 transition-shadow hover:shadow-pill"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="size-4" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        <span className="grid size-[30px] place-items-center rounded-full bg-fg-2 text-bg">
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" aria-hidden><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z" /></svg>
        </span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+12px)] z-[55] min-w-[240px] rounded-[20px] border border-line bg-bg p-2 shadow-pop">
          {session ? (
            <>
              <Link href="/espace-pro" className={`${item} font-semibold`}>Espace pro</Link>
              <Link href="/espace-pro/fiche" className={item}>Ma fiche</Link>
              <hr className="mx-2 my-1.5 border-line" />
              <Link href="/faq" className={item}>Aide</Link>
              <button type="button" onClick={() => signOut()} className={`${item} w-full text-left`}>Se déconnecter</button>
            </>
          ) : (
            <>
              <Link href="/connexion?mode=inscription" className={`${item} font-semibold`}>Créer un compte</Link>
              <Link href="/connexion" className={item}>Se connecter</Link>
              <hr className="mx-2 my-1.5 border-line" />
              <Link href="/espace-pro/revendiquer" className={item}>Revendiquer ma fiche</Link>
              <Link href="/faq" className={item}>Aide</Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
```

### 6.5 `Footer.tsx` et `FooterExplore.tsx`

```tsx
// src/components/site/Footer.tsx
import Link from 'next/link'
import { getAccesRapide, getRegionsPanel, getLabosPanel, getLastSyncDate } from '@/lib/annuaire/footer'
import { getFormationPanel } from '@/lib/wp/footer'
import { exploreStatic, footerCols, legalNav, type ExplorePanel } from '@/lib/navigation'
import { FooterExplore } from './FooterExplore'

export async function Footer() {
  const [villes, regions, labos, formation, lastSync] = await Promise.all([
    getAccesRapide(18), getRegionsPanel(), getLabosPanel(12), getFormationPanel(), getLastSyncDate(),
  ])
  const panels: ExplorePanel[] = [
    { id: 'villes', label: 'Grandes villes', links: villes.map((v) => ({ title: v.label.replace('Dentistes à ', ''), sub: 'Chirurgiens-dentistes', href: v.href })) },
    { id: 'regions', label: 'Par région', links: regions },
    { id: 'labos', label: 'Prothésistes dentaires', links: labos },
    { id: 'formation', label: 'Formation', links: formation },
    exploreStatic,
  ]
  const px = 'px-6 md:px-10 xl:px-20'

  return (
    <footer className="border-t border-line bg-bg-soft text-sm">
      <section className={`${px} border-b border-line pt-12`}>
        <h2 className="mb-4 text-[22px] font-semibold tracking-tight">Trouver un professionnel près de chez vous</h2>
        <FooterExplore panels={panels} />
      </section>

      <section className={`${px} grid gap-8 py-12 md:grid-cols-3 md:gap-6`}>
        {footerCols.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 font-semibold">{col.title}</h3>
            <ul className="grid gap-3.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  {l.external ? (
                    <a href={l.href} rel="noopener" className="hover:underline">
                      {l.label} <span aria-hidden className="text-fg-2">↗</span>
                      <span className="ml-1.5 rounded-full bg-line px-2 py-px text-[11px] font-medium text-fg-2">{l.description}</span>
                    </a>
                  ) : (
                    <Link href={l.href} className="hover:underline">{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className={`${px} flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line py-6`}>
        <div className="flex flex-wrap items-center gap-2">
          <span>© {new Date().getFullYear()} DentalMap</span>
          {legalNav.map((l) => (
            <span key={l.href} className="contents">
              <span className="text-fg-2">·</span>
              <Link href={l.href} className="hover:underline">{l.label}</Link>
            </span>
          ))}
          <span className="text-fg-2">·</span>
          <button type="button" data-cookie-settings className="underline">Gestion des cookies</button>
        </div>
        <div className="flex items-center gap-6 font-semibold">
          <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>
            Français (FR)
          </span>
          <span className="inline-flex gap-1.5" title={lastSync ? `Données mises à jour le ${lastSync}` : undefined}>
            <span className="rounded-full border border-line-strong px-2 py-0.5 text-xs">ANS · RPPS</span>
            <span className="rounded-full border border-line-strong px-2 py-0.5 text-xs">INSEE · Sirene</span>
          </span>
        </div>
      </section>
    </footer>
  )
}
```

```tsx
// src/components/site/FooterExplore.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ExplorePanel } from '@/lib/navigation'

const COLLAPSED = 17

export function FooterExplore({ panels }: { panels: ExplorePanel[] }) {
  const [active, setActive] = useState(panels[0].id)
  const [expanded, setExpanded] = useState(false)
  const panel = panels.find((p) => p.id === active) ?? panels[0]
  const links = expanded ? panel.links : panel.links.slice(0, COLLAPSED)
  const hasMore = panel.links.length > COLLAPSED

  return (
    <>
      <div role="tablist" className="flex gap-6 overflow-x-auto border-b border-line [scrollbar-width:none]">
        {panels.map((p) => (
          <button
            key={p.id}
            role="tab"
            id={`explore-tab-${p.id}`}
            aria-selected={p.id === active}
            aria-controls={`explore-panel-${p.id}`}
            onClick={() => { setActive(p.id); setExpanded(false) }}
            className={[
              '-mb-px whitespace-nowrap border-b-2 py-3 font-medium transition-colors',
              p.id === active ? 'border-fg text-fg' : 'border-transparent text-fg-2 hover:text-fg',
            ].join(' ')}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`explore-panel-${panel.id}`}
        aria-labelledby={`explore-tab-${panel.id}`}
        className="grid grid-cols-2 gap-x-6 gap-y-4 py-8 md:grid-cols-3 xl:grid-cols-6"
      >
        {links.map((l) => (
          <Link key={l.href + l.title} href={l.href} className="group block leading-[1.35]">
            <span className="block font-semibold group-hover:underline">{l.title}</span>
            <span className="text-fg-2">{l.sub}</span>
          </Link>
        ))}
        {hasMore && !expanded && (
          <button type="button" onClick={() => setExpanded(true)} className="self-end text-left font-semibold underline">
            Afficher plus
          </button>
        )}
        {expanded && hasMore && (
          <button type="button" onClick={() => setExpanded(false)} className="self-end text-left font-semibold underline">
            Afficher moins
          </button>
        )}
      </div>
    </>
  )
}
```

`getRegionsPanel`, `getLabosPanel`, `getLastSyncDate` (Drizzle, `use cache` avec tag `annuaire`) et `getFormationPanel` (WPGraphQL, tag `wp:formation`) suivent le même gabarit que `getAccesRapide` dans `navigation-hierarchie.md` §6.

## 7. Contrôles

| Contrôle | Attendu |
|---|---|
| Header à 1440 px, survol de chaque onglet | Popover centré sous l'onglet, méga-menu centré sous la barre, aucun débordement horizontal |
| Scroll de 200 px | Onglets masqués, mini-pill au centre, hauteur de barre inchangée (80 px), pas de saut de mise en page |
| Largeur 390 px | Logo + pill "Où ?" + hamburger, footer sur 2 colonnes, colonnes empilées, barre basse sur deux lignes |
| Navigation clavier | Tab parcourt logo, onglets, actions, cellules de la pill ; Entrée ouvre un popover ; Échap le ferme |
| Thème sombre du système | Aucun texte illisible, ombres visibles, bouton de recherche clair sur fond sombre |
| `grep -r dentalbridge src/` | Uniquement `navigation.ts` |
