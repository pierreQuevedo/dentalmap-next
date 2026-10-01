# Pro Santé Connect : revendication d'une fiche par carte CPS

Un chirurgien-dentiste peut revendiquer sa fiche sans aucun document : il s'authentifie auprès de Pro Santé Connect, le fournisseur d'identité de l'Agence du Numérique en Santé, avec sa carte CPS ou l'application e-CPS. Pro Santé Connect nous renvoie son numéro RPPS certifié, que l'on compare à celui de la fiche. S'ils sont identiques, la revendication est acceptée immédiatement et le praticien entre dans le parcours d'accueil.

Les laboratoires de prothèse ne sont pas au RPPS : ils gardent la demande manuelle.

## Parcours

1. Sur sa fiche publique, le praticien clique sur « Revendiquer cette fiche ». Une fenêtre lui propose Pro Santé Connect, ou la vérification manuelle.
2. `/api/psc/connexion/?fiche={slug}` exige une session DentalMap. Sans session, il passe par `/connexion/` avec retour sur lui-même : le lien reçu par courriel reprend la démarche là où elle en était.
3. La route pose un cookie signé (`dm_psc`, dix minutes) portant `state`, `nonce`, vérificateur PKCE, slug et identifiant du compte, puis redirige vers Pro Santé Connect avec `scope=openid scope_all` et `acr_values=eidas1`.
4. `/api/psc/retour/` vérifie l'état, échange le code, vérifie le jeton d'identité contre les clés publiées, lit le UserInfo, puis exige : un code profession `40` (chirurgien-dentiste) et un RPPS égal à celui de la fiche.
5. Succès : ligne `revendications` en `acceptee`, méthode `pro_sante_connect`, puis redirection vers `/espace-pro/onboarding/?fiche={slug}&bienvenue=1`.
6. Échec : retour sur `/espace-pro/revendiquer/?fiche={slug}&psc={code}`, qui explique et propose la demande manuelle. Codes : `annule`, `etat`, `session`, `technique`, `profession`, `rpps`, `fiche`, `indisponible`.

Le parcours d'accueil enregistre chaque étape par Server Action (`enregistrerEtape`), revérifie la revendication à chaque appel, et invalide `praticien:{slug}` pour que la fiche publique reflète la saisie aussitôt.

## Tester sans l'ANS : le simulateur

Tant que le bac à sable n'est pas ouvert, `PSC_SIMULATEUR=1` dans `.env.local` active un simulateur servi par l'application elle-même sous `/api/psc-simulateur/`. Il expose les mêmes points de terminaison qu'un fournisseur OpenID Connect (autorisation, jetons, UserInfo, clés) et le code de production lui parle sans savoir que ce n'est pas l'ANS : PKCE, nonce, signature RS256 du jeton d'identité et forme du UserInfo sont ceux de Pro Santé Connect.

À la place de la carte, l'écran du simulateur demande un numéro RPPS et une profession. Le RPPS de la fiche visée est prérempli. Choisir la profession 10 ou taper un autre RPPS permet de vérifier les refus (`profession`, `rpps`), et le bouton Annuler produit `access_denied`.

Le simulateur ne répond jamais quand `VERCEL_ENV` vaut `production`, quelle que soit la variable. Il n'a pas non plus sa place en prévisualisation : ne pas poser `PSC_SIMULATEUR` sur Vercel.

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `PSC_CLIENT_ID`, `PSC_CLIENT_SECRET` | Identifiants remis par l'ANS. Vides, la vérification par carte n'est pas proposée et tout le reste fonctionne. |
| `PSC_ISSUER` | Émetteur. Par défaut le bac à sable `https://wallet.bas.esw.esante.gouv.fr/auth/realms/esante-wallet`. En production : `https://wallet.esw.esante.gouv.fr/auth/realms/esante-wallet`. |
| `PSC_SIMULATEUR` | `1` active le simulateur local décrit ci-dessus. Prend le pas sur les identifiants ANS. |
| `PSC_REDIRECT_URI` | Facultatif. Par défaut `{BETTER_AUTH_URL}/api/psc/retour/`, barre finale comprise à cause de `trailingSlash`. Doit être déclarée à l'ANS au caractère près. |

Le document de découverte est lu sous `.well-known/wallet-openid-configuration`, chemin propre à Pro Santé Connect, avec repli sur le chemin standard.

## Raccordement auprès de l'ANS

Liens utiles :

- Demande d'habilitation, qui ouvre le bac à sable : https://datapass.api.gouv.fr/demandes/api-pro-sante-connect/nouveau (fiche officielle de l'API : https://www.data.gouv.fr/dataservices/api-pro-sante-connect).
- Parcours de raccordement, bac à sable puis production : https://esante.gouv.fr/produits-et-services/pro-sante-connect/parcours-de-raccordement
- Espace authentifié du portail industriels, d'où se gère le service et se demande le passage en production : https://industriels.esante.gouv.fr/
- Documentation technique : https://industriels.esante.gouv.fr/produits-et-services/pro-sante-connect/documentation-technique
- Assistance éditeurs : prosanteconnect.editeurs@esante.gouv.fr


1. Déposer une demande d'accès au bac à sable sur le portail industriels de l'ANS (rubrique Pro Santé Connect), en déclarant l'adresse de retour de développement, par exemple `http://localhost:3000/api/psc/retour/`.
2. Recevoir le couple client et les identités de test. Une e-CPS de test s'active depuis l'espace de test de l'ANS ; le numéro RPPS de l'identité de test doit exister dans la base locale pour que la comparaison réussisse, ce qui se fait en posant ce numéro sur une fiche de développement.
3. Dérouler le flux, puis demander le passage en production : l'ANS vérifie le bon fonctionnement et le respect de son référentiel avant de délivrer les identifiants de production.
4. Poser les variables de production sur Vercel, `PSC_ISSUER` compris.

Sources : documentation technique et référentiel Pro Santé Connect sur `industriels.esante.gouv.fr`.
