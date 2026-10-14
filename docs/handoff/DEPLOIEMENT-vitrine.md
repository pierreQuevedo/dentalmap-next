# Déploiement de la vitrine (`feat/vitrine`)

Liste à suivre le jour où `feat/vitrine` part en production.

## Avant
- [ ] Fusionner `feat/vitrine` avec la branche de l’espace pro ; conflit attendu sur `src/lib/formation/privee.ts` : garder la correction de relecture des propositions (champs facultatifs à `null`).
- [ ] `pnpm lint`, `npx tsc --noEmit`, `pnpm test` verts.
- [ ] Migration 0018 (tables Emploi et Cessions) : appliquée par `vercel-build` (`db:migrate:deploy`). Vérifier qu’aucune autre migration n’a pris le numéro 0018 entre-temps.

## Au déploiement
- [ ] Publier les six fiches métier, restées en brouillon pour ne pas créer de liens cassés sur l’ancien site (décision du 14 octobre 2026) :

  ```bash
  ssh dentalk@ssh.cluster100.hosting.ovh.net '~/bin/wp --path=$HOME/cms post update 655 657 659 661 663 665 --post_status=publish'
  ```

  Puis revalider le cache du site (webhook `/api/revalidate`, tag `wp:conseil`) si la publication ne le déclenche pas.

## Après
- [ ] Vérifier `/conseils/metiers/` et une fiche, `/emploi/`, `/annonces/cession/`, une fiche dentiste, une page école.
- [ ] Supprimer les routes de démonstration non indexées une fois les vraies données en place : `src/app/(public)/maquettes/article-modulaire/` (premier article à modules saisi), `etablissement-demo/` (premier établissement aux champs détaillés remplis), `formation-privee-demo/` (première formation privée publiée).
- [ ] Supprimer la branche Neon `dev-vitrine` et ses données d’exemple (`demo_…`).
- [ ] Le bloc de chiffres de l’accueil (`HomeStats`) dit encore « hebdomadaire » : à passer en « quotidien » quand le job de synchronisation des registres tournera chaque jour.
