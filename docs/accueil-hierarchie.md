# DentalMap v2 : hiérarchie de la page d'accueil

Document de référence pour `src/app/(public)/page.tsx` et les composants de `src/components/accueil/`. Rédigé le 16 septembre 2026. Il prolonge `navigation-hierarchie.md` (les liens) et `header-footer-style-airbnb.md` (les jetons, les gouttières, la pill de recherche) : ici on décide de l'ordre des sections, de ce que chacune démontre, et de la forme visuelle qui le démontre le mieux.

La page d'accueil actuelle est un squelette honnête : un titre, deux compteurs, un manifeste. Elle dit vrai mais elle ne fait rien. Ce document décrit la version qui convertit.

## 1. Principes

| Principe | Application |
|---|---|
| Une page d'accueil d'annuaire sert à partir, pas à rester | La recherche est au-dessus de la ligne de flottaison, utilisable au clavier, sans JavaScript client autre que le champ lui-même |
| La preuve avant l'argument | Les chiffres réels (fiches, communes, date de synchronisation) arrivent avant toute phrase de promesse. Un annuaire vide qui promet la fiabilité ne convainc personne |
| La neutralité est un produit, pas une mention légale | Le manifeste "ce que DentalMap ne fait pas" est une section à part entière, traitée typographiquement, pas une ligne en pied de page |
| Deux publics, deux chemins, jamais mélangés | Patient : chercher. Praticien : revendiquer. Un seul groupe de CTA par section, avec une hiérarchie primaire/secondaire visible |
| Pas de mise en avant payante, y compris ici | Aucune fiche praticien nommée sur l'accueil. On met en avant des villes et des départements, jamais des personnes |
| Le mouvement sert la compréhension | Une animation qui n'explique rien est supprimée. `prefers-reduced-motion` coupe tout, et la page reste complète sans une seule transition |
| Budget | LCP < 1,8 s sur 4G, CLS 0, moins de 40 ko de JS client au-dessus de la ligne de flottaison |

## 2. La hiérarchie en un tableau

Onze blocs, dans cet ordre. La colonne "poids" indique la hauteur cible en viewport (1 vh = un écran de 900 px).

| # | Section | Ce qu'elle démontre | Source | Cache | Poids |
|---|---|---|---|---|---|
| 0 | Header + pill de recherche | (existant, `header-footer-style-airbnb.md`) | statique | - | 0,1 |
| 1 | Hero cartographique | "Je trouve un praticien près de moi en trois secondes" | Neon (totaux) | `listing` / `annuaire` | 0,8 |
| 2 | Bandeau de sources | "Les données viennent des registres officiels, et elles sont fraîches" | Neon (`sync_runs`) | `listing` / `annuaire` | 0,1 |
| 3 | Les deux annuaires | "Il y a deux métiers ici, et je sais lequel me concerne" | Neon (totaux) | `listing` / `annuaire` | 0,5 |
| 4 | Carrousel des grandes villes | "Ma ville y est" | Neon (`getAccesRapide(18)`) | `listing` / `annuaire` | 0,6 |
| 5 | La méthode en trois temps | "Je comprends d'où sort une fiche" | statique | - | 1,2 |
| 6 | Manifeste de neutralité | "Ce site ne me vend rien" | statique | - | 0,5 |
| 7 | Conseils récents | "Le site est vivant et utile au-delà de l'annuaire" | WordPress | `editorial` / `wp:conseil` | 0,6 |
| 8 | Annonces et formation | "Il y a un écosystème professionnel derrière" | WordPress | `editorial` / `wp:annonce`, `wp:formation` | 0,5 |
| 9 | Bandeau espace pro | "Je suis praticien, je reprends la main sur ma fiche" | statique + session | - | 0,4 |
| 10 | FAQ condensée | Lever les trois objections restantes, nourrir le `FAQPage` | WordPress (CPT faq) | `editorial` / `wp:faq` | 0,5 |
| 11 | Pied de page à onglets | (existant) | mixte | - | 0,6 |

Total : environ 6,4 écrans. C'est long pour une accueil, court pour une accueil qui doit convaincre deux publics et justifier sa neutralité. Le point de bascule est la section 5 : au-delà, on ne lit plus que par curiosité, donc rien de vital n'y est enfermé.

## 3. Section par section

### 3.1 Hero cartographique

**Rôle.** Poser la promesse en une phrase, offrir le champ de recherche, et montrer immédiatement l'échelle de la base.

**Contenu.**

| Élément | Texte ou donnée |
|---|---|
| H1 | Trouvez un chirurgien-dentiste vérifié près de chez vous |
| Sous-titre | 41 000 praticiens et 2 800 laboratoires, construits à partir des registres publics, sans mise en avant payante |
| Champ | Réutilise `ChampLieu` de `src/components/map/champ-lieu.tsx`, en version large : "Votre ville ou votre code postal" + bouton rond anthracite |
| Sélecteur | Deux pastilles au-dessus du champ : Chirurgien-dentiste (par défaut) / Prothésiste dentaire |
| Raccourci | "Autour de moi" avec l'icône de géolocalisation, déclenche `navigator.geolocation` puis `/recherche?lat=&lng=` |
| Groupe CTA | Aucun bouton en plus du bouton de recherche. Le hero n'a qu'une action |

**Idées d'illustration.**

1. **Carte à points (recommandée).** Fond du hero : une carte de France en projection Lambert 93, dessinée en SVG, où chaque commune ayant au moins un praticien est un point de 2 px en `--color-geo` à 35 % d'opacité. Générée une fois au build par un script `scripts/design/carte-points.ts` qui lit `communes` et sort un SVG statique de moins de 60 ko. Avantage : c'est littéralement la donnée du produit, pas une illustration de banque d'images. Le point de la commune détectée par géolocalisation s'allume en `--color-action` avec un halo qui pulse une seule fois.
2. **Dégradé de profondeur.** Le SVG est masqué par un `ProgressiveBlur` (déjà présent dans `src/components/motion-primitives/progressive-blur.tsx`) sur les 30 % inférieurs, pour que le texte du sous-titre reste lisible sans caisson opaque.
3. **Spotlight au curseur.** `src/components/motion-primitives/spotlight.tsx` sur la carte, rayon 240 px, révèle les points à pleine opacité sous la souris. Désactivé sous 950 px et sous `prefers-reduced-motion`.
4. **Variante sobre**, si la carte est jugée trop chargée : fond `--color-bg`, une seule ligne de contour de la France en trait de 1 px, et les chiffres en très grande capitale tabulaire à droite du champ.

**À ne pas faire.** Pas de photo de cabinet dentaire souriante, pas de dent en 3D, pas de stock photo de blouse blanche. L'imagerie dentaire générique est le signal visuel le plus rapide pour dire "site de génération de leads".

### 3.2 Bandeau de sources

**Rôle.** Convertir la promesse du hero en preuve vérifiable, tout de suite, avant que l'utilisateur ne scrolle.

**Contenu.** Une seule ligne, hauteur 72 px, fond `--color-bg-soft`, séparée par un filet haut et bas.

`Données issues de l'Annuaire Santé (RPPS, ADELI) et du répertoire Sirene (INSEE) · Dernière synchronisation le 14 septembre 2026 · [Notre méthode de vérification →]`

La date vient du dernier `sync_runs` terminé, lue en `use cache` avec le tag `annuaire`, comme dans le pied de page. Le lien pointe vers `/methode-de-verification/`.

**Idées d'illustration.**

1. **Deux badges de source** identiques à ceux de la barre basse du footer : "ANS · RPPS" et "INSEE · Sirene", pastilles à bordure fine, `title` portant la date. La répétition accueil/footer est voulue, c'est une signature.
2. **Point de fraîcheur.** Une pastille de 6 px en `--color-verified` devant la date, avec un `animate-pulse` très lent (3 s) si la synchro date de moins de 8 jours, en `--color-fg-2` fixe au-delà. L'information est honnête dans les deux cas.
3. **Bandeau défilant à éviter.** Le ticker de logos institutionnels est tentant, mais aucun partenariat n'est signé : afficher des logos ANS ou INSEE laisserait croire à un adossement officiel. Texte seul.

### 3.3 Les deux annuaires

**Rôle.** Orienter en une seconde vers la bonne branche, et afficher les compteurs réels.

**Contenu.** Deux cartes de même poids, côte à côte au-delà de 744 px, empilées en dessous. C'est l'évolution du composant `Chiffres` déjà en place.

| Carte | Titre | Chiffres | CTA | Sous-lien |
|---|---|---|---|---|
| Gauche | Chirurgiens-dentistes | total de fiches, nombre de communes | Parcourir l'annuaire `/dentistes/` | Par département `/dentistes/#departements` |
| Droite | Laboratoires de prothèse | idem | Parcourir les laboratoires `/prothesistes/` | Par département `/prothesistes/#departements` |

**Idées d'illustration.**

1. **Bento à deux tuiles, sans gouttière** (style `gpt-taste`) : les deux cartes se touchent, séparées par un filet de 1 px, l'ensemble dans un conteneur à rayon 20 px. Plus solide qu'un duo de cartes flottantes.
2. **Compteur animé au premier passage** : `IntersectionObserver` + interpolation sur 900 ms, en `tabular-nums` pour éviter tout décalage de largeur. Coupé sous `prefers-reduced-motion`, la valeur finale s'affiche directement.
3. **Micro-carte par tuile** : la même carte à points que le hero, réduite à 120 px de haut, filtrée sur la profession de la tuile. On voit d'un coup d'œil que les dentistes couvrent tout le territoire et que les laboratoires sont concentrés en zones urbaines. C'est une vraie information, pas une décoration.
4. **Survol** : la tuile prend `--color-bg-soft` et le CTA passe de lien souligné à pastille pleine. Transition 160 ms, `ease-out`.

### 3.4 Carrousel des grandes villes

**Rôle.** Donner un point d'entrée immédiat aux 30 % d'utilisateurs qui n'écriront jamais dans un champ de recherche, et couvrir les requêtes de tête en maillage interne.

**Contenu.** Dix-huit villes, `getAccesRapide(18)`, chacune vers `/dentistes/{departement}/{commune}/`, avec le nombre de fiches.

**Idées d'illustration.**

1. **Carrousel à défilement libre façon Apple (recommandé).** C'est le patron des pages produit Apple : une bande horizontale de cartes qui déborde volontairement à droite, `scroll-snap-type: x mandatory` avec `scroll-snap-align: start`, deux boutons ronds à flèches en haut à droite de la section, et une barre de progression fine sous la bande. Le débordement à droite est la clé : on doit voir une carte coupée au bord de l'écran, sinon rien ne dit que ça défile.

   ```
   ┌──────────────────────────────────────────────────────────┐
   │  Trouvez un dentiste dans votre ville      ( ← ) ( → )   │
   │                                                          │
   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌─────     │
   │  │ Paris  │ │Marseille│ │  Lyon  │ │Toulouse│ │ Nice    │
   │  │ 4 812  │ │ 1 104  │ │ 1 356  │ │  892   │ │  6...   │
   │  │ fiches │ │ fiches │ │ fiches │ │ fiches │ │         │
   │  └────────┘ └────────┘ └────────┘ └────────┘ └─────     │
   │  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │
   └──────────────────────────────────────────────────────────┘
   ```

   Implémentation : CSS pur pour le défilement et le snap, une quarantaine de lignes de JavaScript client seulement pour l'état des flèches et la barre de progression (`scrollLeft / (scrollWidth - clientWidth)`). Pas de librairie de carrousel. Les cartes restent des `<a>` dans un conteneur `role="region"` avec `aria-label`, navigable au clavier : `Tab` fait défiler naturellement grâce au scroll d'ancrage natif.

2. **Contenu de la carte** : 200 x 260 px, rayon 16 px, un aplat de `--color-geo` à faible opacité, le nom de la ville en 20 px semi-gras, le compteur en dessous, et en fond la silhouette du contour communal réel (GeoJSON déjà présent pour la carte de recherche, simplifié à 40 points). Chaque ville a donc une forme unique : c'est du caractère gratuit, et personne d'autre ne peut le copier sans la donnée.
3. **Variante grille**, si le carrousel est jugé risqué en accessibilité : grille de 18 pastilles texte sur trois lignes, style pied de page Airbnb, avec "Afficher plus" pour passer à 60. Moins spectaculaire, plus rapide, meilleure en SEO. Le carrousel et la grille peuvent coexister : carrousel au-delà de 950 px, grille en dessous.
4. **Onglets au-dessus du carrousel** : Chirurgiens-dentistes / Prothésistes / Par région. Trois panneaux, le même composant. C'est exactement le bloc d'exploration du pied de page, remonté en haut de page, et ça justifie d'alléger le footer.

### 3.5 La méthode en trois temps

**Rôle.** La section qui fait la différence avec les annuaires concurrents. Expliquer qu'une fiche n'est pas déclarative.

**Contenu.**

| Temps | Titre | Texte |
|---|---|---|
| 1 | On part des registres | Chaque praticien provient du Répertoire partagé des professionnels de santé ou du répertoire Sirene. Personne ne s'inscrit sur DentalMap |
| 2 | On recoupe et on géolocalise | Adresses normalisées par la Base Adresse Nationale, doublons fusionnés, communes rattachées au Code officiel géographique |
| 3 | Le praticien complète, sans jamais contredire | Un praticien peut revendiquer sa fiche et ajouter horaires, langues, accessibilité. Il ne peut modifier ni son identité ni son numéro RPPS, qui restent ceux du registre |

Puis un groupe CTA à deux boutons : `[Lire la méthode complète]` (primaire, vers `/methode-de-verification/`) et `[Revendiquer ma fiche]` (secondaire, contour, vers `/espace-pro/revendiquer/`).

**Idées d'illustration.**

1. **Scrollytelling à colonne épinglée (recommandé).** Deux colonnes au-delà de 1128 px. À gauche, les trois temps qui défilent normalement. À droite, une colonne `position: sticky` qui montre la même fiche praticien se construire : d'abord le nom et le RPPS bruts sortis du registre, puis l'adresse qui se normalise et le point qui se pose sur une mini-carte, puis les horaires et le badge "Fiche complétée par le praticien" qui apparaissent. Un `IntersectionObserver` sur les trois temps pilote l'état. C'est le pattern des pages Stripe et Linear, et il est ici justifié : on montre la transformation de la donnée, ce qu'aucun texte ne fait aussi bien.
2. **Repli mobile** : sous 1128 px, la colonne épinglée disparaît et chaque temps porte sa propre illustration statique, empilée sous son texte. Pas de sticky sur mobile, jamais.
3. **Alternative légère** : trois cartes numérotées en ligne, avec un filet qui les relie et une flèche entre chacune. Cinq minutes d'implémentation, 0 ko de JavaScript, et la compréhension est déjà là. À retenir si le budget de la phase est tendu.
4. **Détail qui vend** : dans la fiche de démonstration, afficher un vrai numéro RPPS partiellement masqué (`10 1234 5678`) et le badge `Verification` déjà écrit dans `src/components/annuaire/primitives.tsx`. On réutilise le composant réel, donc la démonstration ne pourra jamais diverger du produit.

### 3.6 Manifeste de neutralité

**Rôle.** Nommer ce que le modèle économique interdit. C'est la section la plus partagée d'un site de ce type, et la plus citée.

**Contenu.** Les trois lignes déjà écrites dans la page actuelle, qui sont bonnes et qu'on ne change pas :

- Aucune mise en avant payante. Le classement est alphabétique ou par distance, rien d'autre.
- Aucun avis, aucune note. Un annuaire de professionnels de santé n'est pas un site d'avis.
- Aucune information déclarative présentée comme officielle.

**Idées d'illustration.**

1. **Traitement éditorial pleine largeur.** Fond `--color-fg` (ardoise profonde), texte `--color-bg`. C'est la seule section sombre de la page en thème clair, et la seule claire en thème sombre. L'inversion vaut tous les encadrés.
2. **Typographie comme illustration.** Chaque ligne commence par "Aucun" ou "Aucune" en 40 px semi-gras, la suite en 20 px à 70 % d'opacité. L'anaphore fait le travail graphique, aucune icône n'est nécessaire.
3. **À proscrire absolument** : les icônes de coche verte, de bouclier ou de cadenas. Elles transforment un engagement en argument marketing et produisent l'effet inverse.
4. **Micro-détail** : un lien discret en bas de section, "Comment DentalMap se finance", vers la section correspondante de `/a-propos/`. Une promesse de gratuité sans explication du modèle éveille la méfiance.

### 3.7 Conseils récents

**Rôle.** Montrer que le site est tenu, et capter la recherche informationnelle.

**Contenu.** `getConseilsRecents(3)`, déjà écrit dans `src/lib/wp/queries.ts`. Trois cartes : catégorie, titre, date, temps de lecture, image mise en avant. Lien "Tous les conseils" en tête de section, aligné à droite du titre.

**Idées d'illustration.**

1. **Grille asymétrique** : la première carte occupe deux colonnes sur six avec son image en 16:9, les deux suivantes sont en liste texte à droite, séparées par un filet. Plus éditorial qu'une grille de trois cartes identiques, et ça hiérarchise vraiment.
2. **Image** : `next/image` avec `sizes` correct et un `placeholder="blur"` généré côté WordPress. Si l'article n'a pas d'image, aplat de `--color-bg-soft` avec l'initiale de la catégorie en très grand, découpée par le rayon de la carte. Jamais de placeholder gris vide.
3. **Pastille de catégorie** : Patients / Praticiens / Prothésistes, en capitales 11 px espacées, `--color-fg-2`. Trois publics visibles d'un coup d'œil.
4. **Chargement** : `Suspense` avec un squelette de même géométrie exacte que le contenu final, comme `SqueletteChiffres` le fait déjà. CLS à zéro, c'est non négociable sur une section aussi basse.

### 3.8 Annonces et formation

**Rôle.** Signaler les deux autres pans du site sans leur donner le poids d'une section pleine.

**Contenu.** Un bento à deux tuiles inégales.

| Tuile | Largeur | Contenu |
|---|---|---|
| Annonces | 2/3 | Les 4 dernières annonces en liste compacte : type en pastille, titre, département, date. CTA "Toutes les annonces" |
| Formation | 1/3 | Les trois types (écoles de prothèse, facultés d'odontologie, formations privées) avec le nombre d'établissements. CTA "Voir la formation" |

**Idées d'illustration.**

1. **Liste dense plutôt que cartes.** Les annonces sont du texte utile et daté : quatre lignes bien composées valent mieux que quatre cartes à image. C'est aussi ce que fait le marché de l'emploi qui fonctionne.
2. **Code couleur des types** par la pastille uniquement (cession, collaboration, remplacement, emploi), en variations d'opacité d'une seule teinte, pas quatre couleurs différentes.
3. **Carte de la formation** : liste des trois types avec un compteur aligné à droite en `tabular-nums`, et en fond un aplat `--color-bg-soft`. Sobre, c'est une section de navigation, pas une vitrine.

### 3.9 Bandeau espace pro

**Rôle.** Le seul endroit de la page qui s'adresse frontalement au praticien, et le point de conversion du modèle.

**Contenu.**

Titre : Vous êtes chirurgien-dentiste ou prothésiste ?
Texte : Votre fiche existe déjà, construite depuis les registres. Revendiquez-la pour ajouter vos horaires, vos langues parlées et les informations d'accessibilité de votre cabinet. C'est gratuit et ça le restera.

**Groupe CTA à trois niveaux**, dans cet ordre de poids décroissant :

| Rang | Libellé | Style | Cible |
|---|---|---|---|
| Primaire | Revendiquer ma fiche | pastille pleine `--color-action`, 48 px de haut | `/espace-pro/revendiquer/` |
| Secondaire | Créer un compte | pastille à contour `--color-line-strong` | `/connexion?mode=inscription` |
| Tertiaire | Comment ça marche pour les praticiens | lien souligné `--color-fg-2` | `/faq#praticiens` |

Le bloc est un composant serveur ; seul l'état de session est isolé dans un enfant client sous `Suspense`, exactement comme `UserMenu`. Si une session pro est active, le bandeau change : "Bonjour, votre fiche est complétée à 60 %" avec un CTA "Compléter ma fiche".

**Idées d'illustration.**

1. **Bandeau à fond `--color-bg-soft` bordé haut et bas**, pleine largeur, contenu contraint à 1128 px. Il tranche avec les sections précédentes sans repartir sur du sombre, qui est déjà pris par le manifeste.
2. **Aperçu de fiche en perspective légère** à droite : la fiche réelle rendue par le composant `ApercuFiche`, inclinée de 6 degrés en `rotateY` avec une ombre `--shadow-pop`, et un curseur qui vient cliquer sur "Revendiquer" en boucle lente. Utilise `src/components/motion-primitives/cursor.tsx`, déjà présent. Coupé sous `prefers-reduced-motion` et sous 950 px.
3. **Barre de complétude** : dans la version connectée, une barre fine qui s'anime de 0 à 60 % à l'entrée en vue. Une barre de progression non pleine est le plus vieux moteur de complétion qui existe, et il fonctionne encore.
4. **À éviter** : la photo de dentiste en blouse qui sourit à la caméra. Voir 3.1.

### 3.10 FAQ condensée

**Rôle.** Absorber les trois objections qui restent après tout le reste, et produire le JSON-LD `FAQPage` de l'accueil.

**Contenu.** Cinq questions, accordéon, une seule ouverte à la fois, la première ouverte par défaut :

- DentalMap est-il gratuit pour les patients ?
- D'où viennent les informations de ma fiche ?
- Comment demander la correction d'une erreur ?
- Peut-on payer pour apparaître en premier ?
- Les avis de patients sont-ils affichés ?

**Idées d'illustration.**

1. **Accordéon à deux colonnes** : questions à gauche sur 40 % de la largeur, réponse affichée à droite sur 60 %, au-delà de 1128 px. Au-dessous, accordéon classique empilé. Le composant `Disclosure` existe déjà dans `src/components/motion-primitives/disclosure.tsx`.
2. **Les réponses sont dans le DOM au premier rendu**, masquées par la hauteur et non par `display: none` conditionné à un état client, pour rester lisibles par les moteurs et cohérentes avec le `FAQPage`.
3. **Fin de section** : une seule ligne, "Vous n'avez pas trouvé ? [Écrivez-nous]", vers `/contact/`. Pas de formulaire embarqué sur l'accueil.

## 4. Ce qu'on ne met pas sur l'accueil

| Élément écarté | Raison |
|---|---|
| Témoignages de patients | Le site n'affiche pas d'avis. En afficher sur l'accueil contredirait le manifeste dans le même écran |
| Logos partenaires | Aucun accord signé (`navigation-hierarchie.md`, section 4) |
| Praticiens mis en avant | Interdit par l'architecture, y compris sous forme de "fiches récemment complétées" |
| Compteur de visites ou de recherches | Vanité, non vérifiable, et sans valeur pour l'utilisateur |
| Newsletter en pop-in | Si une inscription doit exister, elle vit dans le pied de page, jamais en interruption |
| Bandeau cookies décoratif | Le consentement est un composant à part, il n'entre pas dans cette hiérarchie |

## 5. Comportements transverses

| Sujet | Règle |
|---|---|
| Rendu | Sections 1, 2, 3, 5, 6, 9 en composant serveur pur. Sections 4, 7, 8, 10 sous `Suspense` avec squelette de géométrie identique |
| Cache | Chaque accès données passe par une fonction `'use cache'` avec `cacheLife` et `cacheTag`, profils `listing` pour Neon et `editorial` pour WordPress |
| JavaScript client | Champ de recherche, flèches du carrousel, observateur de la colonne épinglée, accordéon, compteurs animés. Rien d'autre. Chaque composant client est une feuille, jamais un conteneur de section |
| Mouvement | Entrées en vue : translation de 12 px et opacité, 240 ms, `cubic-bezier(.2,.8,.2,1)`, décalage de 60 ms entre éléments frères, maximum trois éléments décalés. `prefers-reduced-motion: reduce` supprime translations et décalages, garde les changements d'opacité instantanés |
| Accélération | Les éléments animés en continu (curseur, spotlight, halo) sur `transform` et `opacity` uniquement, avec `will-change` posé à l'entrée en vue et retiré ensuite |
| Thème | Toutes les sections testées en clair et en sombre. Le manifeste (3.6) est le seul bloc dont les couleurs s'inversent explicitement entre les deux thèmes |
| Gouttières | Les trois paliers Airbnb : 80 px au-delà de 1128, 40 px entre 744 et 1127, 24 px en dessous |
| Rythme vertical | 96 px entre sections au-delà de 1128 px, 64 px entre 744 et 1127, 48 px en dessous. Les sections à fond plein (3.6, 3.9) ont 72 px de padding interne haut et bas |
| SEO | Un seul `h1` (section 1). Chaque section ouvre sur un `h2`. JSON-LD `Organization` (déjà en place) plus `FAQPage` alimenté par la section 10, `WebSite` avec `SearchAction` pointant sur `/recherche?q={search_term_string}` |
| Maillage | L'accueil doit sortir au minimum 40 liens internes : 18 villes, 2 annuaires, 3 conseils, 4 annonces, 3 types de formation, plus les pages méthode, FAQ, contact et espace pro |

## 6. Composants à créer

```
src/components/accueil/
  hero.tsx                 serveur : H1, sous-titre, <ChampLieuLarge/>, <CartePoints/>
  carte-points.tsx         serveur : SVG statique généré au build, props profession
  bandeau-sources.tsx      serveur async : dernier sync_runs, badges
  deux-annuaires.tsx       serveur async : bento 2 tuiles, compteurs
  carrousel-villes.tsx     client : scroll-snap, flèches, barre de progression
  methode-trois-temps.tsx  client : colonne épinglée + IntersectionObserver
  manifeste.tsx            serveur : section inversée, anaphore
  conseils-recents.tsx     serveur async : grille asymétrique
  annonces-formation.tsx   serveur async : bento inégal
  bandeau-pro.tsx          serveur : texte + groupe CTA, <EtatSession/> sous Suspense
  faq-accueil.tsx          client : accordéon deux colonnes, JSON-LD FAQPage
  compteur.tsx             client : interpolation à l'entrée en vue, tabular-nums
scripts/design/carte-points.ts   génère public/carte-points-{profession}.svg
```

## 7. Ordre d'implémentation conseillé

| Lot | Contenu | Pourquoi ce lot |
|---|---|---|
| 1 | Sections 1 (variante sobre), 2, 3, 6 | La page devient utile et crédible avec quatre sections et zéro dépendance nouvelle |
| 2 | Sections 4 (carrousel) et 9 (bandeau pro) | Les deux moteurs de conversion, patient et praticien |
| 3 | Sections 7, 8, 10 | Dépendent de contenus WordPress réels, donc après que le CMS soit alimenté |
| 4 | Carte à points, colonne épinglée de la section 5, curseur du bandeau pro | Les trois illustrations coûteuses, ajoutées une fois la structure figée |

Ne pas commencer par le lot 4. Une carte à points magnifique posée sur une hiérarchie non validée se jette.

## 8. Contrôles avant mise en production

| Contrôle | Attendu |
|---|---|
| `pnpm check:nav` | Tous les liens de l'accueil répondent en 200, aucune redirection |
| Lighthouse mobile | Performance supérieure à 90, LCP inférieur à 1,8 s, CLS égal à 0 |
| JavaScript au-dessus de la ligne de flottaison | Moins de 40 ko compressés, mesuré dans l'onglet Coverage |
| Navigation clavier | Parcours complet du haut au bas sans piège, carrousel atteignable et défilant au `Tab`, accordéon au `Entrée` et aux flèches |
| `prefers-reduced-motion: reduce` | Aucune translation, aucun défilement automatique, aucun curseur animé, page intégralement lisible |
| Thème sombre | Capture des onze sections, aucun contraste sous 4,5:1 vérifié par `pnpm design:contraste` |
| Sans JavaScript | Les sections 1, 2, 3, 5 (variante statique), 6, 9 restent lisibles et cliquables |
| Rich Results Test | `Organization`, `WebSite` avec `SearchAction` et `FAQPage` valides, sans avertissement |
| Grep de neutralité | Aucun nom de praticien, aucun mot "sponsorisé", "premium" ou "à la une" dans `src/components/accueil/` |
