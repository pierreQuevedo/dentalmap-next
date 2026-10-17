# Transmission DentalMap v2 : espace pro

Dossier à placer à la racine du repo `dentalmap-next` (`docs/handoff/` et `docs/reference/`). Il contient tout ce qui a été conçu dans le projet Claude « Dental Map » pour l'espace pro : connexion, inscription, revendication, vérification, onboarding de complétion et gamification, pour les quatre profils (patient, soignant, laboratoire, organisme).

## Ordre de lecture

| Fichier | Contenu |
|---|---|
| `00-contexte-et-decisions.md` | Règles non négociables, décisions prises, sources de vérité |
| `01-design-system.md` | Tokens (alignés sur la prod), composants Figma et leur équivalent React, gabarit de page |
| `02-parcours-espace-pro.md` | 102 écrans : route, liens Figma desktop et mobile, objectif, règles, données, toutes les sorties. Mis à jour le 11 octobre 2026 : 34 écrans ajoutés (B0S, salarié ou étudiant, espace emploi), node IDs Figma à reporter |
| `parcours.json` | Même contenu en version machine (node IDs Figma inclus) |
| `03-gamification.md` | Barèmes, paliers, gains réels, fraîcheur, distinctions, notifications, garde-fous |
| `04-donnees-auth-integrations.md` | Schéma Drizzle, Better Auth (lien + code, passkey), Pro Santé Connect, routes, server actions, jobs n8n |
| `05-plan-de-mise-en-oeuvre.md` | Phases A à I, critères d'acceptation, tests, manques connus |
| `06-annexe-informations-et-poids.md` | Toutes les informations demandées par profil, avec points, importance, effet sur la présence, écran et fraîcheur |
| `PROMPT-claude-code.md` | Prompt de démarrage à coller dans Claude Code |
| `CLAUDE-md-ajout.md` | Bloc à ajouter au `CLAUDE.md` du repo |
| `AVANCEMENT.md` | Suivi écran par écran, pré-rempli, à tenir à jour par Claude Code |

`docs/reference/` contient les documents antérieurs du projet (architecture v2, setup phase 0, navigation, header et footer, accueil) : ils restent valables, ce dossier les complète.

## Mise en place

```bash
# depuis le dossier décompressé
cp -R docs/ ~/Projects/dentalmap-next/
cd ~/Projects/dentalmap-next
cat docs/handoff/CLAUDE-md-ajout.md >> CLAUDE.md
git checkout -b docs/handoff-espace-pro
git add docs CLAUDE.md && git commit -m "docs(espace-pro): transmission conception"
claude   # puis coller le contenu de docs/handoff/PROMPT-claude-code.md
```

## Figma

Fichier `oxe3W5vGaT9QEYH6ur6Z3p` (« Dentalmaps »).

- **Page « Parcours · step by step »** : la référence d'implémentation (70 étapes en desktop et mobile, avec annotations et prototype cliquable). Flows : « Parcours desktop », « Parcours mobile », et un par profil.
- **Page « Espace pro »** : design system (section 00), exploration, arbre de décision (09), gamification (11).
