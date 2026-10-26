# 03 · Gamification : force de fiche, paliers, distinctions, fraîcheur

Maquettes : page Figma « Espace pro », section « 11 · Gamification, mécanique détaillée », et écrans I, J, O.

## Principe

Chaque point correspond à une information utile au patient (ou au cabinet pour un laboratoire). La force de fiche **n'influence jamais l'ordre des résultats**. Elle est calculée à la volée par une fonction pure, jamais stockée en colonne.

```ts
// src/lib/espace-pro/force.ts
export type Profil = 'sante' | 'labo' | 'etablissement'
export type ForceDetail = { total: number; items: { cle: string; points: number; max: number; aReconfirmer?: boolean }[] }
export function calculerForce(profil: Profil, fiche: FicheAgregee, maintenant = new Date()): ForceDetail
```

## Barème (100 points par profil)

| Chirurgien-dentiste | Pts | Condition |
|---|---|---|
| Identité vérifiée | 30 | Revendication validée (PSC, email registre ou justificatif vérifié automatiquement) |
| Horaires | 20 | 7 jours renseignés, fermetures comprises. 10 pts si à reconfirmer, 0 si non confirmés depuis 180 j |
| Photo de profil | 8 | Une photo valide |
| Présentation | 8 | 200 à 800 caractères **et** aucun terme refusé |
| Domaines de soins | 4 | Au moins 2 (arbitré le 23 octobre 2026) |
| Galerie du cabinet | 6 | 3 photos au moins, 8 au plus |
| Marques utilisées | 4 | Au moins une, liste fermée par famille |
| Secteur et tiers payant | 10 | 5 + 5 |
| Langues | 5 | Au moins une réponse (y compris « français seul ») |
| Accessibilité PMR | 5 | Oui, non ou partiel : la réponse compte, pas le oui |

| Laboratoire | Pts | | Établissement | Pts |
|---|---|---|---|---|
| Identité vérifiée | 30 | | Identité vérifiée | 30 |
| Savoir-faire (3 techniques min.) | 15 | | Formations | 25 |
| Matériaux et CFAO | 10 | | Conditions d'accès | 15 |
| Délais par type de pièce | 10 | | Alternance | 10 |
| Zone desservie | 10 | | Portes ouvertes (date future ou « aucune ») | 10 |
| Photos de réalisations | 10 | | Photo | 10 |
| Déclaration ANSM | 10 | | | |
| Présentation | 5 | | | |

## Paliers

| Palier | Points | Déclenche |
|---|---|---|
| Débutant | 0 à 39 | Bienvenue, 3 missions |
| Intermédiaire | 40 à 69 | Toast léger, distinction « Horaires complets » si applicable |
| Avancé | 70 à 89 | Toast léger, prochaine action recommandée |
| Exemplaire | 90 à 100 | Célébration plein écran (écran J), distinction « Fiche exemplaire » |

Célébrations : `prefers-reduced-motion` coupe les confettis animés.

## Prochaine action recommandée

Élément non rempli au plus fort gain, à égalité le plus rapide ; sinon l'élément à reconfirmer le plus proche de l'échéance. Affichée avec gain (« +12 % ») et durée estimée.

## Gains réels à afficher (et seulement ceux-là)

| Donnée | Gain |
|---|---|
| Horaires | Présence dans le filtre « Ouvert maintenant », mention « Ouvert jusqu'à 19h » |
| Secteur, tiers payant | Filtres « Secteur 1 » et « Tiers payant » |
| Langues, PMR, enfants | Filtres correspondants |
| Photo, horaires, accessibilité | Données structurées schema.org `Dentist` plus riches (`openingHoursSpecification`, `image`, `isAccessibleForFree` non, `amenityFeature`) |

Texte à répéter dans l'interface : « Votre place dans la liste reste la même : distance, puis ordre alphabétique. »

## Fraîcheur

| Élément | Rappel | À reconfirmer | Expiré |
|---|---|---|---|
| Horaires | J+75 | J+90 : 20 pts → 10 | J+180 : 0 pt, mention publique « non confirmés depuis 6 mois », exclusion du filtre « Ouvert maintenant » |
| Délais laboratoire | 5 mois | 6 mois | 12 mois |
| Photo | | 2 ans | |
| Présentation, langues, PMR | | 1 an | |
| Portes ouvertes | | expire à la date passée | |

Toute modification remet le compteur à zéro. Reconfirmer = un tap, sans ressaisie.

## Distinctions (privées, jamais affichées aux patients)

| Code | Titre | Condition | Profils |
|---|---|---|---|
| `fiche_verifiee` | Fiche vérifiée | Revendication validée | tous |
| `identifie_psc` | Identifié PSC | Validée via Pro Santé Connect | santé |
| `horaires_complets` | Horaires complets | 7 jours renseignés | santé |
| `bilingue` | Bilingue | Une langue en plus du français | santé |
| `cabinet_accessible` | Cabinet accessible | PMR renseigné | santé |
| `multi_lieux` | Multi-lieux | Tous les lieux du registre complétés | santé |
| `toujours_a_jour` | Toujours à jour | 3 reconfirmations trimestrielles consécutives | tous |
| `fiche_exemplaire` | Fiche exemplaire | 90 points ou plus | tous |
| `premiere_annee` | Première année | 1 an après revendication | tous |
| `zero_ecart` | Zéro écart | Aucun signalement patient ouvert depuis 6 mois | tous |
| `labo_verifie` | Labo vérifié | Kbis ou code validé | labo |
| `savoir_faire` | Savoir-faire | 3 techniques et matériaux | labo |
| `declare_ansm` | Déclaré ANSM | Case cochée | labo |
| `delais_a_jour` | Délais à jour | Délais confirmés < 6 mois | labo |
| `etablissement_verifie` | Établissement vérifié | Domaine ou attestation | établissement |
| `calendrier_a_jour` | Calendrier à jour | Portes ouvertes à venir | établissement |

Stockées (table `distinctions`) car horodatées. Ce n'est pas un score : aucune incidence sur l'affichage public.

## Notifications

| Déclencheur | Canal | Plafond |
|---|---|---|
| Revendication validée | Email + espace pro | une fois |
| Force < 40 à J+7 | Email | une fois |
| Palier franchi | In-app | à chaque palier |
| Fraîcheur J+75 | Email + notification | une fois par élément et par trimestre |
| Changement dans le registre | Email | à chaque changement |
| Signalement patient | Email groupé | une fois par jour |
| Jour férié à venir | Notification | désactivé par défaut |

Plafond global : un email non transactionnel par semaine, jamais entre 20h et 8h ni le week-end. Désinscription par catégorie.

## Garde-fous

- Présentation : liste de termes refusés (`meilleur`, `n°1`, `numéro 1`, `garanti`, `sans douleur`, `prix`, `tarif`, `€`, `promo`, `offert`…). Texte publié mais 0 point tant qu'un terme est présent. Contrôle en direct dans l'éditeur, aucune réécriture automatique.
- Photos : aucun patient identifiable, EXIF supprimé, signalement possible, retrait sous 24 h.
- Aucun classement entre praticiens, aucune comparaison, score jamais exposé publiquement ni via API publique.
- Pas de mécanique punitive hors fraîcheur (pas de série perdue, pas de compte à rebours).
- Barème publié sur la page « Méthode de vérification et classement ».
