# DentalMap v2 : prompt Claude Code pour la page d'accueil

Document de passation pour l'implémentation de la page d'accueil. Rédigé le 20 septembre 2026.

**Règle de base : le code vient des blocks shadcnblocks installés depuis le registre, pas d'une maquette.** Chaque section est un block officiel importé tel quel, dont on remplace uniquement le contenu (textes, liens, icônes, données). Aucun block ne doit être réécrit à la main, ni recopié depuis une capture ou un fichier HTML de référence. Si un block ne convient pas une fois installé, on le signale et on en choisit un autre, on ne le reconstruit pas.

Une maquette HTML existe (artefact "Accueil DentalMap"). Elle ne sert qu'à deux choses : vérifier le wording validé, et vérifier l'ordre des sections. Elle n'est pas une référence de mise en forme et ne doit pas être lue pour écrire du code.

## 1. Registre shadcnblocks

Les huit blocks sont en accès Pro. Avant toute installation, déclarer le registre dans `components.json` :

```json
{
  "registries": {
    "@shadcnblocks": {
      "url": "https://www.shadcnblocks.com/r/{name}.json",
      "headers": {
        "Authorization": "Bearer ${SHADCNBLOCKS_TOKEN}"
      }
    }
  }
}
```

L'URL exacte et le format d'en-tête sont affichés sur la page du compte shadcnblocks : les recopier de là plutôt que de supposer. Le jeton va dans `.env.local` sous `SHADCNBLOCKS_TOKEN`, jamais dans `components.json` en clair, et `.env.local` reste hors de Git.

Claude Code doit demander le jeton au moment d'en avoir besoin. Ne pas tenter d'installation avant de l'avoir : une commande sans jeton renvoie un 401 et laisse le projet dans un état incertain.

## 2. Installation, en pnpm

Toutes les commandes passent par pnpm. Ne jamais utiliser npx ni npm dans ce projet.

```bash
pnpm dlx shadcn@latest add @shadcnblocks/hero157
pnpm dlx shadcn@latest add @shadcnblocks/feature276
pnpm dlx shadcn@latest add @shadcnblocks/feature261
pnpm dlx shadcn@latest add @shadcnblocks/process2
pnpm dlx shadcn@latest add @shadcnblocks/cta26
pnpm dlx shadcn@latest add @shadcnblocks/cta28
pnpm dlx shadcn@latest add @shadcnblocks/blog13
pnpm dlx shadcn@latest add @shadcnblocks/faq4
pnpm dlx shadcn@latest add @shadcnblocks/cta38
```

Installer les neuf blocks d'abord, lire le code généré, et seulement ensuite composer la page. Les dépendances que les blocks tirent (composants shadcn/ui, lucide-react, framer-motion pour process2) s'installent avec eux : laisser la commande faire, ne pas les ajouter à la main.

## 3. Correspondance zone par section

| Zone | Section | Block | Statut |
|---|---|---|---|
| Z1 | Hero | hero157 | installé |
| Z2 | Bandeau de confiance, 6 tuiles | feature276 | installé |
| Z3 | Chiffres clés, bento | feature261 | installé |
| Z4 | Accès rapide à l'annuaire | aucun | composant maison, à garder minimal |
| Z5 | Comment ça marche, 4 étapes | process2 | installé |
| Z6 | Espace praticien | cta26 | installé |
| Z12 | DentalBridge | cta28 | installé, sous réserve de l'arbitrage §5 |
| Z7 | Conseils, 3 articles | blog13 | installé |
| Z8 | Dernières annonces | aucun | composant maison, à garder minimal |
| Z9 | Formation, 3 cartes | aucun | composant maison, à garder minimal |
| Z10 | FAQ | faq4 | installé |
| Z11 | Devenir partenaire | cta38 | installé |

Ordre de rendu dans `src/app/page.tsx` : Z1, Z2, Z3, Z4, Z5, Z6, Z12, Z7, Z8, Z9, Z10, Z11. Z12 est placé juste après Z6, côté praticiens, et non en fin de page.

Chaque block installé est enveloppé dans un composant de section sous `src/components/home/`, par exemple `HomeHero.tsx`, `HomeTrust.tsx`. Le fichier du block reste là où shadcn l'a posé et n'est pas modifié dans sa structure : seules les données qu'il consomme changent.

## 4. Adaptation du contenu

Les blocks imposent leur nombre d'emplacements. Le contenu s'y plie, pas l'inverse.

| Block | Contrainte | Conséquence |
|---|---|---|
| hero157 | un surtitre, un titre, un paragraphe court, un seul bouton | pas de second bouton, pas de ligne de mention sous les boutons |
| feature276 | six tuiles | trois piliers de vérification, plus accès libre, mise à jour hebdomadaire, erreur signalable |
| feature261 | mosaïque avec photos, chiffres, une tuile prix, une grappe d'avatars | la tuile prix porte le 0 €, les avatars sont remplacés par les badges de registres, aucun témoignage |
| process2 | quatre étapes | les trois étapes patient, plus le signalement d'erreur |
| cta26 | bannière photo, deux boutons, deux cartes | une carte dentiste, une carte laboratoire |
| cta28 | titre serif, six libellés d'une ligne | voir l'arbitrage typographique §5 |
| blog13 | trois articles, image, catégorie, date | pas d'extrait, pas d'auteur, pas de temps de lecture |
| faq4 | accordéon plus un bloc de contact final | sept questions, toutes repliées au chargement |
| cta38 | titre, paragraphe, deux boutons | pas de logos institutionnels |

Le wording exact de chaque emplacement est à reprendre de la maquette, mot pour mot. Trois points sensibles :

Le troisième pilier de Z2 s'appelle "Classement transparent" et affirme la règle de tri. Le mot "payant" n'apparaît dans aucune section sauf la FAQ, où la question est posée frontalement.

La réponse FAQ sur le paiement affirme que la fonctionnalité n'existe pas dans le code, pas seulement qu'elle n'est pas commercialisée. Cette formulation engage : aucune notion de compte, d'abonnement ou de mise en avant ne doit entrer dans la fonction de tri.

Z11 n'affiche aucun logo institutionnel tant qu'aucune convention n'est signée.

## 5. Arbitrages ouverts

Z12 contredit la règle posée dans `navigation-hierarchie.md`, qui interdit tout lien DentalBridge hors du pied de page. Ne pas coder Z12 tant que l'arbitrage n'est pas rendu. Si la règle d'origine est retenue, supprimer la section et désinstaller cta28.

cta28 impose un titre serif alors que la charte est en Figtree. Deux issues : charger une serif uniquement pour ce panneau, ou remplacer par Figtree dans le block. Décision non prise.

## 6. Charte à appliquer aux blocks

Les blocks arrivent avec la palette shadcn par défaut et un accent souvent orange ou noir pur. Les repasser sur les tokens du projet, définis dans `globals.css` sous `@theme` (voir `header-footer-style-airbnb.md` §2) : anthracite `#2C3E48` en accent, jamais de rouge ni d'orange, Figtree en police, rayons et gouttières du document de charte. Ne pas laisser de couleur en dur dans un block.

Les blocks doivent fonctionner en thème sombre. Vérifier en particulier les deux aplats sombres, Z12 et Z11, qui doivent rester distincts du fond de page.

## 7. Données et sources

| Zone | Données | Origine | Cache |
|---|---|---|---|
| Z3 | compteurs praticiens, laboratoires, communes, départements, date de synchronisation | Neon | `use cache`, profil `listing`, tag `annuaire` |
| Z4 | 8 communes les plus peuplées avec au moins un praticien, par profession | Neon, `getAccesRapide` | idem |
| Z7 | 3 derniers articles avec catégorie et date | WordPress via WPGraphQL | profil `editorial`, tag `wp:conseils` |
| Z8 | 5 dernières annonces actives avec type, lieu, date | WordPress via WPGraphQL | profil `editorial`, tag `wp:annonces` |
| Z10 | questions et réponses | CPT `faq` WordPress, plus JSON-LD `FAQPage` généré depuis le même contenu | profil `editorial`, tag `wp:faq` |

Aucun chiffre ne doit être écrit en dur, même temporairement. Tant que la donnée n'est pas branchée, la section rend un état de chargement ou ne rend rien.

## 8. Contrôles avant de considérer la page terminée

| Contrôle | Attendu |
|---|---|
| `git diff` sur les fichiers de blocks | aucune modification structurelle, seulement des données et des tokens |
| `grep -rn "npx\|npm install" .` | aucune occurrence introduite par cette tâche |
| `grep -r dentalbridge src/` | uniquement `navigation.ts`, plus le composant Z12 s'il est conservé |
| Premier écran à 1440 px | le hero et le début du bandeau de confiance visibles sans défiler |
| Largeur 390 px | aucun défilement horizontal, bento de Z3 empilé |
| Thème sombre | aucun texte illisible, Z12 et Z11 distincts du fond |
| Lighthouse accessibilité | accordéon Z10 utilisable au clavier, étapes Z5 atteignables en tabulation |
| JSON-LD | `FAQPage` présent et cohérent avec les questions affichées |