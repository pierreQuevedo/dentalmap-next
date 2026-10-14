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

Le logo d'une formation est le champ `logo` du groupe. Tant qu'il est vide,
le site retombe sur l'ancienne convention : le média de la médiathèque dont
le nom (slug) est `logo-<slug de la fiche>`, par exemple
`logo-faculte-odontologie-lille` pour la fiche `faculte-odontologie-lille`
(`PREFIXE_LOGO` dans `src/lib/wp/queries.ts`). La convention pourra être
retirée du code quand tous les logos auront été reportés dans le champ.

## Saisie du groupe pour les pages d'établissement

Le site lit le groupe dans `src/lib/formation/details.ts` (`lireDetails`).
Sur la page, l'ordre de priorité est, bloc par bloc : ce que l'établissement
revendiqué déclare dans son espace (Neon), puis ces champs, puis le contenu
relevé ; un bloc sans donnée reste masqué. Une ligne illisible est ignorée.

- Voies d'accès : les étapes d'admission, une par ligne,
  « Titre | explication | période », 8 au plus. Exemple :
  `Vous candidatez | Sur Parcoursup pour le BTS. | Janvier à mars`.
- Prérequis : « Ce que l'école attend », un point par ligne.
- Rentrée : texte libre (« Septembre 2027 »), repris dans l'encart du héros
  et sous le titre « Admission ».
- Frais de scolarité : « Libellé | montant | détail », postes séparés par
  « ; ». Exemple : `Équipement de l’élève | Environ 450 € | Trousse et tenue ; Aides | Bourses | Bourses de lycée`.
  La forme « Libellé : 6 990 euros par an » reste comprise.
- Journées portes ouvertes : « date | titre | détail », rendez-vous séparés
  par « ; ». Date au format `JJ/MM/AAAA`. Titre vide : « Journée portes
  ouvertes ». Le détail sert d'horaire. Les dates passées disparaissent.
- Téléphone, courriel, adresse et code postal : contact et adresse quand le
  contenu relevé n'en donne pas.
- Latitude et longitude : position de la carte, prioritaire sur le géocodage.
- Capacité d'accueil : places par promotion d'une école, quand le contenu
  n'en donne pas. Sources : une URL par ligne, ajoutées aux pages consultées.

Une saisie complète d'exemple est rendue sur
`/maquettes/etablissement-demo/` (école) et
`/maquettes/etablissement-demo/?fiche=faculte`, non indexées, à retirer dès
qu'un établissement réel a ses champs remplis.

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

### Salaires

Les salaires affichés sont des minimums, jamais des moyennes : aucune source
officielle ne publie de salaire moyen par métier et par secteur. On saisit
le minimum de la convention collective (cabinets dentaires, IDCC 1619 ;
prothésistes dentaires, IDCC 993) ou, à l'hôpital, le début de la grille
publique, et on cite le texte dans « Source des salaires minimums ».

- Salaire minimum par secteur (`metier_salaires`) : une ligne par secteur,
  « Secteur | montant | montant haut | précision ». Le montant est un nombre
  (le minimum brut mensuel pour un temps plein) ou un texte affiché tel quel,
  par exemple `Honoraires`. Le montant haut est facultatif et donne une
  fourchette (« 1 935 € à 2 293 € »). La précision est facultative et
  s'affiche en petit sous le montant. Exemples :
  `Laboratoire de prothèse | 1935 | 2293 | bac pro à BTS`,
  `Cabinet libéral | Honoraires`, `Centre de santé |`.
  Une ligne vide ou sans montant affiche « Pas de grille de référence ».
  L'ancien format « Secteur | montant » reste lu.
- Les barres sont proportionnelles au montant haut s'il existe, sinon au
  montant ; un texte n'a pas de barre.
- Sous les barres, le site affiche « Brut mensuel pour un temps plein. Ce sont
  les minimums fixés par les conventions collectives ou les grilles
  publiques : un salaire réel peut être plus élevé. », puis
  « Source : » suivi du champ `metier_source_salaires`.
- `metier_salaire_repere` : le minimum affiché sur la carte du hub
  (« 2 113 € brut minimum »).
- Chiffres clés : trois ou quatre lignes, la grille du héros s'adapte.

## Article modulaire

`article-modules.json` : le groupe « Article modulaire », attaché au type
Conseil, pour composer un article des Ressources à partir de la bibliothèque
de modules (Figma, section « Ressources · bibliothèque de modules »). À
importer par ACF → Outils → Importer les groupes de champs. Le groupe est
exposé dans l'API REST (`show_in_rest`) et dans WPGraphQL
(`articleModules`) ; le site le lit par REST, il n'y a pas de codegen à
relancer.

ACF reste en version gratuite, sans contenu flexible ni répéteur. Le groupe a
deux onglets :

- « En-tête et pied » : chapô, relu par, date de relecture, sources, articles
  liés (« À lire aussi »).
- « Sections » : douze emplacements « Section 1 » à « Section 12 ». Chacun a un
  select « Type de module » ; seuls les champs du type choisi s'affichent. Une
  section laissée sur « Aucun », ou dont le champ principal est vide, est
  ignorée : on peut laisser des trous, l'ordre des sections remplies est
  conservé.

Un article sans aucune section remplie garde l'affichage actuel (le contenu de
l'éditeur WordPress). Dès qu'une section est remplie, le site affiche la mise
en page modulaire et n'affiche plus le contenu de l'éditeur. Les fiches de la
rubrique Métiers gardent leur groupe « Fiche métier » : ne pas remplir ce
groupe pour elles.

Le titre, la rubrique, l'image à la une et l'extrait restent les champs
WordPress habituels. Le chapô, s'il est vide, reprend l'extrait ; il sert de
meta description quand celle-ci est vide. La date affichée est la date de
relecture, sinon la date de modification. Le temps de lecture est calculé par
le site, sauf si le champ « temps de lecture » du groupe « Conseil » est
rempli.

### Conventions de saisie

Les listes se saisissent en zone de texte, une ligne par élément, colonnes
séparées par « | » (barre verticale entourée d'espaces). Une ligne à qui il
manque une colonne est ignorée. Au-delà des maxima, les lignes en trop sont
ignorées.

### Exemple par module

**En-tête et pied**

- Chapô : `Avant une couronne ou un bridge, le chirurgien-dentiste vous remet un devis au format réglementaire. Voici comment le lire et le comparer.`
- Relu par : `Dr Camille Rivière, chirurgienne-dentiste`
- Date de relecture : `11/10/2026`
- Sources, une par ligne, « Libellé | adresse » (adresse facultative) :

  ```
  Assurance maladie · Le devis dentaire | https://www.ameli.fr/
  Légifrance · Arrêté fixant le modèle de devis | https://www.legifrance.gouv.fr/
  ```

- À lire aussi : jusqu'à 3 conseils ; vide, les 3 plus récents de la même
  rubrique.

**Texte**

- Intertitre (facultatif, repris au sommaire) : `Ce que le devis doit indiquer`
- Contenu (éditeur visuel, sans titres) : deux ou trois paragraphes, listes,
  liens, gras.

**À retenir** (5 points au maximum ; titre vide : « À retenir »)

```
Le devis est obligatoire avant toute prothèse et suit un modèle réglementaire.
Il doit proposer une alternative du panier 100 % Santé quand elle existe.
Signer un devis n’engage pas à commencer les soins.
```

**Étapes** (« Titre | explication », 6 au maximum, numérotées 01, 02…)

```
Alignez les actes | Vérifiez que les deux devis portent sur les mêmes dents et le même type de prothèse.
Comparez les matériaux | Céramique, zircone ou métal : le matériau change le prix et l’aspect.
```

**Encadré**

- Ton : Information, Conseil (vert) ou Attention
- Titre : `Le panier 100 % Santé`
- Texte : `Il concerne les patients couverts par un contrat de complémentaire santé responsable, soit la grande majorité des contrats.`

**Chiffres clés** (« valeur | libellé », 2 à 4 lignes ; empilés en mobile)

```
3 | paniers de soins : 100 % Santé, tarifs maîtrisés, tarifs libres
0 € | de reste à charge sur le panier 100 % Santé
```

Source (facultatif) : `Assurance maladie, ameli.fr`

**Comparatif** (première ligne : les en-têtes ; 4 colonnes au maximum ; la
première colonne est l'intitulé de la rangée)

```
Panier | Reste à charge | Choix des matériaux
100 % Santé | Aucun | Encadré par la réglementation
Tarifs libres | Libre | Libre
```

Note (facultatif) : texte sous le tableau.

**Questions fréquentes** (« Question | réponse », 8 au maximum ; titre vide :
« Questions fréquentes » ; le site génère le balisage FAQPage)

```
Le devis est-il payant ? | Le devis lui-même ne peut pas vous être facturé.
```

**Citation**

- Citation, sans guillemets : `Un bon devis se lit en cinq minutes.`
- Auteur : `Dr Camille Rivière` ; fonction (facultatif) :
  `Chirurgienne-dentiste à Bordeaux` ; photo (facultatif, sinon les initiales).

**Image**

- Image de la médiathèque, avec son texte alternatif renseigné.
- Légende et crédit facultatifs ; format Large (16:9) ou Portrait (4:5,
  centré).

**Appel à l'action**

- Destination : Rechercher un praticien, Revendiquer sa fiche, ou Lien libre.
- Titre : vide, il est prérempli selon la destination (obligatoire pour un
  lien libre). Texte facultatif.
- Lien libre seulement : adresse (`https://…` ou chemin du site comme
  `/formation/`) et libellé du bouton.

### Saisie par script ou par IA

Le groupe se remplit aussi par l'API REST (mot de passe d'application) :
`POST /wp-json/wp/v2/conseil/<id>` avec un corps `{"acf": {...}}`. Les noms de
champs : `article_chapo`, `article_relu_par`, `article_date_relecture`
(`AAAAMMJJ`), `article_sources`, `article_lies` (identifiants), puis
`section_1` à `section_12`, chacun un objet `{"type": "...", ...}` avec, selon
le type : `titre`, `contenu` (texte), `points` (a_retenir), `etapes`, `ton` et
`texte` (encadre), `chiffres` et `source`, `tableau` et `note` (comparatif),
`questions`, `citation`, `auteur`, `fonction`, `photo` (identifiant de média),
`image`, `legende`, `credit`, `format` (`large` ou `portrait`), `destination`
(`recherche`, `revendiquer`, `lien`), `lien_url`, `lien_libelle`. Types :
`aucun`, `texte`, `a_retenir`, `etapes`, `encadre`, `chiffres`,
`comparatif`, `questions`, `citation`, `image`, `appel`. Une saisie complète
d'exemple est dans
`src/app/(public)/maquettes/article-modulaire/_donnees.ts`, rendue sur
`/maquettes/article-modulaire/` (non indexée, à retirer après l'import).
