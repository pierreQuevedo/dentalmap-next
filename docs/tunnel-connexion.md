# Tunnel de connexion et d'inscription

Socle posé le 29 septembre 2026, sans interface : la logique, les données, les
actions et les routes sont en place, chaque écran reste à dessiner.

## Le parcours

| Étape | Chemin | Qui | Ce qui s'y passe |
|---|---|---|---|
| 1 | `/connexion/` | tous | adresse et mot de passe, à la classique ; liens vers l'inscription et le mot de passe oublié |
| 2a | `/connexion/` | mot de passe oublié | un code à six chiffres reçu par courriel, puis le nouveau mot de passe |
| 2b et 3 | `/connexion/` | inscription | rôle (patient, dentiste, prothésiste, médecin), nom, adresse et mot de passe, enregistrés avec le compte ; puis le code reçu confirme l'adresse et ouvre la session. `/inscription/profil/` ne sert plus qu'à un compte créé sans rôle |
| 4 | `/inscription/profil/` | tous | relit le compte et `prochaineEtape()` décide |
| 5 | `/espace-pro/fiche/choisir/` | professionnel | recherche de sa fiche par nom, RPPS ou SIRET |
| 5 bis | `/espace-pro/fiche/creer/` | professionnel | fiche absente : demande de création, table `demandes_creation_fiche` |
| 6 | `/espace-pro/revendiquer/?fiche=` | professionnel | preuve de qualité : Pro Santé Connect ou demande manuelle |
| attente | `/espace-pro/attente/` | professionnel | demandes en cours, accès au parcours d'accueil |
| 7 | `/espace-pro/onboarding/?fiche=` | professionnel | horaires, langues, accessibilité, paiement |
| 8 | `/espace-pro/` | professionnel | tableau de bord, redirige vers l'étape manquante |
| patient | `/favoris/` | patient | fiches mises de côté, action `basculerFavori` |
| modération | `/espace-pro/moderation/` | adresses de `MODERATEURS` | accepter ou refuser, clore une demande de création |

La logique pure vit dans `src/lib/tunnel/etapes.ts` (`etapeDe`,
`prochaineEtape`, `etapeAutorisee`, testée dans `tests/tunnel.test.ts`). Les
pages appellent `exigerEtape()` de `src/lib/tunnel/compte.ts`, qui redirige
vers la connexion sans session et vers la bonne étape sinon.

## Données

- `user.role` (`patient`, `dentiste`, `prothesiste`, ou nul) et
  `user.etape_tunnel` : champs Better Auth (`user.additionalFields`), écrits
  par `auth.api.updateUser`.
- `favoris` (compte, fiche), unique par couple.
- `demandes_creation_fiche` : la fiche décrite par le professionnel, statut
  `en_attente`, `acceptee`, `refusee`, rattachée à `praticien_id` une fois créée.
- Migration `0010_modern_mongoose.sql`, appliquée à la base de développement.

## Emails (`src/lib/email.ts`)

`envoyerCode` (code à six chiffres : inscription, connexion, mot de passe oublié),
`envoyerBienvenue` (hook Better Auth à la création du compte),
`envoyerRevendicationRecue`, `envoyerRevendicationAcceptee`,
`envoyerRevendicationRefusee`, `envoyerFichePubliee`, `envoyerAModerer`. Sans
`RESEND_API_KEY`, ils s'affichent dans la console du serveur.

## Règles

- Adresse et mot de passe, douze caractères au moins. L'adresse est confirmée par un code à six chiffres (plugin `emailOTP` de Better Auth, `envoyerCode` dans `email.ts`), valable dix minutes, cinq essais. Pro Santé Connect est annoncé en encart sur la page de connexion, pas encore ouvert.
- Une revendication en attente ouvre le parcours d'accueil ; la publication
  attend l'acceptation.
- `retour` n'accepte qu'un chemin interne (`retourSur`).
- `MODERATEURS` : adresses des modérateurs, séparées par des virgules, dans
  `.env.local` et sur Vercel.

## À faire quand l'interface arrive

La page `/connexion/` est faite (écran partagé, états connexion, inscription,
mot de passe oublié, confirmation de l'adresse). Les autres pages du
tunnel restent des squelettes : mêmes champs, mêmes actions, à habiller.
