# Mission : monter le socle de développement DentalMap v2 (phase 0)

Tu travailles pour Pierre Quevedo, développeur Next.js expérimenté. Tu exécutes toi-même les commandes, tu ne te contentes pas de les lister. Tu réponds en français, sans tirets cadratins.

## Documents de référence

Deux fichiers sont dans le dossier courant, dans `docs/` :

- `docs/architecture-v2-nextjs-headless.md` : les décisions figées (stack, modèle de données, cache, SEO, plan de migration). Tu ne les remets pas en question, tu les appliques.
- `docs/setup-socle-phase-0.md` : le runbook, 14 étapes avec un point de contrôle chacune. C'est ton plan d'exécution, dans cet ordre, à une exception près décrite plus bas.

Lis intégralement les deux fichiers avant la première commande. Quand le runbook et l'architecture divergent sur un détail, le runbook a raison (il est plus récent).

## Ce que tu fais toi-même

Tout ce qui est local, GitHub, Vercel CLI, Neon via CLI/SQL, et tout ce qui passe par SSH sur OVH (`dentalk@ssh.cluster100.hosting.ovh.net`, clé SSH déjà installée, aucun mot de passe à saisir). Outils disponibles : `node` 22, `pnpm`, `git`, `gh` (authentifié), `vercel` (authentifié), `ssh`, `scp`, `curl`, `jq`, `psql` si présent sinon utiliser le SQL Editor via l'API Neon ou demander.

Après avoir créé le projet à l'étape 1, déplace `docs/` à l'intérieur de `dentalmap-next/docs/` et poursuis depuis `dentalmap-next`. Les deux documents sont versionnés dans le repo.

Commite après chaque étape validée, message au format `chore(setup): étape N, <objet>`. Pousse sur `dev`. `main` ne reçoit que des PR.

## Ce qui reste manuel : tu t'arrêtes et tu demandes

Certaines actions ne sont possibles que dans un dashboard. Quand tu arrives à l'une d'elles, tu décris précisément ce qu'il faut faire (chemin dans l'interface, valeurs à saisir), tu demandes confirmation, et tu ne continues qu'après la réponse :

| Étape | Action manuelle |
|---|---|
| 4 | Dashboard Vercel : Storage > Create Database > Neon, région Frankfurt, option "database branch for each Preview Deployment" cochée |
| 7.0 | Espace client OVH : désactiver le déploiement Git sur dentalmap.fr ; créer une base de données neuve et te communiquer hôte, nom, utilisateur, mot de passe |
| 7.0 | Confirmation explicite que la sauvegarde rapatriée sur le Mac est vérifiée, AVANT tout `rm` sur le serveur |
| 7.1 | Espace client OVH : ajouter le domaine `cms.dentalmap.fr` en multisite, dossier `cms`, SSL, PHP 8.3 |
| 7.4 | Création des groupes de champs ACF dans wp-admin (interface uniquement) ; tu fournis le tableau des champs et tu vérifies ensuite par une requête GraphQL |
| 12 | Réglages Vercel : Build Command `pnpm vercel-build` |

Valeurs que tu demandes une seule fois, au début, puis que tu réutilises : mot de passe admin WordPress à créer (ou tu en génères un fort et tu l'affiches une fois), clé API Resend si elle est disponible (sinon tu laisses le stub console et tu continues).

## Règles de sécurité

- Aucune suppression sur OVH (`rm`, `DROP`, `wp db reset`) sans la sauvegarde de 7.0 rapatriée ET confirmée par Pierre.
- Aucune commande destructive sur la branche Neon principale en dehors des migrations Drizzle.
- Les secrets ne sont jamais commités : `.env.local` est ignoré, `.env.example` ne contient que des clés vides.
- Tu ne modifies pas le contenu des deux documents de référence, sauf pour corriger une commande qui a échoué, et dans ce cas tu notes le correctif en fin de fichier dans une section "Écarts constatés à l'exécution".

## Ordre d'exécution

1. Étapes 1 à 6 (repo, Next.js, dépendances, Vercel + Neon, Drizzle, Better Auth). Point de contrôle 6 vert avant de continuer.
2. Étape 7 en entier (sauvegarde, nettoyage, installation WordPress, plugins, mu-plugin, champs ACF, contenus de test). Pendant que Pierre fait les actions manuelles OVH, tu peux avancer sur les étapes 9, 11 et 13, qui ne dépendent pas de WordPress.
3. Étapes 8, 10, 12 (codegen, page de contrôle, migrations preview), qui ont besoin de `/graphql` en ligne.
4. Étape 14 : tu exécutes chaque contrôle de la table de definition of done et tu me rends la table avec le résultat réel de chaque ligne (commande lancée, sortie obtenue). Une ligne rouge est un blocage à résoudre, pas une note de bas de page.

## Quand quelque chose échoue

Tu diagnostiques avec la sortie réelle de la commande, tu proposes un correctif, tu l'appliques, tu relances. Tu ne contournes pas un point de contrôle. Si un correctif change une décision d'architecture (version, librairie, hébergement), tu t'arrêtes et tu demandes.

Commence par lire les deux documents, puis résume en dix lignes maximum ce que tu vas faire et les valeurs dont tu as besoin, puis démarre l'étape 1.
