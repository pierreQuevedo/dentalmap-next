# Groupes de champs ACF

`formation-details.json` : le groupe « Formation, informations détaillées »,
attaché au type de contenu Formation. À importer dans WordPress par
ACF → Outils → Importer les groupes de champs. Il complète le groupe
« Formation » d'origine (famille, ville, département, diplôme, durée, site
web) sans le remplacer.

Le groupe est exposé dans l'API REST et dans WPGraphQL sous le nom
`formationDetails`. Après import, mettre à jour le schéma versionné du site :
`pnpm schema:pull` puis `pnpm codegen`.

ACF est en version gratuite : pas de répéteur. Les diplômes sont donc saisis
en zone de texte, un par ligne, « Intitulé | durée | modalité », et le site
les découpe.

## Logo des établissements

Tant que le groupe n'est pas importé, le logo d'une formation est le média de
la médiathèque dont le nom (slug) est `logo-<slug de la fiche>`, par exemple
`logo-faculte-odontologie-lille` pour la fiche `faculte-odontologie-lille`.
Le site le lit par ce nom (`PREFIXE_LOGO` dans `src/lib/wp/queries.ts`).
Une fois le champ `logo` du groupe importé, remplir le champ et retirer la
convention de nommage du code.

## Fiche métier

`fiche-metier.json` : le groupe « Fiche métier », attaché au type Conseil,
pour la rubrique Métiers des Ressources (`/conseils/metiers/`). À importer par
ACF → Outils → Importer les groupes de champs. Le groupe est exposé dans
l'API REST (`show_in_rest`) : le site lit ces champs par REST, il n'y a pas de
codegen à relancer.

Deux réglages à faire à la main dans WordPress :

1. Dans le groupe « Conseil », ajouter au champ select « Catégorie » le choix
   `metiers : Métiers`.
2. Pour chaque fiche, choisir la catégorie « Métiers », mettre une image à la
   une (photo de la carte et du héros), un extrait, puis remplir le groupe.

Le contenu des six premières fiches est prêt dans
`docs/acf/contenu-metiers.json` ; le script `scripts/wp-fiches-metier.mjs`
les crée en brouillon par l'API REST (mot de passe d'application
`WP_APP_USER`, `WP_APP_PASSWORD`), à relire puis publier dans WordPress.
