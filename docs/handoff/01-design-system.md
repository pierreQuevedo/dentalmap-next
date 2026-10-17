# 01 · Design system de l'espace pro

Les tokens Figma ont été alignés sur la feuille de style déployée sur `dentalmap-next.vercel.app`. **Ne pas recréer de tokens** : réutiliser les variables et utilitaires déjà présents dans `globals.css` (`bg-action`, `text-fg-2`, `border-line-strong`, `squircle-md`, etc.). Ce document sert à faire la correspondance.

## Couleurs

| Variable Figma | Variable CSS (code syntax Figma) | Clair | Sombre | Usage |
|---|---|---|---|---|
| `brand` | `var(--action)` | `#0B8484` | `#2FD1D1` | Bouton principal, sélection, progression |
| `brand-hover` | `var(--action-hover)` | `#097070` | `#5EE0E0` | Survol |
| `on-brand` | `var(--action-foreground)` | `#FFFFFF` | `#0E1317` | Texte sur action |
| `ardoise` | `var(--color-ardoise)` | `#16222B` | `#F2F5F7` | Logo, puces sélectionnées, pastilles de sortie |
| `bg` | `var(--bg)` | `#FFFFFF` | `#0E1317` | Fond |
| `bg-soft` | `var(--bg-soft)` | `#F5F6F7` | `#161C21` | Panneaux, notes |
| `bg-muted` | `var(--accent)` | `#EEF1F3` | `#1C242A` | Pastilles neutres |
| `fg` | `var(--fg)` | `#16222B` | `#F2F5F7` | Texte |
| `fg-2` | `var(--fg-2)` | `#5D666D` | `#93A0A8` | Texte secondaire |
| `line` | `var(--line)` | `#E3E7EA` | `#232B31` | Bordures |
| `line-strong` | `var(--line-strong)` | `#C4CCD1` | `#36414A` | Bordures de champs |
| `geo` | `var(--geo)` | `#0071E3` | `#2997FF` | Couloir patient, liens moteur |
| `success` / `success-soft` | à créer si absent | `#005F46` / `#D0FAE5` | `#A4F4CF` / `#002C22` | Vérifié, validations |
| `warning` / `warning-soft` | à créer si absent | `#7B3306` / `#FEF3C6` | `#FEE685` / `#461901` | En attente, cas limites |
| `danger` / `danger-soft` | `var(--destructive)` | `#B3261E` / `#FFE2E2` | `#FF8A80` / `#460809` | Erreurs, refus |
| `recompense` / `recompense-soft` | à créer | `#A9822F` / `#F5EEDD` | `#E2C27A` / `#2E2818` | Gamification uniquement (gains, distinctions, jauge Exemplaire) |
| `acier` | `var(--editorial-3)` | `#47617A` | `#9DB4C9` | Couloir laboratoire |

Le doré `recompense` est la seule couleur chaude : elle est réservée aux réussites, jamais aux actions.

## Typographie et rayons

Figtree partout. Styles Figma : Display 32/40 Bold, Titre 1 26/32, Titre 2 22/28, Titre 3 18/24 SemiBold, Corps 15/22, Corps fort 15/22 SemiBold, Petit 13/18, Libellé 12/16 SemiBold capitales espacées. Rayon de base 14 px (`--radius: .875rem`), cartes 20 px, pilules 999 px.

## Composants Figma et équivalent code

Tous dans la page « Espace pro », section « 00 · Composants ». Lien : `https://www.figma.com/design/oxe3W5vGaT9QEYH6ur6Z3p/Dentalmaps?node-id=<id avec tiret>`.

| Composant Figma | Node | Propriétés | Composant React suggéré |
|---|---|---|---|
| Bouton | `5:50` | Type : Primaire, Secondaire, Fantôme · Libellé | `components/ui/button` (shadcn existant, variantes à mapper) |
| Champ | `5:66` | État : Défaut, Focus, Erreur · Libellé, Valeur, Aide | `components/espace-pro/Field.tsx` |
| Badge | `5:82` | Statut : Vérifié, En attente, Refusé, Registre, Déclaratif | `components/espace-pro/StatusBadge.tsx` |
| Carte option | `5:95` | Sélection : Oui, Non · Titre, Description, Délai | `components/espace-pro/OptionCard.tsx` (radio accessible, `role="radio"`) |
| Élément de navigation | `5:102` | Actif : Oui, Non | `components/espace-pro/SideNavItem.tsx` |
| Barre latérale espace pro | `10:215` | | `app/(pro)/espace-pro/layout.tsx` |
| Jauge de force du profil | `14:260` | Niveau : Débutant, Intermédiaire, Avancé, Exemplaire · Pourcentage | `components/espace-pro/StrengthRing.tsx` (4 segments SVG, `aria-valuenow`) |
| Badge de réussite | `14:273` | État : Obtenu, Verrouillé · Titre, Détail, Glyphe | `components/espace-pro/Achievement.tsx` |
| Desktop / En-tête tunnel | `68:1802` | Étape, Afficher progression, Force, Afficher force | `components/tunnel/TunnelHeader.tsx` (responsive, remplace aussi les deux en-têtes mobiles) |
| Desktop / Barre d'action | `68:1822` | Afficher secondaire | `components/tunnel/ActionBar.tsx` (sticky bas, mobile pleine largeur) |
| Mobile / En-tête tunnel | `25:460` | Étape, Afficher progression | même composant que ci-dessus, breakpoint < 768 |
| Mobile / En-tête complétion | `63:1447` | Étape, Force, Afficher Passer | idem, variante onboarding |
| Mobile / Barre d'action | `25:477` | Action secondaire, Afficher secondaire | idem |
| Indicateur d'étapes | `6:30` | Étape 1, 2, 3 | intégré à `TunnelHeader` |

## Gabarit de page tunnel

Desktop : en-tête (logo, étape et segments au centre, force de fiche et « Quitter » à droite), corps en deux colonnes (contenu 600 px, panneau latéral contextuel 380 px sur `bg-soft`), barre d'action collée en bas (secondaire à gauche, principale à droite). Mobile : même contenu en une colonne, panneau latéral supprimé ou replié en note, barre d'action pleine largeur.

## À ne pas reproduire

Les bandeaux jaunes « SIMULER » des maquettes sont des outils de prototype Figma, pas des éléments d'interface.

## Points ouverts design

Mode sombre non relu écran par écran. Icônes de la barre latérale = carrés de substitution, à remplacer par Lucide (`LayoutDashboard`, `FileText`, `BadgeCheck`, `Megaphone`, `Shield`). Pas de maquette pour le back-office de l'équipe (examen des justificatifs, contestations).
