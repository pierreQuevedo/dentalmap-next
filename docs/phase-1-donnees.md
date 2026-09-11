# DentalMap v2, phase 1 : données et synchronisation

Plan d'exécution de la phase 1. Rédigé le 11 septembre 2026, après la clôture de la phase 0.

Critère de sortie fixé par l'architecture : les praticiens sont en base avec leur position, le taux de géocodage dépasse 97 %, aucun doublon RPPS.

Tous les chiffres de ce document ont été mesurés sur les fichiers réels le 11 septembre 2026, pas estimés. Les commandes de mesure sont reproductibles.

## 1. Ce que disent les sources, vérifié

### 1.1 Annuaire Santé (ANS), pour les chirurgiens-dentistes

Fichier `PS_LibreAcces_Personne_activite`, publié sur data.gouv.fr par l'Agence du Numérique en Santé.

| Mesure | Valeur relevée |
|---|---|
| Taille du fichier | 818 809 947 octets, soit 781 Mo |
| Lignes | 2 283 651, toutes professions confondues |
| Format | texte, séparateur barre verticale, 55 colonnes, une ligne par activité |
| Lignes de code profession 40, Chirurgien-Dentiste | 75 218 |
| Praticiens distincts (identification nationale PP) | **64 398** |
| Praticiens avec au moins une adresse exploitable | **49 155** |
| Praticiens sans aucune adresse | **15 243**, soit 23,7 % |
| Praticiens en mode d'exercice libéral | 44 345 |
| Communes distinctes touchées | 5 668 |
| Lignes portant un téléphone | 18 251, soit 24 % |
| Lignes portant un SIRET | 36 304 |
| Type d'identifiant | toujours 8, c'est à dire RPPS |

Répartition du nombre d'activités par praticien : 55 151 en ont une seule, 7 883 en ont deux, 1 183 en ont trois, 181 en ont quatre à six. La table `lieux_exercice` doit donc bien accepter plusieurs lignes par praticien, comme prévu.

Colonnes utiles, en numérotation à partir de 1 :

| N° | Colonne | Usage |
|---|---|---|
| 3 | Identification nationale PP | clé primaire `praticiens.id`, forme « 8 » suivi du RPPS |
| 8, 9 | Nom et prénom d'exercice | `nom`, `prenom` |
| 10 | Code profession | filtre, 40 pour les dentistes |
| 18 | Code mode exercice | L libéral, S salarié, B bénévole |
| 20, 21 | SIRET et SIREN site | `siret`, `siren` |
| 25 | Raison sociale site | `raison_sociale` |
| 29 à 33 | Numéro, indice, type et libellé de voie | composition de `adresse_ligne` |
| 36 | Code postal | `code_postal` |
| 37 | Code commune | `code_insee`, présent sur 54 281 lignes seulement |
| 41 | Téléphone | `telephone_officiel` |

La colonne 45, « Code Département (structure) », est **vide sur toutes les lignes**. Le département doit être dérivé du code commune, pas lu dans le fichier. C'est un écart avec ce que laisse supposer l'intitulé des colonnes.

### 1.2 Référentiel géographique

L'architecture prévoyait de parser les fichiers du Code officiel géographique de l'INSEE. Ce n'est pas nécessaire : `geo.api.gouv.fr` expose directement tout ce dont les trois tables ont besoin, centroïde compris.

| Appel | Résultat |
|---|---|
| `GET /regions` | 18 régions |
| `GET /departements?fields=nom,code,codeRegion` | 101 départements |
| `GET /communes?fields=nom,code,codesPostaux,codeDepartement,codeRegion,population,centre` | 34 969 communes, avec `centre` en GeoJSON Point et `population` |

Une commune revient par exemple ainsi :

```json
{
  "nom": "Bordeaux", "code": "33063",
  "codesPostaux": ["33000","33100","33200","33300","33800"],
  "codeDepartement": "33", "codeRegion": "75",
  "population": 267991,
  "centre": { "type": "Point", "coordinates": [-0.5848, 44.8624] }
}
```

Cela remplit `regions`, `departements` et `communes` en trois requêtes, sans téléchargement de fichier. Le `centre` alimente directement la colonne `point4326`, et sert de repli de géocodage.

### 1.3 Géocodage, API Adresse (BAN)

Mesuré sur un lot de 1 000 adresses réelles de dentistes, endpoint `POST /search/csv/` :

| Mesure | Valeur |
|---|---|
| Durée | 8 secondes pour 1 000 adresses |
| Lignes avec coordonnées | 950 sur 1 000, soit 95 % |
| Score supérieur ou égal à 0,6 | 928, soit **92,8 %** |
| Précision au numéro de voie | 893 |
| Précision à la rue | 55 |
| Débit annoncé | 50 appels par IP et par seconde |

La réponse fournit `longitude`, `latitude`, `result_score` et `result_citycode`. Ce dernier permet de remplir le code commune des 20 937 lignes de dentistes qui en sont dépourvues.

Extrapolation : environ 59 000 lignes d'adresses, soit 59 lots, soit une dizaine de minutes d'appels.

**Point d'attention.** Le critère de sortie de l'architecture est un taux de géocodage supérieur à 97 %. La mesure donne 92,8 %. L'écart vient en partie de la normalisation de l'adresse, qui était volontairement grossière dans ce test, une simple concaténation. Trois leviers pour combler l'écart, à appliquer dans cet ordre : utiliser l'indice de répétition de voie et le libellé de type de voie plutôt qu'une concaténation brute, réessayer les échecs sans le numéro de voie, et pour le reliquat retomber sur le centroïde de la commune avec un marquage explicite `position_approximative`. Une fiche placée au centre de sa commune reste utilisable pour une liste par commune, pas pour une recherche par distance fine.

### 1.4 Prothésistes dentaires : la source n'existe pas telle qu'imaginée

L'architecture prévoyait l'API Sirene filtrée sur le code NAF 32.50A. Vérification faite, ça ne suffit pas.

- Les prothésistes dentaires **ne figurent pas dans l'Annuaire Santé**. Le fichier ANS contient « Assistant dentaire », « Orthoprothésiste » et « Orthopédiste-Orthésiste », mais aucune profession « prothésiste dentaire ». Ce n'est pas une profession de santé au sens du RPPS, il n'y a donc aucun registre nominatif à interroger.
- Le code NAF 32.50A, « Fabrication de matériel médico-chirurgical et dentaire », est bien trop large. L'API publique de recherche d'entreprises renvoie plus de 10 000 résultats pour ce seul code, dont des groupes sans rapport avec la prothèse dentaire, par exemple une entreprise de 78 établissements qui relève de l'optique.
- Restreindre par le nom donne 420 résultats pour « prothèse dentaire » et 613 pour « laboratoire dentaire », ensembles partiellement disjoints et très en dessous de la réalité du secteur.

Il n'existe donc pas de filtre purement registre qui isole les laboratoires de prothèse. Toute sélection sera une heuristique, ce qui heurte la règle « rien de déclaratif, tout est sourcé ». Voir la section 6, décision ouverte n° 1.

Source de masse disponible si on retient cette voie : le fichier `StockEtablissement` de la base Sirene, 2,21 Go au format Parquet, mis à jour le 1er septembre 2026. Le format Parquet permet de ne lire que les colonnes utiles et de filtrer sur le code NAF sans décompresser l'ensemble, contrairement au CSV compressé de 2,87 Go.

## 2. Décision révisée : GitHub Actions remplace n8n

L'architecture désignait n8n sur le VPS OVH. Après discussion avec Pierre le 11 septembre 2026, les jobs deviennent des scripts TypeScript versionnés dans le dépôt, déclenchés par GitHub Actions.

Motifs :

- **Le volume.** Le fichier ANS pèse 781 Mo pour 2,3 millions de lignes. n8n matérialise les items en mémoire entre les nœuds, ce n'est pas fait pour un parcours en flux de cette taille.
- **La revue.** Les invariants métier du projet, un praticien radié passe en `deleted_at` et sa page bascule en 410, le slug n'est jamais recalculé, un run au delà de 5 % de suppressions est bloqué, protègent des dizaines de milliers de pages et leur référencement. Ils doivent être relus en pull request et couverts par des tests, pas vivre en JSON dans une base applicative.
- **Les types.** Les jobs écrivent dans les mêmes tables que l'application. Un script du dépôt importe `src/db/schema.ts` : un changement de colonne casse le typecheck immédiatement. Un nœud SQL dans n8n casserait silencieusement.
- **L'infrastructure.** Le VPS cesse d'être une dépendance du cœur de la donnée.

Ce que GitHub Actions apporte ici : gratuité sur dépôt public, six heures de durée maximale par job, secrets pour la connexion Neon, journaux conservés, relance manuelle par `workflow_dispatch`, et le même pipeline de qualité que le reste du code.

Ce que n8n conserve : l'alerte. Quand un run dépasse le seuil de suppressions ou échoue, c'est n8n qui prévient, par webhook sortant depuis le workflow GitHub.

Limite assumée : les runners GitHub sont aux États-Unis alors que Neon est à Francfort. Pour des jobs hebdomadaires écrivant par lots, la latence est sans effet notable. Si elle devenait gênante à l'usage, le repli est le VPS OVH avec un timer systemd, les scripts étant les mêmes.

## 3. Ce qu'il faut ajouter au schéma

Le socle de la phase 0 pose `regions`, `departements`, `communes`, `praticiens`, `lieux_exercice`. La phase 1 ajoute les tables de traçabilité prévues par l'architecture, plus une table de redirections.

| Table | Rôle | Colonnes |
|---|---|---|
| `sync_runs` | une ligne par exécution de job | id, registre, demarre_le, termine_le, lignes_lues, inserees, modifiees, supprimees, erreurs (jsonb), statut |
| `verifications` | trace de vérification par praticien et par registre | id, praticien_id, registre, statut, verifie_le, payload_hash |
| `source_snapshots` | empreinte du fichier source d'un run | id, registre, url, publie_le, taille_octets, sha256, telecharge_le |
| `redirections` | 301 quand un praticien change de commune | id, ancien_chemin, nouveau_chemin, cree_le |

Deux colonnes à ajouter à `lieux_exercice` : `position_approximative` (booléen, vrai quand la position vient du centroïde de commune) et `score_geocodage` (réel), pour que la carte et le tri par distance puissent écarter ou signaler les positions imprécises.

`source_snapshots` n'était pas au plan initial. Elle sert à deux choses : ne pas relancer un import si le fichier publié n'a pas changé, et pouvoir rejouer exactement un run passé en cas de doute sur une suppression.

## 4. Les jobs

Chaque job est un script sous `scripts/sync/`, lancé par `tsx`, écrivant une ligne `sync_runs` en début et en fin d'exécution.

### 4.1 `sync-geo`

Annuel, et une première fois maintenant. Lit `geo.api.gouv.fr`, remplit `regions`, `departements`, `communes`. Le slug de commune est unique par département, conformément à la contrainte déjà posée en phase 0. Les fusions de communes produisent des lignes `redirections`.

### 4.2 `sync-ans`

Hebdomadaire, nuit de dimanche.

1. Lire les métadonnées de la ressource sur l'API data.gouv, comparer l'empreinte à `source_snapshots`. Si identique, arrêter le run et l'inscrire comme « inchangé ».
2. Télécharger le fichier, calculer son SHA256, enregistrer le snapshot.
3. Parcourir en flux, ligne par ligne, ne retenir que le code profession 40. Ne jamais charger le fichier en mémoire.
4. Regrouper par identification nationale PP, produire un praticien et un à six lieux d'exercice.
5. Générer le slug **uniquement à la première insertion**, jamais à la mise à jour.
6. Marquer `deleted_at` sur les praticiens absents du fichier.
7. **Garde-fou** : si les suppressions dépassent 5 % de l'effectif, écrire le run en statut `bloque`, ne rien appliquer, alerter.

### 4.3 `geocode-ban`

Après chaque `sync-ans`, sur les lieux dépourvus de position. Lots de 1 000 lignes vers `POST /search/csv/`. Trois passes : adresse complète, puis adresse sans numéro pour les échecs, puis centroïde de commune avec `position_approximative` à vrai. Écrit `score_geocodage`. Les scores inférieurs à 0,6 sont traités comme des échecs et passent à la stratégie suivante.

### 4.4 `sync-sirene`

Suspendu tant que la décision ouverte n° 1 n'est pas tranchée.

### 4.5 Revalidation

En fin de chaque run, `POST /api/revalidate` avec le tag `annuaire` et un tag `commune:{code}` par commune touchée. Le endpoint accepte au maximum 100 tags par appel, il faudra donc découper. Tant que dentalmap.fr n'est pas sur Vercel, l'appel doit porter l'en-tête `x-vercel-protection-bypass`, comme le mu-plugin WordPress.

## 5. Séquence proposée

| Étape | Contenu | Contrôle |
|---|---|---|
| 1 | Migration Drizzle des quatre nouvelles tables et des deux colonnes | `drizzle-kit migrate` passe, `pnpm check` vert |
| 2 | `sync-geo`, exécuté sur une branche Neon dédiée | 34 969 communes, 101 départements, 18 régions, aucun slug en doublon par département |
| 3 | `sync-ans` en mode simulation, sans écriture | le compte de praticiens et de lieux correspond aux chiffres de la section 1.1 |
| 4 | `sync-ans` réel sur la branche dédiée | 64 398 praticiens, aucun doublon RPPS |
| 5 | `geocode-ban`, les trois passes | taux de position renseignée mesuré, à confronter au seuil de 97 % |
| 6 | Tests des invariants | slug stable après renommage, radiation qui pose `deleted_at`, run bloqué au delà de 5 % |
| 7 | Workflows GitHub Actions planifiés et relançables à la main | un run manuel complet réussit de bout en bout |
| 8 | Promotion sur la branche Neon principale | les chiffres de la branche dédiée sont reproduits |

## 6. Décisions ouvertes

Ces trois points demandent un arbitrage avant de démarrer.

**1. Les prothésistes.** Aucun registre ne les isole. Trois voies : renoncer aux prothésistes en v1 et livrer un annuaire de dentistes, ce qui est net mais réduit le périmètre ; construire la sélection sur le NAF 32.50A plus des règles de nom, en stockant la règle qui a fait entrer chaque établissement pour rester auditable ; ou constituer une base initiale vérifiée à la main, plus petite mais entièrement sourcée, enrichie ensuite par revendication. La deuxième voie est la seule qui donne du volume tout de suite, au prix d'une entorse assumée à la règle « tout est sourcé », qu'il faudra expliquer sur la page « Méthode de vérification ».

**2. Les 15 243 dentistes sans adresse.** Un quart de l'effectif. Les publier sans lieu donnerait des pages sans intérêt et sans position sur la carte, et diluerait la qualité perçue de l'annuaire. Les exclure ramène le périmètre à 49 155 fiches, ce qui reste cohérent avec l'ordre de grandeur annoncé dans l'architecture. Une troisième voie consiste à les garder en base mais hors sitemap et en `noindex`, accessibles seulement par recherche nominative, et à les faire remonter par revendication.

**3. Le seuil de géocodage.** L'architecture fixe 97 %. La mesure brute donne 92,8 %. Soit on considère qu'une position au centroïde de commune compte comme géocodée, et le seuil devient atteignable, soit on maintient un seuil sur les seules positions précises et il faut le redescendre à une valeur tenable, autour de 93 %.

## 7. Ce que la phase 1 ne fait pas

Pas de front, pas de carte, pas d'espace pro. La phase 2 s'en charge. La phase 1 s'arrête quand la base contient des données justes, tracées et reproductibles.
